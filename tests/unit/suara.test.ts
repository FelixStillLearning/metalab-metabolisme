import { Howl, Howler } from 'howler'
import { beforeEach, expect, test, vi } from 'vitest'
import { bunyi, musik, putar } from '../../src/lib/suara'
import { usePengaturan } from '../../src/stores/pengaturan'

const { play, stop } = vi.hoisted(() => ({ play: vi.fn(), stop: vi.fn() }))

vi.mock('howler', () => ({
  Howl: vi.fn(
    class {
      play = play
      stop = stop
    },
  ),
  Howler: { mute: vi.fn(), volume: vi.fn() },
}))

beforeEach(() => {
  musik(false)
  usePengaturan.getState().aturVolume(0.5)
  usePengaturan.getState().aturSuara(true)
  usePengaturan.getState().atur('efek', true)
  usePengaturan.getState().atur('musik', true)
  vi.clearAllMocks()
})

test('memutar suara dan memakai ulang audio yang sudah dibuat', () => {
  putar('melesat')
  putar('melesat')
  expect(Howl).toHaveBeenCalledExactlyOnceWith({
    src: ['/audio/melesat.ogg', '/audio/melesat.mp3'],
  })
  expect(play).toHaveBeenCalledTimes(2)
})

test('bisu memblokir pemutaran audio yang sudah maupun belum dimuat', () => {
  putar('mendarat')
  usePengaturan.getState().aturSuara(false)
  vi.clearAllMocks()
  putar('mendarat')
  putar('maskot')
  expect(play).not.toHaveBeenCalled()
  expect(Howl).not.toHaveBeenCalled()
})

test('perubahan pengaturan langsung membisukan pemutar dan dapat dinyalakan lagi', () => {
  putar('mulai')
  expect(play).toHaveBeenCalledOnce()
  usePengaturan.getState().aturSuara(false)
  expect(Howler.mute).toHaveBeenLastCalledWith(true)
  usePengaturan.getState().aturSuara(true)
  expect(Howler.mute).toHaveBeenLastCalledWith(false)
  putar('mulai')
  expect(play).toHaveBeenCalledTimes(2)
})

test('slot memutar berkasnya sendiri', () => {
  bunyi('ketuk')
  expect(Howl).toHaveBeenCalledExactlyOnceWith({ src: ['/audio/ketuk.ogg', '/audio/ketuk.mp3'] })
  expect(play).toHaveBeenCalledOnce()
  bunyi('getar')
  expect(Howl).toHaveBeenLastCalledWith({ src: ['/audio/getar.ogg', '/audio/getar.mp3'] })
})

test('POP episode memakai berkasnya sendiri, bukan pop Beranda', () => {
  bunyi('muncul')
  expect(Howl).toHaveBeenLastCalledWith({ src: ['/audio/muncul.ogg', '/audio/muncul.mp3'] })
})

test('efek suara mati: slot diam', () => {
  usePengaturan.getState().atur('efek', false)
  bunyi('tepat')
  expect(Howl).not.toHaveBeenCalled()
  expect(play).not.toHaveBeenCalled()
})

test('musik latar berulang, pelan, dan ikut saklar musik', () => {
  musik(true)
  expect(Howl).toHaveBeenCalledExactlyOnceWith({
    src: ['/audio/musik-latar.ogg', '/audio/musik-latar.mp3'],
    loop: true,
    volume: 0.35,
  })
  expect(play).toHaveBeenCalledOnce()
  musik(true)
  expect(play).toHaveBeenCalledOnce()
  usePengaturan.getState().atur('musik', false)
  expect(stop).toHaveBeenCalledOnce()
  usePengaturan.getState().atur('musik', true)
  expect(play).toHaveBeenCalledTimes(2)
  musik(false)
  expect(stop).toHaveBeenCalledTimes(2)
  usePengaturan.getState().atur('musik', false)
  usePengaturan.getState().atur('musik', true)
  expect(play).toHaveBeenCalledTimes(2)
})

test('musik tidak dimulai saat musik mati atau semua suara bisu', () => {
  usePengaturan.getState().atur('musik', false)
  musik(true)
  usePengaturan.getState().atur('musik', true)
  usePengaturan.getState().aturSuara(false)
  vi.clearAllMocks()
  musik(true)
  expect(play).not.toHaveBeenCalled()
})

test('efek gerak dan tempel memakai berkas episode, tidak menumpuk, dan mengikuti efek/bisu', () => {
  for (const nama of ['geser', 'tempel'] as const) {
    bunyi(nama)
    expect(Howl).toHaveBeenLastCalledWith({ src: [`/audio/${nama}.ogg`, `/audio/${nama}.mp3`] })
  }
  expect(stop).toHaveBeenCalledTimes(2)
  expect(play).toHaveBeenCalledTimes(2)
  bunyi('geser')
  expect(stop).toHaveBeenCalledTimes(3)
  expect(play).toHaveBeenCalledTimes(3)
  vi.clearAllMocks()
  usePengaturan.getState().atur('efek', false)
  bunyi('geser')
  bunyi('tempel')
  expect(play).not.toHaveBeenCalled()
  usePengaturan.getState().atur('efek', true)
  usePengaturan.getState().aturSuara(false)
  bunyi('geser')
  bunyi('tempel')
  expect(play).not.toHaveBeenCalled()
})

test('volume utama mengubah audio aktif tanpa memulai ulang musik atau melepas bisu', () => {
  musik(true)
  vi.clearAllMocks()
  usePengaturan.getState().aturVolume(0.75)
  expect(Howler.volume).toHaveBeenLastCalledWith(0.75)
  expect(play).not.toHaveBeenCalled()
  expect(stop).not.toHaveBeenCalled()
  usePengaturan.getState().aturSuara(false)
  usePengaturan.getState().aturVolume(0.25)
  expect(Howler.mute).toHaveBeenLastCalledWith(true)
  expect(Howler.volume).toHaveBeenLastCalledWith(0.25)
  usePengaturan.getState().aturSuara(true)
  expect(Howler.mute).toHaveBeenLastCalledWith(false)
  expect(usePengaturan.getState().volume).toBe(0.25)
})
