import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Sprout } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'
import type { ContentItem, LeadershipStage, Parameter, ParameterScore } from '@/lib/database.types'
import { topStrengthsAndFocusAreas, stageForScore } from '@/lib/scoring'
import { SCORE_BAND } from '@/lib/constants'
import { ScoreRing } from './ScoreRing'

const STEP_META = [
  { key: 'reset', label: 'Mental Reset', range: '0–3 min' },
  { key: 'learn', label: 'Learn', range: '3–8 min' },
  { key: 'practice', label: 'Practice', range: '8–13 min' },
  { key: 'reflect', label: 'Reflect', range: '13–15 min' },
] as const

export function DashboardPage() {
  const { profile, user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [stages, setStages] = useState<LeadershipStage[]>([])
  const [scores, setScores] = useState<ParameterScore[]>([])
  const [overall, setOverall] = useState<number | null>(null)
  const [content, setContent] = useState<ContentItem[]>([])

  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      try {
        const [params, allStages, session, items] = await Promise.all([
          api.getParameters(),
          api.getLeadershipStages(),
          api.getLatestCompletedSession(user.id),
          api.getContentLibrary(),
        ])
        if (!mounted) return
        setParameters(params)
        setStages(allStages)
        setContent(items)
        if (session) {
          setOverall(session.overall_score)
          const s = await api.getParameterScores(session.id)
          if (mounted) setScores(s)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [user])

  if (loading) {
    return <div className="text-sm text-dark/50">Loading your dashboard…</div>
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  if (overall === null) {
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-light text-dark">Hello, {firstName} 👋</h1>
        <p className="mt-2 text-dark/60">
          You haven't taken your leadership assessment yet. It takes about 8 minutes and unlocks your
          personalized 15-minute daily practice.
        </p>
        <Link
          to="/app/assessment"
          className="mt-6 inline-block rounded-lg bg-dark text-white px-6 py-3 text-sm tracking-[0.15em] uppercase hover:opacity-90"
        >
          Start Assessment
        </Link>
      </div>
    )
  }

  const byParameter = scores.map((s) => ({ parameterId: s.parameter_id, score: Number(s.score) }))
  const { strengths, focusAreas } = topStrengthsAndFocusAreas(byParameter, parameters, 3)
  const stage = stageForScore(overall, stages)
  const nextStage = stages.find((s) => s.sort_order === (stage?.sort_order ?? 1) + 1)
  const topFocusParamId = focusAreas[0]?.parameterId

  const planItems = STEP_META.map((step) => {
    const candidates = content.filter((c) => c.practice_stage === step.key)
    const targeted = candidates.find((c) => c.target_parameter_id === topFocusParamId)
    return { step, item: targeted || candidates[0] }
  })

  return (
    <div className="max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-dark">Hello, {firstName}! 👋</h1>
          <p className="text-dark/60 mt-1">Ready to grow today?</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white border border-dark/10 px-4 py-2 text-sm text-dark">
          <Flame size={16} className="text-sand" />
          {profile?.streak_count ?? 0} Day Streak
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white border border-dark/10 p-6 flex items-center gap-6">
          <ScoreRing score={overall} />
          <div>
            <p className="text-sm text-dark/50">Your Leadership Score</p>
            <p className="text-lg font-medium text-dark">{SCORE_BAND(overall)}</p>
            <p className="mt-2 text-sm text-dark/60">
              Keep practicing consistently to reach your full potential.
            </p>
            <Link to="/app/progress" className="mt-3 inline-block text-sm text-dark underline underline-offset-2">
              View Progress →
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-dark/10 p-6 flex items-center gap-6">
          <div className="flex items-center justify-center rounded-full bg-sage/15" style={{ width: 64, height: 64 }}>
            <Sprout size={28} className="text-sage" />
          </div>
          <div>
            <p className="text-sm text-dark/50">Current Stage</p>
            <p className="text-lg font-medium text-dark">
              Stage {stage?.sort_order} · {stage?.name}
            </p>
            <p className="mt-2 text-sm text-dark/60">{stage?.description}</p>
            {nextStage && (
              <p className="mt-2 text-xs uppercase tracking-[0.1em] text-dark/40">
                Next: Stage {nextStage.sort_order} — {nextStage.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white border border-dark/10 p-6">
          <p className="text-sm font-medium text-dark mb-3">Top Strengths</p>
          <ul className="space-y-2">
            {strengths.map((s) => (
              <li key={s.parameterId} className="flex items-center justify-between text-sm">
                <span className="text-dark/70">{s.name}</span>
                <span className="text-sage font-medium">Strong</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white border border-dark/10 p-6">
          <p className="text-sm font-medium text-dark mb-3">Areas to Improve</p>
          <ul className="space-y-2">
            {focusAreas.map((s) => (
              <li key={s.parameterId} className="flex items-center justify-between text-sm">
                <span className="text-dark/70">{s.name}</span>
                <span className="text-sand font-medium">Focus</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-dark text-white p-6 flex flex-col justify-between">
          <div>
            <p className="text-sm text-white/60">Today's Focus</p>
            <p className="text-lg font-medium mt-1">{focusAreas[0]?.name ?? 'Leadership'}</p>
            <p className="text-sm text-white/60 mt-2">
              Improve your ability to grow this dimension with today's 15-minute practice.
            </p>
          </div>
          <Link
            to="/app/practice"
            className="mt-4 inline-block rounded-lg bg-white text-dark text-center px-4 py-2.5 text-sm tracking-[0.1em] uppercase hover:opacity-90"
          >
            Start 15-Minute Practice →
          </Link>
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-dark/10 p-6">
        <p className="text-sm font-medium text-dark mb-4">Today's Plan (15 min)</p>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {planItems.map(({ step, item }, i) => (
            <div key={step.key} className="flex sm:block items-center gap-3">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.1em] text-dark/40">{step.range}</p>
                <p className="text-sm font-medium text-dark mt-1">{step.label}</p>
                <p className="text-xs text-dark/50 mt-0.5">{item?.title ?? '—'}</p>
              </div>
              {i < planItems.length - 1 && (
                <div className="hidden sm:block h-px bg-dark/10 mt-3" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
