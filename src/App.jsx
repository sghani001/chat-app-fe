import { useState, useEffect } from 'react'
import AuthPage from './pages/AuthPage'
import ChatApp from './pages/ChatApp'
import { useAuth } from './hooks/useAuth'
import './App.css'

function App() {
  const { user, loading, login, register, logout } = useAuth()
  const [view, setView] = useState('auth')

  useEffect(() => {
    if (!loading) setView(user ? 'app' : 'auth')
  }, [user, loading])

  if (loading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loading-spinner" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (view === 'app' && user) {
    return <ChatApp user={user} onLogout={() => { logout(); setView('auth') }} />
  }

  return (
    <AuthPage
      onAuth={async (mode, creds) => {
        if (mode === 'login') {
          await login(creds.username, creds.password)
        } else {
          await register(creds.name, creds.username, creds.email, creds.password)
        }
        setView('app')
      }}
    />
  )
}

export default App
