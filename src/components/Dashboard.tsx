import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatRelativeTime } from '../lib/format'
import {
  fetchDashboardParameters,
  type ParameterWithLatestReading,
} from '../lib/parameters'
import { getReadingStatus, isOverdue } from '../lib/status'
import { Avatar } from './Avatar'
import { Notice } from './Notice'
import { ParameterTile } from './ParameterTile'

const RANK = {
  'out-of-range': 0,
  watch: 1,
  overdue: 2,
  'in-range': 3,
  unknown: 4,
} as const

function rankOf(parameter: ParameterWithLatestReading) {
  const overdue = isOverdue(
    parameter.name,
    parameter.latestReading?.tested_at ?? null,
  )
  if (!parameter.latestReading || overdue) return RANK.overdue
  const status = getReadingStatus(
    parameter.latestReading.value,
    parameter.ideal_min,
    parameter.ideal_max,
  )
  return RANK[status]
}

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

  const { heroId, goodCount, lastTestedAt } = useMemo(() => {
    if (!parameters)
      return {
        heroId: null as string | null,
        goodCount: 0,
        lastTestedAt: null as string | null,
      }
    let best: ParameterWithLatestReading | null = null
    let good = 0
    let latest: string | null = null
    for (const p of parameters) {
      const rank = rankOf(p)
      if (rank === RANK['in-range']) good++
      if (!best || rank < rankOf(best)) best = p
      if (p.latestReading && (!latest || p.latestReading.tested_at > latest)) {
        latest = p.latestReading.tested_at
      }
    }
    const heroId = best && rankOf(best) < RANK['in-range'] ? best.id : null
    return { heroId, goodCount: good, lastTestedAt: latest }
  }, [parameters])

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 px-5 pt-5 pb-28">
      <div className="flex items-center gap-3">
        <Avatar />
        <div className="flex flex-col">
          <h1 className="text-title font-sans text-ink">
            <span className="font-name text-[22px] leading-none">
              Spunk's
            </span>{' '}
            <span className="lowercase tracking-[-0.05em]">bettabase</span>
          </h1>
          {parameters && parameters.length > 0 && (
            <p className="text-caption font-sans text-ink-3 mt-2">
              {goodCount} of {parameters.length} in range
            </p>
          )}
        </div>
      </div>

      {error && <Notice>Couldn't load your tank data: {error}</Notice>}

      {!error && !parameters && (
        <p className="text-body font-sans text-ink-3">Loading…</p>
      )}

      {parameters && parameters.length === 0 && (
        <p className="text-body font-sans text-ink-3">
          No active parameters yet. Add one in Settings.
        </p>
      )}

      {parameters && parameters.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          {parameters
            .slice()
            .sort((a, b) => (a.id === heroId ? -1 : b.id === heroId ? 1 : 0))
            .map((parameter) => (
              <ParameterTile
                key={parameter.id}
                parameter={parameter}
                hero={parameter.id === heroId}
              />
            ))}
        </div>
      )}

      <div className="flex-1 text-center">
        <Link
          to="/history"
          className="rounded-input text-meta font-mono text-ink-3 focus-visible:outline-2 focus-visible:outline-accent-strong"
        >
          {lastTestedAt
            ? `Last tested ${formatRelativeTime(lastTestedAt)}`
            : 'No tests logged yet'}
        </Link>
      </div>
    </main>
  )
}
