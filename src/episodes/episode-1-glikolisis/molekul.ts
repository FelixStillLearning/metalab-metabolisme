// Molekul Episode 1 dari prototype desain final. Jumlah atom karbon harus bisa dihitung di layar.
import { el, label, skeleton, strip, type Titik } from '../../features/pemutar-episode/kertas'
import { obj, type Objek, type Panggung } from '../../features/pemutar-episode/mesin'
import gambarOksigen from '../../assets/images/molekul-o2.webp'

type Separuh = Objek & { side: number; close: SVGPolygonElement; carbons: SVGGElement[] }
export type Glukosa = Objek & { cross: SVGGElement; halves: Separuh[]; label: SVGGElement }

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
