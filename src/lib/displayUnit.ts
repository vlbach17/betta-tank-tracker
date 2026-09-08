import {
  convertHardnessForDisplay,
  convertHardnessForStorage,
  hardnessUnitLabel,
  isHardnessUnit,
  type HardnessUnit,
} from './hardness'
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
  hardnessUnit: HardnessUnit,
): string {
  if (parameter.name === TEMPERATURE_PARAMETER_NAME) return tempUnitLabel(tempUnit)
  if (isHardnessUnit(parameter.unit)) {
    return hardnessUnitLabel(parameter.unit, hardnessUnit)
  }
  return parameter.unit
}

export function toDisplayValue(
  value: number,
  parameter: DisplayUnitParameter,
  tempUnit: TempUnit,
  hardnessUnit: HardnessUnit,
): number {
  if (parameter.name === TEMPERATURE_PARAMETER_NAME) {
    return convertTempForDisplay(value, tempUnit)
  }
  if (isHardnessUnit(parameter.unit)) {
    return convertHardnessForDisplay(value, hardnessUnit)
  }
  return value
}

/** Inverse of toDisplayValue, for turning an edited display value back into storage units. */
export function toStorageValue(
  value: number,
  parameter: DisplayUnitParameter,
  tempUnit: TempUnit,
  hardnessUnit: HardnessUnit,
): number {
  if (parameter.name === TEMPERATURE_PARAMETER_NAME) {
    return convertTempForStorage(value, tempUnit)
  }
  if (isHardnessUnit(parameter.unit)) {
    return convertHardnessForStorage(value, hardnessUnit)
  }
  return value
}
