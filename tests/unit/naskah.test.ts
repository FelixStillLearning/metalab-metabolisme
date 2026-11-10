import { afterEach, expect, test } from 'vitest'
import { NASKAH, say } from '../../src/episodes/episode-1-glikolisis/naskah'
import { soalH } from '../../src/episodes/episode-1-glikolisis/soalH'
import { kendali, wait, type Panggung } from '../../src/features/pemutar-episode/mesin'
import { usePengaturan } from '../../src/stores/pengaturan'
import { usePemutar } from '../../src/stores/pemutar'

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
  usePemutar.setState({ bab: -1, kalimat: '', pendamping: null })
})

test('soal h langsung menampilkan pertanyaan saat narasi petunjuk dimulai', async () => {
  usePengaturan.setState({ narasi: false })
  const kontrol = new AbortController()
  const p = {
    signal: kontrol.signal,
    fx: document.createElementNS('http://www.w3.org/2000/svg', 'g'),
  } as Panggung
  const janji = soalH(p, [])
  try {
    expect(usePemutar.getState().lengkapi?.judul).toBe('Lengkapi kalimat pengertian glikolisis')
    expect(usePemutar.getState().kalimat).toBe(NASKAH['e1-h-02'].teks)
  } finally {
    kontrol.abort()
    await expect(janji).rejects.toMatchObject({ name: 'AbortError' })
  }
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
