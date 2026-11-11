import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, test, vi } from 'vitest'
import PetaMateri from '../../src/features/peta-materi/PetaMateri'
import { bunyi, musik, putar } from '../../src/lib/suara'

vi.mock('../../src/lib/suara', () => ({
  bunyi: vi.fn(),
  putar: vi.fn(),
  siapkan: vi.fn(),
  musik: vi.fn(),
}))
afterEach(cleanup)

test('suara peta hanya dipicu interaksi buka, tutup, dan kembali', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <PetaMateri />
    </MemoryRouter>,
  )
  expect(putar).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Respirasi Aerob' }))
  expect(putar).toHaveBeenLastCalledWith('buka-peta')
  await user.click(screen.getByRole('button', { name: 'Tutup episode' }))
  expect(putar).toHaveBeenLastCalledWith('tutup-peta')
  await user.click(screen.getByRole('link', { name: 'Beranda' }))
  expect(putar).toHaveBeenLastCalledWith('kembali')
  expect(putar).toHaveBeenCalledTimes(3)
})

test('membuka episode dari peta memutar suara masuk', async () => {
  const user = userEvent.setup()
  render(
    <MemoryRouter>
      <PetaMateri />
    </MemoryRouter>,
  )
  await user.click(screen.getByRole('button', { name: 'Respirasi Aerob' }))
  vi.mocked(bunyi).mockClear()
  await user.click(screen.getByRole('link', { name: 'Buka Glikolisis' }))
  expect(bunyi).toHaveBeenCalledExactlyOnceWith('melesat')
})

test('peta memakai musik menu dan menghentikannya saat halaman ditutup', () => {
  const { unmount } = render(
    <MemoryRouter>
      <PetaMateri />
    </MemoryRouter>,
  )
  expect(musik).toHaveBeenCalledExactlyOnceWith(true, 'musik-menu')
  unmount()
  expect(musik).toHaveBeenLastCalledWith(false)
})
