import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.get('email').trim(),
        password: formData.get('password'),
      })

      if (error) {
        throw error
      }
    } catch (error) {
      setError(error.message || 'Unable to sign in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <h1>Welcome back</h1>
        <p>Sign in to your CampusLoop account.</p>

        <form onSubmit={handleLogin}>
          <fieldset disabled={loading}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              required
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />

            <button type="submit">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </fieldset>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
        </form>
      </section>
    </main>
  )
}

export default Login