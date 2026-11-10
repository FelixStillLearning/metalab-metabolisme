import { Collapsible } from '@base-ui/react/collapsible'
import { ArrowLeft, ArrowRight, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import aerob from '../../assets/images/bagian-aerob.webp'
import anaerob from '../../assets/images/bagian-anaerob.webp'
import fotosintesis from '../../assets/images/bagian-fotosintesis.webp'
import episode0 from '../../assets/images/episode-0.webp'
import episode1 from '../../assets/images/episode-1.webp'
import episode2 from '../../assets/images/episode-2.webp'
import episode3 from '../../assets/images/episode-3.webp'
import episode4 from '../../assets/images/episode-4.webp'
import latarHp from '../../assets/images/latar-peta-hp.webp'
import latar from '../../assets/images/latar-peta.webp'
import maskot from '../../assets/images/maskot-mitokondria-ramah.webp'
import TombolSuara from '../../components/TombolSuara'
import PengaturVolume from '../../components/PengaturVolume'
import { bunyi, putar, siapkan } from '../../lib/suara'
import './peta-materi.css'

const EPISODE = [
  { judul: 'Glikolisis', tempat: 'Sitosol', ikon: episode1 },
  { judul: 'Dekarboksilasi oksidatif', tempat: 'Matriks', ikon: episode2 },
  { judul: 'Siklus Krebs', tempat: 'Matriks', ikon: episode3 },
  { judul: 'Transpor elektron', tempat: 'Membran krista', ikon: episode4 },
]

const LANJUTAN = [
  { judul: 'Respirasi Anaerob', ikon: anaerob },
  { judul: 'Fotosintesis', ikon: fotosintesis },
]

const gambarLatar = {
  '--latar-peta': `url("${latar}")`,
  '--latar-peta-hp': `url("${latarHp}")`,
} as CSSProperties

// --i: urutan tempel, untuk jeda bertingkat
const urutan = (i: number) => ({ '--i': i }) as CSSProperties

function PetaMateri() {
  const [terbuka, setTerbuka] = useState(false)
  const tombolAerob = useRef<HTMLButtonElement>(null)
  const laci = useRef<HTMLDivElement>(null)

  const ubah = (buka: boolean) => {
    setTerbuka(buka)
    putar(buka ? 'buka-peta' : 'tutup-peta')
  }

  useEffect(() => siapkan('buka-peta', 'tutup-peta', 'kembali', 'melesat'), [])

  // Kembali ke awal setelah akordeon selesai agar kartu Pengantar tetap terlihat di kiri.
  useEffect(() => {
    const jalur = laci.current?.closest<HTMLElement>('.peta-jalur')
    if (!terbuka || !jalur) return
    const halus = !matchMedia('(prefers-reduced-motion: reduce)').matches
    const tunda = setTimeout(
      () => {
        jalur.scrollLeft = 0
      },
      halus ? 500 : 0,
    )
    return () => clearTimeout(tunda)
  }, [terbuka])

  return (
    <main
      className="peta-materi flex min-h-dvh flex-col gap-4 bg-screen py-4 text-ink sm:gap-6 sm:py-6"
      style={gambarLatar}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-8">
        <h1 className="peta-judul font-head text-[28px] font-extrabold text-paper sm:text-5xl">
          Peta materi
        </h1>
        <div className="flex items-center gap-3">
          <TombolSuara />
          <PengaturVolume />
          <Link
            to="/"
            onClick={() => putar('kembali')}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-paper px-3 py-3 font-head text-sm font-extrabold shadow-kertas-sm transition-transform duration-(--durasi-ui) ease-pose hover:-translate-y-0.5 sm:text-base"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
            Beranda
          </Link>
        </div>
      </header>

      <section aria-label="Jalur materi" className="peta-jalur">
        <section
          className="peta-kertas peta-kartu peta-samping"
          style={urutan(0)}
          aria-labelledby="judul-pengantar"
        >
          <span className="peta-nomor" aria-hidden="true">
            1
          </span>
          <img src={episode0} alt="" width={240} height={240} className="peta-ikon" />
          <h2 id="judul-pengantar" className="peta-nama">
            Pengantar
          </h2>
          <p className="text-muted">Episode 0</p>
          <Link
            to="/episode/0"
            className="peta-buka tombol-utama mt-auto inline-flex min-h-11 min-w-11 items-center justify-center gap-2 px-3 py-2 font-head font-extrabold"
            aria-label="Buka Pengantar"
            onClick={() => bunyi('melesat')}
          >
            <span className="peta-buka-teks">Buka</span>
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </section>

        <Collapsible.Root open={terbuka} onOpenChange={ubah} className="peta-aerob">
          <h2 className="flex">
            <Collapsible.Trigger
              ref={tombolAerob}
              aria-label="Respirasi Aerob"
              className="peta-kertas peta-kartu peta-pemicu group cursor-pointer text-left"
              style={urutan(1)}
            >
              <span className="peta-nomor" aria-hidden="true">
                2
              </span>
              <img src={aerob} alt="" width={240} height={240} className="peta-ikon" />
              <span className="peta-nama">Respirasi Aerob</span>
              <span className="font-body text-muted">Episode 1–4</span>
              <span className="mt-auto flex min-h-11 items-center gap-2 font-body font-bold text-screen-3">
                <span className="group-data-panel-open:hidden">Lihat episode</span>
                <span className="hidden group-data-panel-open:inline">Tutup daftar episode</span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-5 shrink-0 group-data-panel-open:rotate-180 motion-safe:transition-transform motion-safe:duration-(--durasi-ui)"
                />
              </span>
            </Collapsible.Trigger>
          </h2>

          <Collapsible.Panel ref={laci} keepMounted className="peta-kertas peta-laci">
            <div className="peta-laci-isi">
              {/* Tombol tutup di kiri: di HP laci lebih lebar dari layar, tepi kanannya tidak terlihat */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    ubah(false)
                    tombolAerob.current?.focus()
                  }}
                  className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg bg-paper px-3 font-head font-extrabold shadow-kertas-sm"
                >
                  Tutup episode <X aria-hidden="true" className="size-5" />
                </button>
                <p className="font-head text-xl font-extrabold text-balance">
                  Respirasi Aerob: dari glukosa sampai ATP
                </p>
              </div>
              <ol aria-label="Episode respirasi aerob" className="peta-episode">
                {EPISODE.map(({ judul, tempat, ikon }, i) => (
                  <li key={judul} className="peta-kertas peta-kartu" style={urutan(i)}>
                    <span className="peta-nomor" aria-hidden="true">
                      {i + 1}
                    </span>
                    <img src={ikon} alt="" width={240} height={240} className="peta-ikon" />
                    <h3 className="peta-nama">{judul}</h3>
                    <p className="text-muted">{tempat}</p>
                    <Link
                      to={`/episode/${i + 1}`}
                      aria-label={`Buka ${judul}`}
                      onClick={() => bunyi('melesat')}
                      className="tombol-utama mt-auto inline-flex min-h-12 items-center gap-2 px-5 pt-2 pb-3 font-head font-extrabold transition-transform duration-(--durasi-ui) ease-pose hover:-translate-y-0.5 active:translate-y-0.5"
                    >
                      Buka <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="font-bold text-pretty">
                Glukosa → 2 asam piruvat → 2 asetil KoA → NADH, FADH<sub>2</sub>, CO<sub>2</sub> →
                34 ATP + H<sub>2</sub>O
              </p>
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>

        {LANJUTAN.map(({ judul, ikon }, i) => (
          <section
            key={judul}
            className="peta-kertas peta-kartu peta-samping peta-belum"
            style={urutan(i + 2)}
          >
            <span className="peta-nomor" aria-hidden="true">
              {i + 3}
            </span>
            <img src={ikon} alt="" width={240} height={240} className="peta-ikon" />
            <h2 className="peta-nama">{judul}</h2>
            <p className="font-bold text-muted">Belum tersedia</p>
          </section>
        ))}
      </section>

      {/* Kalimat DRAF; nanti mengikuti progres siswa bersama konsep kunci */}
      <figure className="peta-maskot">
        <p>{terbuka ? 'Mulai dari Glikolisis, ya!' : 'Ketuk Respirasi Aerob, yuk!'}</p>
        <img src={maskot} alt="" width={328} height={327} />
      </figure>
    </main>
  )
}

export default PetaMateri
