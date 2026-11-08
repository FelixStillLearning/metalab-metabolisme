import { Fragment, useEffect, useRef } from 'react'
import { usePemutar } from '../../stores/pemutar'

// Lengkapi kalimat: kalimat utuh dengan rumpang, rumpang aktif disorot, pilihannya di bawah
function LengkapiAdegan() {
  const { lengkapi, dijeda } = usePemutar()
  const pertama = useRef<HTMLButtonElement>(null)
  const aktif = lengkapi?.terisi.length
  useEffect(() => {
    pertama.current?.focus()
  }, [aktif])
  if (!lengkapi) return null
  const { judul, potongan, terisi, opsi, pilih } = lengkapi
  return (
    <section className="pemutar-soal pemutar-lengkapi" aria-label={judul}>
      <h2>{judul}</h2>
      <p className="pemutar-kalimat">
        {potongan.map((t, i) => (
          <Fragment key={i}>
            {t}
            {i < potongan.length - 1 &&
              (i < terisi.length ? (
                <b data-rumpang="terisi">{terisi[i]}</b>
              ) : (
                <span data-rumpang={i === aktif ? 'aktif' : 'kosong'}>
                  <span className="sr-only">
                    {i === aktif ? `rumpang ${i + 1}, pilih di bawah` : 'rumpang kosong'}
                  </span>
                </span>
              ))}
          </Fragment>
        ))}
      </p>
      <div className="pemutar-opsi">
        {opsi.map((teks, i) => (
          <button
            key={teks}
            ref={i === 0 ? pertama : undefined}
            type="button"
            className="pemutar-pilihan"
            disabled={dijeda}
            onClick={() => pilih(i)}
          >
            {teks}
          </button>
        ))}
      </div>
    </section>
  )
}

export default LengkapiAdegan
