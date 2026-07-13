import { useState } from 'react'

function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onAuth(mode, { name, username, email, password })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span className="auth-logo-icon">&#9889;</span>
          </div>
          <h1>Nuro</h1>
          <p className="auth-subtitle">{mode === 'login' ? 'Welcome back' : 'Create your account'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="auth-field">
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />
            </div>
          )}
          <div className="auth-field">
            <label>{mode === 'login' ? 'Username or Email' : 'Username'}</label>
            <input value={username} onChange={e => setUsername(e.target.value)} placeholder={mode === 'login' ? 'Username or email' : 'Username'} required />
          </div>
          {mode === 'register' && (
            <div className="auth-field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
            </div>
          )}
          <div className="auth-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required minLength={6} />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <span>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</span>
          <button className="auth-switch" onClick={switchMode}>
            {mode === 'login' ? 'Register' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
