'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch, getUser } from '@/lib/api'
import DashboardCard from '@/components/DashboardCard'
import DataTable from '@/components/DataTable'

export default function SalesDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const user = getUser()

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/api/orders?limit=5&sortBy=createdAt&sortOrder=desc')
        if (res.ok) { const d = await res.json(); setOrders(d.data || []) }
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)

  if (loading) return <div className="loader"><span className="spinner" /> Loading...</div>

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name || 'Sales User'}</h1>
      <p className="subtitle">Here&apos;s your sales overview for today.</p>

      <div className="dashboard-cards">
        <DashboardCard label="Today's Orders" value={todayOrders.length} color="blue" />
        <DashboardCard label="Today's Revenue" value={`₹${todayRevenue.toLocaleString()}`} color="green" />
        <DashboardCard label="Total Recent Orders" value={orders.length} />
      </div>

      <h2 className="section-heading">Recent Orders</h2>
      <DataTable
        className="order-table"
        columns={[
          { key: 'customer', label: 'Customer', render: (r) => <span className="bold">{r.customerName || r.customer?.name || '—'}</span> },
          { key: 'totalAmount', label: 'Total', render: (r) => `₹${r.totalAmount?.toLocaleString()}` },
          { key: 'status', label: 'Status', render: (r) => (
            <span className={`badge ${r.status === 'PAID' ? 'badge-green' : r.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}`}>{r.status}</span>
          )},
          { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleDateString() },
        ]}
        data={orders}
        emptyText="No orders yet"
      />
    </div>
  )
}