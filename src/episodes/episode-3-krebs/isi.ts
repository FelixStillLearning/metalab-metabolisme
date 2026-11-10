export const BAB = [
  { k: 'a', t: 'Substrat' },
  { k: 'b', t: 'Pengikat asetil KoA' },
  { k: 'c', t: 'Delapan tahap' },
  { k: 'i·1', t: 'Karbon keluar', poe: true },
  { k: 'd', t: 'Penambahan air' },
  { k: 'e', t: 'Pembentukan ATP' },
  { k: 'f', t: 'Pembentukan NADH' },
  { k: 'g', t: 'Pembentukan FADH₂' },
  { k: 'i·2', t: 'Jumlah putaran', poe: true },
  { k: 'j', t: 'Pengertian' },
] as const
export type ButirE3 = (typeof BAB)[number]['k']
export type PoeE3 = 'i·1' | 'i·2'

export const TAHAP = [
  { nama: 'Sitrat', karbon: 6, air: true, hasil: null },
  { nama: 'Isositrat', karbon: 6, air: false, hasil: null },
  { nama: 'α-ketoglutarat', karbon: 5, air: false, hasil: 'NADH' },
  { nama: 'Suksinil KoA', karbon: 4, air: false, hasil: 'NADH' },
  { nama: 'Suksinat', karbon: 4, air: false, hasil: 'ATP' },
  { nama: 'Fumarat', karbon: 4, air: false, hasil: 'FADH₂' },
  { nama: 'Malat', karbon: 4, air: true, hasil: null },
  { nama: 'Oksaloasetat', karbon: 4, air: false, hasil: 'NADH' },
] as const
export function total(putaran: number) {
  return { NADH: 3 * putaran, FADH2: putaran, ATP: putaran, CO2: 2 * putaran }
}
export const ZAT = [
  {
    k: 'd',
    nama: 'H₂O',
    tahap: [1, 7],
    pesan: 'Air ditambahkan saat sitrat terbentuk dan saat fumarat menjadi malat.',
  },
  {
    k: 'e',
    nama: 'ATP',
    tahap: [5],
    pesan: 'ATP (GTP) terbentuk saat suksinil KoA menjadi suksinat, pada tahap 5.',
  },
  {
    k: 'f',
    nama: 'NADH',
    tahap: [3, 4, 8],
    pesan: 'NAD⁺ menerima elektron pada tahap 3, 4, dan 8. Tahap 6 memakai FAD.',
  },
  {
    k: 'g',
    nama: 'FADH₂',
    tahap: [6],
    pesan: 'FAD menerima elektron saat suksinat menjadi fumarat, pada tahap 6.',
  },
] as const
export const POE = {
  'i·1': {
    judul: 'Di tahap mana karbon keluar dari siklus sebagai CO₂?',
    zat: ['Tidak ada', 'Tahap 3 dan 4', 'Tahap 8'],
    alasan: [
      'Karbon tetap berputar dan tidak pernah keluar.',
      'Dua karbon lepas sebagai CO₂ di tahap 3 dan 4: 6 C kembali menjadi 4 C.',
      'Karbon keluar di akhir siklus saat oksaloasetat terbentuk lagi.',
    ],
    balik: [
      'Jumlah karbon turun dari 6 ke 4. Dua karbon keluar sebagai CO₂.',
      'Ya. Satu CO₂ di tahap 3 dan satu lagi di tahap 4: 6 → 5 → 4.',
      'Pada tahap 8 tidak ada karbon keluar; jumlahnya tetap 4 C.',
    ],
    hasil: 'CO₂ lepas di tahap 3 dan 4: 6 C → 5 C → 4 C',
  },
  'i·2': {
    judul: 'Satu glukosa menjalankan berapa putaran siklus Krebs?',
    zat: ['1 putaran', '2 putaran', '4 putaran'],
    alasan: [
      'Satu glukosa masuk satu kali, jadi satu putaran.',
      'Satu glukosa menghasilkan 2 asetil KoA; tiap asetil KoA menjalankan satu putaran.',
      'Tiap asetil KoA perlu dua putaran sampai karbonnya habis.',
    ],
    balik: [
      'Yang masuk ke siklus adalah dua asetil KoA dari satu glukosa.',
      'Ya. Dua asetil KoA menjalankan dua putaran.',
      'Satu asetil KoA menjalankan satu putaran. Dua asetil KoA berarti dua putaran.',
    ],
    hasil: '2 putaran per glukosa: 6 NADH, 2 FADH₂, 2 ATP, 4 CO₂',
  },
} satisfies Record<
  PoeE3,
  { judul: string; zat: string[]; alasan: string[]; balik: string[]; hasil: string }
