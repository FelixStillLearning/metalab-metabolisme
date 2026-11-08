import { Howl, Howler } from 'howler'
import { usePengaturan } from '../stores/pengaturan'

export type NamaSuara =
  'melesat' | 'mendarat' | 'maskot' | 'mulai' | 'buka-peta' | 'tutup-peta' | 'kembali'

// Berkas dimuat saat pertama kali dibutuhkan; MP3 untuk browser yang tidak mendukung OGG (Safari lama)
const termuat = new Map<NamaSuara, Howl>()

// Bisu juga berlaku untuk audio yang sedang berjalan atau masih menunggu dimuat.
Howler.mute(!usePengaturan.getState().suaraAktif)
const berhentiMemantau = usePengaturan.subscribe(({ suaraAktif }) => Howler.mute(!suaraAktif))
import.meta.hot?.dispose(berhentiMemantau)

function ambil(nama: NamaSuara) {
  let suara = termuat.get(nama)
  if (!suara) {
    const dasar = `${import.meta.env.BASE_URL}audio/${nama}`
    suara = new Howl({ src: [`${dasar}.ogg`, `${dasar}.mp3`] })
    termuat.set(nama, suara)
  }
  return suara
}

// Muat lebih awal supaya klik pertama tidak tersendat oleh pemuatan berkas
export function siapkan(...nama: NamaSuara[]) {
  if (usePengaturan.getState().suaraAktif) nama.forEach(ambil)
}

export function putar(nama: NamaSuara) {
  if (!usePengaturan.getState().suaraAktif) return
  ambil(nama).play()
}

// Browser menolak suara sebelum halaman pernah disentuh, jadi suara otomatis hanya diputar sesudahnya
export const bolehBersuaraSendiri = () => navigator.userActivation?.hasBeenActive ?? false

export type SlotSuara =
  | 'ketuk'
  | 'tepat'
  | 'belum-tepat'
  | 'muncul'
  | 'melesat'
  | 'klik'
  | 'getar'
  | 'belah'
  | 'atp'
  | 'kunci'
  | 'jatuh'
  | 'selesai'

// Slot belum punya berkas: diisi ketika suara finalnya ada, sampai itu bunyi() diam
const BERKAS_SLOT: Partial<Record<SlotSuara, NamaSuara>> = {}

export function bunyi(slot: SlotSuara) {
  const nama = BERKAS_SLOT[slot]
  if (nama && usePengaturan.getState().efek) putar(nama)
}
