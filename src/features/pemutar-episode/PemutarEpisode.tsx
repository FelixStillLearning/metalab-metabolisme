import { gsap } from 'gsap'
import { ArrowLeft, Pause, Play, Settings } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import ikonPutarHp from '../../assets/svg/ui-putar-hp.svg?raw'
import TombolSuara from '../../components/TombolSuara'
import { musik } from '../../lib/suara'
import { usePemutar } from '../../stores/pemutar'
import { usePengaturan } from '../../stores/pengaturan'
import Gelembung from './Gelembung'
import { disc, el } from './kertas'
import { jedaSemua, kendali, obj, type Objek, type Panggung } from './mesin'
import PanelPengaturan from './PanelPengaturan'
import LengkapiAdegan from './LengkapiAdegan'
import PilihanAdegan from './PilihanAdegan'
import PoeAdegan from './PoeAdegan'
import './pemutar-episode.css'

export type Bab = { k: string; t: string; poe?: boolean }
export type StatusBab = 'selesai' | 'sekarang' | ''

type Props = {
  judul: string
  label: string
  ringkasan: string
  bab: Bab[]
  gambarSampul: string
  jalankan: (p: Panggung) => Promise<void>
  // Putar ulang tanpa jeda dari Lembar Hasil: mulai sendiri, soal dijawab otomatis
  otomatis?: boolean
}

// Sama dengan media query ajakan putar HP di pemutar-episode.css
const TEGAK = '(orientation: portrait) and (max-width: 760px)'

// Bintik kertas latar dari prototype [x, y, jari-jari]
const PARTIKEL = [
  [250, 240, 6],
  [1450, 300, 5],
  [580, 680, 5],
  [1250, 720, 6],
  [1000, 190, 4],
  [160, 630, 5],
] as const

function layarPenuh() {
  const janji = document.fullscreenElement
    ? document.exitFullscreen()
    : document.documentElement.requestFullscreen?.()
  janji?.catch(() => {})
}

