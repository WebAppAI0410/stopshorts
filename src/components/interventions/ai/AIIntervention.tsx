/**
 * AIIntervention Component
 * Conversational AI chatbot for mindful intervention
 *
 * Features:
 * - Chat interface with AI assistant
 * - Local LLM inference (Qwen 3 0.6B via react-native-executorch)
 * - Pattern-based fallback when LLM not available
 * - Session management with memory
 * - Crisis detection (mental health keywords)
 * - "Quit" (primary) and "Give in to temptation" (ghost) buttons
 *
 * Architecture:
 * - AIOfflinePhase: Offline fallback UI
 * - AIQuickActionsPhase: Mode selection (explore, plan, training, reflect)
 * - AIChatPhase: Main chat interface
 * - useAIIntervention: State management hook
 */

import React from 'react';
import { AIOfflinePhase } from './AIOfflinePhase';
import { AIQuickActionsPhase } from './AIQuickActionsPhase';
import { AIChatPhase } from './AIChatPhase';
import { useAIIntervention } from './hooks/useAIIntervention';
import type { AIInterventionProps } from './types';

export function AIIntervention({
  blockedAppName,
  onProceed,
  onDismiss,
  onFallbackToFriction,
  minMessages = 2,
}: AIInterventionProps): React.JSX.Element {
  const {
    // State
    messages,
    isGenerating,
    selectedMode,
    inputText,
    showButtons,
    showDownloadCard,
    isOffline,

    // LLM state
    llmStatus,
    llmIsReady,
    downloadProgress,
    llmError,

    // Refs
    flatListRef,

    // Actions
    setInputText,
    handleQuickActionSelect,
    handleSend,
    handleProceed,
    handleDismiss,
    handleDownloadModel,
    handleSkipDownload,
  } = useAIIntervention({
    onProceed,
    onDismiss,
    minMessages,
  });

  // Offline fallback
  if (isOffline) {
    return (
      <AIOfflinePhase
        onProceed={handleProceed}
        onDismiss={handleDismiss}
        onFallbackToFriction={onFallbackToFriction}
      />
    );
  }

  // Mode selection phase (no mode selected yet)
  if (selectedMode === null) {
    return (
      <AIChatPhase
        blockedAppName={blockedAppName}
        messages={messages}
        isGenerating={isGenerating}
        showButtons={showButtons}
        inputText={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        onProceed={handleProceed}
        onDismiss={handleDismiss}
        flatListRef={flatListRef}
        listEmptyComponent={
          <AIQuickActionsPhase
            onSelectMode={handleQuickActionSelect}
            llmStatus={llmStatus}
            llmIsReady={llmIsReady}
            downloadProgress={downloadProgress}
            llmError={llmError}
            onDownloadModel={handleDownloadModel}
            showDownloadCard={showDownloadCard}
            onSkipDownload={handleSkipDownload}
          />
        }
      />
    );
  }

  // Chat phase (mode selected)
  return (
    <AIChatPhase
      blockedAppName={blockedAppName}
      messages={messages}
      isGenerating={isGenerating}
      showButtons={showButtons}
      inputText={inputText}
      onChangeText={setInputText}
      onSend={handleSend}
      onProceed={handleProceed}
      onDismiss={handleDismiss}
      flatListRef={flatListRef}
    />
  );
}
