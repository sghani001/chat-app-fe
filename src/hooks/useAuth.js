import { useState, useEffect, useCallback } from 'react'
import { apiJson, getToken, setToken, clearToken } from '../lib/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (getToken()) {
      apiJson('/auth/me')
        .then(data => setUser(data))
        .catch(() => clearToken())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await apiJson('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (name, username, email, password) => {
    const data = await apiJson('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, email, password })
    })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return { user, loading, login, register, logout }
}
