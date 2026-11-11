export const BAB = [
  { k: 'g', t: 'Pembawa elektron' },
  { k: 'a', t: 'Elektron NADH' },
  { k: 'c', t: 'Elektron FADH₂', poe: true },
  { k: 'i', t: 'Oksigen menjadi air' },
  { k: 'e', t: 'Kemiosmosis' },
  { k: 'h', t: 'Hitung ATP', poe: true },
  { k: 'j', t: 'Pengertian' },
  { k: '1.11', t: 'Bandingkan empat tahap' },
] as const
export const BUTIR = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', '1.11'] as const
export type ButirE4 = (typeof BUTIR)[number]
export type PoeE4 = 'c' | 'h'
export const JALUR = { NADH: ['I', 'III', 'IV'], FADH2: ['II', 'III', 'IV'] } as const
export const MEMOMPA = ['I', 'III', 'IV'] as const
// Konversi mengikuti model perhitungan buku/kunci Aktivitas1.10.
export const PANEN = { NADH: 10, FADH2: 2, perNADH: 3, perFADH2: 2 }
export const ATP_TRANSPOR = PANEN.NADH * PANEN.perNADH + PANEN.FADH2 * PANEN.perFADH2
export const ATP_TOTAL = 2 + 0 + 2 + ATP_TRANSPOR
export const KOLOM = ['Glikolisis', 'Dekarboksilasi oksidatif', 'Siklus Krebs', 'Transpor elektron']
export const TABEL = [
  { nama: 'Bahan', sel: ['Glukosa', '2 asam piruvat', '2 asetil KoA', '10 NADH, 2 FADH₂'] },
  {
    nama: 'Tempat',
    sel: ['Sitosol', 'Matriks mitokondria', 'Matriks mitokondria', 'Membran krista'],
  },
  {
    nama: 'Oksigen',
    sel: [
      'Anaerob (tanpa oksigen)',
      'Aerob (memerlukan oksigen)',
      'Aerob (memerlukan oksigen)',
      'Aerob (memerlukan oksigen)',
    ],
  },
  {
    nama: 'Hasil',
    sel: ['2 asam piruvat, 2 ATP', '2 asetil KoA, 2 CO₂', '4 CO₂, 2 ATP', '34 ATP, 12 H₂O'],
  },
  {
    nama: 'Pembawa elektron',
    sel: ['2 NADH', '2 NADH', '6 NADH, 2 FADH₂', 'Dipakai: 10 NADH, 2 FADH₂'],
  },
  { nama: 'ATP yang terbentuk', sel: ['2 (bersih)', '0', '2', '34'] },
]
export const POE = {
  c: {
    judul: 'Di kompleks mana elektron FADH₂ masuk?',
    zat: ['Kompleks I', 'Kompleks II', 'Kompleks III'],
    alasan: [
      'NADH dan FADH₂ selalu masuk di kompleks I.',
      'FADH₂ masuk di kompleks II, yang tidak memompa H⁺, lalu lewat III dan IV.',
      'FADH₂ langsung masuk di kompleks III karena energinya lebih rendah.',
    ],
    balik: [
      'Kompleks I menerima elektron NADH. FADH₂ masuk di II.',
      'Ya. Jalur NADH melewati tiga kompleks pemompa, sedangkan jalur FADH₂ melewati dua.',
      'Elektron FADH₂ singgah di kompleks II sebelum III dan IV.',
    ],
    hasil: 'FADH₂ masuk di kompleks II, lalu III dan IV; kompleks II tidak memompa H⁺',
  },
  h: {
    judul: 'Dari 10 NADH dan 2 FADH₂, berapa ATP dari transpor elektron?',
    zat: ['30 ATP', '34 ATP', '38 ATP'],
    alasan: [
      'Hanya NADH menghasilkan ATP: 10 × 3 = 30.',
      '10 NADH × 3 ATP + 2 FADH₂ × 2 ATP = 34 ATP.',
      'Seluruh 38 ATP respirasi aerob terbentuk di transpor elektron.',
    ],
    balik: [
      'FADH₂ juga menyumbang ATP: 2 × 2 = 4 ATP.',
      'Ya. 30 + 4 = 34 ATP dari transpor elektron.',
      'Empat ATP lainnya terbentuk langsung: dua dari glikolisis dan dua dari siklus Krebs.',
    ],
    hasil: '34 ATP dari transpor elektron; total respirasi aerob 38 ATP',
  },
} satisfies Record<
  PoeE4,
  { judul: string; zat: string[]; alasan: string[]; balik: string[]; hasil: string }
