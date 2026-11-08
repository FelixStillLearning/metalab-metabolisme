import { bunyi } from '../../lib/suara'
import { usePemutar } from '../../stores/pemutar'
import { kendali } from './mesin'

export type Rumpang = {
  opsi: string[]
  benar: number
  // Umpan balik per pilihan salah, tampil di gelembung kalimat
  salah: Partial<Record<number, string>>
}

// Lengkapi kalimat: potongan teks mengapit rumpang (potongan.length = rumpang.length + 1).
// Rumpang diisi satu per satu berurutan; pilihan salah memberi umpan balik dan menahan sampai
// benar. Hasilnya kalimat utuh.
export function mintaLengkapi(
  signal: AbortSignal,
  judul: string,
  potongan: string[],
  rumpang: Rumpang[],
): Promise<string> {
  const utuh = potongan.reduce((a, t, i) => a + rumpang[i - 1].opsi[rumpang[i - 1].benar] + t)
  if (kendali.otomatis) return Promise.resolve(utuh)
  return new Promise<string>((selesai, gagal) => {
    const terisi: string[] = []
    const bersih = () => {
      signal.removeEventListener('abort', batal)
      usePemutar.setState({ lengkapi: null })
    }
    const batal = () => {
      bersih()
      gagal(new DOMException('Adegan dihentikan', 'AbortError'))
    }
    if (signal.aborted) return batal()
    signal.addEventListener('abort', batal, { once: true })
    const tampil = () =>
      usePemutar.setState({
        lengkapi: {
          judul,
          potongan,
          terisi: [...terisi],
          opsi: rumpang[terisi.length].opsi,
          pilih,
        },
      })
    const pilih = (index: number) => {
      const r = rumpang[terisi.length]
      if (signal.aborted || usePemutar.getState().dijeda || !r?.opsi[index]) return
      if (index !== r.benar) {
        bunyi('belum-tepat')
        usePemutar.setState({ kalimat: r.salah[index] ?? '' })
        return
      }
      bunyi('tepat')
      terisi.push(r.opsi[index])
      if (terisi.length < rumpang.length) return tampil()
      bersih()
      selesai(utuh)
    }
    tampil()
  })
}
