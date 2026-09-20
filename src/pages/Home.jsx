import { useState } from 'react'
import { supabase } from '../lib/supabase'
import AddResource from './AddResource'
import ResourceList from '../components/ResourceList'
import RequestsPanel from '../components/RequestsPanel'

function Home({ user }) {
  const [showAddResource, setShowAddResource] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resourceToEdit, setResourceToEdit] = useState(null)
  const [resourcesVersion, setResourcesVersion] = useState(0)

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

  if (showAddResource || resourceToEdit) {
  return (
    <AddResource
      key={resourceToEdit?.id ?? 'new'}
      user={user}
      resourceToEdit={resourceToEdit}
      onBack={() => {
        setShowAddResource(false)
        setResourceToEdit(null)
      }}
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

        <RequestsPanel
          user={user}
          onRequestChanged={() => {
            setResourcesVersion((version) => version + 1)
          }}
        />
    
        <ResourceList
          key={resourcesVersion}
          user={user}
          onEdit={(resource) => setResourceToEdit(resource)}
        />
      </main>
    </>
  )
}

export default Home