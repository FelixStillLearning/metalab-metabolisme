import { Navigate } from 'react-router'
import LembarHasil from '../../features/lembar-hasil/LembarHasil'
import { useJawabanE0, lengkap, type RekamE0 } from '../../stores/jawaban-episode-0'
import { SOAL, TABEL } from './isi'
import './episode-0.css'

function Tabel({ hasil }: { hasil: RekamE0 }) {
  return (
    <table className="e0-tabel-hasil">
      <caption>Aktivitas 1.6 · Perbandingan anabolisme dan katabolisme</caption>
      <thead>
        <tr>
          <th scope="col">Variabel</th>
          <th scope="col">Anabolisme</th>
          <th scope="col">Katabolisme</th>
        </tr>
      </thead>
      <tbody>
        {TABEL.map((r) => (
          <tr key={r.k}>
            <th scope="row">{r.judul}</th>
            <td>{hasil.tabel[r.k]?.[0]}</td>
            <td>{hasil.tabel[r.k]?.[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function HasilEpisode0() {
  const { hasil, penjelasan, simpanPenjelasan } = useJawabanE0()
  if (!lengkap(hasil)) return <Navigate to="/episode/0" replace />
  return (
    <div className="episode-0-hasil">
      <LembarHasil
        label="Episode 0 · Pengantar metabolisme"
        judul="Bagan metabolismemu"
        lead="Dua reaksi metabolisme dan perbandingan yang sudah kamu lengkapi."
        penjelasan={penjelasan}
        simpanPenjelasan={simpanPenjelasan}
        bagan={
          <div className="e0-rangkuman-hasil">
            {(['a', 'b'] as const).map((r, i) => (
              <section key={r} className="e0-reaksi-hasil">
                <h2>
                  Reaksi ({r}) · {i === 0 ? 'Fotosintesis' : 'Respirasi aerob'}
                </h2>
                <p className="e0-rumus-hasil">
                  {i === 0 ? '6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂' : 'C₆H₁₂O₆ + 6 O₂ → 6 CO₂ + 6 H₂O'}
                </p>
                <p>
                  {i === 0
                    ? 'Energi cahaya masuk · Anabolisme'
                    : 'Energi kimia ATP dihasilkan · Katabolisme'}
                </p>
                <dl>
                  {SOAL.slice(i * 3, i * 3 + 3).map((s) => (
                    <div key={s.k}>
                      <dt>{s.k.replace('1.5', '1.5 ')}</dt>
                      <dd>{hasil.jawaban[s.k]}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
            <Tabel hasil={hasil} />
          </div>
        }
        poe={[]}
        pertanyaan="Apa hubungan bahan dan hasil pada reaksi (a) dan reaksi (b)? Jelaskan dengan katamu."
        cetak={{
          judul: 'Lembar Hasil Aktivitas 1.5 dan 1.6 (Pengantar metabolisme)',
          jawaban: SOAL.map((s) => ({
            k: s.k.replace('1.5', '1.5 '),
            bagian: s.t,
            isi: hasil.jawaban[s.k] ?? '',
          })),
          poe: [],
          tabel: <Tabel hasil={hasil} />,
        }}
        rute={{ episode: '/episode/0', lanjut: '/episode/1' }}
        narasi={{
          id: 'e0-hasil-01',
          teks: 'Ini rangkuman dua reaksi dan tabel perbandinganmu. Kamu bisa menulis penjelasanmu, mencetak hasil, atau melanjutkan ke glikolisis.',
        }}
      />
    </div>
  )
}
