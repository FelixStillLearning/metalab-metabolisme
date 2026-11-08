import { beforeEach, expect, test, vi } from 'vitest'
import { ucapkan } from '../../src/lib/narasi'
import { usePengaturan } from '../../src/stores/pengaturan'

class UtteranceTiruan {
  onend: (() => void) | null = null
  onerror: (() => void) | null = null
  voice: unknown
  lang = ''
  rate = 1
  text: string
  constructor(teks: string) {
    this.text = teks
  }
}

const sintesis = {
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => [{ lang: 'id-ID', name: 'Indonesian' }]),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  sintesis.getVoices.mockReturnValue([{ lang: 'id-ID', name: 'Indonesian' }])
  vi.stubGlobal('speechSynthesis', sintesis)
  vi.stubGlobal('SpeechSynthesisUtterance', UtteranceTiruan)
  Object.defineProperty(window, 'speechSynthesis', { value: sintesis, configurable: true })
  usePengaturan.getState().aturSuara(true)
  usePengaturan.getState().atur('narasi', true)
  usePengaturan.getState().atur('pelan', false)
})

test('kalimat belum direkam dibacakan suara browser dengan lafal rumus', async () => {
  const selesai = vi.fn()
  const janji = ucapkan('x', 'NAD⁺ dan H₂O, 4 − 2').then(selesai)
  expect(sintesis.speak).toHaveBeenCalledOnce()
  const u = sintesis.speak.mock.calls[0][0] as UtteranceTiruan
  expect(u.text).toBe('NAD plus dan H2O, 4  kurang 2')
  await Promise.resolve()
  expect(selesai).not.toHaveBeenCalled()
  u.onend!()
  await janji
  expect(selesai).toHaveBeenCalled()
})

test('narasi mati langsung selesai tanpa suara', async () => {
  usePengaturan.getState().atur('narasi', false)
  await ucapkan('x', 'halo')
  expect(sintesis.speak).not.toHaveBeenCalled()
})

test('tanpa suara Indonesia hanya subtitle', async () => {
  sintesis.getVoices.mockReturnValue([{ lang: 'en-US', name: 'English' }])
  await ucapkan('x', 'halo')
  expect(sintesis.speak).not.toHaveBeenCalled()
})

test('abort menghentikan narasi', async () => {
  const pengendali = new AbortController()
  const janji = ucapkan('x', 'halo', { signal: pengendali.signal })
  pengendali.abort()
  await janji
  expect(sintesis.cancel).toHaveBeenCalled()
})

test('menunggu voiceschanged bila daftar suara masih kosong', async () => {
  sintesis.getVoices.mockReturnValue([])
  const janji = ucapkan('x', 'halo')
  expect(sintesis.speak).not.toHaveBeenCalled()
  sintesis.getVoices.mockReturnValue([{ lang: 'id-ID', name: 'Indonesian' }])
  const [jenis, panggil] = sintesis.addEventListener.mock.calls[0]
  expect(jenis).toBe('voiceschanged')
  panggil()
  expect(sintesis.speak).toHaveBeenCalledOnce()
  ;(sintesis.speak.mock.calls[0][0] as UtteranceTiruan).onend!()
  await janji
})
