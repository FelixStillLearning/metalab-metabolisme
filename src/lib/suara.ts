import { Howl } from 'howler'
import { usePengaturan } from '../stores/pengaturan'

export type NamaSuara = 'melesat' | 'mendarat' | 'maskot' | 'mulai'

// Berkas dimuat saat pertama kali dibutuhkan; MP3 untuk browser yang tidak mendukung OGG (Safari lama)
const termuat = new Map<NamaSuara, Howl>()

export function putar(nama: NamaSuara) {
  if (!usePengaturan.getState().suaraAktif) return
  let suara = termuat.get(nama)
  if (!suara) {
    const dasar = `${import.meta.env.BASE_URL}audio/${nama}`
    suara = new Howl({ src: [`${dasar}.ogg`, `${dasar}.mp3`] })
    termuat.set(nama, suara)
  }
  suara.play()
}

// Browser menolak suara sebelum halaman pernah disentuh, jadi suara otomatis hanya diputar sesudahnya
export const bolehBersuaraSendiri = () => navigator.userActivation?.hasBeenActive ?? false
