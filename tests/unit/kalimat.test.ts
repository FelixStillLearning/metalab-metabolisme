import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { mintaLengkapi } from '../../src/features/pemutar-episode/kalimat'
import { kendali } from '../../src/features/pemutar-episode/mesin'
import { usePemutar } from '../../src/stores/pemutar'

const potongan = ['Glikolisis terjadi di ', ' dalam kondisi ', '.']
const rumpang = [
  { opsi: ['matriks', 'sitosol'], benar: 1, salah: { 0: 'Belum masuk mitokondria.' } },
  { opsi: ['anaerob', 'aerob'], benar: 0, salah: { 1: 'Tanpa oksigen.' } },
]

beforeEach(() => usePemutar.setState({ lengkapi: null, kalimat: '', dijeda: false }))
afterEach(() => {
  kendali.otomatis = false
})

test('rumpang diisi berurutan; pilihan salah memberi umpan balik dan menahan', async () => {
  const selesai = vi.fn()
  const janji = mintaLengkapi(new AbortController().signal, 'Lengkapi', potongan, rumpang)
  void janji.then(selesai)
  const soal = () => usePemutar.getState().lengkapi!
  expect(soal().opsi).toEqual(['matriks', 'sitosol'])
  soal().pilih(0)
  expect(usePemutar.getState().kalimat).toBe('Belum masuk mitokondria.')
  expect(soal().terisi).toEqual([])
  usePemutar.setState({ dijeda: true })
  soal().pilih(1)
  expect(soal().terisi).toEqual([])
  usePemutar.setState({ dijeda: false })
  soal().pilih(1)
  expect(soal().terisi).toEqual(['sitosol'])
  expect(soal().opsi).toEqual(['anaerob', 'aerob'])
  soal().pilih(1)
  expect(usePemutar.getState().kalimat).toBe('Tanpa oksigen.')
  expect(selesai).not.toHaveBeenCalled()
  soal().pilih(0)
  expect(await janji).toBe('Glikolisis terjadi di sitosol dalam kondisi anaerob.')
  expect(selesai).toHaveBeenCalledOnce()
  expect(usePemutar.getState().lengkapi).toBeNull()
})

test('abort menghapus soal', async () => {
  const kontrol = new AbortController()
  const janji = mintaLengkapi(kontrol.signal, 'Lengkapi', potongan, rumpang)
  const pilih = usePemutar.getState().lengkapi!.pilih
  kontrol.abort()
  await expect(janji).rejects.toMatchObject({ name: 'AbortError' })
  pilih(1)
  expect(usePemutar.getState().lengkapi).toBeNull()
})

test('mode otomatis langsung mengisi kalimat benar', async () => {
  kendali.otomatis = true
  expect(await mintaLengkapi(new AbortController().signal, 'Lengkapi', potongan, rumpang)).toBe(
    'Glikolisis terjadi di sitosol dalam kondisi anaerob.',
  )
  expect(usePemutar.getState().lengkapi).toBeNull()
})
