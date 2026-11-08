import sel from '../../assets/images/sel-hewan.webp'
import PemutarEpisode from '../../features/pemutar-episode/PemutarEpisode'
import { wait, type Panggung } from '../../features/pemutar-episode/mesin'
import { usePemutar } from '../../stores/pemutar'

const BAB = [
  { k: 'a', t: 'Substrat' },
  { k: 'b', t: 'Dua tahap' },
  { k: 'c', t: 'Investasi energi', poe: true },
  { k: 'd', t: 'Pembentukan energi' },
  { k: 'e', t: 'ATP bersih', poe: true },
  { k: 'g', t: 'Hasil' },
  { k: 'h', t: 'Pengertian' },
]

// Sementara: dua kalimat pembuka dari prototype, sampai adegan pembuka selesai dibangun
async function pembuka(p: Panggung) {
  usePemutar.setState({
    kalimat:
      'Kamu makan nasi. Di dalam tubuh, nasi dicerna menjadi glukosa, lalu glukosa masuk ke dalam sel.',
    pose: '01-ramah',
  })
  await wait(p, 2000)
  usePemutar.setState({
    kalimat: 'Pemecahan glukosa dimulai di sitosol, cairan sel di luar mitokondria.',
    pose: '05-menjelaskan',
    pendamping: '01-ramah',
  })
  await wait(p, 2000)
}

function Episode1Glikolisis() {
  return (
    <PemutarEpisode
      judul="Glikolisis"
      label="Aktivitas 1.7 · Episode 01"
      ringkasan="Tonton bagaimana sel memecah glukosa. Videonya berhenti di setiap soal Aktivitas 1.7: kamu menjawab langsung di adegan, lalu videonya berlanjut sesuai pilihanmu."
      bab={BAB}
      gambarSampul={sel}
      jalankan={pembuka}
    />
  )
}

export default Episode1Glikolisis
