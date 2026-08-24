import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as api from '@/lib/api'
import type { Profile } from '@/lib/database.types'

export function AdminUsers() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<Profile[]>([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    api.adminListUsers().then((u) => {
      setUsers(u)
      setLoading(false)
    })
  }, [])

  const toggleRole = async (u: Profile) => {
    const nextRole = u.role === 'admin' ? 'customer' : 'admin'
    await api.adminSetUserRole(u.id, nextRole)
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: nextRole } : x)))
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      (u.full_name ?? '').toLowerCase().includes(query.toLowerCase())
  )

  if (loading) return <div className="text-sm text-dark/50">Loading users…</div>

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-light text-dark">Users &amp; Customer Accounts</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email…"
        className="mt-4 w-full max-w-sm rounded-lg border border-dark/15 bg-white px-4 py-2.5 text-sm text-dark outline-none focus:border-dark/40"
      />

      <div className="mt-6 rounded-2xl bg-white border border-dark/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-dark/[0.03] text-left text-xs uppercase tracking-[0.05em] text-dark/50">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Stage</th>
              <th className="px-5 py-3">Streak</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-dark/5 hover:bg-dark/[0.02]">
                <td className="px-5 py-3">
                  <Link to={`/admin/users/${u.id}`} className="text-dark hover:underline">
                    {u.full_name || '—'}
                  </Link>
                </td>
                <td className="px-5 py-3 text-dark/70">{u.email}</td>
                <td className="px-5 py-3 text-dark/70">Stage {u.current_stage}</td>
                <td className="px-5 py-3 text-dark/70">{u.streak_count}d</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleRole(u)}
                    className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.05em] border ${
                      u.role === 'admin' ? 'bg-dark text-white border-dark' : 'border-dark/15 text-dark/60'
                    }`}
                  >
                    {u.role}
                  </button>
                </td>
                <td className="px-5 py-3 text-dark/50">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
