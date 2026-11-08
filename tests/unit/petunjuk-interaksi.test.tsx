import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import Gelembung from '../../src/features/pemutar-episode/Gelembung'
import PetunjukInteraksi from '../../src/features/pemutar-episode/PetunjukInteraksi'
import { petunjukInteraksi } from '../../src/features/pemutar-episode/petunjuk'
import PilihanAdegan from '../../src/features/pemutar-episode/PilihanAdegan'
import PoeAdegan from '../../src/features/pemutar-episode/PoeAdegan'
import { usePemutar, type PoeTebakState } from '../../src/stores/pemutar'
import { usePengaturan } from '../../src/stores/pengaturan'

beforeEach(() => {
  usePemutar.setState({
    kalimat: 'Penjelasan proses.',
    pose: '05-menjelaskan',
    pendamping: null,
    pilihan: null,
    lengkapi: null,
    poe: null,
    dijeda: false,
  })
  usePengaturan.setState({ subtitle: true, tenang: true })
})
afterEach(cleanup)

const tebak: PoeTebakState = {
  tahap: 'tebak',
  judul: 'Berapa ATP?',
  reasons: ['Alasan satu', 'Alasan dua'],
  right: 2,
  zone: { x: 400, y: 400, w: 200, h: 200, name: 'glukosa' },
  supply: [
    [100, 100],
    [200, 100],
  ],
  slot: () => [400, 400],
  placed: [],
  alasan: null,
  taruhToken: vi.fn(),
  pilihAlasan: vi.fn(),
  kunci: vi.fn(),
}

test('petunjuk terpisah dari bubble tanpa menghapus umpan balik, juga saat subtitle mati', async () => {
  usePemutar.setState({
    pilihan: {
      judul: 'Ketuk NAD⁺ untuk menangkap elektron',
      opsi: [{ teks: 'NAD⁺ 1', posisi: [100, 100] }],
      pilih: vi.fn(),
    },
  })
  const { container } = render(
    <>
      <Gelembung />
      <PetunjukInteraksi />
    </>,
  )
  expect(container.querySelector('.pemutar-gelembung [data-petunjuk]')).toBeNull()
  await waitFor(() => expect(screen.getByText('Ketuk NAD⁺ untuk menangkap elektron')).toBeVisible())
  expect(screen.getByText('Penjelasan proses.')).toBeVisible()
  act(() => usePemutar.setState({ kalimat: 'Coba lagi.' }))
  expect(screen.getByText('Coba lagi.')).toBeVisible()
  act(() => usePengaturan.setState({ subtitle: false }))
  await waitFor(() => expect(screen.getByText('Ketuk NAD⁺ untuk menangkap elektron')).toBeVisible())
  expect(screen.getByText('Coba lagi.')).not.toBeVisible()
  act(() => {
    const pilihan = usePemutar.getState().pilihan!
    usePemutar.setState({
      pilihan: { ...pilihan, opsi: pilihan.opsi.map((o) => ({ ...o, selesai: true })) },
    })
  })
  await waitFor(() =>
    expect(screen.queryByText('Ketuk NAD⁺ untuk menangkap elektron')).not.toBeInTheDocument(),
  )
})

test('petunjuk POE mengikuti penempatan ATP, alasan, kunci, dan lanjut', () => {
  usePemutar.setState({ poe: tebak })
  expect(petunjukInteraksi(usePemutar.getState())).toBe('Ketuk ATP ke glukosa.')
  act(() => usePemutar.setState({ poe: { ...tebak, placed: [0] } }))
  expect(petunjukInteraksi(usePemutar.getState())).toBe('Pilih alasan tebakanmu.')
  act(() => usePemutar.setState({ poe: { ...tebak, placed: [0], alasan: 1 } }))
  expect(petunjukInteraksi(usePemutar.getState())).toBe('Ketuk Kunci tebakan.')
  act(() => usePemutar.setState({ poe: { tahap: 'amati', gtagText: '', tebakan: '2 ATP' } }))
  expect(petunjukInteraksi(usePemutar.getState())).toBe('')
  const jelaskan = {
    tahap: 'jelaskan' as const,
    judul: 'Alasan?',
    tadiText: '',
    verdictText: '',
    verdictTepat: true,
    reasons: [],
    back: [],
    alasanBenar: 1,
    selectedExplain: null,
    explainDone: false,
    pilihExplain: vi.fn(),
    lanjut: vi.fn(),
  }
  act(() => usePemutar.setState({ poe: jelaskan }))
  expect(petunjukInteraksi(usePemutar.getState())).toBe(
    'Pilih alasan yang sesuai dengan proses tadi.',
  )
  act(() => usePemutar.setState({ poe: { ...jelaskan, selectedExplain: 1, explainDone: true } }))
  expect(petunjukInteraksi(usePemutar.getState())).toBe('Ketuk Lanjutkan video.')
})

test('petunjuk pilihan dan nomor rumpang berubah bersama langkahnya', () => {
  usePemutar.setState({
    pilihan: { judul: 'Jumlah tahap?', opsi: [{ teks: '2 tahap' }], pilih: vi.fn() },
  })
  expect(petunjukInteraksi(usePemutar.getState())).toBe('Pilih salah satu jawaban di kartu.')
  const lengkapi = {
    judul: 'Lengkapi',
    potongan: ['Di ', ' tanpa ', '.'],
    terisi: [],
    opsi: ['sitosol'],
    pilih: vi.fn(),
  }
  act(() => usePemutar.setState({ pilihan: null, lengkapi }))
  expect(petunjukInteraksi(usePemutar.getState())).toBe('Pilih jawaban untuk rumpang 1.')
  act(() =>
    usePemutar.setState({ lengkapi: { ...lengkapi, terisi: ['sitosol'], opsi: ['oksigen'] } }),
  )
  expect(petunjukInteraksi(usePemutar.getState())).toBe('Pilih jawaban untuk rumpang 2.')
})

test('sasaran dan ATP tidak memakai penanda tangan', () => {
  usePemutar.setState({
    pilihan: {
      judul: 'Ketuk NAD⁺',
      opsi: [{ teks: 'NAD⁺ 1', posisi: [100, 100] }],
      pilih: vi.fn(),
    },
    poe: tebak,
  })
  const { container } = render(
    <>
      <PilihanAdegan />
      <PoeAdegan />
      <PetunjukInteraksi />
    </>,
  )
  expect(container.querySelectorAll('.pemutar-ajakan')).toHaveLength(0)
  expect(container.querySelector('.pemutar-panduan img')).toBeNull()
})
