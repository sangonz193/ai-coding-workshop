import { expect, test } from 'vitest'
import { find, move, newest, stops } from './state'

test('steps through reveals, then across chapters', () => {
  expect(move({ scene: 1, step: 0 }, 1)).toEqual({ scene: 1, step: 1 })
  expect(move({ scene: 1, step: 10 }, 1)).toEqual({ scene: 2, step: 0 })
  expect(move({ scene: 2, step: 0 }, -1)).toEqual({ scene: 1, step: 10 })
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

test('follows the most recently published position', () => {
  expect(newest([{ scene: 1, step: 2, at: 5 }, { scene: 2, step: 0, at: 9 }, { scene: 1, step: 4, at: 7 }])).toEqual({ scene: 2, step: 0, at: 9 })
})

test('ignores published positions that do not exist or have no time', () => {
  expect(newest([{ scene: 1, step: 2, at: 5 }, { scene: 0, step: 9, at: 9 }, { scene: 2, step: 0 }, null])).toEqual({ scene: 1, step: 2, at: 5 })
  expect(newest([])).toBeUndefined()
})
