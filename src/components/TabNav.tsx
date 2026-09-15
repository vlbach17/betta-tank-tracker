export function TabNav<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly T[]
  value: T
  onChange: (tab: T) => void
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-full bg-mist p-1">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`h-9 shrink-0 rounded-full px-4 text-label font-sans ${
            value === t ? 'bg-surface text-ink shadow-segment' : 'text-ink-muted'
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
