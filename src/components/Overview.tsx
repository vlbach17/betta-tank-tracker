import { useEffect, useMemo, useState } from 'react'
import { fetchAllHistories, type ParameterWithReadings } from '../lib/parameters'
import { isWithinRange, type Range } from '../lib/range'
import { BackLink } from './BackLink'
import { MiniHistoryChart } from './MiniHistoryChart'
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
    <main className="mx-auto flex min-h-svh max-w-md flex-col px-4 pt-4 pb-8">
      <BackLink to="/" label="Dashboard" />

      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Overview
      </h1>

      {error && (
        <p className="rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
          Couldn't load your tank data: {error}
        </p>
      )}

      {!error && !filtered && (
        <p className="text-sm text-ink-muted">Loading…</p>
      )}

      {filtered && filtered.length === 0 && (
        <p className="text-sm text-ink-muted">
          No active parameters yet. Add one in Settings.
        </p>
      )}

      {filtered && filtered.length > 0 && (
        <>
          <div className="mb-4">
            <RangeToggle value={range} onChange={setRange} />
          </div>

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
