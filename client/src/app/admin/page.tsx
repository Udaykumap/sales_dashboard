'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DashboardCard from '@/components/DashboardCard'
import DataTable from '@/components/DataTable'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [lowStock, setLowStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, lowStockRes] = await Promise.all([
          apiFetch('/api/orders/stats/dashboard'),
          apiFetch('/api/inventory/alerts/low-stock'),
        ])
        if (statsRes.ok) { const d = await statsRes.json(); setStats(d.data) }
        if (lowStockRes.ok) { const d = await lowStockRes.json(); setLowStock(d.data || []) }
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loader"><span className="spinner" /> Loading dashboard...</div>

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      <p className="subtitle">Overview of your business performance</p>

      <div className="dashboard-cards">
        <DashboardCard label="Total Orders" value={stats?.totalOrders ?? '—'} />
        <DashboardCard label="Total Revenue" value={stats?.totalRevenue != null ? `₹${stats.totalRevenue.toLocaleString()}` : '—'} color="green" />
        <DashboardCard label="Paid Orders" value={stats?.paidOrders ?? '—'} color="blue" />
        <DashboardCard label="Pending Orders" value={stats?.pendingOrders ?? '—'} color="yellow" />
      </div>

      <h2 className="section-heading">Low Stock Alerts</h2>
      <DataTable
        className="inventory-table"
        columns={[
          { key: 'product', label: 'Product', render: (r) => r.product?.name || r.productId },
          { key: 'quantity', label: 'Quantity', render: (r) => <span className="text-red">{r.quantity}</span> },
          { key: 'reorderLevel', label: 'Reorder Level' },
        ]}
        data={lowStock}
        emptyText="No low stock items"
        rowClass={() => 'inventory-warning'}
      />
    </div>
  )
}