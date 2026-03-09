'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import './login.css'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Invalid email or password')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      if (data.user.role === 'ADMIN') router.push('/admin')
      else if (data.user.role === 'SALES') router.push('/sales_user')
      else router.push('/login')
    } catch {
      setError('Unable to connect to server. Please ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-box">
        <div className="login-header">
          <h1 className="login-title">Sales Dashboard</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {error && <p className="login-error">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <span className="field-icon">✉</span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <span className="field-icon">🔒</span>
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-pw"
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? '👁' : '👁‍🗨'}
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <span className="spinner" />
            ) : (
              <>Login →</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
