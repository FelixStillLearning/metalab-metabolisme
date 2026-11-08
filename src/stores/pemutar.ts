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

type Pemutar = {
  kalimat: string
  pose: PoseMaskot
  pendamping: PoseMaskot | null
  // -1 = pembuka
  bab: number
  dijeda: boolean
}

// Keadaan sesaat pemutar episode; sengaja tidak disimpan
export const usePemutar = create<Pemutar>()(() => ({
  kalimat: '',
  pose: '01-ramah',
  pendamping: null,
  bab: -1,
  dijeda: false,
}))
