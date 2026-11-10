import { afterEach, beforeEach, expect, test } from 'vitest'
import { kendali } from '../../src/features/pemutar-episode/mesin'
import {
  BUTIR,
  JAWABAN,
  JALUR,
  MEMOMPA,
  ATP_TRANSPOR,
  ATP_TOTAL,
  TABEL,
} from '../../src/episodes/episode-4-transpor-elektron/isi'
import { lengkap, useJawabanE4 } from '../../src/stores/jawaban-episode-4'
beforeEach(() => {
  kendali.otomatis = false
  useJawabanE4.setState({ draf: { jawaban: {}, poe: {} }, hasil: null, penjelasan: '' })
})
afterEach(() => {
  kendali.otomatis = false
})
function isi() {
  for (const k of BUTIR) useJawabanE4.getState().catat(k)
  for (const k of ['c', 'h'] as const)
    useJawabanE4.getState().catatPoe(k, { tebakan: 2, alasan: 0, penjelasan: 1 })
}
test('jalur, pemompa, konversi buku dan tabel 1.11 konsisten', () => {
  expect(JALUR.NADH).toEqual(['I', 'III', 'IV'])
  expect(JALUR.FADH2).toEqual(['II', 'III', 'IV'])
  expect(MEMOMPA).not.toContain('II')
  expect(ATP_TRANSPOR).toBe(34)
  expect(ATP_TOTAL).toBe(38)
  expect(TABEL.map((r) => r.sel.length)).toEqual([4, 4, 4, 4, 4, 4])
  expect(TABEL[5].sel.map(parseFloat)).toEqual([2, 0, 2, 34])
  expect(TABEL[5].sel.reduce((s, n) => s + parseFloat(n), 0)).toBe(38)
})
test('hasil memerlukan semua butir dan dua POE sah', () => {
  for (const k of BUTIR) useJawabanE4.getState().catat(k)
  expect(useJawabanE4.getState().selesaikan()).toBe(false)
  isi()
  expect(useJawabanE4.getState().selesaikan()).toBe(true)
  const hasil = useJawabanE4.getState().hasil!
  expect(hasil.jawaban).toEqual(JAWABAN)
  for (const k of ['c', 'h'] as const)
    expect(
      lengkap({ ...hasil, poe: { ...hasil.poe, [k]: { tebakan: 3, alasan: 0, penjelasan: 1 } } }),
    ).toBe(false)
})
test('draf/replay/refleksi E4 menjaga data E0–3', () => {
  const keys = ['metalab-jawaban', 'metalab-jawaban-e0', 'metalab-jawaban-e2', 'metalab-jawaban-e3']
  keys.forEach((k) => localStorage.setItem(k, 'tetap'))
  isi()
  useJawabanE4.getState().selesaikan()
  useJawabanE4.getState().simpanPenjelasan(' Oksigen menerima elektron. ')
  const hasil = useJawabanE4.getState().hasil
  useJawabanE4.getState().mulai()
  expect(useJawabanE4.getState().hasil).toEqual(hasil)
  const sebelum = localStorage.getItem('metalab-jawaban-e4')
  kendali.otomatis = true
  isi()
  useJawabanE4.getState().mulai()
  useJawabanE4.getState().selesaikan()
  expect(localStorage.getItem('metalab-jawaban-e4')).toBe(sebelum)
  keys.forEach((k) => expect(localStorage.getItem(k)).toBe('tetap'))
})
test('rehidrasi memulihkan draf dan menolak data rusak', async () => {
  isi()
  const s = localStorage.getItem('metalab-jawaban-e4')!
  useJawabanE4.getState().mulai()
  localStorage.setItem('metalab-jawaban-e4', s)
  await useJawabanE4.persist.rehydrate()
  expect(useJawabanE4.getState().draf.jawaban.g).toBe(JAWABAN.g)
  localStorage.setItem(
    'metalab-jawaban-e4',
    JSON.stringify({
      state: { hasil: { jawaban: JAWABAN, poe: {} }, penjelasan: {}, mulai: 'invalide' },
      version: 0,
    }),
  )
  await useJawabanE4.persist.rehydrate()
  expect(useJawabanE4.getState().hasil).toBeNull()
  expect(useJawabanE4.getState().penjelasan).toBe('')
  expect(typeof useJawabanE4.getState().mulai).toBe('function')
})
