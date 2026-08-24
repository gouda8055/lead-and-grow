import { FormEvent, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string } | null)?.from || '/app'

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-xs tracking-[0.2em] uppercase text-dark/60 hover:text-dark">
          ← Back
        </Link>
        <h1 className="mt-6 text-3xl font-light uppercase tracking-wide text-dark">Welcome back</h1>
        <p className="mt-2 text-sm text-dark/60">Sign in to continue your leadership journey.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-dark/60 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-dark/15 bg-white px-4 py-3 text-sm text-dark outline-none focus:border-dark/40"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-dark/60 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-dark/15 bg-white px-4 py-3 text-sm text-dark outline-none focus:border-dark/40"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-dark text-white py-3 text-sm tracking-[0.15em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-sm text-dark/60">
          New here?{' '}
          <Link to="/signup" className="text-dark underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
