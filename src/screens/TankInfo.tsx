import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import {
  createEquipment,
  createFish,
  createFoodSupply,
  createHardscape,
  createPlant,
  createWaterChange,
  createWaterTreatment,
  deleteEquipment,
  deleteFish,
  deleteFoodSupply,
  deleteHardscape,
  deletePlant,
  deleteWaterChange,
  deleteWaterTreatment,
  fetchAllEquipment,
  fetchAllFish,
  fetchAllFoodSupplies,
  fetchAllHardscape,
  fetchAllPlants,
  fetchAllWaterChanges,
  fetchAllWaterTreatments,
  swapEquipmentOrder,
  swapFishOrder,
  swapFoodSupplyOrder,
  swapHardscapeOrder,
  swapPlantOrder,
  swapWaterTreatmentOrder,
  updateEquipment,
  updateFish,
  updateFoodSupply,
  updateHardscape,
  updatePlant,
  updateWaterTreatment,
} from '../lib/tankInfo'
import { toDateInputValue } from '../lib/format'
import type {
  Equipment,
  Fish,
  FoodSupply,
  Hardscape,
  Plant,
  WaterChange,
  WaterTreatment,
} from '../types/database'
import { Avatar } from '../components/Avatar'
import { BackLink } from '../components/BackLink'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'
import { Notice } from '../components/Notice'
import { Select } from '../components/Select'
import { TabNav } from '../components/TabNav'

const ITEM_TABS = ['Equipment', 'Food', 'Plants', 'Fish', 'Hardscape', 'Water Treatment'] as const
type ItemCategory = (typeof ITEM_TABS)[number]

const TABS = [...ITEM_TABS, 'Water Changes'] as const
type Tab = (typeof TABS)[number]

const CATEGORY_LABEL: Record<ItemCategory, string> = {
  Equipment: 'Equipment',
  Food: 'Food',
  Plants: 'Plant',
  Fish: 'Fish',
  Hardscape: 'Hardscape',
  'Water Treatment': 'Water Treatment',
}

type EditingItem =
  | { category: 'Equipment'; item: Equipment }
  | { category: 'Food'; item: FoodSupply }
  | { category: 'Plants'; item: Plant }
  | { category: 'Fish'; item: Fish }
  | { category: 'Hardscape'; item: Hardscape }
  | { category: 'Water Treatment'; item: WaterTreatment }

/** Raw (unformatted) field values for an item, keyed the same as form values — used to prefill the edit form. */
function rawValuesForCategory(editing: EditingItem): Record<string, string> {
  const { category, item } = editing
  const base = { name: item.name, notes: item.notes ?? '' }
  switch (category) {
    case 'Equipment':
    case 'Hardscape':
    case 'Water Treatment':
      return { ...base, manual_url: item.manual_url ?? '', purchase_date: item.purchase_date ?? '' }
    case 'Food':
      return { ...base, manual_url: item.manual_url ?? '', purchase_date: item.purchase_date ?? '' }
    case 'Plants':
      return {
        ...base,
        quantity: String(item.quantity),
        manual_url: item.manual_url ?? '',
        planted_date: item.planted_date ?? '',
      }
    case 'Fish':
      return {
        ...base,
        species: item.species ?? '',
        acquired_date: item.acquired_date ?? '',
        tank_gallons: item.tank_gallons != null ? String(item.tank_gallons) : '',
        tank_setup_date: item.tank_setup_date ?? '',
      }
  }
}

type Sortable = { id: string; sort_order: number; active: boolean }

/** Generic optimistic active/inactive toggle, shared by all 4 sections. */
async function toggleActive<T extends Sortable>(
  item: T,
  setItems: Dispatch<SetStateAction<T[] | null>>,
  setRowError: Dispatch<SetStateAction<string | null>>,
  updateFn: (id: string, updates: { active: boolean }) => Promise<void>,
) {
  const nextActive = !item.active
  setItems((items) =>
    (items ?? []).map((i) => (i.id === item.id ? { ...i, active: nextActive } : i)),
  )
  setRowError(null)
  try {
    await updateFn(item.id, { active: nextActive })
  } catch (err) {
    setItems((items) =>
      (items ?? []).map((i) =>
        i.id === item.id ? { ...i, active: !nextActive } : i,
      ),
    )
    setRowError(err instanceof Error ? err.message : 'Failed to save')
  }
}

