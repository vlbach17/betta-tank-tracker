import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { BackLink } from '../components/BackLink'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Notice } from '../components/Notice'
import { Screen, SCREEN_WIDTH } from '../components/Screen'
import { Select } from '../components/Select'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function LogTest() {
  const navigate = useNavigate()

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
      navigate('/')
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save')
      setSaving(false)
    }
  }

  return (
    <Screen
      gap="gap-0"
      paddingBottom="pb-[calc(env(safe-area-inset-bottom)+var(--bottom-nav-h)+84px)]"
    >
      <BackLink to="/" label="Dashboard" />

      <div className="mb-5 flex flex-col gap-1">
        <h1 className="lowercase text-title font-name text-ink">
          log a test
        </h1>
        <p className="text-caption font-sans text-ink-3">
          Fill in whatever you tested. Blanks are skipped.
        </p>
      </div>

      {loadError && <Notice>Couldn't load parameters: {loadError}</Notice>}

      {parameters && (
        <form
          id="log-test-form"
          onSubmit={handleSave}
          className="flex flex-col gap-5"
        >
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

          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
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
        </form>
      )}

      <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+var(--bottom-nav-h))] z-30 bg-gradient-to-t from-bg from-40% to-transparent px-5 pt-3 pb-4">
        <div className={`mx-auto ${SCREEN_WIDTH}`}>
          <Button
            type="submit"
            form="log-test-form"
            className="w-full"
            disabled={!parameters || !hasAnyValue || saving}
          >
            {saving ? 'Saving…' : 'Save readings'}
          </Button>
        </div>
      </div>
    </Screen>
  )
}
