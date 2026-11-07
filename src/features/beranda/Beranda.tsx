import { Play } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import logo from '../../assets/images/logo-metalab.webp'
import sel from '../../assets/images/sel-hewan.webp'
import latar from '../../assets/svg/latar-beranda.svg'
import latarHp from '../../assets/svg/latar-beranda-hp.svg'

// Kutip ganda wajib: Vite menyisipkan SVG kecil sebagai data URI yang berisi kutip tunggal.
const gambarLatar = {
  '--latar': `url("${latar}")`,
  '--latar-hp': `url("${latarHp}")`,
} as CSSProperties

// Ukuran di layar mendatar dibatasi tinggi layar juga, supaya HP miring 800x360 tetap muat tanpa menggulir.
// Latar: contain di layar sampai 16:9 agar lembaran utuh, cover di layar yang lebih lebar dan HP tegak.
function Beranda() {
  return (
    <main
      style={gambarLatar}
      className="grid min-h-dvh grid-cols-1 content-start gap-6 bg-screen bg-(image:--latar-hp) bg-cover bg-center bg-no-repeat px-4 py-6 landscape:grid-cols-[6fr_5fr] landscape:content-center landscape:items-center landscape:gap-[4vw] landscape:bg-(image:--latar) landscape:[@media(max-aspect-ratio:16/9)]:bg-contain landscape:px-[7vw] landscape:py-[5dvh]"
    >
      <div className="flex flex-col items-start gap-3 landscape:gap-[min(1.6vw,3dvh)]">
        <img
          src={logo}
          alt="MetaLab"
          width={840}
          height={168}
          className="h-auto w-[190px] landscape:w-[clamp(150px,min(21vw,38dvh),410px)]"
        />
        <span className="rounded-md bg-accent px-3 py-1.5 font-head text-[13px] font-extrabold tracking-wide text-ink landscape:text-[clamp(12px,1.2vw,24px)]">
          BIOLOGI KELAS XII · METABOLISME
        </span>
        <h1 className="text-[42px] leading-[1.02] font-extrabold text-paper landscape:text-[clamp(2rem,min(5.2vw,10dvh),7rem)]">
          Jelajahi <br />
          respirasi aerob
        </h1>
        <p className="text-[19px] font-bold text-paper landscape:text-[clamp(19px,min(2.2vw,4.5dvh),42px)]">
          dari glukosa sampai ATP
        </p>
        <Link
          to="/peta-materi"
          className="mt-1 inline-flex min-h-12 items-center gap-3 rounded-xl bg-atp px-7 py-3 font-head text-[22px] font-extrabold text-paper shadow-kertas active:translate-y-0.5 landscape:text-[clamp(16px,min(2.1vw,4.5dvh),40px)]"
        >
          <Play aria-hidden="true" fill="currentColor" className="size-[0.8em]" />
          Mulai belajar
        </Link>
      </div>
      <img
        src={sel}
        alt="Sel hewan dengan inti sel dan mitokondria"
        width={1200}
        height={800}
        className="h-auto w-full landscape:max-h-[80dvh] landscape:object-contain"
      />
    </main>
  )
}

export default Beranda
