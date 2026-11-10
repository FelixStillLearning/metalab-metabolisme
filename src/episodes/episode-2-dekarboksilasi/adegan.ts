import matriks from '../../assets/images/latar-matriks-lebar.webp'
import mitokondria from '../../assets/images/mitokondria-zoom.webp'
import panelZoom from '../../assets/images/organel-panel-zoom.webp'
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
  arc,
  burstBehind,
  camTo,
  comic,
  hide,
  obj,
  pasangLatar,
  shake,
  speedLines,
  teks,
  to,
  wait,
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

function jalur(p: Panggung, dari: string, tujuan: string, x1: number, x2: number, tinggi = 360) {
  const g = obj(0, 0, p.world)
  g.dataset.jalurReaksi = ''
  for (const x of [x1, x2])
    el(
      'rect',
      {
        x: x - 180,
        y: 280,
        width: 360,
        height: tinggi,
        rx: 18,
        fill: 'none',
        stroke: 'var(--color-paper)',
        'stroke-width': 4,
        'stroke-dasharray': '10 12',
      },
      g,
    )
  label(g, x1, 215, dari, 22).dataset.judulJalur = 'asal'
  label(g, x2, 215, tujuan, 22)
  el(
    'path',
    {
      d: `M${x1 + 195} 470 H${x2 - 195} m-18 -12 l18 12 -18 12`,
      fill: 'none',
      stroke: 'var(--color-paper)',
      'stroke-width': 6,
      'stroke-linecap': 'round',
    },
    g,
  )
  return g
}

async function pembuka(p: Panggung) {
  const mito = gambar(p.world, mitokondria, 800, 450, 1200, 600)
  mito.dataset.objek = 'mitokondria-zoom'
  label(mito, 0, -320, 'Matriks mitokondria', 24)
  bunyi('muncul')
  await to(hide(mito), { o: 1 }, 600)
  const masuk = [piruvat(p, -180, 360), piruvat(p, -180, 540)]
  label(p.fx, 260, 190, 'Dari sitosol', 24)
  bunyi('geser')
  await Promise.all(masuk.map((m, i) => tempatkan(m, 700 + i * 180, 360 + i * 80, 0.65, 1400)))
  await say(p, 'pembuka', '01-ramah')
  await Promise.all(
    masuk.flatMap((m) => [
      to(m.asetil, { o: 0, s: 0.15 }, 450),
      to(m.karboksil, { o: 0, s: 0.15 }, 450),
    ]),
  )
  masuk.forEach((m) => {
    m.asetil.remove()
    m.karboksil.remove()
  })
  p.fx.replaceChildren()
  const matriksX = 800 + ((840 - 887) * 1200) / 1774
  const matriksY = 450 + ((360 - 443.5) * 600) / 887
  const panel = hide(gambar(p.fx, panelZoom, matriksX, matriksY, 440, 440))
  panel.dataset.objek = 'panel-zoom'
  bunyi('muncul')
  await to(panel, { o: 1 }, 300)
  bunyi('geser')
  // Jangkar matriks sumber C04: (840, 360) pada gambar bersih 1774 × 887.
  await Promise.all([
    to(panel, { x: 800, y: 450, s: 4.9 }, 3000, 'kamera'),
    camTo(p, matriksX, matriksY, 4.2, 3000),
    (async () => {
      await wait(p, 1000)
      await pasangLatar(p, matriks, 'matriks')
      await to(mito, { o: 0 }, 1400)
    })(),
  ])
  mito.remove()
  await to(p.cam, { x: 0, y: 0, s: 1 }, 0)
  await to(panel, { o: 0 }, 350)
  panel.remove()
  const tempat = label(p.latar, 800, 100, 'MATRIKS MITOKONDRIA · AEROB', 24)
  tempat.dataset.objek = 'label-matriks'
}

async function tempatkan(m: Piruvat, x: number, y: number, s = 1, ms = 700) {
  await Promise.all([
    to(m.asetil, { x, y, s }, ms),
    to(m.karboksil, { x: x + 75 * s, y: y + 12 * s, s }, ms),
  ])
}

