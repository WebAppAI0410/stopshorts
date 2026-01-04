import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type AIState,
  type AIActions,
  type Message,
  type CurrentSession,
  type PersonaId,
  type SessionEndTrigger,
  type LongTermMemory,
  type SessionSummary,
  DEFAULT_LONG_TERM_MEMORY,
  LONG_TERM_LIMITS,
} from '../types/ai';
import { buildTrainingContext } from '../services/ai/promptBuilder';

// Utility to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Estimate token count (rough: 1 token ~ 4 chars for English, ~2 chars for Japanese)
function estimateTokens(text: string): number {
  // Simple heuristic: assume average of 2.5 chars per token for mixed content
  return Math.ceil(text.length / 2.5);
}

// Initial state
const initialState: AIState = {
  // Model status
  modelStatus: 'not_downloaded',
  downloadProgress: 0,
  modelError: null,

  // Current session
  currentSession: null,

  // Settings
  personaId: 'supportive',

  // Memory (loaded from storage)
  longTermMemory: null,
  sessionSummaries: [],

  // UI state
  isGenerating: false,
};

// Storage key for AI memory (separate from main store for modularity)
const AI_MEMORY_KEY = 'stopshorts-ai-memory';
const AI_SESSIONS_KEY = 'stopshorts-ai-sessions';

interface AIStore extends AIState, AIActions {}

