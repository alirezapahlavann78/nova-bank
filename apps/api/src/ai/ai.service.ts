import { Injectable, NotFoundException } from '@nestjs/common';
import { AgentOrchestratorService } from './orchestrator/agent-orchestrator.service';
import { ConversationMemoryService } from './memory/conversation-memory.service';
import { AIGatewayService } from './gateway/ai-gateway.service';
import { AgentRegistryService } from './registry/agent-registry.service';
import { AIChatRequest, AIChatResponse, AIToolCall, AIToolExecutionSummary } from '@nova-bank/types';

@Injectable()
export class AiService {
  constructor(
    private readonly orchestrator: AgentOrchestratorService,
    private readonly memory: ConversationMemoryService,
    private readonly gateway: AIGatewayService,
    private readonly registry: AgentRegistryService,
  ) {}

  async chat(request: AIChatRequest, userId: string): Promise<AIChatResponse> {
    const result = await this.orchestrator.chat(request, userId);

    const pendingConfirmations = result.pendingConfirmations.map((tc: AIToolCall) => ({
      id: tc.id,
      toolName: tc.toolName,
      arguments: tc.arguments,
      message: this.buildConfirmationMessage(tc),
    }));

    const toolExecutions: AIToolExecutionSummary[] = result.toolExecutions.map((te) => ({
      toolName: te.toolName,
      success: te.success,
      data: te.data,
      error: te.error,
    }));

    return {
      content: result.content,
      conversationId: result.conversationId,
      agent: result.agentInfo,
      toolExecutions,
      pendingConfirmations,
      usage: result.usage,
      isComplete: result.isComplete,
    };
  }

  async confirmTool(
    conversationId: string,
    toolCallId: string,
    userId: string,
    confirmed: boolean,
  ): Promise<AIChatResponse> {
    const result = await this.orchestrator.confirmTool(conversationId, toolCallId, userId, confirmed);

    const pendingConfirmations = result.pendingConfirmations.map((tc: AIToolCall) => ({
      id: tc.id,
      toolName: tc.toolName,
      arguments: tc.arguments,
      message: this.buildConfirmationMessage(tc),
    }));

    const toolExecutions: AIToolExecutionSummary[] = result.toolExecutions.map((te) => ({
      toolName: te.toolName,
      success: te.success,
      data: te.data,
      error: te.error,
    }));

    return {
      content: result.content,
      conversationId: result.conversationId,
      agent: { id: '', name: '', version: '' },
      toolExecutions,
      pendingConfirmations,
      usage: result.usage,
      isComplete: result.isComplete,
    };
  }

  async getConversations(userId: string): Promise<any[]> {
    return this.memory.getConversationHistory(userId);
  }

  async getConversation(conversationId: string, userId: string): Promise<any> {
    return this.memory.getConversationDetail(userId, conversationId);
  }

  async getAvailableAgents(): Promise<any[]> {
    return this.registry.getEnabledAgents();
  }

  async getGatewayHealth(): Promise<{ provider: string; model: string; available: boolean }> {
    return this.gateway.healthCheck();
  }

  private buildConfirmationMessage(toolCall: AIToolCall): string {
    if (toolCall.toolName === 'createTransfer') {
      const { amount, sourceAccountId, destinationAccountId } = toolCall.arguments;
      return `می‌خواهید ${amount} تومان از حساب ${sourceAccountId} به حساب ${destinationAccountId} منتقل کنید؟`;
    }
    if (toolCall.toolName === 'createBudget') {
      const { name, amount, period } = toolCall.arguments;
      return `می‌خواهید بودجه "${name}" به مبلغ ${amount} در دوره ${period} ایجاد کنید؟`;
    }
    if (toolCall.toolName === 'createGoal') {
      const { name, targetAmount } = toolCall.arguments;
      return `می‌خواهید هدف "${name}" با هدف ${targetAmount} ایجاد کنید؟`;
    }
    if (toolCall.toolName === 'markNotificationRead') {
      return `می‌خواهید این اعلان را به عنوان خوانده شده علامت بزنید؟`;
    }
    return `می‌خواهید عملیات ${toolCall.toolName} را انجام دهید؟`;
  }
}
