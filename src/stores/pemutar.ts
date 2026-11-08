import { create } from 'zustand'

export type PoseMaskot =
  | '01-ramah'
  | '02-santai'
  | '03-netral'
  | '04-penasaran'
  | '05-menjelaskan'
  | '06-kaget'
  | '07-bangga'
  | '08-menunjuk'
  | '09-melambaikan'

export type SoalPilihan = {
  judul: string
  // posisi dan ukuran dalam satuan adegan 1600x900; selesai = sasaran ketuk-semua yang sudah diketuk
  opsi: { teks: string; posisi?: [number, number]; ukuran?: [number, number]; selesai?: boolean }[]
  pilih: (index: number) => void
}

// Lengkapi kalimat: rumpang ke-terisi.length sedang aktif, opsi = pilihan rumpang itu
export type SoalLengkapi = {
  judul: string
  potongan: string[]
  terisi: string[]
  opsi: string[]
  pilih: (index: number) => void
}

export type PoeTahap = 'tebak' | 'amati' | 'jelaskan'

export type PoeTebakState = {
  tahap: 'tebak'
  judul: string
  reasons: string[]
  right: number
  // cap = keterangan di bawah zona; nampan = zona memakai gambar nampan G01, bukan zona taruh G02
  zone: { x: number; y: number; w: number; h: number; name: string; cap?: string; nampan?: boolean }
  supply: [number, number][]
  slot: (i: number, n: number) => [number, number]
  // Posisi kiri-atas kartu dalam persen, seperti cardAt di prototype
  kartu?: [number, number]
  placed: number[]
  alasan: number | null
  taruhToken: (tokenIdx: number) => void
  pilihAlasan: (alasanIdx: number) => void
  kunci: () => void
}

export type PoeAmatiState = {
  tahap: 'amati'
  gtagText: string
  // Jumlah tebakan dan satuannya, mis. "2 ATP", untuk penanda G14 setelah vonis
  tebakan: string
  statusTebakan?: 'benar' | 'salah' | null
  catatan?: string
}

export type PoeJelaskanState = {
  tahap: 'jelaskan'
  judul: string
  tadiText: string
  verdictText: string
  verdictTepat: boolean
  reasons: string[]
  back: string[]
  alasanBenar: number
  selectedExplain: number | null
  explainDone: boolean
  pilihExplain: (idx: number) => void
  lanjut: () => void
}

export type PoeState = PoeTebakState | PoeAmatiState | PoeJelaskanState

type Pemutar = {
  kalimat: string
  pose: PoseMaskot
  pendamping: PoseMaskot | null
  // -1 = pembuka
  bab: number
  dijeda: boolean
  pilihan: SoalPilihan | null
  lengkapi: SoalLengkapi | null
  poe: PoeState | null
}

// Keadaan sesaat pemutar episode; sengaja tidak disimpan
export const usePemutar = create<Pemutar>()(() => ({
  kalimat: '',
  pose: '01-ramah',
  pendamping: null,
  bab: -1,
  dijeda: false,
  pilihan: null,
  lengkapi: null,
  poe: null,
}))
