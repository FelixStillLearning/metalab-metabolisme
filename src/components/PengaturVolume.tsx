import { Popover } from '@base-ui/react/popover'
import { SlidersHorizontal } from 'lucide-react'
import { useId } from 'react'
import { usePengaturan } from '../stores/pengaturan'
import './pengatur-volume.css'

function PengaturVolume({ className = '' }: { className?: string }) {
  const volume = usePengaturan((s) => s.volume)
  const aturVolume = usePengaturan((s) => s.aturVolume)
  const aktif = usePengaturan((s) => s.suaraAktif)
  const id = useId()
  const persen = Math.round(volume * 100)

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label="Atur volume"
        title={`Volume ${persen}%`}
        className={`grid size-12 shrink-0 cursor-pointer place-items-center rounded-full bg-paper text-ink shadow-kertas-sm ${className}`}
      >
        <SlidersHorizontal aria-hidden="true" className="size-6" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner className="volume-posisi" sideOffset={10} collisionPadding={12}>
          <Popover.Popup className="volume-panel">
            <Popover.Title>Volume suara</Popover.Title>
            <label htmlFor={id}>
              Volume utama <output htmlFor={id}>{persen}%</output>
            </label>
            <input
              id={id}
              type="range"
              min={0}
              max={100}
              step={1}
              value={persen}
              aria-valuetext={`${persen}%`}
              onChange={(e) => aturVolume(e.currentTarget.valueAsNumber / 100)}
            />
            <p>{aktif ? 'Efek suara, musik, dan narasi.' : 'Suara sedang dibisukan.'}</p>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default PengaturVolume
