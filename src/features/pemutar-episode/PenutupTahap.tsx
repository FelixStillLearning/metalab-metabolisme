import { useState } from 'react'
import { Link } from 'react-router'
import latar from '../../assets/images/latar-peta-penutup-lebar.webp'
import mitokondria from '../../assets/images/organel-mitokondria.webp'
import bintang from '../../assets/images/efek-bintang-sorot.webp'
import asetilKoa from '../../assets/images/molekul-asetil-koa.webp'
import nadh from '../../assets/images/pembawa-nadh.webp'
import fadh2 from '../../assets/images/pembawa-fadh2.webp'
import simpulBelum from '../../assets/images/ui-simpul-tahap.webp'
import simpulMenyala from '../../assets/images/ui-simpul-tahap-menyala.webp'
import simpulSelesai from '../../assets/images/ui-simpul-tahap-selesai.webp'
import PemutarEpisode from './PemutarEpisode'
import { el, label } from './kertas'
import { hide, obj, pasangLatar, to, wait, type Panggung } from './mesin'
import { ucapKalimat } from './ucapKalimat'
import { bunyi } from '../../lib/suara'

const Y = 396
const X = [205, 602, 994, 1390]
const NAMA = ['Glikolisis', 'Dekarboksilasi Oksidatif', 'Siklus Krebs', 'Transpor Elektron']
const BAB = NAMA.map((t, i) => ({ k: String(i + 1), t }))
const GAMBAR = { selesai: simpulSelesai, menyala: simpulMenyala, belum: simpulBelum }

type Episode = 2 | 3 | 4
const TUJUAN: Record<Episode, string> = { 2: '/episode/3', 3: '/episode/4', 4: '/peta-materi' }
const JUDUL: Record<Episode, string> = {
  2: 'Dekarboksilasi oksidatif selesai',
  3: 'Siklus Krebs selesai',
  4: 'Respirasi aerob selesai',
}
const NARASI: Record<Episode, string> = {
  2: 'Dua asetil KoA bergerak menuju siklus Krebs. Di sana, tiap gugus asetil menjalani satu putaran.',
  3: 'Siklus Krebs menghasilkan pembawa elektron NADH dan FADH₂. Keduanya meneruskan elektron ke transpor elektron.',
  4: 'Transpor elektron menyelesaikan rangkaian respirasi aerob. Energi dari pembawa elektron membantu membentuk ATP.',
}

async function jalankan(p: Panggung, episode: Episode) {
  const aktif = episode - 1
  await pasangLatar(p, latar, 'peta-penutup')
  const sorot = obj(X[aktif], Y, p.world)
  sorot.dataset.efek = 'bintang-sorot'
  el('image', { href: bintang, x: -125, y: -125, width: 250, height: 250 }, sorot)
  hide(sorot)
  const simpul = X.map((x, i) => {
    const status = i <= aktif ? 'selesai' : i === aktif + 1 ? 'menyala' : 'belum'
    const g = obj(x, Y, p.world)
    g.dataset.simpul = String(i + 1)
    g.dataset.status = status
    el('image', { href: GAMBAR[status], x: -80, y: -80, width: 160, height: 160 }, g)
    label(g, 0, 190, NAMA[i], 26)
    hide(g)
    g._s = 0.85
    return g
  })
  for (const g of simpul) {
    bunyi('muncul')
    void to(g, { o: 1, s: 1 }, 500)
    await wait(p, 160)
  }
  await wait(p, 500)
  sorot._s = 0.5
  sorot._r = -20
  bunyi('muncul')
  await to(sorot, { o: 1, s: 1, r: 0 }, 500, 'letup')
  await ucapKalimat(p, `e${episode}-penutup-selesai`, {
    teks: `${NAMA[aktif]} selesai.`,
    pose: '07-bangga',
  })

  if (episode === 2 || episode === 3) {
    const mito = obj(X[aktif + 1], 222, p.world)
    mito.dataset.objek = 'mitokondria'
    el('image', { href: mitokondria, x: -140, y: -70, width: 280, height: 140 }, mito)
    hide(mito)
    const produk =
      episode === 2
        ? [-1, 1].map((s) => ({
            g: obj(X[aktif] + s * 85, 190, p.world),
            src: asetilKoa,
            x: X[aktif + 1] + s * 85,
          }))
        : [
            { g: obj(X[aktif] - 85, 190, p.world), src: nadh, x: X[aktif + 1] - 85 },
            { g: obj(X[aktif] + 85, 190, p.world), src: fadh2, x: X[aktif + 1] + 85 },
          ]
    produk.forEach(({ g, src }, i) => {
      g.dataset.objek = episode === 2 ? `produk-asetil-koa-${i + 1}` : `produk-pembawa-${i + 1}`
      el('image', { href: src, x: -68, y: -32, width: 136, height: 64 }, g)
      hide(g)
      g._s = 0.65
    })
    bunyi('muncul')
    await Promise.all([
      to(mito, { o: 1 }, 600),
      ...produk.map(({ g }) => to(g, { o: 1, s: 1 }, 600)),
    ])
    await Promise.all([
      ucapKalimat(p, `e${episode}-penutup`, { teks: NARASI[episode], pose: '05-menjelaskan' }),
      (async () => {
        await wait(p, 400)
        bunyi('geser')
        await Promise.all(produk.map(({ g, x }) => to(g, { x, y: 230 }, 1600, 'busur')))
        bunyi('tempel')
      })(),
    ])
  } else {
    await ucapKalimat(p, 'e4-penutup', { teks: NARASI[4], pose: '07-bangga' })
  }
  await ucapKalimat(p, `e${episode}-penutup-akhir`, {
    teks:
      episode === 4
        ? 'Seluruh tahap respirasi aerob telah selesai.'
        : 'Produk tahap ini siap melanjutkan perjalanan.',
    pose: '09-melambaikan',
  })
}

export default function PenutupTahap({ episode }: { episode: Episode }) {
  const [selesai, setSelesai] = useState(false)
  return (
    <PemutarEpisode
      judul={JUDUL[episode]}
      bab={BAB}
      langsung
      jalankan={async (p) => {
        await jalankan(p, episode)
        if (!p.signal.aborted) setSelesai(true)
      }}
    >
      {selesai && (
        <div className="pemutar-akhir">
          <Link to={TUJUAN[episode]} className="tombol-utama" onClick={() => bunyi('melesat')}>
            {episode === 4 ? 'Ke peta materi' : `Lanjut ke Episode ${episode + 1}`}
          </Link>
          {episode !== 4 && (
            <Link to="/peta-materi" className="tombol-utama" onClick={() => bunyi('kembali')}>
              Ke peta materi
            </Link>
          )}
        </div>
      )}
    </PemutarEpisode>
  )
}
