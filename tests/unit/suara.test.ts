import { Howl, Howler } from 'howler'
import { beforeEach, expect, test, vi } from 'vitest'
import { bunyi, putar } from '../../src/lib/suara'
import { usePengaturan } from '../../src/stores/pengaturan'

const { play } = vi.hoisted(() => ({ play: vi.fn() }))

vi.mock('howler', () => ({
  Howl: vi.fn(
    class {
      play = play
    },
  ),
  Howler: { mute: vi.fn() },
}))

beforeEach(() => {
  usePengaturan.getState().aturSuara(true)
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

test('slot tanpa berkas tidak membuat audio', () => {
  bunyi('ketuk')
  expect(Howl).not.toHaveBeenCalled()
})
