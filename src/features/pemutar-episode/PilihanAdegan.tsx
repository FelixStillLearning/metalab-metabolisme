import { useEffect, useRef, useState } from 'react'
import { usePemutar, type SoalPilihan } from '../../stores/pemutar'

function PilihanAdegan() {
  const { pilihan, dijeda } = usePemutar()
  const [terpilih, setTerpilih] = useState<{ opsi: SoalPilihan['opsi']; indeks: number } | null>(
    null,
  )
  const pertama = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    pertama.current?.focus()
  }, [pilihan])
  if (!pilihan) return null
  const molekul = !!pilihan.opsi[0].posisi
  const pertamaTersisa = pilihan.opsi.findIndex((o) => !o.selesai)
  return (
    <section
      className={molekul ? 'pemutar-pilih-molekul' : 'pemutar-soal'}
      aria-label={pilihan.judul}
    >
      {!molekul && <h2>{pilihan.judul}</h2>}
      <div className="pemutar-opsi">
        {pilihan.opsi.map(({ teks, posisi, ukuran, selesai }, i) =>
          selesai ? null : (
            <button
              key={teks}
              ref={i === pertamaTersisa ? pertama : undefined}
              type="button"
              className={posisi ? 'pemutar-sasaran' : 'pemutar-pilihan'}
              style={
                posisi
                  ? {
                      left: `${posisi[0] / 16}%`,
                      top: `${posisi[1] / 9}%`,
                      ...(ukuran && { width: `${ukuran[0] / 16}%`, height: `${ukuran[1] / 9}%` }),
                    }
                  : undefined
              }
              aria-label={teks}
              aria-pressed={
                posisi ? undefined : terpilih?.opsi === pilihan.opsi && terpilih.indeks === i
              }
              disabled={dijeda}
              onClick={() => {
                if (!posisi) setTerpilih({ opsi: pilihan.opsi, indeks: i })
                pilihan.pilih(i)
              }}
            >
              {posisi ? <span className="sr-only">{teks}</span> : teks}
            </button>
          ),
        )}
      </div>
    </section>
  )
}

export default PilihanAdegan
