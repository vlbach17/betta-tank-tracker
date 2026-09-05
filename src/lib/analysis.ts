import type { Reading } from '../types/database'

export interface Swing {
  delta: number
  from: Reading
  to: Reading
}

/** readingsAscending must be sorted oldest first. */
export function getLargestSwing(readingsAscending: Reading[]): Swing | null {
  let largest: Swing | null = null

  for (let i = 1; i < readingsAscending.length; i++) {
    const from = readingsAscending[i - 1]
    const to = readingsAscending[i]
    const delta = Math.abs(to.value - from.value)
    if (!largest || delta > largest.delta) {
      largest = { delta, from, to }
    }
  }

  return largest
}
