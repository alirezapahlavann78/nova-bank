import { Injectable, Logger } from '@nestjs/common';
import type { ProviderAdapter, GatewayRequest, GatewayResponse, AIGatewayConfig } from '../interfaces/provider-adapter.interface';
import type { AIToolCall, AIUsageMetadata } from '@nova-bank/types';

@Injectable()
export class MockProviderAdapter implements ProviderAdapter {
  private readonly logger = new Logger(MockProviderAdapter.name);
  readonly providerName = 'mock';
  readonly model: string;

  constructor(private readonly config: AIGatewayConfig) {
    this.model = config.defaultModel;
  }

  async chat(request: GatewayRequest): Promise<GatewayResponse> {
    this.logger.debug(`[MockProvider] Received chat request with ${request.messages.length} messages`);

    const lastMessage = request.messages[request.messages.length - 1];
    const userContent = lastMessage?.content || '';

    let content = '';
    const toolCalls: AIToolCall[] = [];

    const lowerContent = userContent.toLowerCase();

    if (lowerContent.includes('موجودی') || lowerContent.includes('balance')) {
      content = '';
      toolCalls.push(this.createToolCall('getAccounts'));
      toolCalls.push(this.createToolCall('getAccountBalance'));
    } else if (lowerContent.includes('خرج') || lowerContent.includes('expense') || lowerContent.includes('هزینه')) {
      toolCalls.push(this.createToolCall('getReports', { reportType: 'overview' }));
    } else if (lowerContent.includes('بودجه') || lowerContent.includes('budget')) {
      toolCalls.push(this.createToolCall('getBudgets'));
    } else if (lowerContent.includes('هدف') || lowerContent.includes('goal')) {
      toolCalls.push(this.createToolCall('getGoals'));
    } else if (lowerContent.includes('تراکنش') || lowerContent.includes('transaction') || lowerContent.includes('تراکنش‌')) {
      toolCalls.push(this.createToolCall('getTransactions'));
    } else if (lowerContent.includes('اعلان') || lowerContent.includes('notification')) {
      toolCalls.push(this.createToolCall('getNotifications'));
    } else if (lowerContent.includes('تحلیل') || lowerContent.includes('analytics') || lowerContent.includes('آمار')) {
      toolCalls.push(this.createToolCall('getReports'));
    } else {
      toolCalls.push(this.createToolCall('getAccounts'));
    }

    const usage: AIUsageMetadata = {
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150,
      provider: this.providerName,
    };

    return {
      content: content || 'سلام! من دستیار مالی هوش مصنوعی نوابانک هستم. چطور می‌توانم کمکتان کنم؟',
      toolCalls,
      usage,
      provider: this.providerName,
      model: this.model,
      requestId: request.requestId,
    };
  }

  private createToolCall(name: string, args: Record<string, any> = {}): AIToolCall {
    return {
      id: `mock-call-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      toolName: name,
      arguments: args,
      confirmationState: 'pending',
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
