import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, test, vi } from 'vitest'
import PetaMateri from '../../src/features/peta-materi/PetaMateri'
import { putar } from '../../src/lib/suara'

vi.mock('../../src/lib/suara', () => ({ putar: vi.fn(), siapkan: vi.fn() }))
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
