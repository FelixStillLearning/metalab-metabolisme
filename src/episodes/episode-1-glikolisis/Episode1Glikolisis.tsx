import { useLocation, useNavigate } from 'react-router'
import sel from '../../assets/images/sel-hewan.webp'
import PemutarEpisode from '../../features/pemutar-episode/PemutarEpisode'
import { BAB } from './bab'
import { pembuka } from './pembuka'
import { soalAB } from './soalAB'
import { soalC } from './soalC'
import { soalD } from './soalD'
import { soalE } from './soalE'
import { soalG } from './soalG'
import { soalH } from './soalH'
import { useJawaban } from '../../stores/jawaban'
import { usePemutar } from '../../stores/pemutar'
import type { Panggung } from '../../features/pemutar-episode/mesin'

async function episode(p: Panggung) {
  useJawaban.getState().mulai()
  await pembuka(p)
  const { glu, penanda } = await soalAB(p)
  const pgal = await soalC(p, glu, penanda)
  const piruvat = await soalD(p, pgal)
  await soalE(p, piruvat)
  await soalG(p, piruvat)
  await soalH(p, piruvat)
  // Semua bab selesai; draf putaran ini menjadi hasil tersimpan (putar ulang otomatis tidak menulis)
  usePemutar.setState({ bab: BAB.length, kalimat: '' })
  useJawaban.getState().selesaikan()
}

function Episode1Glikolisis() {
  const navigate = useNavigate()
  const otomatis = (useLocation().state as { otomatis?: boolean } | null)?.otomatis === true
  return (
    <PemutarEpisode
      judul="Glikolisis"
      label="Episode 1"
      ringkasan="Ikuti perjalanan glukosa di dalam sel. Amati prosesnya dan jawab pertanyaan untuk mengetahui bagaimana energi terbentuk."
      bab={[...BAB]}
      gambarSampul={sel}
      otomatis={otomatis}
      jalankan={async (p) => {
        await episode(p)
        if (!p.signal.aborted) navigate('/episode/1/hasil')
      }}
    />
  )
}

export default Episode1Glikolisis
