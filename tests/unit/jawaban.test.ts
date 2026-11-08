import { afterEach, beforeEach, expect, test } from 'vitest'
import { kendali } from '../../src/features/pemutar-episode/mesin'
import { useJawaban } from '../../src/stores/jawaban'

beforeEach(() => {
  localStorage.clear()
  useJawaban.setState({ draf: {}, drafPoe: {}, hasil: null, hasilPoe: null, penjelasan: '' })
})

afterEach(() => {
  kendali.otomatis = false
})

test('jawaban masuk ke draf tersimpan tanpa mengganti hasil lama', async () => {
  useJawaban.setState({ hasil: { a: 'hasil sebelumnya' } })
  useJawaban.getState().catat('a', 'Glukosa (6 atom C)')
  useJawaban.getState().catat('b', '2 tahap')
  const tersimpan = JSON.parse(localStorage.getItem('metalab-jawaban')!)
  expect(tersimpan.state.draf).toEqual({ a: 'Glukosa (6 atom C)', b: '2 tahap' })
  expect(tersimpan.state.hasil).toEqual({ a: 'hasil sebelumnya' })
  useJawaban.setState({ draf: {} })
  localStorage.setItem('metalab-jawaban', JSON.stringify(tersimpan))
  await useJawaban.persist.rehydrate()
  expect(useJawaban.getState().draf.b).toBe('2 tahap')
})

test('putaran baru mengosongkan draf saja', () => {
  useJawaban.setState({ draf: { a: 'Glukosa' }, hasil: { a: 'hasil sebelumnya' } })
  useJawaban.getState().mulai()
  expect(useJawaban.getState().draf).toEqual({})
  expect(useJawaban.getState().hasil).toEqual({ a: 'hasil sebelumnya' })
})

test('tebakan dan penjelasan POE tersimpan di drafPoe', () => {
  useJawaban.getState().catatPoe('c', { tebakan: 2, alasan: 1 })
  expect(useJawaban.getState().drafPoe.c).toEqual({ tebakan: 2, alasan: 1 })
  useJawaban.getState().catatPoe('c', { penjelasan: 1 })
  expect(useJawaban.getState().drafPoe.c).toEqual({ tebakan: 2, alasan: 1, penjelasan: 1 })
  useJawaban.getState().mulai()
  expect(useJawaban.getState().drafPoe).toEqual({})
})

test('putaran selesai: draf menjadi hasil tersimpan', () => {
  useJawaban.setState({ hasil: { a: 'lama' }, hasilPoe: { c: { tebakan: 3, alasan: 2 } } })
  useJawaban.getState().catat('a', 'Glukosa (6 atom C)')
  useJawaban.getState().catatPoe('e', { tebakan: 4, alasan: 0, penjelasan: 1 })
  useJawaban.getState().selesaikan()
  const { hasil, hasilPoe } = JSON.parse(localStorage.getItem('metalab-jawaban')!).state
  expect(hasil).toEqual({ a: 'Glukosa (6 atom C)' })
  expect(hasilPoe).toEqual({ e: { tebakan: 4, alasan: 0, penjelasan: 1 } })
})

test('penjelasan Lembar Hasil tersimpan', () => {
  useJawaban.getState().simpanPenjelasan('Dua ATP dipakai di awal.')
  const { penjelasan } = JSON.parse(localStorage.getItem('metalab-jawaban')!).state
  expect(penjelasan).toBe('Dua ATP dipakai di awal.')
})

test('putar ulang otomatis tidak menulis apa pun', () => {
  useJawaban.setState({
    draf: { a: 'draf' },
    hasil: { a: 'hasil' },
    hasilPoe: { c: { tebakan: 1, alasan: 0 } },
  })
  kendali.otomatis = true
  const { mulai, catat, catatPoe, selesaikan } = useJawaban.getState()
  mulai()
  catat('a', 'Glukosa (6 atom C)')
  catatPoe('c', { tebakan: 2, alasan: 1 })
  selesaikan()
  const s = useJawaban.getState()
  expect(s.draf).toEqual({ a: 'draf' })
  expect(s.drafPoe).toEqual({})
  expect(s.hasil).toEqual({ a: 'hasil' })
  expect(s.hasilPoe).toEqual({ c: { tebakan: 1, alasan: 0 } })
})
