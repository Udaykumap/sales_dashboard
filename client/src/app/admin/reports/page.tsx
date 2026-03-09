'use client'

import React, { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import DashboardCard from '@/components/DashboardCard'
import DataTable from '@/components/DataTable'

export default function ReportsPage() {
  const [salesReport, setSalesReport] = useState<any>(null)
  const [inventoryReport, setInventoryReport] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'sales' | 'inventory'>('sales')

  useEffect(() => {
    async function load() {
      try {
        const [sRes, iRes] = await Promise.all([
          apiFetch('/api/reports/sales'),
          apiFetch('/api/reports/inventory'),
        ])
        if (sRes.ok) setSalesReport(await sRes.json())
        if (iRes.ok) setInventoryReport(await iRes.json())
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loader"><span className="spinner" /> Loading reports...</div>

  return (
    <div>
      <h1 className="page-header" style={{ display: 'block', marginBottom: 20 }}>Reports</h1>

      <div className="tab-group">
        <button onClick={() => setTab('sales')} className={`tab-btn${tab === 'sales' ? ' active' : ''}`}>Sales Report</button>
        <button onClick={() => setTab('inventory')} className={`tab-btn${tab === 'inventory' ? ' active' : ''}`}>Inventory Report</button>
      </div>

      {tab === 'sales' && salesReport && (
        <div>
          <div className="dashboard-cards" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
            <DashboardCard label="Total Revenue" value={`₹${salesReport.totalRevenue?.toLocaleString()}`} color="green" />
            <DashboardCard label="Total Paid Orders" value={salesReport.totalOrders} />
          </div>

          <h3 className="section-heading" style={{ marginBottom: 12 }}>Product-wise Sales</h3>
          <DataTable
            className="report-table"
            columns={[
              { key: 'productName', label: 'Product', render: (r) => <span className="bold">{r.productName}</span> },
              { key: 'quantity', label: 'Qty Sold' },
              { key: 'revenue', label: 'Revenue', render: (r) => `₹${r.revenue?.toLocaleString()}` },
            ]}
            data={salesReport.productSales || []}
            emptyText="No sales data"
          />
        </div>
      )}

      {tab === 'inventory' && (
        <DataTable
          className="inventory-table"
          columns={[
            { key: 'product', label: 'Product', render: (r) => <span className="bold">{r.product?.name}</span> },
            { key: 'category', label: 'Category', render: (r) => r.product?.category?.name || '—' },
            { key: 'quantity', label: 'Quantity', render: (r) => <span className={r.quantity <= r.reorderLevel ? 'text-red' : ''}>{r.quantity}</span> },
            { key: 'reorderLevel', label: 'Reorder Level' },
            { key: 'status', label: 'Status', render: (r) => {
              const isLow = r.quantity <= r.reorderLevel
              return <span className={`badge ${isLow ? 'badge-red' : 'badge-green'}`}>{isLow ? 'LOW STOCK' : 'IN STOCK'}</span>
            }},
          ]}
          data={inventoryReport}
          emptyText="No inventory data"
          rowClass={(r) => r.quantity <= r.reorderLevel ? 'inventory-warning' : ''}
        />
      )}
    </div>
  )
}
