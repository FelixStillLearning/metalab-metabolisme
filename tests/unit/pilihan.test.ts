import { beforeEach, expect, test, vi } from 'vitest'
import { mintaKetukSemua, mintaPilihan } from '../../src/features/pemutar-episode/pilihan'
import { usePemutar } from '../../src/stores/pemutar'

const isi = { judul: 'Pilih', opsi: [{ teks: 'salah' }, { teks: 'benar' }] }

beforeEach(() => usePemutar.setState({ pilihan: null, dijeda: false }))

test('pilihan menahan jawaban salah, indeks tidak valid, dan input selama jeda', async () => {
  const salah = vi.fn()
  const selesai = vi.fn()
  const janji = mintaPilihan(new AbortController().signal, isi, 1, salah).then(selesai)
  const pilih = usePemutar.getState().pilihan!.pilih
  await pilih(99)
  await pilih(0)
  expect(salah).toHaveBeenCalledExactlyOnceWith(0)
  usePemutar.setState({ dijeda: true })
  await pilih(1)
  expect(selesai).not.toHaveBeenCalled()
  usePemutar.setState({ dijeda: false })
  await pilih(1)
  await janji
  expect(usePemutar.getState().pilihan).toBeNull()
  expect(selesai).toHaveBeenCalledOnce()
})

test('abort menghapus pilihan dan callback lama tidak dapat menjawab lagi', async () => {
  const kontrol = new AbortController()
  const salah = vi.fn()
  const janji = mintaPilihan(kontrol.signal, isi, 1, salah)
  const ditolak = expect(janji).rejects.toMatchObject({ name: 'AbortError' })
  const pilih = usePemutar.getState().pilihan!.pilih
  kontrol.abort()
  await ditolak
  await pilih(0)
  expect(salah).not.toHaveBeenCalled()
  expect(usePemutar.getState().pilihan).toBeNull()
})

test('kegagalan umpan balik yang terlambat tidak menghapus pilihan putaran baru', async () => {
  let gagal!: (e: Error) => void
  const umpanBalik = new Promise<void>((_, reject) => {
    gagal = reject
  })
  const kontrol = new AbortController()
  const lama = mintaPilihan(kontrol.signal, isi, 1, () => umpanBalik)
  const ditolak = expect(lama).rejects.toMatchObject({ name: 'AbortError' })
  const tanggapan = usePemutar.getState().pilihan!.pilih(0)
  kontrol.abort()
  await ditolak
  const baru = mintaPilihan(new AbortController().signal, isi, 1, () => {})
  const pilihanBaru = usePemutar.getState().pilihan!
  gagal(new Error('terlambat'))
  await tanggapan
  expect(usePemutar.getState().pilihan).toBe(pilihanBaru)
  pilihanBaru.pilih(1)
  await baru
})

test('ketuk semua: tiap sasaran sekali, sasaran yang sudah diketuk hilang, selesai setelah semuanya', async () => {
  const ketuk = vi.fn(async () => {})
  const selesai = vi.fn()
  const sasaran = [
    { teks: 'NAD⁺ atas', posisi: [100, 100] as [number, number] },
    { teks: 'NAD⁺ bawah', posisi: [100, 300] as [number, number] },
  ]
  const janji = mintaKetukSemua(new AbortController().signal, 'Ketuk NAD⁺', sasaran, ketuk).then(
    selesai,
  )
  const pilih = usePemutar.getState().pilihan!.pilih
  usePemutar.setState({ dijeda: true })
  await pilih(1)
  expect(ketuk).not.toHaveBeenCalled()
  usePemutar.setState({ dijeda: false })
  await pilih(1)
  await pilih(1)
  expect(ketuk).toHaveBeenCalledExactlyOnceWith(1)
  expect(usePemutar.getState().pilihan!.opsi[1].selesai).toBe(true)
  expect(selesai).not.toHaveBeenCalled()
  await pilih(0)
  await janji
  expect(ketuk).toHaveBeenCalledTimes(2)
  expect(usePemutar.getState().pilihan).toBeNull()
})
