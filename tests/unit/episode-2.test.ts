import { afterEach, beforeEach, expect, test } from 'vitest'
import { kendali } from '../../src/features/pemutar-episode/mesin'
import { BAB, JAWABAN } from '../../src/episodes/episode-2-dekarboksilasi/isi'
import { lengkap, useJawabanE2 } from '../../src/stores/jawaban-episode-2'

beforeEach(() => {
  kendali.otomatis = false
  useJawabanE2.setState({ draf: { jawaban: {}, poe: {} }, hasil: null, penjelasan: '' })
})
afterEach(() => {
  kendali.otomatis = false
})

function isi() {
  for (const { k } of BAB) useJawabanE2.getState().catat(k)
  for (const k of ['c', 'b·2'] as const)
    useJawabanE2.getState().catatPoe(k, { tebakan: 2, alasan: 0, penjelasan: 1 })
}

test('E2 baru selesai sesudah semua butir dan dua POE; karbon dan hasil sesuai isi', () => {
  expect(useJawabanE2.getState().selesaikan()).toBe(false)
  for (const { k } of BAB) useJawabanE2.getState().catat(k)
  expect(useJawabanE2.getState().selesaikan()).toBe(false)
  isi()
  expect(useJawabanE2.getState().selesaikan()).toBe(true)
  expect(useJawabanE2.getState().hasil?.jawaban).toEqual(JAWABAN)
  expect(BAB.map(({ k }) => k)).toEqual(['a', 'b', 'c', 'b·2', 'd', 'f', 'g'])
  expect(JAWABAN.f).toContain('6 = 4')
})

test('ulang dan draf E2 menjaga hasil/refleksi, tidak menulis E0/E1', () => {
  localStorage.setItem('metalab-jawaban', 'hasil E1')
  localStorage.setItem('metalab-jawaban-e0', 'hasil E0')
  isi()
  useJawabanE2.getState().selesaikan()
  useJawabanE2.getState().simpanPenjelasan('Enam karbon tetap ada.')
  const lama = useJawabanE2.getState().hasil
  useJawabanE2.getState().mulai()
  expect(useJawabanE2.getState().hasil).toEqual(lama)
  const sebelum = localStorage.getItem('metalab-jawaban-e2')
  kendali.otomatis = true
  isi()
  useJawabanE2.getState().mulai()
  useJawabanE2.getState().selesaikan()
  expect(localStorage.getItem('metalab-jawaban-e2')).toBe(sebelum)
  expect(localStorage.getItem('metalab-jawaban')).toBe('hasil E1')
  expect(localStorage.getItem('metalab-jawaban-e0')).toBe('hasil E0')
})

test('hasil tersimpan yang tidak lengkap atau indeks POE tidak sah ditolak', async () => {
  isi()
  useJawabanE2.getState().selesaikan()
  const hasil = useJawabanE2.getState().hasil!
  expect(lengkap(hasil)).toBe(true)
  expect(
    lengkap({ ...hasil, poe: { ...hasil.poe, c: { tebakan: 99, alasan: 0, penjelasan: 1 } } }),
  ).toBe(false)
  localStorage.setItem(
    'metalab-jawaban-e2',
    JSON.stringify({ state: { hasil: { jawaban: JAWABAN, poe: {} }, penjelasan: {} }, version: 0 }),
  )
  await useJawabanE2.persist.rehydrate()
  expect(useJawabanE2.getState().hasil).toBeNull()
  expect(useJawabanE2.getState().penjelasan).toBe('')
})

test('muat ulang mempertahankan draf yang sah tanpa membawa tindakan dari penyimpanan', async () => {
  isi()
  useJawabanE2.getState().catat('a')
  const tersimpan = localStorage.getItem('metalab-jawaban-e2')!
  useJawabanE2.getState().mulai()
  localStorage.setItem('metalab-jawaban-e2', tersimpan)
  await useJawabanE2.persist.rehydrate()
  expect(useJawabanE2.getState().draf.jawaban.a).toBe(JAWABAN.a)
  expect(useJawabanE2.getState().draf.poe.c?.tebakan).toBe(2)
  expect(typeof useJawabanE2.getState().mulai).toBe('function')
})
