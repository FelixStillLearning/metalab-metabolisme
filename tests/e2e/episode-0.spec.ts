import { expect, test, type Page } from '@playwright/test'
import { SOAL, TABEL } from '../../src/episodes/episode-0-pengantar/isi.js'

const HASIL = {
  jawaban: Object.fromEntries(SOAL.map((s) => [s.k, s.jawaban])),
  tabel: Object.fromEntries(TABEL.map((r) => [r.k, { 0: r.sel[0], 1: r.sel[1] }])),
}
const E1 = {
  draf: { a: 'draf E1' },
  hasil: { a: 'Glukosa' },
  drafPoe: { c: { tebakan: 3, alasan: 0 } },
  hasilPoe: { e: { tebakan: 4, alasan: 1 } },
  penjelasan: 'Penjelasan E1 tetap.',
}
async function siapkan(page: Page, hasil = false) {
  await page.addInitScript(
    ({ hasil, data, e1 }) => {
      if (sessionStorage.getItem('e0-disiapkan')) return
      sessionStorage.setItem('e0-disiapkan', '1')
      localStorage.setItem(
        'metalab-pengaturan',
        JSON.stringify({ state: { suaraAktif: false }, version: 0 }),
      )
      localStorage.setItem('metalab-jawaban', JSON.stringify({ state: e1, version: 0 }))
      localStorage.setItem(
        'metalab-siswa',
        JSON.stringify({ state: { nama: 'Siswa Penguji', kelas: 'XII IPA 1' }, version: 0 }),
      )
      if (hasil)
        localStorage.setItem(
          'metalab-jawaban-e0',
          JSON.stringify({
            state: { draf: { jawaban: {}, tabel: {} }, hasil: data, penjelasan: '' },
            version: 0,
          }),
        )
    },
    { hasil, data: HASIL, e1: E1 },
  )
}

async function selesaikan15(page: Page, keyboard = false) {
  for (const s of SOAL) {
    const kartu = page.getByRole('region', {
      name: `${s.k.replace('1.5', '1.5 ')} · ${s.judul}`,
      exact: true,
    })
    const pilihan = kartu.getByRole('button', { name: s.opsi[s.benar], exact: true })
    await expect(pilihan).toBeVisible({ timeout: 20000 })
    if (s.k === '1.5a' || s.k === '1.5d') {
      await expect(page.locator('.e0-molekul clipPath rect')).toHaveCount(4)
      const kiri = (await page.locator('.e0-zat-sisi').first().boundingBox())!
      const kanan = (await page.locator('.e0-zat-sisi').last().boundingBox())!
      const panah = (await page.locator('.e0-panah-model').boundingBox())!
      expect(panah.x).toBeGreaterThanOrEqual(kiri.x + kiri.width)
      expect(panah.x + panah.width).toBeLessThanOrEqual(kanan.x)
      const rumusKiri = (await page.locator('.e0-persamaan > span').first().boundingBox())!
      const rumusKanan = (await page.locator('.e0-persamaan > span').last().boundingBox())!
      expect(rumusKanan.x - rumusKiri.x - rumusKiri.width).toBeLessThan(100)
    }
    if (s.k === '1.5a' || s.k === '1.5f')
      await page.screenshot({ path: test.info().outputPath(`${s.k}.png`) })
    if (keyboard) {
      await pilihan.focus()
      await page.keyboard.press('Enter')
    } else await pilihan.click()
    const jawab = kartu.getByRole('button', { name: 'Jawab', exact: true })
    if (keyboard) {
      await jawab.focus()
      await page.keyboard.press('Enter')
    } else await jawab.click()
  }
}

