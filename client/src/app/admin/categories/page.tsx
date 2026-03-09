'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DataTable from '@/components/DataTable'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [name, setName] = useState('')

  const loadData = async () => {
    try {
      const res = await apiFetch('/api/category')
      if (res.ok) setCategories(await res.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) await apiFetch(`/api/category/${editing.id}`, { method: 'PUT', body: JSON.stringify({ name }) })
      else await apiFetch('/api/category', { method: 'POST', body: JSON.stringify({ name }) })
      setName(''); setEditing(null); setShowForm(false); loadData()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await apiFetch(`/api/category/${id}`, { method: 'DELETE' }); loadData()
  }

  if (loading) return <div className="loader"><span className="spinner" /> Loading categories...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Categories</h1>
        <button onClick={() => { setEditing(null); setName(''); setShowForm(!showForm) }} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit Category' : 'Add Category'}</h3>
          <form onSubmit={handleSubmit} className="form-row">
            <input className="input" placeholder="Category Name" value={name} onChange={e => setName(e.target.value)} required style={{ flex: 1 }} />
            <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
          </form>
        </div>
      )}

      <DataTable
        className="product-table"
        columns={[
          { key: 'name', label: 'Name', render: (r) => <span className="bold">{r.name}</span> },
          { key: 'createdAt', label: 'Created', render: (r) => new Date(r.createdAt).toLocaleDateString() },
          { key: 'actions', label: 'Actions', render: (r) => (
            <div className="actions">
              <button onClick={() => { setEditing(r); setName(r.name); setShowForm(true) }} className="btn btn-sm btn-blue">Edit</button>
              <button onClick={() => handleDelete(r.id)} className="btn btn-sm btn-danger">Delete</button>
            </div>
          )}
        ]}
        data={categories}
        emptyText="No categories found"
      />
    </div>
  )
}
