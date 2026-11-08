import { expect, test, vi } from 'vitest'
import { tenangAktif, usePengaturan } from '../../src/stores/pengaturan'

test('saklar pemutar punya nilai awal seperti prototype', () => {
  const { subtitle, narasi, efek, musik, pelan, tenang } = usePengaturan.getState()
  expect([subtitle, narasi, efek, musik]).toEqual([true, true, true, true])
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
