export const BAB = [
  { k: 'a', t: 'Substrat dan syarat' },
  { k: 'b', t: 'Tiga tahap' },
  { k: 'c', t: 'Pelepasan karboksil', poe: true },
  { k: 'b·2', t: 'Oksidasi', poe: true },
  { k: 'd', t: 'Pengikatan KoA' },
  { k: 'f', t: 'Hasil dan karbon' },
  { k: 'g', t: 'Pengertian' },
] as const
export type ButirE2 = (typeof BAB)[number]['k']
export type PoeE2 = 'c' | 'b·2'

export const POE = {
  c: {
    judul: 'Gugus karboksil lepas. Dalam bentuk apa karbonnya keluar?',
    zat: ['CO₂', 'O₂', 'energi'],
    alasan: [
      'Karbon itu berubah menjadi energi.',
      'Karbon keluar bersama dua oksigen dari gugus karboksil.',
      'Karbon keluar bersama oksigen yang kita hirup.',
    ],
    balik: [
      'Karbon tetap ada: keluar sebagai CO₂, lalu dapat dihembuskan.',
      'Ya. 3 = 2 + 1: dua karbon di gugus asetil, satu di CO₂.',
      'O₂ tidak mengandung karbon. Molekul yang lepas membawa satu karbon: CO₂.',
    ],
    hasil: 'satu karbon lepas sebagai CO₂ dari tiap asam piruvat',
  },
  'b·2': {
    judul: 'Pembawa mana yang menangkap elektron gugus asetil?',
    zat: ['NAD⁺', 'FAD', 'ADP'],
    alasan: [
      'Tahap ini membentuk ATP langsung, jadi yang dibutuhkan ADP.',
      'Elektron tiap gugus asetil ditangkap satu NAD⁺, menjadi NADH.',
      'FAD selalu dipakai setiap kali ada elektron yang lepas.',
    ],
    balik: [
      'Tahap ini tidak membentuk ATP langsung. Elektron berenergi tinggi dibawa NADH.',
      'Ya. Satu NAD⁺ untuk tiap gugus asetil, jadi terbentuk 2 NADH.',
      'FAD dipakai di siklus Krebs. Di tahap ini penangkapnya NAD⁺.',
    ],
    hasil: 'NAD⁺ menangkap elektron dan menjadi NADH, satu untuk tiap gugus asetil',
  },
} satisfies Record<
  PoeE2,
  { judul: string; zat: string[]; alasan: string[]; balik: string[]; hasil: string }
>

export const POTONGAN = [
  'Dekarboksilasi oksidatif menghubungkan ',
  '. Di ',
  ', gugus karboksil asam piruvat (3 C) dilepas sebagai ',
  ', lalu terbentuk ',
  ', disertai pembentukan ',
  '.',
]
export const RUMPANG = [
  {
    opsi: ['glikolisis dan siklus Krebs', 'siklus Krebs dan transpor elektron'],
    benar: 0,
    salah: { 1: 'Asetil KoA dari tahap ini menjadi bahan siklus Krebs.' },
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
    opsi: ['O₂', 'energi', 'CO₂'],
    benar: 2,
    salah: { 0: 'O₂ tidak membawa karbon.', 1: 'Karbon tidak hilang menjadi energi.' },
  },
  {
    opsi: ['asetil KoA (2 C)', 'glukosa (6 C)', 'asam piruvat (3 C)'],
    benar: 0,
    salah: { 1: 'Glukosa sudah dipecah pada glikolisis.', 2: 'Asam piruvat adalah substratnya.' },
  },
  {
    opsi: ['ATP dan FADH₂', 'NADH'],
    benar: 1,
    salah: { 0: 'Tahap ini tidak membentuk ATP atau FADH₂ langsung.' },
  },
]
export const PENGERTIAN = POTONGAN.reduce(
  (a, t, i) => a + RUMPANG[i - 1].opsi[RUMPANG[i - 1].benar] + t,
)
export const JAWABAN: Record<ButirE2, string> = {
  a: '2 asam piruvat (masing-masing 3 C) hasil glikolisis dari 1 glukosa; dalam suasana aerob. O₂ tidak dikonsumsi langsung pada reaksi ini.',
  b: '3 tahap: pelepasan gugus karboksil, oksidasi dan pembentukan NADH, lalu pengikatan koenzim A.',
  c: 'Gugus karboksil lepas sebagai CO₂; tiap piruvat 3 C menyisakan gugus asetil 2 C. Total 2 CO₂ dari 2 piruvat.',
  'b·2': 'Elektron gugus asetil ditangkap NAD⁺ menjadi NADH. Terbentuk 2 NADH dari 2 piruvat.',
  d: 'Gugus asetil yang sudah dioksidasi diikat koenzim A menjadi 2 asetil KoA, siap masuk siklus Krebs.',
  f: '2 asetil KoA, 2 NADH, 2 CO₂. Karbon: 6 = 4 pada dua gugus asetil + 2 pada dua CO₂. Tidak membentuk ATP atau FADH₂ langsung.',
  g: PENGERTIAN,
}
