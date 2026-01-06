import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type AIState,
  type AIActions,
  type AIActionsExtended,
  type Message,
  type CurrentSession,
  type PersonaId,
  type SessionEndTrigger,
  type LongTermMemory,
  type SessionSummary,
  type ConversationModeId,
  type GuidedConversationState,
  DEFAULT_LONG_TERM_MEMORY,
  LONG_TERM_LIMITS,
} from '../types/ai';
import {
  getGuidedTemplate,
  getCurrentStep,
  isLastStep,
  buildTriggerSummary,
} from '../data/guidedConversations';
import { handleCrisisIfDetected } from '../services/ai/mentalHealthHandler';
import { buildTrainingContext, type TrainingContextInput } from '../services/ai/promptBuilder';
import { extractInsights } from '../services/ai/insightExtractor';
import { useAppStore } from './useAppStore';
import type { IfThenPlan, IfThenAction } from '../types';
import { secureStorage, migrateToSecureStorage } from '../utils/secureStorage';

// Utility to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Estimate token count (rough: 1 token ~ 4 chars for English, ~2 chars for Japanese)
function estimateTokens(text: string): number {
  // Simple heuristic: assume average of 2.5 chars per token for mixed content
  return Math.ceil(text.length / 2.5);
}

// Extended state interface with guided conversation
interface AIStateExtended extends AIState {
  guidedConversation: GuidedConversationState | null;
  recentRecommendations: Array<{
    topicId: string;
    recommendedAt: number;
  }>;
}

// Initial state
const initialState: AIStateExtended = {
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

  // Guided conversation state
  guidedConversation: null,

  // Recent recommendations (to avoid repetition)
  recentRecommendations: [],
};

// Storage key for AI memory (separate from main store for modularity)
const AI_MEMORY_KEY = 'stopshorts-ai-memory';
const AI_SESSIONS_KEY = 'stopshorts-ai-sessions';

interface AIStore extends AIStateExtended, AIActions, AIActionsExtended {}

