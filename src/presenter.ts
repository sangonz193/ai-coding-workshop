import './style.css'
import { $, deck } from './deck'
import { indexOf, move, stops, type Position } from './state'
import { scenes } from './story'
import { latest, onLive, publish } from './sync'
import { createWorkshop } from './workshop'

const stage = createWorkshop($('stage'))
const render = deck((p) => {
  publish(p)
  show(p)
})

function show(p: Position) {
  render(p)
  stage?.show(p)
  const next = move(p, 1)
  $('notes').textContent = scenes[p.scene].steps[p.step][1]
  $('upcoming').textContent = next === p ? 'End of the talk.' : scenes[next.scene].steps[next.step][0]
  $('counter').textContent = `Step ${p.step + 1} of ${scenes[p.scene].steps.length} · ${indexOf(p) + 1} of ${stops.length} overall`
}

onLive(show)
show(latest())
