import { afterEach, expect, test } from 'vitest'
import { NASKAH, say } from '../../src/episodes/episode-1-glikolisis/naskah'
import { kendali, wait, type Panggung } from '../../src/features/pemutar-episode/mesin'
import { usePengaturan } from '../../src/stores/pengaturan'

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

afterEach(() => {
  kendali.cepat = 1
  usePengaturan.setState({ tenang: null, narasi: true })
})

const lama = async (janji: Promise<void>) => {
  const mulai = performance.now()
  await janji
  return performance.now() - mulai
}

test('mode tenang tidak memangkas waktu baca subtitle, hanya jeda gerak', async () => {
  // cepat 0,12: waktu baca 1600 + 2400 ms menjadi 480 ms; batas tenang 400 ms menjadi 48 ms
  kendali.cepat = 0.12
  usePengaturan.setState({ tenang: true, narasi: false })
  const p = { signal: new AbortController().signal } as Panggung
  expect(await lama(say(p, 'e1-c-atp-1', { tambah: 2400 }))).toBeGreaterThanOrEqual(400)
  expect(await lama(wait(p, 4000))).toBeLessThan(300)
})
