import sel from '../../assets/images/sel-hewan.webp'
import PemutarEpisode from '../../features/pemutar-episode/PemutarEpisode'
import { pembuka } from './pembuka'
import { soalAB } from './soalAB'
import { useJawaban } from '../../stores/jawaban'
import type { Panggung } from '../../features/pemutar-episode/mesin'

async function jalankan(p: Panggung) {
  useJawaban.getState().mulai()
  await pembuka(p)
  await soalAB(p)
}

const BAB = [
  { k: 'a', t: 'Substrat' },
  { k: 'b', t: 'Dua tahap' },
  { k: 'c', t: 'Investasi energi', poe: true },
  { k: 'd', t: 'Pembentukan energi' },
  { k: 'e', t: 'ATP bersih', poe: true },
  { k: 'g', t: 'Hasil' },
  { k: 'h', t: 'Pengertian' },
]

function Episode1Glikolisis() {
  return (
    <PemutarEpisode
      judul="Glikolisis"
      label="Aktivitas 1.7 · Episode 01"
      ringkasan="Tonton bagaimana sel memecah glukosa. Videonya berhenti di setiap soal Aktivitas 1.7: kamu menjawab langsung di adegan, lalu videonya berlanjut sesuai pilihanmu."
      bab={BAB}
      gambarSampul={sel}
      jalankan={jalankan}
    />
  )
}

export default Episode1Glikolisis
