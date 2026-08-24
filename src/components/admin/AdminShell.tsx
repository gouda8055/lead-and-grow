import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Users, ClipboardList, LibraryBig, BarChart3, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/questions', label: 'Assessment', icon: ClipboardList, end: false },
  { to: '/admin/content', label: 'Content Library', icon: LibraryBig, end: false },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, end: false },
] as const

export function AdminShell() {
  const { profile } = useAuth()

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 bg-forest text-white/80 min-h-screen sticky top-0">
        <div className="px-6 pt-8 pb-6">
          <span className="text-sm tracking-[0.2em] uppercase text-white">Admin Panel</span>
          <p className="mt-1 text-xs text-white/40">Lead &amp; Grow</p>
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
        </nav>

        <div className="px-3 pb-6">
          <div className="px-3 py-3 mb-2 text-xs text-white/50 truncate">{profile?.email}</div>
          <Link
            to="/app"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors"
          >
            <ArrowLeft size={17} />
            Back to App
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 px-5 sm:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
