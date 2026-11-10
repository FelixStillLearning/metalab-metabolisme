import { Howl } from 'howler'
import { usePengaturan } from '../stores/pengaturan'

// Kalimat yang sudah direkam: berkas audio/narasi/<id>.ogg|.mp3. Kosong sampai rekaman ada.
const TEREKAM = new Set<string>()

let howlAktif: Howl | null = null
// Utterance yang sedang dibacakan. Dipegang di sini agar Chrome tidak membuang utterance sebelum onend terpanggil
let ucapanAktif: SpeechSynthesisUtterance | null = null

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
  const { suaraAktif, narasi, pelan, volume } = usePengaturan.getState()
  const { signal } = opsi
  if (!suaraAktif || !narasi || volume === 0 || signal?.aborted) return Promise.resolve()

  return new Promise<void>((selesai) => {
    let berhenti = () => {}
    const akhir = () => {
      howlAktif = null
      berhentiMemantau()
      signal?.removeEventListener('abort', berhenti)
      selesai()
    }

    const berhentiMemantau = usePengaturan.subscribe((s) => {
      if (!s.suaraAktif || !s.narasi || s.volume === 0) berhenti()
    })

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
      // shortcut: volume narasi browser berlaku per kalimat, gunakan rekaman bila perlu berubah seketika.
      u.volume = usePengaturan.getState().volume
      u.onend = u.onerror = () => {
        ucapanAktif = null
        akhir()
      }
      berhenti = () => {
        window.speechSynthesis.cancel()
        ucapanAktif = null
        akhir()
      }
      signal?.addEventListener('abort', berhenti)
      ucapanAktif = u
      // Chrome tetap dijeda setelah cancel(); tanpa resume, speak() berikutnya tak pernah selesai
      if (window.speechSynthesis.paused) window.speechSynthesis.resume()
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
  if (ucapanAktif) window.speechSynthesis[dijeda ? 'pause' : 'resume']()
  if (howlAktif) {
    if (dijeda) howlAktif.pause()
    else howlAktif.play()
  }
}
