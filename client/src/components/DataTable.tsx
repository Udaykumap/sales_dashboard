'use client'

import React from 'react'

interface Column {
  key: string
  label: string
  render?: (row: any) => React.ReactNode
}

interface DataTableProps {
  className: string
  columns: Column[]
  data: any[]
  emptyText?: string
  rowClass?: (row: any) => string
}

export default function DataTable({ className, columns, data, emptyText = 'No data found', rowClass }: DataTableProps) {
  return (
    <div className={className}>
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id || i} className={rowClass ? rowClass(row) : ''}>
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="empty-row">{emptyText}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
