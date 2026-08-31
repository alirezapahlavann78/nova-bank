import { getWithAuth, postWithAuth } from './api';
import { AIChatResponse, AIConversationSummary, AIAgentSummary } from '../types/ai';

export async function chat(accessToken: string, message: string, conversationId?: string, agentId?: string): Promise<AIChatResponse> {
  return postWithAuth<AIChatResponse>('/ai/chat', { message, conversationId, agentId }, accessToken);
}

export async function confirmTool(accessToken: string, conversationId: string, toolCallId: string, confirmed: boolean): Promise<AIChatResponse> {
  return postWithAuth<AIChatResponse>('/ai/confirm', { toolCallId, conversationId, confirmed }, accessToken);
}

export async function getConversations(accessToken: string): Promise<AIConversationSummary[]> {
  return getWithAuth<AIConversationSummary[]>('/ai/conversations', accessToken);
}

export async function getConversation(accessToken: string, conversationId: string): Promise<any> {
  return getWithAuth(`/ai/conversations/${conversationId}`, accessToken);
}

export async function getAgents(accessToken: string): Promise<AIAgentSummary[]> {
  return getWithAuth<AIAgentSummary[]>('/ai/agents', accessToken);
}
