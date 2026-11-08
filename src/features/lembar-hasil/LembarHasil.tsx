import { ArrowLeft, ArrowRight, Printer, RotateCcw, Save } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { ucapkan } from '../../lib/narasi'
import { bolehBersuaraSendiri, bunyi } from '../../lib/suara'
import { useJawaban } from '../../stores/jawaban'
import IdentitasSiswa from '../identitas-siswa/IdentitasSiswa'
import TombolSuara from '../../components/TombolSuara'
import PengaturVolume from '../../components/PengaturVolume'
import { useSiswa } from '../../stores/siswa'
import { tenangAktif } from '../../stores/pengaturan'
import './lembar-hasil.css'

// Tebakan POE sebelum menonton lawan yang terjadi; tidak dinilai
export type PasanganPoe = { k: string; q: string; tebakan: number; nyata: number; alasan: string }

type Props = {
  judul: string
  lead: string
  // Bagan episode; bagian ber-data-step muncul berurutan menurut --i
  bagan: ReactNode
  poe: PasanganPoe[]
  pertanyaan: string
  cetak: {
    judul: string
    jawaban: { k: string; bagian: string; isi: string }[]
    poe: { k: string; tebakan: number; awal: string; akhir: string }[]
  }
  rute: { episode: string; lanjut: string }
  narasi: { id: string; teks: string }
}

// Lembar Hasil seperti sheet() prototype: bagan milik siswa, tebakan POE berpasangan,
// penjelasan bebas, dan lembar cetak untuk guru. Hanya dibaca dari hasil tersimpan.
function LembarHasil({ judul, lead, bagan, poe, pertanyaan, cetak, rute, narasi }: Props) {
  const { nama, kelas } = useSiswa()
  const tersimpan = useJawaban((s) => s.penjelasan)
  const simpanPenjelasan = useJawaban((s) => s.simpanPenjelasan)
  const [isi, setIsi] = useState(tersimpan)
  const [pesan, setPesan] = useState('')
  const navigate = useNavigate()
  const sudahBunyi = useRef(false)

  // Suara selesai dan narasi sekali saat masuk, hanya bila halaman sudah pernah disentuh
  useEffect(() => {
    if (!bolehBersuaraSendiri()) return
    if (!sudahBunyi.current) bunyi('selesai')
    sudahBunyi.current = true
    const kendali = new AbortController()
    void ucapkan(narasi.id, narasi.teks, { signal: kendali.signal })
    return () => kendali.abort()
  }, [narasi.id, narasi.teks])

  const simpan = () => {
    const teks = isi.trim()
    if (!teks) return setPesan('Tulis penjelasanmu dulu.')
    simpanPenjelasan(teks)
    setPesan('Penjelasan tersimpan.')
  }

  return (
    <main className="hasil-halaman">
      <div className="hasil" data-tenang={tenangAktif() || undefined}>
        <header className="hasil-kepala">
          <div className="hasil-atas">
            <p className="hasil-episode">Episode 1 · Glikolisis</p>
            <div className="flex gap-2">
              <TombolSuara />
              <PengaturVolume />
            </div>
          </div>
          <h1>{judul}</h1>
          <p className="hasil-lead">{lead}</p>
          <div className="hasil-identitas">
            <p>{nama && kelas ? `${nama} · ${kelas}` : 'Nama dan kelas belum diisi.'}</p>
            <IdentitasSiswa
              pemicu={
                <button type="button" className="hasil-tombol">
                  Ubah identitas
                </button>
              }
            />
          </div>
        </header>
        <div className="hasil-bagan">{bagan}</div>
        <div className="hasil-sisi">
          <section>
            <h2>Tebakanmu sebelum menonton (tidak dinilai)</h2>
            {poe.map(({ k, q, tebakan, nyata, alasan }) => {
              const sama = tebakan === nyata
              return (
                <div key={k} className="pair" data-poe={k}>
                  <span className="q">
                    Soal {k} · {q}
                  </span>
                  <span className={`n guess${sama ? ' same' : ''}`}>
                    {sama ? tebakan : <s>{tebakan}</s>}
                    <small>tebakanmu</small>
                  </span>
                  {!sama && (
                    <>
                      <span className="arr" aria-hidden="true">
                        →
                      </span>
                      <span className="n real">
                        {nyata}
                        <small>yang terjadi</small>
                      </span>
                    </>
                  )}
                  <span className="why">Alasanmu setelah menonton: {alasan}</span>
                </div>
              )
            })}
          </section>
          <div>
            <h2>
              <label htmlFor="hasil-penjelasan">{pertanyaan}</label>
            </h2>
            <textarea
              id="hasil-penjelasan"
              rows={3}
              value={isi}
              onChange={(e) => setIsi(e.target.value)}
            />
            <p className="hasil-pesan" aria-live="polite">
              {pesan}
            </p>
          </div>
          <div className="hasil-aksi">
            <button type="button" className="tombol-utama" onClick={simpan}>
              <Save aria-hidden="true" />
              Simpan penjelasan
            </button>
            <button
              type="button"
              className="hasil-tombol"
              onClick={() => navigate(rute.episode, { state: { otomatis: true } })}
            >
              <RotateCcw aria-hidden="true" />
              Putar ulang tanpa jeda
            </button>
            <button type="button" className="hasil-tombol" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              Cetak untuk guru
            </button>
            <Link className="hasil-tombol" to={rute.episode}>
              <ArrowLeft aria-hidden="true" />
              Awal episode
            </Link>
            <Link className="tombol-utama" to={rute.lanjut}>
              Lanjut
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <div className="hasil-cetak">
        <h2>{cetak.judul}</h2>
        <dl className="hasil-cetak-identitas">
          <div>
            <dt>Nama:</dt>
            <dd>{nama || '____________________'}</dd>
          </div>
          <div>
            <dt>Kelas:</dt>
            <dd>{kelas || '________'}</dd>
          </div>
        </dl>
        <table>
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '25%' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Soal</th>
              <th>Bagian</th>
              <th>Jawaban</th>
            </tr>
          </thead>
          <tbody>
            {cetak.jawaban.map(({ k, bagian, isi }) => (
              <tr key={k}>
                <td>{k}</td>
                <td>{bagian}</td>
                <td>{isi}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Catatan POE (tidak dinilai)</h3>
        <table>
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '40%' }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>Soal</th>
              <th>Tebakan</th>
              <th>Alasan awal</th>
              <th>Alasan setelah menonton</th>
            </tr>
          </thead>
          <tbody>
            {cetak.poe.map(({ k, tebakan, awal, akhir }) => (
              <tr key={k}>
                <td>{k}</td>
                <td>{tebakan}</td>
                <td>{awal}</td>
                <td>{akhir}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Penjelasan siswa</h3>
        <p className="hasil-cetak-penjelasan">{isi.trim() || '-'}</p>
      </div>
    </main>
  )
}

export default LembarHasil
