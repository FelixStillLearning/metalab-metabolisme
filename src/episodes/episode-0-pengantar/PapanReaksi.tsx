import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { durasi } from '../../features/pemutar-episode/mesin'
import { tenangAktif, usePengaturan } from '../../stores/pengaturan'
import foto from '../../assets/images/molekul-reaksi-fotosintesis.webp'
import respirasi from '../../assets/images/molekul-reaksi-respirasi.webp'
import cahaya from '../../assets/images/energi-cahaya.webp'
import kosong from '../../assets/images/energi-kosong.webp'
import kimia from '../../assets/images/energi-kimia.webp'
import atp from '../../assets/images/pembawa-atp.webp'
import { useAdeganE0 } from './adegan'
import { SOAL, reaksi } from './isi'

// Jendela kelompok pada D24/D25; ATP D25 ditampilkan terpisah sebagai penanda energi.
const POTONGAN = {
  a: [
    [20, 130, 650, 465],
    [675, 85, 500, 525],
    [1180, 120, 490, 465],
    [1660, 135, 490, 465],
  ],
  b: [
    [30, 170, 380, 415],
    [420, 110, 655, 460],
    [1100, 65, 555, 385],
    [1655, 60, 500, 395],
  ],
}

export default function PapanReaksi() {
  const { soal, terjawab } = useAdeganE0()
  const papan = useRef<HTMLElement>(null)
  const tenang = usePengaturan((s) => s.tenang)
  const reaksiAktif = soal < 0 || soal >= 6 ? null : soal < 3 ? 'a' : 'b'
  useGSAP(
    () => {
      if (!papan.current || tenangAktif()) return
      const molekul = papan.current.querySelectorAll('.e0-molekul')
      const gerak = gsap.from(molekul, {
        y: 18,
        rotation: -4,
        opacity: 0,
        stagger: durasi(100) / 1000,
        duration: durasi(550) / 1000,
        ease: 'back.out(1.3)',
      })
      return () => {
        gerak.revert()
      }
    },
    { scope: papan, dependencies: [reaksiAktif, tenang], revertOnUpdate: true },
  )
  useGSAP(
    () => {
      if (!papan.current || !terjawab || tenangAktif()) return
      const isian = ['nama', 'energi', 'perubahan'][soal % 3]
      const teks = gsap.from(papan.current.querySelectorAll(`[data-isian="${isian}"] b`), {
        opacity: 0.3,
        duration: durasi(420) / 1000,
        ease: 'power2.out',
      })
      const energi =
        isian === 'energi'
          ? gsap.from(papan.current.querySelectorAll('.e0-isian-energi img'), {
              y: reaksiAktif === 'a' ? -18 : 18,
              scale: 0.7,
              rotation: -12,
              duration: durasi(550) / 1000,
              ease: 'back.out(1.5)',
            })
          : null
      return () => {
        teks.revert()
        energi?.revert()
      }
    },
    { scope: papan, dependencies: [soal, terjawab, tenang], revertOnUpdate: true },
  )
  if (reaksiAktif === null) return null
  const a = soal < 3,
    k = a ? 'a' : 'b',
    r = reaksi[k],
    awal = a ? 0 : 3
  const nama = soal > awal || terjawab
  const energi = soal > awal + 1 || (soal === awal + 1 && terjawab)
  const perubahan = soal === awal + 2 && terjawab
  const aktif = (indeks: number) => soal === awal + indeks && !terjawab
  const rumus = (sisi: typeof r.bahan) =>
    sisi.map((m) => `${m.jumlah === 1 ? '' : `${m.jumlah} `}${m.rumus}`).join(' + ')
  const kelompok = (sisi: typeof r.bahan, offset: number) => (
    <div className="e0-kelompok-zat">
      {sisi.map((m, i) => {
        const [x, y, width, height] = POTONGAN[k][offset + i]
        const id = `e0-zat-${k}-${offset + i}`
        return (
          <div className="e0-molekul" key={m.rumus}>
            {i === 1 && (
              <span className="e0-tambah" aria-hidden="true">
                +
              </span>
            )}
            <svg
              viewBox={`${x} ${y} ${width} ${height}`}
              role="img"
              aria-label={`${m.jumlah} ${m.rumus}`}
              data-zat={m.rumus}
              data-jumlah={m.jumlah}
            >
              <defs>
                <clipPath id={id}>
                  <rect x={x} y={y} width={width} height={height} />
                </clipPath>
              </defs>
              <image
                href={a ? foto : respirasi}
                width="2172"
                height="724"
                clipPath={`url(#${id})`}
              />
            </svg>
            <b>
              {m.jumlah === 1 ? '' : `${m.jumlah} `}
              {m.rumus}
            </b>
          </div>
        )
      })}
    </div>
  )
  return (
    <section
      ref={papan}
      className="e0-reaksi"
      aria-label={`Reaksi (${k})`}
      data-reaksi={k}
      data-butir={soal % 3}
    >
      <header className="e0-judul-reaksi">
        <span>Reaksi ({k})</span>
        <div
          className="e0-isian e0-isian-nama"
          role="status"
          aria-label="Isian nama reaksi"
          data-isian="nama"
          data-aktif={aktif(0) || undefined}
          data-terisi={nama || undefined}
        >
          <small>Nama reaksi</small>
          <b>
            {nama
              ? a
                ? 'Fotosintesis · Anabolisme'
                : 'Respirasi aerob · Katabolisme'
              : '? Pilih nama reaksi'}
          </b>
        </div>
      </header>
      <div className="e0-model-reaksi">
        <div className="e0-zat-sisi">
          <h3>Bahan</h3>
          {kelompok(r.bahan, 0)}
        </div>
        <div className="e0-tengah-reaksi">
          <div
            className="e0-isian e0-isian-energi"
            role="status"
            aria-label="Isian energi"
            data-isian="energi"
            data-aktif={aktif(1) || undefined}
            data-terisi={energi || undefined}
          >
            <small>{a ? 'Energi masuk' : 'Energi keluar'}</small>
            <div>
              <img src={energi ? (a ? cahaya : atp) : kosong} alt="" />
              <b>{energi ? (a ? 'Cahaya (foton)' : 'Energi kimia · ATP') : '? Pilih energi'}</b>
            </div>
            {!a && energi && <img className="e0-simbol-kimia" src={kimia} alt="" />}
          </div>
          <b className="e0-panah-model" aria-label="menjadi">
            →
          </b>
        </div>
        <div className="e0-zat-sisi">
          <h3>Hasil</h3>
          {kelompok(r.hasil, 2)}
        </div>
      </div>
      <div className="e0-persamaan">
        <span>{rumus(r.bahan)}</span>
        <b aria-hidden="true">→</b>
        <span>{rumus(r.hasil)}</span>
      </div>
      <div
        className="e0-isian e0-isian-perubahan"
        role="status"
        aria-label="Isian perubahan senyawa"
        data-isian="perubahan"
        data-aktif={aktif(2) || undefined}
        data-terisi={perubahan || undefined}
      >
        <small>Perubahan senyawa</small>
        <b>
          {perubahan
            ? a
              ? 'Sederhana → kompleks · Endergonik'
              : 'Kompleks → sederhana · Eksergonik'
            : '? Pilih perubahan senyawa'}
        </b>
        {perubahan && (
          <span>Dengan bantuan enzim · {a ? 'memerlukan energi' : 'melepas energi ATP'}</span>
        )}
      </div>
      <small className="e0-catatan-atom">Model glukosa: rangka 6 C · rumus C₆H₁₂O₆</small>
      <span className="sr-only">{SOAL[soal].t}. Jumlah atom tiap sisi: 6 C, 12 H, 18 O.</span>
    </section>
  )
}
