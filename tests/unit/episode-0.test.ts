import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { SOAL, TABEL, reaksi } from '../../src/episodes/episode-0-pengantar/isi'
import { useJawabanE0, lengkap } from '../../src/stores/jawaban-episode-0'
import { useJawaban } from '../../src/stores/jawaban'
import { kendali } from '../../src/features/pemutar-episode/mesin'
import { mintaPilah, usePilah } from '../../src/episodes/episode-0-pengantar/pilah'
import { usePemutar } from '../../src/stores/pemutar'

vi.mock('../../src/lib/suara', () => ({ bunyi: vi.fn() }))

beforeEach(() => {
  localStorage.clear()
  useJawabanE0.setState({ draf: { jawaban: {}, tabel: {} }, hasil: null, penjelasan: '' })
  usePemutar.setState({ dijeda: false })
})
afterEach(() => {
  kendali.otomatis = false
})

function isiSemua() {
  for (const s of SOAL) useJawabanE0.getState().catat(s.k)
  for (const r of TABEL)
    for (const sisi of [0, 1] as const) useJawabanE0.getState().catatSel(r.k, sisi)
}

test('kedua reaksi setara: setiap sisi C6 H12 O18', () => {
  for (const r of Object.values(reaksi)) {
    const hitung = (sisi: typeof r.bahan) =>
      sisi.reduce((total, m) => total.map((n, i) => n + m.atom[i] * m.jumlah), [0, 0, 0])
    expect(hitung(r.bahan)).toEqual([6, 12, 18])
    expect(hitung(r.hasil)).toEqual([6, 12, 18])
  }
})

test('E0 menyimpan 6 jawaban dan 10 sel tanpa mengubah seluruh data E1', async () => {
  useJawaban.setState({
    draf: { a: 'draf E1' },
    hasil: { a: 'hasil E1' },
    drafPoe: { c: { tebakan: 3, alasan: 0 } },
    hasilPoe: { e: { tebakan: 4, alasan: 1, penjelasan: 2 } },
    penjelasan: 'refleksi E1',
  })
  const e1 = localStorage.getItem('metalab-jawaban')
  isiSemua()
  expect(useJawabanE0.getState().selesaikan()).toBe(true)
  useJawabanE0.getState().simpanPenjelasan(' Refleksi E0 ')
  await useJawabanE0.persist.rehydrate()
  expect(lengkap(useJawabanE0.getState().hasil)).toBe(true)
  expect(useJawabanE0.getState().penjelasan).toBe('Refleksi E0')
  expect(localStorage.getItem('metalab-jawaban')).toBe(e1)
  const e0 = localStorage.getItem('metalab-jawaban-e0')
  useJawaban.getState().mulai()
  useJawaban.getState().catat('a', 'baru E1')
  useJawaban.getState().selesaikan()
  expect(localStorage.getItem('metalab-jawaban-e0')).toBe(e0)
})

test('mulai ulang hanya menghapus draf; replay tidak menulis; data rusak tidak lengkap', () => {
  isiSemua()
  useJawabanE0.getState().selesaikan()
  const hasil = useJawabanE0.getState().hasil
  useJawabanE0.getState().mulai()
  expect(useJawabanE0.getState().hasil).toEqual(hasil)
  expect(useJawabanE0.getState().selesaikan()).toBe(false)
  const sebelum = localStorage.getItem('metalab-jawaban-e0')
  kendali.otomatis = true
  isiSemua()
  useJawabanE0.getState().mulai()
  useJawabanE0.getState().selesaikan()
  expect(localStorage.getItem('metalab-jawaban-e0')).toBe(sebelum)
  for (const data of [null, {}, { jawaban: 'rusak', tabel: {} }, { jawaban: {}, tabel: null }])
    expect(lengkap(data)).toBe(false)
})

test('pemilahan menolak pengecoh, sisi salah, jeda, duplikasi dan callback setelah abort', async () => {
  const ctrl = new AbortController()
  const janji = mintaPilah(ctrl.signal, TABEL[2])
  const pilih = usePilah.getState().soal!.pilih
  expect(pilih(2, 0)).toBe(false)
  expect(pilih(0, 1)).toBe(false)
  expect(pilih(-1, 0)).toBe(false)
  usePemutar.setState({ dijeda: true })
  expect(pilih(0, 0)).toBe(false)
  usePemutar.setState({ dijeda: false })
  expect(pilih(0, 0)).toBe(true)
  expect(pilih(0, 0)).toBe(false)
  expect(pilih(1, 1)).toBe(true)
  await janji
  expect(usePilah.getState().soal).toBeNull()
  const batal = mintaPilah(ctrl.signal, TABEL[0])
  const lama = usePilah.getState().soal!.pilih
  const ditolak = expect(batal).rejects.toMatchObject({ name: 'AbortError' })
  ctrl.abort()
  await ditolak
  expect(lama(0, 0)).toBe(false)
  expect(usePilah.getState().soal).toBeNull()
})

test('draf E0 parsial bertahan saat rehydrate tanpa menjadi hasil lengkap', async () => {
  useJawabanE0.getState().catat('1.5a')
  useJawabanE0.getState().catatSel('bahan', 0)
  const draf = useJawabanE0.getState().draf
  await useJawabanE0.persist.rehydrate()
  expect(useJawabanE0.getState().draf).toEqual(draf)
  expect(useJawabanE0.getState().selesaikan()).toBe(false)
})

test('urutan kartu berubah antarvariabel tanpa mengubah pemetaan sisi', async () => {
  const selesai = mintaPilah(new AbortController().signal, TABEL[1])
  const soal = usePilah.getState().soal!
  expect(soal.kartu[0]).toBe('Menghasilkan energi (eksergonik)')
  expect(soal.pilih(0, 0)).toBe(false)
  expect(soal.pilih(0, 1)).toBe(true)
  expect(soal.pilih(1, 0)).toBe(true)
  await selesai
  expect(useJawabanE0.getState().draf.tabel.energi).toEqual({
    0: TABEL[1].sel[0],
    1: TABEL[1].sel[1],
  })
})
