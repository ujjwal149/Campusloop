import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Register() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleRegister(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.get('email').trim(),
        password: formData.get('password'),
        options: {
          data: {
            name: formData.get('name').trim(),
            college: formData.get('college').trim(),
            department: formData.get('department').trim(),
            year: Number(formData.get('year')),
          },
        },
      })

      if (error) {
        throw error
      }

      setMessage(
        data.session
          ? 'Account created! You are signed in.'
          : 'Check your email for a confirmation link. If you already have an account, sign in.'
      )

      form.reset()
    } catch (error) {
      setError(error.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <section className="register-card">
        <h1>Join CampusLoop</h1>
        <p>Borrow and lend with students on your campus.</p>

        <form onSubmit={handleRegister}>
          <fieldset disabled={loading}>
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              placeholder="Enter your name"
              required
            />

            <label htmlFor="college">College</label>
            <input
              id="college"
              name="college"
              placeholder="Enter your college"
              required
            />

            <label htmlFor="department">Department</label>
            <input
              id="department"
              name="department"
              placeholder="e.g. Computer Science"
              required
            />

            <label htmlFor="year">Year</label>
            <select id="year" name="year" defaultValue="" required>
              <option value="" disabled>Select your year</option>
              {[1, 2, 3, 4, 5, 6].map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>

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
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength={8}
              required
            />

            <button type="submit">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </fieldset>

          {error && <p className="error-message" role="alert">{error}</p>}
          {message && <p className="success-message" role="status">{message}</p>}
        </form>
      </section>
    </main>
  )
}

export default Register