async function selesaikan16(page: Page, keyboard = false) {
  for (const r of TABEL) {
    await expect(page.locator('.e0-pilah-kepala p')).toContainText(r.judul, { timeout: 15000 })
    await expect(page.locator('.e0-pilih-kartu')).toBeVisible()
    expect(await page.locator('[data-rangka="anabolisme"] [data-carbon]').count()).toBe(6)
    expect(await page.locator('[data-rangka="katabolisme"] [data-carbon]').count()).toBe(6)
    for (const sisi of [0, 1]) {
      const kartu = page.getByRole('button', { name: `Pilih kartu: ${r.sel[sisi]}`, exact: true })
      if (keyboard) {
        await kartu.focus()
        await page.keyboard.press('Enter')
      } else await kartu.click()
      const tombol = page.getByRole('button', {
        name: `Taruh di ${sisi === 0 ? 'Anabolisme' : 'Katabolisme'}: ${r.sel[sisi]}`,
      })
      if (r.k === 'tempat' && sisi === 0)
        await page.screenshot({ path: test.info().outputPath('1.6-tempat.png') })
      const box = (await tombol.boundingBox())!
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
      if (keyboard) {
        await tombol.focus()
        await page.keyboard.press('Enter')
      } else await tombol.click()
    }
  }
}

test('Episode 0 lengkap, hasil dan replay menjaga data E1', async ({ page }, info) => {
  test.setTimeout(90000)
  test.skip(info.project.name === 'hp-tegak', 'Episode dimainkan miring')
  await siapkan(page)
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/#/episode/0?cepat')
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  await selesaikan15(page, info.project.name === 'desktop')
  await selesaikan16(page, info.project.name === 'desktop')
  await page.waitForURL(/#\/episode\/0\/hasil/, { timeout: 20000 })
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban')!).state),
  ).toEqual(E1)
  const data = await page.evaluate(
    () => JSON.parse(localStorage.getItem('metalab-jawaban-e0')!).state,
  )
  expect(data.hasil).toEqual(HASIL)
  await page
    .getByLabel('Apa hubungan bahan dan hasil', { exact: false })
    .fill('Hasil fotosintesis menjadi bahan respirasi aerob.')
  await page.getByRole('button', { name: 'Simpan penjelasan' }).click()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Bagan metabolismemu' })).toBeVisible()
  await expect(page.getByLabel('Apa hubungan bahan dan hasil', { exact: false })).toHaveValue(
    'Hasil fotosintesis menjadi bahan respirasi aerob.',
  )
  await page.screenshot({ path: info.outputPath('hasil.png'), fullPage: true })
  const sebelum = await page.evaluate(() => localStorage.getItem('metalab-jawaban-e0'))
  await page.goto('/#/episode/0/hasil?cepat')
  await page.getByRole('button', { name: 'Putar ulang tanpa jeda' }).click()
  await page.waitForURL(/#\/episode\/0$/)
  await page.waitForURL(/#\/episode\/0\/hasil/, { timeout: 60000 })
  expect(await page.evaluate(() => localStorage.getItem('metalab-jawaban-e0'))).toBe(sebelum)
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban')!).state),
  ).toEqual(E1)
  expect(errors).toEqual([])
})

test('hasil E0 terbaca, tanpa POE, tabel cetak lengkap, lanjut ke E1 tanpa menghapus draf', async ({
  page,
}, info) => {
  await siapkan(page, true)
  await page.goto('/#/episode/0/hasil')
  await expect(page.locator('.hasil-episode')).toHaveText('Episode 0 · Pengantar metabolisme')
  await expect(page.getByRole('heading', { name: /POE|Tebakanmu/ })).toHaveCount(0)
  await expect(page.locator('.hasil .e0-tabel-hasil tbody tr')).toHaveCount(5)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  )
  await page.screenshot({ path: info.outputPath('hasil.png'), fullPage: true })
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('.hasil-cetak')).toBeVisible()
  await expect(page.locator('.hasil-cetak .e0-tabel-hasil')).toContainText(
    'Memerlukan oksigen (pada respirasi aerob)',
  )
  await expect(page.locator('.hasil-cetak')).toContainText('Siswa Penguji')
  await expect(page.locator('.hasil-cetak > table tbody tr')).toHaveCount(11)
  if (info.project.name === 'desktop')
    await page.pdf({ path: info.outputPath('hasil-a4.pdf'), format: 'A4', printBackground: true })
  await page.emulateMedia({ media: 'screen' })
  await page.getByRole('link', { name: 'Lanjut', exact: true }).click()
  await expect(page).toHaveURL(/#\/episode\/1$/)
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban')!).state),
  ).toEqual(E1)
})

