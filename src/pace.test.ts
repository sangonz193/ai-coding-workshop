import { expect, test } from 'vitest'
import { budget, clock, drift, planned } from './pace'
import { budgets, scenes } from './story'

test('every step has a time budget', () => {
  expect(budgets.map((steps) => steps.length)).toEqual(scenes.map((s) => s.steps.length))
})

test('the plan lasts between 30 and 40 minutes', () => {
  expect(planned).toBeGreaterThanOrEqual(30 * 60)
  expect(planned).toBeLessThanOrEqual(40 * 60)
})

test('is on time when arriving as planned and within the step budget', () => {
  expect(drift({ scene: 1, step: 0 }, 90 + 30, 30)).toBe(0)
})

test('counts a late arrival and an overrun as behind, an early arrival as ahead', () => {
  expect(drift({ scene: 1, step: 0 }, 120 + 10, 10)).toBe(30)
  expect(drift({ scene: 0, step: 0 }, 100, 100)).toBe(100 - budget({ scene: 0, step: 0 }))
  expect(drift({ scene: 1, step: 0 }, 60 + 10, 10)).toBe(-30)
})

test('formats durations as minutes and seconds', () => {
  expect(clock(80)).toBe('1:20')
  expect(clock(-5)).toBe('0:05')
})
