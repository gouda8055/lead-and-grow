import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import * as api from '@/lib/api'
import type { AssessmentSession, LeadershipStage, PracticeSession, Profile } from '@/lib/database.types'
import { stageForScore } from '@/lib/scoring'

const PIE_COLORS = ['#8FA58F', '#B9ADD8', '#D8C7A5', '#233B35', '#1D3045']

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [sessions, setSessions] = useState<AssessmentSession[]>([])
  const [practice, setPractice] = useState<PracticeSession[]>([])
  const [stages, setStages] = useState<LeadershipStage[]>([])

  useEffect(() => {
    Promise.all([
      api.adminListUsers(),
      api.adminGetAllCompletedSessions(),
      api.adminGetAllPracticeSessions(),
      api.getLeadershipStages(),
    ]).then(([u, s, p, st]) => {
      setUsers(u)
      setSessions(s)
      setPractice(p)
      setStages(st)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-sm text-dark/50">Crunching analytics…</div>

  // Latest completed session per user, for stage distribution.
  const latestByUser = new Map<string, AssessmentSession>()
  for (const s of sessions) {
    const prev = latestByUser.get(s.user_id)
    if (!prev || (s.completed_at ?? '') > (prev.completed_at ?? '')) latestByUser.set(s.user_id, s)
  }
  const stageCounts = stages.map((stage) => ({
    name: stage.name,
    value: Array.from(latestByUser.values()).filter(
      (s) => stageForScore(Number(s.overall_score ?? 0), stages)?.id === stage.id
    ).length,
  }))

  const engagementByWeek = new Map<string, number>()
  for (const p of practice) {
    if (!p.completed_at) continue
    const d = new Date(p.practice_date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toISOString().slice(0, 10)
    engagementByWeek.set(key, (engagementByWeek.get(key) ?? 0) + 1)
  }
  const engagementData = Array.from(engagementByWeek.entries())
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-8)
    .map(([week, count]) => ({ week: new Date(week).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), count }))

  const completionRate = practice.length
    ? Math.round((practice.filter((p) => p.completed_at).length / practice.length) * 100)
    : 0

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-light text-dark">Analytics</h1>
      <p className="text-dark/60 mt-1">Engagement, scores, and stage distribution across all customers.</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Customers" value={users.length} />
        <Stat label="Assessments Completed" value={sessions.length} />
        <Stat label="Practice Completion Rate" value={`${completionRate}%`} />
        <Stat label="Total Practice Sessions" value={practice.length} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white border border-dark/10 p-6">
          <p className="text-sm font-medium text-dark mb-4">Practices Completed (last 8 weeks)</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={engagementData}>
              <CartesianGrid stroke="#1D3045" strokeOpacity={0.08} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#1D3045' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#1D3045' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#8FA58F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white border border-dark/10 p-6">
          <p className="text-sm font-medium text-dark mb-4">Leadership Stage Distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={stageCounts} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85}>
                {stageCounts.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {stageCounts.map((s, i) => (
              <span key={s.name} className="flex items-center gap-1.5 text-xs text-dark/60">
                <span className="rounded-full" style={{ width: 8, height: 8, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                {s.name} ({s.value})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white border border-dark/10 p-5">
      <p className="text-xs uppercase tracking-[0.1em] text-dark/40">{label}</p>
      <p className="mt-2 text-2xl font-light text-dark">{value}</p>
    </div>
  )
}
