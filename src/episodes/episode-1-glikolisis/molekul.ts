// Molekul Episode 1 dari prototype desain final. Jumlah atom karbon harus bisa dihitung di layar.
import { gsap } from 'gsap'
import {
  disc,
  el,
  label,
  skeleton,
  strip,
  type Bentuk,
  type Titik,
} from '../../features/pemutar-episode/kertas'
import { durasi, obj, wait, type Objek, type Panggung } from '../../features/pemutar-episode/mesin'
import { bunyi } from '../../lib/suara'
import { tenangAktif } from '../../stores/pengaturan'
import gambarAdp from '../../assets/images/pembawa-adp.webp'
import gambarAtp from '../../assets/images/pembawa-atp.webp'
import gambarElektron from '../../assets/images/pembawa-elektron.webp'
import gambarNad from '../../assets/images/pembawa-nad.webp'
import gambarNadh from '../../assets/images/pembawa-nadh.webp'
import gambarAir from '../../assets/images/molekul-h2o.webp'
import gambarOksigen from '../../assets/images/molekul-o2.webp'

export type Separuh = Objek & {
  side: number
  close: SVGPolygonElement
  carbons: SVGGElement[]
  p1?: Fosfat
  p2?: Fosfat
  label?: SVGGElement
}
export type Glukosa = Objek & { cross: SVGGElement; halves: Separuh[]; label: SVGGElement }

export type Fosfat = Objek & { bond: Bentuk }
export type Pembawa = Objek & {
  dir: number
  gambar: SVGImageElement
  ps: Fosfat[]
}

// Cincin enam karbon. Dua ikatan silang (cross) diputus saat glukosa terbelah menjadi
// dua separuh tiga karbon, jadi 6 C = 3 C + 3 C di setiap momen.
export function glukosa(p: Panggung, x: number, y: number): Glukosa {
  const g = obj(x, y, p.world) as Glukosa
  g.dataset.molecule = 'glukosa'
  g.dataset.karbon = '6'
  const v = Array.from({ length: 6 }, (_, i): Titik => [
    Math.cos((i * Math.PI) / 3) * 100,
    Math.sin((i * Math.PI) / 3) * 100,
  ])
  g.cross = el('g', {}, g)
  for (const [a, b] of [
    [1, 2],
    [4, 5],
  ])
    strip(g.cross, ...v[a], ...v[b], 8, 'var(--color-paper)', {}, { bayangan: true })
  g.halves = [
    [2, 3, 4],
    [5, 0, 1],
  ].map((ids, i) => {
    const h = obj(0, 0, g) as Separuh
    const titik = ids.map((j) => v[j])
    h.side = i ? 1 : -1
    h.close = strip(h, ...titik[0], ...titik[2], 8, 'var(--color-paper)', { opacity: 0 })
    h.carbons = skeleton(h, titik, [
      [0, 1],
      [1, 2],
    ])
    return h
  })
  g.label = label(g, 0, 155, 'Glukosa · 6 C')
  return g
}

export function piruvat(p: Panggung, x: number, y: number) {
  const g = obj(x, y, p.world)
  g.dataset.molecule = 'piruvat'
  g.dataset.karbon = '3'
  skeleton(
    g,
    [
      [-75, 12],
      [0, -18],
      [75, 12],
    ],
    [
      [0, 1],
      [1, 2],
    ],
  )
  label(g, 0, 78, 'Asam piruvat · 3 C', 20)
  return g
}

export function oksigen(p: Panggung, x: number, y: number) {
  const g = obj(x, y, p.world)
  g.dataset.molecule = 'o2'
  g.dataset.oksigen = '2'
  el('image', { href: gambarOksigen, x: -90, y: -45, width: 180, height: 90 }, g)
  label(g, 0, 78, 'O₂', 22)
  return g
}

// H₂O (D20): 1 O + 2 H tergambar di gambarnya
export function air(p: Panggung, x: number, y: number) {
  const g = obj(x, y, p.world)
  g.dataset.molecule = 'h2o'
  el('image', { href: gambarAir, x: -55, y: -36, width: 110, height: 73 }, g)
  label(g, 0, 62, 'H₂O', 20)
  return g
}

// Satu elektron (E09)
export function elektron(parent: Element, x: number, y: number) {
  const g = obj(x, y, parent)
  g.dataset.electron = ''
  el('image', { href: gambarElektron, x: -16, y: -16, width: 32, height: 32 }, g)
  return g
}

export function phos(parent: Element, x: number, y: number) {
  const p = el('g', { 'data-phosphate': '' }, parent)
  disc(p, x, y, 18, 'var(--color-fosfat)', {}, { bayangan: true })
  const t = el(
    'text',
    {
      x,
      y: y + 6,
      'text-anchor': 'middle',
      'font-size': 19,
      'font-weight': 800,
      fill: 'var(--color-ink)',
    },
    p,
  )
  t.textContent = 'P'
  return p
}

// Lencana pembawa E01, E02, E04, E05 dari gambar; fosfat tetap digambar kode agar terhitung
const GAMBAR_PEMBAWA = {
  ATP: gambarAtp,
  ADP: gambarAdp,
  'NAD⁺': gambarNad,
  NADH: gambarNadh,
}
export type JenisPembawa = keyof typeof GAMBAR_PEMBAWA

export function badge(
  p: Panggung,
  x: number,
  y: number,
  jenis: JenisPembawa,
  parent: Element = p.world,
) {
  const g = obj(x, y, parent) as Objek & { gambar: SVGImageElement }
  g.gambar = el('image', { href: GAMBAR_PEMBAWA[jenis], x: -64, y: -26, width: 128, height: 52 }, g)
  g.dataset.carrier = jenis
  return g
}

// Objek yang sama berganti gambar, posisi dan geraknya tetap
export function relabel(b: Objek & { gambar: SVGImageElement }, jenis: JenisPembawa) {
  b.gambar.setAttribute('href', GAMBAR_PEMBAWA[jenis])
  b.dataset.carrier = jenis
}

export function carrier(
  p: Panggung,
  x: number,
  y: number,
  labelStr: 'ATP' | 'ADP' = 'ATP',
  dir = 1,
): Pembawa {
  const g = badge(p, x, y, labelStr) as Pembawa
  g.dir = dir
  const count = labelStr === 'ATP' ? 3 : 2
  g.ps = Array.from({ length: count }, (_, i) => {
    const px = dir * (84 + i * 40)
    const bond = strip(g, px - dir * 25, 0, px, 0, 7)
    const fosfatObj = obj(px, 0, g) as Fosfat
    phos(fosfatObj, 0, 0)
    fosfatObj.bond = bond
    return fosfatObj
  })
  return g
}

export async function countCarbons(p: Panggung, halves: Separuh[]) {
  for (const half of halves) {
    for (const carb of half.carbons) {
      bunyi('ketuk')
      if (!tenangAktif()) {
        await gsap
          .timeline()
          .to(carb, { y: -10, scale: 1.12, duration: durasi(200) / 1000, ease: 'keluar' })
          .to(carb, { y: 0, scale: 1, duration: durasi(200) / 1000, ease: 'keluar' })
      } else {
        await wait(p, 400)
      }
    }
  }
}
