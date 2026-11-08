import { Collapsible } from '@base-ui/react/collapsible'
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import aerob from '../../assets/images/bagian-aerob.webp'
import pengantar from '../../assets/images/bagian-pengantar.webp'
import latarHp from '../../assets/images/latar-peta-hp.webp'
import latar from '../../assets/images/latar-peta.webp'
import './peta-materi.css'

const EPISODE = [
  { judul: 'Glikolisis', tempat: 'Sitosol', aktivitas: '1.7' },
  { judul: 'Dekarboksilasi oksidatif', tempat: 'Matriks', aktivitas: '1.8' },
  { judul: 'Siklus Krebs', tempat: 'Matriks', aktivitas: '1.9' },
  { judul: 'Transpor elektron', tempat: 'Membran krista', aktivitas: '1.10, 1.11' },
]

const gambarLatar = {
  '--latar-peta': `url("${latar}")`,
  '--latar-peta-hp': `url("${latarHp}")`,
} as CSSProperties

function PetaMateri() {
  return (
    <main
      className="peta-materi min-h-dvh bg-screen px-4 py-8 text-ink sm:px-8"
      style={gambarLatar}
    >
      <div className="mx-auto max-w-[1800px]">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-3 xl:mb-16">
          <h1 className="rounded-sm bg-screen px-3 py-2 text-balance text-[28px] font-extrabold text-paper sm:text-5xl">
            Peta materi
          </h1>
          <Link
            to="/"
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-paper px-3 py-3 font-head text-sm font-extrabold shadow-kertas-sm hover:bg-paper-2 sm:text-base"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
            Beranda
          </Link>
        </header>

        <div className="peta-bagian">
          <section className="peta-kertas peta-pengantar" aria-labelledby="judul-pengantar">
            <span className="font-head text-3xl font-extrabold xl:text-4xl" aria-hidden="true">
              1
            </span>
            <img
              src={pengantar}
              alt=""
              width={240}
              height={240}
              className="hidden size-20 object-contain xl:block"
            />
            <h2 id="judul-pengantar" className="text-balance text-2xl font-extrabold">
              Pengantar
            </h2>
            <p className="text-pretty text-sm text-muted">Episode 0 · Aktivitas 1.5, 1.6</p>
            <p className="text-sm font-bold text-muted">Belum tersedia</p>
          </section>

          <Collapsible.Root defaultOpen className="peta-aerob">
            <h2 className="min-w-0">
              <Collapsible.Trigger
                aria-label="Respirasi Aerob"
                className="peta-kertas group flex h-full w-full cursor-pointer flex-col items-start gap-2 text-left outline-offset-4 focus-visible:ring-3 focus-visible:ring-screen-3 focus-visible:ring-inset data-panel-open:outline-2 data-panel-open:outline-dashed data-panel-open:outline-paper xl:gap-3"
              >
                <span aria-hidden="true" className="text-3xl font-extrabold xl:text-4xl">
                  2
                </span>
                <img
                  src={aerob}
                  alt=""
                  width={240}
                  height={240}
                  className="hidden size-20 object-contain xl:block"
                />
                <span className="text-balance text-2xl font-extrabold">Respirasi Aerob</span>
                <span className="font-body text-pretty text-sm text-muted">
                  Episode 1–4 · Aktivitas 1.7–1.11
                </span>
                <span className="mt-auto flex min-h-11 items-center gap-2 pt-3 font-body text-sm font-bold text-screen-3">
                  <span className="group-data-panel-open:hidden">Lihat episode</span>
                  <span className="hidden group-data-panel-open:inline">Tutup daftar episode</span>
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 group-data-panel-open:rotate-180"
                  />
                </span>
              </Collapsible.Trigger>
            </h2>

            <Collapsible.Panel className="peta-laci min-w-0 rounded-sm bg-paper-2 p-4 shadow-kertas sm:p-6">
              <p className="mb-5 font-head text-balance text-xl font-extrabold">
                Respirasi Aerob: dari glukosa sampai ATP
              </p>
              <ol aria-label="Episode respirasi aerob" className="peta-episode">
                {EPISODE.map(({ judul, tempat, aktivitas }, i) => (
                  <li
                    key={judul}
                    className="peta-kertas flex min-w-0 flex-col items-start gap-2 xl:gap-3"
                  >
                    <span
                      aria-hidden="true"
                      className="font-head text-3xl font-extrabold xl:text-4xl"
                    >
                      {i + 1}
                    </span>
                    <h3 className="text-balance text-xl font-extrabold">{judul}</h3>
                    <p className="text-pretty text-sm text-muted">
                      {tempat} · Aktivitas {aktivitas}
                    </p>
                    {i === 0 ? (
                      <Link
                        to="/episode/1"
                        aria-label="Buka Glikolisis"
                        className="mt-auto inline-flex min-h-12 items-center gap-2 rounded-lg bg-atp px-3 py-2 font-head font-extrabold text-paper shadow-kertas-sm hover:underline"
                      >
                        Buka <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                    ) : (
                      <p className="mt-auto pt-2 text-sm font-bold text-muted">Belum tersedia</p>
                    )}
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-pretty text-sm leading-relaxed font-bold">
                Glukosa → 2 asam piruvat → 2 asetil KoA → NADH, FADH<sub>2</sub>, CO<sub>2</sub> →
                34 ATP + H<sub>2</sub>O
              </p>
            </Collapsible.Panel>
          </Collapsible.Root>

          {['Respirasi Anaerob', 'Fotosintesis'].map((judul, i) => (
            <section key={judul} className="peta-lanjutan rounded-sm bg-ok p-4 shadow-kertas">
              <span aria-hidden="true" className="font-head text-2xl font-extrabold">
                {i + 3}
              </span>
              <h2 className="text-balance text-xl font-extrabold">{judul}</h2>
              <p className="text-sm text-muted">Belum tersedia</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}

export default PetaMateri
