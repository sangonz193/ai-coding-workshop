import { find, move, stops, type Position } from './state'
import { scenes } from './story'

export const $ = (id: string) => document.getElementById(id)!

const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ' ': 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 }

export function deck(go: (p: Position) => void) {
  let here = stops[0]
  const chapters = $('chapters') as HTMLSelectElement
  chapters.append(...scenes.map((s, i) => new Option(`${i + 1}. ${s.chapter}`, String(i))))
  chapters.onchange = () => go(find({ scene: +chapters.value, step: 0 })!)
  $('prev').onclick = () => go(move(here, -1))
  $('next').onclick = () => go(move(here, 1))
  addEventListener('keydown', (e) => {
    const dir = keys[e.key]
    if (!dir || e.altKey || e.metaKey || e.ctrlKey || e.target instanceof HTMLSelectElement) return
    if (e.key === ' ' && e.target instanceof HTMLButtonElement) return
    e.preventDefault()
    go(move(here, dir))
  })
  return (p: Position) => {
    here = p
    const s = scenes[p.scene]
    $('chapter').textContent = `${p.scene + 1} of ${scenes.length} · ${s.chapter}`
    $('title').textContent = s.title
    $('text').textContent = s.steps[p.step][0]
    chapters.value = String(p.scene)
  }
}
