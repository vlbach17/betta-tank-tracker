import { useEffect, useMemo, useState } from 'react'
import { fetchAllHistories, type ParameterWithReadings } from '../lib/parameters'
import { isWithinRange, type Range } from '../lib/range'
import { Avatar } from '../components/Avatar'
import { MiniHistoryChart } from '../components/MiniHistoryChart'
import { Notice } from '../components/Notice'
import { RangeToggle } from '../components/RangeToggle'

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
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 px-5 pt-5 pb-28 sm:min-h-0 sm:my-12 sm:rounded-card sm:border sm:border-line sm:bg-surface sm:px-6 sm:pt-6 sm:pb-10 sm:shadow-[0_24px_60px_-16px_rgba(20,20,55,0.35)]">
      <div className="flex items-center gap-3">
        <Avatar />
        <h1 className="text-title font-sans text-ink">Overview</h1>
      </div>

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
