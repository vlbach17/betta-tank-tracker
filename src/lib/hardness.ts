export type HardnessUnit = 'degrees' | 'ppm'

/** 1 degree of hardness (dKH or dGH) is ~17.848 mg/L (ppm) as CaCO3. */
const DEGREES_TO_PPM = 17.848

export function degreesToPpm(degrees: number): number {
  return degrees * DEGREES_TO_PPM
}

export function ppmToDegrees(ppm: number): number {
  return ppm / DEGREES_TO_PPM
}

/** Stored readings for hardness parameters are always in degrees (dKH/dGH); convert only for display. */
export function convertHardnessForDisplay(
  valueDegrees: number,
  unit: HardnessUnit,
): number {
  return unit === 'ppm' ? degreesToPpm(valueDegrees) : valueDegrees
}

/** Inverse of convertHardnessForDisplay, for turning an edited display value back into storage units. */
export function convertHardnessForStorage(
  value: number,
  unit: HardnessUnit,
): number {
  return unit === 'ppm' ? ppmToDegrees(value) : value
}

/** A parameter's native `unit` string marks it as hardness-type (dKH or dGH), regardless of its name. */
export function isHardnessUnit(unit: string): boolean {
  return unit === 'dKH' || unit === 'dGH'
}

export function hardnessUnitLabel(
  nativeUnit: string,
  unit: HardnessUnit,
): string {
  return unit === 'ppm' ? 'ppm' : nativeUnit
}
