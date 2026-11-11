import { hapusBentuk, label, strip } from '../../features/pemutar-episode/kertas'
import {
  arc,
  camTo,
  comic,
  hide,
  keLayar,
  kinetik,
  obj,
  to,
  wait,
  type Objek,
  type Panggung,
} from '../../features/pemutar-episode/mesin'
import { mintaKetukSemua } from '../../features/pemutar-episode/pilihan'
import { bunyi } from '../../lib/suara'
import { useJawaban } from '../../stores/jawaban'
import { usePemutar } from '../../stores/pemutar'
import {
  air,
  badge,
  carrier,
  elektron,
  phos,
  piruvat,
  relabel,
  type Fosfat,
  type Separuh,
} from './molekul'
import { say } from './naskah'

// Soal d, Pembentukan energi: tiap PGAL melepas 2 e⁻ ke satu NAD⁺, mengikat satu fosfat bebas,
// lalu keempat fosfat dipanen menjadi 4 ATP dan molekulnya menjadi asam piruvat + H₂O.
export async function soalD(p: Panggung, [m1, m2]: [Separuh, Separuh]) {
  usePemutar.setState({ bab: 3 })
  for (const ph of [m1, m2]) {
    ph.label?.remove()
    ph.label = label(ph, ph.side * 75, 138, 'PGAL · 3 C', 20)
  }
  const tempat = p.svg.querySelector<Objek>('[data-objek="label-sitosol"]')!
  const hp = matchMedia('(max-height: 500px) and (orientation: landscape)').matches
  // Desktop lebih ke kiri; di HP atom C tetap di luar popup petunjuk.
  const geser = hp ? 0 : 160
  bunyi('geser')
  await Promise.all([
    camTo(p, 1000, 460, 1.15, 1100),
    to(m1, { x: 1055 - geser }, 1100),
    to(m2, { x: 905 - geser }, 1100),
  ])
  if (hp) {
    const [x, y] = keLayar(p, 1270, 125)
    await to(tempat, { x, y }, 0)
    tempat.style.display = 'inline'
  }
  await say(p, 'e1-d-01')

  // Dua elektron muncul dekat PGAL masing-masing, lalu bergerak menuju NAD+.
  bunyi('muncul')
  const pasangan = [m1, m2].map((pgal) =>
    [-18, 18].map((dy) => {
      const jarakSisi = pgal.side === 1 ? 220 : 85
      const e = hide(elektron(p.world, pgal._x + jarakSisi, pgal._y + dy))
      void to(e, { o: 1 }, 500)
      return e
    }),
  )
  // NAD⁺ atas mulai di y 330 (prototype 250) agar tidak tertutup petunjuk ketuk di HP miring
  const nads = [badge(p, 1400 - geser, 330, 'NAD⁺'), badge(p, 1400 - geser, 610, 'NAD⁺')]
  for (const n of nads) void to(hide(n), { o: 1 }, 500)

  await mintaKetukSemua(
    p.signal,
    'Ketuk kedua NAD⁺ untuk menangkap elektron.',
    nads.map((n, i) => ({
      teks: `NAD⁺ ${i + 1}`,
      posisi: keLayar(p, n._x, n._y),
      ukuran: [170, 90],
    })),
    async (i) => {
      const n = nads[i]
      const es = pasangan[i]
      const y = es[0]._y + 18
      bunyi('geser')
      await Promise.all(es.map((e, k) => arc(e, n._x - 80, n._y + (k ? 14 : -14), 80, 600)))
      void comic(p, 'KLIK', n._x, y - 85, 'var(--color-nad)', p.world)
      bunyi('tempel')
      // Kedua elektron ditangkap dan ikut menempel di NADH
      await Promise.all(
        es.map((e, k) => {
          n.append(e)
          e._x -= n._x
          e._y -= n._y
          return to(e, { x: -80, y: k ? 14 : -14 }, 300)
        }),
      )
      relabel(n, 'NADH')
      bunyi('atp')

      // PGAL mengikat satu fosfat bebas: 1,3-bifosfogliserat, 3 C dan 2 P
      const ph = i ? m2 : m1
      const f = hide(obj(-ph.side * 45, 40, ph)) as Fosfat
      phos(f, 0, 0)
      f.bond = strip(ph, ph.side * 50, 86, -ph.side * 45, 40, 7)
      ph.insertBefore(f.bond, ph.firstChild)
      ph.p2 = f
      ph.dataset.molecule = 'bifosfogliserat'
      ph.label?.remove()
      ph.label = label(ph, ph.side * 75, 138, '1,3-bifosfogliserat · 3 C', 18)
      await wait(p, 120)
      await to(f, { o: 1 }, 0)
      bunyi('muncul')
    },
  )

  await say(p, 'e1-d-02')
  // Hasil soal d rapat di area kosong tengah-kanan (kiri dipakai kartu dan nampan soal e);
  // NADH sebelum hiasan mitokondria di pojok kanan atas latar
  bunyi('geser')
  await Promise.all(nads.map((n, i) => to(n, { x: 1350, y: 200 + i * 75, s: 0.8 }, 700)))
  await say(p, 'e1-d-03')

  const targets = [m1.p1!, m1.p2!, m2.p1!, m2.p2!]
  let count = 0
  // Di bawah popup petunjuk, termasuk di HP miring.
  const counter = kinetik(p, 260, 300, 'ATP terbentuk: 0', 34, 'var(--color-paper)')
  const dunia = (t: Fosfat, i: number): [number, number] => {
    const m = i < 2 ? m1 : m2
    return [m._x + t._x, m._y + t._y]
  }

  await mintaKetukSemua(
    p.signal,
    'Ketuk tiap fosfat',
    targets.map((t, i) => ({
      teks: `Fosfat ${i + 1}`,
      posisi: keLayar(p, ...dunia(t, i)),
      ukuran: [80, 80],
    })),
    async (i) => {
      const t = targets[i]
      const [ox, oy] = dunia(t, i)
      const adp = carrier(p, ox - 100, 650, 'ADP')
      adp._s = 0.65
      hide(adp)
      bunyi('geser')
      await to(adp, { o: 1, y: oy + 60 }, 500)

      // Fosfat pindah dari molekul ke ADP: jumlah P tetap
      hapusBentuk(t.bond)
      t.remove()
      const bond = strip(adp, 140, 0, 164, 0, 7)
      const f = Object.assign(obj(164, 0, adp), { bond })
      phos(f, 0, 0)
      adp.ps.push(f)
      bunyi('atp')
      relabel(adp, 'ATP')
      void comic(p, 'KLIK', ox, oy - 100, 'var(--color-fosfat)', p.world)
      count++
      counter.teks.textContent = `ATP terbentuk: ${count}`
      // Satu kolom di samping kedua piruvat (lencana + 3 P kira-kira 130 x 30 satuan)
      bunyi('geser')
      await to(adp, { x: 1320, y: 300 + count * 60, s: 0.55 }, 600)
    },
  )

  await say(p, 'e1-d-04')
  const r1 = hide(piruvat(p, 800, 320))
  const r2 = hide(piruvat(p, 800, 590))
  const w = [air(p, 1060, 175), air(p, 1180, 175)].map(hide)
  bunyi('muncul')
  await Promise.all([
    to(m1, { o: 0 }, 0),
    to(m2, { o: 0 }, 0),
    to(r1, { o: 1 }, 0),
    to(r2, { o: 1 }, 0),
    ...w.map((b) => to(b, { o: 1 }, 500)),
  ])
  m1.remove()
  m2.remove()
  bunyi('geser')
  await Promise.all([
    to(r1, { x: 1130, y: 360 }, 1200),
    to(r2, { x: 1130, y: 560 }, 1200),
    camTo(p, 800, 450, 1, 1200),
  ])
  tempat.style.removeProperty('display')
  await to(tempat, { x: 800, y: 80 }, 0)

  useJawaban
    .getState()
    .catat('d', 'PGAL dioksidasi menjadi asam piruvat; terbentuk 2 NADH, 4 ATP, 2 H₂O')
  return [r1, r2] as Objek[]
}
