import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AIMessageRole, AIToolCall, AIToolConfirmationState } from '@nova-bank/types';

export interface MemoryMessage {
  role: AIMessageRole;
  content?: string;
  toolCalls?: AIToolCall[];
  toolCallId?: string;
}

export interface PendingToolCallRecord {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
  confirmationState: string;
}

@Injectable()
export class ConversationMemoryService {
  private readonly logger = new Logger(ConversationMemoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateConversation(userId: string, agentId: string, conversationId?: string) {
    if (conversationId) {
      const existing = await this.prisma.aIConversation.findFirst({
        where: { id: conversationId, userId },
      });
      if (existing) {
        return existing;
      }
    }

    return this.prisma.aIConversation.create({
      data: {
        userId,
        agentId,
        isActive: true,
      },
    });
  }

  async saveMessage(conversationId: string, message: MemoryMessage): Promise<void> {
    const toolCallsJson = message.toolCalls ? JSON.stringify(message.toolCalls) : undefined;
    const content = message.content || null;

    let toolResultsJson: string | undefined;
    if (message.role === 'tool' && message.toolCallId) {
      toolResultsJson = JSON.stringify({ toolCallId: message.toolCallId, content });
    }

    await this.prisma.aIMessage.create({
      data: {
        conversationId,
        role: message.role as any,
        content,
        toolCalls: toolCallsJson ? JSON.parse(toolCallsJson) : undefined,
        toolResults: toolResultsJson ? JSON.parse(toolResultsJson) : undefined,
      },
    });
  }

  async saveToolCall(conversationId: string, toolCallId: string, data: {
    toolName: string;
    args: Record<string, any>;
    confirmationState: string;
  }): Promise<void> {
    await this.prisma.aIToolExecution.create({
      data: {
        executionId: '',
        toolName: data.toolName,
        riskLevel: 'READ' as any,
        status: 'PENDING' as any,
        input: data.args as any,
        confirmationState: data.confirmationState as any,
      },
    });
  }

  async updateToolConfirmation(toolCallId: string, state: string): Promise<void> {
    await this.prisma.aIToolExecution.updateMany({
      where: { id: toolCallId },
      data: {
        confirmationState: state as any,
        confirmedAt: state === 'confirmed' ? new Date() : undefined,
        status: state === 'confirmed' ? 'COMPLETED' : 'CANCELLED' as any,
      },
    });
  }

  async getPendingToolCall(conversationId: string, toolCallId: string): Promise<PendingToolCallRecord | null> {
    const toolExec = await this.prisma.aIToolExecution.findUnique({
      where: { id: toolCallId },
      select: { id: true, toolName: true, input: true, confirmationState: true },
    });
    if (!toolExec || toolExec.confirmationState !== 'PENDING_CONFIRMATION') {
      return null;
    }
    return {
      id: toolExec.id,
      toolName: toolExec.toolName,
      arguments: toolExec.input as Record<string, any>,
      confirmationState: toolExec.confirmationState,
    };
  }

  async getMessages(conversationId: string): Promise<Array<{ role: string; content?: string; toolCalls?: AIToolCall[]; toolResults?: any }>> {
    const messages = await this.prisma.aIMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    return messages.map((m) => ({
      role: m.role.toLowerCase(),
      content: m.content || undefined,
      toolCalls: (m.toolCalls as unknown as AIToolCall[] | undefined) ?? undefined,
      toolResults: m.toolResults || undefined,
    }));
  }

  async getMessagesForProvider(conversationId: string, systemPrompt: string): Promise<Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content?: string }>> {
    const stored = await this.getMessages(conversationId);

    const messages: Array<{ role: 'system' | 'user' | 'assistant' | 'tool'; content?: string; tool_call_id?: string; name?: string; tool_calls?: any[] }> = [
      { role: 'system', content: systemPrompt },
    ];

    for (const m of stored) {
      if (m.role === 'tool') {
        const toolResult = m.toolResults as any;
        messages.push({
          role: 'tool',
          content: toolResult?.content || '',
          tool_call_id: toolResult?.toolCallId,
        });
      } else if (m.role === 'assistant') {
        const msg: any = {
          role: 'assistant',
          content: m.content,
        };
        if (m.toolCalls && m.toolCalls.length > 0) {
          msg.tool_calls = m.toolCalls.map((tc) => ({
            id: tc.id,
            type: 'function',
            function: {
              name: tc.toolName,
              arguments: JSON.stringify(tc.arguments),
            },
          }));
        }
        messages.push(msg);
      } else {
        messages.push({
          role: m.role as 'user',
          content: m.content,
        });
      }
    }

    return messages;
  }

  async getConversationHistory(userId: string) {
    return this.prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        agentId: true,
        title: true,
        startedAt: true,
        endedAt: true,
        isActive: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async getConversationDetail(userId: string, conversationId: string) {
    const conversation = await this.prisma.aIConversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        executions: {
          orderBy: { startedAt: 'desc' },
          include: {
            toolExecutions: {
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }
}
