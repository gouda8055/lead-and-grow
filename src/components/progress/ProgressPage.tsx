import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'
import type { AssessmentSession, Parameter, ParameterScore } from '@/lib/database.types'

export function ProgressPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<AssessmentSession[]>([])
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [latestScores, setLatestScores] = useState<ParameterScore[]>([])

  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      const [sessions, params] = await Promise.all([api.getSessionHistory(user.id), api.getParameters()])
      if (!mounted) return
      setHistory(sessions)
      setParameters(params)
      const latest = sessions[sessions.length - 1]
      if (latest) setLatestScores(await api.getParameterScores(latest.id))
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [user])

  if (loading) return <div className="text-sm text-dark/50">Loading progress…</div>

  if (!history.length) {
    return (
      <div>
        <h1 className="text-2xl font-light text-dark">Progress</h1>
        <p className="mt-2 text-dark/60">Complete an assessment to start tracking your growth over time.</p>
      </div>
    )
  }

  const lineData = history.map((s, i) => ({
    label: s.completed_at ? new Date(s.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : `#${i + 1}`,
    score: Number(s.overall_score ?? 0),
  }))

  const barData = parameters.map((p) => ({
    name: p.name.length > 10 ? `${p.name.slice(0, 9)}…` : p.name,
    score: Number(latestScores.find((s) => s.parameter_id === p.id)?.score ?? 0),
  }))

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-light text-dark">Progress</h1>

      <div className="mt-6 rounded-2xl bg-white border border-dark/10 p-6">
        <p className="text-sm font-medium text-dark mb-4">Leadership Score Over Time</p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={lineData}>
            <CartesianGrid stroke="#1D3045" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#1D3045' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#1D3045' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#8FA58F" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 rounded-2xl bg-white border border-dark/10 p-6">
        <p className="text-sm font-medium text-dark mb-4">Parameter Breakdown (latest assessment)</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData}>
            <CartesianGrid stroke="#1D3045" strokeOpacity={0.08} vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#1D3045' }} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={70} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#1D3045' }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Bar dataKey="score" fill="#B9ADD8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
