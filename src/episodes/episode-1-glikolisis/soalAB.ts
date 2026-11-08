import { el } from '../../features/pemutar-episode/kertas'
import { hide, obj, shake, teks, to, type Panggung } from '../../features/pemutar-episode/mesin'
import { mintaPilihan } from '../../features/pemutar-episode/pilihan'
import { bunyi } from '../../lib/suara'
import { useJawaban } from '../../stores/jawaban'
import { usePemutar } from '../../stores/pemutar'
import { glukosa, oksigen, piruvat } from './molekul'
import { say } from './naskah'

export async function soalAB(p: Panggung) {
  usePemutar.setState({ bab: 0 })
  const g = glukosa(p, 800, 380)
  const pir = piruvat(p, 420, 560)
  const o2 = oksigen(p, 1180, 560)
  await Promise.all([g, pir, o2].map((m) => to(hide(m), { o: 1 }, 600)))
  await say(p, 'e1-a-01')
  await mintaPilihan(
    p.signal,
    {
      judul: 'Ketuk molekulnya',
      opsi: [
        { teks: 'Glukosa (6 atom C)', posisi: [800, 420] },
        { teks: 'Asam piruvat (3 atom C)', posisi: [420, 580] },
        { teks: 'O₂ (2 atom O)', posisi: [1180, 580] },
      ],
    },
    0,
    async (i) => {
      usePemutar.setState({
        kalimat:
          i === 1
            ? 'Asam piruvat justru hasil di akhir glikolisis, bukan bahannya.'
            : 'Glikolisis berlangsung tanpa oksigen.',
      })
      await shake(p, i === 1 ? pir : o2)
    },
  )
  useJawaban.getState().catat('a', 'Glukosa (6 atom C)')
  await Promise.all([to(pir, { o: 0, x: 200 }, 700), to(o2, { o: 0, x: 1400 }, 700)])
  pir.remove()
  o2.remove()
  bunyi('muncul')
  await to(g, { s: 1.25 }, 400)
  await to(g, { s: 1 }, 300)
  await say(p, 'e1-a-02')
  await to(g, { x: 300, y: 440 }, 1100)

  usePemutar.setState({ bab: 1 })
  for (const d of ['M420 440 L660 440', 'M940 440 L1180 440']) {
    el(
      'path',
      {
        d,
        stroke: 'var(--color-paper)',
        'stroke-width': 8,
        'stroke-dasharray': '6 14',
        'stroke-linecap': 'round',
        opacity: 0.8,
      },
      p.world,
    )
  }
  await say(p, 'e1-b-01')
  await mintaPilihan(
    p.signal,
    {
      judul: 'Ada berapa tahap utama dalam glikolisis?',
      opsi: ['1 tahap', '2 tahap', '3 tahap'].map((teks) => ({ teks })),
    },
    1,
    () => {
      usePemutar.setState({
        kalimat:
          'Lihat dua panah putus-putus di layar: tahap memakai ATP, lalu tahap membentuk ATP.',
      })
    },
  )
  useJawaban.getState().catat('b', '2 tahap: investasi energi dan pembentukan energi')
  for (const [x, judul] of [
    [540, 'Investasi energi'],
    [1060, 'Pembentukan energi'],
  ] as const) {
    const k = obj(x, 290, p.world)
    teks(k, 0, 0, judul, 26, 'var(--color-paper)')
    bunyi('melesat')
    await to(hide(k), { o: 1, y: 260 }, 700)
  }
  await say(p, 'e1-b-02')
}
