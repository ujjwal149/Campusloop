import { useState } from 'react'
import { supabase } from '../lib/supabase'
import AddResource from './AddResource'
import ResourceList from '../components/ResourceList'

function Home({ user }) {
  const [showAddResource, setShowAddResource] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogout() {
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signOut({
        scope: 'local',
      })

      if (error) throw error
    } catch (error) {
      setError(error.message || 'Unable to sign out.')
    } finally {
      setLoading(false)
    }
  }

  if (showAddResource) {
    return (
      <AddResource
        user={user}
        onBack={() => setShowAddResource(false)}
      />
    )
  }

  return (
    <>
      <header className="auth-nav">
        <strong>CampusLoop</strong>

        <div>
          <button
            onClick={() => setShowAddResource(true)}
            disabled={loading}
          >
            + List a resource
          </button>

          <button onClick={handleLogout} disabled={loading}>
            {loading ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </header>

      <main className="home-page">
        <p className="signed-in-email">Signed in as {user.email}</p>

        {error && (
          <p className="error-message" role="alert">{error}</p>
        )}

        <ResourceList user={user} />
      </main>
    </>
  )
}

export default Home