import { scenes } from './story'

export type Position = { scene: number; step: number }

export const stops: Position[] = scenes.flatMap((s, scene) => s.steps.map((_, step) => ({ scene, step })))

export const find = (value: unknown) => {
  const p = value as Partial<Position> | null
  return stops.find((s) => s.scene === p?.scene && s.step === p?.step)
}

export type Live = Position & { at: number }

export const newest = (values: unknown[]) =>
  values.reduce<Live | undefined>((best, value) => {
    const p = find(value)
    const at = (value as Partial<Live> | null)?.at
    return p && typeof at === 'number' && at > (best?.at ?? -Infinity) ? { ...p, at } : best
  }, undefined)

export const indexOf = (p: Position) => stops.indexOf(find(p)!)

export const move = (p: Position, dir: number) => stops[Math.min(stops.length - 1, Math.max(0, indexOf(p) + dir))]
