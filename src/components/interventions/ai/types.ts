/**
 * AI Intervention Types
 * Shared type definitions for AI intervention components
 */

import type { FlatList } from 'react-native';
import type { Message, ConversationModeId } from '../../../types/ai';
import type { ModelStatus } from '../../../services/ai/executorchLLM';

/**
 * Quick action configuration for conversation modes
 */
export interface QuickAction {
  id: ConversationModeId;
  icon: string;
  labelKey: string;
}

/**
 * Props for the main AIIntervention component
 */
export interface AIInterventionProps {
  /** Name of the blocked app */
  blockedAppName: string;
  /** Callback when user chooses to proceed */
  onProceed: () => void;
  /** Callback when user dismisses (goes home) */
  onDismiss: () => void;
  /** Callback when user chooses friction intervention as fallback (offline) */
  onFallbackToFriction?: () => void;
  /** Minimum messages before showing decision buttons (default: 2) */
  minMessages?: number;
}

/**
 * Props for the AIOfflinePhase component
 */
export interface AIOfflinePhaseProps {
  onProceed: () => void;
  onDismiss: () => void;
  onFallbackToFriction?: () => void;
}

/**
 * Props for the AIQuickActionsPhase component
 */
export interface AIQuickActionsPhaseProps {
  onSelectMode: (modeId: ConversationModeId) => void;
  llmStatus: ModelStatus;
  llmIsReady: boolean;
  downloadProgress: number;
  llmError: string | undefined;
  onDownloadModel: () => void;
  showDownloadCard: boolean;
  onSkipDownload: () => void;
}

/**
 * Props for the AIChatPhase component
 */
export interface AIChatPhaseProps {
  blockedAppName: string;
  messages: Message[];
  isGenerating: boolean;
  showButtons: boolean;
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onProceed: () => void;
  onDismiss: () => void;
  flatListRef: React.RefObject<FlatList | null>;
  /** Custom component to show when message list is empty */
  listEmptyComponent?: React.ReactElement;
}

/**
 * Return type for useAIIntervention hook
 */
export interface UseAIInterventionReturn {
  // State
  messages: Message[];
  isGenerating: boolean;
  selectedMode: ConversationModeId | null;
  inputText: string;
  showButtons: boolean;
  showDownloadCard: boolean;
  isOffline: boolean;

  // LLM state
  llmStatus: ModelStatus;
  llmIsReady: boolean;
  downloadProgress: number;
  llmError: string | undefined;

  // Refs
  flatListRef: React.RefObject<FlatList | null>;

  // Actions
  setInputText: (text: string) => void;
  handleQuickActionSelect: (modeId: ConversationModeId) => void;
  handleSend: () => void;
  handleProceed: () => void;
  handleDismiss: () => void;
  handleDownloadModel: () => void;
  handleSkipDownload: () => void;
}
