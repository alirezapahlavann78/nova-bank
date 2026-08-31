import { Injectable, Logger, RequestTimeoutException, BadGatewayException } from '@nestjs/common';
import type { ProviderAdapter, GatewayRequest, GatewayResponse, AIGatewayConfig } from '../interfaces/provider-adapter.interface';
import type { AIToolCall, AIUsageMetadata } from '@nova-bank/types';

interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
}

interface OpenAIChatRequest {
  model: string;
  messages: OpenAIChatMessage[];
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, any>;
    };
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface OpenAIChatResponse {
  id: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class HttpProviderAdapter implements ProviderAdapter {
  private readonly logger = new Logger(HttpProviderAdapter.name);
  readonly providerName: string;
  readonly model: string;

  constructor(private readonly config: AIGatewayConfig) {
    this.providerName = config.provider;
    this.model = config.defaultModel;
  }

  async chat(request: GatewayRequest): Promise<GatewayResponse> {
    const maxRetries = this.config.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.makeRequest(request);
        return this.normalizeResponse(response, request.requestId);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Provider request attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
        if (attempt < maxRetries) {
          await this.sleep(Math.pow(2, attempt) * 1000);
        }
      }
    }

    this.logger.error(`All ${maxRetries} attempts failed. Last error: ${lastError?.message}`);
    throw new BadGatewayException(`AI provider request failed after ${maxRetries} attempts: ${lastError?.message}`);
  }

  private async makeRequest(request: GatewayRequest): Promise<OpenAIChatResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    const apiUrl = this.getApiUrl();

    const openaiRequest: OpenAIChatRequest = {
      model: request.model,
      messages: request.messages as OpenAIChatMessage[],
      tools: request.tools,
      temperature: request.temperature,
      max_tokens: request.maxTokens,
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(openaiRequest),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Provider error ${response.status}: ${errorBody}`);
      }

      return (await response.json()) as OpenAIChatResponse;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new RequestTimeoutException('AI provider request timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private getApiUrl(): string {
    const baseUrl = this.config.provider === 'openai'
      ? 'https://api.openai.com/v1/chat/completions'
      : `${this.config.provider}/v1/chat/completions`;
    return baseUrl;
  }

  private normalizeResponse(response: OpenAIChatResponse, requestId: string): GatewayResponse {
    const choice = response.choices[0];
    if (!choice) {
      throw new BadGatewayException('AI provider returned empty response');
    }

    const toolCalls: AIToolCall[] = (choice.message.tool_calls || []).map((tc) => ({
      id: tc.id,
      toolName: tc.function.name,
      arguments: this.parseArguments(tc.function.arguments),
      confirmationState: 'pending',
    }));

    const usage: AIUsageMetadata = response.usage
      ? {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
          provider: this.providerName,
        }
      : { promptTokens: 0, completionTokens: 0, totalTokens: 0, provider: this.providerName };

    return {
      content: choice.message.content || '',
      toolCalls,
      usage,
      provider: this.providerName,
      model: this.model,
      requestId,
    };
  }

  private parseArguments(argsJson: string): Record<string, any> {
    try {
      return JSON.parse(argsJson);
    } catch {
      return {};
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) {
      return false;
    }
    try {
      const response = await fetch(this.getApiUrl().replace('/chat/completions', '/models'), {
        headers: { Authorization: `Bearer ${this.config.apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
