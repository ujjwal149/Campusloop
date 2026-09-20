import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function RequestsPanel({ user, onRequestChanged }) {
  const [requests, setRequests] = useState([])
  const [tab, setTab] = useState('borrowing')
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)

  useEffect(() => {
    let active = true

    async function loadRequests() {
      try {
        const { data, error } = await supabase
          .from('borrow_requests')
          .select(`
            id,
            borrower_id,
            start_date,
            end_date,
            status,
            resource:resources (
              id,
              name,
              owner_id,
              pickup_location
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (active) {
          setRequests(data)
        }
      } catch (error) {
        if (active) {
          setError(error.message || 'Unable to load requests.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadRequests()

    return () => {
      active = false
    }
  }, [user.id, refreshCount])

  async function respond(requestId, decision) {
    setBusyId(requestId)
    setError('')
    setMessage('')

    try {
      const { data: newStatus, error } = await supabase.rpc(
        'respond_to_borrow_request',
        {
          request_id: requestId,
          decision,
        }
      )

      if (error) throw error

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, status: newStatus }
            : request
        )
      )

      setMessage(
        newStatus === 'Reserved'
          ? 'Request accepted. The item is now reserved.'
          : 'Request rejected.'
      )

      onRequestChanged()
    } catch (error) {
      setError(error.message || 'Unable to update this request.')
    } finally {
      setBusyId(null)
    }
  }

  function refreshRequests() {
    setLoading(true)
    setError('')
    setMessage('')
    setRefreshCount((count) => count + 1)
  }

  const visibleRequests = requests.filter((request) =>
    tab === 'borrowing'
      ? request.borrower_id === user.id
      : request.resource?.owner_id === user.id
  )

  function formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN')
  }

  return (
    <section className="requests-panel">
      <h2>Borrowing requests</h2>

      <div className="request-tabs">
        <button
          onClick={() => setTab('borrowing')}
          aria-pressed={tab === 'borrowing'}
        >
          My borrowing
        </button>

        <button
          onClick={() => setTab('incoming')}
          aria-pressed={tab === 'incoming'}
        >
          Incoming requests
        </button>

        <button
          onClick={refreshRequests}
          disabled={loading || busyId !== null}
        >
          Refresh requests
        </button>
      </div>

      {error && (
        <p className="error-message" role="alert">{error}</p>
      )}

      {message && (
        <p className="success-message" role="status">{message}</p>
      )}

      {loading ? (
        <p role="status">Loading requests…</p>
      ) : visibleRequests.length === 0 ? (
        <p>No requests here yet.</p>
      ) : (
        <div className="requests-list">
          {visibleRequests.map((request) => (
            <article className="request-card" key={request.id}>
              <h3>{request.resource?.name || 'Resource unavailable'}</h3>

              <span className="badge">{request.status}</span>

              <p>
                <strong>Borrowing date:</strong>{' '}
                {formatDate(request.start_date)}
              </p>

              <p>
                <strong>Expected return:</strong>{' '}
                {formatDate(request.end_date)}
              </p>

              {request.resource && (
                <p>
                  <strong>Pickup:</strong>{' '}
                  {request.resource.pickup_location}
                </p>
              )}

              <p className="field-help">
                Request reference: {request.id.slice(0, 8)}
              </p>

              {tab === 'incoming' && request.status === 'Pending' && (
                <div className="request-actions">
                  <button
                    disabled={busyId !== null}
                    onClick={() => respond(request.id, 'Reserved')}
                  >
                    {busyId === request.id ? 'Updating…' : 'Accept'}
                  </button>

                  <button
                    className="cancel-button"
                    disabled={busyId !== null}
                    onClick={() => respond(request.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default RequestsPanel