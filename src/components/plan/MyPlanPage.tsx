import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'
import type { ContentItem, Parameter, ParameterScore } from '@/lib/database.types'
import { topStrengthsAndFocusAreas } from '@/lib/scoring'
import { CONTENT_CATEGORY_LABELS } from '@/lib/constants'

export function MyPlanPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [scores, setScores] = useState<ParameterScore[]>([])
  const [content, setContent] = useState<ContentItem[]>([])

  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      const [params, items, session] = await Promise.all([
        api.getParameters(),
        api.getContentLibrary(),
        api.getLatestCompletedSession(user.id),
      ])
      if (!mounted) return
      setParameters(params)
      setContent(items)
      if (session) setScores(await api.getParameterScores(session.id))
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [user])

  if (loading) return <div className="text-sm text-dark/50">Building your plan…</div>

  if (!scores.length) {
    return (
      <div className="max-w-md">
        <h1 className="text-2xl font-light text-dark">My Plan</h1>
        <p className="mt-2 text-dark/60">
          Complete your leadership assessment first to unlock a personalized plan.
        </p>
        <Link to="/app/assessment" className="mt-4 inline-block text-sm text-dark underline underline-offset-2">
          Take the assessment →
        </Link>
      </div>
    )
  }

  const byParameter = scores.map((s) => ({ parameterId: s.parameter_id, score: Number(s.score) }))
  const { focusAreas } = topStrengthsAndFocusAreas(byParameter, parameters, 3)
  const topFocusId = focusAreas[0]?.parameterId
  const recommended = content.filter((c) => c.target_parameter_id === topFocusId)

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-light text-dark">My Plan</h1>
      <p className="text-dark/60 mt-1">Personalized recommendations based on your latest assessment.</p>

      <div className="mt-6 rounded-2xl bg-white border border-dark/10 p-6">
        <p className="text-sm font-medium text-dark mb-4">Your Focus Areas (Top 3)</p>
        <ol className="space-y-3">
          {focusAreas.map((f, i) => (
            <li key={f.parameterId} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-3">
                <span className="flex items-center justify-center rounded-full bg-dark/5 text-dark text-xs" style={{ width: 22, height: 22 }}>
                  {i + 1}
                </span>
                <span className="text-dark">{f.name}</span>
              </span>
              <span className="text-dark/50">Score: {f.score}/100</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-dark/10 p-6">
        <p className="text-sm font-medium text-dark mb-4">Recommended For You</p>
        {recommended.length === 0 && <p className="text-sm text-dark/50">No tailored content yet — check Resources.</p>}
        <div className="space-y-3">
          {recommended.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-dark/10 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.1em] text-sage">
                  {CONTENT_CATEGORY_LABELS[item.category]}
                </p>
                <p className="text-sm font-medium text-dark mt-1">{item.title}</p>
                <p className="text-xs text-dark/50 mt-0.5">{item.duration_minutes} min</p>
              </div>
              <Link
                to="/app/practice"
                className="rounded-lg bg-dark text-white px-4 py-2 text-xs tracking-[0.1em] uppercase hover:opacity-90"
              >
                Start
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Link
        to="/app/practice"
        className="mt-6 inline-block rounded-lg bg-dark text-white px-6 py-3 text-sm tracking-[0.1em] uppercase hover:opacity-90"
      >
        Start Today's 15-Minute Task →
      </Link>
    </div>
  )
}
