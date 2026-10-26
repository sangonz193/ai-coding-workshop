import * as THREE from 'three'
import { indexOf, stops, type Position } from './state'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import * as S from './screens'
import { scenes } from './story'

type V3 = [number, number, number]
type Opts = { to?: number; lift?: number; shift?: [number, V3]; turn?: [number, number]; tick?: (o: THREE.Object3D, t: number) => void }
type Prop = Required<Pick<Opts, 'to' | 'lift'>> & Opts & { obj: THREE.Object3D; from: number; home: THREE.Vector3; tilt: number }
type Screen = { g: CanvasRenderingContext2D; map: THREE.CanvasTexture; scene: number; paint: S.Paint; live: boolean; seconds: number; k: number; since: number; p: number }

const at = (scene: number, step = 0) => indexOf({ scene, step })
const spots = [[-11, -5], [0, -7], [11, -5], [11, 7], [0, 9], [-11, 7], [0, 1.5]]
const shots: Record<string, number[]> = {
  0: [-0.9, 1, -0.8, 2], '0.1': [0.3, 0.7, -0.3, 1.6],
  1: [1.6, 0.8, 0.2, 2.2], '1.1': [0.8, 1.3, -0.5, 1.6], '1.2': [-0.3, 1.9, -0.8, 2.6], '1.3': [0.2, 1.2, 0.3, 1.9],
  2: [0.3, 0.8, -0.5, 1.35], '2.2': [-1.4, 0.9, -0.2, 1.9], 3: [0, 2.3, -0.6, 2],
  4: [-0.2, 1, -0.1, 1.3], '4.2': [1.7, 1.9, -0.9, 2.3], '4.3': [0.6, 1, 0.1, 1.3],
  5: [-1.6, 0.9, 0.7, 2.1], '5.2': [0.2, 0.9, -0.2, 1.45], '5.3': [2.2, 0.95, -0.8, 2], '5.4': [0, 0.9, 0, 1.45],
  6: [0, -0.5, 1, 0.3],
}
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const mat = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...extra })
const M = {
  wood: mat(0x5c3d2a), slate: mat(0x453a32), metal: mat(0xa3a5ab, { metalness: 0.6, roughness: 0.35 }),
  black: mat(0x141518, { roughness: 0.4 }), card: mat(0xf2ede2), brass: mat(0xc49a4c, { metalness: 0.7, roughness: 0.35 }),
}

