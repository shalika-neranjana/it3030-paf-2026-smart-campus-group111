import { Link } from 'react-router-dom'

const HomePage = () => {
  return (
    <div className="landing-page">
      <header className="topbar">
        <a className="brand" href="#" aria-label="UniReserver home">
          <img className="brand-logo" src="/logo.png" alt="UniReserver logo" />
        </a>
        <Link className="login-btn" to="/login">
          Login
        </Link>
      </header>

      <main className="hero-section">
        <p className="eyebrow">University Resource Management System</p>
        <h1>Smarter Reservations for a Smarter Campus</h1>
        <p className="subtitle">
          Manage classrooms, labs, equipment, and campus spaces from one platform with secure identity,
          role-based experiences, and modern workflows.
        </p>

        <div className="hero-actions">
          <Link className="primary-btn" to="/register">
            Create Account
          </Link>
          <Link className="ghost-btn" to="/login">
            Continue to Login
          </Link>
        </div>

        <section className="feature-strip" aria-label="Key features">
          <article className="feature-card">
            <h2>Centralized Booking</h2>
            <p>Reserve spaces and resources without scheduling conflicts.</p>
          </article>
          <article className="feature-card">
            <h2>Real-Time Availability</h2>
            <p>Instantly see what is free and what is already occupied.</p>
          </article>
          <article className="feature-card">
            <h2>Role-Based Access</h2>
            <p>Different experiences for students, staff, and administrators.</p>
          </article>
        </section>
      </main>
    </div>
  )
}

export default HomePage
