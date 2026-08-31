export type AIMessageRole = 'user' | 'assistant' | 'tool';

export interface AIToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
}

export interface AIToolExecutionSummary {
  toolName: string;
  success: boolean;
  data?: any;
  error?: string;
}

export interface AIPendingConfirmation {
  id: string;
  toolName: string;
  arguments: Record<string, any>;
  message?: string;
}

export interface AIUsageMetadata {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  provider: string;
}

export interface AIChatResponse {
  content: string;
  conversationId: string;
  agent: { id: string; name: string; version: string };
  toolExecutions: AIToolExecutionSummary[];
  pendingConfirmations: AIPendingConfirmation[];
  usage: AIUsageMetadata;
  isComplete: boolean;
}

export interface AIConfirmationResponse {
  content: string;
  conversationId: string;
  toolExecutions: AIToolExecutionSummary[];
  pendingConfirmations: AIPendingConfirmation[];
  usage: AIUsageMetadata;
  isComplete: boolean;
}

export interface AIConversationSummary {
  id: string;
  agentId: string;
  title: string | null;
  startedAt: string;
  endedAt: string | null;
  isActive: boolean;
  messageCount: number;
  lastMessageAt: string | null;
}

export interface AIAgentSummary {
  id: string;
  name: string;
  version: string;
  description: string;
}

export interface AIStoreMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  toolExecutions: AIToolExecutionSummary[];
  pendingConfirmations: AIPendingConfirmation[];
  usage: AIUsageMetadata;
  isComplete: boolean;
}
