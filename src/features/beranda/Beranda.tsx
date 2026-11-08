import { Play } from 'lucide-react'
import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import garisGerak from '../../assets/images/efek-garis-gerak.webp'
import letupan from '../../assets/images/efek-letupan.webp'
import glukosa from '../../assets/images/glukosa.webp'
import latarHp from '../../assets/images/latar-beranda-hp.webp'
import latar from '../../assets/images/latar-beranda.webp'
import logo from '../../assets/images/logo-metalab.webp'
import maskot from '../../assets/images/maskot-ilmuwan-melambai.webp'
import sel from '../../assets/images/sel-hewan.webp'
import { bolehBersuaraSendiri, putar, type NamaSuara } from '../../lib/suara'
import TombolSuara from '../../components/TombolSuara'
import './beranda.css'

const gambarLatar = { '--latar': `url("${latar}")`, '--latar-hp': `url("${latarHp}")` }

// [kiri %, atas %, ukuran px, geser x px, geser y px, durasi detik]; letaknya menjauhi kolom teks
const PARTIKEL = [
  [92, 9, 16, -10, 12, 7],
  [57, 6, 12, 12, 8, 6.5],
  [96, 46, 14, -12, 10, 6],
  [84, 78, 20, 8, 12, 8],
  [55, 90, 16, -10, -12, 7.5],
  [28, 93, 12, 10, -10, 5.5],
  [6, 96, 14, 6, -14, 9],
] as const

const gaya = (nilai: Record<string, string | number>) => nilai as CSSProperties
const tunda = (ms: number) => gaya({ '--tunda': `${ms}ms` })

// Gelembung berganti kalimat setiap maskot diketuk (teks DRAF)
const KALIMAT = [
  'Halo! Siap menjelajah sel?',
  'Sel memecah glukosa untuk membuat ATP.',
  'ATP menyimpan energi yang dipakai sel.',
  'Yuk, klik Mulai belajar!',
]

// Suara mengikuti koreografi di beranda.css: melesat 450 ms, mendarat 1150 ms, maskot 1600 ms
const SUARA_MASUK: [number, NamaSuara][] = [
  [450, 'melesat'],
  [1150, 'mendarat'],
  [1600, 'maskot'],
]

const gerakDikurangi = () => matchMedia('(prefers-reduced-motion: reduce)').matches

function useSuaraMasuk(putaran: number) {
  useEffect(() => {
    if (gerakDikurangi() || !bolehBersuaraSendiri()) return
    const jadwal = SUARA_MASUK.map(([ms, nama]) => setTimeout(() => putar(nama), ms))
    return () => jadwal.forEach(clearTimeout)
  }, [putaran])
}

