import { Navigate } from 'react-router'
import piruvat from '../../assets/images/molekul-piruvat.webp'
import asetil from '../../assets/images/molekul-asetil.webp'
import asetilKoa from '../../assets/images/molekul-asetil-koa.webp'
import co2 from '../../assets/images/molekul-co2.webp'
import nad from '../../assets/images/pembawa-nad.webp'
import nadh from '../../assets/images/pembawa-nadh.webp'
import LembarHasil from '../../features/lembar-hasil/LembarHasil'
import { lengkap, useJawabanE2 } from '../../stores/jawaban-episode-2'
import { BAB, POE, type PoeE2 } from './isi'
import './episode-2.css'

function Bagan() {
  const molekul = (href: string, x: number, y: number, karbon?: number) => (
    <image href={href} x={x - 80} y={y - 40} width={160} height={80} data-karbon={karbon} />
  )
  return (
    <svg
      className="e2-diagram"
      viewBox="0 0 800 780"
      role="img"
      aria-label="Dua piruvat menjadi dua asetil KoA, dua CO₂, dan dua NADH. Karbon: 6 = 4 + 2."
    >
      <defs>
        <marker
          id="e2-panah"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0L10 5L0 10z" fill="var(--color-screen-3)" />
        </marker>
      </defs>
      <g data-step="0">
        <text x="400" y="40" textAnchor="middle">
          Matriks mitokondria · per 1 glukosa
        </text>
        {molekul(piruvat, 270, 110, 3)}
        {molekul(piruvat, 470, 110, 3)}
        <text x="370" y="175" textAnchor="middle">
          2 asam piruvat · 6 C
        </text>
      </g>
      <g data-step="1">
        <path className="flow" d="M370 190 V275" markerEnd="url(#e2-panah)" />
        <text x="90" y="235">
          1 · Lepas karboksil
        </text>
        {molekul(asetil, 270, 325, 2)}
        {molekul(asetil, 470, 325, 2)}
        {molekul(co2, 670, 250, 1)}
        {molekul(co2, 670, 350, 1)}
        <text x="670" y="410" textAnchor="middle">
          2 CO₂ · 2 C
        </text>
        <text x="370" y="390" textAnchor="middle">
          2 gugus asetil · 4 C
        </text>
      </g>
      <g data-step="2">
        <path className="flow" d="M370 405 V505" markerEnd="url(#e2-panah)" />
        <text x="90" y="460">
          2 · Oksidasi
        </text>
        {molekul(nad, 510, 455)}
        {molekul(nadh, 690, 455)}
        <path className="flow" d="M575 455 H615" markerEnd="url(#e2-panah)" />
        <text x="600" y="520" textAnchor="middle">
          2 NAD⁺ → 2 NADH
        </text>
      </g>
      <g data-step="3">
        <text x="90" y="560">
          3 · Ikat KoA
        </text>
        {molekul(asetilKoa, 270, 615, 2)}
        {molekul(asetilKoa, 470, 615, 2)}
        <text x="370" y="680" textAnchor="middle">
          2 asetil KoA · 4 C pada gugus asetil
        </text>
        <text x="400" y="735" textAnchor="middle">
          Karbon: 6 = 4 + 2
        </text>
        <text x="400" y="770" textAnchor="middle">
          KoA tidak masuk hitungan rangka karbon piruvat.
        </text>
      </g>
    </svg>
  )
}

export default function HasilEpisode2() {
  const { hasil, penjelasan, simpanPenjelasan } = useJawabanE2()
  if (!lengkap(hasil)) return <Navigate to="/episode/2" replace />
  const poe = (['c', 'b·2'] as PoeE2[]).map((k) => ({ k, isi: POE[k], p: hasil.poe[k]! }))
  return (
    <LembarHasil
      label="Episode 2 · Dekarboksilasi oksidatif"
      judul="Bagan dekarboksilasimu"
      lead="Jejak karbon dan hasil dari dua asam piruvat asal satu glukosa."
      penjelasan={penjelasan}
      simpanPenjelasan={simpanPenjelasan}
      bagan={
        <div
          className="e2-bagan"
          tabIndex={0}
          role="region"
          aria-label="Bagan dan jawaban Aktivitas 1.8"
        >
          <Bagan />
          <ol className="e2-jawaban">
            {BAB.map(({ k, t }) => (
              <li key={k}>
                <b>
                  1.8 {k} · {t}
                </b>
                <p>{hasil.jawaban[k]}</p>
              </li>
            ))}
          </ol>
        </div>
      }
      poe={poe.map(({ k, isi, p }) => ({
        k,
        q: isi.judul,
        tebakan: isi.zat[p.tebakan],
        nyata: isi.zat[0],
        alasan: isi.alasan[p.penjelasan!],
      }))}
      pertanyaan="Ke mana keenam karbon asal satu glukosa setelah dekarboksilasi oksidatif? Kaitkan dengan asetil KoA dan CO₂."
      cetak={{
        judul: 'Lembar Hasil Aktivitas 1.8 (Dekarboksilasi oksidatif)',
        jawaban: BAB.map(({ k, t }) => ({ k, bagian: t, isi: hasil.jawaban[k]! })),
        poe: poe.map(({ k, isi, p }) => ({
          k,
          tebakan: isi.zat[p.tebakan],
          awal: isi.alasan[p.alasan],
          akhir: isi.alasan[p.penjelasan!],
        })),
      }}
      rute={{ episode: '/episode/2', lanjut: '/episode/3' }}
      narasi={{
        id: 'e2-hasil',
        teks: 'Ini bagan dekarboksilasimu. Bandingkan tebakan awal dengan hasil pengamatan dan jelaskan ke mana keenam karbon berpindah.',
      }}
    />
  )
}
