import { hide, kinetik, to, type Objek, type Panggung } from '../../features/pemutar-episode/mesin'
import {
  mintaJelaskan,
  mintaTebak,
  tandaiAmati,
  tampilkanAmati,
} from '../../features/pemutar-episode/poe'
import { bunyi } from '../../lib/suara'
import { useJawaban } from '../../stores/jawaban'
import { usePemutar } from '../../stores/pemutar'
import { badge } from './molekul'
import { say } from './naskah'

// Amati soal e, seperti bersihAnim() di prototype: 2 dipakai, 4 terbentuk, 2 menggantikan
// yang dipakai, tersisa 2 ATP bersih
async function bersihAnim(p: Panggung, g: number) {
  p.fx.replaceChildren()
  // Jarak lencana 140 (prototype 120): lencana gambar lebih lebar dari lencana kode
  const used = [0, 1].map((i) => hide(badge(p, 170 + i * 140, 620, 'ATP', p.fx)))
  const lu = hide(kinetik(p, 240, 560, '−2 DIPAKAI', 36, 'var(--color-hot)'))
  await Promise.all([...used.map((u) => to(u, { o: 1 }, 500)), to(lu, { o: 1 }, 500)])
  await say(p, 'e1-e-02', { tambah: -600 })

  const made = [0, 1, 2, 3].map((i) => hide(badge(p, 460 + i * 140, 620, 'ATP', p.fx)))
  const lm = hide(kinetik(p, 670, 560, '+4 TERBENTUK', 36, 'var(--color-ok)'))
  bunyi('atp')
  await Promise.all([...made.map((m) => to(m, { o: 1 }, 500)), to(lm, { o: 1 }, 500)])
  await say(p, 'e1-e-03', { tambah: -600 })
  if (g === 4) await say(p, 'e1-e-04', { tambah: -600 })
  if (g === 6) await say(p, 'e1-e-05', { tambah: -600 })
  await say(p, 'e1-e-06', { tambah: -1200 })

  for (let i = 0; i < 2; i++) {
    await to(made[i], { x: used[i]._x, y: 620 }, 700)
    bunyi('klik')
    await Promise.all([to(made[i], { o: 0, s: 0.6 }, 300), to(used[i], { o: 0 }, 300)])
  }
  await Promise.all([
    to(lu, { o: 0 }, 300),
    to(lm, { o: 0 }, 300),
    to(made[2], { x: 340, y: 620, s: 1.2 }, 700),
    to(made[3], { x: 500, y: 620, s: 1.2 }, 700),
  ])
  const net = hide(kinetik(p, 420, 480, 'ATP BERSIH = 4 − 2 = 2', 44, 'var(--color-paper)'))
  if (g === 2) {
    bunyi('tepat')
    tandaiAmati('benar')
  } else {
    bunyi('belum-tepat')
    tandaiAmati(
      'salah',
      g === 4
        ? '2 ATP yang dipakai belum dikurangkan'
        : g === 6
          ? 'ATP yang dipakai malah ditambahkan'
          : 'yang tersisa 4 − 2',
    )
  }
  await to(net, { o: 1, s: 1.08 }, 500)
  await to(net, { s: 1 }, 300)
  await say(p, 'e1-e-07')

  // Kartu Jelaskan tetap di tengah; persamaan di atasnya, dua ATP bersih di sisi kanan.
  for (const o of [...used, lu, lm, ...made.slice(0, 2)]) o.remove()
  const hp = matchMedia(HP_MIRING).matches
  const skala = p.svg.getBoundingClientRect().width / 1600
  // Di HP, persamaan tetap 18 px pada baris 108 px, antara popup dan kartu Jelaskan.
  await Promise.all([
    to(net, { x: 800, y: hp ? 108 / skala : 210, s: hp ? 0.4 / skala : 1 }, 600),
    ...made.slice(2).map((m, i) => to(m, { x: 1490, y: 420 + i * 140 }, 600)),
  ])
}

