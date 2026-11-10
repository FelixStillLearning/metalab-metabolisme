// Peta penutup Episode 1: empat tahap respirasi aerob di jalur kertas B09. Status simpul ditulis
// tetap untuk akhir Episode 1 (belum membaca progres tersimpan). Dua asam piruvat berangkat
// dari simpul glikolisis menuju mitokondria di simpul berikutnya.
import { useState } from 'react'
import { Link } from 'react-router'
import gambarBintang from '../../assets/images/efek-bintang-sorot.webp'
import gambarLatar from '../../assets/images/latar-peta-penutup-lebar.webp'
import gambarMitokondria from '../../assets/images/organel-mitokondria.webp'
import simpulBelum from '../../assets/images/ui-simpul-tahap.webp'
import simpulMenyala from '../../assets/images/ui-simpul-tahap-menyala.webp'
import simpulSelesai from '../../assets/images/ui-simpul-tahap-selesai.webp'
import PemutarEpisode from '../../features/pemutar-episode/PemutarEpisode'
import { el, label } from '../../features/pemutar-episode/kertas'
import {
  hide,
  obj,
  pasangLatar,
  to,
  wait,
  type Panggung,
} from '../../features/pemutar-episode/mesin'
import { bunyi } from '../../lib/suara'
import { usePemutar } from '../../stores/pemutar'
import { BAB } from './bab'
import { piruvat } from './molekul'
import { say } from './naskah'

const GAMBAR_SIMPUL = { selesai: simpulSelesai, menyala: simpulMenyala, belum: simpulBelum }

// Pusat empat lingkaran kertas di gambar B09 yang digambar 1600 x 900 (jari-jari sekitar 139)
const Y = 396
const TAHAP = [
  { nama: 'Glikolisis', x: 205, status: 'selesai' },
  { nama: 'Dekarboksilasi Oksidatif', x: 602, status: 'menyala' },
  { nama: 'Siklus Krebs', x: 994, status: 'belum' },
  { nama: 'Transpor Elektron', x: 1390, status: 'belum' },
] as const
// Mitokondria C03 di tepi atas simpul 2, di bawah bilah kontrol HP; asam piruvat berhenti di depannya
const MITOKONDRIA = [602, 222] as const

async function penutup(p: Panggung) {
  usePemutar.setState({ bab: BAB.length })
  await pasangLatar(p, gambarLatar, 'peta-penutup')

  // Bintang sorot dibuat lebih dulu agar berada di belakang simpul glikolisis
  const bintang = obj(TAHAP[0].x, Y, p.world)
  bintang.dataset.efek = 'bintang-sorot'
  el('image', { href: gambarBintang, x: -125, y: -125, width: 250, height: 250 }, bintang)
  hide(bintang)

  const simpul = TAHAP.map((t, i) => {
    const g = obj(t.x, Y, p.world)
    g.dataset.simpul = String(i + 1)
    g.dataset.status = t.status
    el('image', { href: GAMBAR_SIMPUL[t.status], x: -80, y: -80, width: 160, height: 160 }, g)
    label(g, 0, 190, t.nama, 26)
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
  bintang._s = 0.5
  bintang._r = -20
  bunyi('muncul')
  await to(bintang, { o: 1, s: 1, r: 0 }, 500, 'letup')
  await say(p, 'e1-penutup-01')

  // Dua asam piruvat keluar dari simpul glikolisis: 3 C + 3 C
  const mito = obj(...MITOKONDRIA, p.world)
  mito.dataset.objek = 'mitokondria'
  el('image', { href: gambarMitokondria, x: -140, y: -70, width: 280, height: 140 }, mito)
  hide(mito)
  mito._s = 0.9
  const pir = [-1, 1].map((sisi) => {
    const r = piruvat(p, TAHAP[0].x, Y)
    hide(r)
    r._s = 0.2
    return Object.assign(r, { sisi })
  })
  bunyi('muncul')
  await Promise.all([
    to(mito, { o: 1, s: 1 }, 600),
    ...pir.map((r) => to(r, { o: 1, s: 0.55, x: TAHAP[0].x + r.sisi * 70, y: 190 }, 600)),
  ])
  await Promise.all([
    say(p, 'e1-penutup-02'),
    (async () => {
      await wait(p, 400)
      bunyi('geser')
      await Promise.all(
        pir.map((r) =>
          to(r, { x: MITOKONDRIA[0] + r.sisi * 62, y: MITOKONDRIA[1] + 8, s: 0.5 }, 1600, 'busur'),
        ),
      )
      bunyi('tempel')
    })(),
  ])
  await say(p, 'e1-penutup-03', { pendamping: '09-melambaikan' })
}

function PenutupEpisode1() {
  const [selesai, setSelesai] = useState(false)
  return (
    <PemutarEpisode
      judul="Glikolisis"
      bab={[...BAB]}
      langsung
      jalankan={async (p) => {
        await penutup(p)
        if (!p.signal.aborted) setSelesai(true)
      }}
    >
      {selesai && (
        <div className="pemutar-akhir">
          <Link to="/episode/2" className="tombol-utama" onClick={() => bunyi('melesat')}>
            Lanjut ke Episode 2
          </Link>
          <Link to="/peta-materi" className="tombol-utama" onClick={() => bunyi('kembali')}>
            Ke peta materi
          </Link>
        </div>
      )}
    </PemutarEpisode>
  )
}

export default PenutupEpisode1
