'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DataTable from '@/components/DataTable'
import SearchableSelect from '@/components/SearchableSelect'

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', sku: '', description: '', price: '', costPrice: '', categoryId: '' })
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

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

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.sku.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = categoryFilter ? p.categoryId === categoryFilter : true
    return matchesSearch && matchesCategory
  })

  if (loading) return <div className="loader"><span className="spinner" /> Loading products...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm) }} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {!showForm && (
        <div className="filter-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <input
            className="input search-input"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <select 
            className="select" 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ width: '250px', marginBottom: 0 }}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit Product' : 'Add Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input className="input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <input className="input" placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
              <input className="input" placeholder="Price" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              <input className="input" placeholder="Cost Price" type="number" step="0.01" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} required />
              <SearchableSelect
                options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                value={form.categoryId}
                onChange={(val) => setForm({ ...form, categoryId: val })}
                placeholder="Select Category"
                required
              />
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
        data={filtered}
        emptyText="No products found"
      />
    </div>
  )
}
