import { useRef, useState, type PointerEvent } from 'react'
import fad from '../../assets/images/pembawa-fadh2.webp'
import { usePemutar } from '../../stores/pemutar'
import { POE } from './isi'
import { posisiKompleks } from './membran'

// Hanya tampilan sasaran E4; alasan, penguncian, pause, abort dan rekaman tetap POE bersama.
export default function PilihKompleks() {
  const { poe, dijeda } = usePemutar()
  const wadah = useRef<HTMLDivElement>(null)
  const mulai = useRef<[number, number] | null>(null)
  const [seret, setSeret] = useState<[number, number] | null>(null)
  if (poe?.tahap !== 'tebak' || poe.judul !== POE.c.judul) return null
  const tujuan = (['I', 'II', 'III'] as const).map(posisiKompleks)
  const terpilih = poe.placed[0]
  const keAdegan = (e: PointerEvent) => {
    const r = wadah.current!.getBoundingClientRect()
    return [((e.clientX - r.left) * 1600) / r.width, ((e.clientY - r.top) * 900) / r.height] as [
      number,
      number,
    ]
  }
  const xy = seret ?? (terpilih === undefined ? [125, 430] : tujuan[terpilih])
  return (
    <div className="e4-tujuan" ref={wadah}>
      {tujuan.map(([x, y], i) => (
        <button
          type="button"
          key={x}
          className="pemutar-sasaran"
          aria-label={`Pilih ${POE.c.zat[i]}`}
          aria-pressed={terpilih === i}
          disabled={dijeda}
          style={{ left: `${x / 16}%`, top: `${y / 9}%`, width: '10%', height: '25%' }}
          onClick={() => poe.taruhToken(i)}
        >
          <span className="sr-only">{POE.c.zat[i]}</span>
        </button>
      ))}
      <button
        type="button"
        className="e4-token-fad"
        aria-label="Seret FADH₂ ke kompleks"
        disabled={dijeda}
        style={{ left: `${xy[0] / 16}%`, top: `${xy[1] / 9}%` }}
        onPointerDown={(e) => {
          if (dijeda) return
          e.currentTarget.setPointerCapture(e.pointerId)
          mulai.current = keAdegan(e)
        }}
        onPointerMove={(e) => {
          if (mulai.current && !dijeda) setSeret(keAdegan(e))
        }}
        onPointerCancel={() => {
          mulai.current = null
          setSeret(null)
        }}
        onPointerUp={(e) => {
          const dari = mulai.current
          mulai.current = null
          setSeret(null)
          if (!dari || dijeda) return
          const [x, y] = keAdegan(e)
          if (Math.hypot(x - dari[0], y - dari[1]) < 12) return
          const i = tujuan.findIndex(([tx, ty]) => Math.abs(tx - x) < 80 && Math.abs(ty - y) < 120)
          if (i >= 0 && i !== terpilih) poe.taruhToken(i)
        }}
      >
        <img src={fad} alt="" draggable={false} />
      </button>
    </div>
  )
}
