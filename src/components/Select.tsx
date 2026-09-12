import type { ReactNode } from 'react'

export function Select({
  id,
  label,
  value,
  onChange,
  children,
  className,
}: {
  id?: string
  label?: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
  className?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-heading font-sans text-ink">
          {label}
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 rounded-input border border-transparent bg-mist px-3 text-body font-sans text-ink focus-visible:border-accent-strong focus-visible:outline-none ${className ?? ''}`}
      >
        {children}
      </select>
    </div>
  )
}