/** Generic optimistic up/down reorder, shared by all 4 sections. */
async function moveItem<T extends Sortable>(
  item: T,
  direction: 'up' | 'down',
  items: T[],
  setItems: Dispatch<SetStateAction<T[] | null>>,
  setRowError: Dispatch<SetStateAction<string | null>>,
  swapFn: (a: Sortable, b: Sortable) => Promise<void>,
) {
  const idx = items.findIndex((i) => i.id === item.id)
  const targetIdx = direction === 'up' ? idx - 1 : idx + 1
  if (idx === -1 || targetIdx < 0 || targetIdx >= items.length) return

  const target = items[targetIdx]
  const prevItems = items
  const swapped = [...items]
  swapped[idx] = { ...target, sort_order: item.sort_order }
  swapped[targetIdx] = { ...item, sort_order: target.sort_order }
  swapped.sort((a, b) => a.sort_order - b.sort_order)

  setItems(swapped)
  setRowError(null)
  try {
    await swapFn(item, target)
  } catch (err) {
    setItems(prevItems)
    setRowError(err instanceof Error ? err.message : 'Failed to save')
  }
}

/** Generic optimistic delete, shared by all 4 sections. */
async function removeItem<T extends Sortable>(
  item: T,
  items: T[],
  setItems: Dispatch<SetStateAction<T[] | null>>,
  setRowError: Dispatch<SetStateAction<string | null>>,
  deleteFn: (id: string) => Promise<void>,
) {
  const previous = items
  setItems((items) => (items ?? []).filter((i) => i.id !== item.id))
  setRowError(null)
  try {
    await deleteFn(item.id)
  } catch (err) {
    setItems(previous)
    setRowError(err instanceof Error ? err.message : 'Failed to delete')
  }
}

interface FieldSpec {
  key: string
  label: string
  type: 'text' | 'date' | 'url' | 'number'
  placeholder?: string
}

const EQUIPMENT_FIELDS: FieldSpec[] = [
  { key: 'manual_url', label: 'Manual link', type: 'url', placeholder: 'https://…' },
  { key: 'purchase_date', label: 'Purchased', type: 'date' },
]
const FOOD_FIELDS: FieldSpec[] = [
  { key: 'manual_url', label: 'Link', type: 'url', placeholder: 'https://…' },
  { key: 'purchase_date', label: 'Purchased', type: 'date' },
]
const PLANT_FIELDS: FieldSpec[] = [
  { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '1' },
  { key: 'manual_url', label: 'Link', type: 'url', placeholder: 'https://…' },
  { key: 'planted_date', label: 'Planted', type: 'date' },
]
const FISH_FIELDS: FieldSpec[] = [
  { key: 'species', label: 'Species', type: 'text', placeholder: 'Betta splendens' },
  { key: 'acquired_date', label: 'Acquired', type: 'date' },
  { key: 'tank_gallons', label: 'Tank size (gal)', type: 'number', placeholder: '15' },
  { key: 'tank_setup_date', label: 'Tank set up', type: 'date' },
]
const HARDSCAPE_FIELDS: FieldSpec[] = [
  { key: 'manual_url', label: 'Link', type: 'url', placeholder: 'https://…' },
  { key: 'purchase_date', label: 'Purchased', type: 'date' },
]
const WATER_TREATMENT_FIELDS: FieldSpec[] = [
  { key: 'manual_url', label: 'Link', type: 'url', placeholder: 'https://…' },
  { key: 'purchase_date', label: 'Purchased', type: 'date' },
]

const CATEGORY_FIELDS: Record<ItemCategory, FieldSpec[]> = {
  Equipment: EQUIPMENT_FIELDS,
  Food: FOOD_FIELDS,
  Plants: PLANT_FIELDS,
  Fish: FISH_FIELDS,
  Hardscape: HARDSCAPE_FIELDS,
  'Water Treatment': WATER_TREATMENT_FIELDS,
}

function fieldInputType(f: FieldSpec) {
  return f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'url' ? 'url' : 'text'
}

