import { create } from 'zustand';
import { AIStoreMessage, AIUsageMetadata } from '../types/ai';

export interface AIState {
  messages: AIStoreMessage[];
  conversationId: string | null;
  agentName: string;
  isLoading: boolean;
  error: string | null;
  usage: AIUsageMetadata | null;
  addMessage: (message: AIStoreMessage) => void;
  setConversationId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUsage: (usage: AIUsageMetadata) => void;
  setAgentName: (name: string) => void;
  clearConversation: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  messages: [],
  conversationId: null,
  agentName: '',
  isLoading: false,
  error: null,
  usage: null,
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setConversationId: (id) => set({ conversationId: id }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setUsage: (usage) => set({ usage }),
  setAgentName: (name) => set({ agentName: name }),
  clearConversation: () =>
    set({
      messages: [],
      conversationId: null,
      isLoading: false,
      error: null,
      usage: null,
    }),
}));
