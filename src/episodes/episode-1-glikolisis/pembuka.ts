// Pembuka Episode 1: sel utuh, glukosa masuk, penanda menunjuk mitokondria lalu sitoplasma,
// kemudian panel zoom membawa kamera ke panggung sitosol. Gerak sel, glukosa, dan kamera dari
// intro() prototype; penanda dan panel zoom tambahan dari rancangan episode.
import gambarLatar from '../../assets/images/latar-sitosol-lebar.webp'
import gambarPanel from '../../assets/images/organel-panel-zoom.webp'
import gambarPenanda from '../../assets/images/organel-penanda-zoom.webp'
import gambarSel from '../../assets/images/sel-hewan.webp'
import { el } from '../../features/pemutar-episode/kertas'
import {
  arrive,
  camTo,
  hide,
  obj,
  pasangLatar,
  teks,
  to,
  wait,
  type Panggung,
} from '../../features/pemutar-episode/mesin'
import { bunyi } from '../../lib/suara'
import { glukosa } from './molekul'
import { say } from './naskah'

// Koordinat panggung 1600 x 900. Sel C01 (1200 x 800) digambar 1100 x 733 berpusat di (800, 450).
export const SITOPLASMA = [560, 620] as const
// Mitokondria besar di bawah inti: pusatnya di piksel (744, 590) gambar C01, kira-kira 290 x 185
export const TITIK_MITOKONDRIA = [932, 624] as const
// Sisi penanda dan panel zoom; bingkai garis putusnya cukup mengurung mitokondria itu
const SISI = 440

function gambar(g: Element, href: string) {
  el('image', { href, x: -SISI / 2, y: -SISI / 2, width: SISI, height: SISI }, g)
}

export async function pembuka(p: Panggung) {
  const sel = obj(800, 450, p.world)
  sel.dataset.objek = 'sel'
  el('image', { href: gambarSel, x: -550, y: -367, width: 1100, height: 733 }, sel)
  teks(sel, 0, -385, 'SEL', 34, 'var(--color-paper)')
  bunyi('muncul')
  await wait(p, 500)
  await say(p, 'e1-pembuka-01')

  const g = glukosa(p, 1650, 700)
  g.label.style.opacity = '0'
  await to(g, { s: 0.45 }, 0)
  bunyi('geser')
  await arrive(p, g, ...SITOPLASMA)

  const penanda = obj(...TITIK_MITOKONDRIA, p.world)
  penanda.dataset.objek = 'penanda-zoom'
  gambar(penanda, gambarPenanda)
  hide(penanda)
  penanda._s = 0.85
  bunyi('muncul')
  await to(penanda, { o: 1, s: 1 }, 600)
  await say(p, 'e1-pembuka-02', { pendamping: '01-ramah' })

  bunyi('geser')
  await to(penanda, { x: SITOPLASMA[0], y: SITOPLASMA[1] })
  await say(p, 'e1-pembuka-03')

  // Panel di lapisan fx agar tidak ikut kamera: ia yang membesar memenuhi layar
  const panel = obj(...SITOPLASMA, p.fx)
  panel.dataset.objek = 'panel-zoom'
  gambar(panel, gambarPanel)
  hide(panel)
  bunyi('muncul')
  await Promise.all([to(panel, { o: 1 }, 300), to(penanda, { o: 0 }, 300)])
  bunyi('geser')
  // Kurva dan durasi sama dengan kamera, jadi titik sitoplasma tetap di tengah panel
  await Promise.all([
    to(panel, { x: 800, y: 450, s: 4.9 }, 1800, 'kamera'),
    camTo(p, ...SITOPLASMA, 3.2, 1800),
    to(sel, { o: 0.25 }, 1800),
  ])

  // Pindah ke panggung sitosol (labScene() di prototype)
  await pasangLatar(p, gambarLatar, 'sitosol')
  p.world.replaceChildren()
  await to(p.cam, { x: 0, y: 0, s: 1 }, 0)
  const tempat = obj(800, 80, p.world)
  tempat.dataset.objek = 'label-sitosol'
  teks(tempat, 0, 0, 'SITOSOL · TANPA OKSIGEN', 26, 'var(--color-paper)')
  await to(panel, { o: 0 }, 600)
  panel.remove()
}
