import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const { data } = await api.get('/api/facilities')
        setFacilities(data)
      } catch (err) {
        setError('Failed to load facilities. Please try again later.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchFacilities()
  }, [])

  return (
    <div className="facilities-page">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="UniReserver home">
          <img className="brand-logo" src="/logo.png" alt="UniReserver logo" />
        </Link>
        <div className="nav-links">
           <Link className="nav-link" to="/dashboard">Dashboard</Link>
        </div>
      </header>

      <main className="container">
        <section className="hero-section">
          <p className="eyebrow">Available Resources</p>
          <h1>Campus Facilities</h1>
          <p className="subtitle">
            Explore and book classrooms, labs, and equipment for your academic needs.
          </p>
        </section>

        {loading ? (
          <div className="loading">Loading facilities...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="facilities-grid">
            {facilities.length > 0 ? (
              facilities.map((facility) => (
                <div key={facility.id} className="facility-card">
                  {facility.imageUrl && (
                    <img src={facility.imageUrl} alt={facility.name} className="facility-image" />
                  )}
                  <div className="facility-info">
                    <h3>{facility.name}</h3>
                    <p className="facility-type">{facility.type}</p>
                    <p className="facility-location">{facility.location}</p>
                    <p className="facility-capacity">Capacity: {facility.capacity}</p>
                    <button className="primary-btn">Book Now</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No facilities available at the moment.</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default FacilitiesPage
