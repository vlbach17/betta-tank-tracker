import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchDashboardParameters,
  type ParameterWithLatestReading,
} from '../lib/parameters'
import { ParameterCard } from './ParameterCard'

export function Dashboard() {
  const [parameters, setParameters] = useState<
    ParameterWithLatestReading[] | null
  >(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchDashboardParameters()
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

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 px-4 pt-6 pb-28">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-xl font-semibold text-ink">
          Spunk's Bettabase
        </h1>
        <div className="flex items-center">
          <Link
            to="/overview"
            className="flex h-11 items-center rounded-lg px-2 font-heading text-sm font-medium text-accent"
          >
            Overview
          </Link>
          <Link
            to="/settings"
            className="flex h-11 items-center rounded-lg px-2 font-heading text-sm font-medium text-accent"
          >
            Settings
          </Link>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
          Couldn't load your tank data: {error}
        </p>
      )}

      {!error && !parameters && (
        <p className="text-sm text-ink-muted">Loading…</p>
      )}

      {parameters && parameters.length === 0 && (
        <p className="text-sm text-ink-muted">
          No active parameters yet. Add one in Settings.
        </p>
      )}

      {parameters && parameters.length > 0 && (
        <div className="flex flex-col gap-3">
          {parameters.map((parameter) => (
            <ParameterCard key={parameter.id} parameter={parameter} />
          ))}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="mx-auto max-w-md">
          <Link
            to="/log"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-accent font-heading text-base font-semibold text-white"
          >
            Log a test
          </Link>
        </div>
      </div>
    </main>
  )
}
