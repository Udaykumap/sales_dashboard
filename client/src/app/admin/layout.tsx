'use client'

import Sidebar from '@/components/Sidebar'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/categories', label: 'Categories', icon: '🏷' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/inventory', label: 'Inventory', icon: '📋' },
  { href: '/admin/reports', label: 'Reports', icon: '📈' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <Sidebar role="admin" title="Sales Dashboard" subtitle="Admin Panel" items={navItems} />
      <main className="main-content">{children}</main>
    </div>
  )
}
