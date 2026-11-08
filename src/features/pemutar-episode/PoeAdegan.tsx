import { useEffect, useRef, type CSSProperties } from 'react'
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

export function PoeAdegan() {
  const { poe, dijeda } = usePemutar()
  const pertama = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    pertama.current?.focus()
  }, [poe?.tahap])

  if (!poe) return null

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

      {poe.tahap === 'amati' &&
        (poe.statusTebakan ? (
          <div className={`gtag ${poe.statusTebakan === 'benar' ? 'ok' : 'no'}`}>
            <img
              src={poe.statusTebakan === 'benar' ? penandaBenar : penandaBelum}
              alt={poe.statusTebakan === 'benar' ? 'Tebakanmu tepat:' : 'Tebakanmu belum tepat:'}
              width={200}
              height={50}
            />
            <span>
              {poe.tebakan}
              {poe.catatan && ` · ${poe.catatan}`}
            </span>
          </div>
        ) : (
          <div className="gtag">
            <span>{poe.gtagText}</span>
          </div>
        ))}

      {poe.tahap === 'tebak' && (
        <>
          <div
            className="poe-zone"
            data-nampan={poe.zone.nampan || undefined}
            style={{
              left: `${poe.zone.x / 16}%`,
              top: `${poe.zone.y / 9}%`,
              width: `${poe.zone.w / 16}%`,
              height: `${poe.zone.h / 9}%`,
            }}
            data-name={poe.zone.name}
          >
            {poe.zone.cap ? (
              <span className="poe-zone-cap">{poe.zone.cap}</span>
            ) : (
              <span className="poe-zone-label">{poe.zone.name}</span>
            )}
          </div>

          <div className="poe-tokens">
            {poe.supply.map((xy, i) => {
              const placedIdx = poe.placed.indexOf(i)
              const isPlaced = placedIdx >= 0
              const [x, y] = isPlaced ? poe.slot(placedIdx, poe.placed.length) : xy
              return (
                <button
                  key={i}
                  type="button"
                  className={`tok${isPlaced ? ' placed' : ''}`}
                  style={{ left: `${x / 16}%`, top: `${y / 9}%` }}
                  disabled={dijeda}
                  aria-label={`ATP ${i + 1}${isPlaced ? ` di ${poe.zone.name}` : ''}`}
                  onClick={() => poe.taruhToken(i)}
                >
                  <img src={gambarAtp} alt="" width={128} height={52} />
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
              Seret ATP ke {poe.zone.name}, atau ketuk ATP-nya. Sekarang:{' '}
              <b id="cnt">{poe.placed.length} ATP</b>
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
            <div className="poe-feedback" aria-live="polite">
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
