import { AIToolCall, AIUsageMetadata } from '@nova-bank/types';

export interface GatewayRequest {
  model: string;
  messages: {
    role: 'system' | 'user' | 'assistant' | 'tool';
    content?: string;
    name?: string;
    tool_call_id?: string;
    tool_calls?: {
      id: string;
      type: 'function';
      function: {
        name: string;
        arguments: string;
      };
    }[];
  }[];
  tools?: {
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, any>;
    };
  }[];
  temperature?: number;
  maxTokens?: number;
  requestId: string;
}

export interface GatewayResponse {
  content: string;
  toolCalls: AIToolCall[];
  usage: AIUsageMetadata;
  provider: string;
  model: string;
  requestId: string;
}

export interface ProviderAdapter {
  readonly providerName: string;
  readonly model: string;
  chat(request: GatewayRequest): Promise<GatewayResponse>;
  isAvailable(): Promise<boolean>;
}

export interface AIGatewayConfig {
  enabled: boolean;
  provider: string;
  apiKey?: string;
  defaultModel: string;
  maxTokens: number;
  timeoutMs: number;
  maxRetries: number;
}
