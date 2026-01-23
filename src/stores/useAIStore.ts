/**
 * AI Store for StopShorts
 * Manages AI chatbot state, sessions, and memory
 *
 * This file re-exports from the sliced implementation for backward compatibility.
 * See src/stores/ai/ for the actual implementation.
 */

// Re-export everything from the sliced implementation
export {
  useAIStore,
  selectIsSessionActive,
  selectMessages,
  selectModelReady,
  selectCanChat,
  selectIsGuidedConversationActive,
  selectGuidedConversation,
  selectRecentRecommendations,
} from './ai';
