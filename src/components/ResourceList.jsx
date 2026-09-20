import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const categories = [
  'Books',
  'Electronics',
  'Lab Equipment',
  'Project Components',
  'Sports',
  'Other',
]

function ResourceList({ user }) {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [availableOnly, setAvailableOnly] = useState(false)

  useEffect(() => {
    let active = true

    async function loadResources() {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (active) {
          setResources(data)
        }
      } catch (error) {
        if (active) {
          setError(error.message || 'Unable to load resources.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadResources()

    return () => {
      active = false
    }
  }, [])

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name
      .toLowerCase()
      .includes(search.trim().toLowerCase())

    const matchesCategory =
      category === '' || resource.category === category

    const matchesAvailability =
      !availableOnly || resource.is_available

    return matchesSearch && matchesCategory && matchesAvailability
  })

  if (loading) {
    return <p role="status">Loading campus resources…</p>
  }

  if (error) {
    return <p className="error-message" role="alert">{error}</p>
  }

  return (
    <section aria-labelledby="resources-title">
      <h2 id="resources-title">Explore your campus</h2>
      <p>Find something useful from students around you.</p>

      <div className="resource-filters">
        <div>
          <label htmlFor="search">Search items</label>
          <input
            id="search"
            type="search"
            placeholder="Search calculators, books…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="category-filter">Category</label>
          <select
            id="category-filter"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={availableOnly}
            onChange={(event) => setAvailableOnly(event.target.checked)}
          />
          Available only
        </label>
      </div>

      {filteredResources.length === 0 ? (
        <p>
          {resources.length === 0
            ? 'No resources yet. Be the first to list one!'
            : 'No items match your filters.'}
        </p>
      ) : (
        <div className="resource-grid">
          {filteredResources.map((resource) => (
            <article className="resource-card" key={resource.id}>
              <div className="resource-image">
                {resource.image_url ? (
                  <img
                    src={resource.image_url}
                    alt={resource.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <span>No photo added</span>
                )}
              </div>

              <div className="resource-details">
                <div className="resource-badges">
                  <span className="badge">{resource.category}</span>
                  <span
                    className={`badge ${
                      resource.is_available ? 'available' : 'unavailable'
                    }`}
                  >
                    {resource.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                <h3>{resource.name}</h3>
                <p>{resource.description || 'No description added.'}</p>

                <p><strong>Condition:</strong> {resource.condition}</p>
                <p><strong>Pickup:</strong> {resource.pickup_location}</p>

                <p className="deposit">
                  {Number(resource.deposit) === 0
                    ? 'No deposit'
                    : `${Number(resource.deposit).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      })} refundable deposit`}
                </p>

                {resource.owner_id === user.id && (
                  <span className="owner-label">Your listing</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default ResourceList