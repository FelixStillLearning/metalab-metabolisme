import type { CSSProperties, ReactNode } from 'react'
import { Navigate } from 'react-router'
import gambarGlukosa from '../../assets/images/glukosa.webp'
import gambarPgal from '../../assets/images/molekul-pgal.webp'
import gambarPiruvat from '../../assets/images/molekul-piruvat.webp'
import gambarPin from '../../assets/images/interaksi-pin.webp'
import LembarHasil from '../../features/lembar-hasil/LembarHasil'
import { useJawaban, type ButirJawaban, type Jawaban } from '../../stores/jawaban'
import { BAB } from './bab'
import { NASKAH } from './naskah'
import { ALASAN_C } from './soalC'
import { ALASAN_E } from './soalE'

// Jawaban singkat di bagan, seperti PIN prototype. Video baru berlanjut setelah jawaban benar,
// jadi teks pin tetap; pin hanya tampil untuk butir yang ada di hasil tersimpan.
const PIN: Record<ButirJawaban, string[]> = {
  a: ['Glukosa, 6 atom C'],
  b: ['2 fase: investasi energi', 'lalu pembentukan energi'],
  c: ['2 ATP dipakai: glukosa dapat', '2 fosfat, lalu terbelah'],
  d: ['PGAL menjadi asam piruvat:', '2 NADH, 4 ATP, 2 H₂O'],
  e: ['2 ATP bersih', '4 terbentuk − 2 dipakai'],
  g: ['2 asam piruvat, 2 NADH,', '2 ATP bersih, 2 H₂O'],
  h: ['Glikolisis: glukosa dipecah menjadi 2 asam piruvat di sitosol, tanpa oksigen.'],
}

// Molekul diam memakai gambar Generate: glukosa 6 C (D01), PGAL 3 C + 1 P (D04),
// asam piruvat 3 C (D06)
const mol = (href: string, x: number, y: number, w: number, h: number, data: object) => (
  <image href={href} x={x - w / 2} y={y - h / 2} width={w} height={h} {...data} />
)
const pgal = (x: number, y: number) =>
  mol(gambarPgal, x, y, 130, 88, { 'data-molecule': 'pgal', 'data-karbon': 3, 'data-fosfat': 1 })
const piruvat = (x: number, y: number) =>
  mol(gambarPiruvat, x, y, 130, 73, { 'data-molecule': 'piruvat', 'data-karbon': 3 })

const TERANG = ['var(--color-atp)', 'var(--color-adp)']
const bdg = (x: number, y: number, t: string, fill: string) => (
  <g>
    <rect x={x - 44} y={y - 17} width={88} height={34} rx={3} fill={fill} />
    <text
      x={x}
      y={y + 6}
      textAnchor="middle"
      fontSize={16}
      fontWeight={800}
      style={{ fill: TERANG.includes(fill) ? 'var(--color-paper)' : 'var(--color-ink)' }}
    >
      {t}
    </text>
  </g>
)
const sisi = (y: number, masuk: string, isiMasuk: string, keluar: string, isiKeluar: string) => (
  <>
    <path className="side" d={`M170 ${y} C 260 ${y}, 330 ${y}, 380 ${y + 22}`} />
    <path
      className="side"
      d={`M380 ${y + 22} C 430 ${y + 44}, 500 ${y + 44}, 560 ${y + 44}`}
      markerEnd="url(#dgA)"
    />
    {bdg(120, y, masuk, isiMasuk)}
    {bdg(610, y + 44, keluar, isiKeluar)}
  </>
)

