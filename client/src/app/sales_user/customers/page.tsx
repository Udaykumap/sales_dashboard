'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DataTable from '@/components/DataTable'

export default function SalesCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })

  const loadData = async () => {
    try {
      const res = await apiFetch('/api/customers?limit=100')
      if (res.ok) { const d = await res.json(); setCustomers(d.data || []) }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const resetForm = () => { setForm({ name: '', email: '', phone: '', address: '' }); setEditing(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) await apiFetch(`/api/customers/${editing.id}`, { method: 'PUT', body: JSON.stringify(form) })
      else await apiFetch('/api/customers', { method: 'POST', body: JSON.stringify(form) })
      resetForm(); loadData()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return
    await apiFetch(`/api/customers/${id}`, { method: 'DELETE' }); loadData()
  }

  const startEdit = (c: any) => {
    setForm({ name: c.name, email: c.email || '', phone: c.phone, address: c.address || '' })
    setEditing(c); setShowForm(true)
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  if (loading) return <div className="loader"><span className="spinner" /> Loading customers...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="btn btn-green">
          {showForm ? 'Cancel' : '+ Add Customer'}
        </button>
      </div>

      {showForm && (
        <div className="form-card customer-form">
          <h3>{editing ? 'Edit Customer' : 'Add Customer'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required />
              <input className="input" placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="input" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-green">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <input className="input search-input" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />

      <DataTable
        className="customer-table"
        columns={[
          { key: 'name', label: 'Name', render: (r) => <span className="bold">{r.name}</span> },
          { key: 'phone', label: 'Phone' },
          { key: 'email', label: 'Email', render: (r) => r.email || '—' },
          { key: 'address', label: 'Address', render: (r) => r.address || '—' },
          { key: 'actions', label: 'Actions', render: (r) => (
            <div className="actions">
              <button onClick={() => startEdit(r)} className="btn btn-sm btn-blue">Edit</button>
              <button onClick={() => handleDelete(r.id)} className="btn btn-sm btn-danger">Delete</button>
            </div>
          )}
        ]}
        data={filtered}
        emptyText="No customers found"
      />
    </div>
  )
}
