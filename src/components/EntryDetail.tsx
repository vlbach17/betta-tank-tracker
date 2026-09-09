import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getDisplayUnit, toDisplayValue } from '../lib/displayUnit'
import { formatFullDate, formatReadingValue } from '../lib/format'
import { deleteReading, fetchEntry, type Entry } from '../lib/parameters'
import { getParameterIcon } from '../lib/parameterIcons'
import { getReadingStatus, worstStatus } from '../lib/status'
import { TEMPERATURE_PARAMETER_NAME } from '../lib/temperature'
import { useHardnessUnit } from '../lib/useHardnessUnit'
import { useTempUnit } from '../lib/useTempUnit'
import { BackLink } from './BackLink'
import { Button } from './Button'
import { Icon } from './Icon'
import { IconButton } from './IconButton'
import { Notice } from './Notice'
import { StatusDot } from './StatusDot'
import { StatusPill } from './StatusPill'

export function EntryDetail() {
  const { testedAt } = useParams<{ testedAt: string }>()
  const navigate = useNavigate()
  const { tempUnit } = useTempUnit()
  const { hardnessUnit } = useHardnessUnit()

  const [entry, setEntry] = useState<Entry | null | undefined>(undefined)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!testedAt) return
    let cancelled = false

    fetchEntry(testedAt)
      .then((data) => {
        if (!cancelled) setEntry(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load')
        }
      })

    return () => {
      cancelled = true
    }
  }, [testedAt])

  async function handleDelete(id: string) {
    if (!entry) return
    setDeleteError(null)
    const previous = entry
    const remaining = entry.readings.filter((r) => r.id !== id)
    setConfirmingId(null)

    if (remaining.length === 0) {
      try {
        await deleteReading(id)
        navigate('/history')
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : 'Failed to delete')
      }
      return
    }

    setEntry({ ...entry, readings: remaining })
    try {
      await deleteReading(id)
    } catch (err) {
      setEntry(previous)
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const overallStatus = entry
    ? worstStatus(
        entry.readings.map((r) =>
          getReadingStatus(r.value, r.parameterIdealMin, r.parameterIdealMax),
        ),
      )
    : null

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 px-5 pt-5 pb-28">
      <BackLink to="/history" label="History" />

      {loadError && <Notice>Couldn't load this entry: {loadError}</Notice>}

      {!loadError && entry === undefined && (
        <p className="text-body font-sans text-ink-3">Loading…</p>
      )}

      {!loadError && entry === null && (
        <p className="text-body font-sans text-ink-3">
          This entry couldn't be found.
        </p>
      )}

      {entry && (
        <>
          <div
            className="flex flex-col gap-2 rounded-card p-5"
            style={{ backgroundImage: 'var(--gradient-hero-wash)' }}
          >
            <div className="flex items-center gap-2">
              <Icon
                name="calendar"
                size={24}
                className="shrink-0 text-ink-3"
              />
              <h1 className="min-w-0 flex-1 text-title font-name text-ink">
                {formatFullDate(entry.testedAt)}
              </h1>
              {overallStatus && <StatusPill status={overallStatus} size="sm" />}
            </div>
            {entry.note && (
              <p className="text-body font-sans text-ink">{entry.note}</p>
            )}
          </div>

          {deleteError && <Notice>{deleteError}</Notice>}

          <div className="flex flex-col gap-2">
            {entry.readings.map((reading) => {
              const status = getReadingStatus(
                reading.value,
                reading.parameterIdealMin,
                reading.parameterIdealMax,
              )
              const displayParameter = {
                name: reading.parameterName,
                unit: reading.parameterUnit,
              }
              const displayValue = toDisplayValue(
                reading.value,
                displayParameter,
                tempUnit,
                hardnessUnit,
              )
              const displayUnit = getDisplayUnit(
                displayParameter,
                tempUnit,
                hardnessUnit,
              )
              const icon = getParameterIcon(reading.parameterName)

              return (
                <div
                  key={reading.id}
                  className="flex flex-col gap-1 rounded-row border border-line bg-surface p-4"
                >
                  {confirmingId === reading.id ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-body font-sans text-ink">
                        Delete this reading?
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(reading.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <StatusDot status={status} />
                        {icon && (
                          <Icon name={icon} size={18} className="shrink-0 text-ink-3" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-body font-sans text-ink">
                            {reading.parameterName === TEMPERATURE_PARAMETER_NAME
                              ? 'Temp'
                              : reading.parameterName}
                          </p>
                          <p className="text-num-sm font-mono tabular-nums text-ink">
                            {formatReadingValue(displayValue)}
                            {displayUnit && (
                              <span className="ml-1 text-meta font-mono text-ink-3">
                                {displayUnit}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <IconButton
                        icon="trash"
                        label={`Delete ${reading.parameterName} reading`}
                        tone="danger"
                        onClick={() => setConfirmingId(reading.id)}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
