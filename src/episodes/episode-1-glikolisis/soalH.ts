import { mintaLengkapi, type Rumpang } from '../../features/pemutar-episode/kalimat'
import { hide, kinetik, to, type Objek, type Panggung } from '../../features/pemutar-episode/mesin'
import { useJawaban } from '../../stores/jawaban'
import { usePemutar } from '../../stores/pemutar'
import { say } from './naskah'

const POTONGAN = [
  'Glikolisis adalah pemecahan satu glukosa (6 C) menjadi ',
  ' di ',
  ' dalam kondisi ',
  ', dengan hasil sampingan ',
  '.',
]

// Urutan pilihan diacak sekali dan tetap; pengecoh tempat dan kondisi dari prototype
const RUMPANG: Rumpang[] = [
  {
    opsi: ['2 asetil KoA (2 C)', '2 asam piruvat (3 C)', '6 CO₂'],
    benar: 1,
    salah: {
      0: 'Asetil KoA baru terbentuk di tahap berikutnya, di mitokondria.',
      2: 'Karbon glukosa masih utuh di asam piruvat: 3 + 3 = 6, belum ada CO₂.',
    },
  },
  {
    opsi: ['matriks mitokondria', 'membran krista', 'sitosol'],
    benar: 2,
    salah: {
      0: 'Glikolisis terjadi sebelum masuk mitokondria.',
      1: 'Membran krista adalah tempat transpor elektron.',
    },
  },
  {
    opsi: ['aerob (memakai oksigen)', 'anaerob (tanpa oksigen)'],
    benar: 1,
    salah: { 0: 'Lihat lagi: tidak ada oksigen yang dipakai sepanjang episode ini.' },
  },
  {
    opsi: ['2 NADH dan 2 ATP', '2 FADH₂ dan 2 ATP', '2 NADH dan 4 ATP'],
    benar: 0,
    salah: {
      1: 'Glikolisis menghasilkan NADH, bukan FADH₂.',
      2: '4 ATP terbentuk, tetapi 2 dipakai di awal; bersihnya 2.',
    },
  },
]

// Soal h, Pengertian: lengkapi kalimat, lalu asam piruvat melanjutkan perjalanannya
export async function soalH(p: Panggung, piruvat: Objek[]) {
  usePemutar.setState({ bab: 6 })
  p.fx.replaceChildren()
  await say(p, 'e1-h-01', { pendamping: '01-ramah' })
  await say(p, 'e1-h-02', { pendamping: '08-menunjuk' })
  const kalimat = await mintaLengkapi(
    p.signal,
    'Lengkapi kalimat pengertian glikolisis',
    POTONGAN,
    RUMPANG,
  )
  useJawaban.getState().catat('h', kalimat)

  p.fx.replaceChildren()
  const k = hide(kinetik(p, 800, 200, 'GLIKOLISIS', 72, 'var(--color-paper)'))
  await to(k, { o: 1 }, 600)
  await say(p, 'e1-h-03', { pendamping: '07-bangga' })
  // Kedua piruvat kembali hanya untuk perjalanan ke mitokondria, setelah kartu selesai.
  p.world.append(...piruvat)
  await Promise.all(piruvat.map((r, i) => to(r, { x: 1300, y: 380 + i * 160, s: 1, o: 1 }, 500)))
  await Promise.all(piruvat.map((r, i) => to(r, { x: 1700, y: 440 + i * 60 }, 1800)))
  await say(p, 'e1-h-04', { pendamping: '09-melambaikan' })
}
