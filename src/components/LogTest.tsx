import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatIdealRange, toDatetimeLocalValue } from '../lib/format'
import {
  convertHardnessForDisplay,
  convertHardnessForStorage,
  hardnessUnitLabel,
  isHardnessUnit,
} from '../lib/hardness'
import {
  fetchActiveParameters,
  saveReadings,
  type NewReading,
} from '../lib/parameters'
import { useHardnessUnit } from '../lib/useHardnessUnit'
import type { Parameter } from '../types/database'
import { BackLink } from './BackLink'
import { Button } from './Button'
import { Input } from './Input'
import { Notice } from './Notice'

export function LogTest() {
  const navigate = useNavigate()
  const { hardnessUnit } = useHardnessUnit()

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
        const entered = Number(raw)
        if (!Number.isFinite(entered)) return null
        const value = isHardnessUnit(parameter.unit)
          ? convertHardnessForStorage(entered, hardnessUnit)
          : entered
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
    <main className="mx-auto flex min-h-svh max-w-md flex-col px-5 pt-5 pb-28">
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
          <Input
            id="tested-at"
            label="Tested at"
            type="datetime-local"
            value={testedAt}
            onChange={setTestedAt}
            required
          />

          <div className="grid grid-cols-2 gap-2.5">
            {parameters.map((parameter) => {
              const isHardness = isHardnessUnit(parameter.unit)
              const displayUnit = isHardness
                ? hardnessUnitLabel(parameter.unit, hardnessUnit)
                : parameter.unit
              const displayIdealMin =
                isHardness && parameter.ideal_min != null
                  ? convertHardnessForDisplay(parameter.ideal_min, hardnessUnit)
                  : parameter.ideal_min
              const displayIdealMax =
                isHardness && parameter.ideal_max != null
                  ? convertHardnessForDisplay(parameter.ideal_max, hardnessUnit)
                  : parameter.ideal_max

              return (
                <div
                  key={parameter.id}
                  className="flex flex-col gap-1.5 rounded-tile border border-line bg-surface p-3 shadow-tile"
                >
                  <label
                    htmlFor={`value-${parameter.id}`}
                    className="truncate text-heading font-sans text-ink"
                  >
                    {parameter.name}
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

      <div className="fixed inset-x-0 bottom-0 bg-gradient-to-t from-bg from-40% to-transparent px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="mx-auto max-w-md">
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
    </main>
  )
}
