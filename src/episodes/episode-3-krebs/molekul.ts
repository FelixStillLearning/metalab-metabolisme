import roda from '../../assets/images/interaksi-roda-krebs.webp'
import atomO from '../../assets/images/molekul-atom-o.webp'
import koa from '../../assets/images/molekul-koa.webp'
import { carbon, el, label, strip } from '../../features/pemutar-episode/kertas'
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

// Model jumlah karbon; bentuk ini tidak melacak identitas atom CO₂ antarputaran.
export function rangka(p: Panggung, n: number, nama: string, x = 500, y = 485) {
  const g = obj(x, y, p.world)
  const ikatan = el('g', {}, g)
  const atom = Array.from({ length: n }, (_, i) => {
    const a = obj((i - (n - 1) / 2) * 50, i % 2 ? 12 : -12, g)
    carbon(a, 0, 0, 24)
    return a
  })
  const judul = label(g, 0, -78, 'α-ketoglutarat', 30)
  const hitung = label(g, 0, 88, `${n} C`, 26)
  const koenzim = gambar(g, koa, 0, 128, 100, 50)
  koenzim.style.display = 'none'
  function susun(namaBaru: string, tahap: number) {
    g.dataset.molecule = namaBaru
    g.dataset.karbon = String(atom.length)
    g.dataset.tahap = String(tahap)
    judul.querySelector('text')!.textContent = namaBaru
    hitung.querySelector('text')!.textContent = `${atom.length} C`
    koenzim.style.display = tahap === 4 ? '' : 'none'
    for (const [i, a] of atom.entries())
      void to(a, { y: tahap === 2 ? ((i % 3) - 1) * 24 : i % 2 ? 12 : -12 }, 0)
    ikatan.replaceChildren()
    for (let i = 1; i < atom.length; i++)
      strip(ikatan, atom[i - 1]._x, atom[i - 1]._y, atom[i]._x, atom[i]._y, 8)
  }
  susun(nama, 0)
  return { g, atom, susun }
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
