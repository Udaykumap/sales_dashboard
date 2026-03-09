'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DataTable from '@/components/DataTable'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', sku: '', description: '', price: '', costPrice: '', categoryId: '' })

  const loadData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([apiFetch('/api/products'), apiFetch('/api/category')])
      if (pRes.ok) setProducts(await pRes.json())
      if (cRes.ok) setCategories(await cRes.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const resetForm = () => { setForm({ name: '', sku: '', description: '', price: '', costPrice: '', categoryId: '' }); setEditing(null); setShowForm(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = { ...form, price: parseFloat(form.price), costPrice: parseFloat(form.costPrice) }
    try {
      if (editing) await apiFetch(`/api/products/${editing.id}`, { method: 'PUT', body: JSON.stringify(body) })
      else await apiFetch('/api/products', { method: 'POST', body: JSON.stringify(body) })
      resetForm(); loadData()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return
    await apiFetch(`/api/products/${id}`, { method: 'DELETE' }); loadData()
  }

  const startEdit = (p: any) => {
    setForm({ name: p.name, sku: p.sku, description: p.description || '', price: String(p.price), costPrice: String(p.costPrice), categoryId: p.categoryId })
    setEditing(p); setShowForm(true)
  }

  if (loading) return <div className="loader"><span className="spinner" /> Loading products...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
              <input className="input" placeholder="Price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              <input className="input" placeholder="Cost Price" type="number" step="0.01" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} required />
              <select className="select" value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Select Category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input className="input" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        className="product-table"
        columns={[
          { key: 'name', label: 'Name', render: (r) => <span className="bold">{r.name}</span> },
          { key: 'sku', label: 'SKU', render: (r) => <span className="mono">{r.sku}</span> },
          { key: 'price', label: 'Price', render: (r) => `₹${r.price}` },
          { key: 'costPrice', label: 'Cost', render: (r) => `₹${r.costPrice}` },
          { key: 'category', label: 'Category', render: (r) => r.category?.name || '—' },
          { key: 'actions', label: 'Actions', render: (r) => (
            <div className="actions">
              <button onClick={() => startEdit(r)} className="btn btn-sm btn-blue">Edit</button>
              <button onClick={() => handleDelete(r.id)} className="btn btn-sm btn-danger">Delete</button>
            </div>
          )}
        ]}
        data={products}
        emptyText="No products found"
      />
    </div>
  )
}
