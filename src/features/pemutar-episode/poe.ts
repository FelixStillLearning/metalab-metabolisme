import { bunyi } from '../../lib/suara'
import { usePemutar, type PoeTebakState } from '../../stores/pemutar'
import { kendali } from './mesin'

export type HasilTebak = {
  g: number
  r: number
  from: [number, number][]
}

export function mintaTebak(
  signal: AbortSignal,
  konfigurasi: {
    judul: string
    reasons: string[]
    right: number
    zone: PoeTebakState['zone']
    supply: [number, number][]
    slot: (i: number, n: number) => [number, number]
    kartu?: [number, number]
  },
): Promise<HasilTebak> {
  // Putar ulang otomatis: jumlah benar dengan alasan kedua, seperti dragPredict() prototype
  if (kendali.otomatis) {
    const { right, slot } = konfigurasi
    return Promise.resolve({
      g: right,
      r: 1,
      from: Array.from({ length: right }, (_, i) => slot(i, right)),
    })
  }
  return new Promise<HasilTebak>((selesai, gagal) => {
    let aktif = true
    const bersih = () => {
      if (!aktif) return
      aktif = false
      signal.removeEventListener('abort', batal)
    }
    const batal = () => {
      bersih()
      usePemutar.setState({ poe: null })
      gagal(new DOMException('Adegan dihentikan', 'AbortError'))
    }
    if (signal.aborted) return batal()
    signal.addEventListener('abort', batal, { once: true })

    const pasangState: PoeTebakState = {
      tahap: 'tebak',
      judul: konfigurasi.judul,
      reasons: konfigurasi.reasons,
      right: konfigurasi.right,
      zone: konfigurasi.zone,
      supply: konfigurasi.supply,
      slot: konfigurasi.slot,
      kartu: konfigurasi.kartu,
      placed: [],
      alasan: null,
      taruhToken: (tokenIdx) => {
        if (!aktif || usePemutar.getState().dijeda) return
        const state = usePemutar.getState().poe
        if (!state || state.tahap !== 'tebak') return
        const idx = state.placed.indexOf(tokenIdx)
        let baru: number[]
        if (idx >= 0) {
          bunyi('ketuk')
          baru = state.placed.filter((i) => i !== tokenIdx)
        } else {
          bunyi('muncul')
          baru = [...state.placed, tokenIdx]
        }
        usePemutar.setState({ poe: { ...state, placed: baru } })
      },
      pilihAlasan: (alasanIdx) => {
        if (!aktif || usePemutar.getState().dijeda) return
        const state = usePemutar.getState().poe
        if (!state || state.tahap !== 'tebak') return
        bunyi('ketuk')
        usePemutar.setState({ poe: { ...state, alasan: alasanIdx } })
      },
      kunci: () => {
        if (!aktif || usePemutar.getState().dijeda) return
        const state = usePemutar.getState().poe
        if (!state || state.tahap !== 'tebak' || state.placed.length === 0 || state.alasan === null)
          return
        bunyi('kunci')
        bersih()
        const from = state.placed.map((_, i) => konfigurasi.slot(i, state.placed.length))
        const hasil: HasilTebak = {
          g: state.placed.length,
          r: state.alasan,
          from,
        }
        selesai(hasil)
      },
    }

    bunyi('muncul')
    // Pose maskot per tahap seperti poeStep() di prototype
    usePemutar.setState({ pose: '04-penasaran', poe: pasangState })
  })
}

export function tampilkanAmati(tebakan: number, unit = 'ATP') {
  usePemutar.setState({
    pose: '03-netral',
    poe: {
      tahap: 'amati',
      gtagText: `Tebakanmu: ${tebakan} ${unit}`,
      tebakan: `${tebakan} ${unit}`,
      statusTebakan: null,
    },
  })
}

// Vonis tebakan di penanda G14; teksTambahan menerangkan yang belum tepat
export function tandaiAmati(status: 'benar' | 'salah', teksTambahan?: string) {
  usePemutar.setState((s) => {
    if (!s.poe || s.poe.tahap !== 'amati') return s
    return { poe: { ...s.poe, statusTebakan: status, catatan: teksTambahan } }
  })
}

export function mintaJelaskan(
  signal: AbortSignal,
  opsi: {
    g: number
    r: number
    unit: string
    reasons: string[]
    back: string[]
    // right = jumlah yang benar untuk vonis tebakan; alasanBenar = indeks alasan yang benar
    right: number
    alasanBenar: number
    hasil: string
  },
): Promise<number> {
  if (kendali.otomatis) {
    usePemutar.setState({ poe: null })
    return Promise.resolve(opsi.alasanBenar)
  }
  return new Promise<number>((selesai, gagal) => {
    let aktif = true
    let firstSelected: number | null = null
    const bersih = () => {
      if (!aktif) return
      aktif = false
      signal.removeEventListener('abort', batal)
      usePemutar.setState({ poe: null })
    }
    const batal = () => {
      bersih()
      gagal(new DOMException('Adegan dihentikan', 'AbortError'))
    }
    if (signal.aborted) return batal()
    signal.addEventListener('abort', batal, { once: true })

    const tepat = opsi.g === opsi.right
    const verdict = tepat
      ? `Tebakanmu tepat: ${opsi.hasil}.`
      : `Tebakanmu ${opsi.g} ${opsi.unit} belum tepat. Yang terjadi: ${opsi.hasil}.`

    bunyi('muncul')
    usePemutar.setState({
      pose: '05-menjelaskan',
      poe: {
        tahap: 'jelaskan',
        judul: 'Alasan mana yang menjelaskan apa yang baru kamu lihat?',
        tadiText: `Tadi: ${opsi.g} ${opsi.unit} · ${opsi.reasons[opsi.r]}`,
        verdictText: verdict,
        verdictTepat: tepat,
        reasons: opsi.reasons,
        back: opsi.back,
        alasanBenar: opsi.alasanBenar,
        selectedExplain: null,
        explainDone: false,
        pilihExplain: (idx: number) => {
          if (!aktif || usePemutar.getState().dijeda) return
          if (firstSelected === null) firstSelected = idx
          if (idx === opsi.alasanBenar) {
            bunyi('tepat')
            usePemutar.setState((s) => ({
              poe:
                s.poe && s.poe.tahap === 'jelaskan'
                  ? { ...s.poe, selectedExplain: idx, explainDone: true }
                  : null,
            }))
          } else {
            bunyi('belum-tepat')
            usePemutar.setState((s) => ({
              poe:
                s.poe && s.poe.tahap === 'jelaskan'
                  ? { ...s.poe, selectedExplain: idx, explainDone: false }
                  : null,
            }))
          }
        },
        lanjut: () => {
          if (!aktif || usePemutar.getState().dijeda) return
          bunyi('ketuk')
          const hasil = firstSelected ?? opsi.alasanBenar
          bersih()
          selesai(hasil)
        },
      },
    })
  })
}

export function tutupPoe() {
  usePemutar.setState({ poe: null })
}
