import './style.css'
import { $, deck } from './deck'
import { renderSVG } from 'uqr'
import { welcome, type Position } from './state'
import { join, latest, latestQr, onLive } from './sync'
import { createWorkshop } from './workshop'

const stage = createWorkshop($('stage'))
$('join-url').textContent = location.host
$('join-code').innerHTML = renderSVG(location.origin, { border: 2, blackColor: '#2a2420', whiteColor: '#f3ebdc' })
if (!stage) document.body.classList.add('no-3d')
let following = true
let here = latest()
const render = deck((p) => {
  following = false
  show(p)
})

function show(p: Position, qr = false) {
  here = p
  document.body.classList.toggle('joining', p === welcome)
  document.body.classList.toggle('qr', qr)
  render(p)
  stage?.show(p)
  $('follow').textContent = following ? 'Explore on my own' : 'Rejoin live'
  $('status').textContent = following ? 'Following the speaker' : 'Exploring on your own. Drag the desks to look around.'
}

$('follow').onclick = () => {
  following = !following
  if (following) show(latest(), latestQr())
  else show(here)
}
onLive((p, qr) => following && show(p, qr))
show(here, latestQr())
join()
