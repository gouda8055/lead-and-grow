import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardCheck,
  PlayCircle,
  ListTodo,
  LineChart,
  BookOpen,
  LibraryBig,
  Trophy,
  Settings,
  LogOut,
  Flower2,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const ITEMS = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/app/assessment', label: 'Assessment', icon: ClipboardCheck, end: false },
  { to: '/app/practice', label: 'Practice', icon: PlayCircle, end: false },
  { to: '/app/plan', label: 'My Plan', icon: ListTodo, end: false },
  { to: '/app/progress', label: 'Progress', icon: LineChart, end: false },
  { to: '/app/reflections', label: 'Reflections', icon: BookOpen, end: false },
  { to: '/app/resources', label: 'Resources', icon: LibraryBig, end: false },
  { to: '/app/achievements', label: 'Achievements', icon: Trophy, end: false },
  { to: '/app/settings', label: 'Settings', icon: Settings, end: false },
] as const

export function Sidebar() {
  const { profile, isAdmin, signOut } = useAuth()

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 bg-dark text-white/80 min-h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 pt-8 pb-6">
        <Flower2 size={20} className="text-sage" />
        <span className="text-sm tracking-[0.2em] uppercase text-white">Lead &amp; Grow</span>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors mt-4 border-t border-white/10 pt-4 ${
                isActive ? 'bg-white/10 text-white' : 'text-sand hover:text-white hover:bg-white/5'
              }`
            }
          >
            <ShieldCheck size={17} />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="px-3 pb-6">
        <div className="px-3 py-3 mb-2 text-xs text-white/50 truncate">
          {profile?.full_name || profile?.email}
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors"
        >
          <LogOut size={17} />
          Log Out
        </button>
      </div>
    </aside>
  )
}
