type G = CanvasRenderingContext2D
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

const ps = { bg: '#0d0d0d', side: '#121212', line: '#262626', bubble: '#1f1f1f', text: '#ececec', muted: '#8b8b8b', green: '#3fb950', red: '#f85149' }
type Item = ['user' | 'ai' | 'tool', string]

function transcript(g: G, items: Item[], x: number, y: number, w: number, size: number) {
  for (const [kind, s] of items) {
    if (kind === 'user') {
      g.font = `400 ${size}px ${sans}`
      const tw = Math.min(g.measureText(s).width + size * 1.6, w * 0.8)
      box(g, x + w - tw, y, tw, size * 2.1, ps.bubble, size * 0.7)
      text(g, s, x + w - tw + size * 0.8, y + size * 1.4, size, ps.text, 400)
      y += size * 2.8
    } else if (kind === 'tool') {
      g.strokeStyle = ps.muted
      g.lineWidth = 2
      g.strokeRect(x + 2, y + size * 0.15, size * 0.75, size * 0.75)
      text(g, s, x + size * 1.4, y + size * 0.9, size * 0.95, ps.muted, 400)
      y += size * 1.8
    } else {
      text(g, s, x, y + size, size, ps.text, 400)
      y += size * 2
    }
  }
  return y
}

function paseoFrame(g: G, branch: string, tabs: [string, string, boolean][], model: string) {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, ps.bg)
  box(g, 0, 0, 300, h, ps.side)
  ;['#ec6a5e', '#f4bf4f', '#61c554'].forEach((f, i) => box(g, 22 + i * 28, 20, 16, 16, f, 8))
  text(g, 'Sessions', 24, 92, 24, ps.text, 500)
  const tree: [string, number, string?][] = [
    ['secondsponsor/eupersona', 0], ['main', 1], [branch, 1, '+212 -40'], ['intake-card-details', 1, '+248 -582'],
    ['sangonz193/envwire', 0], ['main', 1], ['sangonz193/git-nav', 0], ['main', 1],
  ]
  tree.forEach(([name, depth, stat], i) => {
    const y = 150 + i * 52
    if (name === branch) box(g, 10, y - 32, 280, 48, '#1c1c1c', 10)
    text(g, name.length > 18 && stat ? name.slice(0, 16) + '…' : name, 24 + depth * 26, y, 21, ps.text, depth ? 400 : 600)
    if (stat) {
      g.font = `500 17px ${sans}`
      text(g, stat, 288 - g.measureText(stat).width, y, 17, ps.muted, 500)
    }
  })
  box(g, 26, h - 44, 12, 12, ps.green, 6)
  text(g, 'MacBook-Pro.local', 50, h - 32, 20, ps.muted)
  text(g, branch, 330, 46, 24, ps.text, 600)
  text(g, 'secondsponsor/eupersona', 340 + g.measureText(branch).width, 46, 22, ps.muted)
  box(g, 300, 72, w - 300, 1, ps.line)
  let tx = 320
  for (const [icon, label, active] of tabs) {
    g.font = `400 20px ${sans}`
    const tw = g.measureText(label).width + 70
    if (active) box(g, tx - 10, 74, tw, 46, '#161616')
    text(g, icon, tx, 106, 20, icon === '✳' ? '#d97757' : ps.text, 700)
    text(g, label, tx + 30, 105, 20, active ? ps.text : ps.muted, 400)
    tx += tw + 10
  }
  box(g, 300, 120, w - 300, 1, ps.line)
  box(g, 330, h - 130, w - 360, 108, '#141414', 18)
  text(g, 'Message the agent, tag @files, or use /commands and /skills', 352, h - 92, 19, ps.muted, 400)
  text(g, model, 380, h - 42, 19, ps.text, 500)
  return { x: 340, y: 150, w: w - 380 }
}

const trunk: Item[] = [['user', 'Add dark mode to settings'], ['tool', 'Edit  apps/web/src/settings/theme.tsx'], ['tool', 'Shell  bun test settings'], ['ai', 'Added a theme toggle, dark colors and a saved preference.']]

