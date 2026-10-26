import type { Position } from './state'
import { budgets } from './story'

const order = budgets.flatMap((steps, scene) => steps.map((seconds, step) => ({ scene, step, seconds })))
const at = (p: Position) => order.findIndex((s) => s.scene === p.scene && s.step === p.step)

export const planned = order.reduce((total, s) => total + s.seconds, 0)

export const budget = (p: Position) => order[at(p)]?.seconds ?? 0

// Positive means behind plan: late arrival at this step plus any overrun on it.
export function drift(p: Position, elapsed: number, onStep: number) {
  const start = order.slice(0, at(p)).reduce((total, s) => total + s.seconds, 0)
  return elapsed - onStep - start + Math.max(0, onStep - budget(p))
}

export const clock = (seconds: number) => `${Math.floor(Math.abs(seconds) / 60)}:${String(Math.floor(Math.abs(seconds) % 60)).padStart(2, '0')}`
