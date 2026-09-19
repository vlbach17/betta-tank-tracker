import { useEffect, useState } from 'react'
import {
  abbreviateParameterName,
  formatHourOption,
  formatIdealRange,
  toDateInputValue,
  toIsoFromDateAndHour,
} from '../lib/format'
import {
  fetchActiveParameters,
  saveReadings,
  type NewReading,
} from '../lib/parameters'
import type { Parameter } from '../types/database'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'
import { Notice } from '../components/Notice'
import { Select } from '../components/Select'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function LogTest({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const [parameters, setParameters] = useState<Parameter[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [testedDate, setTestedDate] = useState(() =>
    toDateInputValue(new Date()),
  )
  const [testedHour, setTestedHour] = useState(() => new Date().getHours())
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

    const testedAtIso = toIsoFromDateAndHour(testedDate, testedHour)
    const trimmedNote = note.trim()

    const readings: NewReading[] = parameters
      .map((parameter) => {
        const raw = values[parameter.id]?.trim()
        if (!raw) return null
        const entered = Number(raw)
        if (!Number.isFinite(entered)) return null
        return {
          parameter_id: parameter.id,
          value: entered,
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
      onSaved()
      onClose()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Log a test">
      {loadError && <Notice>Couldn't load parameters: {loadError}</Notice>}

      {!parameters && !loadError && (
        <p className="text-body font-sans text-ink-3">Loading…</p>
      )}

      {parameters && (
        <form onSubmit={handleSave} className="flex flex-col gap-5">
          <p className="text-caption font-sans text-ink-3">
            Fill in whatever you tested. Blanks are skipped.
          </p>

          <div className="flex flex-col gap-1">
            <label htmlFor="tested-at-date" className="text-heading font-sans text-ink">
              Tested at
            </label>
            <div className="flex gap-2">
              <Input
                id="tested-at-date"
                type="date"
                value={testedDate}
                onChange={setTestedDate}
                required
                className="flex-1"
              />
              <Select
                id="tested-at-hour"
                value={String(testedHour)}
                onChange={(v) => setTestedHour(Number(v))}
                className="w-32 shrink-0"
              >
                {HOURS.map((hour) => (
                  <option key={hour} value={hour}>
                    {formatHourOption(hour)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {parameters.map((parameter) => {
              const displayUnit = parameter.unit
              const displayIdealMin = parameter.ideal_min
              const displayIdealMax = parameter.ideal_max

              return (
                <div
                  key={parameter.id}
                  className="flex flex-col gap-1.5 rounded-tile border border-line bg-surface p-3 shadow-tile"
                >
                  <label
                    htmlFor={`value-${parameter.id}`}
                    className="truncate text-heading font-sans text-ink"
                  >
                    {abbreviateParameterName(parameter.name)}
                    {displayUnit && (
                      <span className="ml-1 text-meta font-mono text-ink-3">
                        ({displayUnit})
                      </span>
                    )}
                  </label>
                  <Input
                    id={`value-${parameter.id}`}
                    mono
                    type="number"
                    inputMode="decimal"
                    step="any"
                    placeholder={
                      formatIdealRange(displayIdealMin, displayIdealMax) ??
                      undefined
                    }
                    value={values[parameter.id] ?? ''}
                    onChange={(v) =>
                      setValues((prev) => ({ ...prev, [parameter.id]: v }))
                    }
                  />
                </div>
              )
            })}
          </div>

          <Input
            id="note"
            label="Note (optional)"
            value={note}
            onChange={setNote}
            placeholder="day after water change"
          />

          {saveError && <Notice>{saveError}</Notice>}

          <Button type="submit" size="md" disabled={!hasAnyValue || saving}>
            {saving ? 'Saving…' : 'Save readings'}
          </Button>
        </form>
      )}
    </Modal>
  )
}