export const paseo: Paint = (g, k, p) => {
  const forked = phase(k, 2, p) > 0.5
  const tabs: [string, string, boolean][] = [['◎', 'Add dark mode', !forked]]
  if (forked) tabs.push(['✳', 'Add dark mode', true])
  const area = paseoFrame(g, 'dark-mode-settings', tabs, forked ? 'Opus 5.5  ·  high' : 'GPT-6.1-Sol  ·  medium')
  const y = transcript(g, trunk, area.x, area.y, area.w, 22)
  if (forked) transcript(g, [['user', 'Review what changed'], ['ai', 'Two buttons fail contrast in dark mode.']], area.x, y + 10, area.w, 22)
  if (k !== 2 || forked) return
  box(g, area.x + 60, y + 4, 330, 120, '#1b1b1b', 12)
  g.strokeStyle = ps.line
  g.strokeRect(area.x + 60, y + 4, 330, 120)
  text(g, 'Fork chat from here', area.x + 80, y + 42, 20, ps.text, 500)
  box(g, area.x + 70, y + 58, 310, 40, '#2a2a2a', 8)
  text(g, 'Fork in a new tab', area.x + 90, y + 85, 20, ps.text, 500)
  text(g, 'Fork in a new workspace', area.x + 90, y + 116, 20, ps.muted, 400)
}

const statusBar = (g: G, w: number, s: number, kind: 'ios' | 'android') => {
  text(g, '10:23', s * 1.2, s * 1.7, s * 0.8, '#fff', 600)
  if (kind === 'ios') box(g, w / 2 - s * 2.6, s * 0.6, s * 5.2, s * 1.5, '#000', s)
  else box(g, w / 2 - s * 0.5, s * 0.8, s, s, '#000', s)
  box(g, w - s * 2.4, s * 1.05, s * 1.3, s * 0.6, '#fff', s * 0.15)
}

export const remote = (kind: 'ios' | 'android' | 'browser' | 'code'): Paint => (g) => {
  const { width: w, height: h } = g.canvas
  const s = w / 16
  box(g, 0, 0, w, h, kind === 'code' ? '#0a0a0a' : ps.bg)
  let top = s * 3
  if (kind === 'ios' || kind === 'android') statusBar(g, w, s, kind)
  else {
    box(g, 0, 0, w, s * 2.6, '#202124')
    box(g, s * 0.6, s * 0.5, w - s * 1.2, s * 1.6, '#303134', s)
    text(g, kind === 'code' ? '192.168.1.20:8787' : 'MacBook-Pro.local', s * 1.4, s * 1.6, s * 0.75, '#bdc1c6', 400)
  }
  const size = Math.min(s * 0.7, 22)
  if (kind === 'code') {
    box(g, s, top, s * 1.4, s * 1.4, '#2563eb', s * 0.3)
    text(g, 'Fix login redirect', s * 3, top + s, size * 1.1, '#fafafa', 600)
    transcript(g, codeChat, s, top + s * 3, w - 2 * s, size)
    box(g, s * 0.6, h - s * 3.4, w - s * 1.2, s * 2.6, '#171717', s * 0.5)
    text(g, 'Message', s * 1.2, h - s * 2.2, size, '#737373', 400)
    return
  }
  text(g, '☰', s, top + s, size * 1.2, ps.text, 400)
  text(g, 'dark-mode-settings', s * 2.6, top + s, size, ps.text, 500)
  text(g, '◎  Add dark mode', s, top + s * 2.8, size * 0.9, ps.text, 400)
  transcript(g, trunk, s, top + s * 4.4, w - 2 * s, size * 0.9)
  box(g, s * 0.6, h - s * 3.6, w - s * 1.2, s * 2.8, '#141414', s * 0.6)
  text(g, 'Message, @files, /commands', s * 1.2, h - s * 2.5, size * 0.85, ps.muted, 400)
  text(g, 'GPT-6.1-Sol', s * 1.2, h - s * 1.4, size * 0.85, ps.text, 500)
}

const codeChat: Item[] = [['user', 'Fix the login redirect'], ['tool', 'Read  app/login/page.tsx'], ['ai', 'Fixed. 2 files changed.']]

