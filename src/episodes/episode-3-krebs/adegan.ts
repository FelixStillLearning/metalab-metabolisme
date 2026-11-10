import matriks from '../../assets/images/latar-matriks-lebar.webp'
import mito from '../../assets/images/mitokondria-zoom.webp'
import asetilKoa from '../../assets/images/molekul-asetil-koa.webp'
import oaa from '../../assets/images/molekul-oksaloasetat.webp'
import piruvat from '../../assets/images/molekul-piruvat.webp'
import glukosa from '../../assets/images/glukosa.webp'
import oksigen from '../../assets/images/molekul-o2.webp'
import koa from '../../assets/images/molekul-koa.webp'
import co2 from '../../assets/images/molekul-co2.webp'
import h2o from '../../assets/images/molekul-h2o.webp'
import atp from '../../assets/images/pembawa-atp.webp'
import adp from '../../assets/images/pembawa-adp.webp'
import nad from '../../assets/images/pembawa-nad.webp'
import nadh from '../../assets/images/pembawa-nadh.webp'
import fad from '../../assets/images/pembawa-fad.webp'
import fadh2 from '../../assets/images/pembawa-fadh2.webp'
import { label } from '../../features/pemutar-episode/kertas'
import {
  arc,
  arrive,
  burstBehind,
  comic,
  camTo,
  hide,
  pasangLatar,
  to,
  wait,
  type Panggung,
} from '../../features/pemutar-episode/mesin'
import { mintaKetukSemua, mintaPilihan } from '../../features/pemutar-episode/pilihan'
import {
  mintaJelaskan,
  mintaTebak,
  tampilkanAmati,
  tandaiAmati,
} from '../../features/pemutar-episode/poe'
import { mintaLengkapi } from '../../features/pemutar-episode/kalimat'
import { ucapKalimat } from '../../features/pemutar-episode/ucapKalimat'
import { bunyi, siapkan } from '../../lib/suara'
import { usePemutar } from '../../stores/pemutar'
import { useJawabanE3 } from '../../stores/jawaban-episode-3'
import { elektron } from '../episode-1-glikolisis/molekul'
import { BAB, POE, POTONGAN, RUMPANG, TAHAP, ZAT, total, type PoeE3 } from './isi'
import { gambar, lepasCo2, posisi, rangka, rodaKrebs, type Rangka, type Roda } from './molekul'

function say(p: Panggung, id: string, teks: string) {
  return ucapKalimat(p, `e3-${id}`, { teks, pose: '05-menjelaskan' })
}
const catat = (k: (typeof BAB)[number]['k']) => useJawabanE3.getState().catat(k)
const bab = (k: (typeof BAB)[number]['k']) =>
  usePemutar.setState({ bab: BAB.findIndex((b) => b.k === k) })
function pesan(kalimat: string) {
  usePemutar.setState({ kalimat })
}
const RINGKASAN = (n: number) => {
  const t = total(n)
  return `${t.NADH} NADH · ${t.FADH2} FADH₂ · ${t.ATP} ATP · ${t.CO2} CO₂`
}

