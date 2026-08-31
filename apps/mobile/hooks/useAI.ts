import { useCallback } from 'react';
import { useAIStore } from '../stores/aiStore';
import { useAuthStore } from '../stores/authStore';
import { chat as chatApi, confirmTool as confirmApi, getConversations as getConversationsApi, getAgents as getAgentsApi } from '../services/ai';
import { AIChatResponse } from '../types/ai';
import { AIStoreMessage } from '../types/ai';

export function useAI() {
  const {
    messages,
    conversationId,
    agentName,
    isLoading,
    error,
    usage,
    addMessage,
    setConversationId,
    setLoading,
    setError,
    setUsage,
    setAgentName,
    clearConversation,
  } = useAIStore();

  const { accessToken } = useAuthStore();

  const sendMessage = useCallback(
    async (message: string) => {
      if (!accessToken) {
        setError('احراز هویت انجام نشده است');
        return;
      }

      setLoading(true);
      setError(null);

      const userMessage: AIStoreMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        toolExecutions: [],
        pendingConfirmations: [],
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, provider: '' },
        isComplete: true,
      };
      addMessage(userMessage);

      try {
        const response: AIChatResponse = await chatApi(accessToken, message, conversationId || undefined);

        setConversationId(response.conversationId);
        setAgentName(response.agent.name);
        setUsage(response.usage);

        if (response.pendingConfirmations && response.pendingConfirmations.length > 0) {
          const assistantMessage: AIStoreMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.content || 'لطفاً عملیات زیر را تایید یا لغو کنید.',
            toolExecutions: response.toolExecutions,
            pendingConfirmations: response.pendingConfirmations,
            usage: response.usage,
            isComplete: false,
          };
          addMessage(assistantMessage);
        } else {
          const assistantMessage: AIStoreMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.content,
            toolExecutions: response.toolExecutions,
            pendingConfirmations: [],
            usage: response.usage,
            isComplete: response.isComplete,
          };
          addMessage(assistantMessage);
        }
      } catch (err: any) {
        setError(err.message || 'خطا در ارتباط با سرور');
        const errorMessage: AIStoreMessage = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '❌ ' + (err.message || 'خطا در ارتباط با سرور'),
          toolExecutions: [],
          pendingConfirmations: [],
          usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, provider: '' },
          isComplete: true,
        };
        addMessage(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, conversationId, addMessage, setConversationId, setAgentName, setUsage, setLoading, setError],
  );

  const confirmAction = useCallback(
    async (toolCallId: string, confirmed: boolean) => {
      if (!accessToken || !conversationId) return;

      setLoading(true);
      setError(null);

      try {
        const response: AIChatResponse = await confirmApi(accessToken, conversationId, toolCallId, confirmed);

        setUsage(response.usage);

        const assistantMessage: AIStoreMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.content,
          toolExecutions: response.toolExecutions,
          pendingConfirmations: response.pendingConfirmations,
          usage: response.usage,
          isComplete: response.isComplete,
        };
        addMessage(assistantMessage);
      } catch (err: any) {
        setError(err.message || 'خطا در تایید عملیات');
      } finally {
        setLoading(false);
      }
    },
    [accessToken, conversationId, addMessage, setUsage, setLoading, setError],
  );

  const loadConversations = useCallback(async () => {
    if (!accessToken) return [];
    return getConversationsApi(accessToken);
  }, [accessToken]);

  const loadAgents = useCallback(async () => {
    if (!accessToken) return [];
    return getAgentsApi(accessToken);
  }, [accessToken]);

  const startNewConversation = useCallback(() => {
    clearConversation();
  }, [clearConversation]);

  return {
    messages,
    conversationId,
    agentName,
    isLoading,
    error,
    usage,
    sendMessage,
    confirmAction,
    loadConversations,
    loadAgents,
    startNewConversation,
  };
}
