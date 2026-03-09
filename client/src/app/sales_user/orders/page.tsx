'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DataTable from '@/components/DataTable'

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  /* Customer selection / creation */
  const [customerMode, setCustomerMode] = useState<'select' | 'new'>('select')
  const [customerId, setCustomerId] = useState('')
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' })

  /* Order details */
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([{ productId: '', quantity: 1 }])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadData = async () => {
    try {
      const [oRes, cRes, pRes] = await Promise.all([
        apiFetch('/api/orders?limit=50&sortBy=createdAt&sortOrder=desc'),
        apiFetch('/api/customers?limit=100'),
        apiFetch('/api/products'),
      ])
      if (oRes.ok) { const d = await oRes.json(); setOrders(d.data || []) }
      if (cRes.ok) { const d = await cRes.json(); setCustomers(d.data || []) }
      if (pRes.ok) setProducts(await pRes.json())
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  /* Item helpers */
  const addItem = () => setItems([...items, { productId: '', quantity: 1 }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: string, val: any) => {
    const copy = [...items]
    copy[i] = { ...copy[i], [field]: field === 'quantity' ? parseInt(val) || 1 : val }
    setItems(copy)
  }

  /* Dynamic total */
  const orderTotal = items.reduce((sum, item) => {
    const prod = products.find(p => p.id === item.productId)
    return sum + (prod ? prod.price * item.quantity : 0)
  }, 0)

  const resetForm = () => {
    setCustomerMode('select')
    setCustomerId('')
    setNewCustomer({ name: '', phone: '', email: '', address: '' })
    setItems([{ productId: '', quantity: 1 }])
    setPaymentMethod('CASH')
    setError('')
    setSuccess('')
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    let finalCustomerId = customerId

    /* If creating new customer, do that first */
    if (customerMode === 'new') {
      if (!newCustomer.name || !newCustomer.phone) {
        setError('Customer name and phone are required')
        return
      }
      try {
        const cRes = await apiFetch('/api/customers', {
          method: 'POST',
          body: JSON.stringify(newCustomer)
        })
        const cData = await cRes.json()
        if (!cRes.ok) {
          setError(cData.error || cData.message || 'Failed to create customer')
          return
        }
        finalCustomerId = cData.data?.id || cData.id
      } catch (err: any) {
        setError(err.message)
        return
      }
    }

    const validItems = items.filter(i => i.productId && i.quantity > 0)
    if (!finalCustomerId || validItems.length === 0) {
      setError('Please provide customer details and add at least one product')
      return
    }

    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ customerId: finalCustomerId, items: validItems, paymentMethod })
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error || d.message || 'Failed to create order'); return }
      setSuccess('Order placed successfully!')
      resetForm()
      loadData()
    } catch (err: any) { setError(err.message) }
  }

  if (loading) return <div className="loader"><span className="spinner" /> Loading...</div>

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <button onClick={() => { showForm ? resetForm() : setShowForm(true) }} className="btn btn-green">
          {showForm ? 'Cancel' : '+ New Order'}
        </button>
      </div>

      {success && <p className="form-success">{success}</p>}
      {error && <p className="form-error">{error}</p>}

      {showForm && (
        <div className="form-card order-form">
          <h3>Create New Order</h3>
          <form onSubmit={handleSubmit}>

            {/* ── Step 1: Customer ──────────────────────── */}
            <div className="order-section">
              <h4 className="order-step">Step 1 — Customer Details</h4>
              <div className="toggle-row">
                <button type="button" className={`toggle-btn${customerMode === 'select' ? ' active' : ''}`} onClick={() => setCustomerMode('select')}>
                  Existing Customer
                </button>
                <button type="button" className={`toggle-btn${customerMode === 'new' ? ' active' : ''}`} onClick={() => setCustomerMode('new')}>
                  New Customer
                </button>
              </div>

              {customerMode === 'select' ? (
                <select className="select" value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                  <option value="">Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                  ))}
                </select>
              ) : (
                <div className="form-grid">
                  <input className="input" placeholder="Customer Name *" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} required />
                  <input className="input" placeholder="Phone *" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} required />
                  <input className="input" placeholder="Email" type="email" value={newCustomer.email} onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                  <input className="input" placeholder="Address" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} />
                </div>
              )}
            </div>

            {/* ── Step 2: Products ──────────────────────── */}
            <div className="order-section">
              <h4 className="order-step">Step 2 — Select Products</h4>
              {items.map((item, i) => (
                <div key={i} className="item-row">
                  <select className="select" value={item.productId} onChange={e => updateItem(i, 'productId', e.target.value)} required>
                    <option value="">Choose product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — ₹{p.price}</option>
                    ))}
                  </select>
                  <input className="input" type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" style={{ maxWidth: 80 }} />
                  <span className="item-price">
                    ₹{(products.find(p => p.id === item.productId)?.price || 0) * item.quantity}
                  </span>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="btn btn-sm btn-danger">✕</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addItem} className="btn btn-sm btn-blue" style={{ marginTop: 6 }}>+ Add Item</button>
            </div>

            {/* ── Step 3: Payment & Total ───────────────── */}
            <div className="order-section">
              <h4 className="order-step">Step 3 — Payment</h4>
              <select className="select" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ maxWidth: 220 }}>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="UPI">UPI</option>
                <option value="NETBANKING">Net Banking</option>
              </select>
            </div>

            <div className="order-total">
              <span>Order Total</span>
              <span className="total-amount">₹{orderTotal.toLocaleString()}</span>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-green">Place Order</button>
            </div>
          </form>
        </div>
      )}

      <DataTable
        className="order-table"
        columns={[
          { key: 'id', label: 'Order ID', render: (r) => <span className="mono">{r.id.slice(0, 8)}...</span> },
          { key: 'customer', label: 'Customer', render: (r) => <span className="bold">{r.customerName || r.customer?.name || '—'}</span> },
          { key: 'phone', label: 'Phone', render: (r) => r.customerPhone || r.customer?.phone || '—' },
          { key: 'items', label: 'Items', render: (r) => r.items?.length || 0 },
          { key: 'totalAmount', label: 'Total', render: (r) => `₹${r.totalAmount?.toLocaleString()}` },
          { key: 'paymentMethod', label: 'Payment' },
          {
            key: 'status', label: 'Status', render: (r) => (
              <span className={`badge ${r.status === 'PAID' ? 'badge-green' : r.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}`}>{r.status}</span>
            )
          },
          { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
        ]}
        data={orders}
        emptyText="No orders yet"
      />
    </div>
  )
}
