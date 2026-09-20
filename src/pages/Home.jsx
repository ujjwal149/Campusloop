import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Home({ user }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogout() {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signOut({
        scope: 'local',
      })

      if (error) {
        throw error
      }
    } catch (error) {
      setError(error.message || 'Unable to sign out. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <h1>Welcome to CampusLoop</h1>
        <p>You are signed in as:</p>
        <p>{user.email}</p>

        <button onClick={handleLogout} disabled={loading}>
          {loading ? 'Signing out…' : 'Sign out'}
        </button>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  )
}

export default Home