function konteksAerob(p: Panggung) {
  const g = obj(1280, 410, p.fx)
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
  teks(isi, 60, -10, 'O₂ dipakai nanti:', 24, 'var(--color-ink)')
  teks(isi, 60, 25, 'di transpor elektron', 24, 'var(--color-ink)')
  teks(isi, 0, 85, 'Piruvat → asetil KoA belum memakai O₂.', 22, 'var(--color-ink)')
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
      shake,
      speedLines,
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
  const panduan = hide(jalur(p, 'Piruvat · 3 C', 'Karbon yang keluar', 430, 850))
  label(p.fx, 450, 210, '1 · Lepas karboksil', 24).dataset.objek = 'judul-tahap'
  await say(p, 'karboksil', '04-penasaran')
  await poe(p, 'c', async (pilihan) => {
    p.fx.replaceChildren()
    await to(panduan, { o: 1 }, 300)
    await Promise.all(molekul.map((m, i) => tempatkan(m, 430, 330 + i * 200)))
    await camTo(p, 650, 420, 1.25, 900)
    bunyi('kertas-getar')
    molekul.forEach((m) => m.ikatan.setAttribute('fill', 'var(--color-hot)'))
    await Promise.all([
      comic(p, 'DRRRT', 650, 300, 'var(--color-hot)', p.world),
      ...molekul.map((m) => shake(p, m.karboksil, 3.4, 720)),
    ])
    bunyi('kertas-lepas')
    panduan.querySelector('[data-judul-jalur="asal"]')?.remove()
    label(panduan, 430, 215, 'Gugus asetil · 2 C', 22)
    for (const m of molekul) {
      burstBehind(p, m.karboksil, 300)
      hapusBentuk(m.ikatan)
      m.karboksil.dataset.molecule = 'co2'
      m.nama.remove()
      m.nama = label(m.asetil, -32, 92, 'Gugus asetil · 2 C', 20)
      label(m.karboksil, 0, 78, 'CO₂ · 1 C', 20)
    }
    p.world.prepend(...p.world.querySelectorAll<SVGGElement>('[data-effect="split-burst"]'))
    await Promise.all([
      comic(p, 'KRAAK!', 650, 200, 'var(--color-hot)', p.fx),
      say(p, 'lepas'),
      ...molekul.map((m, i) => {
        speedLines(p, m.karboksil, 1)
        return arc(m.karboksil, 850, 320 + i * 200, 130, 850)
      }),
    ])
    if (pilihan === 2) await say(p, 'energi')
    if (pilihan === 1) await say(p, 'oksigen')
    await camTo(p, 800, 450, 1, 850)
    await Promise.all(molekul.map((m, i) => to(m.asetil, { x: 400, y: 400 + i * 190 }, 600)))
    await to(panduan, { o: 0 }, 300)
  })
  panduan.remove()
  p.fx.replaceChildren()
  bunyi('geser')
  await Promise.all(molekul.map((m, i) => arc(m.karboksil, 1180, 400 + i * 190, 65, 800)))
}

async function oksidasi(p: Panggung, molekul: Piruvat[]) {
  usePemutar.setState({ bab: 3 })
  const panduan = hide(jalur(p, 'Gugus asetil', 'Pembawa elektron', 430, 850))
  label(p.fx, 450, 210, '2 · Oksidasi → NADH', 24).dataset.objek = 'judul-tahap'
  const petunjuk = obj(0, 0, p.world)
  petunjuk.dataset.objek = 'petunjuk-elektron'
  label(petunjuk, 710, 280, 'Elektron → pembawa ?', 24)
  for (const y of [400, 590]) {
    el(
      'path',
      {
        d: `M510 ${y} H790`,
        fill: 'none',
        stroke: 'var(--color-paper)',
        'stroke-width': 5,
        'stroke-dasharray': '10 12',
      },
      petunjuk,
    )
    elektron(petunjuk, 630, y)
    elektron(petunjuk, 690, y)
  }
  bunyi('muncul')
  await to(hide(petunjuk), { o: 1 }, 450)
  await say(p, 'oksidasi', '04-penasaran')
  const nadh: ReturnType<typeof badge>[] = []
  await poe(p, 'b·2', async (pilihan) => {
    petunjuk.remove()
    p.fx.replaceChildren()
    await to(panduan, { o: 1 }, 300)
    await Promise.all(
      molekul.flatMap((m, i) => [
        to(m.asetil, { x: 430, y: 330 + i * 200 }, 600),
        to(m.karboksil, { y: 330 + i * 200 }, 600),
      ]),
    )
    await camTo(p, 700, 420, 1.2, 850)
    const elektronKeluar = molekul.map((m) =>
      [-1, 1].map((sisi) => elektron(p.world, m.asetil._x + 100, m.asetil._y + sisi * 18)),
    )
    if (pilihan !== 0) {
      const salah = gambar(p.world, pilihan === 1 ? gambarFad : gambarAdp, 800, 300, 128, 52)
      await arc(salah, 650, 310, 60, 600)
      await say(p, pilihan === 1 ? 'fad' : 'adp')
      await to(salah, { o: 0 }, 300)
      salah.remove()
    }
    await Promise.all([
      say(p, 'nad'),
      (async () => {
        nadh.push(...molekul.map((m) => badge(p, 1050, m.asetil._y, 'NAD⁺')))
        bunyi('geser')
        nadh.forEach((n) => speedLines(p, n, -1))
        await Promise.all([
          comic(p, 'WUSH!', 800, 220, 'var(--color-paper)', p.fx),
          ...nadh.map((n, i) => arc(n, 850, molekul[i].asetil._y, 75, 800)),
        ])
        bunyi('geser')
        await Promise.all(
          elektronKeluar.flatMap((pasangan, i) =>
            pasangan.map((e, j) => arc(e, nadh[i]._x - 28 + j * 28, nadh[i]._y, -60 - j * 15, 900)),
          ),
        )
        bunyi('kertas-kait')
        nadh.forEach((n) => relabel(n, 'NADH'))
        await Promise.all([
          comic(p, 'NADH!', 800, 220, 'var(--color-nad)', p.fx),
          ...nadh.map((n) => shake(p, n, 2.4, 360)),
          ...elektronKeluar.flat().map((e) => to(e, { o: 0 }, 200)),
        ])
        elektronKeluar.flat().forEach((e) => e.remove())
      })(),
    ])
    await camTo(p, 800, 450, 1, 850)
    bunyi('geser')
    await Promise.all([
      ...nadh.map((n, i) => arc(n, 1420, 340 + i * 160, 70, 850)),
      ...molekul.flatMap((m, i) => [
        to(m.asetil, { x: 400, y: 400 + i * 190 }, 650),
        to(m.karboksil, { y: 400 + i * 190 }, 650),
      ]),
    ])
    await to(panduan, { o: 0 }, 300)
  })
  panduan.remove()
  p.fx.replaceChildren()
  return nadh
}

