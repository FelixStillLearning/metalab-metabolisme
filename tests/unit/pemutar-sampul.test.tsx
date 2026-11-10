import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, test, vi } from 'vitest'
import PemutarEpisode from '../../src/features/pemutar-episode/PemutarEpisode'
import { bunyi } from '../../src/lib/suara'

vi.mock('../../src/lib/suara', () => ({ bunyi: vi.fn(), musik: vi.fn(), putar: vi.fn() }))
afterEach(cleanup)

const sampul = () =>
  render(
    <MemoryRouter>
      <PemutarEpisode
        judul="Glikolisis"
        label="Episode 1"
        ringkasan="Ringkasan."
        bab={[{ k: 'a', t: 'Bab 1' }]}
        gambarSampul=""
        jalankan={async () => {}}
      />
    </MemoryRouter>,
  )

test('sampul tidak bersuara sendiri; mulai episode memutar suara mulai', async () => {
  sampul()
  expect(bunyi).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'Mulai episode' }))
  expect(bunyi).toHaveBeenCalledExactlyOnceWith('mulai')
})

test('tombol peta materi di sampul memutar suara kembali', async () => {
  sampul()
  await userEvent.click(screen.getAllByRole('link', { name: 'Peta materi' })[0])
  expect(bunyi).toHaveBeenCalledExactlyOnceWith('kembali')
})
