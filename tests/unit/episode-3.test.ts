import { afterEach, beforeEach, expect, test } from 'vitest'
import { kendali } from '../../src/features/pemutar-episode/mesin'
import { BAB, JAWABAN, TAHAP, ZAT, total } from '../../src/episodes/episode-3-krebs/isi'
import { lengkap, useJawabanE3 } from '../../src/stores/jawaban-episode-3'

beforeEach(() => {
  kendali.otomatis = false
  useJawabanE3.setState({ draf: { jawaban: {}, poe: {} }, hasil: null, penjelasan: '' })
})
afterEach(() => {
  kendali.otomatis = false
})
function isi() {
  for (const { k } of BAB) useJawabanE3.getState().catat(k)
  for (const k of ['i·1', 'i·2'] as const)
    useJawabanE3.getState().catatPoe(k, { tebakan: 2, alasan: 0, penjelasan: 1 })
}
test('delapan tahap mengembalikan OAA4C dan hasil tidak digandakan dua kali', () => {
  expect(TAHAP.map((t) => t.karbon)).toEqual([6, 6, 5, 4, 4, 4, 4, 4])
  expect(TAHAP[7].nama).toBe('Oksaloasetat')
  expect(TAHAP.flatMap((t, i) => (t.air ? [i + 1] : []))).toEqual([1, 7])
  for (const z of ZAT.filter((z) => z.k !== 'd'))
    expect(TAHAP.flatMap((t, i) => (t.hasil === z.nama ? [i + 1] : []))).toEqual(z.tahap)
  expect(total(1)).toEqual({ NADH: 3, FADH2: 1, ATP: 1, CO2: 2 })
  expect(total(2)).toEqual({ NADH: 6, FADH2: 2, ATP: 2, CO2: 4 })
  expect(BAB.map((b) => b.k)).not.toContain('h')
})
test('hasil memerlukan semua butir dan dua POE sah', () => {
  expect(useJawabanE3.getState().selesaikan()).toBe(false)
  for (const { k } of BAB) useJawabanE3.getState().catat(k)
  expect(useJawabanE3.getState().selesaikan()).toBe(false)
  isi()
  expect(useJawabanE3.getState().selesaikan()).toBe(true)
  const hasil = useJawabanE3.getState().hasil!
  expect(hasil.jawaban).toEqual(JAWABAN)
  for (const k of ['i·1', 'i·2'] as const)
    for (const n of [-1, 3, 0.5, NaN])
      expect(
        lengkap({ ...hasil, poe: { ...hasil.poe, [k]: { tebakan: n, alasan: 0, penjelasan: 1 } } }),
      ).toBe(false)
})
test('replay dan mulai baru menjaga hasil/refleksi dan penyimpanan episode lama', () => {
  for (const key of ['metalab-jawaban', 'metalab-jawaban-e0', 'metalab-jawaban-e2'])
    localStorage.setItem(key, 'tetap')
  isi()
  useJawabanE3.getState().selesaikan()
  useJawabanE3.getState().simpanPenjelasan('  OAA terbentuk kembali.  ')
  const hasil = useJawabanE3.getState().hasil
  useJawabanE3.getState().mulai()
  expect(useJawabanE3.getState().hasil).toEqual(hasil)
  expect(useJawabanE3.getState().penjelasan).toBe('OAA terbentuk kembali.')
  const sebelum = localStorage.getItem('metalab-jawaban-e3')
  kendali.otomatis = true
  isi()
  useJawabanE3.getState().mulai()
  useJawabanE3.getState().selesaikan()
  expect(localStorage.getItem('metalab-jawaban-e3')).toBe(sebelum)
  for (const key of ['metalab-jawaban', 'metalab-jawaban-e0', 'metalab-jawaban-e2'])
    expect(localStorage.getItem(key)).toBe('tetap')
})
test('rehidrasi menolak hasil rusak dan mempertahankan draf sah', async () => {
  isi()
  const tersimpan = localStorage.getItem('metalab-jawaban-e3')!
  useJawabanE3.getState().mulai()
  localStorage.setItem('metalab-jawaban-e3', tersimpan)
  await useJawabanE3.persist.rehydrate()
  expect(useJawabanE3.getState().draf.jawaban.a).toBe(JAWABAN.a)
  localStorage.setItem(
    'metalab-jawaban-e3',
    JSON.stringify({
      state: {
        hasil: { jawaban: JAWABAN, poe: {} },
        penjelasan: {},
        draf: { poe: { 'i·1': { tebakan: 99 } } },
        mulai: 'invalide',
      },
      version: 0,
    }),
  )
  await useJawabanE3.persist.rehydrate()
  expect(useJawabanE3.getState().hasil).toBeNull()
  expect(useJawabanE3.getState().penjelasan).toBe('')
  expect(useJawabanE3.getState().draf.poe).toEqual({})
  expect(typeof useJawabanE3.getState().mulai).toBe('function')
})
