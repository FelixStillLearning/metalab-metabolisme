import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Pengaturan = {
  suaraAktif: boolean
  aturSuara: (aktif: boolean) => void
}

// Disimpan di localStorage agar pilihan bisu tetap berlaku saat halaman dibuka lagi
export const usePengaturan = create<Pengaturan>()(
  persist(
    (set) => ({
      suaraAktif: true,
      aturSuara: (aktif) => set({ suaraAktif: aktif }),
    }),
    { name: 'metalab-pengaturan', partialize: ({ suaraAktif }) => ({ suaraAktif }) },
  ),
)
