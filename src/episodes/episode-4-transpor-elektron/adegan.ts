import krista from '../../assets/images/latar-krista-lebar.webp'
import mito from '../../assets/images/mitokondria-zoom.webp'
import panelZoom from '../../assets/images/organel-panel-zoom.webp'
import nad from '../../assets/images/pembawa-nad.webp'
import nadh from '../../assets/images/pembawa-nadh.webp'
import fad from '../../assets/images/pembawa-fad.webp'
import fadh from '../../assets/images/pembawa-fadh2.webp'
import atp from '../../assets/images/pembawa-atp.webp'
import adp from '../../assets/images/pembawa-adp.webp'
import o2 from '../../assets/images/molekul-o2.webp'
import air from '../../assets/images/molekul-h2o.webp'
import co2 from '../../assets/images/molekul-co2.webp'
import selKosong from '../../assets/images/interaksi-sel-tabel.webp'
import selAktif from '../../assets/images/interaksi-sel-tabel-aktif.webp'
import selTerisi from '../../assets/images/interaksi-sel-tabel-terisi.webp'
import { el, label } from '../../features/pemutar-episode/kertas'
import {
  camTo,
  arc,
  arrive,
  comic,
  hide,
  obj,
  pasangLatar,
  to,
  wait,
  type Panggung,
  type Objek,
} from '../../features/pemutar-episode/mesin'
import { mintaPilihan, mintaKetukSemua } from '../../features/pemutar-episode/pilihan'
import {
  mintaTebak,
  tampilkanAmati,
  tandaiAmati,
  mintaJelaskan,
} from '../../features/pemutar-episode/poe'
import { mintaLengkapi } from '../../features/pemutar-episode/kalimat'
import { ucapKalimat } from '../../features/pemutar-episode/ucapKalimat'
import { elektron, phos } from '../episode-1-glikolisis/molekul'
import { useJawabanE4 } from '../../stores/jawaban-episode-4'
import { usePemutar } from '../../stores/pemutar'
import { bunyi, siapkan } from '../../lib/suara'
import { BAB, JALUR, POE, RUMPANG, POTONGAN, KOLOM, TABEL, type ButirE4, type PoeE4 } from './isi'
import { gambar, membran, proton, posisiKompleks, X, Y, type Membran } from './membran'
const catat = (k: ButirE4) => useJawabanE4.getState().catat(k)
const bab = (k: (typeof BAB)[number]['k']) =>
  usePemutar.setState({ bab: BAB.findIndex((b) => b.k === k) })
const pesan = (kalimat: string) => {
  usePemutar.setState({ kalimat })
}
const say = (p: Panggung, id: string, teks: string) =>
  ucapKalimat(p, `e4-${id}`, { teks, pose: '05-menjelaskan' })

