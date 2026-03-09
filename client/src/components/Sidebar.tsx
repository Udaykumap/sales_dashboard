'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getUser, logout } from '@/lib/api'

interface NavItem {
  href: string
  label: string
  icon: string
}

interface SidebarProps {
  role: 'admin' | 'sales'
  title: string
  subtitle: string
  items: NavItem[]
}

export default function Sidebar({ role, title, subtitle, items }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const u = getUser()
    const requiredRole = role === 'admin' ? 'ADMIN' : 'SALES'
    if (!u || u.role !== requiredRole) {
      router.push('/login')
      return
    }
    setUser(u)
  }, [router, role])

  if (!user) return null

  return (
    <aside className={`sidebar-menu ${role}`}>
      <div className="sidebar-brand">
        <h2>{title}</h2>
        <span>{subtitle}</span>
      </div>
      <nav className="header-nav">
        {items.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? 'active' : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="sidebar-user">
        <p>{user.name}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </aside>
  )
}
