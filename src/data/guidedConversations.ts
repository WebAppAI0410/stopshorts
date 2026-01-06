/**
 * Guided Conversation Templates
 * Structured conversation flows for specific goals
 */

import type { GuidedConversationTemplate, GuidedStep } from '../types/ai';

// ============================================
// If-Then Plan Creation Template
// ============================================

const IF_THEN_STEPS: GuidedStep[] = [
  {
    id: 'trigger',
    promptKey: 'ai.guided.ifThen.step1',
    options: [
      { textKey: 'ai.guided.ifThen.opt.bored', value: '暇な時' },
      { textKey: 'ai.guided.ifThen.opt.stressed', value: 'ストレスを感じた時' },
      { textKey: 'ai.guided.ifThen.opt.beforeSleep', value: '寝る前' },
      { textKey: 'ai.guided.ifThen.opt.commute', value: '電車の中' },
      { textKey: 'ai.guided.ifThen.opt.eating', value: '食事中' },
    ],
    allowFreeInput: true,
  },
  {
    id: 'detail',
    promptKey: 'ai.guided.ifThen.step2',
    allowFreeInput: true,
  },
  {
    id: 'alternative',
    promptKey: 'ai.guided.ifThen.step3',
    options: [
      { textKey: 'ai.guided.ifThen.alt.breathe', value: '深呼吸する' },
      { textKey: 'ai.guided.ifThen.alt.water', value: '水を飲む' },
      { textKey: 'ai.guided.ifThen.alt.walk', value: '散歩する' },
      { textKey: 'ai.guided.ifThen.alt.read', value: '本を読む' },
      { textKey: 'ai.guided.ifThen.alt.music', value: '音楽を聴く' },
    ],
    allowFreeInput: true,
  },
  {
    id: 'confirm',
    promptKey: 'ai.guided.ifThen.step4',
    options: [
      { textKey: 'ai.guided.ifThen.confirm.yes', value: 'complete' },
      { textKey: 'ai.guided.ifThen.confirm.edit', value: 'edit' },
    ],
    allowFreeInput: true,
    saveToStore: {
      store: 'appStore',
      field: 'ifThenPlan',
    },
  },
];

export const IF_THEN_TEMPLATE: GuidedConversationTemplate = {
  id: 'if-then',
  titleKey: 'ai.guided.ifThen.title',
  descriptionKey: 'ai.guided.ifThen.description',
  steps: IF_THEN_STEPS,
};

// ============================================
// Trigger Analysis Template
// ============================================

const TRIGGER_ANALYSIS_STEPS: GuidedStep[] = [
  {
    id: 'cue',
    promptKey: 'ai.guided.trigger.step1',
    options: [
      { textKey: 'ai.guided.trigger.cue.notification', value: '通知が来た' },
      { textKey: 'ai.guided.trigger.cue.bored', value: '暇だった' },
      { textKey: 'ai.guided.trigger.cue.stressed', value: 'ストレスを感じた' },
      { textKey: 'ai.guided.trigger.cue.habit', value: '習慣的に' },
      { textKey: 'ai.guided.trigger.cue.social', value: '誰かが見ていた' },
      { textKey: 'ai.guided.trigger.cue.random', value: 'なんとなく' },
    ],
    allowFreeInput: true,
  },
  {
    id: 'emotion',
    promptKey: 'ai.guided.trigger.step2',
    options: [
      { textKey: 'ai.guided.trigger.emo.tired', value: '疲れていた' },
      { textKey: 'ai.guided.trigger.emo.bored', value: '退屈だった' },
      { textKey: 'ai.guided.trigger.emo.anxious', value: '不安だった' },
      { textKey: 'ai.guided.trigger.emo.irritated', value: 'イライラしていた' },
      { textKey: 'ai.guided.trigger.emo.nothing', value: '特に何も感じなかった' },
    ],
    allowFreeInput: true,
  },
  {
    id: 'context',
    promptKey: 'ai.guided.trigger.step3',
    options: [
      { textKey: 'ai.guided.trigger.ctx.work', value: '仕事・勉強' },
      { textKey: 'ai.guided.trigger.ctx.meal', value: '食事' },
      { textKey: 'ai.guided.trigger.ctx.commute', value: '移動中' },
      { textKey: 'ai.guided.trigger.ctx.break', value: '休憩中' },
      { textKey: 'ai.guided.trigger.ctx.bedtime', value: '寝る準備' },
      { textKey: 'ai.guided.trigger.ctx.sns', value: 'SNSを見ていた' },
    ],
    allowFreeInput: true,
  },
  {
    id: 'reflection',
    promptKey: 'ai.guided.trigger.step4',
    allowFreeInput: true,
    saveToStore: {
      store: 'aiStore',
      field: 'triggers',
    },
  },
];

export const TRIGGER_ANALYSIS_TEMPLATE: GuidedConversationTemplate = {
  id: 'trigger-analysis',
  titleKey: 'ai.guided.trigger.title',
  descriptionKey: 'ai.guided.trigger.description',
  steps: TRIGGER_ANALYSIS_STEPS,
};

// ============================================
// All Templates
// ============================================

export const GUIDED_TEMPLATES: GuidedConversationTemplate[] = [
  IF_THEN_TEMPLATE,
  TRIGGER_ANALYSIS_TEMPLATE,
];

export const GUIDED_TEMPLATES_BY_ID: Record<string, GuidedConversationTemplate> = {
  'if-then': IF_THEN_TEMPLATE,
  'trigger-analysis': TRIGGER_ANALYSIS_TEMPLATE,
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get a guided conversation template by ID
 */
export function getGuidedTemplate(
  templateId: string
): GuidedConversationTemplate | undefined {
  return GUIDED_TEMPLATES_BY_ID[templateId];
}

/**
 * Get the current step of a guided conversation
 */
export function getCurrentStep(
  templateId: string,
  stepIndex: number
): GuidedStep | undefined {
  const template = getGuidedTemplate(templateId);
  if (!template) return undefined;
  return template.steps[stepIndex];
}

/**
 * Check if the current step is the last step
 */
export function isLastStep(templateId: string, stepIndex: number): boolean {
  const template = getGuidedTemplate(templateId);
  if (!template) return true;
  return stepIndex >= template.steps.length - 1;
}

/**
 * Get the total number of steps in a template
 */
export function getTotalSteps(templateId: string): number {
  const template = getGuidedTemplate(templateId);
  return template?.steps.length ?? 0;
}

/**
 * Build the If-Then plan string from responses
 */
export function buildIfThenPlan(responses: Record<string, string>): string {
  const trigger = responses['trigger'] || '';
  const alternative = responses['alternative'] || '';

  if (!trigger || !alternative) {
    return '';
  }

  return `もし${trigger}になったら、${alternative}をする`;
}

/**
 * Build trigger analysis summary from responses
 */
export function buildTriggerSummary(responses: Record<string, string>): {
  situation: string;
  emotion: string;
  context: string;
  reflection: string;
} {
  return {
    situation: responses['cue'] || '',
    emotion: responses['emotion'] || '',
    context: responses['context'] || '',
    reflection: responses['reflection'] || '',
  };
}
