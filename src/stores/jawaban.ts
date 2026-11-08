import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { kendali } from '../features/pemutar-episode/mesin'

export type PoeRekam = {
  tebakan: number
  alasan: number
  penjelasan?: number
}

export type ButirJawaban = 'a' | 'b' | 'c' | 'd' | 'e' | 'g' | 'h'
export type Jawaban = Partial<Record<ButirJawaban, string>>
export type DataPoe = Partial<Record<'c' | 'e', PoeRekam>>

type Penyimpanan = {
  draf: Jawaban
  drafPoe: DataPoe
  hasil: Jawaban | null
  hasilPoe: DataPoe | null
  // Penjelasan bebas siswa di Lembar Hasil
  penjelasan: string
  mulai: () => void
  catat: (butir: ButirJawaban, jawaban: string) => void
  catatPoe: (butir: 'c' | 'e', data: Partial<PoeRekam>) => void
  selesaikan: () => void
  simpanPenjelasan: (teks: string) => void
}

// Draf putaran baru tidak mengganti hasil sampai siswa masuk Lembar Hasil.
// Putar ulang otomatis tidak menulis apa pun, agar tebakan POE asli siswa tetap utuh.
export const useJawaban = create<Penyimpanan>()(
  persist(
    (set) => {
      const tulis = (ubah: Partial<Penyimpanan> | ((s: Penyimpanan) => Partial<Penyimpanan>)) => {
        if (!kendali.otomatis) set(ubah)
      }
      return {
        draf: {},
        drafPoe: {},
        hasil: null,
        hasilPoe: null,
        penjelasan: '',
        mulai: () => tulis({ draf: {}, drafPoe: {} }),
        catat: (butir, jawaban) => tulis((s) => ({ draf: { ...s.draf, [butir]: jawaban } })),
        catatPoe: (butir, data) =>
          tulis((s) => ({
            drafPoe: {
              ...s.drafPoe,
              [butir]: { ...(s.drafPoe[butir] ?? { tebakan: 0, alasan: 0 }), ...data },
            },
          })),
        selesaikan: () => tulis((s) => ({ hasil: s.draf, hasilPoe: s.drafPoe })),
        simpanPenjelasan: (penjelasan) => set({ penjelasan }),
      }
    },
    {
      name: 'metalab-jawaban',
      partialize: ({ draf, drafPoe, hasil, hasilPoe, penjelasan }) => ({
        draf,
        drafPoe,
        hasil,
        hasilPoe,
        penjelasan,
      }),
    },
  ),
)
