import './style.css'
import { $, deck } from './deck'
import { indexOf, move, stops, type Position } from './state'
import { answers, scenes } from './story'
import { join, latest, onLive, publish, supabase } from './sync'
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

$('answers').append(
  ...answers.map(([question, answer]) => {
    const item = document.createElement('details')
    item.append(Object.assign(document.createElement('summary'), { textContent: question }), Object.assign(document.createElement('p'), { textContent: answer }))
    return item
  }),
)
onLive(show)
show(latest())

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
