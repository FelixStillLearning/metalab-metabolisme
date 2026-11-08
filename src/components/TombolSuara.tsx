import { Volume2, VolumeX } from 'lucide-react'
import { usePengaturan } from '../stores/pengaturan'

type Props = { saatDinyalakan?: () => void; className?: string }

function TombolSuara({ saatDinyalakan, className = '' }: Props) {
  const aktif = usePengaturan((s) => s.suaraAktif)
  const aturSuara = usePengaturan((s) => s.aturSuara)
  const Ikon = aktif ? Volume2 : VolumeX
  return (
    <button
      type="button"
      aria-label={aktif ? 'Matikan suara' : 'Nyalakan suara'}
      onClick={() => {
        aturSuara(!aktif)
        if (!aktif) saatDinyalakan?.()
      }}
      className={`grid size-12 place-items-center rounded-full bg-paper text-ink shadow-kertas-sm transition-transform duration-(--durasi-ui) ease-pose hover:-translate-y-0.5 active:translate-y-0.5 ${className}`}
    >
      <Ikon aria-hidden="true" className="size-6" />
    </button>
  )
}

export default TombolSuara
