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
