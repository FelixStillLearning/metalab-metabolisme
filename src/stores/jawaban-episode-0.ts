import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { kendali } from '../features/pemutar-episode/mesin'
import { SOAL, TABEL, type ButirE0, type BarisE0 } from '../episodes/episode-0-pengantar/isi'

export type RekamE0 = {
  jawaban: Partial<Record<ButirE0, string>>
  tabel: Partial<Record<BarisE0, Partial<Record<0 | 1, string>>>>
}

export function lengkap(data: unknown): data is RekamE0 {
  if (!data || typeof data !== 'object') return false
  const { jawaban, tabel } = data as RekamE0
  return (
    SOAL.every((s) => jawaban?.[s.k] === s.jawaban) &&
    TABEL.every((r) => r.sel.every((teks, sisi) => tabel?.[r.k]?.[sisi as 0 | 1] === teks))
  )
}

type Penyimpanan = {
  draf: RekamE0
  hasil: RekamE0 | null
  penjelasan: string
  mulai: () => void
  catat: (butir: ButirE0) => void
  catatSel: (baris: BarisE0, sisi: 0 | 1) => void
  selesaikan: () => boolean
  simpanPenjelasan: (teks: string) => void
}

export const useJawabanE0 = create<Penyimpanan>()(
  persist(
    (set, get) => ({
      draf: { jawaban: {}, tabel: {} },
      hasil: null,
      penjelasan: '',
      mulai: () => {
        if (!kendali.otomatis) set({ draf: { jawaban: {}, tabel: {} } })
      },
      catat: (butir) => {
        const soal = SOAL.find((s) => s.k === butir)
        if (!kendali.otomatis && soal)
          set((s) => ({
            draf: { ...s.draf, jawaban: { ...s.draf.jawaban, [butir]: soal.jawaban } },
          }))
      },
      catatSel: (baris, sisi) => {
        const r = TABEL.find((r) => r.k === baris)
        if (!kendali.otomatis && r && (sisi === 0 || sisi === 1))
          set((s) => ({
            draf: {
              ...s.draf,
              tabel: { ...s.draf.tabel, [baris]: { ...s.draf.tabel[baris], [sisi]: r.sel[sisi] } },
            },
          }))
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
      name: 'metalab-jawaban-e0',
      partialize: ({ draf, hasil, penjelasan }) => ({ draf, hasil, penjelasan }),
      merge: (tersimpan, awal) => {
        const s = tersimpan as Partial<Penyimpanan> | null
        const draf: RekamE0 = { jawaban: {}, tabel: {} }
        for (const soal of SOAL)
          if (s?.draf?.jawaban?.[soal.k] === soal.jawaban) draf.jawaban[soal.k] = soal.jawaban
        for (const r of TABEL)
          for (const sisi of [0, 1] as const) {
            if (s?.draf?.tabel?.[r.k]?.[sisi] === r.sel[sisi])
              draf.tabel[r.k] = { ...draf.tabel[r.k], [sisi]: r.sel[sisi] }
          }
        return {
          ...awal,
          hasil: lengkap(s?.hasil) ? s.hasil : null,
          penjelasan: typeof s?.penjelasan === 'string' ? s.penjelasan : '',
          draf,
        }
      },
    },
  ),
)
