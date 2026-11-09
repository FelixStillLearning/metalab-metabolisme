import { Howl, Howler } from 'howler'
import { usePengaturan } from '../stores/pengaturan'

export type NamaSuara =
  | 'melesat'
  | 'mendarat'
  | 'muncul'
  | 'maskot'
  | 'mulai'
  | 'buka-peta'
  | 'tutup-peta'
  | 'kembali'
  | 'ketuk'
  | 'tepat'
  | 'belum-tepat'
  | 'klik'
  | 'getar'
  | 'belah'
  | 'atp'
  | 'kunci'
  | 'jatuh'
  | 'selesai'
  | 'musik-latar'

// Berkas dimuat saat pertama kali dibutuhkan; MP3 untuk browser yang tidak mendukung OGG (Safari lama)
const termuat = new Map<NamaSuara, Howl>()

// Bisu juga berlaku untuk audio yang sedang berjalan atau masih menunggu dimuat.
Howler.mute(!usePengaturan.getState().suaraAktif)
Howler.volume(usePengaturan.getState().volume)
const berhentiMemantau = usePengaturan.subscribe(({ suaraAktif, volume }) => {
  Howler.mute(!suaraAktif)
  Howler.volume(volume)
  aturMusik()
})
import.meta.hot?.dispose(berhentiMemantau)

function ambil(nama: NamaSuara, opsi?: { loop: boolean; volume: number }) {
  let suara = termuat.get(nama)
  if (!suara) {
    const dasar = `${import.meta.env.BASE_URL}audio/${nama}`
    suara = new Howl({ src: [`${dasar}.ogg`, `${dasar}.mp3`], ...opsi })
    termuat.set(nama, suara)
  }
  return suara
}

// Muat lebih awal supaya klik pertama tidak tersendat oleh pemuatan berkas
export function siapkan(...nama: NamaSuara[]) {
  if (usePengaturan.getState().suaraAktif) nama.forEach((n) => ambil(n))
}

export function putar(nama: NamaSuara) {
  if (!usePengaturan.getState().suaraAktif) return
  ambil(nama).play()
}

// Browser menolak suara sebelum halaman pernah disentuh, jadi suara otomatis hanya diputar sesudahnya
export const bolehBersuaraSendiri = () => navigator.userActivation?.hasBeenActive ?? false

export type SlotSuara =
  | 'mulai'
  | 'kembali'
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

// Momen di adegan memanggil nama slot; berkasnya cukup diganti di sini
const BERKAS_SLOT: Record<SlotSuara, NamaSuara> = {
  mulai: 'mulai',
  kembali: 'kembali',
  ketuk: 'ketuk',
  tepat: 'tepat',
  'belum-tepat': 'belum-tepat',
  // Pop episode sendiri; 'mendarat' tetap milik animasi sel Beranda
  muncul: 'muncul',
  melesat: 'melesat',
  klik: 'klik',
  getar: 'getar',
  belah: 'belah',
  atp: 'atp',
  kunci: 'kunci',
  jatuh: 'jatuh',
  selesai: 'selesai',
}

export function bunyi(slot: SlotSuara) {
  if (usePengaturan.getState().efek) putar(BERKAS_SLOT[slot])
}

// Musik latar episode: berbunyi selama diminta, saklar musik hidup, dan suara tidak dibisukan.
// Tetap berbunyi saat episode dijeda, seperti prototype.
let musikDiminta = false
let musikBerbunyi = false

function aturMusik() {
  const { musik, suaraAktif } = usePengaturan.getState()
  const nyala = musikDiminta && musik && suaraAktif
  if (nyala === musikBerbunyi) return
  musikBerbunyi = nyala
  if (nyala) ambil('musik-latar', { loop: true, volume: 0.35 }).play()
  else termuat.get('musik-latar')?.stop()
}

export function musik(nyala: boolean) {
  musikDiminta = nyala
  aturMusik()
}
