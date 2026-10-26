import './style.css'
import { $, deck } from './deck'
import { indexOf, move, stops, welcome, type Position } from './state'
import { answers, scenes } from './story'
import { join, latest, latestQr, onLive, publish, supabase } from './sync'
import { createWorkshop } from './workshop'

const stage = createWorkshop($('stage'))
let here = latest()
let qr = latestQr()
const render = deck((p) => {
  publish(p, qr)
  show(p)
})

function toggleQr() {
  qr = !qr
  publish(here, qr)
  show(here)
}

function show(p: Position) {
  here = p
  render(p)
  stage?.show(p)
  const next = move(p, 1)
  $('qr').textContent = qr ? 'Hide join code' : 'Show join code'
  $('qr').setAttribute('aria-pressed', String(qr))
  $('upcoming').textContent = next === p ? 'End of the talk.' : scenes[next.scene].steps[next.step][0]
  if (p === welcome) {
    $('notes').textContent = 'Waiting screen. Leave it up while people scan the code and the room fills.'
    $('counter').textContent = `Join screen · ${stops.length - 1} steps to go`
    return
  }
  $('notes').textContent = scenes[p.scene].steps[p.step][1]
  $('counter').textContent = `Step ${p.step + 1} of ${scenes[p.scene].steps.length} · ${indexOf(p)} of ${stops.length - 1} overall`
}

$('qr').onclick = toggleQr
addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'q' && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement)) toggleQr()
})

$('answers').append(
  ...answers.map(([question, answer]) => {
    const item = document.createElement('details')
    item.append(Object.assign(document.createElement('summary'), { textContent: question }), Object.assign(document.createElement('p'), { textContent: answer }))
    return item
  }),
)
onLive((p, live) => {
  qr = live
  show(p)
})
show(here)

const signin = $('signin') as HTMLFormElement
const { data } = await supabase.auth.getSession()
if (data.session) join(true)
else {
  signin.hidden = false
  signin.onsubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({
      email: ($('email') as HTMLInputElement).value,
      password: ($('password') as HTMLInputElement).value,
    })
    $('signin-error').textContent = error?.message ?? ''
    if (error) return
    signin.hidden = true
    join(true)
  }
}
