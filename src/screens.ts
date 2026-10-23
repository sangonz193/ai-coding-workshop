type G = CanvasRenderingContext2D
type Msg = [mine: boolean, text: string]
export type Paint = (g: G, k: number, p: number, t: number) => void

const c = {
  bg: '#15161a', panel: '#1f2127', raised: '#2a2d35', line: '#3a3e48', text: '#eceae4', muted: '#8e929c',
  green: '#5cc08a', red: '#e2675b', amber: '#e5b45b', blue: '#79aefc', violet: '#c59bf5', gpt: '#4fb390', claude: '#de8a5f',
}
const sans = 'system-ui, -apple-system, sans-serif'
const mono = 'ui-monospace, Menlo, monospace'

const phase = (k: number, n: number, p: number) => (k < n ? 0 : k === n ? p : 1)

function box(g: G, x: number, y: number, w: number, h: number, fill: string, r = 0) {
  g.fillStyle = fill
  g.beginPath()
  g.roundRect(x, y, w, h, r)
  g.fill()
}

function text(g: G, s: string, x: number, y: number, size: number, fill = c.text, weight = 500, font = sans) {
  g.font = `${weight} ${size}px ${font}`
  g.fillStyle = fill
  g.fillText(s, x, y)
  return x + g.measureText(s).width
}

function chrome(g: G, title: string, url?: string) {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, c.bg)
  box(g, 0, 0, w, 56, c.panel)
  ;['#ec6a5e', '#f4bf4f', '#61c554'].forEach((f, i) => box(g, 24 + i * 30, 19, 18, 18, f, 9))
  if (url) box(g, 140, 10, w - 280, 36, c.bg, 18)
  text(g, url ?? title, url ? 166 : 130, 37, 22, url ? c.muted : c.text)
}

function code(g: G, lines: string[], x: number, y: number, size: number, from = 1) {
  lines.forEach((line, i) => {
    const ly = y + i * size * 1.55
    text(g, String(from + i), x, ly, size, c.line, 400, mono)
    let cx = x + size * 2.4
    for (const part of line.split(/('[^']*'|\b(?:import|export|const|return|from|function)\b)/)) {
      const color = part.startsWith("'") ? c.green : /^[a-z]+$/.test(part) && /import|export|const|return|from|function/.test(part) ? c.violet : c.text
      cx = text(g, part, cx, ly, size, color, 400, mono)
    }
  })
}

function chat(g: G, msgs: Msg[], x: number, y: number, w: number, size: number, alpha = 1) {
  g.globalAlpha = alpha
  for (const [mine, s] of msgs) {
    g.font = `500 ${size}px ${sans}`
    const tw = Math.min(g.measureText(s).width, w * 0.85 - size * 1.4) + size * 1.4
    const bx = mine ? x + w - tw : x
    box(g, bx, y, tw, size * 2.2, mine ? '#3657c9' : c.raised, size)
    g.fillStyle = c.text
    g.fillText(s, bx + size * 0.7, y + size * 1.45, tw - size * 1.4)
    y += size * 2.8
  }
  g.globalAlpha = 1
  return y
}

function chip(g: G, label: string, color: string, x: number, y: number, size: number) {
  g.font = `600 ${size}px ${sans}`
  const w = g.measureText(label).width + size * 2.2
  box(g, x, y, w, size * 1.8, c.raised, size)
  box(g, x + size * 0.6, y + size * 0.6, size * 0.6, size * 0.6, color, size)
  text(g, label, x + size * 1.5, y + size * 1.3, size, c.text, 600)
  return x + w
}

const settings = [
  "import { useState } from 'react'", '', 'export function Settings() {', "  const [name, setName] = useState('')",
  "  const [theme, setTheme] = useState('light')", '  return (', '    <Form onSubmit={save}>', "      <Field label='Name' />",
  "      <Toggle label='Dark mode' />", '      <Button>Save</Button>', '    </Form>', '  )', '}', '',
]

export const generating: Paint = (g, _k, _p, t) => {
  const { width: w, height: h } = g.canvas
  chrome(g, 'settings.tsx')
  const n = Math.floor(t * 4)
  code(g, Array.from({ length: 12 }, (_, i) => settings[(n + i) % settings.length]), 40, 110, 28, n + 1)
  box(g, 40, h - 92, w - 80, 64, c.raised, 32)
  text(g, 'Build the settings screen', 76, h - 50, 28, c.muted)
}

export const pullRequest = (title: string): Paint => (g) => {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, '#f6f3ec', 28)
  box(g, 36, 36, 132, 50, c.green, 25)
  text(g, 'Open', 66, 72, 28, '#fff', 700)
  text(g, title, 36, 156, 44, '#22252b', 700)
  box(g, 36, 196, 280, 20, c.green, 10)
  box(g, 326, 196, 70, 20, c.red, 10)
  box(g, 36, 244, 300, 50, '#fbe7c3', 25)
  text(g, 'Review required', 60, 278, 26, '#8a5a12', 600)
}

