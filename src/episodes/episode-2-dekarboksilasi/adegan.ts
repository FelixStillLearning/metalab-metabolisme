import matriks from '../../assets/images/latar-matriks-lebar.webp'
import mitokondria from '../../assets/images/mitokondria-zoom.webp'
import gambarCo2 from '../../assets/images/molekul-co2.webp'
import gambarO2 from '../../assets/images/molekul-o2.webp'
import gambarKoenzimA from '../../assets/images/molekul-koa.webp'
import gambarKoa from '../../assets/images/molekul-asetil-koa.webp'
import gambarAtp from '../../assets/images/pembawa-atp.webp'
import gambarNad from '../../assets/images/pembawa-nad.webp'
import gambarNadh from '../../assets/images/pembawa-nadh.webp'
import gambarFad from '../../assets/images/pembawa-fad.webp'
import gambarFadh from '../../assets/images/pembawa-fadh2.webp'
import gambarAdp from '../../assets/images/pembawa-adp.webp'
import { cut, el, hapusBentuk, label, strip } from '../../features/pemutar-episode/kertas'
import {
  camTo,
  hide,
  obj,
  pasangLatar,
  teks,
  to,
  type Objek,
  type Panggung,
} from '../../features/pemutar-episode/mesin'
import { mintaKetukSemua, mintaPilihan } from '../../features/pemutar-episode/pilihan'
import {
  mintaJelaskan,
  mintaTebak,
  tandaiAmati,
  tampilkanAmati,
} from '../../features/pemutar-episode/poe'
import { mintaLengkapi } from '../../features/pemutar-episode/kalimat'
import { bunyi, siapkan } from '../../lib/suara'
import { usePemutar } from '../../stores/pemutar'
import { useJawabanE2 } from '../../stores/jawaban-episode-2'
import { badge, elektron, glukosa, relabel } from '../episode-1-glikolisis/molekul'
import { BAB, POE, POTONGAN, RUMPANG, type PoeE2 } from './isi'
import { koa, piruvat, type Piruvat } from './molekul'
import { say } from './naskah'

function gambar(parent: Element, href: string, x: number, y: number, w: number, h: number) {
  const g = obj(x, y, parent)
  el('image', { href, x: -w / 2, y: -h / 2, width: w, height: h }, g)
  return g
}

async function pembuka(p: Panggung) {
  const mito = gambar(p.world, mitokondria, 800, 450, 1200, 600)
  mito.dataset.objek = 'mitokondria-zoom'
  label(mito, -32, -56, 'Matriks mitokondria', 24)
  bunyi('muncul')
  await to(hide(mito), { o: 1 }, 600)
  await say(p, 'pembuka', '01-ramah')
  bunyi('geser')
  // Jangkar matriks sumber C04: (840, 360) pada gambar bersih 1774 × 887.
  await camTo(p, 800 + ((840 - 887) * 1200) / 1774, 450 + ((360 - 443.5) * 600) / 887, 4.2, 1800)
  await pasangLatar(p, matriks, 'matriks')
  mito.remove()
  await to(p.cam, { x: 0, y: 0, s: 1 }, 0)
  const tempat = label(p.latar, 800, 160, 'MATRIKS MITOKONDRIA · AEROB', 24)
  tempat.dataset.objek = 'label-matriks'
}

async function tempatkan(m: Piruvat, x: number, y: number, s = 1, ms = 700) {
  await Promise.all([
    to(m.asetil, { x, y, s }, ms),
    to(m.karboksil, { x: x + 75 * s, y: y + 12 * s, s }, ms),
  ])
}