async function pembuka(p: Panggung) {
  const g = gambar(p.world, mito, 800, 450, 1200, 600)
  bunyi('muncul')
  await to(hide(g), { o: 1 }, 600)
  await say(
    p,
    'pembuka',
    'Dua asetil KoA dari satu glukosa siap memasuki siklus Krebs, di matriks mitokondria.',
  )
  bunyi('geser')
  await camTo(p, 800 + ((840 - 887) * 1200) / 1774, 450 + ((360 - 443.5) * 600) / 887, 4.2, 1800)
  await pasangLatar(p, matriks, 'matriks')
  g.remove()
  await to(p.cam, { x: 0, y: 0, s: 1 }, 0)
}
async function bahan(p: Panggung) {
  bab('a')
  const items = [
    ['Asetil KoA (2 C)', asetilKoa],
    ['Glukosa (6 C)', glukosa],
    ['Asam piruvat (3 C)', piruvat],
  ]
  for (const [i, [teks, href]] of items.entries()) {
    const g = gambar(p.world, href, 400 + i * 400, 400, 230, 160)
    label(g, 0, 130, teks, 26)
  }
  await say(
    p,
    'substrat',
    'Ketuk substrat yang masuk ke siklus Krebs. Hitung karbon pada gugus asetil; lencana KoA tidak termasuk rangka karbon siklus.',
  )
  await mintaPilihan(
    p.signal,
    {
      judul: 'Ketuk substrat siklus Krebs.',
      opsi: items.map(([teks], i) => ({ teks, posisi: [400 + i * 400, 430], ukuran: [320, 240] })),
    },
    0,
    (i) =>
      pesan(
        i === 1
          ? 'Glukosa sudah dipecah pada glikolisis.'
          : 'Piruvat sudah diubah menjadi asetil KoA pada dekarboksilasi oksidatif.',
      ),
  )
  catat('a')
  p.world.replaceChildren()
  bab('b')
  gambar(p.world, asetilKoa, 430, 330, 230, 160)
  const pasangan = [
    ['Oksaloasetat (4 C)', oaa],
    ['O₂', oksigen],
    ['NAD⁺', nad],
  ]
  for (const [i, [teks, href]] of pasangan.entries()) {
    const g = gambar(p.world, href, 400 + i * 400, 510, 190, 130)
    label(g, 0, 105, teks, 24)
  }
  await say(
    p,
    'pengikat',
    'Molekul mana yang mengikat gugus asetil dengan dua karbon untuk memulai siklus?',
  )
  await mintaPilihan(
    p.signal,
    {
      judul: 'Ketuk pengikat gugus asetil.',
      opsi: pasangan.map(([teks], i) => ({
        teks,
        posisi: [400 + i * 400, 540],
        ukuran: [320, 220],
      })),
    },
    0,
    (i) =>
      pesan(
        i === 1
          ? 'O₂ dipakai pada transpor elektron, bukan untuk mengikat gugus asetil.'
          : 'NAD⁺ menerima elektron. Pengikat gugus asetil memiliki empat karbon.',
      ),
  )
  p.world.replaceChildren()
  const a = rangka(p, 2, 'Gugus asetil', 320, 410)
  const b = rangka(p, 4, 'Oksaloasetat', 1080, 410)
  a.g.dataset.objek = 'asetil-bergabung'
  b.g.dataset.objek = 'oksaloasetat-bergabung'
  const air = gambar(p.world, h2o, 800, 580, 100, 100)
  const k = gambar(p.world, koa, 320, 560)
  bunyi('geser')
  await Promise.all([
    to(a.g, { x: 380 }, 800),
    to(b.g, { x: 600 }, 800),
    to(air, { x: 500, y: 460, o: 0 }, 800),
  ])
  air.remove()
  const sitrat = rangka(p, 6, 'Sitrat', 500, 460)
  sitrat.atom.forEach((c) => c.remove())
  sitrat.ikatan.replaceChildren()
  sitrat.atom.splice(0, 6, ...a.atom, ...b.atom)
  for (const asal of [a, b])
    for (const c of asal.atom) {
      sitrat.g.append(c)
      await to(c, { x: asal.g._x + c._x - sitrat.g._x, y: asal.g._y + c._y - sitrat.g._y }, 0)
    }
  a.g.remove()
  b.g.remove()
  await sitrat.susun('Sitrat', 1)
  sitrat.g.dataset.objek = 'sitrat-ikhtisar'
  burstBehind(p, sitrat.g)
  bunyi('tempel')
  await to(k, { x: 850, y: 520 }, 650)
  label(k, 0, 70, 'KoA dilepas', 24)
  await comic(p, 'KLIK', 800, 260, 'var(--color-paper)')
  await say(
    p,
    'gabung',
    'Dua karbon dari gugus asetil ditambah empat karbon oksaloasetat: enam karbon pada sitrat. Air ditambahkan dan koenzim A dilepas.',
  )
  catat('b')
  bab('c')
  await say(
    p,
    'delapan-tahap',
    'Sitrat enam karbon akan berubah melalui beberapa reaksi hingga oksaloasetat terbentuk kembali. Ada berapa tahap pada siklus ini?',
  )
  await mintaPilihan(
    p.signal,
    {
      judul: 'Ada berapa tahap utama siklus Krebs?',
      opsi: ['5 tahap', '8 tahap', '10 tahap'].map((teks) => ({ teks })),
    },
    1,
    () => pesan('Ikuti delapan reaksi terpisah dari sitrat sampai oksaloasetat terbentuk kembali.'),
  )
  sitrat.g.remove()
  k.remove()
  p.world.replaceChildren()
  catat('c')
}

