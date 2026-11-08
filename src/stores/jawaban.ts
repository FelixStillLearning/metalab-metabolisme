import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Jawaban = Partial<Record<'a' | 'b', string>>
type Penyimpanan = {
  draf: Jawaban
  hasil: Jawaban | null
  mulai: () => void
  catat: (butir: keyof Jawaban, jawaban: string) => void
}

// Draf putaran baru tidak mengganti hasil sampai siswa masuk Lembar Hasil.
export const useJawaban = create<Penyimpanan>()(
  persist(
    (set) => ({
      draf: {},
      hasil: null,
      mulai: () => set({ draf: {} }),
      catat: (butir, jawaban) => set((s) => ({ draf: { ...s.draf, [butir]: jawaban } })),
    }),
    { name: 'metalab-jawaban', partialize: ({ draf, hasil }) => ({ draf, hasil }) },
  ),
)
