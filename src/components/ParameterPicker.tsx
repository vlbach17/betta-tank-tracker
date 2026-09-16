import { useEffect, useRef, useState } from 'react'
import { formatReadingValue } from '../lib/format'
import type { ReadingStatus } from '../lib/status'
import { Icon, type IconName } from './Icon'
import { StatusDot } from './StatusDot'

export interface ParameterPickerRow {
  id: string
  name: string
  unit: string
  icon: IconName | undefined
  latestValue: number | null
  status: ReadingStatus
}

/**
 * Dropdown trigger + absolutely-positioned listbox sheet for picking the
 * parameter shown on the Overview tab. Not a native <select> — the sheet
 * needs a per-row icon, latest value, and status dot.
 */
export function ParameterPicker({
  rows,
  selectedId,
  onSelect,
}: {
  rows: ParameterPickerRow[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0]

  useEffect(() => {
    if (!open) return

    function handlePointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!selected) return null

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between gap-2 rounded-input bg-mist px-3"
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected.icon && (
            <Icon name={selected.icon} size={20} className="shrink-0 text-ink-3" />
          )}
          <span className="truncate text-body font-sans text-ink">
            {selected.name}
          </span>
          {selected.unit && (
            <span className="shrink-0 text-meta font-mono text-ink-3">
              ({selected.unit})
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          <span className="text-meta font-mono text-ink-3">
            {rows.length} parameters
          </span>
          <Icon
            name="chevronLeft"
            size={20}
            className="text-ink-muted"
            style={{ transform: 'rotate(-90deg)' }}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute inset-x-0 top-[50px] z-20 flex flex-col gap-0.5 rounded-card border border-line bg-surface p-2 shadow-[0_18px_44px_-12px_rgba(20,20,55,0.28)]"
        >
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              role="option"
              aria-selected={row.id === selectedId}
              onClick={() => {
                onSelect(row.id)
                setOpen(false)
              }}
              className={`flex h-11 items-center justify-between gap-2 rounded-input px-3 ${
                row.id === selectedId ? 'bg-mist' : 'bg-transparent'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                {row.icon && (
                  <Icon name={row.icon} size={18} className="shrink-0 text-ink-3" />
                )}
                <span className="truncate text-body font-sans text-ink">
                  {row.name}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-label-sm font-mono tabular-nums text-ink">
                  {row.latestValue != null ? formatReadingValue(row.latestValue) : '–'}
                  {row.unit && (
                    <span className="ml-1 text-meta font-mono text-ink-3">
                      {row.unit}
                    </span>
                  )}
                </span>
                <StatusDot status={row.status} />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
