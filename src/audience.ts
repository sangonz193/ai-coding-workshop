import './style.css'
import { $, deck } from './deck'
import type { Position } from './state'
import { latest, onLive } from './sync'
import { createWorkshop } from './workshop'

const stage = createWorkshop($('stage'))
if (!stage) document.body.classList.add('no-3d')
let following = true
let here = latest()
const render = deck((p) => {
  following = false
  show(p)
})

function show(p: Position) {
  here = p
  render(p)
  stage?.show(p)
  $('follow').textContent = following ? 'Explore on my own' : 'Rejoin live'
  $('status').textContent = following ? 'Following the speaker' : 'Exploring on your own. Drag the desks to look around.'
}

$('follow').onclick = () => {
  following = !following
  show(following ? latest() : here)
}
onLive((p) => following && show(p))
show(here)
