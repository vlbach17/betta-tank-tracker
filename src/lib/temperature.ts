export type TempUnit = 'F' | 'C'

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32
}

/** Stored readings are always Fahrenheit; convert only for display. */
export function convertTempForDisplay(valueF: number, unit: TempUnit): number {
  return unit === 'C' ? fahrenheitToCelsius(valueF) : valueF
}

/** Inverse of convertTempForDisplay, for turning an edited display value back into storage units. */
export function convertTempForStorage(value: number, unit: TempUnit): number {
  return unit === 'C' ? celsiusToFahrenheit(value) : value
}

/** A Fahrenheit delta (e.g. a swing between two readings) has no +32 offset to undo. */
export function convertTempDeltaForDisplay(
  deltaF: number,
  unit: TempUnit,
): number {
  return unit === 'C' ? (deltaF * 5) / 9 : deltaF
}

export function tempUnitLabel(unit: TempUnit): string {
  return unit === 'C' ? '°C' : '°F'
}

export const TEMPERATURE_PARAMETER_NAME = 'Temperature'
