import kompleks1 from '../../assets/images/organel-kompleks-1.webp'
import kompleks2 from '../../assets/images/organel-kompleks-2.webp'
import kompleks3 from '../../assets/images/organel-kompleks-3.webp'
import kompleks4 from '../../assets/images/organel-kompleks-4.webp'
import badan from '../../assets/images/organel-atp-sintase-badan.webp'
import kepala from '../../assets/images/organel-atp-sintase-kepala.webp'
import hplus from '../../assets/images/pembawa-h-plus.webp'
import q from '../../assets/images/organel-ubikuinon.webp'
import cyt from '../../assets/images/organel-sitokrom-c.webp'
import { cut, el, label } from '../../features/pemutar-episode/kertas'
import { obj, type Panggung } from '../../features/pemutar-episode/mesin'
export const X = { I: 320, II: 530, III: 760, IV: 1000 }
export const Y = 450
export const posisiKompleks = (k: keyof typeof X): [number, number] => [X[k], k === 'II' ? 570 : Y]
export function gambar(parent: Element, href: string, x: number, y: number, w = 160, h = 80) {
  const g = obj(x, y, parent)
  el('image', { href, x: -w / 2, y: -h / 2, width: w, height: h }, g)
  return g
}
export function membran(p: Panggung) {
  const g = obj(0, 0, p.world)
  g.dataset.objek = 'rantai-elektron'
  label(g, 720, 200, 'RUANG ANTARMEMBRAN', 30)
  label(g, 830, 705, 'MATRIKS', 28)
  const kompleks = (['I', 'II', 'III', 'IV'] as const).map((k, i) => {
    const c = gambar(
      g,
      [kompleks1, kompleks2, kompleks3, kompleks4][i],
      ...posisiKompleks(k),
      170,
      k === 'II' ? 100 : 290,
    )
    c.dataset.kompleks = k
    if (k === 'II') {
      // Dua subunit jangkar tertanam di membran; kepala katalitik menghadap matriks.
      const jangkar = el('g', { 'data-jangkar': 'II' }, c)
      for (const x of [-22, 2]) {
        cut(
          jangkar,
          [
            [x, -105],
            [x + 18, -108],
            [x + 21, 12],
            [x - 1, 15],
          ],
          'var(--color-fosfat)',
          {},
          1,
          { bayangan: true },
        )
      }
      c.prepend(jangkar)
    }
    label(g, X[k], k === 'II' ? 650 : 290, k, 34)
    return c
  })
  const ubikuinon = gambar(g, q, 625, Y, 60, 60)
  ubikuinon.dataset.objek = 'ubikuinon'
  label(g, 625, 510, 'Q', 22)
  const sitokrom = gambar(g, cyt, 880, 340, 65, 65)
  sitokrom.dataset.objek = 'sitokrom-c'
  label(g, 880, 280, 'Cyt c', 22)
  const sintase = obj(1320, Y, g)
  sintase.dataset.objek = 'atp-sintase'
  el('image', { href: badan, x: -103.2, y: -115, width: 212.88, height: 425.76 }, sintase)
  // Pivot C12: badan887×1774, kepala(435,435) pada posisi(-5,885), skala0.24.
  const rotor = obj(0, 201.8, sintase)
  rotor.dataset.objek = 'kepala-sintase'
  el('image', { href: kepala, x: -104.4, y: -104.4, width: 216, height: 216 }, rotor)
  label(g, 1320, 275, 'ATP sintase', 30)
  return { g, kompleks, ubikuinon, sitokrom, sintase, rotor }
}
export type Membran = ReturnType<typeof membran>
export function proton(parent: Element, x: number, y: number) {
  const g = gambar(parent, hplus, x, y, 56, 56)
  g.dataset.proton = ''
  return g
}
