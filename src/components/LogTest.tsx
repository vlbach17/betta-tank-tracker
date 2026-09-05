import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatIdealRange, toDatetimeLocalValue } from '../lib/format'
import {
  fetchActiveParameters,
  saveReadings,
  type NewReading,
} from '../lib/parameters'
import type { Parameter } from '../types/database'
import { BackLink } from './BackLink'

export function LogTest() {
  const navigate = useNavigate()

  const [parameters, setParameters] = useState<Parameter[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [testedAt, setTestedAt] = useState(() =>
    toDatetimeLocalValue(new Date()),
  )
  const [values, setValues] = useState<Record<string, string>>({})
  const [note, setNote] = useState('')

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchActiveParameters()
      .then((data) => {
        if (!cancelled) setParameters(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Failed to load')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const hasAnyValue = Object.values(values).some((v) => v.trim() !== '')

  async function handleSave(event: React.FormEvent) {
    event.preventDefault()
    if (!parameters || !hasAnyValue || saving) return

    const testedAtIso = new Date(testedAt).toISOString()
    const trimmedNote = note.trim()

    const readings: NewReading[] = parameters
      .map((parameter) => {
        const raw = values[parameter.id]?.trim()
        if (!raw) return null
        const value = Number(raw)
        if (!Number.isFinite(value)) return null
        return {
          parameter_id: parameter.id,
          value,
          tested_at: testedAtIso,
          note: trimmedNote || null,
        }
      })
      .filter((reading): reading is NewReading => reading !== null)

    if (readings.length === 0) return

    setSaving(true)
    setSaveError(null)
    try {
      await saveReadings(readings)
      navigate('/')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col px-4 pt-4 pb-28">
      <BackLink to="/" label="Dashboard" />

      <h1 className="mb-4 font-heading text-xl font-semibold text-ink">
        Log a test
      </h1>

      {loadError && (
        <p className="rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
          Couldn't load parameters: {loadError}
        </p>
      )}

      {parameters && (
        <form
          id="log-test-form"
          onSubmit={handleSave}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="tested-at" className="text-sm font-medium text-ink">
              Tested at
            </label>
            <input
              id="tested-at"
              type="datetime-local"
              value={testedAt}
              onChange={(e) => setTestedAt(e.target.value)}
              required
              className="h-11 rounded-lg border border-line bg-surface px-3 text-ink"
            />
          </div>

          <div className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
            {parameters.map((parameter) => (
              <div
                key={parameter.id}
                className="flex flex-col gap-1 px-4 py-3"
              >
                <label
                  htmlFor={`value-${parameter.id}`}
                  className="font-heading text-sm font-medium text-ink"
                >
                  {parameter.name}
                  {parameter.unit && (
                    <span className="ml-1 font-mono font-normal text-ink-muted">
                      ({parameter.unit})
                    </span>
                  )}
                </label>
                <input
                  id={`value-${parameter.id}`}
                  type="number"
                  inputMode="decimal"
                  step="any"
                  placeholder={
                    formatIdealRange(
                      parameter.ideal_min,
                      parameter.ideal_max,
                    ) ?? undefined
                  }
                  value={values[parameter.id] ?? ''}
                  onChange={(e) =>
                    setValues((v) => ({
                      ...v,
                      [parameter.id]: e.target.value,
                    }))
                  }
                  className="h-11 w-full rounded-lg border border-line bg-bg px-3 font-mono text-lg text-ink placeholder:text-sm placeholder:text-ink-muted"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="note" className="text-sm font-medium text-ink">
              Note (optional)
            </label>
            <input
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="day after water change"
              className="h-11 rounded-lg border border-line bg-surface px-3 text-ink placeholder:text-ink-muted"
            />
          </div>

          {saveError && (
            <p className="rounded-lg bg-status-bad-bg p-3 text-sm text-status-bad-fg">
              {saveError}
            </p>
          )}
        </form>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="mx-auto max-w-md">
          <button
            type="submit"
            form="log-test-form"
            disabled={!parameters || !hasAnyValue || saving}
            className="h-12 w-full rounded-xl bg-accent font-heading text-base font-semibold text-white disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save readings'}
          </button>
        </div>
      </div>
    </main>
  )
}
