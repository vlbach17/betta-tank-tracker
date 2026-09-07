import { useEffect, useRef } from 'react'
import './RangeField.css'

export type RangeFieldValue = { min: number | null; max: number | null }

export function RangeField({
  label = 'Ideal range',
  unit,
  min = 0,
  max = 100,
  step = 0.1,
  value,
  onChange,
  onCommit,
  hint,
}: {
  label?: string
  unit?: string
  min?: number
  max?: number
  step?: number
  value: RangeFieldValue
  onChange: (value: RangeFieldValue) => void
  onCommit?: (value: RangeFieldValue) => void
  hint?: string
}) {
  const pending = useRef<RangeFieldValue>(value)
  useEffect(() => {
    pending.current = value
  }, [value])

  const lo = value.min == null ? min : value.min
  const hi = value.max == null ? max : value.max
  const pct = (v: number) =>
    ((Math.min(Math.max(v, min), max) - min) / (max - min || 1)) * 100
  const prec = (String(step).split('.')[1] || '').length
  const round = (v: number) =>
    Number((Math.round(v / step) * step).toFixed(prec))
  const clamp = (v: number) => round(Math.min(Math.max(v, min), max))

  function set(next: RangeFieldValue) {
    pending.current = next
    onChange(next)
  }

  function commit() {
    onCommit?.(pending.current)
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-heading font-sans text-ink">
          {label}
          {unit && (
            <span className="ml-1.5 text-meta font-mono text-ink-3">
              {unit}
            </span>
          )}
        </span>
        {hint && (
          <span className="text-meta font-mono text-ink-3">{hint}</span>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        <input
          className="rf-num"
          inputMode="decimal"
          aria-label={`${label} minimum`}
          value={value.min ?? ''}
          onChange={(e) => {
            const raw = e.target.value
            set({
              min: raw === '' ? null : Math.min(clamp(Number(raw)), hi),
              max: value.max,
            })
          }}
          onBlur={commit}
        />
        <span className="text-meta font-mono text-ink-3">to</span>
        <input
          className="rf-num"
          inputMode="decimal"
          aria-label={`${label} maximum`}
          value={value.max ?? ''}
          onChange={(e) => {
            const raw = e.target.value
            set({
              min: value.min,
              max: raw === '' ? null : Math.max(clamp(Number(raw)), lo),
            })
          }}
          onBlur={commit}
        />
        <div className="rf-slider min-w-[90px] flex-1">
          <div className="rf-track">
            <div
              className="rf-fill"
              style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
            />
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={lo}
            aria-label={`${label} minimum slider`}
            onChange={(e) =>
              set({
                min: round(Math.min(Number(e.target.value), hi)),
                max: value.max,
              })
            }
            onPointerUp={commit}
            onKeyUp={commit}
          />
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={hi}
            aria-label={`${label} maximum slider`}
            onChange={(e) =>
              set({
                min: value.min,
                max: round(Math.max(Number(e.target.value), lo)),
              })
            }
            onPointerUp={commit}
            onKeyUp={commit}
          />
        </div>
      </div>
    </div>
  )
}
