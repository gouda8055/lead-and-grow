import { useEffect, useState } from 'react'
import { CheckCircle2, Wind, PlayCircle, Users2, NotebookPen } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'
import type { ContentItem, ParameterScore, PracticeSession } from '@/lib/database.types'
import { PRACTICE_STEPS, pickContentForStep, PracticeStepKey } from '@/lib/plan'

const STEP_ICON: Record<PracticeStepKey, typeof Wind> = {
  reset: Wind,
  learn: PlayCircle,
  practice: Users2,
  reflect: NotebookPen,
}

const DONE_FIELD: Record<PracticeStepKey, keyof PracticeSession> = {
  reset: 'reset_done',
  learn: 'learn_done',
  practice: 'practice_done',
  reflect: 'reflect_done',
}

export function PracticePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState<ContentItem[]>([])
  const [focusParamId, setFocusParamId] = useState<string | undefined>()
  const [session, setSession] = useState<PracticeSession | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [reflectionText, setReflectionText] = useState('')
  const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'low'>('good')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      const [items, latestSession] = await Promise.all([
        api.getContentLibrary(),
        api.getLatestCompletedSession(user.id),
      ])
      if (!mounted) return
      setContent(items)

      let weakestParamId: string | undefined
      if (latestSession) {
        const scores: ParameterScore[] = await api.getParameterScores(latestSession.id)
        const weakest = [...scores].sort((a, b) => Number(a.score) - Number(b.score))[0]
        weakestParamId = weakest?.parameter_id
      }
      setFocusParamId(weakestParamId)

      const chosen = pickContentForStep('learn', items, weakestParamId)
      const s = await api.ensureTodayPracticeSession(user.id, chosen?.id ?? null)
      if (!mounted) return
      setSession(s)
      const firstIncomplete = PRACTICE_STEPS.findIndex((step) => !s[DONE_FIELD[step.key]])
      setStepIndex(firstIncomplete === -1 ? 0 : firstIncomplete)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [user])

  if (loading || !session) {
    return <div className="text-sm text-dark/50">Preparing today's practice…</div>
  }

  const step = PRACTICE_STEPS[stepIndex]
  const Icon = STEP_ICON[step.key]
  const item = pickContentForStep(step.key, content, focusParamId)
  const isLast = stepIndex === PRACTICE_STEPS.length - 1

  const completeStep = async () => {
    const patch: Partial<PracticeSession> = { [DONE_FIELD[step.key]]: true }
    if (isLast) patch.completed_at = new Date().toISOString()
    await api.updatePracticeSession(session.id, patch)
    setSession((prev) => (prev ? { ...prev, ...patch } : prev))

    if (step.key === 'reflect' && user) {
      await api.addReflection({
        user_id: user.id,
        practice_session_id: session.id,
        reflection_date: session.practice_date,
        prompt: 'What did you learn today?',
        response: reflectionText,
        mood,
        key_takeaways: [],
      })
      setSaved(true)
    }

    if (!isLast) setStepIndex((i) => i + 1)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-light text-dark">Daily Practice Experience</h1>
      <p className="text-dark/60 mt-1">15 minutes to strengthen your leadership, today.</p>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {PRACTICE_STEPS.map((s, i) => {
          const done = Boolean(session[DONE_FIELD[s.key]])
          return (
            <div key={s.key} className="text-center">
              <div
                className={`mx-auto flex items-center justify-center rounded-full border ${
                  done
                    ? 'bg-sage border-sage text-white'
                    : i === stepIndex
                    ? 'border-dark text-dark'
                    : 'border-dark/15 text-dark/30'
                }`}
                style={{ width: 32, height: 32 }}
              >
                {done ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-[0.05em] text-dark/50">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-8 rounded-2xl bg-white border border-dark/10 p-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full bg-sage/15" style={{ width: 44, height: 44 }}>
            <Icon size={20} className="text-sage" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-dark/40">{step.range}</p>
            <p className="text-lg font-medium text-dark">{step.label}</p>
          </div>
        </div>

        <h3 className="mt-6 text-lg text-dark">{item?.title ?? 'Free practice'}</h3>
        <p className="mt-2 text-sm text-dark/60">{item?.description}</p>

        {step.key === 'reflect' && (
          <div className="mt-6 space-y-4">
            <textarea
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="What did you learn today?"
              rows={4}
              className="w-full rounded-lg border border-dark/15 px-4 py-3 text-sm text-dark outline-none focus:border-dark/40"
            />
            <div className="flex items-center gap-3">
              {(['great', 'good', 'okay', 'low'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.05em] border ${
                    mood === m ? 'bg-dark text-white border-dark' : 'border-dark/15 text-dark/60'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={completeStep}
          className="mt-8 w-full rounded-lg bg-dark text-white py-3 text-sm tracking-[0.1em] uppercase hover:opacity-90"
        >
          {isLast ? (saved ? 'Practice Complete ✓' : 'Save Reflection & Finish') : `Continue to ${PRACTICE_STEPS[stepIndex + 1].label} →`}
        </button>
      </div>
    </div>
  )
}
