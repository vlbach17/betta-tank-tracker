import { ParameterTile } from 'betta-tank-tracker'

type Reading = {
  id: string
  parameter_id: string
  value: number
  tested_at: string
  note: string | null
  created_at: string
}

type Parameter = {
  id: string
  name: string
  unit: string
  ideal_min: number | null
  ideal_max: number | null
  sort_order: number
  active: boolean
  latestReading: Reading | null
}

const NOW = Date.now()
const hoursAgo = (h: number) => new Date(NOW - h * 3_600_000).toISOString()
const daysAgo = (d: number) => new Date(NOW - d * 86_400_000).toISOString()

function reading(value: number, testedAt: string): Reading {
  return {
    id: 'r1',
    parameter_id: 'p1',
    value,
    tested_at: testedAt,
    note: null,
    created_at: testedAt,
  }
}

function param(overrides: Partial<Parameter>): Parameter {
  return {
    id: 'p1',
    name: 'pH',
    unit: 'pH',
    ideal_min: 6.8,
    ideal_max: 7.6,
    sort_order: 0,
    active: true,
    latestReading: null,
    ...overrides,
  }
}

export const InRange = () => (
  <ParameterTile
    parameter={param({
      name: 'pH',
      unit: 'pH',
      ideal_min: 6.8,
      ideal_max: 7.6,
      latestReading: reading(7.2, hoursAgo(3)),
    })}
  />
)

export const Watch = () => (
  <ParameterTile
    parameter={param({
      name: 'Nitrate',
      unit: 'ppm',
      ideal_min: 0,
      ideal_max: 20,
      latestReading: reading(21.5, hoursAgo(6)),
    })}
  />
)

export const OutOfRange = () => (
  <ParameterTile
    parameter={param({
      name: 'Ammonia',
      unit: 'ppm',
      ideal_min: 0,
      ideal_max: 0.25,
      latestReading: reading(1.2, hoursAgo(1)),
    })}
  />
)

export const Overdue = () => (
  <ParameterTile
    parameter={param({
      name: 'General hardness (GH)',
      unit: 'dGH',
      ideal_min: 4,
      ideal_max: 8,
      latestReading: reading(6, daysAgo(20)),
    })}
  />
)

export const NoReadings = () => (
  <ParameterTile
    parameter={param({
      name: 'Carbonate hardness (KH)',
      unit: 'dKH',
      ideal_min: 3,
      ideal_max: 6,
      latestReading: null,
    })}
  />
)

export const Hero = () => (
  <ParameterTile
    hero
    parameter={param({
      name: 'Temperature',
      unit: 'F',
      ideal_min: 76,
      ideal_max: 80,
      latestReading: reading(78, hoursAgo(2)),
    })}
  />
)
