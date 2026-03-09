'use client'

import Sidebar from '@/components/Sidebar'

const navItems = [
  { href: '/sales_user', label: 'Dashboard', icon: '📊' },
  { href: '/sales_user/customers', label: 'Customers', icon: '👤' },
  { href: '/sales_user/orders', label: 'Orders', icon: '🛒' },
  { href: '/sales_user/products', label: 'Products', icon: '📦' },
]

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar role="sales" title="Sales Dashboard" subtitle="Sales Panel" items={navItems} />
      <main className="main-content">{children}</main>
    </div>
  )
}
