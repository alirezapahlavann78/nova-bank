import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIGatewayService } from '../gateway/ai-gateway.service';
import { AgentRegistryService } from '../registry/agent-registry.service';
import { ToolManagerService } from '../tools/tool-manager.service';
import { ConversationMemoryService } from '../memory/conversation-memory.service';
import { AuditLoggerService } from '../logging/audit-logger.service';
import { AIToolCall, AIToolResult, AIToolConfirmationState, AIToolRiskLevel, AIAgentExecutionStatus, AIChatRequest, AIUsageMetadata } from '@nova-bank/types';
import { ToolExecutionResult } from '../tools/interfaces/tool-execution-context.interface';

export interface OrchestratorResult {
  content: string;
  conversationId: string;
  agentInfo: { id: string; name: string; version: string };
  toolExecutions: { toolName: string; success: boolean; data?: any; error?: string }[];
  pendingConfirmations: AIToolCall[];
  usage: AIUsageMetadata;
  isComplete: boolean;
}

export interface ConfirmResult {
  content: string;
  conversationId: string;
  toolExecutions: { toolName: string; success: boolean; data?: any; error?: string }[];
  pendingConfirmations: AIToolCall[];
  usage: AIUsageMetadata;
  isComplete: boolean;
}

@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AIGatewayService,
    private readonly registry: AgentRegistryService,
    private readonly toolManager: ToolManagerService,
    private readonly memory: ConversationMemoryService,
    private readonly auditLogger: AuditLoggerService,
  ) {}

  async chat(request: AIChatRequest, userId: string): Promise<OrchestratorResult> {
    const requestId = crypto.randomUUID();

    const agent = request.agentId
      ? this.registry.getAgent(request.agentId)
      : this.registry.getDefaultAgent();

    if (!agent) {
      throw new NotFoundException('No AI agent available');
    }

    if (!agent.isEnabled) {
      throw new BadRequestException(`Agent '${agent.id}' is not enabled`);
    }

    const conversation = await this.memory.getOrCreateConversation(userId, agent.id, request.conversationId);

    await this.memory.saveMessage(conversation.id, {
      role: 'user',
      content: request.message,
    });

    const toolDefinitions = this.toolManager.getAllowedTools(agent.allowedTools);

    const execution = await this.prisma.aIAgentExecution.create({
      data: {
        conversationId: conversation.id,
        agentId: agent.id,
        model: agent.modelConfig.model,
        status: 'RUNNING',
      },
    });

    this.logger.log(`Execution ${execution.id}: user=${userId} conversation=${conversation.id} agent=${agent.id}`);

    await this.auditLogger.logExecutionStart({
      requestId,
      userId,
      agentId: agent.id,
      model: agent.modelConfig.model,
    });

    const result = await this.runAgentLoop(execution.id, conversation.id, agent, userId, requestId, toolDefinitions);

    await this.prisma.aIAgentExecution.update({
      where: { id: execution.id },
      data: {
        status: result.isComplete ? 'COMPLETED' : 'COMPLETED',
        endedAt: new Date(),
        inputTokens: result.usage.promptTokens,
        outputTokens: result.usage.completionTokens,
      },
    });

    await this.auditLogger.logExecutionEnd({
      requestId,
      userId,
      agentId: agent.id,
      model: agent.modelConfig.model,
      durationMs: result.executionDurationMs || 0,
      success: true,
      toolCalls: result.toolExecutions,
      toolResults: result.toolExecutions,
      confirmationState: result.isComplete ? 'confirmed' : 'pending',
    });

    return {
      content: result.content,
      conversationId: conversation.id,
      agentInfo: { id: agent.id, name: agent.name, version: agent.version },
      toolExecutions: result.toolExecutions,
      pendingConfirmations: result.pendingConfirmations,
      usage: result.usage,
      isComplete: result.isComplete,
    };
  }

  async confirmTool(
    conversationId: string,
    toolCallId: string,
    userId: string,
    confirmed: boolean,
  ): Promise<ConfirmResult> {
    const requestId = crypto.randomUUID();

    const conversation = await this.prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const agent = this.registry.getAgent(conversation.agentId);
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    if (!confirmed) {
      await this.memory.updateToolConfirmation(toolCallId, 'cancelled');
      return {
        content: 'عملیات لغو شد.',
        conversationId,
        toolExecutions: [],
        pendingConfirmations: [],
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, provider: 'none' },
        isComplete: true,
      };
    }

    await this.memory.updateToolConfirmation(toolCallId, 'confirmed');

    const toolCall = await this.memory.getPendingToolCall(conversation.id, toolCallId);
    if (!toolCall) {
      throw new NotFoundException('Pending tool call not found');
    }

    const tool = this.toolManager.getTool(toolCall.toolName);
    if (!tool) {
      throw new NotFoundException(`Tool '${toolCall.toolName}' not found`);
    }

    const toolResult = await this.executeToolCall(toolCall, tool, userId, requestId);
    await this.memory.saveMessage(conversation.id, {
      role: 'tool',
      content: toolResult.success ? JSON.stringify(toolResult.data) : '',
      toolCallId: toolCall.id,
    });

    const resumed = await this.resumeAgentLoop(
      conversation.id,
      agent,
      userId,
      requestId,
      this.toolManager.getAllowedTools(agent.allowedTools),
    );

    return {
      content: resumed.content,
      conversationId,
      toolExecutions: [toolResult],
      pendingConfirmations: resumed.pendingConfirmations,
      usage: resumed.usage,
      isComplete: resumed.isComplete,
    };
  }

  private async runAgentLoop(
    executionId: string,
    conversationId: string,
    agent: any,
    userId: string,
    requestId: string,
    toolDefinitions: any[],
  ): Promise<{
    content: string;
    toolExecutions: any[];
    pendingConfirmations: AIToolCall[];
    usage: AIUsageMetadata;
    isComplete: boolean;
    executionDurationMs?: number;
  }> {
    const startTime = Date.now();
    let content = '';
    const toolExecutions: any[] = [];
    const pendingConfirmations: AIToolCall[] = [];
    let usage: AIUsageMetadata = { promptTokens: 0, completionTokens: 0, totalTokens: 0, provider: 'mock' };
    let isComplete = false;

    for (let turn = 0; turn < 50; turn++) {
      const messages = await this.memory.getMessagesForProvider(conversationId, agent.systemInstructions.basePrompt);

      const gatewayResponse = await this.gateway.getAdapter().chat({
        model: agent.modelConfig.model,
        messages,
        tools: toolDefinitions.map((t) => ({
          type: 'function' as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        })),
        temperature: agent.modelConfig.temperature,
        maxTokens: agent.modelConfig.maxTokens,
        requestId,
      });

      usage = this.aggregateUsage(usage, gatewayResponse.usage);

      await this.memory.saveMessage(conversationId, {
        role: 'assistant',
        content: gatewayResponse.content,
        toolCalls: gatewayResponse.toolCalls.length > 0 ? gatewayResponse.toolCalls : undefined,
      });

      content += gatewayResponse.content;

      if (gatewayResponse.toolCalls.length === 0) {
        isComplete = true;
        break;
      }

      let hasPending = false;

      for (const toolCall of gatewayResponse.toolCalls) {
        const tool = this.toolManager.getTool(toolCall.toolName);
        if (!tool) {
          toolExecutions.push({
            toolName: toolCall.toolName,
            success: false,
            error: `Tool not found`,
          });
          continue;
        }

        if (tool.confirmationRequired) {
          hasPending = true;
          toolCall.confirmationState = 'pending';
          pendingConfirmations.push(toolCall);
          await this.memory.saveToolCall(conversationId, toolCall.id, {
            toolName: toolCall.toolName,
            args: toolCall.arguments,
            confirmationState: 'pending',
          });
          await this.prisma.aIToolExecution.create({
            data: {
              executionId,
              toolName: toolCall.toolName,
              riskLevel: tool.riskLevel as any,
              status: 'PENDING',
              input: toolCall.arguments as any,
              confirmationState: 'PENDING_CONFIRMATION',
            },
          });
          continue;
        }

        const result = await this.executeToolCall(toolCall, tool, userId, requestId);
        toolExecutions.push({
          toolName: toolCall.toolName,
          success: result.success,
          data: result.data,
          error: result.error,
        });

        await this.memory.saveMessage(conversationId, {
          role: 'tool',
          content: result.success ? JSON.stringify(result.data) : result.error || '',
          toolCallId: toolCall.id,
        });
      }

      if (hasPending) {
        break;
      }
    }

    if (!isComplete) {
      this.logger.log(`Execution ${executionId}: paused for confirmation`);
    }

    return {
      content,
      toolExecutions,
      pendingConfirmations,
      usage,
      isComplete,
      executionDurationMs: Date.now() - startTime,
    };
  }

  private async resumeAgentLoop(
    conversationId: string,
    agent: any,
    userId: string,
    requestId: string,
    toolDefinitions: any[],
  ): Promise<{
    content: string;
    pendingConfirmations: AIToolCall[];
    usage: AIUsageMetadata;
    isComplete: boolean;
  }> {
    let content = '';
    const pendingConfirmations: AIToolCall[] = [];
    let usage: AIUsageMetadata = { promptTokens: 0, completionTokens: 0, totalTokens: 0, provider: 'mock' };
    let isComplete = false;

    for (let turn = 0; turn < 50; turn++) {
      const messages = await this.memory.getMessagesForProvider(conversationId, agent.systemInstructions.basePrompt);

      const gatewayResponse = await this.gateway.getAdapter().chat({
        model: agent.modelConfig.model,
        messages,
        tools: toolDefinitions.map((t) => ({
          type: 'function' as const,
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        })),
        temperature: agent.modelConfig.temperature,
        maxTokens: agent.modelConfig.maxTokens,
        requestId,
      });

      usage = this.aggregateUsage(usage, gatewayResponse.usage);

      await this.memory.saveMessage(conversationId, {
        role: 'assistant',
        content: gatewayResponse.content,
        toolCalls: gatewayResponse.toolCalls.length > 0 ? gatewayResponse.toolCalls : undefined,
      });

      content += gatewayResponse.content;

      if (gatewayResponse.toolCalls.length === 0) {
        isComplete = true;
        break;
      }

      let hasPending = false;

      for (const toolCall of gatewayResponse.toolCalls) {
        const tool = this.toolManager.getTool(toolCall.toolName);
        if (!tool) continue;

        if (tool.confirmationRequired) {
          hasPending = true;
          toolCall.confirmationState = 'pending';
          pendingConfirmations.push(toolCall);
          continue;
        }

        const result = await this.executeToolCall(toolCall, tool, userId, requestId);

        await this.memory.saveMessage(conversationId, {
          role: 'tool',
          content: result.success ? JSON.stringify(result.data) : result.error || '',
          toolCallId: toolCall.id,
        });
      }

      if (hasPending) {
        break;
      }
    }

    return { content, pendingConfirmations, usage, isComplete };
  }

  private async executeToolCall(
    toolCall: { id: string; toolName: string; arguments: Record<string, any>; confirmationState?: string },
    tool: any,
    userId: string,
    requestId: string,
  ): Promise<AIToolResult> {
    const startTime = Date.now();
    const result: ToolExecutionResult = await this.toolManager.executeTool(
      toolCall.toolName,
      toolCall.arguments,
      userId,
      requestId,
    );
    const durationMs = Date.now() - startTime;

    return {
      toolCallId: toolCall.id,
      toolName: toolCall.toolName,
      success: !result.error,
      data: result.data,
      error: result.error,
      confirmationState: (toolCall.confirmationState as AIToolConfirmationState) || 'confirmed',
    };
  }

  private aggregateUsage(existing: AIUsageMetadata, newUsage: AIUsageMetadata): AIUsageMetadata {
    return {
      promptTokens: existing.promptTokens + newUsage.promptTokens,
      completionTokens: existing.completionTokens + newUsage.completionTokens,
      totalTokens: existing.totalTokens + newUsage.totalTokens,
      provider: newUsage.provider || existing.provider,
    };
  }
}
