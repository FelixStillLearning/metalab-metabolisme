import { useLocation, useNavigate } from 'react-router'
import ikon from '../../assets/images/sampul-pengantar.webp'
import PemutarEpisode from '../../features/pemutar-episode/PemutarEpisode'
import { useAdeganE0, jalankanEpisode0 } from './adegan'
import { usePilah } from './pilah'
import { SOAL } from './isi'
import PapanReaksi from './PapanReaksi'
import PilahAdegan from './PilahAdegan'
import './episode-0.css'

const BAB = [
  ...SOAL.map((s) => ({ k: s.k.replace('1.5', '1.5 '), t: s.t })),
  { k: '1.6', t: 'Tabel perbandingan' },
]

export default function Episode0Pengantar() {
  const navigate = useNavigate()
  const otomatis = (useLocation().state as { otomatis?: boolean } | null)?.otomatis === true
  return (
    <div className="episode-0">
      <PemutarEpisode
        judul="Pengantar metabolisme"
        label="Episode 0"
        ringkasan="Amati bagaimana sel menyusun dan menguraikan senyawa. Bandingkan bahan, energi, tempat, oksigen, serta hasilnya."
        gambarSampul={ikon}
        bab={BAB}
        otomatis={otomatis}
        jalankan={async (p) => {
          const bersih = () => {
            useAdeganE0.setState({ soal: -1, terjawab: false, baris: -1 })
            usePilah.setState({ soal: null })
          }
          p.signal.addEventListener('abort', bersih, { once: true })
          await jalankanEpisode0(p)
          if (!p.signal.aborted) navigate('/episode/0/hasil')
        }}
      >
        <PapanReaksi />
        <PilahAdegan />
      </PemutarEpisode>
    </div>
  )
}
