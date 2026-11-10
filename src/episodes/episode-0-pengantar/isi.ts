export const SOAL = [
  {
    k: '1.5a',
    t: 'Nama reaksi (a)',
    judul: 'Reaksi (a) adalah…',
    opsi: ['Fotosintesis (anabolisme)', 'Respirasi aerob (katabolisme)', 'Fermentasi'],
    benar: 0,
    jawaban: 'Fotosintesis (anabolisme)',
    tanya: 'Karbon dioksida dan air menjadi glukosa dan oksigen. Reaksi apakah ini?',
    narasi: 'Fotosintesis adalah salah satu contoh anabolisme.',
    salah: 'Perhatikan hasilnya: pada reaksi (a), glukosa dibentuk, bukan diuraikan.',
  },
  {
    k: '1.5b',
    t: 'Energi reaksi (a)',
    judul: 'Energi apa yang dibutuhkan reaksi (a)?',
    opsi: ['Cahaya', 'ATP', 'Panas'],
    benar: 0,
    jawaban: 'Energi cahaya (foton)',
    tanya: 'Dari mana energi untuk reaksi (a)? Ketuk sumber energinya.',
    narasi: 'Energinya berasal dari cahaya matahari, berupa foton.',
    salah: 'Pada contoh fotosintesis ini, sumber energi yang masuk adalah cahaya matahari.',
  },
  {
    k: '1.5c',
    t: 'Senyawa reaksi (a)',
    judul: 'Apa perubahan senyawa pada reaksi (a)?',
    opsi: ['Sederhana → kompleks; memerlukan energi', 'Kompleks → sederhana; melepaskan energi'],
    benar: 0,
    jawaban:
      'Penyusunan senyawa kompleks dari senyawa sederhana dengan bantuan enzim; memerlukan energi (endergonik).',
    tanya: 'Bandingkan bahan dan hasilnya. Apa yang terjadi pada senyawanya?',
    narasi:
      'Senyawa sederhana disusun menjadi senyawa kompleks dengan bantuan enzim. Proses ini memerlukan energi, atau endergonik.',
    salah: 'Glukosa adalah hasil reaksi (a). Senyawa sederhana disusun menjadi senyawa kompleks.',
  },
  {
    k: '1.5d',
    t: 'Nama reaksi (b)',
    judul: 'Reaksi (b) adalah…',
    opsi: ['Fotosintesis (anabolisme)', 'Respirasi aerob (katabolisme)'],
    benar: 1,
    jawaban: 'Respirasi aerob (katabolisme)',
    tanya:
      'Glukosa dan oksigen menjadi karbon dioksida, air, dan menghasilkan energi. Reaksi apakah ini?',
    narasi: 'Respirasi aerob adalah salah satu contoh katabolisme.',
    salah: 'Pada reaksi (b), glukosa dipakai sebagai bahan, bukan dibentuk sebagai hasil.',
  },
  {
    k: '1.5e',
    t: 'Energi reaksi (b)',
    judul: 'Energi apa yang dihasilkan reaksi (b)?',
    opsi: ['ATP', 'Karbon dioksida (CO₂)', 'Air (H₂O)'],
    benar: 0,
    jawaban: 'Energi kimia berupa ATP',
    tanya: 'Ketuk hasil yang menyimpan energi kimia pada reaksi (b).',
    narasi:
      'Energi kimia disimpan dalam ATP. Karbon dioksida dan air adalah hasil berupa zat, bukan bentuk energinya.',
    salah: 'Pilih pembawa energi kimia. CO₂ dan H₂O adalah zat hasil reaksi.',
  },
  {
    k: '1.5f',
    t: 'Senyawa reaksi (b)',
    judul: 'Apa perubahan senyawa pada reaksi (b)?',
    opsi: ['Sederhana → kompleks; memerlukan energi', 'Kompleks → sederhana; melepaskan energi'],
    benar: 1,
    jawaban:
      'Penguraian senyawa kompleks menjadi senyawa sederhana dengan bantuan enzim; melepaskan energi berupa ATP (eksergonik).',
    tanya: 'Bandingkan bahan dan hasil reaksi (b). Apa perubahan senyawanya?',
    narasi:
      'Senyawa kompleks diuraikan menjadi senyawa sederhana dengan bantuan enzim. Proses ini melepaskan energi berupa ATP, atau eksergonik.',
    salah: 'Glukosa adalah bahan yang diuraikan menjadi senyawa lebih sederhana pada reaksi (b).',
  },
] as const
export type ButirE0 = (typeof SOAL)[number]['k']

export const TABEL = [
  {
    k: 'bahan',
    judul: 'Bahan',
    sel: ['Senyawa sederhana (CO₂, H₂O)', 'Senyawa kompleks (glukosa)'],
  },
  {
    k: 'energi',
    judul: 'Energi',
    sel: ['Memerlukan energi (endergonik)', 'Menghasilkan energi (eksergonik)'],
  },
  {
    k: 'tempat',
    judul: 'Tempat',
    sel: ['Kloroplas (tumbuhan), sitoplasma', 'Mitokondria, sitoplasma'],
    pengecoh: 'Terjadi di nukleus',
  },
  {
    k: 'oksigen',
    judul: 'Oksigen',
    sel: ['Tidak memerlukan oksigen bebas', 'Memerlukan oksigen (pada respirasi aerob)'],
    pengecoh: 'Selalu memerlukan oksigen',
  },
  {
    k: 'hasil',
    judul: 'Hasil',
    sel: ['Senyawa kompleks (glukosa, protein)', 'Senyawa sederhana (CO₂, H₂O)'],
  },
] as const
export type BarisE0 = (typeof TABEL)[number]['k']
export type BarisPilah = {
  k: BarisE0
  judul: string
  sel: readonly [string, string]
  pengecoh?: string
}

// Urutan atom: C, H, O. ATP di diagram adalah penanda energi, di luar persamaan bersih.
const co2 = { rumus: 'CO₂', jumlah: 6, atom: [1, 0, 2] }
const air = { rumus: 'H₂O', jumlah: 6, atom: [0, 2, 1] }
const glukosa = { rumus: 'C₆H₁₂O₆', jumlah: 1, atom: [6, 12, 6] }
const o2 = { rumus: 'O₂', jumlah: 6, atom: [0, 0, 2] }
export const reaksi = {
  a: { bahan: [co2, air], hasil: [glukosa, o2] },
  b: { bahan: [glukosa, o2], hasil: [co2, air] },
}