// Juga dibaca Lembar Hasil untuk menampilkan alasan siswa
export const ALASAN_E = [
  'Glikolisis membentuk 4 ATP, jadi bersihnya 4.',
  'Terbentuk 4 ATP, dikurangi 2 ATP yang dipakai di awal.',
  'ATP yang dipakai di awal ikut dihitung, jadi 4 + 2 = 6.',
]

// Sama dengan media query HP miring di pemutar-episode.css (kartu tebakan di kanan)
const HP_MIRING = '(max-height: 500px) and (orientation: landscape)'

// Di HP miring kartu tebakan menutupi hasil soal d di tengah-kanan. Hasilnya disusun ulang
// tiga baris di ruang kosong kiri atas (di bawah petunjuk, di atas nampan, di kiri token ATP):
// H₂O dan NADH, kedua piruvat, lalu 4 ATP.
function rapatkanHasilHp(p: Panggung, piruvat: Objek[]) {
  if (!matchMedia(HP_MIRING).matches) return
  const k = 0.75
  const ambil = (pemilih: string) => [...p.world.querySelectorAll<Objek>(`:scope > ${pemilih}`)]
  const pindah = (o: Objek, x: number, y: number) => to(o, { x, y, s: o._s * k }, 700)
  return Promise.all([
    ...ambil('[data-molecule="h2o"]').map((o, i) => pindah(o, 100 + i * 95, 280)),
    ...ambil('[data-carrier="NADH"]').map((o, i) => pindah(o, 340 + i * 135, 290)),
    ...piruvat.map((o, i) => pindah(o, 160 + i * 200, 395)),
    ...ambil('[data-carrier="ATP"]').map((o, i) => pindah(o, 120 + i * 110, 490)),
  ])
}

export async function soalE(p: Panggung, piruvat: Objek[]) {
  usePemutar.setState({ bab: 4 })
  p.fx.replaceChildren()
  await Promise.all([say(p, 'e1-e-01'), rapatkanHasilHp(p, piruvat)])

  const reasons = ALASAN_E
  const hp = matchMedia(HP_MIRING).matches
  const nampanX = hp ? 580 : 800
  const nampanY = hp ? 600 : 770
  const P = await mintaTebak(p.signal, {
    judul: 'Berapa ATP bersih yang dihasilkan glikolisis?',
    reasons,
    right: 2,
    // Nampan di bawah kartu pada desktop; di kiri kartu pada HP miring.
    kartu: [3, 7],
    zone: {
      x: nampanX,
      y: nampanY,
      w: 680,
      h: hp ? 170 : 130,
      name: 'nampan ATP bersih',
      cap: 'ATP bersih untuk sel',
      nampan: true,
    },
    supply: [0, 1, 2, 3, 4, 5].map((i) => [640 + (i % 3) * 100, i < 3 ? 330 : 430]),
    slot: (i, n) => [nampanX + (i - (n - 1) / 2) * 100, nampanY],
  })
  useJawaban.getState().catatPoe('e', { tebakan: P.g, alasan: P.r })
  tampilkanAmati(P.g, 'ATP bersih')

  // Piruvat disimpan untuk perjalanan akhir, tetapi tidak mengganggu perhitungan ATP.
  for (const c of Array.from(p.world.children) as Objek[]) {
    if (!c.dataset.objek)
      void to(c, { o: 0 }, 400).then(() => {
        if (!piruvat.includes(c)) c.remove()
      })
  }
  await bersihAnim(p, P.g)

  const x = await mintaJelaskan(p.signal, {
    g: P.g,
    r: P.r,
    unit: 'ATP',
    reasons,
    back: [
      'Glikolisis memang membentuk 4 ATP, tetapi 2 di antaranya menggantikan ATP yang dipakai di awal.',
      'Ya. 4 terbentuk − 2 dipakai = 2 ATP bersih.',
      'ATP yang dipakai justru dikurangkan, bukan ditambahkan.',
    ],
    right: 2,
    alasanBenar: 1,
    hasil: 'ATP bersihnya 2',
  })
  useJawaban.getState().catatPoe('e', { penjelasan: x })
  useJawaban.getState().catat('e', '2 ATP bersih (4 terbentuk − 2 dipakai)')
}