export const useAIStore = create<AIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

      // ============================================
      // Session Management
      // ============================================

      startSession: () => {
        const sessionId = generateId();
        const now = Date.now();

        const newSession: CurrentSession = {
          id: sessionId,
          messages: [],
          startedAt: now,
          lastActivityAt: now,
        };

        set({ currentSession: newSession });
      },

      endSession: async (_trigger: SessionEndTrigger = 'user_explicit') => {
        const { currentSession, sessionSummaries } = get();

        if (!currentSession || currentSession.messages.length === 0) {
          set({ currentSession: null });
          return;
        }

        // Create session summary
        const summary: SessionSummary = {
          sessionId: currentSession.id,
          date: new Date().toISOString(),
          summary: await generateSessionSummary(currentSession.messages),
          insights: extractInsights(currentSession.messages),
          messageCount: currentSession.messages.length,
          durationMinutes: Math.round(
            (Date.now() - currentSession.startedAt) / 60000
          ),
        };

        // Keep only the last N session summaries
        const updatedSummaries = [
          ...sessionSummaries,
          summary,
        ].slice(-LONG_TERM_LIMITS.maxSessionSummaries);

        set({
          currentSession: null,
          sessionSummaries: updatedSummaries,
        });

        // Save to storage
        await get().saveMemory();
      },

      // ============================================
      // Messaging
      // ============================================

      addAIGreeting: (greeting: string) => {
        const { currentSession } = get();

        if (!currentSession) {
          // Auto-start session if needed
          get().startSession();
        }

        const session = get().currentSession;
        if (!session) return;

        const greetingMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: greeting,
          timestamp: Date.now(),
          tokenEstimate: estimateTokens(greeting),
        };

        set({
          currentSession: {
            ...session,
            messages: [...session.messages, greetingMessage],
            lastActivityAt: Date.now(),
          },
        });
      },

      sendMessage: async (content: string) => {
        const { currentSession } = get();

        if (!currentSession) {
          // Auto-start session if needed
          get().startSession();
        }

        const session = get().currentSession;
        if (!session) return;

        // Create user message
        const userMessage: Message = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: Date.now(),
          tokenEstimate: estimateTokens(content),
        };

        // Add user message to session
        set({
          currentSession: {
            ...session,
            messages: [...session.messages, userMessage],
            lastActivityAt: Date.now(),
          },
          isGenerating: true,
        });

        try {
          // Generate AI response (placeholder - will be implemented with actual LLM)
          const response = await generateAIResponse(
            [...session.messages, userMessage],
            get().personaId,
            get().longTermMemory
          );

          const assistantMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: response,
            timestamp: Date.now(),
            tokenEstimate: estimateTokens(response),
          };

          // Add assistant message
          const updatedSession = get().currentSession;
          if (updatedSession) {
            set({
              currentSession: {
                ...updatedSession,
                messages: [...updatedSession.messages, assistantMessage],
                lastActivityAt: Date.now(),
              },
              isGenerating: false,
            });
          }
        } catch (error) {
          if (__DEV__) {
            console.error('[AIStore] Error generating response:', error);
          }
          set({ isGenerating: false });

          // Add error message
          const errorMessage: Message = {
            id: generateId(),
            role: 'assistant',
            content: getDefaultErrorResponse(),
            timestamp: Date.now(),
            tokenEstimate: 50,
          };

          const updatedSession = get().currentSession;
          if (updatedSession) {
            set({
              currentSession: {
                ...updatedSession,
                messages: [...updatedSession.messages, errorMessage],
                lastActivityAt: Date.now(),
              },
            });
          }
        }
      },

      // ============================================
      // Settings
      // ============================================

      setPersona: (id: PersonaId) => {
        set({ personaId: id });
      },

      // ============================================
      // Model Management
      // ============================================

      downloadModel: async () => {
        set({ modelStatus: 'downloading', downloadProgress: 0 });

        try {
          // Placeholder - actual implementation will use react-native-executorch
          // Simulate download progress
          for (let i = 0; i <= 100; i += 10) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            set({ downloadProgress: i });
          }

          set({ modelStatus: 'ready', downloadProgress: 100 });
        } catch (error) {
          if (__DEV__) {
            console.error('[AIStore] Error downloading model:', error);
          }
          set({
            modelStatus: 'error',
            modelError: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },

      checkModelStatus: async () => {
        try {
          // Placeholder - actual implementation will check ExecuTorch model status
          const isDownloaded = false; // Will check actual file existence
          const isSupported = true; // Will check device capabilities

          if (!isSupported) {
            set({ modelStatus: 'unavailable' });
          } else if (isDownloaded) {
            set({ modelStatus: 'ready' });
          } else {
            set({ modelStatus: 'not_downloaded' });
          }
        } catch (error) {
          if (__DEV__) {
            console.error('[AIStore] Error checking model status:', error);
          }
          set({ modelStatus: 'error' });
        }
      },

      // ============================================
      // Memory Management
      // ============================================

      loadMemory: async () => {
        try {
          // Load long-term memory
          const memoryJson = await AsyncStorage.getItem(AI_MEMORY_KEY);
          if (memoryJson) {
            const memory: LongTermMemory = JSON.parse(memoryJson);
            set({ longTermMemory: memory });
          } else {
            set({ longTermMemory: DEFAULT_LONG_TERM_MEMORY });
          }

          // Load session summaries
          const sessionsJson = await AsyncStorage.getItem(AI_SESSIONS_KEY);
          if (sessionsJson) {
            const summaries: SessionSummary[] = JSON.parse(sessionsJson);
            set({ sessionSummaries: summaries });
          }
        } catch (error) {
          if (__DEV__) {
            console.error('[AIStore] Error loading memory:', error);
          }
          set({ longTermMemory: DEFAULT_LONG_TERM_MEMORY });
        }
      },

      saveMemory: async () => {
        const { longTermMemory, sessionSummaries } = get();

        try {
          if (longTermMemory) {
            await AsyncStorage.setItem(
              AI_MEMORY_KEY,
              JSON.stringify(longTermMemory)
            );
          }

          await AsyncStorage.setItem(
            AI_SESSIONS_KEY,
            JSON.stringify(sessionSummaries)
          );
        } catch (error) {
          if (__DEV__) {
            console.error('[AIStore] Error saving memory:', error);
          }
        }
      },

      clearMemory: async () => {
        try {
          await AsyncStorage.removeItem(AI_MEMORY_KEY);
          await AsyncStorage.removeItem(AI_SESSIONS_KEY);
          set({
            longTermMemory: DEFAULT_LONG_TERM_MEMORY,
            sessionSummaries: [],
            currentSession: null,
          });
        } catch (error) {
          if (__DEV__) {
            console.error('[AIStore] Error clearing memory:', error);
          }
        }
      },

      // ============================================
      // Insights
      // ============================================

      confirmInsight: (insightId: string) => {
        const { longTermMemory } = get();
        if (!longTermMemory) return;

        const updatedInsights = longTermMemory.confirmedInsights.map(
          (insight) =>
            insight.id === insightId
              ? { ...insight, confirmedByUser: true }
              : insight
        );

        set({
          longTermMemory: {
            ...longTermMemory,
            confirmedInsights: updatedInsights,
          },
        });
      },
      }),
      {
        name: 'stopshorts-ai-store',
        storage: createJSONStorage(() => AsyncStorage),
        // Only persist certain fields
        partialize: (state) => ({
          personaId: state.personaId,
          modelStatus: state.modelStatus,
        }),
      }
    ),
    { name: 'AIStore', enabled: __DEV__ }
  )
);

