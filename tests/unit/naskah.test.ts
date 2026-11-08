import { expect, test } from 'vitest'
import { NASKAH } from '../../src/episodes/episode-1-glikolisis/naskah'

test('naskah memuat semua kalimat utama episode 1', () => {
  const kalimat = Object.values(NASKAH)
  expect(Object.keys(NASKAH)).toHaveLength(38)
  for (const { teks } of kalimat) {
    expect(teks.trim()).not.toBe('')
    expect(teks).not.toMatch(/DRAF|\(prototype/)
  }
  expect(NASKAH['e1-d-01'].teks).toContain('dua elektron')
  expect(NASKAH['e1-pembuka-01'].pose).toBe('01-ramah')
})
