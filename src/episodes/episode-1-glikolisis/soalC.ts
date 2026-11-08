import { hapusBentuk, label, strip } from '../../features/pemutar-episode/kertas'
import {
  arc,
  arrive,
  burstBehind,
  camTo,
  comic,
  shake,
  speedLines,
  to,
  type Objek,
  type Panggung,
} from '../../features/pemutar-episode/mesin'
import {
  mintaJelaskan,
  mintaTebak,
  tandaiAmati,
  tampilkanAmati,
  tutupPoe,
} from '../../features/pemutar-episode/poe'
import { bunyi } from '../../lib/suara'
import { useJawaban } from '../../stores/jawaban'
import { usePemutar } from '../../stores/pemutar'
import { carrier, countCarbons, relabel, type Glukosa, type Pembawa, type Separuh } from './molekul'
import { say } from './naskah'

export async function soalC(
  p: Panggung,
  glu: Glukosa,
  penanda: Objek[],
): Promise<[Separuh, Separuh]> {
  usePemutar.setState({ bab: 2 })
  await say(p, 'e1-c-01')

  const reasons = [
    'Satu ATP sudah cukup untuk memecah glukosa.',
    'Glukosa perlu dua fosfat agar terbelah, dan tiap ATP memberi satu fosfat.',
    'Makin banyak ATP, makin cepat dan makin banyak hasilnya.',
  ]

  const P = await mintaTebak(p.signal, {
    judul: 'Berapa ATP yang dibutuhkan untuk memecah glukosa?',
    reasons,
    right: 2,
    zone: { x: 300, y: 430, w: 380, h: 390, name: 'glukosa' },
    supply: [
      [620, 580],
      [740, 580],
      [860, 580],
    ],
    slot: (i, n) => [300 + (i - (n - 1) / 2) * 120, 285],
  })

  useJawaban.getState().catatPoe('c', { tebakan: P.g, alasan: P.r })
  tampilkanAmati(P.g, 'ATP')

  // Animasi Amati: Investasi energi. Panah dan judul tahap soal b dipudarkan seperti prototype.
  for (const m of penanda) void to(m, { o: 0 }, 180).then(() => m.remove())
  await Promise.all([camTo(p, 800, 450, 1, 700), to(glu, { x: 800, y: 535, s: 1.25 }, 700)])

  const atps = P.from.map(([x, y], i) => carrier(p, x, y, 'ATP', i ? -1 : 1))
  await Promise.all(atps.map((a, i) => arrive(p, a, i ? 1370 : 230, i > 1 ? 790 : 675)))

  await say(p, P.g === 1 ? 'e1-c-atp-1' : P.g === 2 ? 'e1-c-atp-2' : 'e1-c-atp-3')

  const give = async (a: Pembawa, side: number) => {
    await to(a, { y: 660 }, 300)
    const ph = a.ps.pop()!
    hapusBentuk(ph.bond)
    // Pindah induk: posisi ditulis ulang ke koordinat induk baru agar fosfat tidak melompat
    p.world.append(ph)
    await to(ph, { x: a._x + ph._x, y: a._y }, 0)

    relabel(a, 'ADP')
    const targetX = glu._x + side * 155 * glu._s

    bunyi('muncul')
    await arc(ph, targetX, glu._y, 150, 700)

    const half = glu.halves[side < 0 ? 0 : 1]
    half.append(ph)
    await to(ph, { x: side * 155, y: 0 }, 0)
    const bond = strip(
      half,
      side * 100,
      0,
      side * 155,
      0,
      7,
      'var(--color-paper)',
      {},
      { bayangan: true },
    )
    half.insertBefore(bond, half.firstChild)
    ph.bond = bond
    half.p1 = ph

    bunyi('klik')
    await comic(p, 'KLIK', targetX + side * 25, glu._y - 130, 'var(--color-fosfat)', p.world)

    speedLines(p, a, side)
    void to(a, { x: side < 0 ? 170 : 1430, y: 800, o: 0.8 }, 700, 'busur')
  }

  await give(atps[0], -1)
  await say(p, 'e1-c-02')

  if (P.g === 1) {
    await say(p, 'e1-c-03')
    tandaiAmati('salah', 'belum cukup')
    bunyi('belum-tepat')
    await shake(p, glu)
    await shake(p, glu)
    await say(p, 'e1-c-04')
    const b = carrier(p, 1680, 750, 'ATP', -1)
    await arrive(p, b, 1370, 675)
    await give(b, 1)
  } else {
    await give(atps[1], 1)
    if (P.g > 2) {
      await say(p, 'e1-c-05')
      tandaiAmati('salah', 'ATP ketiga tidak terpakai')
      bunyi('belum-tepat')
      await shake(p, atps[2])
      await to(atps[2], { y: 860, o: 0.3 }, 600)
    } else {
      tandaiAmati('benar')
    }
  }

  await say(p, 'e1-c-06')

  const rumble = comic(p, 'DRRRT', glu._x + 255, glu._y - 130, 'var(--color-hot)', p.world)
  for (const bond of Array.from(glu.cross.querySelectorAll('polygon:not([data-bayangan])'))) {
    bond.setAttribute('fill', 'var(--color-hot)')
  }
  await shake(p, glu, 3.2, 720)
  await rumble

  bunyi('belah')
  burstBehind(p, glu)
  await comic(p, 'KRAAK!', glu._x, 310, 'var(--color-hot)', p.world)

  glu.cross.remove()
  glu.label.remove()
  const [m1, m2] = glu.halves
  p.world.append(m1, m2)
  for (const h of [m1, m2]) {
    h.dataset.molecule = 'pgal'
    h._x = glu._x
    h._y = glu._y
    h._s = glu._s
  }
  glu.remove()

  await Promise.all([
    to(m1, { x: 560, y: 545, r: -14 }, 520),
    to(m2, { x: 1040, y: 545, r: 14 }, 520),
  ])
  await Promise.all([to(m1, { y: 535, r: 0 }, 420), to(m2, { y: 535, r: 0 }, 420)])
  m1.close.setAttribute('opacity', '1')
  m2.close.setAttribute('opacity', '1')

  for (const h of [m1, m2]) {
    h.label = label(h, h.side * 75, 155, 'PGAL · 3 C', 20)
  }

  await say(p, 'e1-c-07', { pendamping: '08-menunjuk' })
  await countCarbons(p, [m1, m2])

  // Tahap Jelaskan
  const x = await mintaJelaskan(p.signal, {
    g: P.g,
    r: P.r,
    unit: 'ATP',
    reasons,
    back: [
      'Satu fosfat belum cukup: glukosa baru terbelah setelah fosfat kedua.',
      'Ya. Dua ATP memberi dua fosfat, lalu glukosa terbelah menjadi 2 PGAL.',
      'ATP ketiga tidak terpakai. Tahap ini cukup 2 ATP.',
    ],
    right: 2,
    alasanBenar: 1,
    hasil: 'glukosa terbelah setelah menerima 2 fosfat dari 2 ATP',
  })

  useJawaban.getState().catatPoe('c', { penjelasan: x })
  useJawaban
    .getState()
    .catat('c', 'Glukosa diberi 2 fosfat lalu terbelah menjadi 2 PGAL; memakai 2 ATP')
  tutupPoe()

  await Promise.all([to(m1, { x: 875, y: 290, s: 1 }, 800), to(m2, { x: 725, y: 565, s: 1 }, 800)])

  return [m1, m2]
}
