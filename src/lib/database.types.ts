// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once your project is live
// if you want fully generated types instead.

export type UserRole = 'customer' | 'admin'
export type PracticeStage = 'reset' | 'learn' | 'practice' | 'reflect'
export type ContentCategory =
  | 'YOGA'
  | 'BREATHWORK'
  | 'MEDITATION'
  | 'MENTAL_RESET'
  | 'VEDIC_WISDOM'
  | 'COMMUNICATION'
  | 'EMOTIONAL_INTELLIGENCE'
  | 'LEADERSHIP'
  | 'SELF_AWARENESS'
  | 'STRESS_MANAGEMENT'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  current_stage: number
  streak_count: number
  last_active_date: string | null
  created_at: string
  updated_at: string
}

export interface Parameter {
  id: string
  key: string
  name: string
  description: string | null
  icon: string | null
  sort_order: number
}

export interface Question {
  id: string
  parameter_id: string
  prompt: string
  sort_order: number
  active: boolean
}

export interface LeadershipStage {
  id: number
  key: string
  name: string
  description: string | null
  min_score: number
  sort_order: number
}

export interface AssessmentSession {
  id: string
  user_id: string
  status: 'in_progress' | 'completed'
  overall_score: number | null
  started_at: string
  completed_at: string | null
}

export interface AssessmentAnswer {
  id: string
  session_id: string
  question_id: string
  value: number
  created_at: string
}

export interface ParameterScore {
  id: string
  session_id: string
  parameter_id: string
  score: number
}

export interface ContentItem {
  id: string
  title: string
  category: ContentCategory
  practice_stage: PracticeStage
  description: string | null
  video_url: string | null
  duration_minutes: number
  target_parameter_id: string | null
  min_score: number
  max_score: number
  active: boolean
  sort_order: number
  created_at: string
}

export interface PracticeSession {
  id: string
  user_id: string
  practice_date: string
  content_item_id: string | null
  reset_done: boolean
  learn_done: boolean
  practice_done: boolean
  reflect_done: boolean
  completed_at: string | null
  created_at: string
}

export interface Reflection {
  id: string
  user_id: string
  practice_session_id: string | null
  reflection_date: string
  prompt: string | null
  response: string | null
  mood: 'great' | 'good' | 'okay' | 'low' | null
  key_takeaways: string[]
  created_at: string
}

export interface Achievement {
  id: string
  key: string
  title: string
  description: string | null
  icon: string | null
  sort_order: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
}

// Minimal Supabase `Database` generic shape (just enough for the typed client).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any
