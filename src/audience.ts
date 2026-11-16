import './style.css'
import { $, deck } from './deck'
import { renderSVG } from 'uqr'
import { move, welcome, type Position } from './state'
import { join, latest, latestQr, onLive, supabase } from './sync'
import { createWorkshop } from './workshop'

const stage = createWorkshop($('stage'))
$('join-url').textContent = location.host
$('join-code').innerHTML = renderSVG(location.origin, { border: 2, blackColor: '#2a2420', whiteColor: '#f3ebdc' })
if (!stage) document.body.classList.add('no-3d')
// Without a live channel there is no speaker to follow, so the talk is self-guided and skips the join screen.
const live = Boolean(supabase)
let following = live
let here = live ? latest() : move(welcome, 1)
const render = deck((p) => {
  following = false
  show(live || p !== welcome ? p : here)
}, live)
$('follow').hidden = !live

function show(p: Position, qr = false) {
  here = p
  document.body.classList.toggle('joining', p === welcome)
  document.body.classList.toggle('qr', qr)
  render(p)
  stage?.show(p, following)
  $('follow').textContent = following ? 'Explore on my own' : 'Rejoin live'
  $('status').textContent = following
    ? 'Following the speaker'
    : `${live ? 'Exploring on your own. ' : ''}Drag to turn, scroll or pinch to zoom.`
}

$('follow').onclick = () => {
  following = !following
  if (following) show(latest(), latestQr())
  else show(here)
}
onLive((p, qr) => following && show(p, qr))
show(here, latestQr())
join()
