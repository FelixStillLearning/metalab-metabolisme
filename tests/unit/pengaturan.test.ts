import { expect, test, vi } from 'vitest'
import { tenangAktif, usePengaturan } from '../../src/stores/pengaturan'

test('saklar pemutar punya nilai awal seperti prototype', () => {
  const { volume, subtitle, narasi, efek, musik, pelan, tenang } = usePengaturan.getState()
  expect([subtitle, narasi, efek, musik]).toEqual([true, true, true, true])
  expect(volume).toBe(0.5)
  expect(pelan).toBe(false)
  expect(tenang).toBeNull()
})

test('atur menyimpan saklar ke localStorage', () => {
  usePengaturan.getState().atur('pelan', true)
  expect(JSON.parse(localStorage.getItem('metalab-pengaturan')!).state.pelan).toBe(true)
})

test('tenang null mengikuti prefers-reduced-motion', () => {
  const asli = window.matchMedia
  window.matchMedia = vi.fn(() => ({ matches: true })) as unknown as typeof window.matchMedia
  expect(tenangAktif()).toBe(true)
  usePengaturan.getState().atur('tenang', false)
  expect(tenangAktif()).toBe(false)
  window.matchMedia = asli
})

test('volume disimpan, dibatasi 0–1, dan menolak angka tidak valid', async () => {
  const { aturVolume } = usePengaturan.getState()
  aturVolume(0.72)
  expect(JSON.parse(localStorage.getItem('metalab-pengaturan')!).state.volume).toBe(0.72)
  await usePengaturan.persist.rehydrate()
  expect(usePengaturan.getState().volume).toBe(0.72)
  aturVolume(2)
  expect(usePengaturan.getState().volume).toBe(1)
  aturVolume(-1)
  expect(usePengaturan.getState().volume).toBe(0)
  aturVolume(NaN)
  aturVolume(Infinity)
  expect(usePengaturan.getState().volume).toBe(0)
})

test('pengaturan lama tanpa volume tetap mendapat nilai awal 50%', async () => {
  usePengaturan.setState({ volume: 0.5 })
  localStorage.setItem(
    'metalab-pengaturan',
    JSON.stringify({ state: { suaraAktif: false, musik: false }, version: 0 }),
  )
  await usePengaturan.persist.rehydrate()
  expect(usePengaturan.getState().volume).toBe(0.5)
  expect(usePengaturan.getState().suaraAktif).toBe(false)
  expect(usePengaturan.getState().musik).toBe(false)
})