export const remoteCoding: Paint = (g) => {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, '#0e0f12')
  ;[
    ['$ npx remote-coding --host 0.0.0.0', c.text], ['Remote Agent daemon listening on', c.muted], ['http://192.168.1.20:8787', c.muted],
    ['Open: http://192.168.1.20:8787', c.green], ['  /pair/••••••', c.green], ['Projects: ~/Developer/eupersona', c.muted],
  ].forEach(([line, color], i) => text(g, line, 22, 64 + i * 44, 19, color, 500, mono))
  const x = 470
  box(g, x, 0, w - x, h, '#0a0a0a')
  box(g, x + 12, 12, 210, h - 24, '#171717', 14)
  box(g, x + 24, 26, 34, 34, '#2563eb', 8)
  text(g, 'Remote Agent', x + 68, 42, 17, '#fafafa', 600)
  text(g, '1 server', x + 68, 62, 14, '#a3a3a3', 400)
  text(g, '+  New Chat', x + 28, 108, 16, '#a3a3a3', 400)
  text(g, 'Projects', x + 28, 150, 15, '#d4d4d4', 500)
  text(g, 'eupersona', x + 28, 182, 15, '#fafafa', 400)
  box(g, x + 22, 194, 190, 30, '#262626', 6)
  text(g, 'Fix login redirect', x + 34, 214, 14, '#fafafa', 400)
  box(g, w - 120, 22, 100, 28, '#171717', 14)
  box(g, w - 108, 32, 9, 9, ps.green, 5)
  text(g, 'Online', w - 92, 42, 14, '#fafafa', 500)
  text(g, 'Fix login redirect', x + 240, 90, 20, '#fafafa', 600)
  transcript(g, codeChat, x + 240, 130, w - x - 260, 17)
  box(g, x + 236, h - 110, w - x - 252, 90, '#171717', 12)
  text(g, 'Message', x + 252, h - 76, 16, '#737373', 400)
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

export const sign = (label: string): Paint => (g) => {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, '#f6f3ec', 12)
  g.font = `700 ${h * 0.5}px ${sans}`
  text(g, label, (w - g.measureText(label).width) / 2, h * 0.68, h * 0.5, '#22252b', 700)
}

export const reviewLoop: Paint = (g, k, p) => {
  const area = paseoFrame(g, 'login-redirect', [['◎', 'Fix login redirect', true]], 'GPT-6.1-Sol  ·  medium')
  if (k === 3) {
    const y = transcript(g, [['user', '/review-fix']], area.x, area.y, area.w, 22)
    ;[['Review', 'two reviewers'], ['Fix', 'one pass'], ['Confirm', 'one reviewer'], ['Leftovers', 'an issue, not another round']].forEach(([step, detail], i) => {
      g.globalAlpha = Math.min(1, Math.max(0, p * 4 - i))
      text(g, '✓', area.x, y + 30 + i * 62, 26, ps.green, 700)
      text(g, step, area.x + 44, y + 30 + i * 62, 26, ps.text, 600)
      text(g, detail, area.x + 220, y + 30 + i * 62, 24, ps.muted, 400)
    })
    g.globalAlpha = 1
    return
  }
  const rounds = k === 0 ? 1 : k === 1 ? 1 + Math.round(p * 5) : 6
  const items: Item[] = [['user', '/loop-review fix the login redirect']]
  for (let r = 1; r <= rounds; r++) items.push(['tool', `Round ${r}: review found more, fixing`])
  const y = transcript(g, items, area.x, area.y, k >= 2 ? 520 : area.w, 21)
  if (k < 2) return
  transcript(g, [['user', 'status?'], ['user', 'status?'], ['user', 'why did you stop working?']], area.x + 540, area.y, area.w - 540, 21)
  g.globalAlpha = p
  box(g, area.x + 520, y - 40, area.w - 520, 150, '#2a2214', 16)
  text(g, 'You already do this work now,', area.x + 544, y + 6, 26, '#e5b45b', 700)
  text(g, 'just later and angrier.', area.x + 544, y + 44, 26, '#e5b45b', 700)
  text(g, 'AI review of my chats, Oct 16', area.x + 544, y + 86, 18, ps.muted, 400)
  g.globalAlpha = 1
}

