import { useState } from 'react'
import { supabase } from '../lib/supabase'

function AddResource({ user, onBack, resourceToEdit = null  }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const isEditing = resourceToEdit !== null

  async function handleSubmit(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const resource = {
        owner_id: user.id,
        name: formData.get('name').trim(),
        description: formData.get('description').trim(),
        category: formData.get('category'),
        condition: formData.get('condition'),
        deposit: Number(formData.get('deposit') || 0),
        pickup_location: formData.get('pickup_location').trim(),
        image_url: formData.get('image_url').trim() || null,
        is_available: formData.get('is_available') === 'on',
      }

      if (!resource.name || !resource.pickup_location) {
        throw new Error('Please enter an item name and pickup location.')
      }

      if (
        resource.image_url &&
        !/^https?:\/\//i.test(resource.image_url)
      ) {
        throw new Error('The image URL must start with http:// or https://.')
      }

      if (isEditing) {
 
        const changes = {
          name: resource.name,
          description: resource.description,
          category: resource.category,
          condition: resource.condition,
          deposit: resource.deposit,
          pickup_location: resource.pickup_location,
          image_url: resource.image_url,
          is_available: resource.is_available,
        }
  
        const { data, error } = await supabase
          .from('resources')
          .update(changes)
          .eq('id', resourceToEdit.id)
          .eq('owner_id', user.id)
          .select('id')
  
        if (error) throw error
  
        if (data.length === 0) {
          throw new Error('The item was not updated. Refresh and try again.')
        }
  
        onBack()
      } else {
        const { error } = await supabase
          .from('resources')
          .insert(resource)
      
        if (error) throw error
      
        form.reset()
        setMessage('Your resource has been listed successfully!')
      }
    } catch (error) {
      setError(error.message || 'Unable to add this resource.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
          disabled={loading}
        >
          ← Back to home
        </button>

        <h1>{isEditing ? 'Edit resource' : 'List a resource'}</h1>
        <p>
          {isEditing
            ? 'Update your item details below.'
            : 'Share something useful with your campus.'}
        </p>
        <p>Share something useful with your campus.</p>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={loading}>
            <label htmlFor="name">Item name</label>
                <input
                  id="name"
                  name="name"
                  defaultValue={resourceToEdit?.name ?? ''}
                  maxLength={100}
                  required
                />
                        
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  defaultValue={resourceToEdit?.description ?? ''}
                  rows={3}
                  maxLength={2000}
                />
                        
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  defaultValue={resourceToEdit?.category ?? ''}
                  required
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Books">Books</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Lab Equipment">Lab Equipment</option>
                  <option value="Project Components">Project Components</option>
                  <option value="Sports">Sports</option>
                  <option value="Other">Other</option>
                </select>
                        
                <label htmlFor="condition">Condition</label>
                <select
                  id="condition"
                  name="condition"
                  defaultValue={resourceToEdit?.condition ?? 'Good'}
                  required
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
                        
                <label htmlFor="deposit">Refundable deposit (₹)</label>
                <input
                  id="deposit"
                  name="deposit"
                  type="number"
                  min="0"
                  max="99999999.99"
                  step="0.01"
                  defaultValue={resourceToEdit?.deposit ?? 0}
                  required
                />
                        
                <label htmlFor="pickup_location">Pickup location</label>
                <input
                  id="pickup_location"
                  name="pickup_location"
                  defaultValue={resourceToEdit?.pickup_location ?? ''}
                  maxLength={200}
                  required
                />
                        
                <label htmlFor="image_url">Image URL (optional)</label>
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  defaultValue={resourceToEdit?.image_url ?? ''}
                />
                        
                <label className="checkbox-label">
                  <input
                    name="is_available"
                    type="checkbox"
                    defaultChecked={resourceToEdit?.is_available ?? true}
                  />
                  Available for borrowing
                </label>

            <button type="submit">
              {loading ? 'Saving…' : isEditing ? 'Save changes' : 'List resource'}
            </button>
          </fieldset>

          {error && (
            <p className="error-message" role="alert">{error}</p>
          )}

          {message && (
            <p className="success-message" role="status">{message}</p>
          )}
        </form>
      </section>
    </main>
  )
}

export default AddResource