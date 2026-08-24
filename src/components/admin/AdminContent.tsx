import { FormEvent, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import * as api from '@/lib/api'
import type { ContentItem, Parameter } from '@/lib/database.types'
import { CONTENT_CATEGORY_LABELS } from '@/lib/constants'

const CATEGORIES = Object.keys(CONTENT_CATEGORY_LABELS)
const STAGES = ['reset', 'learn', 'practice', 'reflect'] as const

const emptyForm = {
  title: '',
  category: CATEGORIES[0],
  practice_stage: 'learn' as (typeof STAGES)[number],
  description: '',
  video_url: '',
  duration_minutes: 5,
  target_parameter_id: '',
  min_score: 0,
  max_score: 100,
}

export function AdminContent() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<ContentItem[]>([])
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const [c, p] = await Promise.all([api.getContentLibrary(), api.getParameters()])
    setItems(c)
    setParameters(p)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await api.adminUpsertContentItem({
      title: form.title,
      category: form.category as ContentItem['category'],
      practice_stage: form.practice_stage,
      description: form.description || null,
      video_url: form.video_url || null,
      duration_minutes: Number(form.duration_minutes),
      target_parameter_id: form.target_parameter_id || null,
      min_score: Number(form.min_score),
      max_score: Number(form.max_score),
      active: true,
      sort_order: items.length + 1,
    })
    setForm(emptyForm)
    setSaving(false)
    await load()
  }

  const toggleActive = async (item: ContentItem) => {
    await api.adminUpsertContentItem({ id: item.id, active: !item.active })
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: !i.active } : i)))
  }

  const remove = async (id: string) => {
    await api.adminDeleteContentItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  if (loading) return <div className="text-sm text-dark/50">Loading content library…</div>

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-light text-dark">Content Library</h1>
      <p className="text-dark/60 mt-1">
        Manage the videos and exercises recommended in the 15-minute practice.
      </p>

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl bg-white border border-dark/10 p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs uppercase tracking-[0.1em] text-dark/40 mb-1">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-dark/15 px-3 py-2 text-sm text-dark outline-none focus:border-dark/40"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.1em] text-dark/40 mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-lg border border-dark/15 px-3 py-2 text-sm text-dark outline-none focus:border-dark/40"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CONTENT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.1em] text-dark/40 mb-1">Practice Stage</label>
          <select
            value={form.practice_stage}
            onChange={(e) => setForm({ ...form, practice_stage: e.target.value as typeof form.practice_stage })}
            className="w-full rounded-lg border border-dark/15 px-3 py-2 text-sm text-dark outline-none focus:border-dark/40"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs uppercase tracking-[0.1em] text-dark/40 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full rounded-lg border border-dark/15 px-3 py-2 text-sm text-dark outline-none focus:border-dark/40"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.1em] text-dark/40 mb-1">Video URL (optional)</label>
          <input
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            className="w-full rounded-lg border border-dark/15 px-3 py-2 text-sm text-dark outline-none focus:border-dark/40"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.1em] text-dark/40 mb-1">Duration (min)</label>
          <input
            type="number"
            min={1}
            value={form.duration_minutes}
            onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
            className="w-full rounded-lg border border-dark/15 px-3 py-2 text-sm text-dark outline-none focus:border-dark/40"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs uppercase tracking-[0.1em] text-dark/40 mb-1">
            Target Parameter (triggers recommendation when this is a focus area)
          </label>
          <select
            value={form.target_parameter_id}
            onChange={(e) => setForm({ ...form, target_parameter_id: e.target.value })}
            className="w-full rounded-lg border border-dark/15 px-3 py-2 text-sm text-dark outline-none focus:border-dark/40"
          >
            <option value="">None (general content)</option>
            {parameters.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-dark text-white px-6 py-2.5 text-sm tracking-[0.1em] uppercase hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Add Content Item'}
          </button>
        </div>
      </form>

      <div className="mt-6 rounded-2xl bg-white border border-dark/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-dark/[0.03] text-left text-xs uppercase tracking-[0.05em] text-dark/50">
            <tr>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Stage</th>
              <th className="px-5 py-3">Min</th>
              <th className="px-5 py-3">Active</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-dark/5">
                <td className="px-5 py-3 text-dark">{item.title}</td>
                <td className="px-5 py-3 text-dark/70">{CONTENT_CATEGORY_LABELS[item.category] ?? item.category}</td>
                <td className="px-5 py-3 text-dark/70">{item.practice_stage}</td>
                <td className="px-5 py-3 text-dark/70">{item.duration_minutes}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`rounded-full px-3 py-1 text-xs uppercase border ${
                      item.active ? 'bg-sage/20 text-sage border-sage/30' : 'border-dark/15 text-dark/40'
                    }`}
                  >
                    {item.active ? 'Active' : 'Hidden'}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <button onClick={() => remove(item.id)} className="text-dark/30 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
