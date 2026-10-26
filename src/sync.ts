import { createClient } from '@supabase/supabase-js'
import { find, newest, stops, type Position } from './state'

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
const channel = supabase.channel('harness-training', { config: { private: true } })
const key = 'harness-training:published'
const listeners: ((p: Position, qr: boolean) => void)[] = []

function published() {
  try {
    return newest([JSON.parse(localStorage.getItem(key) ?? 'null')])
  } catch {
    return undefined
  }
}

let current = published()
let presenting = false

channel.on('presence', { event: 'sync' }, () => {
  const live = newest(Object.values(channel.presenceState()).flat())
  if (!live || live.at <= (current?.at ?? -Infinity)) return
  current = live
  const p = find(live)!
  listeners.forEach((cb) => cb(p, live.qr))
})

// Presence is dropped on every disconnect, so the presenter re-announces its last step after each (re)join.
export const join = (asPresenter = false) =>
  channel.subscribe((status) => {
    if (!asPresenter || status !== 'SUBSCRIBED') return
    presenting = true
    const mine = published()
    if (mine) channel.track(mine)
  })

export function publish(p: Position, qr = false) {
  current = { ...p, at: Date.now(), qr }
  localStorage.setItem(key, JSON.stringify(current))
  if (presenting) channel.track(current)
}

export const latest = () => (current && find(current)) ?? stops[0]

export const latestQr = () => current?.qr ?? false

export const onLive = (cb: (p: Position, qr: boolean) => void) => listeners.push(cb)