async function pembuka(p: Panggung) {
  const g = gambar(p.world, mito, 800, 450, 1200, 600)
  bunyi('muncul')
  await to(hide(g), { o: 1 }, 600)
  label(g, 0, -300, 'EPISODE 4 · LEPAS ENERGINYA!', 34)
  await say(
    p,
    'pembuka',
    'NADH dan FADH₂ dari tiga tahap sebelumnya membawa elektron menuju membran dalam mitokondria, yang berlipat membentuk krista.',
  )
  // Lipatan membran dalam pada sumber 1774 × 887, berbeda dari jangkar matriks E2/E3.
  const x = 800 + ((1010 - 887) * 1200) / 1774
  const y = 450 + ((580 - 443.5) * 600) / 887
  const panel = hide(gambar(p.fx, panelZoom, x, y, 440, 440))
  panel.dataset.objek = 'zoom-krista'
  bunyi('muncul')
  await to(panel, { o: 1 }, 300)
  bunyi('geser')
  await Promise.all([
    to(panel, { x: 800, y: 450, s: 4.9 }, 3000, 'kamera'),
    camTo(p, x, y, 4.2, 3000),
    (async () => {
      await wait(p, 1000)
      await pasangLatar(p, krista, 'krista')
      await to(g, { o: 0 }, 1400)
    })(),
  ])
  g.remove()
  await to(p.cam, { x: 0, y: 0, s: 1 }, 0)
  await to(panel, { o: 0 }, 350)
  panel.remove()
}
async function kumpulkan(p: Panggung) {
  bab('g')
  const items = [
    { t: '2 NADH · glikolisis', href: nadh },
    { t: '2 ATP · glikolisis', href: atp },
    { t: '2 NADH · dekarboksilasi', href: nadh },
    { t: '6 NADH · Krebs', href: nadh },
    { t: '4 CO₂ · Krebs', href: co2 },
    { t: '2 FADH₂ · Krebs', href: fadh },
  ]
  const gs = items.map((item, i) => {
    const g = gambar(
      p.world,
      item.href,
      380 + (i % 3) * 440,
      330 + Math.floor(i / 3) * 240,
      180,
      90,
    )
    label(g, 0, 80, item.t, 26)
    hide(g)
    return g
  })
  for (const g of gs) {
    bunyi('tempel')
    await to(g, { o: 1 }, 260, 'letup')
  }
  await say(
    p,
    'kumpulkan',
    'Ketuk semua pembawa elektron yang akan dipakai. ATP sudah siap digunakan sel, sedangkan CO₂ adalah zat buangan.',
  )
  await mintaKetukSemua(
    p.signal,
    'Kumpulkan pembawa elektron dari tiga tahap sebelumnya.',
    items.map((o, i) => ({ teks: o.t, posisi: [gs[i]._x, gs[i]._y + 30], ukuran: [390, 180] })),
    async (i) => {
      bunyi('geser')
      await arc(gs[i], 800, 220, 100, 650)
      await to(gs[i], { s: 0.8, o: 0 }, 200)
    },
    {
      indeks: [1, 4],
      salah: (i) =>
        pesan(
          i === 1
            ? 'ATP bukan pembawa elektron menuju rantai ini.'
            : 'CO₂ tidak membawa elektron ke transpor elektron.',
        ),
    },
  )
  p.world.replaceChildren()
  label(p.world, 800, 350, '2 + 2 + 6 = 10 NADH', 42)
  label(p.world, 800, 470, '2 FADH₂ dari siklus Krebs', 36)
  catat('g')
  await say(
    p,
    'jumlah',
    'Total sepuluh NADH dan dua FADH₂. Keduanya akan menyerahkan elektron, tetapi melalui pintu masuk yang berbeda.',
  )
  p.world.replaceChildren()
}
async function flow(p: Panggung, m: Membran, jenis: 'NADH' | 'FADH2', hs: Objek[]) {
  const jalur = JALUR[jenis]
  const k = jalur[0]
  const g = gambar(p.world, jenis === 'NADH' ? nadh : fadh, 80, 650, 180, 90)
  g.dataset.pembawa = jenis
  bunyi('geser')
  await arrive(p, g, X[k] - 110, 650)
  const es = [-1, 1].map((s) => elektron(p.world, g._x + s * 22, 620))
  es.forEach((e) => (e.dataset.elektron = jenis))
  g.querySelector('image')!.setAttribute('href', jenis === 'NADH' ? nad : fad)
  bunyi('klik')
  await comic(p, 'LEPAS!', g._x, 550, 'var(--color-nad)', p.world)
  for (const [i, k] of jalur.entries()) {
    m.g.dataset.jalur = jenis
    m.g.dataset.kompleksAktif = k
    if (i > 0) {
      const [x, y] = k === 'III' ? [625, Y] : [880, 340]
      await Promise.all(es.map((e, j) => arc(e, x + (j ? 14 : -14), y, 60, 700)))
    }
    await Promise.all(
      es.map((e, j) => to(e, { x: X[k] + (j ? 14 : -14), y: posisiKompleks(k)[1] }, 650)),
    )
    const aktif = m.kompleks[(['I', 'II', 'III', 'IV'] as const).indexOf(k)]
    bunyi('klik')
    await to(aktif, { s: 1.07 }, 180, 'letup')
    await to(aktif, { s: 1 }, 180)
    if (k !== 'II') {
      // Satu penanda aliran per kompleks, bukan jumlah proton stoikiometrik.
      const h = proton(p.world, X[k], 610)
      hs.push(h)
      h.dataset.pompa = k
      el(
        'path',
        {
          d: `M${X[k]} 600 L${X[k]} 250 l-12 20 m12-20 l12 20`,
          fill: 'none',
          stroke: 'var(--color-nad)',
          'stroke-width': 7,
          'stroke-dasharray': '12 10',
          'data-arah-proton': k,
        },
        m.g,
      )
      bunyi('geser')
      await arrive(p, h, X[k] + (hs.length > 3 ? 65 : -45), 245)
    } else {
      await comic(p, 'TANPA POMPA', 530, 530, 'var(--color-fosfat)', p.world)
    }
    await say(
      p,
      `${jenis}-${k}`,
      `${jenis === 'NADH' ? 'NADH' : 'FADH₂'}: ${i === 0 ? 'masuk' : 'lanjut'} di kompleks ${k}. ${k === 'II' ? 'Kompleks II tidak memompa H⁺.' : 'H⁺ dipompa dari matriks ke ruang antarmembran.'}`,
    )
  }
  await Promise.all(es.map((e) => to(e, { o: 0 }, 250)))
  es.forEach((e) => e.remove())
  g.remove()
  delete m.g.dataset.kompleksAktif
}
async function poe(p: Panggung, k: PoeE4, amati: () => Promise<void>) {
  bab(k)
  const isi = POE[k]
  const v = await mintaTebak(p.signal, {
    judul: isi.judul,
    reasons: isi.alasan,
    right: 1,
    zat: isi.zat.map((teks) => ({ teks })),
    zone: {
      x: 400,
      y: 450,
      w: 420,
      h: 280,
      name: k === 'c' ? 'kompleks tujuan FADH₂' : 'hasil transpor elektron',
    },
    supply: [
      [850, 300],
      [850, 460],
      [850, 620],
    ],
    slot: () => [400, 450],
  })
  tampilkanAmati(isi.zat[v.g])
  await amati()
  tandaiAmati(v.g === 1 ? 'benar' : 'salah', v.g === 1 ? undefined : isi.hasil)
  const penjelasan = await mintaJelaskan(p.signal, {
    ...v,
    unit: '',
    zat: isi.zat,
    reasons: isi.alasan,
    back: isi.balik,
    right: 1,
    alasanBenar: 1,
    hasil: isi.hasil,
  })
  useJawabanE4.getState().catatPoe(k, { tebakan: v.g, alasan: v.r, penjelasan })
  catat(k)
}
async function jalur(p: Panggung, m: Membran, hs: Objek[]) {
  bab('a')
  await say(
    p,
    'nadh',
    'Ketuk kompleks pertama yang menerima elektron dari NADH. Perhatikan sisi matriks di bawah membran dan ruang antarmembran di atasnya.',
  )
  await mintaPilihan(
    p.signal,
    {
      judul: 'Kompleks pertama penerima elektron NADH?',
      opsi: (['I', 'II', 'III', 'IV'] as const).map((k) => ({
        teks: `Kompleks ${k}`,
        posisi: posisiKompleks(k),
        ukuran: [190, 230],
      })),
    },
    0,
    (i) =>
      pesan(
        i === 1
          ? 'Kompleks II menerima elektron FADH₂.'
          : 'Elektron NADH masuk di kompleks I sebelum III dan IV.',
      ),
  )
  await flow(p, m, 'NADH', hs)
  catat('a')
  catat('b')
  await poe(p, 'c', () => flow(p, m, 'FADH2', hs))
  catat('d')
}
async function oksigen(p: Panggung, m: Membran, gradien: Objek[]) {
  bab('i')
  await Promise.all([to(m.g, { o: 0.12 }, 400), ...gradien.map((h) => to(h, { o: 0 }, 400))])
  label(p.fx, 800, 230, 'DI UJUNG RANTAI: OKSIGEN', 30)
  await say(
    p,
    'akseptor',
    'Di ujung kompleks IV, oksigen menerima elektron dan berikatan dengan H⁺. Ketuk zat yang terbentuk.',
  )
  const ops = [
    ['H₂O', air],
    ['CO₂', co2],
    ['ATP', atp],
  ]
  const gs = ops.map(([t, href], i) => {
    const g = gambar(p.world, href, 450 + i * 360, 460, 160, 100)
    label(g, 0, 65, t, 28)
    return g
  })
  await mintaPilihan(
    p.signal,
    {
      judul: 'Ketuk zat yang terbentuk saat O₂ menerima elektron.',
      opsi: ops.map(([teks], i) => ({ teks, posisi: [450 + i * 360, 470], ukuran: [280, 180] })),
    },
    0,
    () =>
      pesan(
        'O₂ menerima elektron dan H⁺ menjadi air. CO₂ adalah buangan tahap sebelumnya; ATP terbentuk melalui ATP sintase.',
      ),
  )
  gs.forEach((g) => g.remove())
  p.fx.replaceChildren()
  const o = gambar(p.fx, o2, 800, 480, 200, 110)
  const es = [-3, -1, 1, 3].map((s) => elektron(p.fx, 800 + s * 65, 340))
  const hs = [-3, -1, 1, 3].map((s) => proton(p.fx, 800 + s * 100, 590))
  label(p.fx, 800, 230, 'O₂ + 4 H⁺ + 4 e⁻ → 2 H₂O', 34)
  bunyi('geser')
  await Promise.all([...es, ...hs].map((g) => arc(g, 800, 480, 60, 900)))
  o.remove()
  es.forEach((e) => e.remove())
  hs.forEach((h) => h.remove())
  for (const x of [640, 960]) {
    const h = gambar(p.fx, air, 800, 480, 150, 150)
    h.dataset.objek = 'air-terbentuk'
    await arc(h, x, 490, 80, 500)
  }
  bunyi('tempel')
  await comic(p, 'POP!', 800, 380, 'var(--color-h2o)')
  await say(
    p,
    'air',
    'Satu molekul O₂ menerima empat elektron dan empat H⁺, menjadi dua molekul H₂O. Dua atom oksigen dan empat hidrogen tetap ada pada dua molekul air.',
  )
  p.fx.replaceChildren()
  label(p.fx, 800, 230, '6 O₂ + 24 H⁺ + 24 e⁻ → 12 H₂O', 32)
  await say(
    p,
    'total-air',
    'Sepuluh NADH dan dua FADH₂ menyumbang dua puluh empat elektron. Bersama enam O₂ dan dua puluh empat H⁺, terbentuk dua belas H₂O. H⁺ ini untuk membentuk air, bukan jumlah proton yang dipompa.',
  )
  catat('i')
  p.fx.replaceChildren()
  await Promise.all([to(m.g, { o: 1 }, 400), ...gradien.map((h) => to(h, { o: 1 }, 400))])
}
async function kemiosmosis(p: Panggung, m: Membran, hs: Objek[]) {
  bab('e')
  await say(
    p,
    'gradien',
    'H⁺ menumpuk di ruang antarmembran. Penanda menunjukkan arah aliran, bukan jumlah proton sebenarnya. Ketuk ATP sintase agar H⁺ kembali ke matriks lewat kanalnya.',
  )
  await mintaKetukSemua(
    p.signal,
    'Ketuk ATP sintase.',
    [{ teks: 'ATP sintase', posisi: [1320, 540], ukuran: [260, 260] }],
    async () => {
      pesan('')
      bunyi('geser')
      await Promise.all(hs.map((h, i) => to(h, { x: 1320, y: 310 - i * 30 }, 650)))
      await Promise.all([
        ...hs.map((h) => to(h, { x: 1320, y: 640, o: 0 }, 900)),
        to(m.rotor, { r: 180 }, 900),
      ])
      hs.forEach((h) => h.remove())
      m.g.querySelectorAll('[data-arah-proton]').forEach((g) => g.remove())
      await camTo(p, 1220, 520, 1.45, 1100)
      const hasil = gambar(p.world, adp, 1130, 620, 180, 80)
      const fosfat = obj(1500, 550, p.world)
      phos(fosfat, 0, 0)
      await to(fosfat, { s: 1.7 }, 0)
      label(p.fx, 780, 255, 'ADP + FOSFAT → ATP', 34)
      await Promise.all([arc(hasil, 1320, 650, 70, 750), arc(fosfat, 1390, 650, 90, 750)])
      fosfat.remove()
      hasil.querySelector('image')!.setAttribute('href', atp)
      hasil.dataset.objek = 'atp-terbentuk'
      bunyi('atp')
      await comic(p, 'KLIK!', 1320, 530, 'var(--color-fosfat)', p.world)
      await to(hasil, { x: 1120, y: 630 }, 600)
    },
  )
  catat('e')
  await say(
    p,
    'atp-sintase',
    'Aliran H⁺ kembali ke matriks memutar ATP sintase. Energi aliran itu membentuk ATP dari ADP dan fosfat. Elektron mengalir melalui rantai ke oksigen; elektron tidak melewati ATP sintase.',
  )
  p.fx.replaceChildren()
  await camTo(p, 800, 450, 1, 1000)
}
async function hitung(p: Panggung) {
  p.world.replaceChildren()
  await poe(p, 'h', async () => {
    for (const [i, teks] of ['10 NADH × 3 ATP = 30 ATP', '2 FADH₂ × 2 ATP = 4 ATP'].entries()) {
      const r = obj(470, 330 + i * 110, p.world)
      label(r, 0, 0, teks, 34)
      bunyi('tempel')
      await to(hide(r), { o: 1 }, 500)
    }
    label(p.world, 470, 540, '30 + 4 = 34 ATP', 40).dataset.objek = 'total-atp'
    label(p.world, 470, 640, '+ 2 glikolisis + 2 Krebs = 38 ATP', 28)
    label(p.world, 470, 240, 'PERHITUNGAN MENURUT BUKU', 26)
    bunyi('atp')
    await comic(p, '34 ATP!', 470, 165, 'var(--color-fosfat)', p.world)
    await say(
      p,
      'hitung',
      'Menurut perhitungan buku: tiap NADH setara tiga ATP, tiap FADH₂ dua ATP. Sepuluh kali tiga ditambah dua kali dua: tiga puluh empat ATP dari transpor elektron. Ditambah dua ATP glikolisis dan dua ATP siklus Krebs, total seluruh respirasi aerob tiga puluh delapan ATP.',
    )
  })
  catat('f')
  p.world.replaceChildren()
}
function teksSel(parent: Element, x: number, y: number, teks: string) {
  const t = el(
    'text',
    { 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 700, fill: 'var(--color-ink)' },
    parent,
  )
  const kata = teks.split(' ')
  const baris: string[] = ['']
  for (const k of kata) {
    if ((baris.at(-1)! + ' ' + k).length > 20) baris.push(k)
    else baris[baris.length - 1] += (baris.at(-1) ? ' ' : '') + k
  }
  baris.forEach((b, i) => {
    el('tspan', { x, y: y + i * 34 }, t).textContent = b
  })
}
async function tabel(p: Panggung) {
  bab('1.11')
  await say(
    p,
    'tabel',
    'Bandingkan keempat tahap respirasi aerob. Isi tabel per baris: bahan, tempat, oksigen, hasil, pembawa elektron, lalu ATP. Pada tabel oksigen, aerob menunjukkan kaitannya dengan respirasi aerob; O₂ tidak dikonsumsi langsung dalam dekarboksilasi atau siklus Krebs.',
  )
  const g = el('g', { 'data-tabel': '1.11' }, p.world)
  for (const [r, row] of TABEL.entries()) {
    g.replaceChildren()
    label(g, 800, 210, `1.11 · ${row.nama}`, 32)
    KOLOM.forEach((k, c) => teksSel(g, 320 + c * 320, 285, k))
    const cells = KOLOM.map((_, c) => {
      const im = el(
        'image',
        { href: selKosong, x: 180 + c * 320, y: 350, width: 280, height: 130 },
        g,
      )
      return im
    })
    for (const [c, benar] of row.sel.entries()) {
      cells[c].setAttribute('href', selAktif)
      const opsi = [...new Set([...row.sel, ...(r === 5 ? ['38'] : [])])]
      await mintaPilihan(
        p.signal,
        { judul: `1.11 · ${row.nama} · ${KOLOM[c]}`, opsi: opsi.map((teks) => ({ teks })) },
        opsi.indexOf(benar),
        () =>
          pesan(
            `Ingat ${row.nama.toLowerCase()} pada ${KOLOM[c]}. ${r === 5 ? '38 adalah total seluruh respirasi aerob.' : 'Bandingkan dengan episode tahap tersebut.'}`,
          ),
      )
      cells[c].setAttribute('href', selTerisi)
      teksSel(g, 320 + c * 320, 395, benar)
    }
  }
  catat('1.11')
  g.remove()
  label(p.world, 800, 400, '2 + 0 + 2 + 34 = 38 ATP', 46)
  await say(
    p,
    'tamat',
    'Respirasi aerob selesai. Menurut perhitungan buku, satu glukosa menghasilkan total tiga puluh delapan ATP. Buka lembar hasil untuk melihat jalur elektron dan tabel perbandingan empat tahap.',
  )
}
export async function episode(p: Panggung) {
  siapkan('muncul', 'geser', 'tempel', 'atp', 'selesai')
  useJawabanE4.getState().mulai()
  await pembuka(p)
  await kumpulkan(p)
  const m = membran(p)
  const hs: Objek[] = []
  await jalur(p, m, hs)
  await oksigen(p, m, hs)
  await kemiosmosis(p, m, hs)
  await hitung(p)
  bab('j')
  await mintaLengkapi(p.signal, 'Lengkapi pengertian transpor elektron', POTONGAN, RUMPANG)
  catat('j')
  await tabel(p)
  usePemutar.setState({ bab: BAB.length, kalimat: '' })
  return useJawabanE4.getState().selesaikan()
}