// ============================================
// Helper Functions
// ============================================

/**
 * Generate AI response (placeholder - will be replaced with actual LLM integration)
 */
async function generateAIResponse(
  messages: Message[],
  _personaId: PersonaId,
  _longTermMemory: LongTermMemory | null
): Promise<string> {
  // Build training context for personalized responses
  const trainingContext = buildTrainingContext();

  // Placeholder responses based on message content
  // This will be replaced with actual LLM integration via react-native-executorch
  // When integrated, trainingContext will be included in the system prompt
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage?.content.toLowerCase() || '';

  // Log training context in dev mode for debugging
  if (__DEV__) {
    console.log('[AIStore] Training context:', trainingContext);
  }

  // Simple pattern matching for demo purposes
  // In production, the LLM will use trainingContext for personalized recommendations
  if (content.includes('つらい') || content.includes('難しい')) {
    return 'その気持ち、よく分かります。少しずつでいいんですよ。今日、何か小さな一歩を踏み出せたことはありますか？';
  }

  if (content.includes('開いて') || content.includes('見てしまった')) {
    return 'なるほど、開いてしまったんですね。でも、こうして話してくれていること自体が大きな一歩です。何がきっかけで開きたくなりましたか？';
  }

  if (content.includes('できた') || content.includes('成功')) {
    return 'すごい！その調子です。小さな成功を積み重ねることが大切ですね。どんな気持ちですか？';
  }

  if (content.includes('トレーニング') || content.includes('学習') || content.includes('勉強')) {
    // Use training context to suggest next topic
    if (trainingContext.includes('完了済み: なし')) {
      return '習慣改善のトレーニングをまだ始めていないようですね。「習慣ループの理解」から始めてみませんか？自分の行動パターンを理解することが第一歩です。';
    }
    return 'トレーニングを進めているんですね！学んだことを日常に活かせていますか？';
  }

  // Default supportive response
  const supportiveResponses = [
    'もう少し教えてもらえますか？',
    'その気持ち、大切にしてくださいね。',
    '一緒に考えていきましょう。',
    'それは大変でしたね。どうしたいですか？',
  ];

  return supportiveResponses[Math.floor(Math.random() * supportiveResponses.length)];
}

/**
 * Generate session summary (placeholder - will use LLM)
 */
async function generateSessionSummary(messages: Message[]): Promise<string> {
  const messageCount = messages.length;
  const firstTopic = messages[0]?.content.slice(0, 50) || '';
  return `${messageCount}回のやりとり。話題: ${firstTopic}...`;
}

/**
 * Extract insights from messages (placeholder - will use LLM)
 */
function extractInsights(_messages: Message[]): string[] {
  // Placeholder - actual implementation will use LLM to extract insights
  return [];
}

/**
 * Get default error response
 */
function getDefaultErrorResponse(): string {
  const responses = [
    'すみません、少し考えが詰まってしまいました。もう一度お話しいただけますか？',
    '申し訳ありません、うまく処理できませんでした。別の言い方で教えていただけますか？',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// ============================================
// Selectors
// ============================================

export const selectIsSessionActive = (state: AIState): boolean =>
  state.currentSession !== null;

export const selectMessages = (state: AIState): Message[] =>
  state.currentSession?.messages ?? [];

export const selectModelReady = (state: AIState): boolean =>
  state.modelStatus === 'ready';

export const selectCanChat = (state: AIState): boolean =>
  state.modelStatus === 'ready' && !state.isGenerating;
