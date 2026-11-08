import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import Gelembung from '../../src/features/pemutar-episode/Gelembung'
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
  usePengaturan.setState({ subtitle: true, tenang: false })
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

test('maskot memberi perintah tanpa menghapus umpan balik, juga saat subtitle mati', () => {
  usePemutar.setState({
    pilihan: {
      judul: 'Ketuk NAD⁺ untuk menangkap elektron',
      opsi: [{ teks: 'NAD⁺ 1', posisi: [100, 100] }],
      pilih: vi.fn(),
    },
  })
  render(<Gelembung />)
  expect(screen.getByText('Ketuk NAD⁺ untuk menangkap elektron')).toBeVisible()
  expect(screen.getByText('Penjelasan proses.')).toBeVisible()
  act(() => usePemutar.setState({ kalimat: 'Coba lagi.' }))
  expect(screen.getByText('Coba lagi.')).toBeVisible()
  act(() => usePengaturan.setState({ subtitle: false }))
  expect(screen.getByText('Ketuk NAD⁺ untuk menangkap elektron')).toBeVisible()
  expect(screen.getByText('Coba lagi.')).not.toBeVisible()
  act(() => {
    const pilihan = usePemutar.getState().pilihan!
    usePemutar.setState({
      pilihan: { ...pilihan, opsi: pilihan.opsi.map((o) => ({ ...o, selesai: true })) },
    })
  })
  expect(screen.queryByText('Ketuk NAD⁺ untuk menangkap elektron')).not.toBeInTheDocument()
})

test('petunjuk POE mengikuti penempatan ATP, alasan, kunci, dan lanjut', () => {
  usePemutar.setState({ poe: tebak })
  render(<Gelembung />)
  expect(screen.getByText('Ketuk ATP untuk menaruhnya di glukosa.')).toBeVisible()
  expect(screen.getByText('Penjelasan proses.')).not.toBeVisible()
  act(() => usePemutar.setState({ poe: { ...tebak, placed: [0] } }))
  expect(screen.getByText('Pilih alasan untuk tebakanmu.')).toBeVisible()
  act(() => usePemutar.setState({ poe: { ...tebak, placed: [0], alasan: 1 } }))
  expect(screen.getByText(/Sudah yakin/)).toBeVisible()
  act(() => usePemutar.setState({ poe: { tahap: 'amati', gtagText: '', tebakan: '2 ATP' } }))
  expect(screen.queryByText(/Sudah yakin/)).not.toBeInTheDocument()
  expect(screen.getByText('Penjelasan proses.')).toBeVisible()
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
  expect(screen.getByText('Pilih alasan yang sesuai dengan proses tadi.')).toBeVisible()
  act(() => usePemutar.setState({ poe: { ...jelaskan, selectedExplain: 1, explainDone: true } }))
  expect(screen.getByText('Ketuk Lanjutkan video.')).toBeVisible()
})

test('petunjuk pilihan dan nomor rumpang berubah bersama langkahnya', () => {
  usePemutar.setState({
    pilihan: { judul: 'Jumlah tahap?', opsi: [{ teks: '2 tahap' }], pilih: vi.fn() },
  })
  render(<Gelembung />)
  expect(screen.getByText('Pilih salah satu jawaban di kartu.')).toBeVisible()
  const lengkapi = {
    judul: 'Lengkapi',
    potongan: ['Di ', ' tanpa ', '.'],
    terisi: [],
    opsi: ['sitosol'],
    pilih: vi.fn(),
  }
  act(() => usePemutar.setState({ pilihan: null, lengkapi }))
  expect(screen.getByText('Pilih jawaban untuk rumpang 1.')).toBeVisible()
  act(() =>
    usePemutar.setState({ lengkapi: { ...lengkapi, terisi: ['sitosol'], opsi: ['oksigen'] } }),
  )
  expect(screen.getByText('Pilih jawaban untuk rumpang 2.')).toBeVisible()
})

test('penanda hanya ada pada sasaran tersisa dan ATP yang belum ditaruh', () => {
  const pilihan = {
    judul: 'Ketuk NAD⁺',
    opsi: [
      { teks: 'NAD⁺ 1', posisi: [100, 100] as [number, number] },
      { teks: 'NAD⁺ 2', posisi: [200, 100] as [number, number] },
    ],
    pilih: vi.fn(),
  }
  usePemutar.setState({ pilihan })
  const { container } = render(
    <>
      <PilihanAdegan />
      <PoeAdegan />
    </>,
  )
  expect(container.querySelectorAll('.pemutar-ajakan')).toHaveLength(2)
  act(() =>
    usePemutar.setState({
      pilihan: {
        ...pilihan,
        opsi: pilihan.opsi.map((o, i) => (i === 0 ? { ...o, selesai: true } : o)),
      },
    }),
  )
  expect(container.querySelectorAll('.pemutar-ajakan')).toHaveLength(1)
  act(() => usePemutar.setState({ pilihan: null, poe: { ...tebak, placed: [0] } }))
  expect(container.querySelectorAll('.tok .pemutar-ajakan')).toHaveLength(1)
  expect(container.querySelector('.tok.placed .pemutar-ajakan')).toBeNull()
})
