import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar />
      <main className="flex-1 min-w-0 px-5 sm:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
