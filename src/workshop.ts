import * as THREE from 'three'
import { indexOf, stops, type Position } from './state'
import { scenes } from './story'

type V3 = [number, number, number]
type Opts = { to?: number; lift?: number; shift?: [number, V3]; tick?: (o: THREE.Object3D, t: number) => void }
type Prop = Required<Pick<Opts, 'to' | 'lift'>> & Opts & { obj: THREE.Object3D; from: number; home: THREE.Vector3 }

const at = (scene: number, step = 0) => indexOf({ scene, step })
const views: V3[] = [[-7, 3, 1.15], [-3, -4, 1.1], [3.5, -4, 1.15], [7.5, 2, 1.15], [1.5, 5, 1.2], [-0.5, 1.5, 0.46]]
const reduced = matchMedia('(prefers-reduced-motion: reduce)')
const mat = (color: number, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...extra })
const M = {
  wood: mat(0x5c3d2a), plank: mat(0xa8784a), slate: mat(0x453a32), dark: mat(0x2a2420), paper: mat(0xece3d3),
  brass: mat(0xc49a4c, { metalness: 0.7, roughness: 0.35 }), red: mat(0xc4472f), green: mat(0x6f9a5b),
  crate: mat(0xc98f58), glow: mat(0xbfe3df, { emissive: 0x5a9f9a, emissiveIntensity: 0.9 }),
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
  sun.position.set(-6, 14, 8)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14 })
  sun.shadow.camera.updateProjectionMatrix()
  scene.add(sun)

  const props: Prop[] = []
  const prop = <T extends THREE.Object3D>(obj: T, from: number, o: Opts = {}) => {
    props.push({ lift: 0.6, to: Infinity, ...o, obj, from, home: obj.position.clone() })
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
  const tag = (parent: THREE.Object3D, text: string, pos: V3, from: number, to = at(stops[from].scene + 1), h = 0.3) => {
    const c = document.createElement('canvas')
    const g = c.getContext('2d')!
    const font = '600 56px Georgia, serif'
    g.font = font
    c.width = g.measureText(text).width + 64
    c.height = 96
    g.fillStyle = '#f4ecde'
    g.roundRect(0, 0, c.width, c.height, 20)
    g.fill()
    Object.assign(g, { font, fillStyle: '#2a2420', textAlign: 'center', textBaseline: 'middle' })
    g.fillText(text, c.width / 2, 52, c.width - 24)
    const map = new THREE.CanvasTexture(c)
    map.colorSpace = THREE.SRGBColorSpace
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, depthTest: false, toneMapped: false }))
    sprite.scale.set((h * c.width) / c.height, h, 1)
    sprite.renderOrder = 1
    const group = new THREE.Group()
    group.add(sprite)
    group.position.set(...pos)
    parent.add(group)
    return prop(group, from, { to, lift: 0.3 })
  }
  const station = ([x, z]: V3) => {
    const g = new THREE.Group()
    g.position.set(x, 0, z)
    scene.add(g)
    box(g, [4.2, 0.12, 3.4], M.slate, [0, 0, 0])
    return g
  }
  box(scene, [22, 0.8, 16], M.wood, [0, -0.8, 0.5])

  const machine = station(views[0])
  box(machine, [1.4, 1.5, 1.3], M.dark, [-1.2, 0.12, 0])
  box(machine, [0.9, 0.45, 0.9], M.brass, [-1.2, 1.62, 0])
  box(machine, [0.06, 0.5, 0.8], M.glow, [-0.47, 0.6, 0])
  box(machine, [1.8, 0.25, 0.6], M.dark, [0.4, 0.12, 0])
  for (let i = 0; i < 4; i++) {
    const tick = (o: THREE.Object3D, t: number) => void (o.position.x = -0.6 + ((t * 0.5 + i * 0.475) % 1.9))
    prop(box(machine, [0.32, 0.32, 0.32], M.crate, [-0.3 + i * 0.5, 0.37, 0]), at(0), { tick })
  }
  for (let i = 0; i < 8; i++) {
    prop(box(machine, [0.32, 0.32, 0.32], M.crate, [1.6 + (i % 2) * 0.34, 0.12 + Math.floor(i / 4) * 0.33, (Math.floor(i / 2) % 2) * 0.36 - 0.18]), at(0, 1), { lift: 1.2 + i * 0.15 })
  }
  tag(machine, 'Code', [-1.2, 2.5, 0], at(0))
  tag(machine, 'Delivery', [1.8, 1.3, 0], at(0, 1))

  const desk = station(views[1])
  prop(box(desk, [1.2, 0.55, 0.8], M.plank, [-1.2, 0.12, 0.7]), at(1))
  prop(box(desk, [0.5, 0.38, 0.04], M.dark, [-1.2, 0.67, 0.48]), at(1))
  prop(box(desk, [0.46, 0.34, 0.04], M.glow, [-1.2, 0.69, 0.5]), at(1), { to: at(1, 1), lift: -0.3 })
  tag(desk, 'code', [-1.2, 1.4, 0.7], at(1))
  prop(box(desk, [2, 0.65, 1], M.dark, [0.7, 0.12, -0.4]), at(1, 1), { lift: -0.8 })
  for (const x of [0.1, 0.7, 1.3]) prop(box(desk, [0.5, 0.36, 0.04], M.glow, [x, 0.77, -0.75]), at(1, 1))
  tag(desk, 'Paseo', [0.7, 2, -0.6], at(1, 1))
  const dial = new THREE.CylinderGeometry(0.16, 0.16, 0.12, 24)
  for (const x of [0.25, 1.15]) prop(box(desk, [0.32, 0.12, 0.32], M.brass, [x, 0.77, -0.15], dial), at(1, 2))
  prop(box(desk, [0.9, 0.04, 0.06], M.paper, [0.7, 0.8, -0.15]), at(1, 2))
  tag(desk, 'GPT · Codex', [-0.2, 1.15, 0], at(1, 2), at(1, 3))
  tag(desk, 'Anthropic', [1.6, 1.45, 0], at(1, 2), at(1, 3))
  for (const x of [-0.5, -0.1]) prop(box(desk, [0.24, 0.46, 0.05], M.glow, [x, 0.12, 1.35]), at(1, 3))
  prop(box(desk, [0.9, 0.55, 0.05], M.glow, [0.9, 0.12, 1.25]), at(1, 3))
  tag(desk, 'Desktop · iOS · Android · Browser', [0.3, 0.95, 1.3], at(1, 3))

  const setup = station(views[2])
  const knot = new THREE.TorusKnotGeometry(0.15, 0.04, 64, 8)
  const lamp = new THREE.SphereGeometry(0.08, 16, 12)
  for (const [i, x] of [-1.3, 0, 1.3].entries()) {
    prop(box(setup, [1, 0.5, 0.9], M.plank, [x, 0.12, 0.3]), at(2), { lift: 0.4 + i * 0.4 })
    const tick = (o: THREE.Object3D, t: number) => void (o.rotation.y = Math.sin(t * 3 + i) * 0.6)
    prop(box(setup, [0.3, 0.3, 0.3], M.red, [x, 0.66, 0.4], knot), at(2, 1), { to: at(2, 2), lift: 0.8, tick })
    prop(box(setup, [0.08, 0.7, 0.08], M.brass, [x, 0.62, -0.05]), at(2, 2))
    prop(box(setup, [0.16, 0.16, 0.16], M.green, [x, 0.62, 0.55], lamp), at(2, 2))
  }
  prop(box(setup, [3.6, 0.2, 0.2], M.brass, [0, 1.32, -0.05]), at(2, 2))
  tag(setup, 'Worktrees', [0.4, 0.3, 1.5], at(2))
  tag(setup, 'Envwire', [0, 1.85, -0.05], at(2, 2))

  const branches = station(views[3])
  for (const x of [-1.6, 1.6]) box(branches, [0.12, 1.3, 0.12], M.dark, [x, 0.12, -0.6])
  box(branches, [3.3, 0.06, 0.06], M.dark, [0, 1.15, -0.6])
  box(branches, [3.4, 0.05, 0.12], M.brass, [0, 0.12, 0.9])
  const spool = new THREE.CylinderGeometry(0.2, 0.2, 0.34, 20).rotateZ(Math.PI / 2)
  for (let i = 0; i < 6; i++) {
    const merged = i === 1 || i === 4
    const shift: [number, V3] | undefined = i === 0 || i === 3 ? [at(3, 3), [0, -0.6, 1.5]] : undefined
    prop(box(branches, [0.34, 0.4, 0.4], merged ? M.crate : M.paper, [-1.25 + i * 0.5, 0.75, -0.6], spool), at(3), merged ? { to: at(3, 2), lift: -0.9 } : { shift })
  }
  prop(box(branches, [1.4, 0.8, 0.05], M.glow, [0, 0.12, -1.4]), at(3, 1))
  tag(branches, 'VS Code Git Graph', [0, 1.7, -0.6], at(3), at(3, 1))
  tag(branches, 'Git Nav, in the browser', [0, 1.7, -1.2], at(3, 1))
  tag(branches, 'Default branch', [0, 0.55, 1.35], at(3, 3))

  const inspection = station(views[4])
  box(inspection, [3, 0.6, 2], M.wood, [0, 0.12, 0])
  const layer = (m: THREE.Material, y: number, size: V3 = [1.8, 0.07, 1.2]) => box(inspection, size, m, [0, y, 0])
  prop(layer(M.paper, 1.15), at(4))
  for (const z of [-0.3, 0, 0.3]) prop(box(inspection, [1.2, 0.02, 0.1], M.slate, [-0.1, 1.22, z]), at(4))
  tag(inspection, 'Editable form', [1.5, 1.2, 0.8], at(4))
  for (const o of [layer(M.glow, 1.6), box(inspection, [0.6, 0.03, 0.5], M.crate, [0, 1.67, 0])]) prop(o, at(4), { to: at(4, 1), lift: 1.4 })
  tag(inspection, 'Photo review', [0, 2.2, 0], at(4), at(4, 1))
  prop(layer(M.red, 0.78, [2, 0.06, 1.4]), at(4, 2), { to: at(4, 4), lift: -0.5 })
  tag(inspection, '454 obsolete lines', [-1.1, 0.95, 0.9], at(4, 2), at(4, 4))
  prop(box(inspection, [0.4, 0.03, 0.4], M.green, [0.55, 1.22, 0.25], dial), at(4, 2), { to: at(4, 3), lift: 0.5 })
  tag(inspection, 'Approved', [0.9, 1.85, 0.25], at(4, 2), at(4, 3))
  tag(inspection, 'Why more code?', [0, 1.9, 0], at(4, 3), at(4, 4))
  tag(inspection, '334 lines removed', [0, 1.7, 0], at(4, 4))
  const lens = box(inspection, [0.1, 0.1, 0.1], M.brass, [1.1, 0.75, -0.55], new THREE.TorusGeometry(0.32, 0.04, 12, 40))
  lens.rotation.x = -Math.PI / 2

  views.slice(0, 5).forEach(([x, z], i) => {
    const [nx, nz] = views[(i + 1) % 5]
    const path = box(scene, [0.14, 0.03, Math.hypot(nx - x, nz - z)], M.brass, [(x + nx) / 2, 0, (z + nz) / 2])
    path.rotation.y = Math.atan2(nx - x, nz - z)
    prop(path, at(5, 1), { lift: 0.3 })
    tag(scene, scenes[i].chapter, [x, 2.8, z], at(5, 1), Infinity, 0.6)
  })

  const camera = new THREE.OrthographicCamera()
  const focus = new THREE.Vector3(views[0][0], -1.2, views[0][1])
  const goal = focus.clone()
  let current = 0
  let goalZoom = views[0][2]
  let azimuth = Math.PI / 4
  let dragX: number | null = null
  new ResizeObserver(() => {
    const { clientWidth: w, clientHeight: h } = host
    renderer.setSize(w, h)
    const halfW = Math.max(4.5, (4 * w) / h)
    Object.assign(camera, { left: -halfW, right: halfW, top: (halfW * h) / w, bottom: (-halfW * h) / w })
  }).observe(host)
  host.addEventListener('pointerdown', (e) => void (dragX = e.clientX))
  addEventListener('pointerup', () => void (dragX = null))
  host.addEventListener('pointermove', (e) => {
    if (dragX === null) return
    azimuth = Math.min(Math.PI * 0.75, Math.max(-Math.PI * 0.25, azimuth - (e.clientX - dragX) * 0.005))
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
      if (p.tick && !reduced.matches) p.tick(p.obj, t)
    }
    focus.lerp(goal, k * 0.6)
    camera.zoom = THREE.MathUtils.lerp(camera.zoom, goalZoom, k * 0.6)
    camera.position.set(focus.x + Math.sin(azimuth) * 30, focus.y + 24, focus.z + Math.cos(azimuth) * 30)
    camera.lookAt(focus)
    camera.updateProjectionMatrix()
    renderer.render(scene, camera)
  })

  return {
    show(p: Position) {
      current = indexOf(p)
      const [x, z, scale] = views[p.scene]
      goal.set(x, -0.6, z)
      goalZoom = scale
    },
  }
}