function konteksAerob(p: Panggung) {
  const g = obj(1180, 410, p.fx)
  g.dataset.objek = 'konteks-aerob'
  const isi = el('g', { class: 'e2-konteks-isi' }, g)
  cut(
    isi,
    [
      [-270, -120],
      [270, -120],
      [270, 120],
      [-270, 120],
    ],
    'var(--color-paper)',
    {},
    1,
    { bayangan: true },
  )
  gambar(isi, gambarO2, -170, -30, 130, 65)
  teks(isi, 60, -55, 'Respirasi aerob', 28, 'var(--color-ink)')
  teks(isi, 60, -10, 'O₂ dipakai pada', 24, 'var(--color-ink)')
  teks(isi, 60, 25, 'transpor elektron', 24, 'var(--color-ink)')
  teks(isi, 0, 85, 'Tidak dikonsumsi langsung di sini.', 24, 'var(--color-ink)')
  return g
}

async function tampilkanTahap(p: Panggung) {
  label(p.fx, 1100, 240, 'Urutan perubahan piruvat', 26)
  const tahap = [
    { gambar: gambarCo2, nama: '1 · Lepas CO₂' },
    { gambar: gambarNadh, nama: '2 · Bentuk NADH' },
    { gambar: gambarKoenzimA, nama: '3 · Ikat KoA' },
  ]
  for (const [i, isi] of tahap.entries()) {
    const g = obj(820 + i * 280, 445, p.fx)
    g.dataset.ikhtisarTahap = String(i + 1)
    cut(
      g,
      [
        [-120, -105],
        [120, -105],
        [120, 105],
        [-120, 105],
      ],
      'var(--color-paper)',
      {},
      1,
      { bayangan: true },
    )
    gambar(g, isi.gambar, 0, -25, 160, 80)
    teks(g, 0, 75, isi.nama, 24, 'var(--color-ink)')
    bunyi('muncul')
    await to(hide(g), { o: 1, y: 415 }, 500, 'pose')
  }
}

async function bahan(p: Panggung) {
  usePemutar.setState({ bab: 0 })
  const pir = piruvat(p, 800, 350)
  const glu = glukosa(p, 350, 470)
  const co2 = gambar(p.world, gambarCo2, 1250, 450, 200, 100)
  label(co2, 0, 90, 'CO₂', 22)
  await say(p, 'bahan')
  await mintaPilihan(
    p.signal,
    {
      judul: 'Ketuk bahan awal dekarboksilasi oksidatif.',
      opsi: [
        { teks: 'Asam piruvat (3 C)', posisi: [800, 390], ukuran: [300, 200] },
        { teks: 'Glukosa (6 C)', posisi: [350, 510], ukuran: [300, 330] },
        { teks: 'CO₂', posisi: [1250, 470], ukuran: [260, 200] },
      ],
    },
    0,
    (i) => {
      usePemutar.setState({
        kalimat:
          i === 1
            ? 'Glukosa sudah dipecah pada glikolisis. Hasilnya, dua asam piruvat, masuk ke tahap ini.'
            : 'CO₂ adalah hasil buangan tahap ini, bukan substratnya.',
      })
    },
  )
  await Promise.all([to(glu, { o: 0, x: 150 }, 500), to(co2, { o: 0, x: 1450 }, 500)])
  glu.remove()
  co2.remove()
  bunyi('muncul')
  await tempatkan(pir, 800, 350, 1.3, 400)
  const kedua = piruvat(p, 1700, 530)
  const molekul = [pir, kedua]
  bunyi('geser')
  await Promise.all(molekul.map((m, i) => tempatkan(m, 430, 330 + i * 200, 1.15, 900)))
  const jumlah = obj(430, 270, p.fx)
  jumlah.dataset.objek = 'jumlah-piruvat'
  label(jumlah, 0, 0, '2 piruvat · 6 C', 26)
  await say(p, 'substrat-terpilih', '08-menunjuk')
  const aerob = konteksAerob(p)
  bunyi('muncul')
  await to(hide(aerob), { o: 1 }, 500)
  await say(p, 'aerob')
  await mintaPilihan(
    p.signal,
    {
      judul: 'Dalam suasana apa tahap ini berlangsung?',
      opsi: ['Ada oksigen (aerob)', 'Tanpa oksigen (anaerob)'].map((teks) => ({ teks })),
    },
    0,
    () => {
      usePemutar.setState({
        kalimat:
          'Tahap ini merupakan bagian respirasi aerob. O₂ tidak dipakai langsung di sini; O₂ diperlukan pada transpor elektron agar respirasi dapat berlanjut.',
      })
    },
  )
  useJawabanE2.getState().catat('a')
  await to(aerob, { o: 0 }, 350)
  aerob.remove()
  usePemutar.setState({ bab: 1 })
  await say(p, 'jumlah-tahap')
  await mintaPilihan(
    p.signal,
    {
      judul: 'Ada berapa tahap utama dekarboksilasi oksidatif?',
      opsi: ['2 tahap', '3 tahap', '4 tahap'].map((teks) => ({ teks })),
    },
    1,
    (i) => {
      usePemutar.setState({
        kalimat:
          i === 0
            ? 'Buku meringkas menjadi 2 karena oksidasi digabung dengan pelepasan karboksil. Di sini kita mengamati tiga tahap secara terpisah.'
            : 'Urutannya: lepas karboksil, oksidasi, lalu ikat KoA.',
      })
    },
  )
  useJawabanE2.getState().catat('b')
  await Promise.all([say(p, 'tahap'), tampilkanTahap(p)])
  await Promise.all(molekul.map((m, i) => tempatkan(m, 400, 400 + i * 190)))
  p.fx.replaceChildren()
  return molekul
}

