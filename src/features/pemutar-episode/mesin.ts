// Mesin gerak adegan episode. Angka durasi, kurva, dan jarak disalin dari prototype desain final;
// gerak dijalankan GSAP agar semua animasi dan jeda ikut berhenti saat timeline global dijeda.
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { jedaNarasi } from '../../lib/narasi'
import { usePemutar } from '../../stores/pemutar'
import { tenangAktif, usePengaturan } from '../../stores/pengaturan'
import gambarGarisGerak from '../../assets/images/efek-garis-gerak.webp'
import gambarLetupan from '../../assets/images/efek-letupan.webp'
import { cut, el, type Titik } from './kertas'

gsap.registerPlugin(CustomEase, MotionPathPlugin)

// Sama dengan token --ease-* di tokens.css
export const EASE = {
  pose: '.2,1.18,.38,1',
  keluar: '.22,1,.36,1',
  letup: '.2,1.6,.4,1',
  ancang: '.55,0,.8,.2',
  busur: '.65,0,.35,1',
  kamera: '.6,0,.2,1',
}
export type Kurva = keyof typeof EASE
for (const [nama, nilai] of Object.entries(EASE)) CustomEase.create(nama, nilai)

export type Objek = SVGGElement & {
  _x: number
  _y: number
  _s: number
  _r: number
  _o: number
  dir?: number
}

export type Panggung = {
  svg: SVGSVGElement
  latar: SVGGElement
  cam: Objek
  world: SVGGElement
  fx: SVGGElement
  signal: AbortSignal
}

type Gerak = Partial<Record<'x' | 'y' | 's' | 'r' | 'o', number>>

// cepat hanya untuk pengujian; otomatis = putar sendiri tanpa menunggu siswa
export const kendali = { cepat: location.hash.includes('cepat') ? 0.12 : 1, otomatis: false }

export function durasi(ms: number, batasTenang = 240) {
  const { pelan } = usePengaturan.getState()
  return (
    (tenangAktif() ? Math.min(ms, batasTenang) : ms) *
    (pelan ? 1.7 : 1) *
    (kendali.otomatis ? 0.6 : 1) *
    kendali.cepat
  )
}

const dihentikan = () => new DOMException('Adegan dihentikan', 'AbortError')

// batasTenang = Infinity untuk waktu baca: mode tenang hanya memangkas jeda gerak
export function wait(p: Panggung, ms: number, batasTenang = kendali.otomatis ? Infinity : 400) {
  return new Promise<void>((selesai, gagal) => {
    if (p.signal.aborted) return gagal(dihentikan())
    const batal = () => {
      tunda.kill()
      gagal(dihentikan())
    }
    const tunda = gsap.delayedCall(durasi(ms, batasTenang) / 1000, () => {
      p.signal.removeEventListener('abort', batal)
      selesai()
    })
    p.signal.addEventListener('abort', batal, { once: true })
  })
}

export function jedaSemua(dijeda: boolean) {
  if (dijeda) gsap.globalTimeline.pause()
  else gsap.globalTimeline.resume()
  jedaNarasi(dijeda)
  usePemutar.setState({ dijeda })
}

/* ================= gambar ================= */

// gsap.set biasa tidak digambar selama timeline global dijeda; ini langsung digambar
const pasang = (g: Objek, vars: gsap.TweenVars) => gsap.set(g, { ...vars, immediateRender: true })

export function obj(x: number, y: number, parent: Element): Objek {
  const g = Object.assign(el('g', {}, parent), { _x: x, _y: y, _s: 1, _r: 0, _o: 1 })
  // Titik putar = titik (0, 0) objek, seperti translate() rotate() scale() di prototype
  pasang(g, { svgOrigin: '0 0', x, y })
  return g
}

export function teks(
  g: Element,
  x: number,
  y: number,
  t: string,
  size = 22,
  fill = '#fff',
  weight = 800,
) {
  const e = el(
    'text',
    { x, y, 'text-anchor': 'middle', 'font-size': size, 'font-weight': weight, fill },
    g,
  )
  e.textContent = t
  return e
}

export function hide(g: Objek) {
  g._o = 0
  pasang(g, { opacity: 0 })
  return g
}

/* ================= gerak ================= */