function PemutarEpisode({
  judul,
  label,
  ringkasan,
  bab,
  gambarSampul,
  jalankan,
  otomatis = false,
}: Props) {
  const [mulai, setMulai] = useState(false)
  const [panelBuka, setPanelBuka] = useState(false)
  const babSekarang = usePemutar((s) => s.bab)
  const dijeda = usePemutar((s) => s.dijeda)
  const svg = useRef<SVGSVGElement>(null)
  const latar = useRef<SVGGElement>(null)
  const fx = useRef<SVGGElement>(null)
  const tombolPengaturan = useRef<HTMLButtonElement>(null)
  const saklarPertama = useRef<HTMLInputElement>(null)
  const pengendali = useRef<AbortController>(null)
  const kamera = useRef<Objek>(null)
  // Ref, bukan state: dua ketukan cepat terjadi sebelum React sempat menggambar ulang
  const sudahMulai = useRef(false)
  const dijedaPanel = useRef(false)

  // Jeda hanya berlaku setelah episode dimulai, seperti prototype
  const aturJeda = (v: boolean) => {
    if (sudahMulai.current && v !== usePemutar.getState().dijeda) jedaSemua(v)
  }

  // Tiap pemasangan punya AbortController sendiri (StrictMode memasang dua kali di dev)
  useEffect(() => {
    const kendali = new AbortController()
    pengendali.current = kendali
    usePemutar.setState({
      kalimat: '',
      pose: '01-ramah',
      pendamping: null,
      bab: -1,
      pilihan: null,
      lengkapi: null,
      poe: null,
    })
    const s = svg.current!
    const g = latar.current!
    for (const [x, y, r] of PARTIKEL)
      disc(g, x, y, r, 'var(--color-paper)', { opacity: 0.65 }, { bayangan: true })
    return () => {
      kendali.abort()
      // Gerak yang sedang berjalan ikut dihentikan; janjinya tidak pernah selesai, adegan sudah batal
      gsap.killTweensOf([s, ...s.querySelectorAll('*')])
      window.speechSynthesis?.cancel()
      musik(false)
      jedaSemua(false)
      g.replaceChildren()
      kamera.current?.remove()
      sudahMulai.current = false
    }
  }, [])

  // Narasi yang sedang berjalan ikut berhenti saat narasi atau semua suara dimatikan
  useEffect(
    () =>
      usePengaturan.subscribe((s, lama) => {
        if ((lama.narasi && !s.narasi) || (lama.suaraAktif && !s.suaraAktif))
          window.speechSynthesis?.cancel()
      }),
    [],
  )

  // HP diputar ke tegak di tengah episode: dijeda, dan tidak lanjut sendiri saat miring lagi
  useEffect(() => {
    const tegak = matchMedia(TEGAK)
    const cek = () => {
      if (tegak.matches) {
        dijedaPanel.current = false
        if (sudahMulai.current && !usePemutar.getState().dijeda) jedaSemua(true)
      }
    }
    tegak.addEventListener('change', cek)
    return () => tegak.removeEventListener('change', cek)
  }, [])

  useEffect(() => {
    if (panelBuka) saklarPertama.current?.focus()
  }, [panelBuka])

  const aturPanel = (buka: boolean) => {
    setPanelBuka(buka)
    if (buka) {
      dijedaPanel.current = sudahMulai.current && !usePemutar.getState().dijeda
      aturJeda(true)
    } else {
      if (dijedaPanel.current) aturJeda(false)
      dijedaPanel.current = false
      tombolPengaturan.current?.focus()
    }
  }

  useEffect(() => {
    const tekan = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (panelBuka) aturPanel(false)
        return
      }
      const sasaran = e.target as Element
      if (e.ctrlKey || e.metaKey || e.altKey || sasaran.closest('textarea')) return
      if (e.key === ' ' && !sasaran.closest('button, [role="button"], input')) {
        e.preventDefault()
        aturJeda(!usePemutar.getState().dijeda)
      } else if (e.key.toLowerCase() === 'f') layarPenuh()
    }
    addEventListener('keydown', tekan)
    return () => removeEventListener('keydown', tekan)
  })

  const mulaiEpisode = () => {
    if (sudahMulai.current) return
    sudahMulai.current = true
    setMulai(true)
    musik(true)
    // Episode dipakai miring: di perangkat sentuh minta layar penuh lalu kunci mendatar
    if (matchMedia('(pointer: coarse)').matches) {
      document.documentElement
        .requestFullscreen?.()
        .then(() => screen.orientation.lock('landscape'))
        .catch(() => {})
    }
    const s = svg.current!
    const cam = obj(0, 0, s)
    kamera.current = cam
    s.insertBefore(cam, fx.current)
    const panggung: Panggung = {
      svg: s,
      latar: latar.current!,
      cam,
      world: el('g', {}, cam),
      fx: fx.current!,
      signal: pengendali.current!.signal,
    }
    jalankan(panggung).catch((e: unknown) => {
      if ((e as Error)?.name !== 'AbortError') throw e
    })
  }

  // Dipasang setelah pengendali di atas, jadi tiap pemasangan memakai AbortController-nya sendiri
  useEffect(() => {
    if (!otomatis) return
    kendali.otomatis = true
    mulaiEpisode()
    // Dimulai saat HP tegak: dijeda sampai siswa memutar HP lalu menekan lanjut
    if (matchMedia(TEGAK).matches) jedaSemua(true)
    return () => {
      kendali.otomatis = false
    }
    // Hanya saat dipasang: mulaiEpisode membaca ref, jadi versi lamanya tetap benar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otomatis])

  const status = bab.map((_, j): StatusBab =>
    j < babSekarang ? 'selesai' : j === babSekarang ? 'sekarang' : '',
  )
  const babIni = bab[babSekarang]
  const kembali = (
    <Link to="/peta-materi" className="pemutar-kembali">
      <ArrowLeft aria-hidden="true" />
      Peta materi
    </Link>
  )

  return (
    <div className="pemutar" data-dijeda={dijeda || undefined}>
      <div className="pemutar-panggung" data-panggung>
        <svg ref={svg} viewBox="0 0 1600 900" role="img" aria-label={`Animasi episode ${judul}`}>
          <g ref={latar} data-lapisan="latar" />
          <g ref={fx} data-lapisan="fx" />
        </svg>
        <Gelembung />
        <PilihanAdegan />
        <LengkapiAdegan />
        <PoeAdegan />
        {!mulai && (
          <div className="pemutar-sampul">
            <div className="pemutar-sampul-gambar">
              <img src={gambarSampul} alt="" />
            </div>
            <div className="pemutar-sampul-isi">
              <span className="pemutar-label">{label}</span>
              <h1>{judul}</h1>
              <p>{ringkasan}</p>
              <button
                type="button"
                className="tombol-utama"
                disabled={mulai}
                onClick={mulaiEpisode}
              >
                Mulai episode
              </button>
              {kembali}
            </div>
          </div>
        )}
      </div>

      <div className="pemutar-bilah">
        <button
          type="button"
          className="pemutar-ib"
          aria-label={dijeda ? 'Lanjut (spasi)' : 'Jeda (spasi)'}
          onClick={() => aturJeda(!dijeda)}
        >
          {dijeda ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
        <TombolSuara className="pemutar-ib" />
        <span className="pemutar-posisi" aria-live="polite">
          {babIni ? (
            <>
              <b>{babIni.k}</b>
              {babIni.t}
              {babIni.poe && <em>POE</em>}
            </>
          ) : babSekarang >= bab.length ? (
            `${judul} selesai`
          ) : (
            judul
          )}
        </span>
        <button
          ref={tombolPengaturan}
          type="button"
          className="pemutar-ib"
          aria-label="Pengaturan"
          aria-expanded={panelBuka}
          aria-controls="panel-pengaturan"
          onClick={() => aturPanel(!panelBuka)}
        >
          <Settings aria-hidden="true" />
        </button>
      </div>

      <ol className="pemutar-progres" aria-hidden="true">
        {status.map((s, j) => (
          <li key={bab[j].k} data-s={s} />
        ))}
      </ol>

      <PanelPengaturan
        buka={panelBuka}
        tutup={() => aturPanel(false)}
        layarPenuh={layarPenuh}
        bab={bab}
        status={status}
        saklarPertama={saklarPertama}
      />

      <div className="pemutar-putar-hp">
        <span className="pemutar-ikon-putar" dangerouslySetInnerHTML={{ __html: ikonPutarHp }} />
        <h2>Putar HP-mu</h2>
        <p>Episode {judul.toLowerCase()} lebih nyaman dilihat dalam posisi miring.</p>
        {kembali}
      </div>
    </div>
  )
}

export default PemutarEpisode