async function poe(p: Panggung, k: PoeE3, amati: () => Promise<void>) {
  bab(k)
  const isi = POE[k]
  const pilihan = await mintaTebak(p.signal, {
    judul: isi.judul,
    reasons: isi.alasan,
    right: 1,
    zat: isi.zat.map((teks) => ({ teks })),
    zone: { x: 500, y: 480, w: 380, h: 280, name: 'roda siklus Krebs' },
    supply: [
      [850, 300],
      [850, 460],
      [850, 620],
    ],
    slot: () => [500, 480],
  })
  tampilkanAmati(isi.zat[pilihan.g])
  await amati()
  tandaiAmati(pilihan.g === 1 ? 'benar' : 'salah', pilihan.g === 1 ? undefined : isi.hasil)
  const penjelasan = await mintaJelaskan(p.signal, {
    ...pilihan,
    unit: '',
    zat: isi.zat,
    reasons: isi.alasan,
    back: isi.balik,
    right: 1,
    alasanBenar: 1,
    hasil: isi.hasil,
  })
  useJawabanE3.getState().catatPoe(k, { tebakan: pilihan.g, alasan: pilihan.r, penjelasan })
  catat(k)
}

async function pembawa(p: Panggung, tahap: number, hasil: 'NADH' | 'FADH₂' | 'ATP') {
  const awal = hasil === 'NADH' ? nad : hasil === 'FADH₂' ? fad : adp
  const akhir = hasil === 'NADH' ? nadh : hasil === 'FADH₂' ? fadh2 : atp
  const g = gambar(p.world, awal, 950, 400)
  if (hasil !== 'ATP') {
    const es = [-1, 1].map((s) => elektron(p.world, 520, 430 + s * 20))
    bunyi('geser')
    await Promise.all(es.map((e) => to(e, { x: 950, y: 400, o: 0 }, 600)))
    es.forEach((e) => e.remove())
  }
  g.querySelector('image')!.setAttribute('href', akhir)
  g.dataset.hasil = hasil
  g.dataset.tahap = String(tahap)
  bunyi(hasil === 'ATP' ? 'atp' : 'tempel')
  await arrive(p, g, 1100, 530)
  label(g, 0, 65, `${hasil} · tahap ${tahap}`, 24)
  return g
}

