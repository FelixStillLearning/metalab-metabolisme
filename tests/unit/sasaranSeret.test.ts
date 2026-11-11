import { expect, test } from 'vitest'
import { sasaranSeret } from '../../src/features/pemutar-episode/sasaranSeret'

const opsi = Array.from({ length: 8 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 4
  return {
    teks: `Tahap ${i + 1}`,
    posisi: [500 + Math.cos(a) * 120, 450 + Math.sin(a) * 120] as [number, number],
    ukuran: [78, 78] as [number, number],
  }
})

test('bagian dekat tahap 8 tidak ditangkap tahap 7', () => {
  expect(sasaranSeret(opsi, 410, 398)).toBe(7)
  opsi.forEach((o, i) => expect(sasaranSeret(opsi, ...o.posisi)).toBe(i))
})

test('celah, luar roda, dan sasaran selesai tidak dialihkan ke tetangga', () => {
  expect(sasaranSeret(opsi, 500, 450)).toBe(-1)
  expect(sasaranSeret(opsi, 1000, 450)).toBe(-1)
  const tengah = opsi[6].posisi.map((v, i) => (v + opsi[7].posisi[i]) / 2)
  expect(sasaranSeret(opsi, tengah[0], tengah[1])).toBe(-1)
  expect(
    sasaranSeret(
      opsi.map((o, i) => ({ ...o, selesai: i === 7 })),
      ...opsi[7].posisi,
    ),
  ).toBe(-1)
})
