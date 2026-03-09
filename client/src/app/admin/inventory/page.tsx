'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DataTable from '@/components/DataTable'

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [lowStock, setLowStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ productId: '', quantity: '', reorderLevel: '' })
  const [adjusting, setAdjusting] = useState<string | null>(null)
  const [adjustQty, setAdjustQty] = useState('')

  const loadData = async () => {
    try {
      const [iRes, pRes, lRes] = await Promise.all([
        apiFetch('/api/inventory?limit=100'),
        apiFetch('/api/products'),
        apiFetch('/api/inventory/alerts/low-stock'),
      ])
      if (iRes.ok) { const d = await iRes.json(); setInventory(d.data || []) }
      if (pRes.ok) setProducts(await pRes.json())
      if (lRes.ok) { const d = await lRes.json(); setLowStock(d.data || []) }
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiFetch('/api/inventory', {
        method: 'POST',
        body: JSON.stringify({ productId: form.productId, quantity: parseInt(form.quantity), reorderLevel: parseInt(form.reorderLevel) })
      })
      setForm({ productId: '', quantity: '', reorderLevel: '' }); setShowForm(false); loadData()
    } catch (e) { console.error(e) }
  }

  const handleAdjust = async (productId: string) => {
    try {
      await apiFetch(`/api/inventory/${productId}/adjust`, {
        method: 'PATCH',
        body: JSON.stringify({ quantityChange: parseInt(adjustQty) })
      })
      setAdjusting(null); setAdjustQty(''); loadData()
    } catch (e) { console.error(e) }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Delete this inventory record?')) return
    await apiFetch(`/api/inventory/${productId}`, { method: 'DELETE' }); loadData()
  }

  if (loading) return <div className="loader"><span className="spinner" /> Loading inventory...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Inventory</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Add Inventory'}
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="alert-warn">
          <h4>⚠ Low Stock Alerts ({lowStock.length})</h4>
          {lowStock.map((item: any) => (
            <p key={item.id}>{item.product?.name}: {item.quantity} units (reorder at {item.reorderLevel})</p>
          ))}
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>Add Inventory Record</h3>
          <form onSubmit={handleCreate}>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <select className="select" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })} required>
                <option value="">Select Product</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input className="input" placeholder="Quantity" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
              <input className="input" placeholder="Reorder Level" type="number" value={form.reorderLevel} onChange={e => setForm({ ...form, reorderLevel: e.target.value })} required />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        className="inventory-table"
        columns={[
          { key: 'product', label: 'Product', render: (r) => <span className="bold">{r.product?.name || r.productId}</span> },
          { key: 'quantity', label: 'Quantity', render: (r) => <span className={r.quantity <= r.reorderLevel ? 'text-red' : ''}>{r.quantity}</span> },
          { key: 'reorderLevel', label: 'Reorder Level' },
          { key: 'status', label: 'Status', render: (r) => {
            const isLow = r.quantity <= r.reorderLevel
            return <span className={`badge ${isLow ? 'badge-red' : 'badge-green'}`}>{isLow ? 'LOW' : 'OK'}</span>
          }},
          { key: 'actions', label: 'Actions', render: (r) => (
            <div className="actions">
              {adjusting === r.productId ? (
                <>
                  <input className="input" type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="+/-" style={{ width: 70 }} />
                  <button onClick={() => handleAdjust(r.productId)} className="btn btn-sm btn-blue">Go</button>
                  <button onClick={() => setAdjusting(null)} className="btn btn-sm btn-ghost">✕</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setAdjusting(r.productId); setAdjustQty('') }} className="btn btn-sm btn-blue">Adjust</button>
                  <button onClick={() => handleDelete(r.productId)} className="btn btn-sm btn-danger">Delete</button>
                </>
              )}
            </div>
          )}
        ]}
        data={inventory}
        emptyText="No inventory records"
        rowClass={(r) => r.quantity <= r.reorderLevel ? 'inventory-warning' : ''}
      />
    </div>
  )
}
