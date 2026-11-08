import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Siswa = {
  nama: string
  kelas: string
  simpan: (nama: string, kelas: string) => void
}

export const useSiswa = create<Siswa>()(
  persist(
    (set) => ({
      nama: '',
      kelas: '',
      simpan: (nama, kelas) => set({ nama: nama.trim(), kelas: kelas.trim() }),
    }),
    { name: 'metalab-siswa', partialize: ({ nama, kelas }) => ({ nama, kelas }) },
  ),
)
