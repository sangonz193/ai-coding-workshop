import { find, stops, type Position } from './state'

const channel = new BroadcastChannel('workshop-live')
const key = 'workshop-live:latest'

export function publish(p: Position) {
  localStorage.setItem(key, JSON.stringify(p))
  channel.postMessage(p)
}

export function latest() {
  try {
    return find(JSON.parse(localStorage.getItem(key) ?? 'null')) ?? stops[0]
  } catch {
    return stops[0]
  }
}

export const onLive = (cb: (p: Position) => void) =>
  channel.addEventListener('message', (e) => {
    const p = find(e.data)
    if (p) cb(p)
  })
