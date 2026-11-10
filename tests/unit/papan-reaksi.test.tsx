import { act, cleanup, render } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import { gsap } from 'gsap'
import PapanReaksi from '../../src/episodes/episode-0-pengantar/PapanReaksi'
import { useAdeganE0 } from '../../src/episodes/episode-0-pengantar/adegan'
import { usePengaturan } from '../../src/stores/pengaturan'

afterEach(() => {
  cleanup()
  usePengaturan.setState({ tenang: null })
})

test('pergantian reaksi membersihkan gerak, mode tenang tetap menampilkan semua molekul', () => {
  usePengaturan.setState({ tenang: false })
  useAdeganE0.setState({ soal: 0, terjawab: false })
  const { container, unmount } = render(<PapanReaksi />)
  const molekul = [...container.querySelectorAll('.e0-molekul')]
  expect(molekul).toHaveLength(4)
  expect(gsap.getTweensOf(molekul).length).toBeGreaterThan(0)
  act(() => usePengaturan.setState({ tenang: true }))
  expect(gsap.getTweensOf(molekul)).toHaveLength(0)
  for (const m of molekul) expect(m).not.toHaveStyle({ opacity: '0' })
  act(() => useAdeganE0.setState({ soal: 3 }))
  expect(container.querySelector('[data-reaksi="b"]')).not.toBeNull()
  expect(container.querySelectorAll('[data-zat]')).toHaveLength(4)
  unmount()
  expect(gsap.getTweensOf(molekul)).toHaveLength(0)
})
