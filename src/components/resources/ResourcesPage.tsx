import { useEffect, useState } from 'react'
import * as api from '@/lib/api'
import type { ContentItem } from '@/lib/database.types'
import { CONTENT_CATEGORY_LABELS } from '@/lib/constants'

export function ResourcesPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<ContentItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    api.getContentLibrary().then((data) => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="text-sm text-dark/50">Loading resources…</div>

  const categories = Array.from(new Set(items.map((i) => i.category)))
  const filtered = activeCategory ? items.filter((i) => i.category === activeCategory) : items

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-light text-dark">Resources</h1>
      <p className="text-dark/60 mt-1">Yoga, breathwork, meditation, and leadership content for every stage.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.05em] border ${
            !activeCategory ? 'bg-dark text-white border-dark' : 'border-dark/15 text-dark/60'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-[0.05em] border ${
              activeCategory === c ? 'bg-dark text-white border-dark' : 'border-dark/15 text-dark/60'
            }`}
          >
            {CONTENT_CATEGORY_LABELS[c] ?? c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white border border-dark/10 p-5">
            <p className="text-xs uppercase tracking-[0.1em] text-sage">
              {CONTENT_CATEGORY_LABELS[item.category] ?? item.category}
            </p>
            <p className="mt-2 text-sm font-medium text-dark">{item.title}</p>
            <p className="mt-1 text-sm text-dark/60">{item.description}</p>
            <p className="mt-3 text-xs text-dark/40">{item.duration_minutes} min · {item.practice_stage}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
