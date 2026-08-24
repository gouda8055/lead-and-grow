import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import * as api from '@/lib/api'
import type { Parameter, Question } from '@/lib/database.types'

export function AdminQuestions() {
  const [loading, setLoading] = useState(true)
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [openParamId, setOpenParamId] = useState<string | null>(null)

  const load = async () => {
    const [params, qs] = await Promise.all([api.getParameters(), api.getQuestions()])
    setParameters(params)
    setQuestions(qs)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const updateParamField = (id: string, field: 'name' | 'description', value: string) => {
    setParameters((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const saveParam = async (p: Parameter) => {
    await api.adminUpsertParameter({ id: p.id, name: p.name, description: p.description })
  }

  const updateQuestionPrompt = (id: string, prompt: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, prompt } : q)))
  }

  const saveQuestion = async (q: Question) => {
    await api.adminUpsertQuestion({ id: q.id, prompt: q.prompt, sort_order: q.sort_order, active: q.active })
  }

  const addQuestion = async (parameterId: string) => {
    const count = questions.filter((q) => q.parameter_id === parameterId).length
    await api.adminUpsertQuestion({
      parameter_id: parameterId,
      prompt: 'New question — edit me',
      sort_order: count + 1,
      active: true,
    })
    await load()
  }

  const removeQuestion = async (id: string) => {
    await api.adminDeleteQuestion(id)
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  if (loading) return <div className="text-sm text-dark/50">Loading assessment builder…</div>

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-light text-dark">Assessment Builder</h1>
      <p className="text-dark/60 mt-1">Manage the 12 leadership parameters and their assessment questions.</p>

      <div className="mt-6 space-y-3">
        {parameters.map((p) => {
          const paramQuestions = questions.filter((q) => q.parameter_id === p.id)
          const isOpen = openParamId === p.id
          return (
            <div key={p.id} className="rounded-2xl bg-white border border-dark/10 overflow-hidden">
              <button
                onClick={() => setOpenParamId(isOpen ? null : p.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-dark">{p.name}</p>
                  <p className="text-xs text-dark/40">{paramQuestions.length} questions</p>
                </div>
                <span className="text-xs text-dark/40">{isOpen ? 'Hide' : 'Edit'}</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-dark/5 pt-4 space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-dark/40 mb-1">Name</label>
                    <input
                      value={p.name}
                      onChange={(e) => updateParamField(p.id, 'name', e.target.value)}
                      onBlur={() => saveParam(p)}
                      className="w-full rounded-lg border border-dark/15 px-3 py-2 text-sm text-dark outline-none focus:border-dark/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-dark/40 mb-1">Description</label>
                    <textarea
                      value={p.description ?? ''}
                      onChange={(e) => updateParamField(p.id, 'description', e.target.value)}
                      onBlur={() => saveParam(p)}
                      rows={2}
                      className="w-full rounded-lg border border-dark/15 px-3 py-2 text-sm text-dark outline-none focus:border-dark/40"
                    />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-dark/40 mb-2">Questions</p>
                    <div className="space-y-2">
                      {paramQuestions.map((q) => (
                        <div key={q.id} className="flex items-center gap-2">
                          <input
                            value={q.prompt}
                            onChange={(e) => updateQuestionPrompt(q.id, e.target.value)}
                            onBlur={() => saveQuestion(q)}
                            className="flex-1 rounded-lg border border-dark/15 px-3 py-2 text-sm text-dark outline-none focus:border-dark/40"
                          />
                          <button
                            onClick={() => removeQuestion(q.id)}
                            className="text-dark/30 hover:text-red-600"
                            aria-label="Delete question"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addQuestion(p.id)}
                      className="mt-3 inline-flex items-center gap-1 text-xs text-dark/60 hover:text-dark"
                    >
                      <Plus size={14} /> Add question
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
