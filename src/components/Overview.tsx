import { useEffect, useMemo, useState } from 'react'
import { fetchAllHistories, type ParameterWithReadings } from '../lib/parameters'
import { isWithinRange, type Range } from '../lib/range'
import { Avatar } from './Avatar'
import { MiniHistoryChart } from './MiniHistoryChart'
import { NavChips } from './NavChips'
import { Notice } from './Notice'
import { RangeToggle } from './RangeToggle'

export function Overview() {
  const [parameters, setParameters] = useState<
    ParameterWithReadings[] | null
  >(null)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<Range>('30')

  useEffect(() => {
    let cancelled = false

    fetchAllHistories()
      .then((data) => {
        if (!cancelled) setParameters(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (!parameters) return null
    return parameters.map((parameter) => ({
      parameter,
      latestReading: parameter.readings.at(-1) ?? null,
      chartReadings: parameter.readings.filter((r) =>
        isWithinRange(r.tested_at, range),
      ),
    }))
  }, [parameters, range])

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 px-5 pt-5 pb-8">
      <div className="flex items-center gap-3">
        <Avatar />
        <h1 className="text-title font-sans text-ink">Overview</h1>
      </div>

      <NavChips
        items={[
          { to: '/', label: 'Now' },
          { to: '/overview', label: 'Overview' },
          { to: '/settings', label: 'Settings' },
        ]}
      />

      {error && <Notice>Couldn't load your tank data: {error}</Notice>}

      {!error && !filtered && (
        <p className="text-body font-sans text-ink-3">Loading…</p>
      )}

      {filtered && filtered.length === 0 && (
        <p className="text-body font-sans text-ink-3">
          No active parameters yet. Add one in Settings.
        </p>
      )}

      {filtered && filtered.length > 0 && (
        <>
          <RangeToggle value={range} onChange={setRange} />

          <div className="flex flex-col gap-3">
            {filtered.map(({ parameter, chartReadings, latestReading }) => (
              <MiniHistoryChart
                key={parameter.id}
                parameter={parameter}
                chartReadings={chartReadings}
                latestReading={latestReading}
              />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
