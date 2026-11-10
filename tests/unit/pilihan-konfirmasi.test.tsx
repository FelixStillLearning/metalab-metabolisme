import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import PilihanAdegan from '../../src/features/pemutar-episode/PilihanAdegan'
import { usePemutar } from '../../src/stores/pemutar'

afterEach(cleanup)

test('memilih tidak mengirim; Jawab mengirim pilihan dan status sibuk menonaktifkan kontrol', async () => {
  const pilih = vi.fn()
  usePemutar.setState({
    dijeda: false,
    pilihan: {
      judul: 'Energi',
      konfirmasi: true,
      opsi: [{ teks: 'Cahaya' }, { teks: 'ATP' }],
      pilih,
    },
  })
  const user = userEvent.setup()
  render(<PilihanAdegan />)
  const jawab = screen.getByRole('button', { name: 'Jawab', exact: true })
  expect(jawab).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'Cahaya', exact: true }))
  expect(pilih).not.toHaveBeenCalled()
  expect(screen.getByRole('button', { name: 'Cahaya', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await user.click(jawab)
  expect(pilih).toHaveBeenCalledExactlyOnceWith(0)
  act(() => usePemutar.setState((s) => ({ pilihan: { ...s.pilihan!, memeriksa: true } })))
  expect(screen.getByRole('button', { name: 'Tunggu…' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'ATP', exact: true })).toBeDisabled()
  expect(screen.getByRole('status')).toHaveTextContent('Sedang menjelaskan')
})

test('pilihan biasa tetap langsung mengirim tanpa tombol Jawab', async () => {
  const pilih = vi.fn()
  usePemutar.setState({
    dijeda: false,
    pilihan: { judul: 'Substrat', opsi: [{ teks: 'Glukosa' }], pilih },
  })
  render(<PilihanAdegan />)
  await userEvent.click(screen.getByRole('button', { name: 'Glukosa', exact: true }))
  expect(pilih).toHaveBeenCalledExactlyOnceWith(0)
  expect(screen.queryByRole('button', { name: 'Jawab', exact: true })).not.toBeInTheDocument()
})
