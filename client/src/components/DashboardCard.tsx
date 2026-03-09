'use client'

import React from 'react'

interface DashboardCardProps {
  label: string
  value: string | number
  color?: '' | 'green' | 'blue' | 'yellow' | 'red'
}

export default function DashboardCard({ label, value, color = '' }: DashboardCardProps) {
  return (
    <div className={`dashboard-card ${color}`}>
      <p className="label">{label}</p>
      <p className="value">{value}</p>
    </div>
  )
}