const codeChat: Msg[] = [[true, 'Fix the login redirect'], [false, 'Fixed. 2 files changed']]

export const remoteCoding: Paint = (g) => {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, '#0e0f12')
  ;[['$ npx remote-coding', c.text], ['Agent: Claude or Codex', c.muted], ['Using your existing login', c.muted], ['Open the pairing link', c.green], ['in any browser', c.green]].forEach(
    ([line, color], i) => text(g, line, 28, 70 + i * 50, 28, color, 500, mono),
  )
  const x = 420
  box(g, x, 0, w - x, h, c.panel)
  box(g, x + 20, 14, w - x - 40, 40, c.bg, 20)
  text(g, 'devbox · code', x + 44, 42, 22, c.muted)
  text(g, 'code', x + 24, 110, 34, c.text, 700, mono)
  ;['Chat', 'Files', 'Terminal', 'Diff'].reduce((tx, tab, i) => text(g, tab, tx, 156, 22, i ? c.muted : c.text, 600) + 28, x + 24)
  chat(g, codeChat, x + 24, 190, w - x - 48, 24)
}

const trunk: Msg[] = [[true, 'Add dark mode to settings'], [false, 'Done: toggle, colors, saved choice']]
const branchesBy: Record<'gpt' | 'claude', Msg[]> = {
  gpt: [[true, 'Now add it to onboarding'], [false, 'On it']],
  claude: [[true, 'Review what changed'], [false, 'Two buttons lack contrast']],
}

export const paseo: Paint = (g, k, p) => {
  const { width: w, height: h } = g.canvas
  chrome(g, 'Paseo')
  box(g, 0, 56, 270, h - 56, c.panel)
  ;['eupersona', 'envwire', 'git-nav'].forEach((s, i) => {
    box(g, 26, 92 + i * 60, 16, 16, [c.green, c.amber, c.muted][i], 8)
    text(g, s, 56, 108 + i * 60, 26)
  })
  const split = phase(k, 2, p)
  const x0 = 300
  const full = w - x0 - 30
  const col = full - split * (full / 2 + 15)
  const x1 = x0 + full / 2 + 15
  g.globalAlpha = 1 - split
  chip(g, 'GPT · Codex', c.gpt, x0, 76, 22)
  g.globalAlpha = 1
  const fork = chat(g, trunk, x0, 136, full, 24)
  const top = fork + split * 110
  if (split > 0) {
    g.globalAlpha = split
    g.strokeStyle = c.line
    g.lineWidth = 4
    for (const end of [x0 + col / 2, x1 + col / 2]) {
      g.beginPath()
      g.moveTo(x0 + full / 2, fork - 6)
      g.bezierCurveTo(x0 + full / 2, fork + 30, end, fork + 10, end, fork + 44)
      g.stroke()
    }
    chip(g, 'GPT · Codex', c.gpt, x0 + col / 2 - 90, fork + 50, 22)
    chip(g, 'Claude · Anthropic', c.claude, x1 + col / 2 - 125, fork + 50, 22)
    chat(g, branchesBy.claude, x1, top, col, 24, split)
  }
  g.globalAlpha = 1
  chat(g, branchesBy.gpt, x0, top, col, 24)
}