type Row = [lane: number, message: string, author: string, date: string, hash: string]
const rows: Row[] = [
  [0, 'fix(intake): fill card details directly', 'Santiago', '2 hours ago', '8d1c2a4f'],
  [0, 'feat(nav): restore back button', 'Santiago', '5 hours ago', '3be90c17'],
  [1, 'feat(search): add filters', 'Santiago', '6 hours ago', 'a41f7d02'],
  [0, 'chore: update dependencies', 'Santiago', 'yesterday', '77c2e9b1'],
  [3, 'feat(nav): back button', 'Santiago', 'yesterday', 'c09d4e55'],
  [2, 'feat(intake): card photos', 'Santiago', '2 days ago', 'e5a3b8c0'],
  [0, 'release 1.4', 'Santiago', '3 days ago', '1f6b0d93'],
  [1, 'feat(search): index', 'Santiago', '3 days ago', '9c8e21aa'],
  [0, 'feat: intake screens', 'Santiago', '4 days ago', '4d2f7a60'],
]
const pills: [row: number, name: string, kind?: 'merged' | 'behind'][] = [
  [0, 'main'], [2, 'search'], [3, 'orchestrator', 'behind'], [4, 'nav-fix', 'merged'], [5, 'card-photos', 'merged'], [6, 'worktree-2', 'behind'],
]
const lanes = ['#4c9df0', '#c084fc', '#f0b74c', '#2dd4bf']

function graph(g: G, k: number, p: number, top: number, rowH: number, vscode: boolean) {
  const { width: w } = g.canvas
  const clean = phase(k, 2, p) > 0.55 ? phase(k, 2, (p - 0.55) / 0.45) : 0
  const forward = phase(k, 3, p) > 0.55 ? phase(k, 3, (p - 0.55) / 0.45) : 0
  const x0 = vscode ? 90 : 20
  const y = (r: number) => top + rowH * (r - clean * [4, 5].filter((m) => m < r).length + 0.5)
  const lx = (lane: number) => x0 + 24 + lane * 30
  const gone = (r: number) => r === 4 || r === 5
  const link = (r1: number, l1: number, r2: number, l2: number) => {
    g.strokeStyle = lanes[l1]
    g.lineWidth = 3
    g.beginPath()
    g.moveTo(lx(l1), y(r1))
    g.bezierCurveTo(lx(l1), y(r2) - rowH / 2, lx(l2), y(r1) + rowH / 2, lx(l2), y(r2))
    g.stroke()
  }
  link(0, 0, 8, 0)
  link(2, 1, 7, 1)
  link(7, 1, 8, 0)
  g.globalAlpha = 1 - clean
  link(4, 3, 6, 0)
  link(5, 2, 6, 0)
  rows.forEach(([lane, msg, author, date, hash], r) => {
    g.globalAlpha = gone(r) ? 1 - clean : 1
    box(g, lx(lane) - 7, y(r) - 7, 14, 14, lanes[lane], 7)
    let mx = x0 + 170
    for (const [row, name, kind] of pills) {
      const moved = kind === 'behind' && forward >= 0.5
      if ((moved ? 0 : row) !== r) continue
      g.globalAlpha = gone(r) ? 1 - clean : kind === 'behind' ? Math.abs(1 - forward * 2) : 1
      g.font = `500 20px ${sans}`
      const pw = g.measureText(name).width + (kind === 'merged' && !vscode ? 96 : 26) + (name === 'main' && !vscode ? 70 : 0)
      box(g, mx, y(r) - 17, pw, 34, vscode ? lanes[lane] : '#161616', vscode ? 4 : 6)
      if (!vscode) box(g, mx, y(r) - 17, 3, 34, '#3fb950')
      let px = mx + 12
      if (name === 'main' && !vscode) {
        box(g, px - 4, y(r) - 12, 62, 24, '#1d4ed8', 4)
        px = text(g, 'HEAD', px + 2, y(r) + 7, 15, '#dbeafe', 700) + 14
      }
      px = text(g, name, px, y(r) + 7, 20, vscode ? '#111' : ps.text, 500)
      if (kind === 'merged' && !vscode) text(g, ` #6${r} merged`, px, y(r) + 7, 16, '#a371f7', 500)
      mx += pw + 10
    }
    g.globalAlpha = gone(r) ? 1 - clean : 1
    g.font = `400 20px ${sans}`
    if (w - 520 - mx > 80) text(g, fit(g, msg, w - 520 - mx), mx + 6, y(r) + 7, 20, ps.text, 400)
    text(g, author, w - 500, y(r) + 7, 19, ps.muted, 400)
    text(g, date, w - 330, y(r) + 7, 19, ps.muted, 400)
    text(g, hash, w - 150, y(r) + 7, 19, ps.muted, 400, mono)
  })
  g.globalAlpha = 1
}