async function poe(p: Panggung, k: PoeE2, amati: (pilihan: number) => Promise<void>) {
  const isi = POE[k]
  const pilihan = await mintaTebak(p.signal, {
    judul: isi.judul,
    reasons: isi.alasan,
    right: 0,
    zat: isi.zat.map((teks, i) => ({
      teks,
      gambar: (k === 'c' ? [gambarCo2, gambarO2] : [gambarNad, gambarFad, gambarAdp])[i],
    })),
    zone: {
      x: 410,
      y: 510,
      w: 400,
      h: 500,
      name: k === 'c' ? 'karbon yang keluar' : 'gugus asetil',
    },
    supply: [
      [850, 320],
      [850, 440],
      [850, 560],
    ],
    slot: () => [410, 330],
  })
  tampilkanAmati(isi.zat[pilihan.g])
  await amati(pilihan.g)
  tandaiAmati(
    pilihan.g === 0 ? 'benar' : 'salah',
    pilihan.g === 0
      ? undefined
      : k === 'c'
        ? 'Yang lepas: 1 C + 2 O = CO₂.'
        : 'Penangkap elektron di sini: NAD⁺.',
  )
  const penjelasan = await mintaJelaskan(p.signal, {
    ...pilihan,
    unit: '',
    zat: isi.zat,
    reasons: isi.alasan,
    back: isi.balik,
    right: 0,
    alasanBenar: 1,
    hasil: isi.hasil,
  })
  useJawabanE2.getState().catatPoe(k, { tebakan: pilihan.g, alasan: pilihan.r, penjelasan })
  useJawabanE2.getState().catat(k)
}

async function lepas(p: Panggung, molekul: Piruvat[]) {
  usePemutar.setState({ bab: 2 })
  label(p.fx, 450, 210, '1 · Lepas karboksil', 24).dataset.objek = 'judul-tahap'
  await say(p, 'karboksil', '04-penasaran')
  await poe(p, 'c', async (pilihan) => {
    bunyi('belah')
    for (const m of molekul) {
      hapusBentuk(m.ikatan)
      m.karboksil.dataset.molecule = 'co2'
      m.nama.remove()
      m.nama = label(m.asetil, -32, 92, 'Gugus asetil · 2 C', 20)
      label(m.karboksil, 0, 78, 'CO₂ · 1 C', 20)
    }
    await Promise.all(
      molekul.map((m, i) => to(m.karboksil, { x: 740, y: 340 + i * 200 }, 1100, 'busur')),
    )
    if (pilihan === 2) await say(p, 'energi')
    if (pilihan === 1) await say(p, 'oksigen')
    await say(p, 'lepas')
  })
  p.fx.replaceChildren()
  bunyi('geser')
  await Promise.all(molekul.map((m, i) => to(m.karboksil, { x: 1180, y: 310 + i * 160 }, 800)))
}

