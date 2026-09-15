import {
  TEMPERATURE_PARAMETER_NAME,
  convertTempForDisplay,
  convertTempForStorage,
  tempUnitLabel,
  type TempUnit,
} from './temperature'

export interface DisplayUnitParameter {
  name: string
  unit: string
}

export function getDisplayUnit(
  parameter: DisplayUnitParameter,
  tempUnit: TempUnit,
): string {
  if (parameter.name === TEMPERATURE_PARAMETER_NAME) return tempUnitLabel(tempUnit)
  return parameter.unit
}

export function toDisplayValue(
  value: number,
  parameter: DisplayUnitParameter,
  tempUnit: TempUnit,
): number {
  if (parameter.name === TEMPERATURE_PARAMETER_NAME) {
    return convertTempForDisplay(value, tempUnit)
  }
  return value
}

/** Inverse of toDisplayValue, for turning an edited display value back into storage units. */
export function toStorageValue(
  value: number,
  parameter: DisplayUnitParameter,
  tempUnit: TempUnit,
): number {
  if (parameter.name === TEMPERATURE_PARAMETER_NAME) {
    return convertTempForStorage(value, tempUnit)
  }
  return value
}
