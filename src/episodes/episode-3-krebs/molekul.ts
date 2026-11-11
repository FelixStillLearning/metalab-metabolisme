import roda from '../../assets/images/interaksi-roda-krebs.webp'
import atomO from '../../assets/images/molekul-atom-o.webp'
import koa from '../../assets/images/molekul-koa.webp'
import {
  carbon,
  el,
  label as labelKertas,
  strip,
  type Titik,
} from '../../features/pemutar-episode/kertas'
import { hide, obj, to, type Panggung } from '../../features/pemutar-episode/mesin'

export function label(parent: Element, x: number, y: number, value: string, size = 22) {
  const g = labelKertas(parent, x, y, value, size)
  g.setAttribute('transform', `translate(${x} ${y})`)
  return g
}
export const posisi = (i: number): [number, number] => {
  const a = -Math.PI / 2 + (i * Math.PI) / 4
  return [500 + Math.cos(a) * 120, 450 + Math.sin(a) * 120]
}
export const posisiSamping = (i: number): [number, number] => {
  const a = -Math.PI / 2 + (i * Math.PI) / 4
  return [500 + Math.cos(a) * 215, 450 + Math.sin(a) * 215]
}
export function garisTahap(p: Panggung, tahap: number) {
  const [x1, y1] = posisi(tahap - 1)
  const [x2, y2] = posisiSamping(tahap - 1)
  let garis = p.world.querySelector<SVGElement>(`[data-garis-tahap="${tahap}"]`)
  if (!garis) {
    garis = el(
      'line',
      {
        x1: x1 + (x2 - x1) * 0.38,
        y1: y1 + (y2 - y1) * 0.38,
        x2: x1 + (x2 - x1) * 0.7,
        y2: y1 + (y2 - y1) * 0.7,
        'data-garis-tahap': String(tahap),
        'stroke-linecap': 'round',
      },
      p.world,
    )
  }
  p.world.querySelectorAll<SVGElement>('[data-garis-tahap]').forEach((g) => {
    g.dataset.aktif = String(g === garis)
  })
}
export function rodaKrebs(p: Panggung) {
  const g = obj(500, 450, p.world)
  g.dataset.objek = 'roda-krebs'
  el('image', { href: roda, x: -160, y: -160, width: 320, height: 320 }, g)
  const penanda = hide(obj(0, -75, g))
  penanda.dataset.objek = 'penanda-roda'
  el('circle', { r: 9, fill: '#ed8877', stroke: 'var(--color-ink)', 'stroke-width': 2 }, penanda)
  return {
    g,
    aktif: (i: number) => {
      g.dataset.tahap = String(i + 1)
      p.world.querySelectorAll<SVGElement>('[data-garis-tahap]').forEach((garis) => {
        garis.dataset.aktif = String(garis.dataset.garisTahap === String(i + 1))
      })
      const a = -Math.PI / 2 + (i * Math.PI) / 4
      return to(penanda, { x: Math.cos(a) * 75, y: Math.sin(a) * 75, o: 1 }, 350)
    },
  }
}
export function simpanTahap(
  p: Panggung,
  m: ReturnType<typeof rangka>,
  tahap: number,
  nama: string,
) {
  garisTahap(p, tahap)
  const [x, y] = posisiSamping(tahap - 1)
  const g = m.g.cloneNode(true) as SVGGElement
  g.removeAttribute('data-detail-reaksi')
  g.removeAttribute('data-molecule')
  g.removeAttribute('data-karbon')
  g.removeAttribute('data-tahap')
  g.dataset.modelTahap = String(tahap)
  g.setAttribute('transform', `translate(${x} ${y}) scale(0.38)`)
  for (const c of g.querySelectorAll('[data-carbon]')) c.removeAttribute('data-carbon')
  for (const t of g.querySelectorAll('text'))
    if (!['C'].includes(t.textContent || '')) t.parentElement?.remove()
  p.world.append(g)
  const judul = label(p.world, x, y + (tahap <= 2 || tahap === 8 ? -55 : 50), nama, 18)
  judul.dataset.namaTahap = String(tahap)
}
export function gambar(parent: Element, href: string, x: number, y: number, w = 160, h = 80) {
  const g = obj(x, y, parent)
  el('image', { href, x: -w / 2, y: -h / 2, width: w, height: h }, g)
  return g
}
// Susunan mengikuti model hitung aset pilihan, bukan rumus struktur kimia lengkap.
export const BENTUK: { titik: Titik[]; ikatan: [number, number][] }[] = [
  {
    titik: [
      [-110, 60],
      [-70, 0],
      [0, 0],
      [0, -60],
      [70, 0],
      [110, 60],
    ],
    ikatan: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [4, 5],
    ],
  },
  {
    titik: [
      [-120, 60],
      [-70, 0],
      [-10, -45],
      [55, -60],
      [15, 25],
      [100, 60],
    ],
    ikatan: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
      [4, 5],
    ],
  },
  {
    titik: [
      [40, -60],
      [-30, -30],
      [40, 0],
      [-30, 30],
      [40, 60],
    ],
    ikatan: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  {
    titik: [
      [-90, 0],
      [-30, 0],
      [30, 0],
      [90, 0],
    ],
    ikatan: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    titik: [
      [-90, 0],
      [-30, 0],
      [30, 0],
      [90, 0],
    ],
    ikatan: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    titik: [
      [-40, -60],
      [40, -20],
      [-40, 20],
      [40, 60],
    ],
    ikatan: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    titik: [
      [-90, 20],
      [-40, -35],
      [40, -35],
      [90, 20],
    ],
    ikatan: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
  {
    titik: [
      [-40, -60],
      [40, -20],
      [-40, 20],
      [40, 60],
    ],
    ikatan: [
      [0, 1],
      [1, 2],
      [2, 3],
    ],
  },
]
// Atom C yang sama tetap dihitung; model tidak menetapkan asal atom CO₂ antarputaran.
export function rangka(p: Panggung, n: number, nama: string, x = 500, y = 485) {
  const g = obj(x, y, p.world)
  const ikatan = obj(0, 0, g)
  const atom = Array.from({ length: n }, (_, i) => {
    const a = obj((i - (n - 1) / 2) * 50, i % 2 ? 12 : -12, g)
    carbon(a, 0, 0, 24)
    return a
  })
  const judul = label(g, 0, -110, 'α-ketoglutarat', 26)
  const hitung = label(g, 0, 130, `${n} C`, 26)
  const koenzim = gambar(g, koa, 0, 72, 100, 50)
  koenzim.style.display = 'none'
  koenzim.dataset.objek = 'koa-terikat'
  function namaBaru(teks: string, tahap: number) {
    g.dataset.molecule = teks
    g.dataset.karbon = String(atom.length)
    g.dataset.tahap = String(tahap)
    judul.querySelector('text')!.textContent = teks
    hitung.querySelector('text')!.textContent = `${atom.length} C`
    if (koenzim.parentNode === g) koenzim.style.display = tahap === 4 ? '' : 'none'
  }
  function sambung(pasangan: [number, number][]) {
    ikatan.replaceChildren()
    for (const [a, b] of pasangan) strip(ikatan, atom[a]._x, atom[a]._y, atom[b]._x, atom[b]._y, 8)
  }
  async function susun(teks: string, tahap: number, ms = 780) {
    namaBaru(teks, tahap)
    const bentuk = BENTUK[tahap - 1]
    await to(ikatan, { o: 0 }, ms * 0.18)
    await Promise.all(
      atom.map((a, i) =>
        to(a, { x: bentuk.titik[i][0], y: bentuk.titik[i][1] }, ms * 0.59, 'pose'),
      ),
    )
    sambung(bentuk.ikatan)
    await to(ikatan, { o: 1 }, ms * 0.23)
  }
  namaBaru(nama, 0)
  sambung(atom.slice(1).map((_, i) => [i, i + 1]))
  return { g, atom, ikatan, susun, judul, hitung, koenzim }
}
export async function lepasCo2(p: Panggung, m: ReturnType<typeof rangka>, tahap: number) {
  const c = m.atom.pop()!
  p.world.append(c)
  await to(c, { x: m.g._x + c._x * m.g._s, y: m.g._y + c._y * m.g._s, s: m.g._s }, 0)
  c.dataset.molecule = 'co2'
  c.dataset.tahap = String(tahap)
  for (const y of [-32, 32])
    el('image', { href: atomO, x: 12, y: y - 20, width: 40, height: 40, 'data-oxygen': '' }, c)
  label(c, 0, 88, `CO₂ · tahap ${tahap}`, 18)
  return c
}
export type Rangka = ReturnType<typeof rangka>
export type Roda = ReturnType<typeof rodaKrebs>

export function asetilKertas(p: Panggung, x: number, y: number) {
  const m = rangka(p, 2, 'Asetil KoA', x, y)
  strip(m.ikatan, 25, 12, 90, 12, 8)
  const badan = obj(-60, 0, m.g)
  badan.append(m.ikatan, ...m.atom)
  const lencana = gambar(badan, koa, 130, 12, 110, 55)
  m.judul.remove()
  m.hitung.remove()
  const judul = label(m.g, 0, 130, 'Asetil KoA · 2 C', 24)
  return { ...m, judul, badan, lencana }
}