>

export const POTONGAN = [
  'Siklus Krebs adalah rangkaian reaksi ',
  ' di ',
  ' yang mengoksidasi ',
  ' menjadi CO₂ dan menghasilkan ',
  ' untuk transpor elektron.',
]
export const RUMPANG = [
  {
    opsi: ['aerobik', 'anaerobik'],
    benar: 0,
    salah: {
      1: 'O₂ diperlukan pada transpor elektron untuk regenerasi pembawa; tidak dikonsumsi langsung di siklus.',
    },
  },
  {
    opsi: ['sitosol', 'matriks mitokondria', 'membran krista'],
    benar: 1,
    salah: {
      0: 'Sitosol adalah tempat glikolisis.',
      2: 'Membran krista adalah tempat transpor elektron.',
    },
  },
  {
    opsi: ['glukosa', 'asam piruvat', 'asetil KoA'],
    benar: 2,
    salah: {
      0: 'Glukosa sudah dipecah pada glikolisis.',
      1: 'Piruvat diubah menjadi asetil KoA pada dekarboksilasi oksidatif.',
    },
  },
  {
    opsi: ['ATP serta NADH dan FADH₂', 'hanya ATP'],
    benar: 0,
    salah: { 1: 'NADH dan FADH₂ membawa elektron ke transpor elektron.' },
  },
]
export const PENGERTIAN = POTONGAN.reduce(
  (a, t, i) => a + RUMPANG[i - 1].opsi[RUMPANG[i - 1].benar] + t,
)
export const JAWABAN: Record<ButirE3, string> = {
  a: 'Asetil KoA (2 C) hasil dekarboksilasi oksidatif.',
  b: 'Oksaloasetat (4 C) mengikat gugus asetil (2 C), bersama H₂O membentuk sitrat (6 C); KoA dilepas. Untuk 2 asetil KoA terjadi 2 pengikatan oleh oksaloasetat, yang terbentuk kembali di akhir tiap putaran.',
  c: '8 tahap: sitrat, isositrat, α-ketoglutarat, suksinil KoA, suksinat, fumarat, malat, lalu oksaloasetat terbentuk kembali.',
  'i·1':
    'CO₂ keluar pada tahap 3 (6 C → 5 C) dan 4 (5 C → 4 C): 2 CO₂ per putaran. Dua karbon masuk dari gugus asetil; oksaloasetat 4 C terbentuk kembali. Ini hitungan jumlah C, bukan pelacakan asal atom CO₂.',
  d: 'H₂O ditambahkan pada tahap 1 dan 7.',
  e: 'ATP (GTP) terbentuk pada tahap 5.',
  f: 'NADH terbentuk pada tahap 3, 4, dan 8.',
  g: 'FADH₂ terbentuk pada tahap 6.',
  'i·2':
    'Per putaran: 3 NADH, 1 FADH₂, 1 ATP, 2 CO₂. Per glukosa (2 asetil KoA, 2 putaran): 6 NADH, 2 FADH₂, 2 ATP, 4 CO₂.',
  j: PENGERTIAN,
}
