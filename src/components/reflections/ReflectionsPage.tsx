import { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'
import type { Reflection } from '@/lib/database.types'

const MOOD_EMOJI: Record<string, string> = { great: '😄', good: '🙂', okay: '😐', low: '😔' }

export function ReflectionsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [reflections, setReflections] = useState<Reflection[]>([])

  useEffect(() => {
    if (!user) return
    let mounted = true
    api.getReflections(user.id).then((r) => {
      if (mounted) {
        setReflections(r)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [user])

  if (loading) return <div className="text-sm text-dark/50">Loading reflections…</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-light text-dark">Reflections &amp; Journal</h1>
      <p className="text-dark/60 mt-1">Your daily reflections, captured at the end of each practice.</p>

      {reflections.length === 0 && (
        <div className="mt-8 flex flex-col items-center text-center text-dark/50 py-16">
          <BookOpen size={32} />
          <p className="mt-3 text-sm">No reflections yet. Complete a daily practice to add your first one.</p>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {reflections.map((r) => (
          <div key={r.id} className="rounded-2xl bg-white border border-dark/10 p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.1em] text-dark/40">
                {new Date(r.reflection_date).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
              {r.mood && <span className="text-lg">{MOOD_EMOJI[r.mood]}</span>}
            </div>
            {r.prompt && <p className="mt-3 text-sm text-dark/50 italic">{r.prompt}</p>}
            {r.response && <p className="mt-2 text-sm text-dark">{r.response}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