test('hasil tanpa data kembali ke sampul dan Pengantar bisa dibuka dari peta', async ({ page }) => {
  await siapkan(page)
  await page.goto('/#/episode/0/hasil')
  await expect(page).toHaveURL(/#\/episode\/0$/)
  await page.goto('/#/peta-materi')
  await page.getByRole('link', { name: 'Buka Pengantar' }).click()
  await expect(page).toHaveURL(/#\/episode\/0$/)
})

test('HP 667×375: atom bebas overlap, drag luar zona, jeda dan tombol keyboard', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'Ukuran khusus HP sempit')
  test.setTimeout(60000)
  await page.setViewportSize({ width: 667, height: 375 })
  await siapkan(page)
  await page.goto('/#/episode/0?cepat')
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  await selesaikan15(page)
  await expect(page.locator('.e0-kartu-ciri')).toBeVisible({ timeout: 20000 })
  await page.screenshot({ path: info.outputPath('1.6-sempit.png') })
  const atom = page.locator('[data-rangka="anabolisme"] [data-carbon]')
  const boxes = await atom.evaluateAll((nodes) =>
    nodes.map((n) => {
      const r = n.getBoundingClientRect()
      return { x: r.x, y: r.y, w: r.width, h: r.height }
    }),
  )
  expect(boxes).toHaveLength(6)
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i],
        b = boxes[j]
      const distance = Math.hypot(a.x + a.w / 2 - b.x - b.w / 2, a.y + a.h / 2 - b.y - b.h / 2)
      expect(distance).toBeGreaterThanOrEqual((Math.min(a.w, a.h) + Math.min(b.w, b.h)) / 2 - 1)
    }
  const kartu = page.locator('.e0-kartu-ciri p')
  const awal = (await kartu.boundingBox())!
  await page.mouse.move(awal.x + awal.width / 2, awal.y + awal.height / 2)
  await page.mouse.down()
  await page.mouse.move(660, 365, { steps: 6 })
  await page.mouse.up()
  await expect(
    page.getByRole('button', { name: 'Pilih kartu: Senyawa sederhana (CO₂, H₂O)', exact: true }),
  ).toBeVisible()
  const tempat = (await page.locator('[data-sisi="0"]').boundingBox())!
  await page.mouse.move(awal.x + awal.width / 2, awal.y + awal.height / 2)
  await page.mouse.down()
  await page.mouse.move(tempat.x + tempat.width / 2, tempat.y + tempat.height / 2, { steps: 8 })
  await page.mouse.up()
  await expect(
    page.getByRole('button', { name: 'Pilih kartu: Senyawa sederhana (CO₂, H₂O)', exact: true }),
  ).toHaveCount(0)
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  const tombol = page.getByRole('button', { name: 'Taruh di Katabolisme:', exact: false })
  await expect(tombol).toBeDisabled()
  await page.getByRole('button', { name: 'Lanjut (spasi)' }).click()
  await tombol.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.e0-pilah-kepala p')).toContainText('Energi')
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click()
  await page.evaluate(() => {
    location.hash = '/peta-materi'
  })
  await expect(page).toHaveURL(/#\/peta-materi$/)
  await page
    .getByRole('link', { name: 'Buka Glikolisis' })
    .count()
    .then(async (n) => {
      if (!n) await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
    })
  await page.getByRole('link', { name: 'Buka Glikolisis' }).click()
  await expect(page.locator('[data-petunjuk]')).toHaveCount(0)
})

