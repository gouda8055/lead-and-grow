import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory px-6 text-center">
        <div className="max-w-sm">
          <h1 className="text-2xl font-light uppercase tracking-wide text-dark">Check your email</h1>
          <p className="mt-3 text-sm text-dark/60">
            We sent a confirmation link to {email}. Confirm your address, then sign in to begin your
            assessment.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 rounded-lg bg-dark text-white px-6 py-3 text-sm tracking-[0.15em] uppercase hover:opacity-90"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-xs tracking-[0.2em] uppercase text-dark/60 hover:text-dark">
          ← Back
        </Link>
        <h1 className="mt-6 text-3xl font-light uppercase tracking-wide text-dark">
          Begin your journey
        </h1>
        <p className="mt-2 text-sm text-dark/60">
          Create an account to take your leadership assessment.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.15em] text-dark/60 mb-2">
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-dark/15 bg-white px-4 py-3 text-sm text-dark outline-none focus:border-dark/40"
            />
          </div>
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
              minLength={6}
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
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-sm text-dark/60">
          Already have an account?{' '}
          <Link to="/login" className="text-dark underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
