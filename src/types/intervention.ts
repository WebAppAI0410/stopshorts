/**
 * Intervention System Types
 * Phase 1: Friction/Nudge Intervention
 */

// Intervention method types
export type InterventionType = 'breathing' | 'friction' | 'mirror' | 'ai';

// Friction intervention phases
export type FrictionPhase = 'waiting' | 'intention' | 'confirm';

// Intention identifiers
export type IntentionId = 'dm' | 'specific' | 'bored' | 'random' | 'other';

// Intention log for statistics
export interface IntentionLog {
  id: string;
  intentionId: IntentionId;
  customText?: string;
  timestamp: string;
  proceeded: boolean;
  appPackage?: string;
}

// Intention option for UI
export interface IntentionOption {
  id: IntentionId;
  labelKey: string;
  icon: string;
  hasInput?: boolean;
}

// Predefined intention options
export const INTENTION_OPTIONS: IntentionOption[] = [
  {
    id: 'dm',
    labelKey: 'intervention.friction.intention.options.dm',
    icon: 'chatbubble-outline',
  },
  {
    id: 'specific',
    labelKey: 'intervention.friction.intention.options.specific',
    icon: 'play-outline',
  },
  {
    id: 'bored',
    labelKey: 'intervention.friction.intention.options.bored',
    icon: 'time-outline',
  },
  {
    id: 'random',
    labelKey: 'intervention.friction.intention.options.random',
    icon: 'help-outline',
  },
  {
    id: 'other',
    labelKey: 'intervention.friction.intention.options.other',
    icon: 'create-outline',
    hasInput: true,
  },
];

// Get intention label by ID
export function getIntentionLabel(
  intentionId: IntentionId,
  t: (key: string) => string
): string {
  const option = INTENTION_OPTIONS.find((opt) => opt.id === intentionId);
  return option ? t(option.labelKey) : intentionId;
}
