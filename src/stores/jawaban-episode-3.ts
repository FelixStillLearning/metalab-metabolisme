import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { kendali } from '../features/pemutar-episode/mesin'
import { BAB, JAWABAN, type ButirE3, type PoeE3 } from '../episodes/episode-3-krebs/isi'
import type { PoeRekam } from './jawaban'

export type RekamE3 = {
  jawaban: Partial<Record<ButirE3, string>>
  poe: Partial<Record<PoeE3, PoeRekam>>
}
export function lengkap(data: unknown): data is RekamE3 {
  if (!data || typeof data !== 'object') return false
  const { jawaban, poe } = data as RekamE3
  return (
    BAB.every(({ k }) => jawaban?.[k] === JAWABAN[k]) &&
    (['i·1', 'i·2'] as const).every((k) => {
      const p = poe?.[k]
      return (
        p &&
        [p.tebakan, p.alasan, p.penjelasan].every((n) => Number.isInteger(n) && n! >= 0 && n! < 3)
      )
    })
  )
}

type Penyimpanan = {
  draf: RekamE3
  hasil: RekamE3 | null
  penjelasan: string
  mulai: () => void
  catat: (butir: ButirE3) => void
  catatPoe: (butir: PoeE3, data: PoeRekam) => void
  selesaikan: () => boolean
  simpanPenjelasan: (teks: string) => void
}
export const useJawabanE3 = create<Penyimpanan>()(
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
      name: 'metalab-jawaban-e3',
      partialize: ({ draf, hasil, penjelasan }) => ({ draf, hasil, penjelasan }),
      merge: (tersimpan, awal) => {
        const s = tersimpan as Partial<Penyimpanan> | null
        const draf: RekamE3 = { jawaban: {}, poe: {} }
        for (const { k } of BAB)
          if (s?.draf?.jawaban?.[k] === JAWABAN[k]) draf.jawaban[k] = JAWABAN[k]
        for (const k of ['i·1', 'i·2'] as const) {
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