const keadaan = (g: Objek) => ({ x: g._x, y: g._y, rotation: g._r, scale: g._s, opacity: g._o })

// Selalu mulai dari nilai _x.._o, bukan dari tampilan sekarang: adegan sering menyiapkan
// keadaan awal (mis. huruf kecil dan turun) tanpa menggambarnya dulu, seperti prototype.
export async function to(g: Objek, p: Gerak = {}, ms = 700, ease: Kurva = 'pose') {
  const dari = keadaan(g)
  Object.assign(g, {
    _x: p.x ?? g._x,
    _y: p.y ?? g._y,
    _s: p.s ?? g._s,
    _r: p.r ?? g._r,
    _o: p.o ?? g._o,
  })
  const ke = keadaan(g)
  const d = durasi(ms) / 1000
  if (!d) {
    pasang(g, ke)
    return
  }
  if (tenangAktif()) {
    // Pudar keluar, pindah, pudar masuk: tanpa gerak meluncur
    await gsap
      .timeline()
      .fromTo(g, dari, { opacity: 0, duration: d / 2, ease: 'none' })
      .set(g, { ...ke, opacity: 0 })
      .to(g, { opacity: ke.opacity, duration: d / 2, ease: 'none' })
    return
  }
  await gsap.fromTo(g, dari, { ...ke, duration: d, ease })
}

export async function shake(p: Panggung, g: Objek, amp = 3.2, ms = 720) {
  if (tenangAktif()) return wait(p, 240)
  const lines = obj(0, 0, g)
  lines.dataset.effect = 'shake-lines'
  for (const side of [-1, 1])
    for (const k of [0, 1]) {
      el(
        'path',
        {
          d: `M${side * (145 + k * 22)} -45 Q${side * (165 + k * 22)} 0 ${side * (145 + k * 22)} 45`,
          fill: 'none',
          stroke: 'var(--color-paper)',
          'stroke-width': 5,
          'stroke-linecap': 'round',
        },
        lines,
      )
    }
  // 13 bingkai linear, amplitudo meluruh, bingkai terakhir kembali ke posisi semula
  const bingkai = Array.from({ length: 13 }, (_, i) => {
    const k = i === 12 ? 0 : (i % 2 ? 1 : -1) * amp * (1 - i / 24)
    return { x: g._x + k * 1.6, rotation: g._r + k }
  })
  const d = durasi(ms) / 1000 / 12
  pasang(g, bingkai[0])
  await gsap.to(g, {
    keyframes: bingkai.slice(1).map((b) => ({ ...b, duration: d, ease: 'none' })),
  })
  lines.remove()
}

// Garis gerak H01 di belakang objek; gambarnya tebal di kiri, jadi dibalik saat objek ke kanan
export function speedLines(p: Panggung, g: Objek, dir: number) {
  if (tenangAktif()) return
  const trails = obj(0, 0, g)
  trails.dataset.effect = 'speed-lines'
  g.insertBefore(trails, g.firstChild)
  el(
    'image',
    {
      href: gambarGarisGerak,
      x: 80,
      y: -30,
      width: 240,
      height: 60,
      opacity: 0.85,
      transform: dir > 0 ? 'scale(-1 1)' : '',
    },
    trails,
  )
  wait(p, 440)
    .then(() => to(trails, { o: 0, x: -dir * 35 }, 180, 'keluar'))
    .then(
      () => trails.remove(),
      () => {},
    )
}

export async function arrive(p: Panggung, g: Objek, x: number, y: number) {
  if (tenangAktif()) return to(g, { x, y }, 400)
  const dx = x - g._x
  const dy = y - g._y
  const arah = Math.sign(dx) || g.dir || 1
  speedLines(p, g, arah)
  // Ancang-ancang sebentar, melesat, lewat sedikit, lalu diam di posisi mendarat
  await to(g, { x: g._x - dx * 0.04, y: g._y - dy * 0.04, r: -arah * 5 }, 110, 'ancang')
  await to(g, { x: x + arah * 14, y, r: arah * 3 }, 430, 'keluar')
  await to(g, { x, r: 0 }, 190, 'pose')
  comic(p, 'WUSH!', x - arah * 30, y - 100, 'var(--color-paper)', p.world).catch(() => {})
}

