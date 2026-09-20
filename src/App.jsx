import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Register from './pages/Register'
import Login from './pages/Login'
import Home from './pages/Home'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState('login')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    let authEventReceived = false

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!active) return

        authEventReceived = true
        setSession(nextSession)
        setError('')
        setLoading(false)
      })

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (!active || authEventReceived) return
        if (error) throw error

        setSession(data.session)
        setLoading(false)
      } catch (error) {
        if (!active || authEventReceived) return

        setError(error.message || 'Unable to load your session.')
        setLoading(false)
      }
    }

    loadSession()

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <p className="page-message" role="status">Loading CampusLoop…</p>
  }

  if (error) {
    return (
      <main className="register-page">
        <section className="register-card">
          <p className="error-message" role="alert">{error}</p>
          <button onClick={() => window.location.reload()}>
            Try again
          </button>
        </section>
      </main>
    )
  }

  if (session) {
    return <Home user={session.user} />
  }

  return (
    <>
      <nav className="auth-nav" aria-label="Account">
        <strong>CampusLoop</strong>

        <div>
          <button
            onClick={() => setPage('login')}
            aria-pressed={page === 'login'}
          >
            Sign in
          </button>

          <button
            onClick={() => setPage('register')}
            aria-pressed={page === 'register'}
          >
            Create account
          </button>
        </div>
      </nav>

      {page === 'login' ? <Login /> : <Register />}
    </>
  )
}

export default App