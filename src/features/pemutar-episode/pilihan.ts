import { bunyi } from '../../lib/suara'
import { usePemutar, type SoalPilihan } from '../../stores/pemutar'
import { kendali } from './mesin'

export function mintaPilihan(
  signal: AbortSignal,
  isi: Omit<SoalPilihan, 'pilih'>,
  benar: number,
  salah: (index: number) => void | Promise<void>,
) {
  // Putar ulang otomatis langsung memakai jawaban benar, seperti quickPick() prototype
  if (kendali.otomatis) return Promise.resolve()
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
            if (isi.konfirmasi)
              usePemutar.setState((s) => ({
                pilihan: s.pilihan && { ...s.pilihan, memeriksa: true, pesan: '' },
              }))
            bunyi('belum-tepat')
            try {
              await salah(index)
            } catch (e) {
              bersih()
              gagal(e)
            } finally {
              sibuk = false
              if (aktif && isi.konfirmasi)
                usePemutar.setState((s) => ({
                  pilihan: s.pilihan && {
                    ...s.pilihan,
                    memeriksa: false,
                    pesan: 'Belum tepat. Pilih lagi, lalu tekan Jawab.',
                  },
                }))
            }
          }
        },
      },
    })
  })
}

// Ketuk tiap objek satu per satu, urutan bebas, seperti tapEach() di prototype.
// ketuk(i) dijalankan sekali per sasaran; selesai setelah semua ketukan selesai.
// Pengecoh (ketuk kumpulkan, soal g prototype) tidak terkumpul: salah(i) memberi umpan balik.
export async function mintaKetukSemua(
  signal: AbortSignal,
  judul: string,
  sasaran: SoalPilihan['opsi'],
  ketuk: (index: number) => Promise<void>,
  pengecoh?: { indeks: number[]; salah: (index: number) => void | Promise<void> },
  seret?: SoalPilihan['seret'],
) {
  const bukanPengecoh = (i: number) => !pengecoh?.indeks.includes(i)
  if (kendali.otomatis) {
    for (let i = 0; i < sasaran.length; i++) if (bukanPengecoh(i)) await ketuk(i)
    return
  }
  return new Promise<void>((selesai, gagal) => {
    let sisa = sasaran.filter((_, i) => bukanPengecoh(i)).length
    // Pengecoh yang sedang memberi umpan balik; pengecoh lain tetap bisa diketuk
    const sibuk = new Set<number>()
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
      if (!bukanPengecoh(index)) {
        if (sibuk.has(index)) return
        sibuk.add(index)
        bunyi('belum-tepat')
        try {
          await pengecoh!.salah(index)
        } catch (e) {
          bersih()
          return gagal(e)
        } finally {
          sibuk.delete(index)
        }
        return
      }
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
    usePemutar.setState({ pilihan: { judul, opsi: sasaran, pilih, seret } })
  })
}