export const useAIStore = create<AIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

      // ============================================
      // Session Management
      // ============================================

      startSession: (modeId: ConversationModeId = 'free') => {
        const sessionId = generateId();
        const now = Date.now();

        const newSession: CurrentSession = {
          id: sessionId,
          messages: [],
          startedAt: now,
          lastActivityAt: now,
          modeId,
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
            get().longTermMemory,
            get().sessionSummaries
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
          // Migrate from AsyncStorage to SecureStorage if needed
          const memoryMigrated = await migrateToSecureStorage(AI_MEMORY_KEY);
          const sessionsMigrated = await migrateToSecureStorage(AI_SESSIONS_KEY);

          // Load long-term memory
          let memoryJson: string | null = null;
          if (memoryMigrated) {
            memoryJson = await secureStorage.getItem(AI_MEMORY_KEY);
          }
          // Fallback to AsyncStorage if SecureStorage failed or returned null
          if (!memoryJson) {
            memoryJson = await AsyncStorage.getItem(AI_MEMORY_KEY);
          }

          if (memoryJson) {
            const memory: LongTermMemory = JSON.parse(memoryJson);
            set({ longTermMemory: memory });
          } else {
            set({ longTermMemory: DEFAULT_LONG_TERM_MEMORY });
          }

          // Load session summaries
          let sessionsJson: string | null = null;
          if (sessionsMigrated) {
            sessionsJson = await secureStorage.getItem(AI_SESSIONS_KEY);
          }
          // Fallback to AsyncStorage if SecureStorage failed or returned null
          if (!sessionsJson) {
            sessionsJson = await AsyncStorage.getItem(AI_SESSIONS_KEY);
          }

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
            await secureStorage.setItem(
              AI_MEMORY_KEY,
              JSON.stringify(longTermMemory)
            );
          }

          await secureStorage.setItem(
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
          // Remove from both secure storage and AsyncStorage (for migration cleanup)
          await secureStorage.removeItem(AI_MEMORY_KEY);
          await secureStorage.removeItem(AI_SESSIONS_KEY);
          // Also clean up any remaining AsyncStorage data from before migration
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

      // ============================================
      // Guided Conversation
      // ============================================

      startGuidedConversation: (templateId: string) => {
        const template = getGuidedTemplate(templateId);
        if (!template) {
          if (__DEV__) {
            console.warn('[AIStore] Unknown guided template:', templateId);
          }
          return;
        }

        const guidedState: GuidedConversationState = {
          templateId,
          currentStepIndex: 0,
          responses: {},
          isActive: true,
          startedAt: Date.now(),
        };

        set({ guidedConversation: guidedState });
      },

      advanceGuidedStep: (response: string) => {
        const { guidedConversation } = get();
        if (!guidedConversation || !guidedConversation.isActive) return;

        const currentStep = getCurrentStep(
          guidedConversation.templateId,
          guidedConversation.currentStepIndex
        );

        if (!currentStep) return;

        // Save the response
        const updatedResponses = {
          ...guidedConversation.responses,
          [currentStep.id]: response,
        };

        // Check if this is the last step
        if (isLastStep(guidedConversation.templateId, guidedConversation.currentStepIndex)) {
          // Update responses first, then trigger completion
          set({
            guidedConversation: {
              ...guidedConversation,
              responses: updatedResponses,
            },
          });
          // Call completeGuidedConversation to persist data
          get().completeGuidedConversation();
        } else {
          // Move to next step
          set({
            guidedConversation: {
              ...guidedConversation,
              currentStepIndex: guidedConversation.currentStepIndex + 1,
              responses: updatedResponses,
            },
          });
        }
      },

      completeGuidedConversation: async () => {
        const { guidedConversation } = get();
        if (!guidedConversation) return;

        const { templateId, responses } = guidedConversation;

        try {
          // Handle different template completions
          if (templateId === 'if-then') {
            // Save If-Then plan to app store
            const alternative = responses['alternative'] || '';
            const ifThenPlan = mapAlternativeToIfThenPlan(alternative);
            if (ifThenPlan) {
              useAppStore.getState().setIfThenPlan(ifThenPlan);
            }
          } else if (templateId === 'trigger-analysis') {
            // Save trigger analysis to long-term memory
            const { longTermMemory } = get();
            if (longTermMemory) {
              const summary = buildTriggerSummary(responses);
              const newTrigger = {
                id: generateId(),
                trigger: `${summary.situation} (${summary.emotion})`,
                frequency: 1,
                discoveredAt: new Date().toISOString(),
              };

              const updatedTriggers = [
                ...longTermMemory.identifiedTriggers,
                newTrigger,
              ].slice(-LONG_TERM_LIMITS.maxTriggers);

              set({
                longTermMemory: {
                  ...longTermMemory,
                  identifiedTriggers: updatedTriggers,
                },
              });

              await get().saveMemory();
            }
          }
        } catch (error) {
          if (__DEV__) {
            console.error('[AIStore] Error completing guided conversation:', error);
          }
        }

        // Clear guided conversation state
        set({ guidedConversation: null });
      },

      cancelGuidedConversation: () => {
        set({ guidedConversation: null });
      },

      addRecommendation: (topicId: string) => {
        const { recentRecommendations } = get();

        // Keep only recommendations from the last 24 hours
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const filtered = recentRecommendations.filter(
          (r) => r.recommendedAt > dayAgo
        );

        // Add new recommendation
        const updated = [
          ...filtered,
          { topicId, recommendedAt: Date.now() },
        ];

        set({ recentRecommendations: updated });
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
  _longTermMemory: LongTermMemory | null,
  sessionSummaries: SessionSummary[]
): Promise<string> {
  // Build training context for personalized responses
  // Get data from useAppStore and pass as arguments to avoid circular dependency
  const { trainingProgress, getCompletedTopicIds } = useAppStore.getState();
  const trainingContextInput: TrainingContextInput = {
    trainingProgress,
    completedTopicIds: getCompletedTopicIds(),
    sessionSummaries,
  };
  const trainingContext = buildTrainingContext(trainingContextInput);

  // Placeholder responses based on message content
  // This will be replaced with actual LLM integration via react-native-executorch
  // When integrated, trainingContext will be included in the system prompt
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage?.content || '';
  const contentLower = content.toLowerCase();

  // Check for mental health crisis keywords first - highest priority
  const crisisResponse = handleCrisisIfDetected(content);
  if (crisisResponse) {
    return crisisResponse;
  }

  // Log training context in dev mode for debugging
  if (__DEV__) {
    console.log('[AIStore] Training context:', trainingContext);
  }

  // Simple pattern matching for demo purposes
  // In production, the LLM will use trainingContext for personalized recommendations
  if (contentLower.includes('つらい') || contentLower.includes('難しい')) {
    return 'その気持ち、よく分かります。少しずつでいいんですよ。今日、何か小さな一歩を踏み出せたことはありますか？';
  }

  if (contentLower.includes('開いて') || contentLower.includes('見てしまった')) {
    return 'なるほど、開いてしまったんですね。でも、こうして話してくれていること自体が大きな一歩です。何がきっかけで開きたくなりましたか？';
  }

  if (contentLower.includes('できた') || contentLower.includes('成功')) {
    return 'すごい！その調子です。小さな成功を積み重ねることが大切ですね。どんな気持ちですか？';
  }

  if (content.includes('トレーニング') || content.includes('学習') || content.includes('勉強')) {
    // Use training context to suggest next topic
    // Check both completed AND in-progress to determine if truly not started (Codex P2 fix)
    const hasNotStarted = trainingContext.includes('完了済み: なし') && trainingContext.includes('学習中: なし');
    if (hasNotStarted) {
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
 * Get default error response
 */
function getDefaultErrorResponse(): string {
  const responses = [
    'すみません、少し考えが詰まってしまいました。もう一度お話しいただけますか？',
    '申し訳ありません、うまく処理できませんでした。別の言い方で教えていただけますか？',
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Map alternative action text from guided conversation to IfThenPlan
 */
function mapAlternativeToIfThenPlan(alternative: string): IfThenPlan | null {
  if (!alternative) return null;

  // Map known alternatives to IfThenAction
  const actionMapping: Record<string, IfThenAction> = {
    '深呼吸する': 'breathe',
    '水を飲む': 'water',
    '散歩する': 'short_walk',
    '本を読む': 'read_page',
    'ストレッチする': 'stretch',
    '外の景色を見る': 'look_outside',
  };

  const mappedAction = actionMapping[alternative];

  if (mappedAction) {
    return { action: mappedAction };
  }

  // Unknown alternative becomes custom action
  return {
    action: 'custom',
    customAction: alternative,
  };
}

// ============================================
// Selectors
// ============================================

export const selectIsSessionActive = (state: AIState): boolean =>
  state.currentSession !== null;

// Stable empty array reference to prevent infinite re-renders
const EMPTY_MESSAGES: Message[] = [];

export const selectMessages = (state: AIState): Message[] =>
  state.currentSession?.messages ?? EMPTY_MESSAGES;

export const selectModelReady = (state: AIState): boolean =>
  state.modelStatus === 'ready';

export const selectCanChat = (state: AIState): boolean =>
  state.modelStatus === 'ready' && !state.isGenerating;

export const selectIsGuidedConversationActive = (state: AIStateExtended): boolean =>
  state.guidedConversation?.isActive ?? false;

export const selectGuidedConversation = (state: AIStateExtended): GuidedConversationState | null =>
  state.guidedConversation;

export const selectRecentRecommendations = (state: AIStateExtended): string[] =>
  state.recentRecommendations.map((r) => r.topicId);