async function ikat(p: Panggung, molekul: Piruvat[]) {
  usePemutar.setState({ bab: 4 })
  const panduan = jalur(p, 'Gugus asetil', 'Koenzim A datang', 400, 850, 440)
  const koas = molekul.map((m) => koa(p, 1750, m.asetil._y))
  bunyi('geser')
  koas.forEach((k) => speedLines(p, k, -1))
  await Promise.all([
    comic(p, 'WUSH!', 800, 220, 'var(--color-paper)', p.fx),
    ...koas.map((k, i) => arc(k, 850, molekul[i].asetil._y, 80, 900)),
  ])
  label(p.fx, 800, 220, '3 · Ikat koenzim A', 26).dataset.objek = 'judul-tahap'
  await say(p, 'koa', '08-menunjuk')
  await mintaKetukSemua(
    p.signal,
    'Ketuk tiap KoA untuk mengikat gugus asetil.',
    koas.map((g, i) => ({ teks: `KoA ${i + 1}`, posisi: [g._x, g._y], ukuran: [190, 100] })),
    async (i) => {
      const m = molekul[i]
      const k = koas[i]
      await arc(k, m.asetil._x + 110, m.asetil._y, 110, 850)
      strip(m.asetil, 0, -12, 55, 0, 8, 'var(--color-paper)')
      bunyi('kertas-kait')
      await Promise.all([
        comic(p, 'KLIK!', m.asetil._x + 110, m.asetil._y - 95, 'var(--color-paper)', p.world),
        shake(p, m.asetil, 2.2, 360),
      ])
      m.asetil.dataset.molecule = 'asetil-koa'
      m.nama.remove()
      m.nama = label(m.asetil, 20, 92, 'Asetil KoA · 2 C', 20)
    },
  )
  useJawabanE2.getState().catat('d')
  await say(p, 'terikat')
  await to(panduan, { o: 0 }, 300)
  panduan.remove()
  p.fx.replaceChildren()
  return koas
}

async function hasil(p: Panggung, molekul: Piruvat[], koas: Objek[], nadh: Objek[]) {
  usePemutar.setState({ bab: 5 })
  bunyi('geser')
  await Promise.all(
    [...molekul.flatMap((m) => [m.asetil, m.karboksil]), ...koas, ...nadh].map((g) =>
      to(g, { o: 0 }, 450),
    ),
  )
  for (const g of [...molekul.flatMap((m) => [m.asetil, m.karboksil]), ...koas, ...nadh]) g.remove()
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
    hide(g)
    return g
  })
  bunyi('muncul')
  await Promise.all(chips.map((g) => to(g, { o: 1 }, 450)))
  await say(p, 'hasil')
  let got = 0
  await mintaKetukSemua(
    p.signal,
    'Ketuk semua hasil dekarboksilasi oksidatif.',
    items.map((item, i) => ({ teks: item.teks, posisi: [chips[i]._x, 480], ukuran: [230, 200] })),
    async (i) => {
      const x = 500 + got++ * 300
      await arc(chips[i], x, 300, 100, 700)
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
      to(m.asetil, { x: 500, y: 340 + i * 200, o: 1 }, 600),
      to(koas[i], { x: 610, y: 340 + i * 200, o: 1 }, 600),
      to(m.karboksil, { x: 1000, y: 340 + i * 200, o: 1 }, 600),
    ]),
  )
  const counter = label(p.fx, 800, 720, 'Karbon terhitung: 0 dari 6', 28)
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
  siapkan(
    'geser',
    'tempel',
    'muncul',
    'belah',
    'selesai',
    'kertas-getar',
    'kertas-lepas',
    'kertas-kait',
  )
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
