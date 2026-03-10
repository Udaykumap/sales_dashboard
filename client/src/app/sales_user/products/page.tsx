'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DataTable from '@/components/DataTable'

export default function SalesProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const [pRes, cRes] = await Promise.all([
          apiFetch('/api/products'),
          apiFetch('/api/category')
        ])
        if (pRes.ok) setProducts(await pRes.json())
        if (cRes.ok) setCategories(await cRes.json())
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

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
        <h1>Product Catalog</h1>
      </div>

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

      <DataTable
        className="product-table"
        columns={[
          { key: 'name', label: 'Name', render: (r) => <span className="bold">{r.name}</span> },
          { key: 'sku', label: 'SKU', render: (r) => <span className="mono">{r.sku}</span> },
          { key: 'price', label: 'Price', render: (r) => `₹${r.price}` },
          { key: 'category', label: 'Category', render: (r) => r.category?.name || '—' },
          { key: 'description', label: 'Description', render: (r) => <span className="muted">{r.description || '—'}</span> },
          { 
            key: 'stock', 
            label: 'Stock Availability', 
            render: (r) => {
              const qty = r.inventory?.quantity || 0;
              return qty > 0 ? (
                <span className="badge badge-green">In Stock ({qty})</span>
              ) : (
                <span className="badge badge-red">Out of Stock</span>
              );
            }
          },
        ]}
        data={filtered}
        emptyText="No products found"
      />
    </div>
  )
}
