import { useEffect, useRef } from 'react'

export function TabNav<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly T[]
  value: T
  onChange: (tab: T) => void
}) {
  const activeRef = useRef<HTMLButtonElement>(null)
  const mounted = useRef(false)

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: mounted.current ? 'smooth' : 'auto',
      inline: 'nearest',
      block: 'nearest',
    })
    mounted.current = true
  }, [value])

  return (
    <div className="tab-scroll flex snap-x snap-mandatory gap-1 overflow-x-auto rounded-full bg-mist p-1">
      {tabs.map((t) => (
        <button
          key={t}
          ref={value === t ? activeRef : undefined}
          type="button"
          onClick={() => onChange(t)}
          className={`h-9 shrink-0 snap-start rounded-full px-4 text-label font-sans ${
            value === t ? 'bg-surface text-ink shadow-segment' : 'text-ink-muted'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
