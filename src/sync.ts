import { createClient, type RealtimeChannel, type SupabaseClient } from '@supabase/supabase-js'
import { find, newest, stops, type Live, type Position } from './state'

export const supabase = import.meta.env.VITE_SUPABASE_URL
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  : undefined
const topic = 'ai-coding-workshop'
const key = 'ai-coding-workshop:published'
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
let channel: RealtimeChannel | undefined
let trackedAt = 0
let pendingTrack: ReturnType<typeof setTimeout> | undefined

function receive(live: Live | undefined) {
  if (!live || live.at <= (current?.at ?? -Infinity)) return
  current = live
  listeners.forEach((cb) => cb(find(live)!, live.qr))
}

// Realtime closes the channel of a client that sends more than 5 presence updates in 30 seconds, so every step
// goes out as a broadcast and presence, which late joiners read, is refreshed at most every 8 seconds.
function track() {
  clearTimeout(pendingTrack)
  const wait = trackedAt + 8000 - Date.now()
  if (wait > 0) return void (pendingTrack = setTimeout(track, wait))
  trackedAt = Date.now()
  if (current) channel?.track(current)
}

function connect(client: SupabaseClient) {
  const mine = client.channel(topic, { config: { private: true } })
  channel = mine
  mine.on('presence', { event: 'sync' }, () => receive(newest(Object.values(mine.presenceState()).flat())))
  mine.on('broadcast', { event: 'step' }, ({ payload }) => receive(newest([payload])))
  mine.subscribe((status) => {
    if (channel !== mine) return
    if (status === 'SUBSCRIBED') {
      if (presenting) track()
      return
    }
    channel = undefined
    void client.removeChannel(mine).finally(() => setTimeout(() => connect(client), 2000))
  })
}

export function join(asPresenter = false) {
  presenting = asPresenter
  if (!supabase) return
  if (!channel) connect(supabase)
  else if (asPresenter) track()
}

export function publish(p: Position, qr = false) {
  current = { ...p, at: Date.now(), qr }
  localStorage.setItem(key, JSON.stringify(current))
  if (!presenting) return
  channel?.send({ type: 'broadcast', event: 'step', payload: current })
  track()
}

export const latest = () => (current && find(current)) ?? stops[0]

export const latestQr = () => current?.qr ?? false

export const onLive = (cb: (p: Position, qr: boolean) => void) => listeners.push(cb)
