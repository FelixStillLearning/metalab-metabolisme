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
  opsi: { teks: string; posisi?: [number, number] }[]
  pilih: (index: number) => void
}

type Pemutar = {
  kalimat: string
  pose: PoseMaskot
  pendamping: PoseMaskot | null
  // -1 = pembuka
  bab: number
  dijeda: boolean
  pilihan: SoalPilihan | null
}

// Keadaan sesaat pemutar episode; sengaja tidak disimpan
export const usePemutar = create<Pemutar>()(() => ({
  kalimat: '',
  pose: '01-ramah',
  pendamping: null,
  bab: -1,
  dijeda: false,
  pilihan: null,
}))
