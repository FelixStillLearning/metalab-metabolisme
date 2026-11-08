import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type KunciSaklar = 'subtitle' | 'narasi' | 'efek' | 'musik' | 'pelan' | 'tenang'

type Pengaturan = {
  volume: number
  aturVolume: (volume: number) => void
  suaraAktif: boolean
  aturSuara: (aktif: boolean) => void
  subtitle: boolean
  narasi: boolean
  efek: boolean
  musik: boolean
  pelan: boolean
  // null = ikut prefers-reduced-motion perangkat
  tenang: boolean | null
  atur: (kunci: KunciSaklar, nilai: boolean) => void
}

// Disimpan di localStorage agar pilihan bisu dan saklar pemutar tetap berlaku saat halaman dibuka lagi
export const usePengaturan = create<Pengaturan>()(
  persist(
    (set) => ({
      volume: 0.5,
      aturVolume: (volume) => {
        if (Number.isFinite(volume)) set({ volume: Math.max(0, Math.min(1, volume)) })
      },
      suaraAktif: true,
      aturSuara: (aktif) => set({ suaraAktif: aktif }),
      subtitle: true,
      narasi: true,
      efek: true,
      musik: true,
      pelan: false,
      tenang: null,
      atur: (kunci, nilai) => set({ [kunci]: nilai }),
    }),
    {
      name: 'metalab-pengaturan',
      partialize: ({ volume, suaraAktif, subtitle, narasi, efek, musik, pelan, tenang }) => ({
        volume,
        suaraAktif,
        subtitle,
        narasi,
        efek,
        musik,
        pelan,
        tenang,
      }),
    },
  ),
)

export const tenangAktif = () =>
  usePengaturan.getState().tenang ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches
