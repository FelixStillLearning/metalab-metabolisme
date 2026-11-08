import { beforeEach, expect, test } from 'vitest'
import { useJawaban } from '../../src/stores/jawaban'

beforeEach(() => {
  localStorage.clear()
  useJawaban.setState({ draf: {}, hasil: null })
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
