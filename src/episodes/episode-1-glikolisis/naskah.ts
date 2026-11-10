// Narasi utama Episode 1, disalin dari naskah narasi versi 1 (ID sama dengan nama berkas rekaman).
// Kalimat yang berubah dicatat juga di riwayat naskah agar rekaman ikut diperbarui.
import type { Panggung } from '../../features/pemutar-episode/mesin'
import { ucapKalimat } from '../../features/pemutar-episode/ucapKalimat'
import type { PoseMaskot } from '../../stores/pemutar'

export const NASKAH = {
  'e1-pembuka-01': {
    teks: 'Kamu makan nasi. Di dalam tubuh, nasi dicerna menjadi glukosa, lalu glukosa masuk ke dalam sel.',
    pose: '01-ramah',
  },
  'e1-pembuka-02': {
    teks: 'Itu mitokondria. Glikolisis belum terjadi di sini.',
    pose: '08-menunjuk',
  },
  'e1-pembuka-03': {
    teks: 'Pemecahan glukosa dimulai di sitosol, cairan sel di luar mitokondria.',
    pose: '05-menjelaskan',
  },
  'e1-a-01': {
    teks: 'Tiga molekul ada di sekitar sitosol. Hanya satu yang menjadi bahan glikolisis.',
    pose: '05-menjelaskan',
  },
  'e1-a-02': {
    teks: 'Glukosa: satu cincin dengan enam atom karbon. Hitung lingkaran C-nya.',
    pose: '05-menjelaskan',
  },
  'e1-b-01': {
    teks: 'Perjalanan glukosa menjadi asam piruvat dibagi menjadi beberapa tahap utama.',
    pose: '05-menjelaskan',
  },
  'e1-b-02': {
    teks: 'Dua tahap: fase investasi energi, yang memakai ATP, lalu fase pembentukan energi, yang menghasilkan ATP.',
    pose: '05-menjelaskan',
  },
  'e1-c-01': {
    teks: 'Glukosa itu molekul yang stabil. Untuk memecahnya, sel harus menanam energi lebih dulu.',
    pose: '05-menjelaskan',
  },
  'e1-c-atp-1': { teks: 'Satu ATP datang.', pose: '05-menjelaskan' },
  'e1-c-atp-2': { teks: 'Dua ATP datang.', pose: '05-menjelaskan' },
  'e1-c-atp-3': { teks: 'Tiga ATP datang.', pose: '05-menjelaskan' },
  'e1-c-02': {
    teks: 'ATP memberikan satu fosfat ke glukosa, lalu berubah menjadi ADP.',
    pose: '05-menjelaskan',
  },
  'e1-c-03': { teks: 'Dengan satu fosfat, glukosa belum bisa dipecah.', pose: '05-menjelaskan' },
  'e1-c-04': { teks: 'Sel menambahkan satu ATP lagi.', pose: '05-menjelaskan' },
  'e1-c-05': {
    teks: 'Glukosa sudah membawa dua fosfat. ATP ketiga tidak terpakai.',
    pose: '05-menjelaskan',
  },
  'e1-c-06': { teks: 'Dengan dua fosfat, glukosa menjadi tidak stabil...', pose: '05-menjelaskan' },
  'e1-c-07': {
    teks: 'Glukosa terbelah menjadi 2 PGAL. Hitung karbonnya: 3 dan 3, tetap 6. Tidak ada karbon yang hilang.',
    pose: '08-menunjuk',
  },
  'e1-d-01': {
    teks: 'Tiap PGAL melepas dua elektron berenergi tinggi. Kedua elektron itu ditangkap oleh satu NAD⁺.',
    pose: '05-menjelaskan',
  },
  'e1-d-02': {
    teks: 'NAD⁺ menjadi NADH. Tiap molekul juga mengikat satu fosfat bebas, jadi kini membawa dua fosfat.',
    pose: '05-menjelaskan',
  },
  'e1-d-03': {
    teks: 'Sekarang panen fosfatnya. Setiap fosfat bisa mengubah satu ADP menjadi ATP.',
    pose: '05-menjelaskan',
  },
  'e1-d-04': {
    teks: 'Empat fosfat, empat ATP. Molekulnya berubah menjadi asam piruvat dan melepas dua molekul air.',
    pose: '05-menjelaskan',
  },
  'e1-e-01': { teks: 'Sekarang hitung untung-ruginya.', pose: '05-menjelaskan' },
  'e1-e-02': { teks: 'Di awal, 2 ATP dipakai untuk fase investasi.', pose: '05-menjelaskan' },
  'e1-e-03': { teks: 'Di fase pembentukan, 4 ATP terbentuk.', pose: '05-menjelaskan' },
  'e1-e-04': {
    teks: 'Kalau berhenti di sini, hasilnya 4 seperti tebakanmu. Tapi ada 2 ATP yang sudah dipakai di awal.',
    pose: '05-menjelaskan',
  },
  'e1-e-05': {
    teks: 'Tebakanmu 6 menjumlahkan keduanya. Tapi ATP yang dipakai di awal bukan hasil; ATP itu habis terpakai.',
    pose: '05-menjelaskan',
  },
  'e1-e-06': {
    teks: 'Dua ATP yang baru menggantikan dua ATP yang sudah dipakai.',
    pose: '05-menjelaskan',
  },
  'e1-e-07': {
    teks: 'Yang benar-benar tersisa untuk sel: empat terbentuk dikurangi dua dipakai, sama dengan dua ATP bersih.',
    pose: '05-menjelaskan',
  },
  'e1-g-01': {
    teks: 'Apa saja yang dihasilkan glikolisis? Kumpulkan semua hasilnya, dan jangan ambil yang bukan hasil.',
    pose: '05-menjelaskan',
  },
  'e1-g-02': {
    teks: 'Hasil glikolisis: 2 asam piruvat, 2 NADH, 2 ATP bersih, dan 2 molekul air.',
    pose: '07-bangga',
  },
  'e1-h-01': {
    teks: 'Satu pertanyaan terakhir sebelum asam piruvat melanjutkan perjalanannya.',
    pose: '05-menjelaskan',
  },
  'e1-h-02': { teks: 'Lengkapi kalimat pengertian glikolisis ini.', pose: '04-penasaran' },
  'e1-h-03': {
    teks: 'Glikolisis adalah pemecahan satu glukosa berkarbon enam menjadi dua asam piruvat berkarbon tiga, di sitosol, tanpa oksigen, dengan hasil sampingan 2 NADH dan 2 ATP.',
    pose: '05-menjelaskan',
  },
  'e1-h-04': {
    teks: 'Asam piruvat bergerak menuju mitokondria. Bersambung ke episode dekarboksilasi oksidatif.',
    pose: '09-melambaikan',
  },
  'e1-hasil-01': {
    teks: 'Ini bagan glikolisismu. Jawabanmu menempel di setiap bagiannya.',
    pose: '07-bangga',
  },
  'e1-penutup-01': { teks: 'Satu tahap selesai: glikolisis.', pose: '07-bangga' },
  'e1-penutup-02': {
    teks: 'Bila ada oksigen, kedua asam piruvat masuk ke mitokondria untuk tahap berikutnya.',
    pose: '05-menjelaskan',
  },
  'e1-penutup-03': {
    teks: 'Sampai jumpa di episode dekarboksilasi oksidatif!',
    pose: '09-melambaikan',
  },
} satisfies Record<string, { teks: string; pose: PoseMaskot }>

export type IdNaskah = keyof typeof NASKAH

// Seperti say() di prototype: kalimat tampil paling sedikit 1,6 detik atau 55 ms per huruf,
// dan adegan menunggu sampai narasinya juga selesai. Putar ulang otomatis tanpa narasi suara.
export async function say(
  p: Panggung,
  id: IdNaskah,
  { tambah = 0, pendamping }: { tambah?: number; pendamping?: PoseMaskot } = {},
) {
  await ucapKalimat(p, id, NASKAH[id], { tambah, pendamping })
}