export function createWorkshop(host: HTMLElement) {
  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true })
  } catch {
    return null
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  host.append(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x221a15)
  scene.add(new THREE.HemisphereLight(0xffe9cc, 0x3b2a1f, 1.3))
  const sun = new THREE.DirectionalLight(0xffd29a, 2.6)
  sun.position.set(-8, 18, 10)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24 })
  sun.shadow.camera.updateProjectionMatrix()
  scene.add(sun)

  const props: Prop[] = []
  const prop = <T extends THREE.Object3D>(obj: T, from: number, o: Opts = {}) => {
    props.push({ lift: 0.6, to: Infinity, ...o, obj, from, home: obj.position.clone(), tilt: obj.rotation.x })
    obj.scale.setScalar(0.001)
    return obj
  }
  const box = (parent: THREE.Object3D, size: V3, m: THREE.Material, [x, y, z]: V3, geo?: THREE.BufferGeometry) => {
    const mesh = new THREE.Mesh(geo ?? new THREE.BoxGeometry(...size), m)
    mesh.position.set(x, y + size[1] / 2, z)
    mesh.castShadow = mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }
  const screens: Screen[] = []
  const display = (scene: number, paint: S.Paint, w: number, h: number, res: number, live = false, seconds = 1.2) => {
    const canvas = Object.assign(document.createElement('canvas'), { width: res, height: Math.round((res * h) / w) })
    const map = new THREE.CanvasTexture(canvas)
    map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 8
    screens.push({ g: canvas.getContext('2d')!, map, scene, paint, live, seconds, k: -1, since: 0, p: -1 })
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, toneMapped: false }))
  }
  const group = (parent: THREE.Object3D, [x, y, z]: V3, ry = 0, rx = 0) => {
    const g = new THREE.Group()
    g.position.set(x, y, z)
    g.rotation.set(rx, ry, 0)
    parent.add(g)
    return g
  }
  const mount = (parent: THREE.Object3D, mesh: THREE.Mesh, [x, y, z]: V3) => {
    mesh.position.set(x, y, z)
    parent.add(mesh)
  }
  const laptop = (parent: THREE.Object3D, pos: V3, scene: number, paint: S.Paint, w: number, ry = 0, live = false) => {
    const g = group(parent, pos, ry)
    const d = w * 0.68
    box(g, [w, 0.06, d], M.metal, [0, 0, 0], new RoundedBoxGeometry(w, 0.06, d, 2, 0.03))
    box(g, [w * 0.84, 0.01, d * 0.42], M.black, [0, 0.06, -d * 0.1])
    const lid = group(g, [0, 0.06, -d / 2], 0, -0.25)
    box(lid, [w, w * 0.64, 0.04], M.black, [0, 0, 0], new RoundedBoxGeometry(w, w * 0.64, 0.04, 2, 0.02))
    mount(lid, display(scene, paint, w * 0.92, w * 0.56, 1024, live), [0, w * 0.32, 0.022])
    return { g, lid }
  }
  const monitor = (parent: THREE.Object3D, pos: V3, scene: number, paint: S.Paint, w: number, seconds?: number) => {
    const g = group(parent, pos)
    box(g, [w * 0.3, 0.04, w * 0.18], M.metal, [0, 0, 0])
    box(g, [0.14, w * 0.3, 0.06], M.metal, [0, 0.04, -0.06])
    const panel = group(g, [0, w * 0.3, 0], 0, -0.08)
    box(panel, [w, w * 0.6, 0.06], M.black, [0, 0, 0])
    mount(panel, display(scene, paint, w * 0.97, w * 0.57, 1280, false, seconds), [0, w * 0.3, 0.031])
    return g
  }
  const phone = (parent: THREE.Object3D, pos: V3, scene: number, paint: S.Paint, size: number, wide = false) => {
    const g = group(parent, pos)
    const [w, h] = wide ? [size, size * 0.68] : [size * 0.48, size]
    box(g, [w * 0.7, 0.04, 0.4], M.metal, [0, 0, -0.1])
    const body = group(g, [0, 0.04, 0], 0, -0.2)
    box(body, [w, h, 0.07], M.black, [0, 0, 0], new RoundedBoxGeometry(w, h, 0.07, 4, Math.min(w, h) * 0.12))
    mount(body, display(scene, paint, w * 0.9, h * 0.93, wide ? 800 : 420), [0, h / 2, 0.036])
    return g
  }
  const arrow = (parent: THREE.Object3D, x1: number, x2: number) => {
    const g = group(parent, [(x1 + x2) / 2, 0.85, 0.8])
    box(g, [x2 - x1 - 0.2, 0.06, 0.06], M.brass, [-0.1, -0.03, 0])
    box(g, [0.2, 0, 0.2], M.brass, [(x2 - x1) / 2 - 0.1, 0, 0], new THREE.ConeGeometry(0.11, 0.2, 16).rotateZ(-Math.PI / 2))
    return g
  }
  const card = (parent: THREE.Object3D, scene: number, title: string, pos: V3, w: number, ry = 0) => {
    const g = group(parent, pos, ry)
    box(g, [w, 0.03, w * 0.625], M.card, [0, 0, 0])
    const face = display(scene, S.pullRequest(title), w * 0.97, w * 0.6, 512)
    face.rotation.x = -Math.PI / 2
    mount(g, face, [0, 0.031, 0])
    return g
  }
  const station = (i: number, w = 6) => {
    const g = group(scene, [spots[i][0], 0, spots[i][1]])
    box(g, [w, 0.12, 4], M.slate, [0, 0, 0])
    return g
  }
  box(scene, [36, 0.8, 28], M.wood, [0, -0.8, 1.5])

  const output = station(0)
  laptop(output, [-0.9, 0.12, 0.1], 0, S.generating, 2.6, 0, true)
  ;['Add settings screen', 'Refactor auth', 'New onboarding', 'Fix flaky test', 'Export to CSV'].forEach((title, i) =>
    prop(card(output, 0, title, [1.6, 0.12 + i * 0.035, 0.4], 1.6, 0.3 - (i % 3) * 0.2), at(0, 1), { lift: 1.5 + i * 0.35 }),
  )

  const desk = station(1)
  prop(laptop(desk, [2.2, 0.12, 0.6], 1, S.remoteCoding, 1.8, -0.4).lid, 0, { turn: [at(1, 1), Math.PI / 2] })
  prop(phone(desk, [0.7, 0.12, 1], 1, S.remote('code'), 1.1), at(1), { to: at(1, 1), lift: -0.5 })
  prop(monitor(desk, [-0.3, 0.12, -0.8], 1, S.paseo, 3, 3.5), at(1, 1), { lift: -1.2 })
  prop(phone(desk, [-0.7, 0.12, 1.1], 1, S.remote('browser'), 1.1, true), at(1, 3), { lift: -0.5 })
  ;(['ios', 'android'] as const).forEach((kind, i) => prop(phone(desk, [0.4 + i * 0.65, 0.12, 1.1], 1, S.remote(kind), 1), at(1, 3), { lift: -0.5 }))

  const copies = station(2, 8)
  const env = group(copies, [-3.2, 0.12, 0.6], 0.2)
  box(env, [1.3, 1.65, 0.05], M.card, [0, 0, 0])
  mount(env, display(2, S.envTemplate, 1.22, 1.55, 600), [0, 0.83, 0.026])
  prop(env, at(2, 2), { lift: -1.2 })
  ;[-1.6, 0.6, 2.8].forEach((x, i) =>
    prop(laptop(copies, [x, 0.12, -0.3], 2, S.worktree(i), 2, 0.1 * (1 - i)).g, at(2), { lift: 0.8 + i * 0.3 }),
  )

  monitor(station(3), [0, 0.12, -0.6], 3, S.gitNav, 3.8, 4)

  const jam = station(4, 8)
  monitor(jam, [1.7, 0.12, -0.9], 4, S.reviewLoop, 2.8)
  const hub = new THREE.Vector3(-1.4, 0.2, 0.1)
  prop(box(jam, [0, 0.06, 0], M.brass, [hub.x, 0.14, hub.z], new THREE.TorusGeometry(1, 0.05, 12, 64).rotateX(Math.PI / 2)), 0, { to: at(4, 3) })
  for (const [label, dx] of [['Review', 1.45], ['Fix', -1.45]] as const) {
    const post = group(jam, [hub.x + dx, 0.12, hub.z - 0.2])
    box(post, [0.8, 0.36, 0.03], M.card, [0, 0, 0])
    mount(post, display(4, S.sign(label), 0.76, 0.32, 256), [0, 0.18, 0.016])
    prop(post, 0, { to: at(4, 3) })
  }
  const spin = (o: THREE.Object3D, t: number) => {
    o.position.set(hub.x + Math.cos(t * 1.2), 0.2, hub.z + Math.sin(t * 1.2))
    o.rotation.y = -t * 1.2
  }
  prop(card(jam, 4, 'Fix login redirect', [hub.x + 1, 0.2, hub.z], 0.9), 0, { to: at(4, 3), tick: spin })
  for (let i = 0; i < 6; i++) {
    const title = ['Dark mode', 'Search filters', 'Nav fix', 'Export to CSV', 'Onboarding', 'Auth refactor'][i]
    const waiting = card(jam, 4, title, [-3.4 + i * 0.75, 0.12 + (i % 2) * 0.035, 1.65], 0.9, (i % 2 ? 0.12 : -0.1))
    prop(waiting, at(4, 1), { lift: 1 + i * 0.25, shift: [at(4, 3), [2.6, 0, 0]] })
  }
  prop(box(jam, [7, 0.02, 0.08], M.brass, [0, 0.12, 1.65]), at(4, 3), { lift: -0.2 })

  const flow = station(5, 7)
  prop(phone(flow, [-3, 0.12, 0.8], 5, S.capture, 1.5), 0, { shift: [at(5, 1), [0.7, 0, 0]] })
  prop(phone(flow, [-1.6, 0.12, 0.8], 5, S.review, 1.5), 0, { to: at(5, 4), shift: [at(5, 1), [0, 0, -1.3]] })
  prop(phone(flow, [-0.2, 0.12, 0.8], 5, S.form, 1.5), 0, { shift: [at(5, 1), [-0.7, 0, 0]] })
  for (const [x1, x2] of [[-2.62, -1.98], [-1.22, -0.58]]) prop(arrow(flow, x1, x2), 0, { to: at(5, 1) })
  prop(arrow(flow, -1.92, -1.28), at(5, 1))
  laptop(flow, [2, 0.12, -0.1], 5, S.source, 2.4, -0.35)

  const ring = spots.length - 1
  spots.slice(0, ring).forEach(([x, z], i) => {
    const [nx, nz] = spots[(i + 1) % ring]
    const path = box(scene, [0.14, 0.03, Math.hypot(nx - x, nz - z)], M.brass, [(x + nx) / 2, 0, (z + nz) / 2])
    path.rotation.y = Math.atan2(nx - x, nz - z)
    prop(path, at(ring, 1), { lift: 0.3 })
  })

  const camera = new THREE.OrthographicCamera()
  const focus = new THREE.Vector3()
  const goal = new THREE.Vector3()
  let pos = stops[0]
  let current = 0
  let goalZoom = 1
  let drag = 0
  let dragX: number | null = null
  const view = { turn: 0, pitch: 0.45 }
  const goalView = { ...view }
  new ResizeObserver(() => {
    const { clientWidth: w, clientHeight: h } = host
    renderer.setSize(w, h)
    const halfW = Math.max(4.5, (4 * w) / h)
    Object.assign(camera, { left: -halfW, right: halfW, top: (halfW * h) / w, bottom: (-halfW * h) / w })
    camera.setViewOffset(w, h, w > h ? -w * 0.1 : 0, 0, w, h)
  }).observe(host)
  host.addEventListener('pointerdown', (e) => void (dragX = e.clientX))
  addEventListener('pointerup', () => void (dragX = null))
  host.addEventListener('pointermove', (e) => {
    if (dragX === null) return
    drag = Math.min(0.9, Math.max(-0.9, drag - (e.clientX - dragX) * 0.005))
    dragX = e.clientX
  })

  let last = 0
  renderer.setAnimationLoop((ms) => {
    const t = ms / 1000
    const k = reduced.matches ? 1 : 1 - Math.exp(-Math.min(ms - last, 100) / 220)
    last = ms
    for (const p of props) {
      const on = current >= p.from && current < p.to
      const target = p.home.clone()
      if (!on) target.y += p.lift
      if (p.shift && current >= p.shift[0]) target.add(new THREE.Vector3(...p.shift[1]))
      p.obj.position.lerp(target, k)
      p.obj.scale.setScalar(THREE.MathUtils.lerp(p.obj.scale.x, on ? 1 : 0.001, k))
      p.obj.visible = p.obj.scale.x > 0.01
      if (p.turn) p.obj.rotation.x = THREE.MathUtils.lerp(p.obj.rotation.x, current >= p.turn[0] ? p.turn[1] : p.tilt, k)
      if (p.tick && !reduced.matches) p.tick(p.obj, t)
    }
    for (const s of screens) {
      const step = s.scene < pos.scene ? scenes[s.scene].steps.length - 1 : s.scene > pos.scene ? 0 : pos.step
      if (step !== s.k) Object.assign(s, { k: step, since: t })
      const p = reduced.matches ? 1 : Math.min(1, (t - s.since) / s.seconds)
      if (p === s.p && !(s.live && !reduced.matches)) continue
      s.p = p
      s.paint(s.g, step, p * p * (3 - 2 * p), reduced.matches ? 3 : t)
      s.map.needsUpdate = true
    }
    focus.lerp(goal, k * 0.6)
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, goalZoom, k * 0.6)
    view.turn = THREE.MathUtils.lerp(view.turn, goalView.turn + drag, k * 0.6)
    view.pitch = THREE.MathUtils.lerp(view.pitch, goalView.pitch, k * 0.6)
    const reach = Math.cos(view.pitch) * 40
    camera.position.set(focus.x + Math.sin(view.turn) * reach, focus.y + Math.sin(view.pitch) * 40, focus.z + Math.cos(view.turn) * reach)
    camera.lookAt(focus)
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  })

  return {
    show(p: Position) {
      pos = p
      current = indexOf(p)
      const [dx, y, dz, zoom] = shots[`${p.scene}.${p.step}`] ?? shots[p.scene]
      goal.set(spots[p.scene][0] + dx, y, spots[p.scene][1] + dz)
      goalZoom = zoom
      Object.assign(goalView, p.scene === spots.length - 1 ? { turn: Math.PI / 4, pitch: 0.75 } : { turn: 0, pitch: 0.42 })
    },
  }
}
