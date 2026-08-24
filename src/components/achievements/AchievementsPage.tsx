import { useEffect, useState } from 'react'
import { Flame, Clipboard, Timer, BookOpen, Trophy, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'
import type { Achievement, UserAchievement } from '@/lib/database.types'

const ICONS: Record<string, typeof Flame> = {
  flame: Flame,
  clipboard: Clipboard,
  timer: Timer,
  'book-open': BookOpen,
  trophy: Trophy,
}

export function AchievementsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [earned, setEarned] = useState<UserAchievement[]>([])

  useEffect(() => {
    if (!user) return
    let mounted = true
    ;(async () => {
      const [all, mine] = await Promise.all([api.getAchievements(), api.getUserAchievements(user.id)])
      if (!mounted) return
      setAchievements(all)
      setEarned(mine)
      setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [user])

  if (loading) return <div className="text-sm text-dark/50">Loading achievements…</div>

  const earnedIds = new Set(earned.map((e) => e.achievement_id))

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-light text-dark">Achievements</h1>
      <p className="text-dark/60 mt-1">Your journey, your growth. Small daily actions, big leadership transformation.</p>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {achievements.map((a) => {
          const isEarned = earnedIds.has(a.id)
          const Icon = (a.icon && ICONS[a.icon]) || Trophy
          return (
            <div
              key={a.id}
              className={`rounded-2xl border p-5 text-center ${
                isEarned ? 'bg-white border-dark/10' : 'bg-dark/[0.03] border-dark/10 opacity-60'
              }`}
            >
              <div
                className={`mx-auto flex items-center justify-center rounded-full ${
                  isEarned ? 'bg-sand/30' : 'bg-dark/10'
                }`}
                style={{ width: 52, height: 52 }}
              >
                {isEarned ? <Icon size={22} className="text-dark" /> : <Lock size={18} className="text-dark/40" />}
              </div>
              <p className="mt-3 text-sm font-medium text-dark">{a.title}</p>
              <p className="mt-1 text-xs text-dark/50">{a.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