async function putar(p: Panggung, roda: Roda) {
  let m: Rangka | null = null
  const labelPutaran = label(p.fx, 1100, 170, 'SATU PUTARAN · SATU ASETIL KoA', 24)
  const tahapJudul = label(p.fx, 1100, 310, '4 · α-ketoglutarat', 26)
  for (const [i, t] of TAHAP.entries()) {
    roda.aktif(i)
    tahapJudul.querySelector('text')!.textContent = `${i + 1} · ${t.nama}`
    if (!m) m = rangka(p, 6, t.nama)
    const lepas = i === 2 || i === 3 ? await lepasCo2(p, m, i + 1) : null
    await m.susun(t.nama, i + 1)
    if (lepas) {
      burstBehind(p, m.g)
      bunyi('belah')
      await arc(lepas, 850, 280 + (i - 2) * 240, 110, 1000)
      await comic(p, 'POP!', 740, 370, 'var(--color-paper)')
    } else {
      bunyi('geser')
      await to(m.g, { s: 1.06 }, 260)
      await to(m.g, { s: 1 }, 260)
    }
    let air: ReturnType<typeof gambar> | null = null
    let koenzim: ReturnType<typeof gambar> | null = null
    if (t.air) {
      air = gambar(p.world, h2o, 950, 400, 100, 100)
      bunyi('geser')
      await to(air, { x: 560, y: 465, o: 0 }, 600)
    }
    if (i === 0 || i === 4) {
      koenzim = gambar(p.world, koa, 580, 570, 100, 50)
      bunyi('geser')
      await to(koenzim, { x: 1120, y: 600 }, 600)
      label(koenzim, 0, 60, 'KoA dilepas', 22)
    }
    const b = t.hasil ? await pembawa(p, i + 1, t.hasil) : null
    const kelanjutan = [
      'Dua karbon gugus asetil bergabung dengan oksaloasetat empat karbon. Air ditambahkan, sitrat enam karbon terbentuk, dan KoA dilepas.',
      'Sitrat ditata ulang menjadi isositrat. Jumlah karbon tetap enam.',
      'Satu karbon keluar sebagai CO₂. Enam menjadi lima. NAD⁺ menerima elektron menjadi NADH.',
      'Satu CO₂ lagi keluar. Lima menjadi empat karbon pada suksinil KoA. NADH juga terbentuk dan KoA terikat.',
      'Suksinil KoA menjadi suksinat. KoA dilepas dan ATP, melalui GTP, terbentuk. Karbon tetap empat.',
      'Suksinat menjadi fumarat. FAD menerima elektron menjadi FADH₂. Karbon tetap empat.',
      'Air ditambahkan ke fumarat sehingga terbentuk malat. Karbon tetap empat.',
      'Malat menjadi oksaloasetat kembali, disertai pembentukan NADH. Empat karbon siap mengikat gugus asetil berikutnya.',
    ][i]
    await say(p, `tahap-${i + 1}`, `Tahap ${i + 1}. ${kelanjutan}`)
    air?.remove()
    koenzim?.remove()
    b?.remove()
  }
  await say(
    p,
    'karbon-total',
    'Satu putaran: dua karbon masuk, dua karbon keluar sebagai CO₂. Oksaloasetat empat karbon terbentuk kembali. Model ini menghitung jumlah karbon, bukan melacak asal setiap atom CO₂.',
  )
  labelPutaran.remove()
  tahapJudul.remove()
  return m!
}
async function tempatkan(p: Panggung, roda: Roda) {
  for (const z of ZAT) {
    bab(z.k)
    const href = { 'H₂O': h2o, ATP: atp, NADH: nadh, 'FADH₂': fadh2 }[z.nama]
    const token = gambar(p.fx, href, 1100, 350, 220, 110)
    label(token, 0, 100, z.nama, 30)
    await say(
      p,
      `zat-${z.k}`,
      `Tempatkan ${z.nama} pada ${z.tahap.length === 1 ? 'tahap yang sesuai' : 'semua tahap yang sesuai'}. Ketuk kartunya, lalu ketuk nomor tahap di roda.`,
    )
    await mintaPilihan(
      p.signal,
      {
        judul: `Ketuk kartu ${z.nama}.`,
        opsi: [{ teks: `Tempatkan ${z.nama}`, posisi: [1100, 380], ukuran: [300, 200] }],
      },
      0,
      () => {},
    )
    await mintaKetukSemua(
      p.signal,
      `Ketuk tahap penempatan ${z.nama}.`,
      TAHAP.map((_, i) => ({
        teks: `${z.nama} ke tahap ${i + 1}`,
        posisi: posisi(i),
        ukuran: [150, 125],
      })),
      async (i) => {
        roda.aktif(i)
        const g = gambar(p.fx, href, 1100, 350, 100, 50)
        const [x, y] = posisi(i)
        await arc(g, 500 + (x - 500) * 0.66, 480 + (y - 480) * 0.66, 90, 650)
        bunyi('tempel')
      },
      {
        indeks: TAHAP.flatMap((_, i) =>
          (z.tahap as readonly number[]).includes(i + 1) ? [] : [i],
        ),
        salah: () => pesan(z.pesan),
      },
    )
    catat(z.k)
    await say(p, `zat-${z.k}-selesai`, z.pesan)
    token.remove()
  }
}
async function duaPutaran(p: Panggung, roda: Roda) {
  const judul = label(p.fx, 1100, 170, 'Per 1 glukosa · 2 asetil KoA', 28)
  const penghitung = label(p.fx, 1100, 690, RINGKASAN(2), 24)
  const lingkup = label(p.fx, 1100, 265, 'Putaran 1 mulai', 28)
  judul.dataset.objek = 'judul-panen'
  lingkup.dataset.objek = 'putaran-panen'
  penghitung.querySelector('text')!.textContent = ''
  const panen = [
    { href: nadh, nama: 'NADH', per: 3, x: 1030, y: 440 },
    { href: fadh2, nama: 'FADH₂', per: 1, x: 1310, y: 440 },
    { href: atp, nama: 'ATP', per: 1, x: 1030, y: 575 },
    { href: co2, nama: 'CO₂', per: 2, x: 1310, y: 575 },
  ].map((t) => ({
    ...t,
    g: hide(gambar(p.fx, t.href, t.x, t.y, 150, 75)),
    hitung: label(p.fx, t.x, t.y + 56, `0 ${t.nama}`, 26),
  }))
  const asetil = [0, 1].map((i) => {
    const g = gambar(p.world, asetilKoa, 1040 + i * 240, 350, 180, 100)
    g.dataset.asetil = String(i + 1)
    return g
  })
  for (let k = 0; k < 2; k++) {
    bunyi('geser')
    await to(asetil[k], { x: 500, y: 480, o: 0 }, 800)
    for (let i = 0; i < 8; i++) {
      roda.aktif(i)
      await wait(p, 230)
    }
    bunyi('tempel')
    await Promise.all(panen.map((t) => to(t.g, { o: 1, s: 1.08 }, 300, 'letup')))
    for (const t of panen) {
      t.hitung.querySelector('text')!.textContent = `${t.per * (k + 1)} ${t.nama}`
      await to(t.g, { s: 1 }, 120)
    }
    lingkup.querySelector('text')!.textContent = `Putaran ${k + 1} selesai`
    penghitung.querySelector('text')!.textContent = RINGKASAN(k + 1)
    penghitung.dataset.putaran = String(k + 1)
    await say(
      p,
      `putaran-${k + 1}`,
      k === 0
        ? 'Satu asetil KoA telah masuk: satu putaran selesai. Hasil per putaran: tiga NADH, satu FADH₂, satu ATP, dua CO₂. Masih ada asetil KoA kedua.'
        : 'Asetil KoA kedua menjalankan putaran kedua. Untuk satu glukosa totalnya enam NADH, dua FADH₂, dua ATP, empat CO₂. Oksaloasetat terbentuk kembali di setiap putaran.',
    )
  }
  panen.forEach((t) => {
    t.g.remove()
    t.hitung.remove()
  })
  judul.remove()
  lingkup.remove()
  penghitung.remove()
  asetil.forEach((g) => g.remove())
}
export async function episode(p: Panggung) {
  siapkan('muncul', 'geser', 'tempel', 'belah', 'atp', 'selesai')
  useJawabanE3.getState().mulai()
  await pembuka(p)
  await bahan(p)
  const roda = rodaKrebs(p)
  bunyi('muncul')
  await to(hide(roda.g), { o: 1 }, 700)
  const pratinjau = rangka(p, 6, 'Sitrat')
  await pratinjau.susun('Sitrat', 1)
  await to(pratinjau.g, { s: 0.78, y: 475 }, 0)
  await say(
    p,
    'roda',
    'Delapan tahap membentuk sebuah siklus. Sitrat memiliki enam karbon, lalu oksaloasetat empat karbon terbentuk kembali.',
  )
  let m: Rangka | null = null
  await poe(p, 'i·1', async () => {
    pratinjau.g.remove()
    m = await putar(p, roda)
  })
  m!.g.remove()
  p.world.querySelectorAll('[data-molecule="co2"]').forEach((n) => n.remove())
  await tempatkan(p, roda)
  await poe(p, 'i·2', () => duaPutaran(p, roda))
  p.world.replaceChildren()
  p.fx.replaceChildren()
  bab('j')
  await say(
    p,
    'pengertian',
    'Siklus Krebs berlangsung dalam suasana aerob. Oksigen tidak dikonsumsi langsung di sini, tetapi diperlukan pada transpor elektron untuk membantu menyediakan kembali NAD⁺ dan FAD. Lengkapi pengertiannya.',
  )
  await mintaLengkapi(p.signal, 'Lengkapi pengertian siklus Krebs', POTONGAN, RUMPANG)
  catat('j')
  await say(
    p,
    'selesai',
    'Siklus Krebs selesai. Buka lembar hasil untuk melihat delapan tahap dan membandingkan hasil satu putaran dengan hasil satu glukosa.',
  )
  usePemutar.setState({ bab: BAB.length, kalimat: '' })
  return useJawabanE3.getState().selesaikan()
}
