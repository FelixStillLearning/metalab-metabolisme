import { Maximize, X } from 'lucide-react'
import { useEffect, type RefObject } from 'react'
import { tenangAktif, usePengaturan, type KunciSaklar } from '../../stores/pengaturan'
import type { Bab, StatusBab } from './PemutarEpisode'

// [kunci, label, tombol pintas]
const SAKLAR: [KunciSaklar, string, string?][] = [
  ['subtitle', 'Subtitle', 'c'],
  ['narasi', 'Narasi suara', 'n'],
  ['efek', 'Efek suara'],
  ['musik', 'Musik latar', 'm'],
  ['pelan', 'Putar pelan', 'p'],
  ['tenang', 'Mode tenang (animasi dikurangi)'],
]

const nilai = (kunci: KunciSaklar) =>
  kunci === 'tenang' ? tenangAktif() : usePengaturan.getState()[kunci]
const balik = (kunci: KunciSaklar) => usePengaturan.getState().atur(kunci, !nilai(kunci))

type Props = {
  buka: boolean
  tutup: () => void
  layarPenuh: () => void
  bab: Bab[]
  status: StatusBab[]
  saklarPertama: RefObject<HTMLInputElement | null>
}

// Panel dari kanan; video berhenti selama terbuka (diatur PemutarEpisode)
function PanelPengaturan({ buka, tutup, layarPenuh, bab, status, saklarPertama }: Props) {
  // Berlangganan seluruh store agar saklar ikut berubah saat ditekan lewat keyboard
  usePengaturan()

  // Pintasan C, N, M, P membalik saklar, juga saat panel tertutup
  useEffect(() => {
    const tekan = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || (e.target as Element).closest('textarea')) return
      const saklar = SAKLAR.find(([, , pintas]) => pintas === e.key.toLowerCase())
      if (saklar) balik(saklar[0])
    }
    addEventListener('keydown', tekan)
    return () => removeEventListener('keydown', tekan)
  }, [])

  return (
    <aside
      id="panel-pengaturan"
      className="pemutar-panel"
      role="dialog"
      aria-modal="true"
      aria-labelledby="judul-pengaturan"
      hidden={!buka}
    >
      <div className="flex items-center justify-between">
        <h2 id="judul-pengaturan">Pengaturan</h2>
        <button type="button" className="pemutar-ib" aria-label="Tutup pengaturan" onClick={tutup}>
          <X aria-hidden="true" />
        </button>
      </div>
      <p className="pemutar-catatan">Video berhenti selama panel ini terbuka.</p>
      <div className="pemutar-saklar-daftar">
        {SAKLAR.map(([kunci, label, pintas], i) => (
          <label key={kunci} className="pemutar-saklar">
            <span>
              {label}
              {pintas && <kbd aria-hidden="true">{pintas.toUpperCase()}</kbd>}
            </span>
            <input
              ref={i === 0 ? saklarPertama : undefined}
              type="checkbox"
              role="switch"
              checked={nilai(kunci)}
              onChange={() => balik(kunci)}
            />
          </label>
        ))}
      </div>
      <button type="button" className="pemutar-tombol-panel" onClick={layarPenuh}>
        <Maximize aria-hidden="true" className="size-[18px]" />
        Layar penuh <kbd aria-hidden="true">F</kbd>
      </button>
      <section className="pemutar-bab-panel">
        <h3>Soal di episode ini</h3>
        <ol className="pemutar-daftar-bab">
          {bab.map((b, j) => (
            <li key={b.k} data-s={status[j]}>
              <b>{b.k}</b>
              <span>
                {b.t}
                {b.poe && <em>POE</em>}
              </span>
              <small>{status[j]}</small>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  )
}

export default PanelPengaturan