>
export const POTONGAN = [
  'Transpor elektron adalah tahap akhir respirasi ',
  ' di ',
  '. Elektron dari NADH dan FADH₂ akhirnya diterima ',
  '. Aliran H⁺ melalui ',
  ' membentuk ATP dari ADP dan fosfat; juga terbentuk H₂O.',
]
export const RUMPANG = [
  {
    opsi: ['aerob', 'anaerob'],
    benar: 0,
    salah: { 1: 'Oksigen diperlukan sebagai akseptor elektron terakhir.' },
  },
  {
    opsi: ['sitosol', 'matriks', 'membran krista'],
    benar: 2,
    salah: {
      0: 'Sitosol adalah tempat glikolisis.',
      1: 'Kompleks protein dan ATP sintase berada di membran dalam mitokondria.',
    },
  },
  {
    opsi: ['CO₂', 'O₂', 'NAD⁺'],
    benar: 1,
    salah: {
      0: 'CO₂ adalah buangan tahap sebelumnya.',
      2: 'NAD⁺ terbentuk kembali setelah NADH menyerahkan elektron.',
    },
  },
  {
    opsi: ['ATP sintase', 'kompleks II'],
    benar: 0,
    salah: {
      1: 'Kompleks II menerima elektron FADH₂, bukan tempat H⁺ kembali untuk membentuk ATP.',
    },
  },
]
export const PENGERTIAN = POTONGAN.reduce(
  (a, t, i) => a + RUMPANG[i - 1].opsi[RUMPANG[i - 1].benar] + t,
)
export const JAWABAN: Record<ButirE4, string> = {
  a: 'Kompleks I menerima elektron NADH.',
  b: 'Elektron NADH mengalir melalui kompleks I → III → IV. I, III, IV memompa H⁺ dari matriks ke ruang antarmembran.',
  c: 'Kompleks II menerima elektron FADH₂, tanpa memompa H⁺.',
  d: 'Elektron FADH₂ mengalir melalui kompleks II → III → IV; hanya III dan IV memompa H⁺ pada jalur ini.',
  e: 'Aliran elektron memompa H⁺ dari matriks ke ruang antarmembran. H⁺ kembali lewat ATP sintase (kemiosmosis); energinya membentuk ATP dari ADP + fosfat. Elektron tidak melewati ATP sintase.',
  f: '1 NADH setara 3 ATP, 1 FADH₂ setara 2 ATP.',
  g: '10 NADH: 2 glikolisis + 2 dekarboksilasi oksidatif + 6 siklus Krebs; 2 FADH₂ dari siklus Krebs.',
  h: 'Transpor elektron: (10 × 3) + (2 × 2) = 34 ATP. Seluruh respirasi aerob: 2 + 0 + 2 + 34 = 38 ATP.',
  i: 'O₂ adalah akseptor elektron terakhir di kompleks IV. ½ O₂ + 2 H⁺ + 2 e⁻ → H₂O. Untuk 10 NADH + 2 FADH₂: 6 O₂ + 24 H⁺ + 24 e⁻ → 12 H₂O. Ini H⁺ pembentuk air, bukan jumlah H⁺ yang dipompa.',
  j: PENGERTIAN,
  '1.11':
    'Perbandingan enam variabel empat tahap respirasi aerob terisi. ATP: 2 (bersih) + 0 + 2 + 34 = 38 ATP.',
}
