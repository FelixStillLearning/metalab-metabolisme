import { create } from 'zustand'
import { kendali } from '../../features/pemutar-episode/mesin'
import { bunyi } from '../../lib/suara'
import { usePemutar } from '../../stores/pemutar'
import { useJawabanE0 } from '../../stores/jawaban-episode-0'
import type { BarisPilah } from './isi'

type Soal = {
  baris: BarisPilah
  kartu: string[]
  terpasang: number[]
  pesan: string
  pilih: (kartu: number, sisi: 0 | 1) => boolean
}
export const usePilah = create<{ soal: Soal | null }>()(() => ({ soal: null }))

export function mintaPilah(signal: AbortSignal, baris: BarisPilah) {
  if (kendali.otomatis) return Promise.resolve()
  return new Promise<void>((selesai, gagal) => {
    let aktif = true
    const terpasang = new Set<number>()
    const pasangan =
      baris.k === 'energi' || baris.k === 'oksigen' ? [...baris.sel].reverse() : [...baris.sel]
    const kartu = [...pasangan, ...(baris.pengecoh ? [baris.pengecoh] : [])]
    const bersih = () => {
      aktif = false
      signal.removeEventListener('abort', batal)
      usePilah.setState({ soal: null })
      usePemutar.setState({ petunjuk: '' })
    }
    const batal = () => {
      bersih()
      gagal(new DOMException('Adegan dihentikan', 'AbortError'))
    }
    if (signal.aborted) return batal()
    signal.addEventListener('abort', batal, { once: true })
    usePemutar.setState({
      petunjuk: '',
      kalimat: '',
    })
    usePilah.setState({
      soal: {
        baris,
        kartu,
        terpasang: [],
        pesan: '',
        pilih: (index, sisi) => {
          if (
            !aktif ||
            signal.aborted ||
            usePemutar.getState().dijeda ||
            !Number.isInteger(index) ||
            !kartu[index] ||
            (sisi !== 0 && sisi !== 1) ||
            terpasang.has(index)
          )
            return false
          if (kartu[index] !== baris.sel[sisi]) {
            bunyi('belum-tepat')
            const pesan =
              index === 2
                ? baris.k === 'oksigen'
                  ? 'Tidak semua katabolisme memerlukan oksigen. Di sini kita membandingkan respirasi aerob.'
                  : 'Untuk contoh pada tabel ini, tempatnya adalah kloroplas, mitokondria, dan sitoplasma.'
                : 'Periksa lagi: anabolisme menyusun, katabolisme menguraikan.'
            usePilah.setState((s) => ({ soal: s.soal && { ...s.soal, pesan } }))
            return false
          }
          bunyi('tempel')
          terpasang.add(index)
          useJawabanE0.getState().catatSel(baris.k, sisi)
          usePilah.setState((s) => ({
            soal: s.soal && { ...s.soal, terpasang: [...terpasang], pesan: '' },
          }))
          if (terpasang.size === 2) {
            bersih()
            selesai()
          }
          return true
        },
      },
    })
  })
}