export const remote = (kind: 'ios' | 'android' | 'browser' | 'code'): Paint => (g) => {
  const { width: w, height: h } = g.canvas
  const s = w / 16
  box(g, 0, 0, w, h, c.bg)
  if (kind === 'ios') box(g, w / 2 - s * 3, s * 0.7, s * 6, s * 1.6, '#000', s)
  else if (kind === 'android') box(g, w / 2 - s * 0.6, s * 0.9, s * 1.2, s * 1.2, '#000', s)
  else {
    box(g, 0, 0, w, s * 3.2, c.panel)
    box(g, s, s * 0.6, w - 2 * s, s * 2, c.bg, s)
    text(g, kind === 'code' ? 'devbox · code' : 'desktop · Paseo', s * 2, s * 2, s, c.muted)
  }
  const size = Math.min(s * 0.85, 26)
  if (kind === 'code') return void chat(g, codeChat, s, s * 5, w - 2 * s, size)
  chip(g, 'GPT · Codex', c.gpt, s, s * 4, s * 0.8)
  chat(g, [...trunk, ...branchesBy.gpt], s, s * 7, w - 2 * s, size)
}

const branches = ['photo-flow', 'nav-fix', 'search']

export const worktree = (i: number): Paint => (g, k, p) => {
  const { width: w, height: h } = g.canvas
  chrome(g, `app · ${branches[i]}`)
  box(g, 0, 56, 250, h - 56, c.panel)
  const env = [c.line, c.red, c.green][k]
  ;['.env.template', 'apps/web/', '  .env.template', '  .env', 'apps/mobile/', '  .env.template', '  .env'].forEach((f, j) =>
    text(g, f, 20, 96 + j * 40, 22, f === '  .env' ? env : c.text, f === '  .env' ? 700 : 400, mono),
  )
  code(g, ['NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}', 'NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}'], 270, 104, 20)
  box(g, 250, h - 230, w - 250, 230, '#0e0f12')
  const lines: [string, string][][] = [
    [[`ready: ${branches[i]}`, c.muted]],
    [['$ cp .env.example apps/web/.env', c.text], ['$ cp .env.example apps/mobile/.env', c.text], ['✗ SUPABASE_URL is not set', c.red]],
    [['$ envwire', c.text], ['compiled .env', c.green], ['compiled apps/web/.env', c.green], ['compiled apps/mobile/.env', c.green]],
  ]
  let budget = Math.floor(p * 120)
  lines[k].forEach(([s, color], j) => {
    text(g, s.slice(0, Math.max(0, budget)), 272, h - 180 + j * 46, 30, color, 600, mono)
    budget -= s.length
  })
}

export const envTemplate: Paint = (g) => {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, '#f6f3ec', 24)
  text(g, 'Envwire', 40, 64, 28, '#8a5a12', 700)
  text(g, '.env.template', 40, 124, 46, '#22252b', 700, mono)
  ;['HOST=127.0.0.1', 'SUPABASE_URL=', '  http://${HOST}:54321', 'SUPABASE_ANON_KEY=', '  local-anon-key', 'STRIPE_SECRET_KEY='].forEach((line, i) =>
    text(g, line, 40, 200 + i * 52, 28, line.startsWith(' ') ? '#5b564c' : '#22252b', 600, mono),
  )
  text(g, 'Every variable, declared once', 40, h - 44, 26, '#5b564c')
}

