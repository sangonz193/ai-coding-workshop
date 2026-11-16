import './style.css'
import { $, deck } from './deck'
import { indexOf, move, stops, welcome, type Position } from './state'
import { budget, clock, drift, planned } from './pace'
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

const timing = 'ai-coding-workshop:clock'
let pace: { start: number | null; stepAt: number; index: number } = JSON.parse(localStorage.getItem(timing) ?? 'null') ?? { start: null, stepAt: 0, index: 0 }

function track(p: Position) {
  const now = Date.now()
  if (p === welcome) pace = { start: null, stepAt: now, index: 0 }
  else if (pace.index !== indexOf(p)) pace = { start: pace.start ?? now, stepAt: now, index: indexOf(p) }
  localStorage.setItem(timing, JSON.stringify(pace))
}

function renderPace() {
  $('pace').hidden = here === welcome || pace.start === null
  if (pace.start === null) return
  const now = Date.now()
  const elapsed = (now - pace.start) / 1000
  const onStep = (now - pace.stepAt) / 1000
  const behind = drift(here, elapsed, onStep)
  $('pace-time').textContent = `${clock(elapsed)} of ${clock(planned)}`
  $('pace-drift').textContent = Math.abs(behind) < 15 ? 'On time' : `${clock(behind)} ${behind > 0 ? 'behind' : 'ahead'}`
  $('pace-drift').dataset.state = Math.abs(behind) < 15 ? 'on' : behind > 0 ? 'behind' : 'ahead'
  const share = onStep / budget(here)
  $('pace-fill').style.width = `${Math.min(100, share * 100)}%`
  $('pace').dataset.state = share > 1.3 ? 'late' : share > 1 ? 'over' : 'ok'
  $('pace-step').textContent = `${clock(onStep)} of ${clock(budget(here))} on this step`
}
setInterval(renderPace, 1000)

function show(p: Position) {
  here = p
  track(p)
  renderPace()
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

if (supabase) {
  const { auth } = supabase
  const { data } = await auth.getSession()
  if (data.session) join(true)
  else {
    const signin = $('signin') as HTMLFormElement
    signin.hidden = false
    signin.onsubmit = async (e) => {
      e.preventDefault()
      const { error } = await auth.signInWithPassword({
        email: ($('email') as HTMLInputElement).value,
        password: ($('password') as HTMLInputElement).value,
      })
      $('signin-error').textContent = error?.message ?? ''
      if (error) return
      signin.hidden = true
      join(true)
    }
  }
}
