import { useLocation, useNavigate } from 'react-router'
import mitokondria from '../../assets/images/mitokondria-zoom.webp'
import PemutarEpisode from '../../features/pemutar-episode/PemutarEpisode'
import { episode } from './adegan'
import { BAB } from './isi'
import PilihKompleks from './PilihKompleks'
import './episode-4.css'

export default function Episode4TransporElektron() {
  const navigate = useNavigate()
  const otomatis = (useLocation().state as { otomatis?: boolean } | null)?.otomatis === true
  return (
    <div className="episode-4">
      <PemutarEpisode
        judul="Transpor elektron"
        label="Episode 4 · Aktivitas 1.10–1.11"
        ringkasan="Ikuti aliran elektron, pemompaan H⁺, pembentukan air, dan ATP sintase. Bandingkan keempat tahap respirasi aerob menurut perhitungan buku."
        gambarSampul={mitokondria}
        bab={[...BAB]}
        otomatis={otomatis}
        jalankan={async (p) => {
          const selesai = await episode(p)
          if (selesai && !p.signal.aborted) navigate('/episode/4/hasil')
        }}
      >
        <PilihKompleks />
      </PemutarEpisode>
    </div>
  )
}
