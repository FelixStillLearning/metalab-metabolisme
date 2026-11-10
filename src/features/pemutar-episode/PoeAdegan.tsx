import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import silang from '../../assets/images/efek-belum-tepat.webp'
import centang from '../../assets/images/efek-benar.webp'
import penandaBenar from '../../assets/images/interaksi-penanda-tebakan-benar.webp'
import penandaBelum from '../../assets/images/interaksi-penanda-tebakan.webp'
import tahapAmati from '../../assets/images/interaksi-tahap-poe-amati.webp'
import tahapJelaskan from '../../assets/images/interaksi-tahap-poe-jelaskan.webp'
import tahapTebak from '../../assets/images/interaksi-tahap-poe-tebak.webp'
import gambarAtp from '../../assets/images/pembawa-atp.webp'
import { usePemutar } from '../../stores/pemutar'

const GAMBAR_TAHAP = { tebak: tahapTebak, amati: tahapAmati, jelaskan: tahapJelaskan }

// Tanda H08/H09 di depan kalimat vonis
const Tanda = ({ tepat }: { tepat: boolean }) => (
  <img className="poe-tanda" src={tepat ? centang : silang} alt="" width={24} height={24} />
)

export function HasilTebakan() {
  const poe = usePemutar((s) => s.poe)
  if (poe?.tahap !== 'amati') return null
  return poe.statusTebakan ? (
    <div className={`gtag ${poe.statusTebakan === 'benar' ? 'ok' : 'no'}`}>
      <img
        src={poe.statusTebakan === 'benar' ? penandaBenar : penandaBelum}
        alt={poe.statusTebakan === 'benar' ? 'Tebakanmu tepat:' : 'Tebakanmu belum tepat:'}
        width={200}
        height={50}
      />
      <span>{poe.tebakan}</span>
      {poe.catatan && <p className="gtag-catatan">{poe.catatan}</p>}
    </div>
  ) : (
    <div className="gtag">
      <span>{poe.gtagText}</span>
    </div>
  )
}

