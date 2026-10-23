import { expect, test } from 'vitest'
import { find, move, stops } from './state'

test('steps through reveals, then across chapters', () => {
  expect(move({ scene: 0, step: 0 }, 1)).toEqual({ scene: 0, step: 1 })
  expect(move({ scene: 0, step: 1 }, 1)).toEqual({ scene: 1, step: 0 })
  expect(move({ scene: 1, step: 0 }, -1)).toEqual({ scene: 0, step: 1 })
})

test('stays put at either end', () => {
  expect(move(stops[0], -1)).toBe(stops[0])
  expect(move(stops.at(-1)!, 1)).toBe(stops.at(-1))
})

test('rejects positions that do not exist', () => {
  expect(find({ scene: 0, step: 9 })).toBeUndefined()
  expect(find('garbage')).toBeUndefined()
  expect(find(null)).toBeUndefined()
})