function Bagan({ hasil }: { hasil: Jawaban }) {
  const pin = (k: ButirJawaban, x: number, y: number, tx: number, ty: number) =>
    hasil[k] && (
      <g className="pin" data-pin={k}>
        <path className="lead-line" d={`M${x} ${y} L ${tx - 26} ${ty}`} />
        <image href={gambarPin} x={tx - 19} y={ty - 19} width={38} height={38} />
        <text className="k" x={tx} y={ty + 7} textAnchor="middle">
          {k}
        </text>
        {PIN[k].map((l, i) => (
          <text key={l} className="a" x={tx + 28} y={ty + 6 + i * 21 - (PIN[k].length - 1) * 10}>
            {l}
          </text>
        ))}
      </g>
    )
  const step = (i: number, isi: ReactNode) => (
    <g data-step={i} style={{ '--i': i } as CSSProperties}>
      {isi}
    </g>
  )
  return (
    <>
      <svg
        className="dg"
        viewBox="0 0 1000 900"
        role="img"
        aria-label="Bagan glikolisis dengan jawabanmu"
      >
        <defs>
          <marker
            id="dgA"
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
        {step(
          0,
          <>
            {mol(gambarGlukosa, 380, 92, 160, 160, {
              'data-molecule': 'glukosa',
              'data-karbon': 6,
            })}
            <text className="lbl" x="380" y="178" textAnchor="middle">
              Glukosa · 6 C
            </text>
          </>,
        )}
        {step(
          1,
          <>
            <path className="flow" d="M380 190 V 296" markerEnd="url(#dgA)" />
            {sisi(205, '2 ATP', 'var(--color-atp)', '2 ADP', 'var(--color-adp)')}
          </>,
        )}
        {step(
          2,
          <>
            {pgal(310, 345)}
            {pgal(450, 345)}
            <text className="lbl" x="380" y="405" textAnchor="middle">
              2 PGAL · 3 C
            </text>
          </>,
        )}
        {step(
          3,
          <>
            <path className="flow" d="M380 418 V 640" markerEnd="url(#dgA)" />
            {sisi(440, '2 NAD⁺', '#f3c1b9', '2 NADH', 'var(--color-nad)')}
            {sisi(530, '4 ADP', 'var(--color-adp)', '4 ATP', 'var(--color-atp)')}
            {bdg(610, 625, '2 H₂O', 'var(--color-h2o)')}
          </>,
        )}
        {step(
          4,
          <>
            {piruvat(310, 690)}
            {piruvat(450, 690)}
            <text className="lbl" x="380" y="745" textAnchor="middle">
              2 asam piruvat · 3 C
            </text>
          </>,
        )}
        {step(
          5,
          <>
            <path className="kurung" d="M28 50 h-14 v360 h14 M28 430 h-14 v330 h14" />
            <text className="lbl" transform="translate(48 230) rotate(-90)" textAnchor="middle">
              fase investasi energi
            </text>
            <text className="lbl" transform="translate(48 595) rotate(-90)" textAnchor="middle">
              fase pembentukan energi
            </text>
          </>,
        )}
        {step(
          6,
          <>
            {pin('a', 455, 90, 705, 90)}
            {pin('c', 656, 249, 705, 249)}
            {pin('b', 28, 420, 705, 420)}
            {pin('d', 656, 540, 705, 540)}
            {pin('g', 515, 690, 705, 690)}
          </>,
        )}
        {step(
          7,
          hasil.e && (
            <g className="pin" data-pin="e">
              <image href={gambarPin} x={686} y={771} width={38} height={38} />
              <text className="k" x="705" y="797" textAnchor="middle">
                e
              </text>
              <text className="besar" x="733" y="806">
                {PIN.e[0]}
              </text>
              <text className="a" x="733" y="836">
                {PIN.e[1]}
              </text>
            </g>
          ),
        )}
        {step(
          8,
          hasil.h && (
            <g className="pin" data-pin="h">
              <image href={gambarPin} x={21} y={823} width={38} height={38} />
              <text className="k" x="40" y="849" textAnchor="middle">
                h
              </text>
              <text className="a" x="68" y="848">
                {PIN.h[0]}
              </text>
            </g>
          ),
        )}
      </svg>
      {/* HP: tulisan pin di bagan terlalu kecil, jadi jawabannya juga didaftar di bawah bagan */}
      <ol className="hasil-pin-hp">
        {BAB.filter(({ k }) => hasil[k]).map(({ k }) => (
          <li key={k}>
            <b>{k}</b>
            {k === 'e' ? hasil.e : PIN[k].join(' ')}
          </li>
        ))}
      </ol>
    </>
  )
}

function HasilEpisode1() {
  const hasil = useJawaban((s) => s.hasil)
  const hasilPoe = useJawaban((s) => s.hasilPoe)
  if (!hasil) return <Navigate to="/episode/1" replace />
  const daftarPoe = [
    { k: 'c', q: 'ATP untuk memecah glukosa', alasan: ALASAN_C, p: hasilPoe?.c },
    { k: 'e', q: 'ATP bersih glikolisis', alasan: ALASAN_E, p: hasilPoe?.e },
  ].filter((x) => x.p)
  return (
    <LembarHasil
      judul="Bagan glikolisismu"
      lead="Jawabanmu dari Episode 1 ditampilkan pada bagan glikolisis."
      bagan={<Bagan hasil={hasil} />}
      poe={daftarPoe.map(({ k, q, alasan, p }) => ({
        k,
        q,
        tebakan: p!.tebakan,
        nyata: 2,
        alasan: alasan[p!.penjelasan ?? 1],
      }))}
      pertanyaan="Kenapa glikolisis menghasilkan 2 ATP bersih, bukan 4? Jelaskan dengan katamu."
      cetak={{
        judul: 'Lembar Hasil Aktivitas 1.7 (Glikolisis)',
        jawaban: BAB.map(({ k, t }) => ({ k, bagian: t, isi: hasil[k] ?? '' })),
        poe: daftarPoe.map(({ k, alasan, p }) => ({
          k,
          tebakan: p!.tebakan,
          awal: alasan[p!.alasan],
          akhir: alasan[p!.penjelasan ?? 1],
        })),
      }}
      rute={{ episode: '/episode/1', lanjut: '/episode/1/penutup' }}
      narasi={{ id: 'e1-hasil-01', teks: NASKAH['e1-hasil-01'].teks }}
    />
  )
}

export default HasilEpisode1
