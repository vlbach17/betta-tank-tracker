import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatFullDate, formatRelativeTime } from '../lib/format'
import { fetchEntries, type Entry } from '../lib/parameters'
import { getReadingStatus, worstStatus } from '../lib/status'
import { Avatar } from './Avatar'
import { NavChips } from './NavChips'
import { Notice } from './Notice'
import { StatusPill } from './StatusPill'

export function History() {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchEntries()
      .then((data) => {
        if (!cancelled) setEntries(data)
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
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 px-5 pt-5 pb-8">
      <div className="flex items-center gap-3">
        <Avatar />
        <h1 className="text-title font-sans text-ink">History</h1>
      </div>

      <NavChips
        items={[
          { to: '/', label: 'Now' },
          { to: '/overview', label: 'Overview' },
          { to: '/history', label: 'History' },
          { to: '/settings', label: 'Settings' },
        ]}
      />

      {error && <Notice>Couldn't load your test history: {error}</Notice>}

      {!error && !entries && (
        <p className="text-body font-sans text-ink-3">Loading…</p>
      )}

      {entries && entries.length === 0 && (
        <p className="text-body font-sans text-ink-3">
          No tests logged yet. Log one to start your history.
        </p>
      )}

      {entries && entries.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {entries.map((entry) => {
            const status = worstStatus(
              entry.readings.map((r) =>
                getReadingStatus(
                  r.value,
                  r.parameterIdealMin,
                  r.parameterIdealMax,
                ),
              ),
            )

            return (
              <Link
                key={entry.testedAt}
                to={`/history/${encodeURIComponent(entry.testedAt)}`}
                className="flex items-center justify-between gap-3 rounded-row border border-line bg-surface p-4 shadow-tile active:opacity-80 focus-visible:outline-2 focus-visible:outline-accent-strong"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-heading font-sans text-ink">
                    {formatFullDate(entry.testedAt)}
                  </span>
                  <span className="text-meta font-mono text-ink-3">
                    {formatRelativeTime(entry.testedAt)}
                  </span>
                </div>
                <StatusPill status={status} size="sm" />
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}
