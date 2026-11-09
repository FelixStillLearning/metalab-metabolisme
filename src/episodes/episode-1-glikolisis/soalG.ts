import { cut, el, skeleton } from '../../features/pemutar-episode/kertas'
import {
  hide,
  kinetik,
  obj,
  shake,
  teks,
  to,
  type Objek,
  type Panggung,
} from '../../features/pemutar-episode/mesin'
import { mintaKetukSemua } from '../../features/pemutar-episode/pilihan'
import { bunyi } from '../../lib/suara'
import { useJawaban } from '../../stores/jawaban'
import { usePemutar } from '../../stores/pemutar'
import gambarAtp from '../../assets/images/pembawa-atp.webp'
import gambarNadh from '../../assets/images/pembawa-nadh.webp'
import gambarAir from '../../assets/images/molekul-h2o.webp'
import gambarCo2 from '../../assets/images/molekul-co2.webp'
import gambarOksigen from '../../assets/images/molekul-o2.webp'
import { say } from './naskah'

type IsiChip = (g: SVGGElement) => void

const gambar =
  (href: string, w: number, h: number, data: Record<string, string> = {}): IsiChip =>
  (g) => {
    const wadah = el('g', {}, g)
    for (const [k, v] of Object.entries(data)) wadah.dataset[k] = v
    el('image', { href, x: -w / 2, y: -h / 2 - 14, width: w, height: h }, wadah)
  }

// Asam piruvat digambar kode seperti di adegan: 3 C terhitung
const piruvatKecil: IsiChip = (g) => {
  const m = el('g', { transform: 'translate(0 -10) scale(0.62)' }, g)
  skeleton(
    m,
    [
      [-75, 12],
      [0, -18],
      [75, 12],
    ],
    [
      [0, 1],
      [1, 2],
    ],
  )
}

// Seperti chG() prototype: [id, label, benar]; chip bergambar dengan label di bawahnya.
// Gambar CO₂ (D18) 1 C + 2 O, O₂ (D19) 2 O, H₂O (D20) 1 O + 2 H.
const ITEM: [string, string, boolean, IsiChip][] = [
  ['pir', '2 asam piruvat', true, piruvatKecil],
  ['nadh', '2 NADH', true, gambar(gambarNadh, 128, 52)],
  ['atp', '2 ATP bersih', true, gambar(gambarAtp, 128, 52)],
  ['h2o', '2 H₂O', true, gambar(gambarAir, 96, 64, { molecule: 'h2o' })],
  ['co2', 'CO₂', false, gambar(gambarCo2, 140, 42, { molecule: 'co2', karbon: '1', oksigen: '2' })],
  ['o2', 'O₂', false, gambar(gambarOksigen, 120, 60, { molecule: 'o2', oksigen: '2' })],
]

function chip(p: Panggung, x: number, y: number, id: string, label: string, isi: IsiChip) {
  const g = obj(x, y, p.fx)
  g.dataset.chip = id
  cut(
    g,
    [
      [-80, -62],
      [79, -64],
      [81, 61],
      [-79, 63],
    ],
    'var(--color-screen-3)',
    {},
    1,
    { bayangan: true },
  )
  isi(g)
  teks(g, 0, 46, label, 20, 'var(--color-paper)')
  return g
}

// Soal g, Senyawa yang dihasilkan: ketuk kumpulkan keempat hasil, pengecoh CO₂ dan O₂ ditolak.
// Hasil terkumpul di tengah, di atas deretan pilihan dan di luar ruang narator.
export async function soalG(p: Panggung, piruvat: Objek[]) {
  usePemutar.setState({ bab: 5 })
  p.fx.replaceChildren()
  for (const r of piruvat) r.remove()
  await say(p, 'e1-g-01')

  const chips = ITEM.map(([id, label, , isi], i) => {
    const c = chip(p, 325 + i * 190, 550, id, label, isi)
    void to(hide(c), { o: 1 }, 400)
    return c
  })
  const tray = kinetik(p, 800, 260, 'HASIL GLIKOLISIS', 34, 'var(--color-paper)')
  let got = 0

  await mintaKetukSemua(
    p.signal,
    'Ketuk hasil glikolisis',
    chips.map((c, i) => ({ teks: ITEM[i][1], posisi: [c._x, c._y], ukuran: [170, 136] })),
    async (i) => {
      const c = chips[i]
      c.dataset.terkumpul = ''
      bunyi('muncul')
      await to(c, { x: 440 + got++ * 240, y: 370 }, 600)
    },
    {
      indeks: [4, 5],
      salah: async (i) => {
        usePemutar.setState({
          kalimat:
            ITEM[i][0] === 'co2'
              ? 'CO₂ belum dilepas di glikolisis: karbon masih utuh di asam piruvat (3 + 3 = 6).'
              : 'Glikolisis tidak menghasilkan dan tidak memakai oksigen.',
        })
        await shake(p, chips[i])
      },
    },
  )

  await Promise.all(chips.slice(4).map((c) => to(c, { o: 0 }, 400).then(() => c.remove())))
  useJawaban.getState().catat('g', '2 asam piruvat, 2 NADH, 2 ATP (bersih), 2 H₂O')
  await say(p, 'e1-g-02', { pendamping: '07-bangga' })
  void to(tray, { o: 0 }, 400).then(() => tray.remove())
}
