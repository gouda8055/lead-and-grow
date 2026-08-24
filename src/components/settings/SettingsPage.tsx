import { FormEvent, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import * as api from '@/lib/api'

export function SettingsPage() {
  const { profile, user, refreshProfile, signOut } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaved(false)
    await api.updateProfile(user.id, { full_name: fullName })
    await refreshProfile()
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-light text-dark">Settings</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-dark/60 mb-2">Full name</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-dark/15 bg-white px-4 py-3 text-sm text-dark outline-none focus:border-dark/40"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-dark/60 mb-2">Email</label>
          <input
            value={profile?.email ?? ''}
            disabled
            className="w-full rounded-lg border border-dark/10 bg-dark/5 px-4 py-3 text-sm text-dark/60"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-dark text-white px-6 py-2.5 text-sm tracking-[0.1em] uppercase hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save Changes'}
        </button>
      </form>

      <div className="mt-10 pt-6 border-t border-dark/10">
        <button onClick={() => signOut()} className="text-sm text-red-600 hover:underline">
          Log out of Lead &amp; Grow
        </button>
      </div>
    </div>
  )
}
