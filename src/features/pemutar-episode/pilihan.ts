import { bunyi } from '../../lib/suara'
import { usePemutar, type SoalPilihan } from '../../stores/pemutar'

export function mintaPilihan(
  signal: AbortSignal,
  isi: Omit<SoalPilihan, 'pilih'>,
  benar: number,
  salah: (index: number) => void | Promise<void>,
) {
  return new Promise<void>((selesai, gagal) => {
    let aktif = true
    let sibuk = false
    const bersih = () => {
      if (!aktif) return
      aktif = false
      signal.removeEventListener('abort', batal)
      usePemutar.setState({ pilihan: null })
    }
    const batal = () => {
      bersih()
      gagal(new DOMException('Adegan dihentikan', 'AbortError'))
    }
    if (signal.aborted) return batal()
    signal.addEventListener('abort', batal, { once: true })
    usePemutar.setState({
      pilihan: {
        ...isi,
        pilih: async (index) => {
          if (
            !aktif ||
            sibuk ||
            usePemutar.getState().dijeda ||
            !Number.isInteger(index) ||
            !isi.opsi[index]
          )
            return
          if (index === benar) {
            bunyi('tepat')
            bersih()
            selesai()
          } else {
            sibuk = true
            bunyi('belum-tepat')
            try {
              await salah(index)
            } catch (e) {
              bersih()
              gagal(e)
            } finally {
              sibuk = false
            }
          }
        },
      },
    })
  })
}

// Ketuk tiap objek satu per satu, urutan bebas, seperti tapEach() di prototype.
// ketuk(i) dijalankan sekali per sasaran; selesai setelah semua ketukan selesai.
export function mintaKetukSemua(
  signal: AbortSignal,
  judul: string,
  sasaran: SoalPilihan['opsi'],
  ketuk: (index: number) => Promise<void>,
) {
  return new Promise<void>((selesai, gagal) => {
    let sisa = sasaran.length
    const bersih = () => {
      signal.removeEventListener('abort', batal)
      usePemutar.setState({ pilihan: null })
    }
    const batal = () => {
      bersih()
      gagal(new DOMException('Adegan dihentikan', 'AbortError'))
    }
    if (signal.aborted) return batal()
    signal.addEventListener('abort', batal, { once: true })
    const pilih = async (index: number) => {
      const { pilihan, dijeda } = usePemutar.getState()
      if (
        signal.aborted ||
        dijeda ||
        !pilihan ||
        !pilihan.opsi[index] ||
        pilihan.opsi[index].selesai
      )
        return
      bunyi('ketuk')
      usePemutar.setState({
        pilihan: {
          ...pilihan,
          opsi: pilihan.opsi.map((o, i) => (i === index ? { ...o, selesai: true } : o)),
        },
      })
      try {
        await ketuk(index)
      } catch (e) {
        bersih()
        return gagal(e)
      }
      if (--sisa === 0) {
        bersih()
        selesai()
      }
    }
    usePemutar.setState({ pilihan: { judul, opsi: sasaran, pilih } })
  })
}
