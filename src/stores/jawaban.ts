import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PoeRekam = {
  tebakan: number
  alasan: number
  penjelasan?: number
}

type ButirJawaban = 'a' | 'b' | 'c' | 'd' | 'e' | 'g' | 'h'
type Jawaban = Partial<Record<ButirJawaban, string>>
type DataPoe = Partial<Record<'c' | 'e', PoeRekam>>

type Penyimpanan = {
  draf: Jawaban
  drafPoe: DataPoe
  hasil: Jawaban | null
  hasilPoe: DataPoe | null
  mulai: () => void
  catat: (butir: ButirJawaban, jawaban: string) => void
  catatPoe: (butir: 'c' | 'e', data: Partial<PoeRekam>) => void
}

// Draf putaran baru tidak mengganti hasil sampai siswa masuk Lembar Hasil.
export const useJawaban = create<Penyimpanan>()(
  persist(
    (set) => ({
      draf: {},
      drafPoe: {},
      hasil: null,
      hasilPoe: null,
      mulai: () => set({ draf: {}, drafPoe: {} }),
      catat: (butir, jawaban) => set((s) => ({ draf: { ...s.draf, [butir]: jawaban } })),
      catatPoe: (butir, data) =>
        set((s) => ({
          drafPoe: {
            ...s.drafPoe,
            [butir]: { ...(s.drafPoe[butir] ?? { tebakan: 0, alasan: 0 }), ...data },
          },
        })),
    }),
    {
      name: 'metalab-jawaban',
      partialize: ({ draf, drafPoe, hasil, hasilPoe }) => ({ draf, drafPoe, hasil, hasilPoe }),
    },
  ),
)
