import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import type { Parameter } from '@/lib/database.types'

export function LeadershipProfileRadar({
  parameters,
  scoresByParamId,
}: {
  parameters: Parameter[]
  scoresByParamId: Record<string, number>
}) {
  const data = parameters.map((p) => ({
    name: p.name,
    score: scoresByParamId[p.id] ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke="#1D3045" strokeOpacity={0.15} />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 10, fill: '#1D3045' }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
        <Radar name="You" dataKey="score" stroke="#8FA58F" fill="#8FA58F" fillOpacity={0.35} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
