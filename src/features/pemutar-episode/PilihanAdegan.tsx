import { useEffect, useRef, useState } from 'react'
import { usePemutar, type SoalPilihan } from '../../stores/pemutar'

function SeretMolekul({ pilihan, dijeda }: { pilihan: SoalPilihan; dijeda: boolean }) {
  const sumber = pilihan.seret!
  const [posisi, setPosisi] = useState<[number, number] | null>(null)
  return (
    <button
      type="button"
      className="pemutar-sasaran"
      aria-label={sumber.teks}
      disabled={dijeda}
      style={{
        left: `${(posisi ?? sumber.posisi)[0] / 16}%`,
        top: `${(posisi ?? sumber.posisi)[1] / 9}%`,
        width: `${sumber.ukuran[0] / 16}%`,
        height: `${sumber.ukuran[1] / 9}%`,
        touchAction: 'none',
        cursor: posisi ? 'grabbing' : 'grab',
        zIndex: 1,
      }}
      onPointerDown={(e) => {
        if (dijeda || !e.isPrimary || e.button !== 0) return
        e.currentTarget.setPointerCapture(e.pointerId)
        setPosisi(sumber.posisi)
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        const r = e.currentTarget.parentElement!.getBoundingClientRect()
        setPosisi([((e.clientX - r.left) / r.width) * 1600, ((e.clientY - r.top) / r.height) * 900])
      }}
      onPointerUp={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        e.currentTarget.releasePointerCapture(e.pointerId)
        setPosisi(null)
        if (dijeda) return
        const r = e.currentTarget.parentElement!.getBoundingClientRect()
        const x = ((e.clientX - r.left) / r.width) * 1600
        const y = ((e.clientY - r.top) / r.height) * 900
        const i = pilihan.opsi.findIndex(
          (o) =>
            o.posisi &&
            !o.selesai &&
            Math.abs(o.posisi[0] - x) <= (o.ukuran?.[0] ?? 150) / 2 &&
            Math.abs(o.posisi[1] - y) <= (o.ukuran?.[1] ?? 125) / 2,
        )
        if (i >= 0) void pilihan.pilih(i)
      }}
      onLostPointerCapture={() => setPosisi(null)}
      onPointerCancel={() => setPosisi(null)}
    >
      {posisi && (
        <img
          src={sumber.gambar}
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )}
    </button>
  )
}

function PilihanAdegan() {
  const { pilihan, dijeda } = usePemutar()
  const [terpilih, setTerpilih] = useState<{ opsi: SoalPilihan['opsi']; indeks: number } | null>(
    null,
  )
  const pertama = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    pertama.current?.focus()
  }, [pilihan?.opsi])
  if (!pilihan) return null
  const dipilih = terpilih?.opsi === pilihan.opsi ? terpilih.indeks : null
  const molekul = !!pilihan.opsi[0].posisi
  const pertamaTersisa = pilihan.opsi.findIndex((o) => !o.selesai)
  return (
    <section
      className={molekul ? 'pemutar-pilih-molekul' : 'pemutar-soal'}
      aria-label={pilihan.judul}
    >
      {pilihan.seret && <SeretMolekul pilihan={pilihan} dijeda={dijeda} />}
      {!molekul && <h2>{pilihan.judul}</h2>}
      <div className={pilihan.konfirmasi ? 'pemutar-konfirmasi' : undefined}>
        <div className="pemutar-opsi">
          {pilihan.opsi.map(({ teks, gambar, posisi, ukuran, selesai }, i) =>
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
                disabled={dijeda || pilihan.memeriksa}
                onClick={() => {
                  if (!posisi) setTerpilih({ opsi: pilihan.opsi, indeks: i })
                  if (!pilihan.konfirmasi) void pilihan.pilih(i)
                }}
              >
                {gambar && <img src={gambar} alt="" />}
                {posisi ? <span className="sr-only">{teks}</span> : teks}
              </button>
            ),
          )}
        </div>
        {pilihan.konfirmasi && (
          <button
            type="button"
            className="pemutar-kirim tombol-utama"
            disabled={dijeda || pilihan.memeriksa || dipilih === null}
            onClick={() => {
              if (dipilih !== null) void pilihan.pilih(dipilih)
            }}
          >
            {pilihan.memeriksa ? 'Tunggu…' : 'Jawab'}
          </button>
        )}
      </div>
      {pilihan.konfirmasi && (
        <p className="pemutar-status-pilihan" role="status">
          {pilihan.memeriksa
            ? 'Sedang menjelaskan jawabanmu…'
            : pilihan.pesan ||
              (dipilih === null
                ? 'Pilih satu jawaban, lalu tekan Jawab.'
                : `Pilihanmu: ${pilihan.opsi[dipilih].teks}. Tekan Jawab untuk mengisi kotak.`)}
        </p>
      )}
    </section>
  )
}

export default PilihanAdegan
