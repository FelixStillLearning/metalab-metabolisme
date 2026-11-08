import { useEffect, useRef } from 'react'
import tangan from '../../assets/images/interaksi-tangan.webp'
import { usePemutar } from '../../stores/pemutar'

function PilihanAdegan() {
  const { pilihan, dijeda } = usePemutar()
  const pertama = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    pertama.current?.focus()
  }, [pilihan])
  if (!pilihan) return null
  const molekul = !!pilihan.opsi[0].posisi
  return (
    <section
      className={molekul ? 'pemutar-pilih-molekul' : 'pemutar-soal'}
      aria-label={pilihan.judul}
    >
      {molekul ? (
        <p className="pemutar-petunjuk">
          <img src={tangan} alt="" />
          {pilihan.judul}
        </p>
      ) : (
        <h2>{pilihan.judul}</h2>
      )}
      <div className="pemutar-opsi">
        {pilihan.opsi.map(({ teks, posisi }, i) => (
          <button
            key={teks}
            ref={i === 0 ? pertama : undefined}
            type="button"
            className={posisi ? 'pemutar-sasaran' : 'pemutar-pilihan'}
            style={posisi ? { left: `${posisi[0] / 16}%`, top: `${posisi[1] / 9}%` } : undefined}
            aria-label={teks}
            disabled={dijeda}
            onClick={() => pilihan.pilih(i)}
          >
            {posisi ? <span className="sr-only">{teks}</span> : teks}
          </button>
        ))}
      </div>
    </section>
  )
}

export default PilihanAdegan
