import { useState } from 'react'
import { supabase } from '../lib/supabase'

function BorrowRequestForm({ resource, user, onClose }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Use the student's local date for the date picker.
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')

    if (startDate < today || endDate < startDate) {
      setError('Choose valid borrowing and return dates.')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('borrow_requests')
        .insert({
          resource_id: resource.id,
          borrower_id: user.id,
          start_date: startDate,
          end_date: endDate,
        })

      if (error) {
        if (error.code === '23505') {
          throw new Error('You already have an open request for this item.')
        }

        if (error.code === '42501') {
          throw new Error(
            'This request is not allowed. Refresh to check availability and try again.'
          )
        }

        throw error
      }

      setSubmitted(true)
    } catch (error) {
      setError(error.message || 'Unable to send your request.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="borrow-form">
        <p className="success-message" role="status">
          Request sent! It is pending the owner's approval.
        </p>

        <button type="button" onClick={onClose}>
          Done
        </button>
      </div>
    )
  }

  return (
    <form className="borrow-form" onSubmit={handleSubmit}>
      <h4>Borrow {resource.name}</h4>

      <fieldset disabled={loading}>
        <label>
          Borrowing date
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(event) => {
              const date = event.target.value
              setStartDate(date)

              if (endDate && endDate < date) {
                setEndDate('')
              }
            }}
            required
          />
        </label>

        <label>
          Expected return date
          <input
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={(event) => setEndDate(event.target.value)}
            required
          />
        </label>

        <p className="field-help">
          Sending a request does not reserve the item.
          The owner must accept it first.
        </p>

        <div className="borrow-actions">
          <button type="submit">
            {loading ? 'Sending…' : 'Send request'}
          </button>

          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </fieldset>

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}

export default BorrowRequestForm