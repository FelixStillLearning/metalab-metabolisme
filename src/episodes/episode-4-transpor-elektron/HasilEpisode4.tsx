import { Navigate } from 'react-router'
import LembarHasil from '../../features/lembar-hasil/LembarHasil'
import { lengkap, useJawabanE4 } from '../../stores/jawaban-episode-4'
import { BUTIR, KOLOM, TABEL, POE, type PoeE4 } from './isi'
import nadh from '../../assets/images/pembawa-nadh.webp'
import fadh from '../../assets/images/pembawa-fadh2.webp'
import adpP from '../../assets/images/pembawa-adp-p.webp'
import atp from '../../assets/images/pembawa-atp.webp'
import './episode-4.css'
function TabelPerbandingan() {
  return (
    <table className="e4-tabel">
      <caption>Aktivitas 1.11 · Perbandingan empat tahap</caption>
      <thead>
        <tr>
          <th>Variabel</th>
          {KOLOM.map((k) => (
            <th key={k} scope="col">
              {k}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {TABEL.map((r) => (
          <tr key={r.nama}>
            <th scope="row">{r.nama}</th>
            {r.sel.map((s, i) => (
              <td key={i}>{s}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
function Rantai() {
  return (
    <div
      className="e4-diagram"
      role="img"
      aria-label="NADH masuk I, lalu III dan IV. FADH₂ masuk II, lalu III dan IV. O₂ menerima elektron menjadi air. H⁺ kembali lewat ATP sintase untuk membentuk ATP."
    >
      <p>
        <img src={nadh} alt="NADH" /> → I → Q → III → Cyt c → IV → O₂ → H₂O
      </p>
      <p>
        <img src={fadh} alt="FADH₂" /> → II → Q → III → Cyt c → IV → O₂ → H₂O
      </p>
      <p>
        Pemompa H⁺: <b>I, III, IV</b>
      </p>
      <p>
        Ruang antarmembran → H⁺ melalui <b>ATP sintase</b> → matriks
      </p>
      <p>
        <img src={adpP} alt="ADP + fosfat" /> → <img src={atp} alt="ATP" />
      </p>
      <p>
        Menurut buku: 10 × 3 + 2 × 2 = <b>34 ATP</b>
      </p>
      <p>
        Seluruh respirasi: 2 + 0 + 2 + 34 = <b>38 ATP</b>
      </p>
    </div>
  )
}
export default function HasilEpisode4() {
  const { hasil, penjelasan, simpanPenjelasan } = useJawabanE4()
  if (!lengkap(hasil)) return <Navigate to="/episode/4" replace />
  const poe = (['c', 'h'] as PoeE4[]).map((k) => ({ k, isi: POE[k], p: hasil.poe[k]! }))
  return (
    <LembarHasil
      label="Episode 4 · Transpor elektron"
      judul="Rantai elektronmu"
      lead="Jalur elektron, kemiosmosis, dan perbandingan empat tahap respirasi aerob. Perhitungan ATP mengikuti buku."
      penjelasan={penjelasan}
      simpanPenjelasan={simpanPenjelasan}
      bagan={
        <div
          className="e4-bagan"
          tabIndex={0}
          role="region"
          aria-label="Bagan dan jawaban Aktivitas 1.10–1.11"
        >
          <Rantai />
          <div
            className="e4-tabel-scroll"
            tabIndex={0}
            role="region"
            aria-label="Tabel perbandingan empat tahap, geser untuk membaca"
          >
            <TabelPerbandingan />
          </div>
          <ol className="e4-jawaban">
            {BUTIR.map((k) => (
              <li key={k}>
                <b>{k === '1.11' ? k : `1.10 ${k}`}</b>
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
        nyata: isi.zat[1],
        alasan: isi.alasan[p.penjelasan!],
      }))}
      pertanyaan="Mengapa FADH₂ menyumbang lebih sedikit ATP daripada NADH? Hubungkan jalur elektron, pemompaan H⁺, ATP sintase, serta perbedaan 34 ATP dan 38 ATP."
      cetak={{
        judul: 'Lembar Hasil Aktivitas 1.10–1.11 (Transpor elektron)',
        jawaban: BUTIR.map((k) => ({
          k,
          bagian: k === '1.11' ? 'Tabel perbandingan' : 'Transpor elektron',
          isi: hasil.jawaban[k]!,
        })),
        poe: poe.map(({ k, isi, p }) => ({
          k,
          tebakan: isi.zat[p.tebakan],
          nyata: isi.zat[1],
          awal: isi.alasan[p.alasan],
          akhir: isi.alasan[p.penjelasan!],
        })),
        tabel: <TabelPerbandingan />,
      }}
      rute={{ episode: '/episode/4', lanjut: '/episode/4/penutup' }}
      narasi={{
        id: 'e4-hasil',
        teks: 'Respirasi aerob selesai. Ini rantai elektronmu dan tabel perbandingan empat tahap. Jelaskan hubungan jalur elektron, aliran proton, dan pembentukan ATP.',
      }}
    />
  )
}