export function PoeAdegan() {
  const { poe, dijeda } = usePemutar()
  const pertama = useRef<HTMLButtonElement>(null)
  const tanggapan = useRef<HTMLDivElement>(null)
  // Seret token seperti dragPredict() prototype; posisi dalam satuan adegan 1600x900
  const wadahToken = useRef<HTMLDivElement>(null)
  const tarik = useRef<{ i: number; x0: number; y0: number; geser: boolean } | null>(null)
  const abaikanKlik = useRef(false)
  const [seret, setSeret] = useState<{ i: number; x: number; y: number; over: boolean } | null>(
    null,
  )
  const alasanTerpilih = poe?.tahap === 'jelaskan' ? poe.selectedExplain : null

  useEffect(() => {
    const isi = tanggapan.current
    const kartu = isi?.closest<HTMLElement>('.poe-card-explain')
    if (isi && kartu) {
      const batasBawah = kartu.getBoundingClientRect().top + kartu.clientTop + kartu.clientHeight
      const terpotong = isi.getBoundingClientRect().bottom - batasBawah
      kartu.scrollTop += Math.max(0, terpotong + 12)
    }
  }, [alasanTerpilih])

  useEffect(() => {
    pertama.current?.focus()
  }, [poe?.tahap])

  if (!poe) return null

  const keAdegan = (e: PointerEvent) => {
    const r = wadahToken.current!.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * 1600, ((e.clientY - r.top) / r.height) * 900]
  }
  const diZona = (x: number, y: number) =>
    poe.tahap === 'tebak' &&
    Math.abs(x - poe.zone.x) < poe.zone.w / 2 &&
    Math.abs(y - poe.zone.y) < poe.zone.h / 2

  const langkah = ['Tebak', 'Amati', 'Jelaskan']
  const langkahAktif =
    poe.tahap === 'tebak' ? 0 : poe.tahap === 'amati' ? 1 : poe.tahap === 'jelaskan' ? 2 : -1

  return (
    <div className="pemutar-poe" aria-label="Aktivitas POE">
      {/* Chip tahap G07: satu gambar per tahap aktif; teksnya untuk pembaca layar */}
      <div className="poe-steps" aria-label="Tahap POE">
        <img src={GAMBAR_TAHAP[poe.tahap]} alt="" width={360} height={60} />
        {langkah.map((l, i) => (
          <span key={l} className={`sr-only${i === langkahAktif ? ' on' : ''}`}>
            {l}
          </span>
        ))}
      </div>

      {poe.tahap === 'tebak' && (
        <>
          <div
            className="poe-zone"
            data-nampan={poe.zone.nampan || undefined}
            data-over={seret?.over || undefined}
            style={{
              left: `${poe.zone.x / 16}%`,
              top: `${poe.zone.y / 9}%`,
              width: `${poe.zone.w / 16}%`,
              height: `${poe.zone.h / 9}%`,
            }}
            data-name={poe.zone.name}
          >
            {poe.zone.cap && <span className="poe-zone-cap">{poe.zone.cap}</span>}
          </div>

          <div className="poe-tokens" ref={wadahToken}>
            {poe.supply.map((xy, i) => {
              const zat = poe.zat?.[i]
              const nama = zat?.teks ?? `ATP ${i + 1}`
              const placedIdx = poe.placed.indexOf(i)
              const isPlaced = placedIdx >= 0
              const diseret = seret?.i === i
              const [x, y] = diseret
                ? [seret.x, seret.y]
                : isPlaced
                  ? poe.slot(placedIdx, poe.placed.length)
                  : xy
              return (
                <button
                  key={i}
                  type="button"
                  className={`tok${isPlaced ? ' placed' : ''}${zat ? ' tok-zat' : ''}`}
                  style={{ left: `${x / 16}%`, top: `${y / 9}%` }}
                  data-seret={diseret || undefined}
                  disabled={dijeda}
                  aria-label={`${nama}${isPlaced ? ` di ${poe.zone.name}` : ''}`}
                  aria-pressed={isPlaced}
                  title={
                    isPlaced
                      ? `Ketuk atau seret keluar untuk mengambil ${nama} kembali`
                      : `Ketuk atau seret ke ${poe.zone.name} untuk menaruh ${nama}`
                  }
                  onPointerDown={(e) => {
                    abaikanKlik.current = false
                    e.currentTarget.setPointerCapture(e.pointerId)
                    tarik.current = { i, x0: e.clientX, y0: e.clientY, geser: false }
                  }}
                  onPointerMove={(e) => {
                    const t = tarik.current
                    if (t?.i !== i) return
                    // Gerak kecil tetap dihitung ketukan
                    if (!t.geser && Math.hypot(e.clientX - t.x0, e.clientY - t.y0) < 6) return
                    t.geser = true
                    const [sx, sy] = keAdegan(e)
                    setSeret({ i, x: sx, y: sy, over: diZona(sx, sy) })
                  }}
                  onPointerUp={(e) => {
                    const t = tarik.current
                    tarik.current = null
                    if (!t?.geser) return
                    // Klik sesudah seret tidak dihitung ketukan
                    abaikanKlik.current = true
                    setSeret(null)
                    if (diZona(...(keAdegan(e) as [number, number])) !== isPlaced) poe.taruhToken(i)
                  }}
                  onPointerCancel={() => {
                    tarik.current = null
                    setSeret(null)
                  }}
                  onClick={() => {
                    if (abaikanKlik.current) abaikanKlik.current = false
                    else poe.taruhToken(i)
                  }}
                >
                  {/* Gambar tidak diseret sendiri oleh browser; yang diseret tokennya */}
                  {zat && !zat.gambar ? (
                    <span>{nama}</span>
                  ) : (
                    <img
                      src={zat?.gambar ?? gambarAtp}
                      alt=""
                      width={128}
                      height={52}
                      draggable={false}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div
            className="card poe-card"
            role="dialog"
            aria-labelledby="poe-tebak-judul"
            style={
              poe.kartu &&
              ({
                '--kartu-x': `${poe.kartu[0]}%`,
                '--kartu-y': `${poe.kartu[1]}%`,
              } as CSSProperties)
            }
          >
            <h3 id="poe-tebak-judul">{poe.judul}</h3>
            <p>
              Sekarang:{' '}
              <b id="cnt">
                {poe.zat
                  ? (poe.zat[poe.placed[0]]?.teks ?? 'belum dipilih')
                  : `${poe.placed.length} ATP`}
              </b>
            </p>
            <p>
              <b>Kenapa?</b>
            </p>
            <div className="poe-reasons">
              {poe.reasons.map((r, i) => (
                <button
                  key={r}
                  ref={i === 0 ? pertama : undefined}
                  type="button"
                  className="chip"
                  aria-pressed={poe.alasan === i}
                  disabled={dijeda}
                  onClick={() => poe.pilihAlasan(i)}
                >
                  {r}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="tombol-utama poe-kunci"
              disabled={poe.placed.length === 0 || poe.alasan === null || dijeda}
              onClick={poe.kunci}
            >
              Kunci tebakan, lanjutkan video
            </button>
          </div>
        </>
      )}

      {poe.tahap === 'jelaskan' && (
        <div
          className="card bottom poe-card-explain"
          role="dialog"
          aria-labelledby="poe-explain-judul"
        >
          <p className="poe-tadi">{poe.tadiText}</p>
          <p className={`poe-verdict ${poe.verdictTepat ? 'ok' : 'no'}`}>
            <Tanda tepat={poe.verdictTepat} />
            {poe.verdictText}
          </p>
          <h3 id="poe-explain-judul">{poe.judul}</h3>
          <div className="poe-reasons">
            {poe.reasons.map((r, i) => (
              <button
                key={r}
                ref={i === 0 ? pertama : undefined}
                type="button"
                className="chip"
                aria-pressed={poe.selectedExplain === i}
                disabled={poe.explainDone || dijeda}
                onClick={() => poe.pilihExplain(i)}
              >
                {r}
              </button>
            ))}
          </div>
          {poe.selectedExplain !== null && (
            <div ref={tanggapan} className="poe-feedback" aria-live="polite">
              {poe.explainDone ? (
                <>
                  <p className="poe-verdict ok">
                    <Tanda tepat />
                    {poe.back[poe.alasanBenar]}
                  </p>
                  <button
                    type="button"
                    className="tombol-utama poe-lanjut"
                    disabled={dijeda}
                    onClick={poe.lanjut}
                  >
                    Lanjutkan video
                  </button>
                </>
              ) : (
                <p className="poe-verdict no">
                  <Tanda tepat={false} />
                  Belum tepat. {poe.back[poe.selectedExplain]} Coba alasan lain.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PoeAdegan
