import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { kendali } from '../features/pemutar-episode/mesin'
import {
  BUTIR,
  JAWABAN,
  type ButirE4,
  type PoeE4,
} from '../episodes/episode-4-transpor-elektron/isi'
import type { PoeRekam } from './jawaban'

export type RekamE4 = {
  jawaban: Partial<Record<ButirE4, string>>
  poe: Partial<Record<PoeE4, PoeRekam>>
}
export function lengkap(data: unknown): data is RekamE4 {
  if (!data || typeof data !== 'object') return false
  const { jawaban, poe } = data as RekamE4
  return (
    BUTIR.every((k) => jawaban?.[k] === JAWABAN[k]) &&
    (['c', 'h'] as const).every((k) => {
      const p = poe?.[k]
      return (
        p &&
        [p.tebakan, p.alasan, p.penjelasan].every((n) => Number.isInteger(n) && n! >= 0 && n! < 3)
      )
    })
  )
}

type Penyimpanan = {
  draf: RekamE4
  hasil: RekamE4 | null
  penjelasan: string
  mulai: () => void
  catat: (butir: ButirE4) => void
  catatPoe: (butir: PoeE4, data: PoeRekam) => void
  selesaikan: () => boolean
  simpanPenjelasan: (teks: string) => void
}

const JAWABAN_LAMA: Partial<Record<ButirE4, string>> = {
  f: 'Menurut perhitungan buku: 1 NADH setara 3 ATP, 1 FADH₂ setara 2 ATP.',
  h: 'Transpor elektron: (10 × 3) + (2 × 2) = 34 ATP. Seluruh respirasi aerob: 2 + 0 + 2 + 34 = 38 ATP menurut buku.',
  '1.11':
    'Perbandingan enam variabel empat tahap respirasi aerob terisi. ATP: 2 (bersih) + 0 + 2 + 34 = 38 ATP menurut buku.',
}

export const useJawabanE4 = create<Penyimpanan>()(
  persist(
    (set, get) => ({
      draf: { jawaban: {}, poe: {} },
      hasil: null,
      penjelasan: '',
      mulai: () => {
        if (!kendali.otomatis) set({ draf: { jawaban: {}, poe: {} } })
      },
      catat: (butir) => {
        if (!kendali.otomatis)
          set((s) => ({
            draf: { ...s.draf, jawaban: { ...s.draf.jawaban, [butir]: JAWABAN[butir] } },
          }))
      },
      catatPoe: (butir, data) => {
        if (!kendali.otomatis)
          set((s) => ({ draf: { ...s.draf, poe: { ...s.draf.poe, [butir]: data } } }))
      },
      selesaikan: () => {
        if (kendali.otomatis) return lengkap(get().hasil)
        if (!lengkap(get().draf)) return false
        set({ hasil: get().draf })
        return true
      },
      simpanPenjelasan: (teks) => set({ penjelasan: teks.trim() }),
    }),
    {
      name: 'metalab-jawaban-e4',
      version: 1,
      migrate: (tersimpan) => {
        const s = tersimpan as Partial<Penyimpanan> | null
        // Perubahan redaksi tidak menghapus hasil dan draf yang sudah disimpan.
        for (const data of [s?.draf, s?.hasil]) {
          for (const k of BUTIR) {
            if (data?.jawaban && JAWABAN_LAMA[k] && data.jawaban[k] === JAWABAN_LAMA[k])
              data.jawaban[k] = JAWABAN[k]
          }
        }
        return {
          draf: s?.draf ?? { jawaban: {}, poe: {} },
          hasil: s?.hasil ?? null,
          penjelasan: s?.penjelasan ?? '',
        }
      },
      partialize: ({ draf, hasil, penjelasan }) => ({ draf, hasil, penjelasan }),
      merge: (tersimpan, awal) => {
        const s = tersimpan as Partial<Penyimpanan> | null
        const draf: RekamE4 = { jawaban: {}, poe: {} }
        for (const k of BUTIR)
          if (s?.draf?.jawaban?.[k] === JAWABAN[k]) draf.jawaban[k] = JAWABAN[k]
        for (const k of ['c', 'h'] as const) {
          const p = s?.draf?.poe?.[k]
          if (
            p &&
            [p.tebakan, p.alasan, p.penjelasan].every(
              (n) => Number.isInteger(n) && n! >= 0 && n! < 3,
            )
          )
            draf.poe[k] = { tebakan: p.tebakan, alasan: p.alasan, penjelasan: p.penjelasan }
        }
        return {
          ...awal,
          draf,
          hasil: lengkap(s?.hasil) ? s.hasil : null,
          penjelasan: typeof s?.penjelasan === 'string' ? s.penjelasan : '',
        }
      },
    },
  ),
)
