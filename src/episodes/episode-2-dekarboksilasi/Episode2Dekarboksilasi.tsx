import { useLocation, useNavigate } from 'react-router'
import mitokondria from '../../assets/images/mitokondria-zoom.webp'
import PemutarEpisode from '../../features/pemutar-episode/PemutarEpisode'
import { episode } from './adegan'
import { BAB } from './isi'
import './episode-2.css'

export default function Episode2Dekarboksilasi() {
  const navigate = useNavigate()
  const otomatis = (useLocation().state as { otomatis?: boolean } | null)?.otomatis === true
  return (
    <div className="episode-2">
      <PemutarEpisode
        judul="Dekarboksilasi oksidatif"
        label="Episode 2"
        ringkasan="Ikuti dua asam piruvat di matriks mitokondria. Amati karbon yang keluar, elektron yang ditangkap, dan pembentukan asetil KoA."
        gambarSampul={mitokondria}
        bab={[...BAB]}
        otomatis={otomatis}
        jalankan={async (p) => {
          const selesai = await episode(p)
          if (selesai && !p.signal.aborted) navigate('/episode/2/hasil')
        }}
      />
    </div>
  )
}