function FieldInputs({
  fields,
  values,
  onChange,
  idPrefix,
}: {
  fields: FieldSpec[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  idPrefix: string
}) {
  return (
    <>
      {fields.map((f) => (
        <Input
          key={f.key}
          id={`${idPrefix}-${f.key}`}
          label={f.label}
          type={fieldInputType(f)}
          inputMode={f.type === 'number' ? 'numeric' : undefined}
          value={values[f.key] ?? ''}
          onChange={(v) => onChange(f.key, v)}
          placeholder={f.placeholder}
          required={f.key === 'name'}
        />
      ))}
    </>
  )
}

function EntityManager<T extends Sortable & { name: string; notes: string | null }>({
  items,
  loadError,
  rowError,
  fields,
  displayField,
  onToggleActive,
  onMove,
  onEdit,
  onDelete,
}: {
  items: T[] | null
  loadError: string | null
  rowError: string | null
  fields: FieldSpec[]
  displayField: (item: T, field: FieldSpec) => string | null
  onToggleActive: (item: T) => void
  onMove: (item: T, direction: 'up' | 'down') => void
  onEdit: (item: T) => void
  onDelete: (item: T) => void
}) {
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {loadError && <Notice>Couldn't load: {loadError}</Notice>}
      {!loadError && !items && (
        <p className="text-body font-sans text-ink-3">Loading…</p>
      )}

      {items && (
        <section className="flex flex-col gap-3">
          {rowError && <Notice>{rowError}</Notice>}

          {items.length === 0 && (
            <p className="text-body-sm font-sans text-ink-3">
              Nothing added yet.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`flex flex-col gap-2 rounded-tile p-4 ${
                  item.active
                    ? 'border border-line bg-surface shadow-tile'
                    : 'border border-dashed border-line-2 bg-mist-2'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {item.name === 'Spunk' && <Avatar size={32} />}
                    <h3 className="text-heading font-sans text-ink">
                      {item.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleActive(item)}
                    className={`h-9 shrink-0 rounded-full px-3 text-label-sm font-sans ${
                      item.active
                        ? 'bg-status-good-bg text-status-good-fg'
                        : 'bg-status-overdue-bg text-status-overdue-fg'
                    }`}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {fields.map((f) => {
                  const value = displayField(item, f)
                  if (!value) return null
                  if (f.type === 'url') {
                    return (
                      <a
                        key={f.key}
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="text-body-sm font-sans text-accent-strong underline underline-offset-2"
                      >
                        {f.label} ↗
                      </a>
                    )
                  }
                  return (
                    <p key={f.key} className="text-body-sm font-sans text-ink-3">
                      {f.label}: {value}
                    </p>
                  )
                })}

                {item.notes && (
                  <p className="text-body-sm font-sans text-ink-3">
                    {item.notes}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  {confirmingDeleteId === item.id ? (
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-body-sm font-sans text-ink">
                        Delete this item?
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmingDeleteId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setConfirmingDeleteId(null)
                            onDelete(item)
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          aria-label="Move up"
                          disabled={idx === 0}
                          onClick={() => onMove(item, 'up')}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          aria-label="Move down"
                          disabled={idx === items.length - 1}
                          onClick={() => onMove(item, 'down')}
                          className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-ink disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <IconButton
                          icon="pencil"
                          label={`Edit ${item.name}`}
                          onClick={() => onEdit(item)}
                        />
                        <IconButton
                          icon="trash"
                          label={`Delete ${item.name}`}
                          tone="danger"
                          onClick={() => setConfirmingDeleteId(item.id)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function AddItemModal({
  onClose,
  category,
  onCategoryChange,
  onCreate,
}: {
  onClose: () => void
  category: ItemCategory
  onCategoryChange: (category: ItemCategory) => void
  onCreate: (category: ItemCategory, values: Record<string, string>) => Promise<string | null>
}) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleCategoryChange(next: ItemCategory) {
    onCategoryChange(next)
    setValues({})
    setError(null)
  }

  const allFields: FieldSpec[] = [
    { key: 'name', label: 'Name', type: 'text' },
    ...CATEGORY_FIELDS[category],
    { key: 'notes', label: 'Notes', type: 'text' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const err = await onCreate(category, values)
    setSubmitting(false)
    if (err) {
      setError(err)
      return
    }
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Add new item">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Select
          id="add-item-category"
          label="Category"
          value={category}
          onChange={(v) => handleCategoryChange(v as ItemCategory)}
        >
          {ITEM_TABS.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </Select>
        <FieldInputs
          fields={allFields}
          values={values}
          onChange={(key, v) => setValues((prev) => ({ ...prev, [key]: v }))}
          idPrefix="add"
        />
        {error && <Notice>{error}</Notice>}
        <Button type="submit" size="md" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add'}
        </Button>
      </form>
    </Modal>
  )
}

function EditItemModal({
  editing,
  onClose,
  onSubmit,
}: {
  editing: EditingItem
  onClose: () => void
  onSubmit: (newCategory: ItemCategory, values: Record<string, string>) => Promise<string | null>
}) {
  const [category, setCategory] = useState<ItemCategory>(editing.category)
  const [values, setValues] = useState<Record<string, string>>(() => rawValuesForCategory(editing))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleCategoryChange(next: ItemCategory) {
    setCategory(next)
    setValues((prev) =>
      next === editing.category
        ? rawValuesForCategory(editing)
        : { name: prev.name ?? '', notes: prev.notes ?? '' },
    )
    setError(null)
  }

  const allFields: FieldSpec[] = [
    { key: 'name', label: 'Name', type: 'text' },
    ...CATEGORY_FIELDS[category],
    { key: 'notes', label: 'Notes', type: 'text' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const err = await onSubmit(category, values)
    setSubmitting(false)
    if (err) {
      setError(err)
      return
    }
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={`Edit ${CATEGORY_LABEL[category]}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Select
          id="edit-item-category"
          label="Category"
          value={category}
          onChange={(v) => handleCategoryChange(v as ItemCategory)}
        >
          {ITEM_TABS.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </Select>
        {category !== editing.category && (
          <p className="text-caption font-sans text-ink-3">
            Moving to {CATEGORY_LABEL[category]} — its details below start blank.
          </p>
        )}
        <FieldInputs
          fields={allFields}
          values={values}
          onChange={(key, v) => setValues((prev) => ({ ...prev, [key]: v }))}
          idPrefix="edit"
        />
        {error && <Notice>{error}</Notice>}
        <Button type="submit" size="md" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Modal>
  )
}

function LogWaterChangeModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (values: Record<string, string>) => Promise<string | null>
}) {
  const [changedAt, setChangedAt] = useState(() => toDateInputValue(new Date()))
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const err = await onCreate({ changed_at: changedAt, amount, notes })
    setSubmitting(false)
    if (err) {
      setError(err)
      return
    }
    onClose()
  }

  return (
    <Modal open onClose={onClose} title="Log a water change">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          id="water-change-date"
          label="Date"
          type="date"
          value={changedAt}
          onChange={setChangedAt}
          required
        />
        <Input
          id="water-change-amount"
          label="Amount (gallons)"
          mono
          type="number"
          inputMode="decimal"
          step="any"
          placeholder="2.5"
          value={amount}
          onChange={setAmount}
          required
        />
        <Input
          id="water-change-notes"
          label="Notes"
          value={notes}
          onChange={setNotes}
          placeholder="optional"
        />
        {error && <Notice>{error}</Notice>}
        <Button type="submit" size="md" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add'}
        </Button>
      </form>
    </Modal>
  )
}

function WaterChangeLog({
  items,
  loadError,
  rowError,
  onDelete,
}: {
  items: WaterChange[] | null
  loadError: string | null
  rowError: string | null
  onDelete: (item: WaterChange) => void
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {loadError && <Notice>Couldn't load: {loadError}</Notice>}
      {!loadError && !items && (
        <p className="text-body font-sans text-ink-3">Loading…</p>
      )}

      {items && (
        <section className="flex flex-col gap-3">
          {rowError && <Notice>{rowError}</Notice>}

          {items.length === 0 && (
            <p className="text-body-sm font-sans text-ink-3">
              No water changes logged yet.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-tile border border-line bg-surface p-4 shadow-tile"
              >
                {confirmingId === item.id ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-body font-sans text-ink">
                      Delete this entry?
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
                        onClick={() => {
                          setConfirmingId(null)
                          onDelete(item)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-heading font-sans text-ink">
                        {item.amount_gallons} gal
                      </h3>
                      <p className="text-body-sm font-sans text-ink-3">
                        {item.changed_at}
                      </p>
                      {item.notes && (
                        <p className="mt-1 text-body-sm font-sans text-ink">
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <IconButton
                      icon="trash"
                      label="Delete water change"
                      tone="danger"
                      onClick={() => setConfirmingId(item.id)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export function TankInfo() {
  const [tab, setTab] = useState<Tab>('Equipment')

  const [equipment, setEquipment] = useState<Equipment[] | null>(null)
  const [equipmentLoadError, setEquipmentLoadError] = useState<string | null>(null)
  const [equipmentRowError, setEquipmentRowError] = useState<string | null>(null)

  const [food, setFood] = useState<FoodSupply[] | null>(null)
  const [foodLoadError, setFoodLoadError] = useState<string | null>(null)
  const [foodRowError, setFoodRowError] = useState<string | null>(null)

  const [plants, setPlants] = useState<Plant[] | null>(null)
  const [plantsLoadError, setPlantsLoadError] = useState<string | null>(null)
  const [plantsRowError, setPlantsRowError] = useState<string | null>(null)

  const [fish, setFish] = useState<Fish[] | null>(null)
  const [fishLoadError, setFishLoadError] = useState<string | null>(null)
  const [fishRowError, setFishRowError] = useState<string | null>(null)

  const [hardscape, setHardscape] = useState<Hardscape[] | null>(null)
  const [hardscapeLoadError, setHardscapeLoadError] = useState<string | null>(null)
  const [hardscapeRowError, setHardscapeRowError] = useState<string | null>(null)

  const [waterTreatments, setWaterTreatments] = useState<WaterTreatment[] | null>(null)
  const [waterTreatmentsLoadError, setWaterTreatmentsLoadError] = useState<string | null>(null)
  const [waterTreatmentsRowError, setWaterTreatmentsRowError] = useState<string | null>(null)

  const [waterChanges, setWaterChanges] = useState<WaterChange[] | null>(null)
  const [waterChangesLoadError, setWaterChangesLoadError] = useState<string | null>(null)
  const [waterChangesRowError, setWaterChangesRowError] = useState<string | null>(null)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addCategory, setAddCategory] = useState<ItemCategory>('Equipment')
  const [waterModalOpen, setWaterModalOpen] = useState(false)
  const [editing, setEditing] = useState<EditingItem | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchAllEquipment()
      .then((data) => !cancelled && setEquipment(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setEquipmentLoadError(err instanceof Error ? err.message : 'Failed to load'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAllFoodSupplies()
      .then((data) => !cancelled && setFood(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setFoodLoadError(err instanceof Error ? err.message : 'Failed to load'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAllPlants()
      .then((data) => !cancelled && setPlants(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setPlantsLoadError(err instanceof Error ? err.message : 'Failed to load'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAllFish()
      .then((data) => !cancelled && setFish(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setFishLoadError(err instanceof Error ? err.message : 'Failed to load'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAllHardscape()
      .then((data) => !cancelled && setHardscape(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setHardscapeLoadError(err instanceof Error ? err.message : 'Failed to load'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAllWaterTreatments()
      .then((data) => !cancelled && setWaterTreatments(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setWaterTreatmentsLoadError(err instanceof Error ? err.message : 'Failed to load'),
      )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchAllWaterChanges()
      .then((data) => !cancelled && setWaterChanges(data))
      .catch(
        (err: unknown) =>
          !cancelled &&
          setWaterChangesLoadError(
            err instanceof Error ? err.message : 'Failed to load',
          ),
      )
    return () => {
      cancelled = true
    }
  }, [])

  async function handleCreateItem(
    category: ItemCategory,
    values: Record<string, string>,
  ): Promise<string | null> {
    if (!values.name?.trim()) return 'Name is required'

    if (category === 'Equipment') {
      try {
        const created = await createEquipment({
          name: values.name.trim(),
          manual_url: values.manual_url?.trim() || null,
          purchase_date: values.purchase_date || null,
          notes: values.notes?.trim() || null,
        })
        setEquipment((items) => [...(items ?? []), created])
        return null
      } catch (err) {
        return err instanceof Error ? err.message : 'Failed to add'
      }
    }

    if (category === 'Food') {
      try {
        const created = await createFoodSupply({
          name: values.name.trim(),
          manual_url: values.manual_url?.trim() || null,
          purchase_date: values.purchase_date || null,
          notes: values.notes?.trim() || null,
        })
        setFood((items) => [...(items ?? []), created])
        return null
      } catch (err) {
        return err instanceof Error ? err.message : 'Failed to add'
      }
    }

    if (category === 'Plants') {
      const quantity = values.quantity ? Number(values.quantity) : 1
      if (!Number.isFinite(quantity) || quantity < 1) {
        return 'Quantity must be a positive number'
      }
      try {
        const created = await createPlant({
          name: values.name.trim(),
          quantity,
          manual_url: values.manual_url?.trim() || null,
          planted_date: values.planted_date || null,
          notes: values.notes?.trim() || null,
        })
        setPlants((items) => [...(items ?? []), created])
        return null
      } catch (err) {
        return err instanceof Error ? err.message : 'Failed to add'
      }
    }

    if (category === 'Hardscape') {
      try {
        const created = await createHardscape({
          name: values.name.trim(),
          manual_url: values.manual_url?.trim() || null,
          purchase_date: values.purchase_date || null,
          notes: values.notes?.trim() || null,
        })
        setHardscape((items) => [...(items ?? []), created])
        return null
      } catch (err) {
        return err instanceof Error ? err.message : 'Failed to add'
      }
    }

    if (category === 'Water Treatment') {
      try {
        const created = await createWaterTreatment({
          name: values.name.trim(),
          manual_url: values.manual_url?.trim() || null,
          purchase_date: values.purchase_date || null,
          notes: values.notes?.trim() || null,
        })
        setWaterTreatments((items) => [...(items ?? []), created])
        return null
      } catch (err) {
        return err instanceof Error ? err.message : 'Failed to add'
      }
    }

    // Fish
    const tankGallons = values.tank_gallons ? Number(values.tank_gallons) : null
    if (values.tank_gallons && !Number.isFinite(tankGallons)) {
      return 'Tank size must be a number'
    }
    try {
      const created = await createFish({
        name: values.name.trim(),
        species: values.species?.trim() || null,
        acquired_date: values.acquired_date || null,
        notes: values.notes?.trim() || null,
        tank_gallons: tankGallons,
        tank_setup_date: values.tank_setup_date || null,
      })
      setFish((items) => [...(items ?? []), created])
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed to add'
    }
  }

  async function updateEquipmentItem(
    item: Equipment,
    values: Record<string, string>,
  ): Promise<string | null> {
    if (!values.name?.trim()) return 'Name is required'
    const updates = {
      name: values.name.trim(),
      manual_url: values.manual_url?.trim() || null,
      purchase_date: values.purchase_date || null,
      notes: values.notes?.trim() || null,
    }
    try {
      await updateEquipment(item.id, updates)
      setEquipment((items) =>
        (items ?? []).map((i) => (i.id === item.id ? { ...i, ...updates } : i)),
      )
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed to save'
    }
  }

  async function updateFoodItem(
    item: FoodSupply,
    values: Record<string, string>,
  ): Promise<string | null> {
    if (!values.name?.trim()) return 'Name is required'
    const updates = {
      name: values.name.trim(),
      manual_url: values.manual_url?.trim() || null,
      purchase_date: values.purchase_date || null,
      notes: values.notes?.trim() || null,
    }
    try {
      await updateFoodSupply(item.id, updates)
      setFood((items) =>
        (items ?? []).map((i) => (i.id === item.id ? { ...i, ...updates } : i)),
      )
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed to save'
    }
  }

  async function updatePlantItem(
    item: Plant,
    values: Record<string, string>,
  ): Promise<string | null> {
    if (!values.name?.trim()) return 'Name is required'
    const quantity = values.quantity ? Number(values.quantity) : 1
    if (!Number.isFinite(quantity) || quantity < 1) {
      return 'Quantity must be a positive number'
    }
    const updates = {
      name: values.name.trim(),
      quantity,
      manual_url: values.manual_url?.trim() || null,
      planted_date: values.planted_date || null,
      notes: values.notes?.trim() || null,
    }
    try {
      await updatePlant(item.id, updates)
      setPlants((items) =>
        (items ?? []).map((i) => (i.id === item.id ? { ...i, ...updates } : i)),
      )
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed to save'
    }
  }

  async function updateHardscapeItem(
    item: Hardscape,
    values: Record<string, string>,
  ): Promise<string | null> {
    if (!values.name?.trim()) return 'Name is required'
    const updates = {
      name: values.name.trim(),
      manual_url: values.manual_url?.trim() || null,
      purchase_date: values.purchase_date || null,
      notes: values.notes?.trim() || null,
    }
    try {
      await updateHardscape(item.id, updates)
      setHardscape((items) =>
        (items ?? []).map((i) => (i.id === item.id ? { ...i, ...updates } : i)),
      )
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed to save'
    }
  }

  async function updateWaterTreatmentItem(
    item: WaterTreatment,
    values: Record<string, string>,
  ): Promise<string | null> {
    if (!values.name?.trim()) return 'Name is required'
    const updates = {
      name: values.name.trim(),
      manual_url: values.manual_url?.trim() || null,
      purchase_date: values.purchase_date || null,
      notes: values.notes?.trim() || null,
    }
    try {
      await updateWaterTreatment(item.id, updates)
      setWaterTreatments((items) =>
        (items ?? []).map((i) => (i.id === item.id ? { ...i, ...updates } : i)),
      )
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed to save'
    }
  }

  async function updateFishItem(
    item: Fish,
    values: Record<string, string>,
  ): Promise<string | null> {
    if (!values.name?.trim()) return 'Name is required'
    const tankGallons = values.tank_gallons ? Number(values.tank_gallons) : null
    if (values.tank_gallons && !Number.isFinite(tankGallons)) {
      return 'Tank size must be a number'
    }
    const updates = {
      name: values.name.trim(),
      species: values.species?.trim() || null,
      acquired_date: values.acquired_date || null,
      notes: values.notes?.trim() || null,
      tank_gallons: tankGallons,
      tank_setup_date: values.tank_setup_date || null,
    }
    try {
      await updateFish(item.id, updates)
      setFish((items) =>
        (items ?? []).map((i) => (i.id === item.id ? { ...i, ...updates } : i)),
      )
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed to save'
    }
  }

  async function removeFromCategory(target: EditingItem): Promise<void> {
    switch (target.category) {
      case 'Equipment':
        return removeItem(target.item, equipment ?? [], setEquipment, setEquipmentRowError, deleteEquipment)
      case 'Food':
        return removeItem(target.item, food ?? [], setFood, setFoodRowError, deleteFoodSupply)
      case 'Plants':
        return removeItem(target.item, plants ?? [], setPlants, setPlantsRowError, deletePlant)
      case 'Fish':
        return removeItem(target.item, fish ?? [], setFish, setFishRowError, deleteFish)
      case 'Hardscape':
        return removeItem(target.item, hardscape ?? [], setHardscape, setHardscapeRowError, deleteHardscape)
      case 'Water Treatment':
        return removeItem(
          target.item,
          waterTreatments ?? [],
          setWaterTreatments,
          setWaterTreatmentsRowError,
          deleteWaterTreatment,
        )
    }
  }

  async function handleEditItem(
    target: EditingItem,
    newCategory: ItemCategory,
    values: Record<string, string>,
  ): Promise<string | null> {
    if (newCategory === target.category) {
      switch (target.category) {
        case 'Equipment':
          return updateEquipmentItem(target.item, values)
        case 'Food':
          return updateFoodItem(target.item, values)
        case 'Plants':
          return updatePlantItem(target.item, values)
        case 'Fish':
          return updateFishItem(target.item, values)
        case 'Hardscape':
          return updateHardscapeItem(target.item, values)
        case 'Water Treatment':
          return updateWaterTreatmentItem(target.item, values)
      }
    }

    // Changing category means moving the item to a different table. Create
    // the new row first so nothing is lost if that fails, then remove the
    // old one — a failed cleanup leaves a visible duplicate instead of data loss.
    const createError = await handleCreateItem(newCategory, values)
    if (createError) return createError
    await removeFromCategory(target)
    return null
  }

  async function handleCreateWaterChange(
    values: Record<string, string>,
  ): Promise<string | null> {
    if (!values.changed_at) return 'Date is required'
    const amount = Number(values.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return 'Amount must be a positive number'
    }
    try {
      const created = await createWaterChange({
        changed_at: values.changed_at,
        amount_gallons: amount,
        notes: values.notes?.trim() || null,
      })
      setWaterChanges((items) => {
        const next = [...(items ?? []), created]
        next.sort(
          (a, b) =>
            b.changed_at.localeCompare(a.changed_at) ||
            b.created_at.localeCompare(a.created_at),
        )
        return next
      })
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Failed to add'
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-6 px-5 pt-5 pb-28 sm:min-h-0 sm:my-12 sm:rounded-card sm:border sm:border-line sm:bg-surface sm:px-6 sm:pt-6 sm:pb-10 sm:shadow-[0_24px_60px_-16px_rgba(20,20,55,0.35)]">
      <div>
        <BackLink to="/settings" label="Settings" />
        <h1 className="text-title font-sans text-ink">Tank Info</h1>
        <p className="text-caption font-sans text-ink-3">
          Equipment, food, plants, hardscape, treatments, residents, and water changes
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <TabNav tabs={TABS} value={tab} onChange={setTab} />

        {tab === 'Water Changes' ? (
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => setWaterModalOpen(true)}
          >
            <Icon name="plus" size={18} />
            Log a water change
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => {
              setAddCategory(tab)
              setAddModalOpen(true)
            }}
          >
            <Icon name="plus" size={18} />
            Add new item
          </Button>
        )}
      </div>

      {tab === 'Equipment' && (
        <EntityManager<Equipment>
          items={equipment}
          loadError={equipmentLoadError}
          rowError={equipmentRowError}
          fields={EQUIPMENT_FIELDS}
          displayField={(item, f) =>
            f.key === 'manual_url'
              ? item.manual_url
              : f.key === 'purchase_date'
                ? item.purchase_date
                : null
          }
          onToggleActive={(item) =>
            toggleActive(item, setEquipment, setEquipmentRowError, updateEquipment)
          }
          onMove={(item, direction) =>
            moveItem(
              item,
              direction,
              equipment ?? [],
              setEquipment,
              setEquipmentRowError,
              swapEquipmentOrder,
            )
          }
          onEdit={(item) => setEditing({ category: 'Equipment', item })}
          onDelete={(item) =>
            removeItem(item, equipment ?? [], setEquipment, setEquipmentRowError, deleteEquipment)
          }
        />
      )}

      {tab === 'Food' && (
        <EntityManager<FoodSupply>
          items={food}
          loadError={foodLoadError}
          rowError={foodRowError}
          fields={FOOD_FIELDS}
          displayField={(item, f) =>
            f.key === 'manual_url'
              ? item.manual_url
              : f.key === 'purchase_date'
                ? item.purchase_date
                : null
          }
          onToggleActive={(item) => toggleActive(item, setFood, setFoodRowError, updateFoodSupply)}
          onMove={(item, direction) =>
            moveItem(item, direction, food ?? [], setFood, setFoodRowError, swapFoodSupplyOrder)
          }
          onEdit={(item) => setEditing({ category: 'Food', item })}
          onDelete={(item) =>
            removeItem(item, food ?? [], setFood, setFoodRowError, deleteFoodSupply)
          }
        />
      )}

      {tab === 'Plants' && (
        <EntityManager<Plant>
          items={plants}
          loadError={plantsLoadError}
          rowError={plantsRowError}
          fields={PLANT_FIELDS}
          displayField={(item, f) =>
            f.key === 'quantity'
              ? String(item.quantity)
              : f.key === 'manual_url'
                ? item.manual_url
                : f.key === 'planted_date'
                  ? item.planted_date
                  : null
          }
          onToggleActive={(item) => toggleActive(item, setPlants, setPlantsRowError, updatePlant)}
          onMove={(item, direction) =>
            moveItem(item, direction, plants ?? [], setPlants, setPlantsRowError, swapPlantOrder)
          }
          onEdit={(item) => setEditing({ category: 'Plants', item })}
          onDelete={(item) =>
            removeItem(item, plants ?? [], setPlants, setPlantsRowError, deletePlant)
          }
        />
      )}

      {tab === 'Fish' && (
        <EntityManager<Fish>
          items={fish}
          loadError={fishLoadError}
          rowError={fishRowError}
          fields={FISH_FIELDS}
          displayField={(item, f) =>
            f.key === 'species'
              ? item.species
              : f.key === 'acquired_date'
                ? item.acquired_date
                : f.key === 'tank_gallons'
                  ? item.tank_gallons != null ? `${item.tank_gallons} gal` : null
                  : f.key === 'tank_setup_date'
                    ? item.tank_setup_date
                    : null
          }
          onToggleActive={(item) => toggleActive(item, setFish, setFishRowError, updateFish)}
          onMove={(item, direction) =>
            moveItem(item, direction, fish ?? [], setFish, setFishRowError, swapFishOrder)
          }
          onEdit={(item) => setEditing({ category: 'Fish', item })}
          onDelete={(item) =>
            removeItem(item, fish ?? [], setFish, setFishRowError, deleteFish)
          }
        />
      )}

      {tab === 'Hardscape' && (
        <EntityManager<Hardscape>
          items={hardscape}
          loadError={hardscapeLoadError}
          rowError={hardscapeRowError}
          fields={HARDSCAPE_FIELDS}
          displayField={(item, f) =>
            f.key === 'manual_url'
              ? item.manual_url
              : f.key === 'purchase_date'
                ? item.purchase_date
                : null
          }
          onToggleActive={(item) =>
            toggleActive(item, setHardscape, setHardscapeRowError, updateHardscape)
          }
          onMove={(item, direction) =>
            moveItem(
              item,
              direction,
              hardscape ?? [],
              setHardscape,
              setHardscapeRowError,
              swapHardscapeOrder,
            )
          }
          onEdit={(item) => setEditing({ category: 'Hardscape', item })}
          onDelete={(item) =>
            removeItem(item, hardscape ?? [], setHardscape, setHardscapeRowError, deleteHardscape)
          }
        />
      )}

      {tab === 'Water Treatment' && (
        <EntityManager<WaterTreatment>
          items={waterTreatments}
          loadError={waterTreatmentsLoadError}
          rowError={waterTreatmentsRowError}
          fields={WATER_TREATMENT_FIELDS}
          displayField={(item, f) =>
            f.key === 'manual_url'
              ? item.manual_url
              : f.key === 'purchase_date'
                ? item.purchase_date
                : null
          }
          onToggleActive={(item) =>
            toggleActive(item, setWaterTreatments, setWaterTreatmentsRowError, updateWaterTreatment)
          }
          onMove={(item, direction) =>
            moveItem(
              item,
              direction,
              waterTreatments ?? [],
              setWaterTreatments,
              setWaterTreatmentsRowError,
              swapWaterTreatmentOrder,
            )
          }
          onEdit={(item) => setEditing({ category: 'Water Treatment', item })}
          onDelete={(item) =>
            removeItem(
              item,
              waterTreatments ?? [],
              setWaterTreatments,
              setWaterTreatmentsRowError,
              deleteWaterTreatment,
            )
          }
        />
      )}

      {tab === 'Water Changes' && (
        <WaterChangeLog
          items={waterChanges}
          loadError={waterChangesLoadError}
          rowError={waterChangesRowError}
          onDelete={async (item) => {
            const previous = waterChanges
            setWaterChanges((items) => (items ?? []).filter((i) => i.id !== item.id))
            setWaterChangesRowError(null)
            try {
              await deleteWaterChange(item.id)
            } catch (err) {
              setWaterChanges(previous)
              setWaterChangesRowError(
                err instanceof Error ? err.message : 'Failed to delete',
              )
            }
          }}
        />
      )}

      {addModalOpen && (
        <AddItemModal
          onClose={() => setAddModalOpen(false)}
          category={addCategory}
          onCategoryChange={setAddCategory}
          onCreate={handleCreateItem}
        />
      )}
      {waterModalOpen && (
        <LogWaterChangeModal
          onClose={() => setWaterModalOpen(false)}
          onCreate={handleCreateWaterChange}
        />
      )}
      {editing && (
        <EditItemModal
          editing={editing}
          onClose={() => setEditing(null)}
          onSubmit={(newCategory, values) => handleEditItem(editing, newCategory, values)}
        />
      )}
    </main>
  )
}