export async function arc(g: Objek, x: number, y: number, lift: number, ms: number) {
  if (tenangAktif()) return to(g, { x, y }, ms)
  const path = `M${g._x},${g._y} Q${(g._x + x) / 2},${Math.min(g._y, y) - lift} ${x},${y}`
  // resolution 1: kemajuan mengikuti parameter kurva seperti prototype, bukan kecepatan rata
  await gsap.to(g, {
    motionPath: { path, resolution: 1 },
    duration: durasi(ms) / 1000,
    ease: 'busur',
  })
  g._x = x
  g._y = y
}

export async function comic(
  p: Panggung,
  word: string,
  x: number,
  y: number,
  fill: string,
  parent: Element = p.fx,
) {
  if (tenangAktif()) return
  const g = obj(x, y, parent)
  g.dataset.effect = 'onomatope'
  g.dataset.word = word
  g._r = -5
  pasang(g, { rotation: -5 })
  const chars = [...word]
  const letters = chars.map((char, i) => {
    const letter = obj((i - (chars.length - 1) / 2) * 34, i % 2 ? -3 : 3, g)
    const potongan: Titik[] = [
      [-17, -28],
      [17, -30],
      [19, 26],
      [-18, 28],
    ]
    cut(letter, potongan, fill, {}, 1, { bayangan: true })
    teks(letter, 0, 13, char, 36, 'var(--color-ink)')
    hide(letter)
    letter._s = 0.5
    letter._y += 22
    letter._r = i % 2 ? 7 : -7
    return letter
  })
  for (const letter of letters) {
    void to(letter, { o: 1, s: 1, y: letter._y - 22 }, 360, 'letup')
    await wait(p, 45)
  }
  await wait(p, 800)
  await to(g, { o: 0, s: 0.94 }, 220, 'ancang')
  g.remove()
}

// Letupan H02 di belakang objek yang terbelah
export function burstBehind(p: Panggung, g: Objek, sisi = 480) {
  if (tenangAktif()) return
  const burst = obj(g._x, g._y, p.world)
  burst.dataset.effect = 'split-burst'
  p.world.insertBefore(burst, g)
  el('image', { href: gambarLetupan, x: -sisi / 2, y: -sisi / 2, width: sisi, height: sisi }, burst)
  hide(burst)
  burst._s = 0.5
  burst._r = -8
  to(burst, { o: 1, s: 1, r: 0 }, 300, 'letup')
    .then(() => wait(p, 650))
    .then(() => to(burst, { o: 0, s: 1.04 }, 260))
    .then(
      () => burst.remove(),
      () => {},
    )
}

// Posisi dunia ke posisi adegan 1600x900 setelah kamera, untuk sasaran ketuk HTML
export const keLayar = (p: Panggung, x: number, y: number): [number, number] => [
  p.cam._x + x * p.cam._s,
  p.cam._y + y * p.cam._s,
]

// Tulisan besar di lapisan efek, seperti kinetic() di prototype
export function kinetik(p: Panggung, x: number, y: number, t: string, size: number, fill: string) {
  const g = obj(x, y, p.fx)
  const e = teks(g, 0, 0, t, size, fill, 400)
  e.setAttribute('font-family', 'Grandstander, sans-serif')
  return Object.assign(g, { teks: e })
}

export const camTo = (p: Panggung, x: number, y: number, s: number, ms = 1400) =>
  to(p.cam, { x: 800 - x * s, y: 450 - y * s, s }, ms, 'kamera')

// Latar lebar: sumber 1672x941 diperlebar 293 px di tiap sisi (2258x1527). Bagian tengahnya tepat
// menutup adegan 1600x900; sisanya ditampilkan .pemutar-latar di bilah layar yang tidak 16:9.
const LATAR = {
  x: (-293 * 1600) / 1672,
  y: (-293 * 900) / 941,
  width: (2258 * 1600) / 1672,
  height: (1527 * 900) / 941,
  preserveAspectRatio: 'none',
}

export async function pasangLatar(p: Panggung, href: string, nama: string) {
  const latar = obj(0, 0, p.latar)
  latar.dataset.latar = nama
  el('image', { href, ...LATAR }, latar)
  hide(latar)
  usePemutar.setState({ latar: href })
  await to(latar, { o: 1 }, 600)
}
