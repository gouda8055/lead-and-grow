import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '@/lib/api'
import type { AssessmentSession, PracticeSession, Profile } from '@/lib/database.types'

export function AdminOverview() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [sessions, setSessions] = useState<AssessmentSession[]>([])
  const [practice, setPractice] = useState<PracticeSession[]>([])

  useEffect(() => {
    Promise.all([api.adminListUsers(), api.adminGetAllCompletedSessions(), api.adminGetAllPracticeSessions()]).then(
      ([u, s, p]) => {
        setUsers(u)
        setSessions(s)
        setPractice(p)
        setLoading(false)
      }
    )
  }, [])

  if (loading) return <div className="text-sm text-dark/50">Loading overview…</div>

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + Number(s.overall_score ?? 0), 0) / sessions.length)
    : 0
  const today = new Date().toISOString().slice(0, 10)
  const completedToday = practice.filter((p) => p.practice_date === today && p.completed_at).length

  const cards = [
    { label: 'Total Customers', value: users.length },
    { label: 'Completed Assessments', value: sessions.length },
    { label: 'Average Leadership Score', value: `${avgScore}/100` },
    { label: 'Practices Completed Today', value: completedToday },
  ]

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-light text-dark">Overview</h1>
      <p className="text-dark/60 mt-1">A snapshot of everything happening across Lead &amp; Grow.</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white border border-dark/10 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-dark/40">{c.label}</p>
            <p className="mt-2 text-2xl font-light text-dark">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/users" className="rounded-2xl bg-dark text-white p-6 hover:opacity-90">
          <p className="text-sm font-medium">Manage Users →</p>
          <p className="mt-1 text-xs text-white/60">View customers, scores, and roles.</p>
        </Link>
        <Link to="/admin/questions" className="rounded-2xl bg-white border border-dark/10 p-6 hover:border-dark/30">
          <p className="text-sm font-medium text-dark">Assessment Builder →</p>
          <p className="mt-1 text-xs text-dark/50">Edit the 12 parameters and 36 questions.</p>
        </Link>
        <Link to="/admin/content" className="rounded-2xl bg-white border border-dark/10 p-6 hover:border-dark/30">
          <p className="text-sm font-medium text-dark">Content Library →</p>
          <p className="mt-1 text-xs text-dark/50">Manage videos, practices, and recommendations.</p>
        </Link>
      </div>
    </div>
  )
}
