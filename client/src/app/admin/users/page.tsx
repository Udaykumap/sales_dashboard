'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DataTable from '@/components/DataTable'

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SALES' })
  const [error, setError] = useState('')

  const loadData = async () => {
    try {
      const res = await apiFetch('/api/users')
      if (res.ok) { const d = await res.json(); setUsers(d.users || []) }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    try {
      const res = await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(form) })
      const d = await res.json()
      if (!res.ok) { setError(d.message || d.error || 'Failed to create user'); return }
      setForm({ name: '', email: '', password: '', role: 'SALES' }); setShowForm(false); loadData()
    } catch (e: any) { setError(e.message) }
  }

  if (loading) return <div className="loader"><span className="spinner" /> Loading users...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <button onClick={() => { setShowForm(!showForm); setError('') }} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>Create User</h3>
          {error && <p className="form-error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              <input className="input" placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              <select className="select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="SALES">Sales User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create User</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        className="user-table"
        columns={[
          { key: 'name', label: 'Name', render: (r) => <span className="bold">{r.name}</span> },
          { key: 'email', label: 'Email' },
          { key: 'role', label: 'Role', render: (r) => (
            <span className={`badge ${r.role === 'ADMIN' ? 'badge-purple' : 'badge-blue'}`}>{r.role}</span>
          )},
          { key: 'createdAt', label: 'Created', render: (r) => new Date(r.createdAt).toLocaleDateString() },
        ]}
        data={users}
        emptyText="No users found"
      />
    </div>
  )
}
