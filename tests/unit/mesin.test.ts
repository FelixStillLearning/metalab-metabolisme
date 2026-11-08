import { gsap } from 'gsap'
import { afterEach, beforeAll, beforeEach, expect, test } from 'vitest'
import {
  durasi,
  jedaSemua,
  kendali,
  obj,
  to,
  wait,
  type Panggung,
} from '../../src/features/pemutar-episode/mesin'
import {
  aturTitik,
  cut,
  hapusBentuk,
  label,
  skeleton,
  strip,
} from '../../src/features/pemutar-episode/kertas'
import { usePengaturan } from '../../src/stores/pengaturan'

const NS = 'http://www.w3.org/2000/svg'

// jsdom tidak mengukur SVG; tanpa dua fungsi ini GSAP mengira elemen bukan SVG
beforeAll(() => {
  Object.assign(SVGElement.prototype, {
    getBBox: () => ({ x: 0, y: 0, width: 1, height: 1 }),
    getCTM: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
  })
})

function panggung(signal = new AbortController().signal): Panggung {
  const svg = document.createElementNS(NS, 'svg')
  document.body.append(svg)
  const latar = document.createElementNS(NS, 'g')
  svg.append(latar)
  const cam = obj(0, 0, svg)
  const world = document.createElementNS(NS, 'g')
  cam.append(world)
  const fx = document.createElementNS(NS, 'g')
  svg.append(fx)
  return { svg, latar, cam, world, fx, signal }
}

beforeEach(() => {
  usePengaturan.setState({ pelan: false, tenang: false })
  kendali.cepat = 1
  kendali.otomatis = false
})

afterEach(() => {
  jedaSemua(false)
  document.body.innerHTML = ''
})

test('durasi mengikuti putar pelan, mode tenang, dan mode cepat', () => {
  expect(durasi(1000)).toBe(1000)
  usePengaturan.setState({ pelan: true })
  expect(durasi(1000)).toBe(1700)
  usePengaturan.setState({ pelan: false, tenang: true })
  expect(durasi(1000)).toBe(240)
  usePengaturan.setState({ tenang: false })
  kendali.cepat = 0.12
  expect(durasi(1000)).toBe(120)
})

test('skeleton membuat satu atom C per titik', () => {
  const g = document.createElementNS(NS, 'g')
  const titik = Array.from({ length: 6 }, (_, i): [number, number] => [
    Math.cos((i * Math.PI) / 3) * 100,
    Math.sin((i * Math.PI) / 3) * 100,
  ])
  const pasang = titik.map((_, i): [number, number] => [i, (i + 1) % 6])
  skeleton(g, titik, pasang)
  expect(g.querySelectorAll('[data-carbon]').length).toBe(6)
})

test('bentuk berbayangan punya salinan bayangan di belakangnya', () => {
  const g = document.createElementNS(NS, 'g')
  const titik = Array.from({ length: 6 }, (_, i): [number, number] => [i * 40, 0])
  skeleton(g, titik, [
    [0, 1],
    [1, 2],
  ])
  expect(g.querySelectorAll('[data-carbon]').length).toBe(6)
  const bentuk = g.querySelector('[data-carbon] polygon:not([data-bayangan])')
  const bayangan = bentuk?.previousElementSibling
  expect(bayangan?.hasAttribute('data-bayangan')).toBe(true)
  expect(bayangan?.getAttribute('fill')).toBe('#0d2526')
  expect(bayangan?.getAttribute('opacity')).toBe('0.38')
  expect(bayangan?.getAttribute('transform')).toBe('translate(3 5)')
  expect(bayangan?.getAttribute('points')).toBe(bentuk?.getAttribute('points'))
  expect(bayangan?.hasAttribute('data-carbon')).toBe(false)
})

test('strip tanpa pilihan bayangan tidak berbayangan', () => {
  const g = document.createElementNS(NS, 'g')
  const bentuk = strip(g, 0, 0, 50, 0)
  expect(g.querySelector('[data-bayangan]')).toBeNull()
  expect(bentuk.bayangan).toBeUndefined()
})

test('hapusBentuk dan aturTitik mengubah bentuk beserta bayangannya', () => {
  const g = document.createElementNS(NS, 'g')
  const bentuk = cut(
    g,
    [
      [0, 0],
      [10, 0],
      [10, 10],
    ],
    'red',
    {},
    1,
    { bayangan: true },
  )
  aturTitik(bentuk, '-98,-26 96,-27 99,24')
  expect(bentuk.getAttribute('points')).toBe('-98,-26 96,-27 99,24')
  expect(bentuk.bayangan?.getAttribute('points')).toBe('-98,-26 96,-27 99,24')
  expect(bentuk.bayangan?.getAttribute('transform')).toBe('translate(3 5)')
  hapusBentuk(bentuk)
  expect(g.children.length).toBe(0)
})

test('primitif kertas tanpa filter', () => {
  const g = document.createElementNS(NS, 'g')
  label(g, 0, 0, 'Glukosa')
  skeleton(
    g,
    [
      [0, 0],
      [50, 0],
    ],
    [[0, 1]],
  )
  expect(g.querySelector('[filter]')).toBeNull()
})

test('wait berhenti saat dijeda dan berlanjut saat dilanjutkan', async () => {
  const p = panggung()
  let selesai = false
  const janji = wait(p, 200).then(() => {
    selesai = true
  })
  jedaSemua(true)
  await new Promise((r) => setTimeout(r, 400))
  expect(selesai).toBe(false)
  jedaSemua(false)
  await janji
  expect(selesai).toBe(true)
})

test('to memperbarui posisi objek', async () => {
  const p = panggung()
  const g = obj(0, 0, p.world)
  await to(g, { x: 100, y: 50 }, 10)
  expect(g._x).toBe(100)
  expect(g._y).toBe(50)
  expect(gsap.getProperty(g, 'x')).toBe(100)
})

test('objek yang dibuat saat dijeda langsung di posisinya', async () => {
  const p = panggung()
  jedaSemua(true)
  const g = obj(5, 6, p.world)
  expect(g.getAttribute('transform')).toBe('matrix(1,0,0,1,5,6)')
  jedaSemua(false)
  await to(g, { x: 50 }, 10)
  expect(gsap.getProperty(g, 'x')).toBe(50)
})

test('wait ditolak saat abort', async () => {
  const kendaliAbort = new AbortController()
  const p = panggung(kendaliAbort.signal)
  const janji = wait(p, 1000)
  kendaliAbort.abort()
  await expect(janji).rejects.toMatchObject({ name: 'AbortError' })
})
