import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { usePemutar } from '../../stores/pemutar'
import { useAdeganE0 } from './adegan'
import { usePilah } from './pilah'
import { TABEL } from './isi'

export default function PilahAdegan() {
  const soal = usePilah((s) => s.soal)
  const dijeda = usePemutar((s) => s.dijeda)
  const { soal: tahap, baris } = useAdeganE0()
  const [aktif, setAktif] = useState(0)
  const kartu = useRef<HTMLDivElement>(null)
  const awal = useRef<{ id: number; x: number; y: number; index: number } | null>(null)
  const zona = useRef<Array<HTMLElement | null>>([])
  const tombol = useRef<HTMLButtonElement>(null)
  const sisa = soal?.kartu.map((_, i) => i).filter((i) => !soal.terpasang.includes(i)) ?? []
  const index = sisa.includes(aktif) ? aktif : (sisa[0] ?? 0)
  useEffect(() => {
    awal.current = null
    kartu.current?.style.removeProperty('transform')
    if (kartu.current) delete kartu.current.dataset.seret
    tombol.current?.focus()
  }, [soal?.baris.k])
  useEffect(() => {
    if (dijeda) {
      awal.current = null
      kartu.current?.style.removeProperty('transform')
      if (kartu.current) delete kartu.current.dataset.seret
    }
  }, [dijeda])
  useEffect(() => {
    tombol.current?.focus()
  }, [index])
  if (tahap !== 6) return null
  const terisi = (sisi: 0 | 1) =>
    soal?.terpasang.some((i) => soal.kartu[i] === soal.baris.sel[sisi])
  const taruh = (sisi: 0 | 1) => {
    if (!soal) return
    soal.pilih(index, sisi)
    tombol.current?.focus()
  }
  const batal = () => {
    awal.current = null
    kartu.current?.style.removeProperty('transform')
    if (kartu.current) delete kartu.current.dataset.seret
  }
  const turun = (e: PointerEvent<HTMLElement>) => {
    if (dijeda || (e.target as HTMLElement).closest('button') || !soal || e.button !== 0) return
    awal.current = { id: e.pointerId, x: e.clientX, y: e.clientY, index }
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const lepas = (e: PointerEvent<HTMLElement>) => {
    const drag = awal.current
    batal()
    if (!drag || !soal || drag.id !== e.pointerId || dijeda) return
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 8) return
    for (const sisi of [0, 1] as const) {
      const r = zona.current[sisi]?.getBoundingClientRect()
      if (
        r &&
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        soal.pilih(drag.index, sisi)
        break
      }
    }
  }
  return (
    <section className="e0-pilah" aria-label="Aktivitas 1.6 · Pilah ciri metabolisme">
      <header className="e0-pilah-kepala">
        <h2>
          Anabolisme <span>dan</span> Katabolisme
        </h2>
        <p>
          1.6 · {TABEL[baris]?.judul ?? 'Perbandingan'} · {Math.max(1, baris + 1)} dari 5 variabel
        </p>
      </header>
      <div
        className="e0-zona e0-zona-kiri"
        ref={(n) => {
          zona.current[0] = n
        }}
        data-sisi="0"
      >
        <h3>Anabolisme</h3>
        <p>Menyusun</p>
        <small>Skema rangka karbon · 6 C</small>
        <div className="e0-sel" data-terisi={terisi(0) || undefined}>
          {terisi(0) ? soal?.baris.sel[0] : 'Tempatkan ciri anabolisme'}
        </div>
      </div>
      <div
        className="e0-zona e0-zona-kanan"
        ref={(n) => {
          zona.current[1] = n
        }}
        data-sisi="1"
      >
        <h3>Katabolisme</h3>
        <p>Menguraikan</p>
        <small>Skema rangka karbon · 6 C</small>
        <div className="e0-sel" data-terisi={terisi(1) || undefined}>
          {terisi(1) ? soal?.baris.sel[1] : 'Tempatkan ciri katabolisme'}
        </div>
      </div>
      {soal && (
        <div className="e0-dek">
          <div className="e0-pilih-kartu" aria-label="Pilih kartu untuk dipilah">
            {sisa.map((i) => (
              <button
                ref={i === index ? tombol : undefined}
                type="button"
                key={i}
                aria-label={`Pilih kartu: ${soal.kartu[i]}`}
                aria-pressed={index === i}
                disabled={dijeda}
                onClick={() => setAktif(i)}
              >
                Kartu {i + 1}
              </button>
            ))}
          </div>
          <div
            className="e0-kartu-ciri"
            ref={kartu}
            onPointerDown={turun}
            onPointerMove={(e) => {
              const a = awal.current
              if (a?.id === e.pointerId && !dijeda) {
                e.currentTarget.style.transform = `translate(${e.clientX - a.x}px, ${e.clientY - a.y}px)`
                e.currentTarget.dataset.seret = 'true'
              }
            }}
            onPointerUp={lepas}
            onPointerCancel={batal}
            onLostPointerCapture={batal}
          >
            <button
              type="button"
              disabled={dijeda}
              aria-label={`Taruh di Anabolisme: ${soal.kartu[index]}`}
              onClick={() => taruh(0)}
            >
              ◀
            </button>
            <p>{soal.kartu[index]}</p>
            <button
              type="button"
              disabled={dijeda}
              aria-label={`Taruh di Katabolisme: ${soal.kartu[index]}`}
              onClick={() => taruh(1)}
            >
              ▶
            </button>
          </div>
          <p className="e0-umpan-balik" role="status">
            {soal.pesan || 'Seret ke salah satu sisi, atau ketuk ◀ / ▶.'}
          </p>
        </div>
      )}
    </section>
  )
}
