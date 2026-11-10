import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { kendali } from '../features/pemutar-episode/mesin'
import { BAB, JAWABAN, type ButirE2, type PoeE2 } from '../episodes/episode-2-dekarboksilasi/isi'
import type { PoeRekam } from './jawaban'

export type RekamE2 = {
  jawaban: Partial<Record<ButirE2, string>>
  poe: Partial<Record<PoeE2, PoeRekam>>
}
export function lengkap(data: unknown): data is RekamE2 {
  if (!data || typeof data !== 'object') return false
  const { jawaban, poe } = data as RekamE2
  return (
    BAB.every(({ k }) => jawaban?.[k] === JAWABAN[k]) &&
    (['c', 'b·2'] as const).every((k) => {
      const p = poe?.[k]
      return (
        p &&
        [p.tebakan, p.alasan, p.penjelasan].every((n) => Number.isInteger(n) && n! >= 0 && n! < 3)
      )
    })
  )
}

type Penyimpanan = {
  draf: RekamE2
  hasil: RekamE2 | null
  penjelasan: string
  mulai: () => void
  catat: (butir: ButirE2) => void
  catatPoe: (butir: PoeE2, data: PoeRekam) => void
  selesaikan: () => boolean
  simpanPenjelasan: (teks: string) => void
}
export const useJawabanE2 = create<Penyimpanan>()(
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
      name: 'metalab-jawaban-e2',
      partialize: ({ draf, hasil, penjelasan }) => ({ draf, hasil, penjelasan }),
      merge: (tersimpan, awal) => {
        const s = tersimpan as Partial<Penyimpanan> | null
        const draf: RekamE2 = { jawaban: {}, poe: {} }
        for (const { k } of BAB)
          if (s?.draf?.jawaban?.[k] === JAWABAN[k]) draf.jawaban[k] = JAWABAN[k]
        for (const k of ['c', 'b·2'] as const) {
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
