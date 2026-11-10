import roda from '../../assets/images/interaksi-roda-krebs.webp'
import atomO from '../../assets/images/molekul-atom-o.webp'
import koa from '../../assets/images/molekul-koa.webp'
import { carbon, el, label, strip, type Titik } from '../../features/pemutar-episode/kertas'
import { obj, to, type Panggung } from '../../features/pemutar-episode/mesin'

export const posisi = (i: number): [number, number] => {
  const a = -Math.PI / 2 + (i * Math.PI) / 4
  return [500 + Math.cos(a) * 210, 480 + Math.sin(a) * 210]
}
export function rodaKrebs(p: Panggung) {
  const g = obj(500, 480, p.world)
  g.dataset.objek = 'roda-krebs'
  el('image', { href: roda, x: -280, y: -280, width: 560, height: 560 }, g)
  const sorot = el(
    'circle',
    { cx: 0, cy: -210, r: 50, fill: 'none', stroke: 'var(--color-accent)', 'stroke-width': 9 },
    g,
  )
  return {
    g,
    aktif: (i: number) => {
      const [x, y] = posisi(i)
      sorot.setAttribute('cx', String(x - 500))
      sorot.setAttribute('cy', String(y - 480))
      g.dataset.tahap = String(i + 1)
    },
  }
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
  function namaBaru(teks: string, tahap: number) {
    g.dataset.molecule = teks
    g.dataset.karbon = String(atom.length)
    g.dataset.tahap = String(tahap)
    judul.querySelector('text')!.textContent = teks
    hitung.querySelector('text')!.textContent = `${atom.length} C`
    koenzim.style.display = tahap === 4 ? '' : 'none'
  }
  function sambung(pasangan: [number, number][]) {
    ikatan.replaceChildren()
    for (const [a, b] of pasangan) strip(ikatan, atom[a]._x, atom[a]._y, atom[b]._x, atom[b]._y, 8)
  }
  async function susun(teks: string, tahap: number) {
    namaBaru(teks, tahap)
    const bentuk = BENTUK[tahap - 1]
    await to(ikatan, { o: 0 }, 140)
    await Promise.all(
      atom.map((a, i) => to(a, { x: bentuk.titik[i][0], y: bentuk.titik[i][1] }, 460, 'pose')),
    )
    sambung(bentuk.ikatan)
    await to(ikatan, { o: 1 }, 180)
  }
  namaBaru(nama, 0)
  sambung(atom.slice(1).map((_, i) => [i, i + 1]))
  return { g, atom, ikatan, susun }
}
export async function lepasCo2(p: Panggung, m: ReturnType<typeof rangka>, tahap: number) {
  const c = m.atom.pop()!
  p.world.append(c)
  await to(c, { x: m.g._x + c._x, y: m.g._y + c._y }, 0)
  c.dataset.molecule = 'co2'
  c.dataset.tahap = String(tahap)
  for (const y of [-32, 32])
    el('image', { href: atomO, x: 12, y: y - 20, width: 40, height: 40, 'data-oxygen': '' }, c)
  label(c, 0, 88, `CO₂ · tahap ${tahap}`, 18)
  return c
}
export type Rangka = ReturnType<typeof rangka>
export type Roda = ReturnType<typeof rodaKrebs>
