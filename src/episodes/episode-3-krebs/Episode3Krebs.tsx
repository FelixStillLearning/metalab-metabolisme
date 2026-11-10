import { useLocation, useNavigate } from 'react-router'
import mitokondria from '../../assets/images/mitokondria-zoom.webp'
import PemutarEpisode from '../../features/pemutar-episode/PemutarEpisode'
import { episode } from './adegan'
import { BAB } from './isi'
import './episode-3.css'

export default function Episode3Krebs() {
  const navigate = useNavigate()
  const otomatis = (useLocation().state as { otomatis?: boolean } | null)?.otomatis === true
  return (
    <div className="episode-3">
      <PemutarEpisode
        judul="Siklus Krebs"
        label="Episode 3"
        ringkasan="Putar roda delapan tahap di matriks mitokondria. Hitung karbon, tempatkan zat pada tahapnya, dan bandingkan hasil per putaran dengan hasil per glukosa."
        gambarSampul={mitokondria}
        bab={[...BAB]}
        otomatis={otomatis}
        jalankan={async (p) => {
          const selesai = await episode(p)
          if (selesai && !p.signal.aborted) navigate('/episode/3/hasil')
        }}
      />
    </div>
  )
}
