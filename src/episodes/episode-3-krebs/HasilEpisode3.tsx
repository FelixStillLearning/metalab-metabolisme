import { Navigate } from 'react-router'
import roda from '../../assets/images/interaksi-roda-krebs.webp'
import sitrat from '../../assets/images/molekul-sitrat.webp'
import isositrat from '../../assets/images/molekul-isositrat.webp'
import alfa from '../../assets/images/molekul-alfa-ketoglutarat.webp'
import suksinil from '../../assets/images/molekul-suksinil-koa.webp'
import suksinat from '../../assets/images/molekul-suksinat.webp'
import fumarat from '../../assets/images/molekul-fumarat.webp'
import malat from '../../assets/images/molekul-malat.webp'
import oaa from '../../assets/images/molekul-oksaloasetat.webp'
import LembarHasil from '../../features/lembar-hasil/LembarHasil'
import { lengkap, useJawabanE3 } from '../../stores/jawaban-episode-3'
import { BAB, POE, TAHAP, type PoeE3 } from './isi'
import './episode-3.css'

function Tabel() {
  return (
    <table className="e3-tabel">
      <caption>Delapan tahap siklus Krebs · satu putaran</caption>
      <thead>
        <tr>
          <th>Tahap</th>
          <th>Senyawa terbentuk</th>
          <th>C</th>
          <th>Zat</th>
        </tr>
      </thead>
      <tbody>
        {TAHAP.map((t, i) => (
          <tr key={t.nama} data-step={i}>
            <th scope="row">{i + 1}</th>
            <td>
              <img
                src={[sitrat, isositrat, alfa, suksinil, suksinat, fumarat, malat, oaa][i]}
                alt=""
              />
              {t.nama}
            </td>
            <td>{t.karbon}</td>
            <td>
              {[
                t.air && 'H₂O masuk',
                t.hasil && (t.hasil === 'ATP' ? 'ATP (GTP)' : t.hasil),
                (i === 2 || i === 3) && 'CO₂ keluar',
                (i === 0 || i === 4) && 'KoA dilepas',
                i === 3 && 'KoA terikat',
              ]
                .filter(Boolean)
                .join(' · ') || 'Penataan ulang'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
export default function HasilEpisode3() {
  const { hasil, penjelasan, simpanPenjelasan } = useJawabanE3()
  if (!lengkap(hasil)) return <Navigate to="/episode/3" replace />
  const poe = (['i·1', 'i·2'] as PoeE3[]).map((k) => ({ k, isi: POE[k], p: hasil.poe[k]! }))
  return (
    <LembarHasil
      label="Episode 3 · Siklus Krebs"
      judul="Roda siklus Krebsmu"
      lead="Delapan tahap di matriks mitokondria, dari pengikatan gugus asetil sampai oksaloasetat terbentuk kembali."
      penjelasan={penjelasan}
      simpanPenjelasan={simpanPenjelasan}
      bagan={
        <div
          className="e3-bagan"
          tabIndex={0}
          role="region"
          aria-label="Roda dan jawaban Aktivitas 1.9"
        >
          <figure className="e3-ringkasan">
            <img src={roda} alt="Roda delapan tahap, berurutan searah jarum jam" />
            <figcaption>
              <b>2 C + 4 C → 6 C → 5 C → 4 C</b>
              <p>Oksaloasetat 4 C terbentuk kembali. Dua CO₂ keluar pada tahap 3 dan 4.</p>
              <p>Per putaran: 3 NADH · 1 FADH₂ · 1 ATP · 2 CO₂.</p>
              <p>Per glukosa (2 putaran): 6 NADH · 2 FADH₂ · 2 ATP · 4 CO₂.</p>
            </figcaption>
          </figure>
          <Tabel />
          <ol className="e3-jawaban">
            {BAB.map(({ k, t }) => (
              <li key={k}>
                <b>
                  1.9 {k} · {t}
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
        nyata: isi.zat[1],
        alasan: isi.alasan[p.penjelasan!],
      }))}
      pertanyaan="Mengapa satu glukosa menjalankan dua putaran? Jelaskan peran oksaloasetat serta perbedaan hasil per putaran dan per glukosa."
      cetak={{
        judul: 'Lembar Hasil Aktivitas 1.9 (Siklus Krebs)',
        jawaban: BAB.map(({ k, t }) => ({ k, bagian: t, isi: hasil.jawaban[k]! })),
        poe: poe.map(({ k, isi, p }) => ({
          k,
          tebakan: isi.zat[p.tebakan],
          awal: isi.alasan[p.alasan],
          akhir: isi.alasan[p.penjelasan!],
        })),
        tabel: <Tabel />,
      }}
      rute={{ episode: '/episode/3', lanjut: '/peta-materi' }}
      narasi={{
        id: 'e3-hasil',
        teks: 'Ini roda siklus Krebsmu. Bandingkan tebakan dengan pengamatan. Jelaskan mengapa dua asetil KoA menghasilkan dua putaran, dengan oksaloasetat terbentuk kembali.',
      }}
    />
  )
}
