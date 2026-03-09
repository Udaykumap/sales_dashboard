'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DataTable from '@/components/DataTable'

export default function SalesProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/api/products')
        if (res.ok) setProducts(await res.json())
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="loader"><span className="spinner" /> Loading products...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Product Catalog</h1>
      </div>

      <input
        className="input search-input"
        placeholder="Search by name or SKU..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <DataTable
        className="product-table"
        columns={[
          { key: 'name', label: 'Name', render: (r) => <span className="bold">{r.name}</span> },
          { key: 'sku', label: 'SKU', render: (r) => <span className="mono">{r.sku}</span> },
          { key: 'price', label: 'Price', render: (r) => `₹${r.price}` },
          { key: 'category', label: 'Category', render: (r) => r.category?.name || '—' },
          { key: 'description', label: 'Description', render: (r) => <span className="muted">{r.description || '—'}</span> },
        ]}
        data={filtered}
        emptyText="No products found"
      />
    </div>
  )
}