const fit = (g: G, s: string, max: number) => {
  while (s.length > 4 && g.measureText(s).width > max) s = s.slice(0, -2)
  return s
}

function icon(g: G, kind: number, x: number, y: number) {
  g.fillStyle = g.strokeStyle = '#fafafa'
  g.lineWidth = 2.5
  g.beginPath()
  if (kind === 2) {
    g.moveTo(x + 18, y + 2)
    g.lineTo(x + 9, y + 13)
    g.moveTo(x + 4, y + 12)
    g.lineTo(x + 13, y + 20)
    g.lineTo(x + 6, y + 24)
    g.lineTo(x, y + 18)
    g.closePath()
    g.stroke()
    return
  }
  for (const dx of [0, 10]) {
    g.moveTo(x + dx, y + 4)
    g.lineTo(x + dx + 10, y + 12)
    g.lineTo(x + dx, y + 20)
  }
  g.fill()
}

function dialog(g: G, title: string, lines: string[], listTitle: string, list: string[], action: string, danger: boolean, pressed: boolean) {
  const { width: w } = g.canvas
  const x = w / 2 - 330
  box(g, 0, 0, w, g.canvas.height, '#000000aa')
  box(g, x, 120, 660, 470, '#141414', 18)
  text(g, title, x + 32, 172, 28, '#fafafa', 700)
  lines.forEach((line, i) => text(g, line, x + 32, 214 + i * 30, 19, '#a3a3a3', 400))
  const ly = 214 + lines.length * 30 + 10
  box(g, x + 32, ly, 596, 46 + list.length * 30, '#0d0d0d', 12)
  text(g, listTitle, x + 50, ly + 34, 20, '#fafafa', 600)
  list.forEach((item, i) => text(g, item, x + 50, ly + 68 + i * 30, 18, '#a3a3a3', 400, mono))
  box(g, x + 380, 520, 96, 46, '#1c1c1c', 10)
  text(g, 'Cancel', x + 398, 550, 19, '#fafafa', 500)
  box(g, x + 488, 520, 140, 46, danger ? (pressed ? '#7f1d1d' : '#3b1414') : pressed ? '#d4d4d4' : '#fafafa', 10)
  text(g, action, x + 500, 550, 19, danger ? '#f87171' : '#111', 600)
}