async function oksidasi(p: Panggung, molekul: Piruvat[]) {
  usePemutar.setState({ bab: 3 })
  label(p.fx, 450, 210, '2 · Oksidasi → NADH', 24).dataset.objek = 'judul-tahap'
  await say(p, 'oksidasi', '04-penasaran')
  const nadh: ReturnType<typeof badge>[] = []
  await poe(p, 'b·2', async (pilihan) => {
    // Dua elektron per gugus, dibawa satu NAD⁺.
    const elektronKeluar = molekul.map((m) =>
      [-1, 1].map((sisi) => elektron(p.world, m.asetil._x + sisi * 22, m.asetil._y - 60)),
    )
    if (pilihan !== 0) {
      const salah = gambar(p.world, pilihan === 1 ? gambarFad : gambarAdp, 800, 300, 128, 52)
      await to(salah, { x: 600, y: 310 }, 600)
      await say(p, pilihan === 1 ? 'fad' : 'adp')
      await to(salah, { o: 0 }, 300)
      salah.remove()
    }
    nadh.push(...molekul.map((m) => badge(p, 800, m.asetil._y, 'NAD⁺')))
    bunyi('geser')
    await Promise.all(nadh.map((n, i) => to(n, { x: 640, y: molekul[i].asetil._y - 60 }, 700)))
    await Promise.all(
      elektronKeluar.flatMap((pasangan, i) =>
        pasangan.map((e) => to(e, { x: nadh[i]._x, y: nadh[i]._y, o: 0 }, 600)),
      ),
    )
    elektronKeluar.flat().forEach((e) => e.remove())
    nadh.forEach((n) => relabel(n, 'NADH'))
    bunyi('tempel')
    await say(p, 'nad')
    await Promise.all(nadh.map((n, i) => to(n, { x: 1420, y: 340 + i * 160 }, 700)))
  })
  p.fx.replaceChildren()
  return nadh
}

async function ikat(p: Panggung, molekul: Piruvat[]) {
  usePemutar.setState({ bab: 4 })
  label(p.fx, 800, 220, '3 · Ikat koenzim A', 26).dataset.objek = 'judul-tahap'
  const koas = molekul.map((m) => koa(p, 850, m.asetil._y))
  await say(p, 'koa', '08-menunjuk')
  await mintaKetukSemua(
    p.signal,
    'Ketuk tiap KoA untuk mengikat gugus asetil.',
    koas.map((g, i) => ({ teks: `KoA ${i + 1}`, posisi: [g._x, g._y], ukuran: [190, 100] })),
    async (i) => {
      const m = molekul[i]
      const k = koas[i]
      await to(k, { x: m.asetil._x + 110 }, 700)
      strip(m.asetil, 0, -12, 55, 0, 8, 'var(--color-paper)')
      bunyi('tempel')
      m.asetil.dataset.molecule = 'asetil-koa'
      m.nama.remove()
      m.nama = label(m.asetil, 20, 92, 'Asetil KoA · 2 C', 20)
    },
  )
  useJawabanE2.getState().catat('d')
  await say(p, 'terikat')
  p.fx.replaceChildren()
  return koas
}

