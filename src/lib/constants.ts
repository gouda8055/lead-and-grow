export const LIKERT_LABELS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
] as const

export const NAV_LINKS = [
  { key: 'leadership', label: 'Leadership', to: '/' },
  { key: 'assessment', label: 'Assessment', to: '/app/assessment' },
  { key: 'practice', label: 'Practice', to: '/app/practice' },
  { key: 'progress', label: 'Progress', to: '/app/progress' },
  { key: 'journey', label: 'My Journey', to: '/app' },
] as const

export const CONTENT_CATEGORY_LABELS: Record<string, string> = {
  YOGA: 'Yoga',
  BREATHWORK: 'Breathwork',
  MEDITATION: 'Meditation',
  MENTAL_RESET: 'Mental Reset',
  VEDIC_WISDOM: 'Vedic Wisdom',
  COMMUNICATION: 'Communication',
  EMOTIONAL_INTELLIGENCE: 'Emotional Intelligence',
  LEADERSHIP: 'Leadership',
  SELF_AWARENESS: 'Self-awareness',
  STRESS_MANAGEMENT: 'Stress Management',
}

export const SCORE_BAND = (score: number): string => {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Developing'
  return 'Early Stage'
}
