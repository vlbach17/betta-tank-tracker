export interface Parameter {
  id: string
  name: string
  unit: string
  ideal_min: number | null
  ideal_max: number | null
  sort_order: number
  active: boolean
}

export interface Reading {
  id: string
  parameter_id: string
  value: number
  tested_at: string
  note: string | null
  created_at: string
}

export interface Equipment {
  id: string
  name: string
  manual_url: string | null
  purchase_date: string | null
  notes: string | null
  sort_order: number
  active: boolean
}

export interface FoodSupply {
  id: string
  name: string
  notes: string | null
  sort_order: number
  active: boolean
}

export interface Plant {
  id: string
  name: string
  quantity: number
  planted_date: string | null
  notes: string | null
  sort_order: number
  active: boolean
}

export interface Fish {
  id: string
  name: string
  species: string | null
  acquired_date: string | null
  notes: string | null
  sort_order: number
  active: boolean
}