async function hasil(p: Panggung, molekul: Piruvat[], koas: Objek[], nadh: Objek[]) {
  usePemutar.setState({ bab: 5 })
  for (const g of [...molekul.flatMap((m) => [m.asetil, m.karboksil]), ...koas, ...nadh]) g.remove()
  await say(p, 'hasil')
  const items = [
    { teks: '2 asetil KoA', gambar: gambarKoa },
    { teks: '2 ATP', gambar: gambarAtp },
    { teks: '2 NADH', gambar: gambarNadh },
    { teks: '2 FADH₂', gambar: gambarFadh },
    { teks: '2 CO₂', gambar: gambarCo2 },
  ]
  const chips = items.map((item, i) => {
    const g = gambar(p.fx, item.gambar, 280 + i * 260, 450, 180, 90)
    label(g, 0, 80, item.teks, 22)
    return g
  })
  let got = 0
  await mintaKetukSemua(
    p.signal,
    'Ketuk semua hasil dekarboksilasi oksidatif.',
    items.map((item, i) => ({ teks: item.teks, posisi: [chips[i]._x, 480], ukuran: [230, 200] })),
    async (i) => {
      const x = 500 + got++ * 300
      await to(chips[i], { x, y: 300 }, 600)
      bunyi('tempel')
    },
    {
      indeks: [1, 3],
      salah: (i) => {
        usePemutar.setState({
          kalimat:
            i === 1
              ? 'Tidak ada ATP yang dibentuk langsung pada tahap ini. Elektron berenergi tinggi dibawa NADH.'
              : 'FADH₂ terbentuk di siklus Krebs. Di sini terbentuk NADH.',
        })
      },
    },
  )
  p.fx.replaceChildren()
  p.world.append(...molekul.flatMap((m) => [m.asetil, m.karboksil]), ...koas)
  await Promise.all(
    molekul.flatMap((m, i) => [
      to(m.asetil, { x: 500, y: 340 + i * 200 }, 600),
      to(koas[i], { x: 610, y: 340 + i * 200 }, 600),
      to(m.karboksil, { x: 1000, y: 340 + i * 200 }, 600),
    ]),
  )
  const counter = label(p.fx, 800, 680, 'Karbon terhitung: 0 dari 6', 28)
  const count = counter.querySelector('text')!
  await say(p, 'karbon', '08-menunjuk')
  let karbon = 0
  const groups = [...molekul.map((m) => m.asetil), ...molekul.map((m) => m.karboksil)]
  await mintaKetukSemua(
    p.signal,
    'Ketuk tiap molekul untuk menghitung karbon asal piruvat.',
    groups.map((g, i) => ({
      teks: i < 2 ? `Asetil KoA ${i + 1}, 2 karbon` : `CO₂ ${i - 1}, 1 karbon`,
      posisi: [g._x, g._y + 35],
      ukuran: [300, 170],
    })),
    async (i) => {
      karbon += i < 2 ? 2 : 1
      count.textContent = `Karbon terhitung: ${karbon} dari 6`
      await to(groups[i], { s: 1.12 }, 200)
      await to(groups[i], { s: 1 }, 200)
    },
  )
  count.textContent = 'Karbon: 6 = 4 + 2'
  useJawabanE2.getState().catat('f')
  await say(p, 'total', '07-bangga')
  p.fx.replaceChildren()
}

export async function episode(p: Panggung) {
  siapkan('geser', 'tempel', 'muncul', 'belah', 'selesai')
  useJawabanE2.getState().mulai()
  await pembuka(p)
  const molekul = await bahan(p)
  await lepas(p, molekul)
  const nadh = await oksidasi(p, molekul)
  const koas = await ikat(p, molekul)
  await hasil(p, molekul, koas, nadh)
  usePemutar.setState({ bab: 6 })
  await say(p, 'pengertian', '04-penasaran')
  await mintaLengkapi(p.signal, 'Lengkapi pengertian dekarboksilasi oksidatif', POTONGAN, RUMPANG)
  useJawabanE2.getState().catat('g')
  await say(p, 'selesai', '07-bangga')
  usePemutar.setState({ bab: BAB.length, kalimat: '' })
  return useJawabanE2.getState().selesaikan()
}