type Row = [lane: number, message: string]
const rows: Row[] = [
  [0, 'Squash: nav fix'], [0, 'Squash: photo flow'], [1, 'Search: filters'], [0, 'Update dependencies'],
  [3, 'Nav: back button'], [2, 'Photo: review step'], [0, 'Release 1.4'], [1, 'Search: index'], [0, 'Initial screens'],
]
const pills: [row: number, name: string, color: string, kind?: 'merged' | 'behind'][] = [
  [0, 'main', c.blue], [2, 'search', c.violet], [3, 'orchestrator', c.blue, 'behind'],
  [4, 'nav-fix', c.amber, 'merged'], [5, 'photo-flow', c.amber, 'merged'], [6, 'worktree-2', c.blue, 'behind'],
]
const lanes = [c.blue, c.violet, c.amber, c.amber]

function graph(g: G, k: number, p: number, x0: number, top: number) {
  const clean = phase(k, 2, p)
  const forward = phase(k, 3, p)
  const y = (r: number) => top + 64 * (r - clean * [4, 5].filter((m) => m < r).length)
  const lx = (lane: number) => x0 + 40 + lane * 44
  const gone = (r: number) => r === 4 || r === 5
  const link = (r1: number, l1: number, r2: number, l2: number, color: string) => {
    g.strokeStyle = color
    g.lineWidth = 6
    g.beginPath()
    g.moveTo(lx(l1), y(r1))
    g.bezierCurveTo(lx(l1), y(r2) - 30, lx(l2), y(r1) + 30, lx(l2), y(r2))
    g.stroke()
  }
  link(0, 0, 8, 0, c.blue)
  link(2, 1, 7, 1, c.violet)
  link(7, 1, 8, 0, c.violet)
  g.globalAlpha = 1 - clean
  link(4, 3, 6, 0, c.amber)
  link(5, 2, 6, 0, c.amber)
  rows.forEach(([lane, msg], r) => {
    g.globalAlpha = gone(r) ? 1 - clean : 1
    box(g, lx(lane) - 13, y(r) - 13, 26, 26, lanes[lane], 13)
    text(g, msg, x0 + 720, y(r) + 9, 26, c.muted)
  })
  let behind = 0
  for (const [r, name, color, kind] of pills) {
    const moving = kind === 'behind' ? forward : 0
    const px = x0 + 160 + (kind === 'behind' ? moving * (120 + behind++ * 190) : 0)
    g.globalAlpha = kind === 'merged' ? 1 - clean : 1
    const end = chip(g, name, color, px, y(r) + (y(0) - y(r)) * moving - 20, 22)
    if (kind === 'merged') text(g, '✓ squash-merged', end + 12, y(r) + 8, 22, c.amber)
  }
  g.globalAlpha = 1
}

export const gitNav: Paint = (g, k, p) => {
  const { width: w } = g.canvas
  const browser = phase(k, 1, p)
  if (browser < 1) {
    chrome(g, 'VS Code · Git Graph')
    box(g, 0, 56, 70, g.canvas.height, '#252526')
    graph(g, k, p, 70, 150)
  }
  if (browser === 0) return
  g.globalAlpha = browser
  chrome(g, '', 'desktop · Git Nav')
  g.globalAlpha = browser
  const buttons: [string, number][] = [[`Clean up merged (${k >= 2 ? 0 : 2})`, 2], [`Fast-forward (${k >= 3 ? 0 : 2})`, 3]]
  let bx = w - 40
  for (const [label, at] of buttons.reverse()) {
    g.font = `600 22px ${sans}`
    bx -= g.measureText(label).width + 40
    box(g, bx, 72, g.measureText(label).width + 28, 44, k === at && p < 0.6 ? c.blue : c.raised, 22)
    text(g, label, bx + 14, 101, 22, c.text, 600)
    if (k === at) box(g, bx + 40, 100, 16 + 20 * p, 16 + 20 * p, '#ffffff66', 30)
  }
  graph(g, k, p, 0, 170)
  g.globalAlpha = 1
}

const light = { bg: '#ffffff', ink: '#1d2430', soft: '#6b7480', accent: '#2f7d6d', field: '#f1f3f5' }

function appScreen(g: G, title: string) {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, light.bg)
  box(g, w / 2 - 60, 16, 120, 32, '#000', 16)
  text(g, title, 28, 120, 38, light.ink, 700)
  return { w, h }
}