test('sampul memakai ilustrasi tajam dan dekorasi utuh di dalam panggung', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak menampilkan ajakan putar')
  await siapkan(page)
  await page.goto('/#/episode/0')
  const gambar = page.locator('.pemutar-sampul-gambar img')
  await expect(gambar).toBeVisible()
  await expect
    .poll(() => gambar.evaluate((n) => (n as HTMLImageElement).naturalWidth))
    .toBeGreaterThanOrEqual(1200)
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)))
  if (info.project.name === 'desktop') {
    const panggung = (await page.locator('[data-panggung]').boundingBox())!
    const dekorasi = (await page.locator('.pemutar-sampul-dekorasi-kanan').boundingBox())!
    for (const selector of ['.pemutar-sampul-isi', '.pemutar-sampul-gambar']) {
      const r = (await page.locator(selector).boundingBox())!
      expect(Math.abs(r.y + r.height / 2 - panggung.y - panggung.height / 2)).toBeLessThan(2)
    }
    expect(dekorasi.x).toBeGreaterThanOrEqual(panggung.x)
    expect(dekorasi.y).toBeGreaterThanOrEqual(panggung.y)
    expect(dekorasi.x + dekorasi.width).toBeLessThanOrEqual(panggung.x + panggung.width)
    expect(dekorasi.y + dekorasi.height).toBeLessThanOrEqual(panggung.y + panggung.height)
  }
  await page.screenshot({ path: info.outputPath('sampul-tajam.png') })
})

test('jawaban mengisi kotak saat narasi pertanyaan masih berjalan dan petunjuk di bawah kontrol', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'Narasi terkendali pada desktop')
  await siapkan(page)
  await page.addInitScript((tanya) => {
    localStorage.setItem(
      'metalab-pengaturan',
      JSON.stringify({
        state: { suaraAktif: true, narasi: true, efek: false, musik: false },
        version: 0,
      }),
    )
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: class {
        text: string
        constructor(teks: string) {
          this.text = teks
        }
      },
    })
    Object.defineProperty(speechSynthesis, 'getVoices', {
      value: () => [{ lang: 'id-ID', name: 'Suara uji' }],
    })
    Object.defineProperty(speechSynthesis, 'speak', {
      value: (u: SpeechSynthesisUtterance) => {
        if (u.text === tanya)
          (window as unknown as { pertanyaanAktif: boolean }).pertanyaanAktif = true
        else queueMicrotask(() => u.onend?.(new Event('end') as SpeechSynthesisEvent))
      },
    })
  }, SOAL[0].tanya)
  await page.goto('/#/episode/0?cepat')
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  const pilihan = page.getByRole('button', { name: SOAL[0].opsi[0], exact: true })
  await expect(pilihan).toBeVisible({ timeout: 15000 })
  await expect(page.locator('[data-isian="nama"]')).toHaveAttribute('data-aktif', 'true')
  const panduan = (await page.locator('.pemutar-panduan').boundingBox())!
  const bilah = (await page.locator('.pemutar-bilah').boundingBox())!
  expect(panduan.y).toBeGreaterThanOrEqual(bilah.y + bilah.height)
  expect(Math.abs(panduan.x - bilah.x)).toBeLessThan(8)

  const posisiAwal = (await page.locator('.e0-reaksi').boundingBox())!.y
  await pilihan.click()
  await expect(page.locator('[data-isian="nama"]')).not.toHaveAttribute('data-terisi', 'true')
  await page.getByRole('button', { name: 'Jawab', exact: true }).click()
  await expect(page.locator('[data-isian="nama"]')).toHaveAttribute('data-terisi', 'true')
  await expect
    .poll(async () => (await page.locator('.e0-reaksi').boundingBox())!.y)
    .toBeGreaterThan(posisiAwal + 25)
  await page.screenshot({ path: info.outputPath('isian-terisi-di-tengah.png') })
  expect(
    await page.evaluate(() => (window as unknown as { pertanyaanAktif: boolean }).pertanyaanAktif),
  ).toBe(true)
  await page.goto('/#/peta-materi')
})
