import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import PilihanAdegan from '../../src/features/pemutar-episode/PilihanAdegan'
import LengkapiAdegan from '../../src/features/pemutar-episode/LengkapiAdegan'
import { usePemutar } from '../../src/stores/pemutar'

beforeEach(() => usePemutar.setState({ pilihan: null, lengkapi: null, dijeda: false }))
afterEach(cleanup)

test('satu pilihan ditandai, tetap saat jeda, lalu direset pada soal baru', async () => {
  const user = userEvent.setup()
  const pilih = vi.fn()
  usePemutar.setState({
    pilihan: { judul: 'Jumlah tahap', opsi: [{ teks: '1 tahap' }, { teks: '2 tahap' }], pilih },
  })
  render(<PilihanAdegan />)
  const satu = screen.getByRole('button', { name: '1 tahap' })
  const dua = screen.getByRole('button', { name: '2 tahap' })
  await user.click(satu)
  expect(satu).toHaveAttribute('aria-pressed', 'true')
  await user.click(dua)
  expect(dua).toHaveAttribute('aria-pressed', 'true')
  expect(satu).toHaveAttribute('aria-pressed', 'false')
  act(() => usePemutar.setState({ dijeda: true }))
  await user.click(satu)
  expect(pilih).toHaveBeenCalledTimes(2)
  expect(dua).toHaveAttribute('aria-pressed', 'true')
  act(() =>
    usePemutar.setState({
      pilihan: { judul: 'Soal baru', opsi: [{ teks: '1 tahap' }, { teks: '2 tahap' }], pilih },
      dijeda: false,
    }),
  )
  expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0)
})

test('pilihan rumpang direset saat beralih ke rumpang berikutnya', async () => {
  const user = userEvent.setup()
  const pilih = vi.fn()
  const soal = {
    judul: 'Lengkapi',
    potongan: ['Di ', ' tanpa ', '.'],
    terisi: [],
    opsi: ['matriks', 'sitosol'],
    pilih,
  }
  usePemutar.setState({ lengkapi: soal })
  render(<LengkapiAdegan />)
  await user.click(screen.getByRole('button', { name: 'matriks' }))
  expect(screen.getByRole('button', { name: 'matriks' })).toHaveAttribute('aria-pressed', 'true')
  act(() =>
    usePemutar.setState({
      lengkapi: { ...soal, terisi: ['sitosol'], opsi: ['oksigen', 'cahaya'] },
    }),
  )
  expect(screen.queryAllByRole('button', { pressed: true })).toHaveLength(0)
  await user.click(screen.getByRole('button', { name: 'oksigen' }))
  expect(screen.getByRole('button', { name: 'oksigen' })).toHaveAttribute('aria-pressed', 'true')
})
