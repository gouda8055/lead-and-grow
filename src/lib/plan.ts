import type { ContentItem } from './database.types'

export const PRACTICE_STEPS = [
  { key: 'reset', label: 'Mental Reset', range: '0–3 min', duration: 3 },
  { key: 'learn', label: 'Learn', range: '3–8 min', duration: 5 },
  { key: 'practice', label: 'Practice', range: '8–13 min', duration: 5 },
  { key: 'reflect', label: 'Reflect', range: '13–15 min', duration: 2 },
] as const

export type PracticeStepKey = (typeof PRACTICE_STEPS)[number]['key']

export function pickContentForStep(
  step: PracticeStepKey,
  items: ContentItem[],
  focusParameterId?: string
): ContentItem | undefined {
  const candidates = items.filter((c) => c.practice_stage === step)
  const targeted = focusParameterId
    ? candidates.find((c) => c.target_parameter_id === focusParameterId)
    : undefined
  return targeted || candidates[0]
}
