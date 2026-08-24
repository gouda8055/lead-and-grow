import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import * as api from '@/lib/api'
import type { AssessmentSession, PracticeSession, Profile } from '@/lib/database.types'

export function AdminUserDetail() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<AssessmentSession[]>([])
  const [practice, setPractice] = useState<PracticeSession[]>([])

  useEffect(() => {
    if (!id) return
    let mounted = true
    ;(async () => {
      const [p, s, pr] = await Promise.all([
        api.getProfile(id),
        api.getSessionHistory(id),
        api.getPracticeHistory(id),
      ])
      if (!mounted) return
      setProfile(p)
      setSessions(s)
      setPractice(pr)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) return <div className="text-sm text-dark/50">Loading customer…</div>
  if (!profile) return <div className="text-sm text-dark/50">User not found.</div>

  const latest = sessions[sessions.length - 1]
  const completedPractices = practice.filter((p) => p.completed_at).length

  return (
    <div className="max-w-3xl">
      <Link to="/admin/users" className="inline-flex items-center gap-1 text-sm text-dark/60 hover:text-dark">
        <ArrowLeft size={14} /> Back to users
      </Link>

      <h1 className="mt-4 text-2xl font-light text-dark">{profile.full_name || profile.email}</h1>
      <p className="text-dark/60">{profile.email}</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Current Stage" value={`Stage ${profile.current_stage}`} />
        <Stat label="Streak" value={`${profile.streak_count}d`} />
        <Stat label="Latest Score" value={latest ? `${latest.overall_score}/100` : '—'} />
        <Stat label="Practices Completed" value={completedPractices} />
      </div>

      <div className="mt-6 rounded-2xl bg-white border border-dark/10 p-6">
        <p className="text-sm font-medium text-dark mb-3">Assessment History</p>
        {sessions.length === 0 && <p className="text-sm text-dark/50">No completed assessments yet.</p>}
        <ul className="space-y-2">
          {sessions
            .slice()
            .reverse()
            .map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-dark/70">
                  {s.completed_at ? new Date(s.completed_at).toLocaleDateString() : '—'}
                </span>
                <span className="text-dark font-medium">{s.overall_score}/100</span>
              </li>
            ))}
        </ul>
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-dark/10 p-6">
        <p className="text-sm font-medium text-dark mb-3">Recent Practice Sessions</p>
        {practice.length === 0 && <p className="text-sm text-dark/50">No practice sessions logged yet.</p>}
        <ul className="space-y-2">
          {practice.slice(0, 10).map((p) => (
            <li key={p.id} className="flex items-center justify-between text-sm">
              <span className="text-dark/70">{p.practice_date}</span>
              <span className={p.completed_at ? 'text-sage' : 'text-dark/40'}>
                {p.completed_at ? 'Completed' : 'In progress'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white border border-dark/10 p-4">
      <p className="text-xs uppercase tracking-[0.1em] text-dark/40">{label}</p>
      <p className="mt-1 text-lg font-medium text-dark">{value}</p>
    </div>
  )
}
