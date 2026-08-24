// Thin data-access layer over Supabase (our "backend"). Every function is a
// small, typed wrapper so components never write raw `.from()` calls inline.
import { supabase } from './supabaseClient'
import type {
  Achievement,
  AssessmentSession,
  ContentItem,
  LeadershipStage,
  Parameter,
  ParameterScore,
  PracticeSession,
  Profile,
  Question,
  Reflection,
  UserAchievement,
} from './database.types'

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------
export async function getParameters(): Promise<Parameter[]> {
  const { data, error } = await supabase.from('parameters').select('*').order('sort_order')
  if (error) throw error
  return (data ?? []) as Parameter[]
}

export async function getQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('active', true)
    .order('sort_order')
  if (error) throw error
  return (data ?? []) as Question[]
}

export async function getLeadershipStages(): Promise<LeadershipStage[]> {
  const { data, error } = await supabase.from('leadership_stages').select('*').order('sort_order')
  if (error) throw error
  return (data ?? []) as LeadershipStage[]
}

export async function getContentLibrary(): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('active', true)
    .order('sort_order')
  if (error) throw error
  return (data ?? []) as ContentItem[]
}

export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase.from('achievements').select('*').order('sort_order')
  if (error) throw error
  return (data ?? []) as Achievement[]
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Assessment
// ---------------------------------------------------------------------------
export async function getLatestCompletedSession(userId: string): Promise<AssessmentSession | null> {
  const { data, error } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as AssessmentSession | null
}

export async function getSessionHistory(userId: string): Promise<AssessmentSession[]> {
  const { data, error } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as AssessmentSession[]
}

export async function getParameterScores(sessionId: string): Promise<ParameterScore[]> {
  const { data, error } = await supabase
    .from('parameter_scores')
    .select('*')
    .eq('session_id', sessionId)
  if (error) throw error
  return (data ?? []) as ParameterScore[]
}

export async function startAssessmentSession(userId: string): Promise<AssessmentSession> {
  const { data, error } = await supabase
    .from('assessment_sessions')
    .insert({ user_id: userId, status: 'in_progress' })
    .select('*')
    .single()
  if (error) throw error
  return data as AssessmentSession
}

export async function saveAnswer(sessionId: string, questionId: string, value: number) {
  const { error } = await supabase
    .from('assessment_answers')
    .upsert({ session_id: sessionId, question_id: questionId, value }, { onConflict: 'session_id,question_id' })
  if (error) throw error
}

export async function getAnswers(sessionId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('assessment_answers')
    .select('question_id, value')
    .eq('session_id', sessionId)
  if (error) throw error
  const map: Record<string, number> = {}
  for (const row of data ?? []) map[row.question_id as string] = row.value as number
  return map
}

export async function completeAssessmentSession(
  sessionId: string,
  overall: number,
  byParameter: { parameterId: string; score: number }[]
) {
  const { error: sessionError } = await supabase
    .from('assessment_sessions')
    .update({ status: 'completed', overall_score: overall, completed_at: new Date().toISOString() })
    .eq('id', sessionId)
  if (sessionError) throw sessionError

  const rows = byParameter.map((p) => ({
    session_id: sessionId,
    parameter_id: p.parameterId,
    score: p.score,
  }))
  const { error: scoresError } = await supabase
    .from('parameter_scores')
    .upsert(rows, { onConflict: 'session_id,parameter_id' })
  if (scoresError) throw scoresError
}

// ---------------------------------------------------------------------------
// Practice
// ---------------------------------------------------------------------------
export async function getTodayPracticeSession(userId: string): Promise<PracticeSession | null> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('practice_date', today)
    .maybeSingle()
  if (error) throw error
  return data as PracticeSession | null
}

export async function ensureTodayPracticeSession(
  userId: string,
  contentItemId: string | null
): Promise<PracticeSession> {
  const today = new Date().toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('practice_sessions')
    .upsert(
      { user_id: userId, practice_date: today, content_item_id: contentItemId },
      { onConflict: 'user_id,practice_date', ignoreDuplicates: true }
    )
    .select('*')
    .maybeSingle()
  if (error) throw error
  if (data) return data as PracticeSession
  const existing = await getTodayPracticeSession(userId)
  if (!existing) throw new Error('Failed to create practice session')
  return existing
}

export async function updatePracticeSession(id: string, patch: Partial<PracticeSession>) {
  const { error } = await supabase.from('practice_sessions').update(patch).eq('id', id)
  if (error) throw error
}

export async function getPracticeHistory(userId: string): Promise<PracticeSession[]> {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('practice_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as PracticeSession[]
}

// ---------------------------------------------------------------------------
// Reflections
// ---------------------------------------------------------------------------
export async function addReflection(reflection: Omit<Reflection, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('reflections').insert(reflection).select('*').single()
  if (error) throw error
  return data as Reflection
}

export async function getReflections(userId: string): Promise<Reflection[]> {
  const { data, error } = await supabase
    .from('reflections')
    .select('*')
    .eq('user_id', userId)
    .order('reflection_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Reflection[]
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase.from('user_achievements').select('*').eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as UserAchievement[]
}

export async function grantAchievement(userId: string, achievementId: string) {
  const { error } = await supabase
    .from('user_achievements')
    .upsert({ user_id: userId, achievement_id: achievementId }, { onConflict: 'user_id,achievement_id' })
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export async function adminListUsers(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function adminSetUserRole(userId: string, role: 'customer' | 'admin') {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
  if (error) throw error
}

export async function adminUpsertParameter(param: Partial<Parameter>) {
  const { error } = await supabase.from('parameters').upsert(param)
  if (error) throw error
}

export async function adminUpsertQuestion(question: Partial<Question>) {
  const { error } = await supabase.from('questions').upsert(question)
  if (error) throw error
}

export async function adminDeleteQuestion(id: string) {
  const { error } = await supabase.from('questions').delete().eq('id', id)
  if (error) throw error
}

export async function adminUpsertContentItem(item: Partial<ContentItem>) {
  const { error } = await supabase.from('content_items').upsert(item)
  if (error) throw error
}

export async function adminDeleteContentItem(id: string) {
  const { error } = await supabase.from('content_items').delete().eq('id', id)
  if (error) throw error
}

export async function adminGetAllCompletedSessions(): Promise<AssessmentSession[]> {
  const { data, error } = await supabase
    .from('assessment_sessions')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AssessmentSession[]
}

export async function adminGetAllPracticeSessions(): Promise<PracticeSession[]> {
  const { data, error } = await supabase
    .from('practice_sessions')
    .select('*')
    .order('practice_date', { ascending: false })
  if (error) throw error
  return (data ?? []) as PracticeSession[]
}
