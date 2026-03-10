'use client'

import React, { useState, useEffect, useRef } from 'react'

export interface SearchableSelectProps {
  options: { value: string; label: string; [key: string]: any }[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  style?: React.CSSProperties
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  required = false,
  className = '',
  style
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Determine currently selected option to show its label
  const selectedOption = options.find(opt => opt.value === value)
  const displayValue = selectedOption ? selectedOption.label : ''

  // Filter options based on search term (case-insensitive)
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      ref={containerRef}
      className={`searchable-select-container ${className}`}
      style={{ position: 'relative', width: '100%', ...style }}
    >
      {/* Hidden input to handle required validation natively if needed */}
      <input type="hidden" value={value} required={required} />

      <div
        className="searchable-select-display select"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) setSearchTerm('') // Reset search on open
        }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        <span style={{ opacity: selectedOption ? 1 : 0.6, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? displayValue : placeholder}
        </span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', fontSize: '0.8em' }}>
          ▼
        </span>
      </div>

      {isOpen && (
        <div
          className="searchable-select-dropdown menu-dropdown shadow-medium"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-color, #eee)',
            borderRadius: '6px',
            marginTop: '4px',
            maxHeight: '300px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ padding: '8px', borderBottom: '1px solid var(--border-color, #eee)' }}>
            <input
              type="text"
              className="input"
              style={{ width: '100%', padding: '6px 10px', fontSize: '14px', marginBottom: 0 }}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={e => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div style={{ overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '10px 12px', color: 'var(--text-secondary, #666)', fontSize: '14px', textAlign: 'center' }}>
                No matches found
              </div>
            ) : (
              filteredOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value)
                    setIsOpen(false)
                  }}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    background: value === opt.value ? 'var(--blue-light, #eff6ff)' : 'transparent',
                    color: value === opt.value ? 'var(--blue, #2563eb)' : 'inherit',
                    fontWeight: value === opt.value ? '600' : 'normal',
                    fontSize: '14px',
                  }}
                  onMouseEnter={e => {
                    if (value !== opt.value) e.currentTarget.style.background = 'var(--bg-hover, #f8fafc)'
                  }}
                  onMouseLeave={e => {
                    if (value !== opt.value) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {opt.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