// Ukuran di layar mendatar dibatasi tinggi layar juga, supaya HP miring 800x360 tetap muat tanpa menggulir.
function Beranda() {
  // putaran: animasi masuk diputar ulang; ulangPop: letupan sel; ketukan: kalimat maskot
  const [putaran, setPutaran] = useState(0)
  const [ulangPop, setUlangPop] = useState(0)
  const [ketukan, setKetukan] = useState(0)
  const gambarSel = useRef<HTMLImageElement>(null)
  useSuaraMasuk(putaran)

  const putarUlangSemua = () => {
    setPutaran((n) => n + 1)
    setUlangPop(0)
    setKetukan(0)
  }
  const ketukSel = () => {
    putar('mendarat')
    setUlangPop((n) => n + 1)
    if (!gerakDikurangi()) {
      gambarSel.current?.animate(
        [{ scale: '1' }, { scale: '0.94 1.06' }, { scale: '1.04 0.97' }, { scale: '1' }],
        { duration: 420, easing: 'ease-out' },
      )
    }
  }
  const ketukMaskot = () => {
    putar('maskot')
    setKetukan((n) => n + 1)
  }

  return (
    <main
      style={gaya(gambarLatar)}
      className="beranda relative isolate grid min-h-dvh grid-cols-1 content-start gap-6 overflow-hidden bg-screen bg-(image:--latar-hp) bg-cover bg-center bg-no-repeat px-4 py-6 landscape:grid-cols-[6fr_5fr] landscape:content-center landscape:items-center landscape:gap-x-[4vw] landscape:gap-y-[2dvh] landscape:bg-(image:--latar) landscape:px-[7vw] landscape:py-[5dvh]"
    >
      <TombolSuara saatDinyalakan={putarUlangSemua} className="absolute top-4 right-4 z-30" />
      <div key={putaran} className="contents">
        <div className="absolute inset-0 -z-10">
          {PARTIKEL.map(([kiri, atas, ukuran, dx, dy, durasi]) => (
            <span
              key={`${kiri}-${atas}`}
              data-hiasan="partikel"
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full bg-screen-3/70 shadow-kertas-sm motion-safe:animate-melayang"
              style={gaya({
                left: `${kiri}%`,
                top: `${atas}%`,
                width: ukuran,
                height: ukuran,
                '--dx': `${dx}px`,
                '--dy': `${dy}px`,
                animationDuration: `${durasi}s`,
              })}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-start gap-3 landscape:gap-[min(1.6vw,3dvh)]">
          <img
            src={logo}
            alt="MetaLab"
            width={840}
            height={168}
            style={tunda(0)}
            className="tempel h-auto w-[190px] landscape:w-[clamp(150px,min(21vw,38dvh),410px)]"
          />
          <span
            style={tunda(90)}
            className="tempel -rotate-2 rounded-md bg-accent px-3 py-1.5 font-head text-[13px] font-extrabold tracking-wide text-ink shadow-kertas-sm landscape:text-[clamp(12px,1.2vw,24px)]"
          >
            BIOLOGI KELAS XII · METABOLISME
          </span>
          <h1
            style={tunda(180)}
            className="tempel text-[42px] leading-[1.02] font-extrabold text-ink uppercase landscape:text-[clamp(2rem,min(5.2vw,10dvh),7rem)]"
          >
            Jelajahi <br />
            respirasi aerob
          </h1>
          <p
            style={tunda(270)}
            className="tempel text-[19px] font-bold text-ink landscape:text-[clamp(19px,min(2.2vw,4.5dvh),42px)]"
          >
            dari glukosa sampai ATP
          </p>
          <Link
            to="/peta-materi"
            onClick={() => putar('mulai')}
            style={tunda(360)}
            className="tempel tombol-utama mt-1 inline-flex min-h-12 items-center gap-3 px-8 pt-3 pb-4 font-head text-[22px] font-extrabold transition-transform duration-(--durasi-ui) ease-pose hover:-translate-y-1 active:translate-y-0.5 landscape:text-[clamp(16px,min(2.1vw,4.5dvh),40px)]"
          >
            <Play aria-hidden="true" fill="currentColor" className="size-[0.8em]" />
            Mulai belajar
          </Link>
        </div>

        <div className="flex flex-col gap-2 portrait:mt-4">
          <div className="w-full">
            <div className="sel-masuk relative -rotate-5">
              <img
                src={garisGerak}
                alt=""
                data-efek="garis-gerak"
                width={640}
                height={160}
                className="absolute top-[30%] left-[80%] w-[55%]"
              />
              <Fragment key={ulangPop}>
                <img
                  src={letupan}
                  alt=""
                  data-efek="letupan"
                  width={560}
                  height={560}
                  style={tunda(ulangPop ? 0 : 1150)}
                  className="absolute top-[-10%] left-[14%] w-[72%]"
                />
                <div
                  data-efek="pop"
                  aria-hidden="true"
                  className="absolute top-[-4%] left-[4%] z-10 flex"
                >
                  {[...'POP!'].map((h, i) => (
                    <span
                      key={i}
                      data-huruf
                      style={tunda((ulangPop ? 0 : 1200) + i * 60)}
                      className={`grid size-[clamp(30px,3.2vw,52px)] place-items-center bg-accent font-head text-[clamp(20px,2.3vw,38px)] font-extrabold text-ink shadow-kertas-sm ${i % 2 ? 'rotate-6' : '-rotate-6'}`}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </Fragment>
              <img
                ref={gambarSel}
                src={sel}
                alt="Sel hewan dengan inti sel dan mitokondria"
                width={1200}
                height={800}
                className="relative h-auto w-full motion-safe:animate-bernapas landscape:max-h-[80dvh] landscape:object-contain"
              />
              <img
                src={glukosa}
                alt=""
                data-hiasan="glukosa"
                width={240}
                height={240}
                style={gaya({ '--tunda': '1300ms', '--durasi': '4.5s', '--dy': '-12px' })}
                className="glukosa absolute bottom-[2%] left-[2%] w-[16%] rotate-[-10deg]"
              />
              <img
                src={glukosa}
                alt=""
                data-hiasan="glukosa"
                width={240}
                height={240}
                style={gaya({ '--tunda': '1400ms', '--durasi': '5.5s', '--dy': '10px' })}
                className="glukosa absolute top-[0%] right-[4%] w-[13%] rotate-[12deg]"
              />
              <button
                type="button"
                aria-label="Letupkan sel"
                onClick={ketukSel}
                className="absolute inset-[8%] z-10 cursor-pointer rounded-[45%]"
              />
            </div>
          </div>

          <div className="flex items-start gap-4 [@media(orientation:landscape)_and_(max-height:500px)]:hidden landscape:absolute landscape:right-[3vw] landscape:bottom-[3dvh] landscape:z-20 landscape:flex-row-reverse">
            <div className="relative shrink-0">
              <img
                src={maskot}
                alt=""
                data-hiasan="maskot"
                width={418}
                height={418}
                className="maskot h-auto w-[170px] landscape:w-[min(40dvh,380px)]"
              />
              <button
                type="button"
                aria-label="Ajak bicara ilmuwan"
                onClick={ketukMaskot}
                className="absolute inset-0 cursor-pointer rounded-[30%]"
              />
            </div>
            <div aria-live="polite">
              <p
                key={ketukan}
                data-hiasan="gelembung"
                style={tunda(ketukan ? 0 : 2100)}
                className="gelembung tempel relative max-w-[10em] rounded-sm landscape:mt-[min(3dvh,28px)] bg-paper px-5 py-3 font-head text-[18px] leading-tight font-extrabold text-ink shadow-kertas landscape:text-[clamp(18px,min(1.9vw,3.4dvh),32px)]"
              >
                {KALIMAT[ketukan % KALIMAT.length]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Beranda