export const gitNav: Paint = (g, k, p) => {
  const { width: w, height: h } = g.canvas
  if (k === 0) {
    box(g, 0, 0, w, h, '#1e1e1e')
    box(g, 0, 0, w, 40, '#323233')
    text(g, 'eupersona · Visual Studio Code', w / 2 - 150, 27, 17, '#cccccc', 400)
    box(g, 0, 40, 64, h - 40, '#333333')
    box(g, 64, 40, w - 64, 44, '#252526')
    box(g, 64, 40, 150, 44, '#1e1e1e')
    text(g, 'Git Graph', 88, 69, 17, '#ffffff', 400)
    ;['Graph', 'Description', 'Author', 'Date', 'Commit'].forEach((col, i) =>
      text(g, col, [100, 260, w - 500, w - 330, w - 150][i], 118, 17, '#cccccc', 600),
    )
    return graph(g, 0, 0, 136, 64, true)
  }
  box(g, 0, 0, w, h, '#0a0a0a')
  box(g, 0, 0, w, 50, '#202124')
  box(g, 120, 9, w - 240, 32, '#303134', 16)
  text(g, '192.168.1.20:4300', 146, 31, 17, '#bdc1c6', 400)
  box(g, 16, 62, 120, 40, '#1c1c1c', 8)
  text(g, 'Graph  ×', 34, 89, 19, '#fafafa', 500)
  const cleaned = k > 2 || (k === 2 && p > 0.55)
  const forwarded = k === 3 && p > 0.55
  const tools: [string, string, number][] = [['View', '', 0], ['Stash', '', 0], ['', cleaned ? '' : '2', 2], ['', forwarded ? '' : '2', 3]]
  let tx = w - 30
  for (const [label, count, step] of tools.reverse()) {
    g.font = `500 19px ${sans}`
    const tw = g.measureText(label + count).width + (step ? 56 : 30)
    tx -= tw + 8
    box(g, tx, 114, tw, 40, step === k && p < 0.1 ? '#2a2a2a' : '#121212', 8)
    if (step) icon(g, step, tx + 14, 122)
    text(g, label || count, tx + (step ? 40 : 15), 141, 19, '#fafafa', 500)
  }
  ;['COMMIT', 'AUTHOR', 'DATE', 'COMMIT'].forEach((col, i) => text(g, col, [190, w - 500, w - 330, w - 150][i], 192, 16, '#a3a3a3', 600))
  graph(g, k, p, 206, 58, false)
  if (k === 2 && p <= 0.55)
    dialog(g, 'Clean merged branches?', ['Selected local branches will be permanently deleted.', '☑ Delete branches whose changes already sit on the default', '   branch as one squashed commit, matched by content.'],
      'Squash-merged pull requests', ['card-photos', 'nav-fix'], 'Clean branches', true, p > 0.4)
  if (k === 3 && p <= 0.55)
    dialog(g, 'Fast-forward branches?', ['Local branches with no commits ahead of the default', 'branch move to its tip.'], 'Will move', ['orchestrator', 'worktree-2'], 'Fast-forward', false, p > 0.4)
}

const light = { bg: '#ffffff', ink: '#0f172a', soft: '#475569', line: '#cbd5e1', accent: '#0f766e', field: '#f8fafc' }

function intake(g: G, title: string, intro: string[], action: string) {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, light.bg)
  statusBar(g, w, w / 16, 'ios')
  g.fillStyle = light.ink
  box(g, 28, 80, w - 56, 6, '#e2e8f0', 3)
  box(g, 28, 80, (w - 56) * 0.4, 6, light.accent, 3)
  text(g, title, 28, 140, 30, light.ink, 600)
  intro.forEach((line, i) => text(g, line, 28, 180 + i * 28, 19, light.soft, 400))
  box(g, 28, h - 100, w - 56, 64, light.accent, 14)
  g.font = `600 22px ${sans}`
  text(g, action, (w - g.measureText(action).width) / 2, h - 60, 22, '#fff', 600)
  return { w, top: 200 + intro.length * 28 }
}

export const capture: Paint = (g) => {
  const { w, top } = intake(g, 'Optional card photos', ['A license photo can help fill in', 'information for you to review.'], 'Continue to review')
  ;['Insurance card, front', 'Driver’s license, front'].forEach((label, i) => {
    const y = top + i * 230
    text(g, label, 28, y + 20, 20, light.ink, 600)
    g.setLineDash([10, 8])
    g.strokeStyle = light.line
    g.lineWidth = 3
    g.strokeRect(28, y + 36, w - 56, 120)
    g.setLineDash([])
    box(g, 28, y + 170, w - 56, 48, '#fff', 12)
    g.strokeRect(28, y + 170, w - 56, 48)
    text(g, 'Take or choose photo', 60, y + 202, 19, light.accent, 600)
  })
}

const fieldRows = (g: G, rows: [string, string][], top: number, w: number, editable: boolean) =>
  rows.forEach(([label, value], i) => {
    const y = top + i * (editable ? 104 : 74)
    text(g, label, 28, y + 20, 18, light.soft, 500)
    if (editable) {
      box(g, 28, y + 34, w - 56, 50, light.field, 10)
      g.strokeStyle = light.line
      g.strokeRect(28, y + 34, w - 56, 50)
      text(g, value, 44, y + 66, 20, light.ink, 400)
    } else {
      text(g, value, 28, y + 50, 21, light.ink, 500)
      text(g, 'Edit', w - 74, y + 50, 19, light.accent, 600)
    }
  })

