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

// ============================================
// Type Guards
// ============================================

const INTERVENTION_TYPE_VALUES: readonly InterventionType[] = [
  'breathing',
  'friction',
  'mirror',
  'ai',
] as const;

const INTENTION_ID_VALUES: readonly IntentionId[] = [
  'dm',
  'specific',
  'bored',
  'random',
  'other',
] as const;

const FRICTION_PHASE_VALUES: readonly FrictionPhase[] = [
  'waiting',
  'intention',
  'confirm',
] as const;

/**
 * Type guard for InterventionType
 */
export function isValidInterventionType(value: unknown): value is InterventionType {
  return typeof value === 'string' && INTERVENTION_TYPE_VALUES.includes(value as InterventionType);
}

/**
 * Type guard for IntentionId
 */
export function isValidIntentionId(value: unknown): value is IntentionId {
  return typeof value === 'string' && INTENTION_ID_VALUES.includes(value as IntentionId);
}

/**
 * Type guard for FrictionPhase
 */
export function isValidFrictionPhase(value: unknown): value is FrictionPhase {
  return typeof value === 'string' && FRICTION_PHASE_VALUES.includes(value as FrictionPhase);
}
