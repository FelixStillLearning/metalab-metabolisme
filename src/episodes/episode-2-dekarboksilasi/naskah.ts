import type { Panggung } from '../../features/pemutar-episode/mesin'
import { ucapKalimat } from '../../features/pemutar-episode/ucapKalimat'
import type { PoseMaskot } from '../../stores/pemutar'

export const NASKAH = {
  pembuka:
    'Dari satu glukosa, glikolisis menghasilkan dua asam piruvat. Keduanya menuju matriks mitokondria untuk diubah sebelum masuk siklus Krebs.',
  bahan: 'Pilih bahan awal dekarboksilasi oksidatif. Tiap asam piruvat memiliki tiga atom karbon.',
  'substrat-terpilih':
    'Benar. Asam piruvat adalah bahan awalnya. Ada dua asam piruvat dari satu glukosa, masing-masing memiliki tiga karbon. Totalnya enam karbon.',
  'jumlah-tahap':
    'Dua asam piruvat ini akan diubah menjadi asetil KoA. Ada berapa tahap utama dalam perubahan tersebut?',
  aerob:
    'Tahap ini berlangsung dalam suasana aerob. Oksigen mendukung kelanjutan respirasi melalui transpor elektron, tetapi tidak dikonsumsi langsung dalam reaksi ini.',
  tahap:
    'Tiga tahap utama: pelepasan gugus karboksil, oksidasi dan pembentukan NADH, lalu pengikatan koenzim A.',
  karboksil:
    'Ada dua asam piruvat. Masing-masing memiliki gugus karboksil di ujungnya: satu karbon yang membawa dua oksigen. Tebak bentuk karbon yang akan keluar.',
  lepas:
    'Satu karbon dan dua oksigen keluar sebagai CO₂ dari tiap piruvat. Tersisa gugus asetil dengan dua karbon: tiga sama dengan dua ditambah satu.',
  energi:
    'Karbon tidak hilang menjadi energi. Lihat lingkaran C yang tetap ada pada molekul yang lepas.',
  oksigen:
    'O₂ tidak memiliki karbon. Yang lepas membawa satu karbon dan dua oksigen dari gugus karboksil: CO₂.',
  oksidasi:
    'Tahap dua: gugus asetil dioksidasi dan melepas elektron berenergi tinggi. Pilih pembawa yang akan menangkap elektronnya.',
  nad: 'Satu NAD⁺ menangkap dua elektron dari tiap gugus asetil dan menjadi NADH. Dari dua piruvat, terbentuk dua NADH.',
  fad: 'FAD tidak menangkap elektron pada tahap ini. FAD dipakai di siklus Krebs. Di sini, pembawanya NAD⁺.',
  adp: 'ADP tidak menangkap elektron. Tahap ini tidak membentuk ATP langsung. Elektronnya ditangkap NAD⁺.',
  koa: 'Tahap tiga: ketuk tiap koenzim A untuk mengikat gugus asetil yang sudah dioksidasi.',
  terikat:
    'Terbentuk dua asetil KoA yang siap masuk siklus Krebs. Tiap gugus asetil tetap memiliki dua karbon. Lencana KoA tidak termasuk hitungan rangka karbon piruvat.',
  hasil: 'Kumpulkan semua hasil dari dua asam piruvat. Hati-hati, ada senyawa pengecoh.',
  karbon:
    'Ketuk tiap gugus asetil dan tiap CO₂ untuk menghitung keenam karbon asal piruvat. Hitung dua karbon tiap gugus asetil dan satu karbon tiap CO₂.',
  total:
    'Enam karbon asal satu glukosa: empat pada dua gugus asetil, dua pada dua CO₂. Tidak ada karbon yang hilang. Hasil totalnya dua asetil KoA, dua NADH, dan dua CO₂.',
  pengertian:
    'Lengkapi kalimat untuk menjelaskan tempat, perubahan zat, dan peran dekarboksilasi oksidatif.',
  selesai:
    'Dekarboksilasi oksidatif selesai. Dua asetil KoA siap masuk siklus Krebs. Buka lembar hasil untuk melihat jawaban dan membandingkan tebakanmu.',
} satisfies Record<string, string>
export function say(p: Panggung, id: keyof typeof NASKAH, pose: PoseMaskot = '05-menjelaskan') {
  return ucapKalimat(p, `e2-${id}`, { teks: NASKAH[id], pose })
}