export const capture: Paint = (g) => {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, '#101215')
  box(g, w / 2 - 60, 16, 120, 32, '#000', 16)
  text(g, 'Scan your card', 28, 120, 34, '#fff', 700)
  g.strokeStyle = '#fff'
  g.lineWidth = 5
  g.strokeRect(40, 240, w - 80, 220)
  box(g, w / 2 - 50, h - 160, 100, 100, '#fff', 50)
}

export const review: Paint = (g) => {
  const { w, h } = appScreen(g, 'Review photo')
  box(g, 28, 170, w - 56, 240, '#d9dee4', 16)
  box(g, 54, 200, 80, 100, '#aab3bd', 8)
  ;[150, 190, 230].forEach((y) => box(g, 154, y + 50, w - 220, 18, '#aab3bd', 9))
  box(g, 28, h - 200, w - 56, 70, light.field, 35)
  text(g, 'Retake', w / 2 - 50, h - 154, 28, light.ink, 600)
  box(g, 28, h - 110, w - 56, 70, light.accent, 35)
  text(g, 'Looks good', w / 2 - 74, h - 64, 28, '#fff', 600)
}

export const form: Paint = (g) => {
  const { w, h } = appScreen(g, 'Your details')
  ;[['Name', 'Ana Pérez'], ['Date of birth', '12 / 04 / 1990'], ['Member ID', 'EU-48213']].forEach(([label, value], i) => {
    text(g, label, 28, 190 + i * 130, 24, light.soft, 600)
    box(g, 28, 204 + i * 130, w - 56, 64, light.field, 12)
    text(g, value, 48, 246 + i * 130, 28, light.ink, 500)
    text(g, '✎', w - 78, 248 + i * 130, 30, light.accent, 700)
  })
  box(g, 28, h - 110, w - 56, 70, light.accent, 35)
  text(g, 'Continue', w / 2 - 58, h - 64, 28, '#fff', 600)
}

export const source: Paint = (g, k, p) => {
  const { width: w, height: h } = g.canvas
  chrome(g, 'eupersona')
  box(g, 0, 56, 330, h - 56, c.panel)
  const deleted = phase(k, 4, p)
  ;['screens/', '  CaptureScreen.tsx', '  PhotoReviewScreen.tsx', '  DetailsForm.tsx', 'flow.ts'].forEach((f, j) => {
    const stale = j === 2
    g.globalAlpha = stale ? 1 - deleted : 1
    text(g, f, 20, 100 + j * 42, 22, stale && k >= 2 ? c.amber : c.text, stale && k >= 2 ? 700 : 400, mono)
    if (stale && k >= 4) box(g, 20, 93 + j * 42, 300 * deleted, 3, c.red)
  })
  g.globalAlpha = 1
  if (k === 2) {
    code(g, ['export function PhotoReviewScreen() {', '  const photo = usePhoto()', '  const retake = useRetake()', '  return <Review photo={photo} />', '}'], 350, 110, 22, 1)
    box(g, 330, h - 64, w - 330, 64, '#3a2f1a')
    text(g, '454 lines · not used anywhere', 350, h - 22, 24, c.amber, 600)
    chip(g, 'Approved · noted dead code', c.green, w - 360, 11, 18)
    return
  }
  if (k >= 3) {
    const net = k === 3 ? 1 : 1 - deleted * 2
    text(g, 'Lines changed', 360, 140, 30, c.muted, 600)
    box(g, 360, 180, 560 * Math.max(0, net) + 40, 44, c.green, 8)
    box(g, 360, 250, 200 + 400 * deleted, 44, c.red, 8)
    text(g, k === 3 ? 'net: more code' : '334 lines removed, net', 360, 360, 44, k === 3 ? c.green : c.red, 700)
    return
  }
  code(g, ['export const flow = [', "  'capture',", "  'photoReview',", "  'details',", ']'], 350, 110, 26)
  if (k === 1) box(g, 395, 172, 260 * p, 4, c.red)
}
