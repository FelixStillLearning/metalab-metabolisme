import { Howl } from 'howler'
import { usePengaturan } from '../stores/pengaturan'

// Kalimat yang sudah direkam: berkas audio/narasi/<id>.ogg|.mp3. Kosong sampai rekaman ada.
const TEREKAM = new Set<string>()

let howlAktif: Howl | null = null
let berbicara = false

// Dicari tiap kali bicara: daftar suara browser sering baru terisi setelah halaman dibuka
function suaraIndonesia() {
  const semua = window.speechSynthesis?.getVoices?.() ?? []
  return (
    semua.find((s) => /^id/i.test(s.lang)) ?? semua.find((s) => /indones/i.test(s.name)) ?? null
  )
}

const lafal = (teks: string) =>
  teks.replace(/₂/g, '2').replace(/⁺/g, ' plus').replace(/−/g, ' kurang')

export function ucapkan(id: string, teks: string, opsi: { signal?: AbortSignal } = {}) {
  const { suaraAktif, narasi, pelan } = usePengaturan.getState()
  const { signal } = opsi
  if (!suaraAktif || !narasi || signal?.aborted) return Promise.resolve()

  return new Promise<void>((selesai) => {
    let berhenti = () => {}
    const akhir = () => {
      howlAktif = null
      signal?.removeEventListener('abort', berhenti)
      selesai()
    }

    if (TEREKAM.has(id)) {
      const dasar = `${import.meta.env.BASE_URL}audio/narasi/${id}`
      const howl = new Howl({ src: [`${dasar}.ogg`, `${dasar}.mp3`], onend: akhir })
      howlAktif = howl
      berhenti = () => {
        howl.stop()
        akhir()
      }
      signal?.addEventListener('abort', berhenti)
      howl.play()
      return
    }

    const bicara = (suara: SpeechSynthesisVoice) => {
      const u = new SpeechSynthesisUtterance(lafal(teks))
      u.voice = suara
      u.lang = suara.lang
      u.rate = pelan ? 0.85 : 1
      u.onend = u.onerror = () => {
        berbicara = false
        akhir()
      }
      berhenti = () => {
        window.speechSynthesis.cancel()
        berbicara = false
        akhir()
      }
      signal?.addEventListener('abort', berhenti)
      berbicara = true
      window.speechSynthesis.speak(u)
    }

    const suara = suaraIndonesia()
    if (suara) return bicara(suara)
    // Chrome mengisi daftar suara belakangan: bila masih kosong, tunggu sebentar sebelum menyerah
    const sintesis = window.speechSynthesis
    if (!sintesis || sintesis.getVoices().length > 0) return akhir()
    const batal = () => {
      clearTimeout(timer)
      sintesis.removeEventListener('voiceschanged', coba)
      signal?.removeEventListener('abort', berhenti)
    }
    const coba = () => {
      batal()
      const siap = suaraIndonesia()
      if (siap) bicara(siap)
      else akhir()
    }
    const timer = setTimeout(coba, 1500)
    sintesis.addEventListener('voiceschanged', coba)
    berhenti = () => {
      batal()
      akhir()
    }
    signal?.addEventListener('abort', berhenti)
  })
}

export function jedaNarasi(dijeda: boolean) {
  if (berbicara) window.speechSynthesis[dijeda ? 'pause' : 'resume']()
  if (howlAktif) {
    if (dijeda) howlAktif.pause()
    else howlAktif.play()
  }
}
