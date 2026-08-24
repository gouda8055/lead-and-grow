import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'
import type { AssessmentSession, Parameter, Question } from '@/lib/database.types'
import { LIKERT_LABELS } from '@/lib/constants'
import { computeScores } from '@/lib/scoring'
import { LeadershipProfileRadar } from './LeadershipProfileRadar'

type Phase = 'loading' | 'questions' | 'completing' | 'results'

export function AssessmentPage() {
  const { user } = useAuth()
  const [phase, setPhase] = useState<Phase>('loading')
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [session, setSession] = useState<AssessmentSession | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [index, setIndex] = useState(0)
  const [overall, setOverall] = useState(0)
  const [scoresByParamId, setScoresByParamId] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      const [params, qs] = await Promise.all([api.getParameters(), api.getQuestions()])
      if (!mounted) return
      setParameters(params)
      setQuestions(qs)

      const existing = await api.getLatestCompletedSession(user.id)
      if (existing && mounted) {
        const scores = await api.getParameterScores(existing.id)
        const map: Record<string, number> = {}
        for (const s of scores) map[s.parameter_id] = Number(s.score)
        setOverall(existing.overall_score ?? 0)
        setScoresByParamId(map)
        setSession(existing)
        setPhase('results')
        return
      }

      const newSession = await api.startAssessmentSession(user.id)
      if (mounted) {
        setSession(newSession)
        setPhase('questions')
      }
    })()
    return () => {
      mounted = false
    }
  }, [user])

  const currentQuestion = questions[index]
  const currentParam = useMemo(
    () => parameters.find((p) => p.id === currentQuestion?.parameter_id),
    [parameters, currentQuestion]
  )
  const progressPct = questions.length ? Math.round(((index + 1) / questions.length) * 100) : 0

  const selectAnswer = (value: number) => {
    if (!currentQuestion) return
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
    if (session) api.saveAnswer(session.id, currentQuestion.id, value).catch(() => {})
  }

  const goNext = async () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1)
      return
    }
    if (!session) return
    setPhase('completing')
    const { overall: computedOverall, byParameter } = computeScores(answers, questions, parameters)
    await api.completeAssessmentSession(session.id, computedOverall, byParameter)
    const map: Record<string, number> = {}
    for (const p of byParameter) map[p.parameterId] = p.score
    setOverall(computedOverall)
    setScoresByParamId(map)
    setTimeout(() => setPhase('results'), 1400)
  }

  const goPrev = () => setIndex((i) => Math.max(0, i - 1))

  if (phase === 'loading') {
    return <div className="text-sm text-dark/50">Preparing your assessment…</div>
  }

  if (phase === 'completing') {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="mx-auto flex items-center justify-center rounded-full bg-sage/15" style={{ width: 64, height: 64 }}>
          <CheckCircle2 size={30} className="text-sage" />
        </div>
        <h2 className="mt-6 text-xl font-medium text-dark">Great work!</h2>
        <p className="mt-2 text-sm text-dark/60">We're analyzing your responses to build your leadership profile.</p>
        <ul className="mt-6 space-y-2 text-sm text-dark/70 text-left inline-block">
          <li>✓ Calculating your score</li>
          <li>✓ Identifying strengths</li>
          <li>✓ Finding focus areas</li>
          <li>✓ Creating your plan</li>
        </ul>
      </div>
    )
  }

  if (phase === 'results') {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-light text-dark">Your Leadership Profile</h1>
        <div className="mt-6 rounded-2xl bg-white border border-dark/10 p-6">
          <LeadershipProfileRadar parameters={parameters} scoresByParamId={scoresByParamId} />
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-dark/50">Overall Score</p>
              <p className="text-3xl font-light text-dark">
                {overall} <span className="text-base text-dark/50">/100</span>
              </p>
            </div>
            <Link
              to="/app"
              className="rounded-lg bg-dark text-white px-5 py-2.5 text-sm tracking-[0.1em] uppercase hover:opacity-90"
            >
              View Dashboard →
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {parameters.map((p) => (
            <div key={p.id} className="rounded-xl bg-white border border-dark/10 p-3">
              <p className="text-xs text-dark/50 truncate">{p.name}</p>
              <p className="text-lg font-medium text-dark">{scoresByParamId[p.id] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return <div className="text-sm text-dark/50">No assessment questions configured yet.</div>
  }

  return (
    <div className="max-w-xl mx-auto">
      <p className="text-xs uppercase tracking-[0.15em] text-dark/40">
        Question {index + 1} of {questions.length}
      </p>

      {/* 12-parameter tracker */}
      <div className="mt-4 grid grid-cols-6 sm:grid-cols-12 gap-2">
        {parameters.map((p) => (
          <div
            key={p.id}
            title={p.name}
            className={`h-1.5 rounded-full ${p.id === currentParam?.id ? 'bg-dark' : 'bg-dark/10'}`}
          />
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white border border-dark/10 p-8">
        <p className="text-xs uppercase tracking-[0.15em] text-sage">{currentParam?.name}</p>
        <h2 className="mt-3 text-xl text-dark leading-snug">{currentQuestion.prompt}</h2>

        <div className="mt-6 space-y-3">
          {LIKERT_LABELS.map((opt) => {
            const selected = answers[currentQuestion.id] === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => selectAnswer(opt.value)}
                className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-sm text-left transition-colors ${
                  selected
                    ? 'border-dark bg-dark text-white'
                    : 'border-dark/15 text-dark hover:border-dark/40'
                }`}
              >
                <span
                  className={`rounded-full border flex items-center justify-center ${
                    selected ? 'border-white' : 'border-dark/30'
                  }`}
                  style={{ width: 16, height: 16 }}
                >
                  {selected && <span className="rounded-full bg-white" style={{ width: 8, height: 8 }} />}
                </span>
                {opt.label}
              </button>
            )
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="text-sm text-dark/60 disabled:opacity-30 hover:text-dark"
          >
            Previous
          </button>
          <button
            onClick={goNext}
            disabled={!answers[currentQuestion.id]}
            className="rounded-lg bg-dark text-white px-6 py-2.5 text-sm tracking-[0.1em] uppercase disabled:opacity-30 hover:opacity-90"
          >
            {index === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>

      <div className="mt-4 h-1 rounded-full bg-dark/10 overflow-hidden">
        <div
          className="h-full bg-sage transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  )
}