const address: [string, string][] = [['Street address', '1420 Elm St'], ['City', 'Austin'], ['State', 'Texas'], ['Date of birth', '04/12/1990']]

export const review: Paint = (g) => {
  const { w, top } = intake(g, 'Review your information', ['Check your information and fill in', 'anything missing. Continue confirms', 'these details.'], 'Continue')
  fieldRows(g, address, top, w, false)
}

export const form: Paint = (g) => {
  const { w, top } = intake(g, 'Additional Information', ['Confirm or update your details.'], 'Continue')
  fieldRows(g, address, top - 10, w, true)
}

const changes: [string, number, number][] = [
  ['PatientReview.tsx', 0, 179], ['PatientReview.test.tsx', 0, 275], ['IntakeForm.contacts-id.test.tsx', 145, 64],
  ['EarlyPatientCapture.test.tsx', 45, 0], ['IntakeForm.tsx', 26, 23], ['EarlyPatientCapture.tsx', 17, 28],
  ['EarlyCardPhotos.tsx', 8, 6], ['EarlyCardPhotos.test.tsx', 5, 5],
]

export const source: Paint = (g, k, p) => {
  const { width: w, height: h } = g.canvas
  box(g, 0, 0, w, h, ps.bg)
  text(g, 'intake-card-details', 30, 48, 24, ps.text, 600)
  text(g, 'secondsponsor/eupersona', 290, 48, 21, ps.muted)
  ;['Changes', 'Files'].forEach((tab, i) => {
    if ((k >= 3) === !i) box(g, 20 + i * 130, 72, 118, 42, '#1f1f1f', 10)
    text(g, tab, 38 + i * 130, 100, 20, ps.text, 500)
  })
  box(g, 0, 128, w, 1, ps.line)
  if (k === 3) {
    text(g, 'Removing a screen, first attempt', 30, 180, 22, ps.muted, 500)
    box(g, 30, 210, 700, 36, ps.green, 6)
    box(g, 30, 262, 380, 36, ps.red, 6)
    text(g, 'net: more code', 30, 360, 40, ps.green, 700)
    return
  }
  if (k === 4) {
    const total = phase(k, 4, p)
    text(g, '#665  fix(intake): fill card details directly into the intake', 30, 172, 20, ps.text, 500)
    changes.forEach(([file, add, del], i) => {
      g.globalAlpha = Math.min(1, Math.max(0, total * 8 - i))
      const y = 220 + i * 44
      text(g, file, 30, y, 20, ps.text, 400, mono)
      text(g, `-${del}`, text(g, `+${add}`, w - 200, y, 19, ps.green, 500) + 12, y, 19, ps.red, 500)
    })
    g.globalAlpha = total
    text(g, '+248  -582   334 lines removed, net', 30, h - 40, 26, ps.red, 700)
    g.globalAlpha = 1
    return
  }
  ;['intake/_components/', '  EarlyCardPhotos.tsx', '  EarlyPatientCapture.tsx', '  IntakeForm.tsx', '  PatientReview.tsx', '  PatientReview.test.tsx'].forEach((f, j) => {
    const stale = j >= 4 && k >= 2
    text(g, f, 30, 176 + j * 40, 21, stale ? '#e5b45b' : ps.text, stale ? 600 : 400, mono)
    if (stale) text(g, 'unused', 420, 176 + j * 40, 18, '#e5b45b', 500)
  })
  if (k === 2) {
    box(g, 0, h - 120, w, 120, '#2a2214')
    text(g, '179 + 275 = 454 lines, no longer used', 30, h - 70, 24, '#e5b45b', 600)
    text(g, '✓ Approved · reviewer noted dead code', 30, h - 32, 20, ps.green, 500)
    return
  }
  code(g, ["{step === 'photos' && <EarlyCardPhotos />}", "{step === 'review' && <PatientReview />}", "{step === 'form' && <IntakeForm />}"], 30, 440, 19)
  if (k === 1) box(g, 70, 466, 440 * p, 3, ps.red)
}
