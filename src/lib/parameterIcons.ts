import type { IconName } from '../components/Icon'
import { TEMPERATURE_PARAMETER_NAME } from './temperature'

/**
 * Seed-parameter names only. A custom parameter added from Settings has no
 * icon — PARAMETER_ICONS returns undefined and callers render without one.
 */
const PARAMETER_ICONS: Record<string, IconName> = {
  pH: 'beaker',
  Ammonia: 'beakerPlus',
  Nitrite: 'bubbles',
  Nitrate: 'wave',
  'Carbonate hardness (KH)': 'fishBowl',
  'General hardness (GH)': 'fish',
  [TEMPERATURE_PARAMETER_NAME]: 'thermometer',
}

export function getParameterIcon(name: string): IconName | undefined {
  return PARAMETER_ICONS[name]
}
