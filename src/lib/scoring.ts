import type { LeadershipStage, Parameter, Question } from './database.types'

/**
 * Converts a 1-5 Likert average into a 0-100 score.
 */
export function likertAverageToScore(average: number): number {
  const clamped = Math.min(5, Math.max(1, average))
  return Math.round(((clamped - 1) / 4) * 100)
}

/**
 * Given every answer in a completed session (question_id -> 1..5 value),
 * the question list, and the parameter list, compute:
 *  - a 0-100 score per parameter
 *  - an overall 0-100 score (average of parameter scores)
 */
export function computeScores(
  answers: Record<string, number>,
  questions: Question[],
  parameters: Parameter[]
): { overall: number; byParameter: { parameterId: string; score: number }[] } {
  const byParameter = parameters.map((param) => {
    const paramQuestions = questions.filter((q) => q.parameter_id === param.id)
    const values = paramQuestions
      .map((q) => answers[q.id])
      .filter((v): v is number => typeof v === 'number')
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 3
    return { parameterId: param.id, score: likertAverageToScore(avg) }
  })

  const overall = byParameter.length
    ? Math.round(byParameter.reduce((sum, p) => sum + p.score, 0) / byParameter.length)
    : 0

  return { overall, byParameter }
}

export function topStrengthsAndFocusAreas(
  byParameter: { parameterId: string; score: number }[],
  parameters: Parameter[],
  count = 3
) {
  const withNames = byParameter
    .map((p) => ({ ...p, name: parameters.find((x) => x.id === p.parameterId)?.name ?? '' }))
    .sort((a, b) => b.score - a.score)

  return {
    strengths: withNames.slice(0, count),
    focusAreas: [...withNames].sort((a, b) => a.score - b.score).slice(0, count),
  }
}

export function stageForScore(score: number, stages: LeadershipStage[]): LeadershipStage | undefined {
  const sorted = [...stages].sort((a, b) => b.min_score - a.min_score)
  return sorted.find((s) => score >= s.min_score) ?? sorted[sorted.length - 1]
}
