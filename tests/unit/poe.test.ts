import { afterEach, beforeEach, expect, test } from 'vitest'
import { kendali } from '../../src/features/pemutar-episode/mesin'
import {
  mintaJelaskan,
  mintaTebak,
  tandaiAmati,
  tampilkanAmati,
} from '../../src/features/pemutar-episode/poe'
import {
  usePemutar,
  type PoeAmatiState,
  type PoeJelaskanState,
  type PoeTebakState,
} from '../../src/stores/pemutar'

beforeEach(() => {
  usePemutar.setState({ poe: null, dijeda: false })
})
afterEach(() => {
  kendali.otomatis = false
})

test('mintaTebak menahan penguncian sampai ada token dan alasan dipilih', async () => {
  const signal = new AbortController().signal
  const janji = mintaTebak(signal, {
    judul: 'Berapa ATP?',
    reasons: ['Alasan 1', 'Alasan 2', 'Alasan 3'],
    right: 2,
    zone: { x: 300, y: 430, w: 380, h: 390, name: 'glukosa' },
    supply: [
      [620, 580],
      [740, 580],
      [860, 580],
    ],
    slot: (i, n) => [300 + (i - (n - 1) / 2) * 120, 285],
  })

  const state = usePemutar.getState().poe as PoeTebakState
  expect(state.tahap).toBe('tebak')
  expect(state.placed.length).toBe(0)

  // Belum bisa kunci jika belum ada token dan alasan
  state.kunci()
  expect(usePemutar.getState().poe).not.toBeNull()

  // Taruh 2 token dan pilih alasan ke-1
  state.taruhToken(0)
  state.taruhToken(1)
  state.pilihAlasan(1)
  expect((usePemutar.getState().poe as PoeTebakState).placed.length).toBe(2)
  expect((usePemutar.getState().poe as PoeTebakState).alasan).toBe(1)

  // Kunci tebakan
  state.kunci()
  const hasil = await janji
  expect(hasil.g).toBe(2)
  expect(hasil.r).toBe(1)
  expect(hasil.from.length).toBe(2)
})

test('tampilkanAmati dan tandaiAmati memperbarui teks dan lencana tebakan', () => {
  tampilkanAmati(2, 'ATP')
  expect((usePemutar.getState().poe as PoeAmatiState)?.gtagText).toBe('Tebakanmu: 2 ATP')

  tandaiAmati('benar')
  expect((usePemutar.getState().poe as PoeAmatiState)?.statusTebakan).toBe('benar')
  expect((usePemutar.getState().poe as PoeAmatiState)?.tebakan).toBe('2 ATP')

  tandaiAmati('salah', 'ATP ketiga tidak terpakai')
  expect((usePemutar.getState().poe as PoeAmatiState)?.catatan).toBe('ATP ketiga tidak terpakai')
})

test('mintaJelaskan memberi umpan balik dan selesai saat alasan tepat dipilih lalu lanjut', async () => {
  const signal = new AbortController().signal
  const janji = mintaJelaskan(signal, {
    g: 2,
    r: 1,
    unit: 'ATP',
    reasons: ['Alasan A', 'Alasan B', 'Alasan C'],
    back: ['Salah A', 'Benar B', 'Salah C'],
    right: 2,
    alasanBenar: 1,
    hasil: 'glukosa terbelah',
  })

  let state = usePemutar.getState().poe as PoeJelaskanState
  expect(state.tahap).toBe('jelaskan')

  // Pilih yang salah
  state.pilihExplain(0)
  state = usePemutar.getState().poe as PoeJelaskanState
  expect(state.explainDone).toBe(false)
  expect(state.selectedExplain).toBe(0)

  // Pilih yang benar
  state.pilihExplain(1)
  state = usePemutar.getState().poe as PoeJelaskanState
  expect(state.explainDone).toBe(true)

  // Tekan lanjut
  state.lanjut()
  const pilihanPertama = await janji
  expect(pilihanPertama).toBe(0) // Pilihan pertama dicatat
  expect(usePemutar.getState().poe).toBeNull()
})

// Vonis tebakan memakai jumlah yang benar (right), bukan indeks alasan yang benar (alasanBenar)
test.each([
  [2, true, 'Tebakanmu tepat: glukosa terbelah.'],
  [1, false, 'Tebakanmu 1 ATP belum tepat. Yang terjadi: glukosa terbelah.'],
  [3, false, 'Tebakanmu 3 ATP belum tepat. Yang terjadi: glukosa terbelah.'],
])('mintaJelaskan: tebakan %i ATP, vonis tepat = %s', (g, tepat, teks) => {
  void mintaJelaskan(new AbortController().signal, {
    g,
    r: 0,
    unit: 'ATP',
    reasons: ['Alasan A', 'Alasan B', 'Alasan C'],
    back: ['Salah A', 'Benar B', 'Salah C'],
    right: 2,
    alasanBenar: 1,
    hasil: 'glukosa terbelah',
  })
  const state = usePemutar.getState().poe as PoeJelaskanState
  expect(state.verdictTepat).toBe(tepat)
  expect(state.verdictText).toContain(teks)
})

test('mode otomatis: tebakan dan penjelasan langsung benar tanpa kartu', async () => {
  kendali.otomatis = true
  const signal = new AbortController().signal
  const P = await mintaTebak(signal, {
    judul: 'Berapa ATP?',
    reasons: ['Alasan 1', 'Alasan 2', 'Alasan 3'],
    right: 2,
    zone: { x: 300, y: 430, w: 380, h: 390, name: 'glukosa' },
    supply: [],
    slot: (i) => [i * 100, 0],
  })
  expect(P).toEqual({
    g: 2,
    r: 1,
    from: [
      [0, 0],
      [100, 0],
    ],
  })
  const x = await mintaJelaskan(signal, {
    g: 2,
    r: 1,
    unit: 'ATP',
    reasons: ['a', 'b', 'c'],
    back: ['a', 'b', 'c'],
    right: 2,
    alasanBenar: 1,
    hasil: '2 ATP',
  })
  expect(x).toBe(1)
  expect(usePemutar.getState().poe).toBeNull()
})
