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
  await camTo(p, 1000, 460, 1.15, 1100)
  await say(p, 'e1-d-01')

  // Dua elektron per PGAL, di samping PGAL atas (y 270) dan bawah (y 540)
  const pasangan = [270, 540].map((y) =>
    [-18, 18].map((dy) => {
      const e = hide(elektron(p.world, 860, y + dy))
      void to(e, { o: 1, x: 940 }, 600)
      return e
    }),
  )
  // NAD⁺ atas mulai di y 330 (prototype 250) agar tidak tertutup petunjuk ketuk di HP miring
  const nads = [badge(p, 1250, 330, 'NAD⁺'), badge(p, 1250, 610, 'NAD⁺')]
  for (const n of nads) void to(hide(n), { o: 1 }, 500)

  await mintaKetukSemua(
    p.signal,
    'Ketuk NAD⁺ untuk menangkap elektron',
    nads.map((n, i) => ({
      teks: `NAD⁺ ${i + 1}`,
      posisi: keLayar(p, n._x, n._y),
      ukuran: [170, 90],
    })),
    async (i) => {
      const n = nads[i]
      const es = pasangan[i]
      const y = es[0]._y + 18
      await arc(n, 1020, y, 80, 600)
      void comic(p, 'KLIK', 1020, y - 85, 'var(--color-nad)', p.world)
      bunyi('klik')
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

      // PGAL mengikat satu fosfat bebas: 1,3-bifosfogliserat, 3 C dan 2 P
      const ph = i ? m2 : m1
      const f = hide(obj(-ph.side * 45, 40, ph)) as Fosfat
      phos(f, 0, 0)
      f.bond = strip(ph, ph.side * 50, 86, -ph.side * 45, 40, 7)
      ph.insertBefore(f.bond, ph.firstChild)
      ph.p2 = f
      ph.dataset.molecule = 'bifosfogliserat'
      ph.label?.remove()
      ph.label = label(ph, ph.side * 75, 155, '1,3-bifosfogliserat · 3 C', 18)
      await wait(p, 120)
      await to(f, { o: 1 }, 0)
      bunyi('muncul')
    },
  )

  await say(p, 'e1-d-02')
  await Promise.all(nads.map((n, i) => to(n, { x: 1480, y: 160 + i * 70, s: 0.8 }, 700)))
  await say(p, 'e1-d-03')

  const targets = [m1.p1!, m1.p2!, m2.p1!, m2.p2!]
  let count = 0
  // Di bawah bilah kontrol (prototype y 150 tertutup bilah di HP miring)
  const counter = kinetik(p, 260, 210, 'ATP terbentuk: 0', 34, 'var(--color-paper)')
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
      const adp = carrier(p, ox - 100, 860, 'ADP')
      adp._s = 0.65
      hide(adp)
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
      // Berjajar di kanan bawah tanpa saling menimpa (lencana + 3 P kira-kira 135 satuan),
      // di luar label molekul bawah dan di bawah label piruvat
      await to(adp, { x: 920 + count * 140, y: 710, s: 0.55 }, 600)
    },
  )

  await say(p, 'e1-d-04')
  const r1 = hide(piruvat(p, 800, 320))
  const r2 = hide(piruvat(p, 800, 590))
  const w = [air(p, 1180, 140), air(p, 1300, 140)].map(hide)
  await Promise.all([
    to(m1, { o: 0 }, 0),
    to(m2, { o: 0 }, 0),
    to(r1, { o: 1 }, 0),
    to(r2, { o: 1 }, 0),
    ...w.map((b) => to(b, { o: 1 }, 500)),
  ])
  m1.remove()
  m2.remove()
  await Promise.all([
    to(r1, { x: 1300, y: 320 }, 1200),
    to(r2, { x: 1300, y: 590 }, 1200),
    camTo(p, 800, 450, 1, 1200),
  ])

  useJawaban
    .getState()
    .catat('d', 'PGAL dioksidasi menjadi asam piruvat; terbentuk 2 NADH, 4 ATP, 2 H₂O')
  return [r1, r2] as Objek[]
}
