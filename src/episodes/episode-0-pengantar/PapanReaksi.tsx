import foto from '../../assets/images/molekul-reaksi-fotosintesis.webp'
import respirasi from '../../assets/images/molekul-reaksi-respirasi.webp'
import cahaya from '../../assets/images/energi-cahaya.webp'
import kosong from '../../assets/images/energi-kosong.webp'
import kimia from '../../assets/images/energi-kimia.webp'
import { useAdeganE0 } from './adegan'
import { SOAL, reaksi } from './isi'

export default function PapanReaksi() {
  const { soal, terjawab } = useAdeganE0()
  if (soal < 0 || soal >= 6) return null
  const a = soal < 3,
    r = reaksi[a ? 'a' : 'b']
  const energi = a ? soal > 1 || (soal === 1 && terjawab) : soal > 4 || (soal === 4 && terjawab)
  const rumus = (sisi: typeof r.bahan) =>
    sisi.map((m) => `${m.jumlah === 1 ? '' : `${m.jumlah} `}${m.rumus}`).join(' + ')
  return (
    <section
      className="e0-reaksi"
      aria-label={`Reaksi (${a ? 'a' : 'b'})`}
      data-reaksi={a ? 'a' : 'b'}
    >
      <div className="e0-judul-reaksi">
        <span>Reaksi ({a ? 'a' : 'b'})</span>
        <b>
          {soal > (a ? 0 : 3) || terjawab
            ? a
              ? 'Fotosintesis · Anabolisme'
              : 'Respirasi aerob · Katabolisme'
            : 'Amati bahan dan hasilnya'}
        </b>
      </div>
      <div className="e0-energi">
        <img src={a ? (energi ? cahaya : kosong) : kimia} alt="" />
        <span>
          {a
            ? energi
              ? 'Cahaya (foton) masuk'
              : '? energi masuk'
            : energi
              ? 'Energi kimia → ATP'
              : 'Energi dihasilkan'}
        </span>
      </div>
      <img
        key={a ? 'a' : 'b'}
        className="e0-papan-molekul"
        src={a ? foto : respirasi}
        alt={
          a
            ? 'Enam CO₂ dan enam H₂O menjadi satu glukosa dengan enam C serta enam O₂.'
            : 'Satu glukosa dengan enam C dan enam O₂ menjadi enam CO₂ dan enam H₂O; energi disimpan dalam ATP.'
        }
      />
      <div className="e0-persamaan">
        <span>{rumus(r.bahan)}</span>
        <b aria-label="menjadi">→</b>
        <span>{rumus(r.hasil)}</span>
      </div>
      {!((soal === 2 || soal === 5) && terjawab) && (
        <small className="e0-catatan-atom">Model glukosa: rangka 6 C · rumus C₆H₁₂O₆</small>
      )}
      {(soal === 2 || soal === 5) && terjawab && (
        <p className="e0-kesimpulan">
          {a ? 'MENYUSUN · MEMERLUKAN ENERGI' : 'MENGURAIKAN · MELEPASKAN ENERGI'}
          <small>{a ? 'Endergonik' : 'Eksergonik'} · dengan bantuan enzim</small>
        </p>
      )}
      <span className="sr-only">
        {SOAL[soal].t}. Jumlah atom tiap sisi: 6 C, 12 H, 18 O. Glukosa digambarkan sebagai model
        enam C; rumusnya C₆H₁₂O₆.
      </span>
    </section>
  )
}
