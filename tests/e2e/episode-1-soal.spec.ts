import { expect, test, type Page } from '@playwright/test'

const glukosa = (page: Page) =>
  page.getByRole('button', { name: 'Glukosa (6 atom C)', exact: true })
const draf = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban')!).state.draf)

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name === 'hp-tegak', 'Soal dimainkan saat HP miring')
  await page.addInitScript(() => {
    localStorage.setItem(
      'metalab-pengaturan',
      JSON.stringify({ state: { suaraAktif: false }, version: 0 }),
    )
  })
  await page.goto('/#/episode/1?cepat')
  await page.getByRole('button', { name: 'Mulai episode' }).click()
  await expect(glukosa(page)).toBeVisible({ timeout: 15000 })
})

test('soal a dan b memberi umpan balik dan menyimpan jawaban tanpa skor', async ({ page }) => {
  await expect(page.locator('[data-petunjuk]')).toHaveText('Ketuk bahan awal glikolisis.')
  // Pemberitahuan cukup satu baris
  const baris = await page
    .locator('[data-petunjuk]')
    .evaluate(
      (el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight),
    )
  expect(baris).toBeLessThan(1.5)
  // Sorotan sasaran molekul: garis putus-putus krem yang cukup tebal
  if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
    await glukosa(page).hover()
    await expect(glukosa(page)).toHaveCSS('outline-style', 'dashed')
    await expect(glukosa(page)).toHaveCSS('outline-color', 'rgb(245, 241, 232)')
    expect(
      parseFloat(await glukosa(page).evaluate((el) => getComputedStyle(el).outlineWidth)),
    ).toBeGreaterThanOrEqual(5)
    await page.mouse.move(0, 0)
  }
  await expect(page.locator('.pemutar-gelembung [data-petunjuk]')).toHaveCount(0)
  await expect(page.getByRole('status', { name: 'Petunjuk interaksi' })).toContainText(
    'Ketuk bahan awal',
  )
  await expect(page.locator('.pemutar-panduan')).toHaveCSS('opacity', '1')
  await expect(page.locator('.pemutar-panduan')).toHaveCSS('pointer-events', 'none')
  await expect(page.locator('.pemutar-ajakan')).toHaveCount(0)
  await expect(page.locator('.pemutar-panduan img')).toHaveCount(0)
  await expect(page.locator('.pemutar-panduan-ikon')).toHaveCount(1)
  await expect(page.locator('[data-molecule="glukosa"] [data-carbon]')).toHaveCount(6)
  await expect(page.locator('[data-molecule="piruvat"] [data-carbon]')).toHaveCount(3)
  await expect(page.locator('[data-molecule="o2"]')).toHaveAttribute('data-oksigen', '2')
  // Kotak sorotan tiap sasaran memuat seluruh molekul beserta labelnya
  for (const [nama, molekul] of [
    ['Glukosa (6 atom C)', 'glukosa'],
    ['Asam piruvat (3 atom C)', 'piruvat'],
    ['O₂ (2 atom O)', 'o2'],
  ]) {
    const kotak = (await page.getByRole('button', { name: nama, exact: true }).boundingBox())!
    const isi = (await page.locator(`[data-molecule="${molekul}"]`).boundingBox())!
    expect(isi.x, nama).toBeGreaterThanOrEqual(kotak.x)
    expect(isi.y, nama).toBeGreaterThanOrEqual(kotak.y)
    expect(isi.x + isi.width, nama).toBeLessThanOrEqual(kotak.x + kotak.width)
    expect(isi.y + isi.height, nama).toBeLessThanOrEqual(kotak.y + kotak.height)
  }
  await page.getByRole('button', { name: 'O₂ (2 atom O)', exact: true }).click()
  await expect(page.locator('[data-gelembung]')).toHaveText('Glikolisis berlangsung tanpa oksigen.')
  expect(await draf(page)).toEqual({})
  await page.waitForTimeout(150)
  await glukosa(page).click()
  await expect(
    page.getByRole('heading', { name: 'Ada berapa tahap utama dalam glikolisis?' }),
  ).toBeVisible()
  expect((await draf(page)).a).toBe('Glukosa (6 atom C)')
  await expect(page.locator('[data-petunjuk]')).toHaveText('Pilih salah satu jawaban di kartu.')
  await expect(page.locator('.pemutar-sasaran .pemutar-ajakan')).toHaveCount(0)
  // Panah tahap pertama tidak menempel pada atom C glukosa (celah minimal 15 satuan adegan)
  const skala = (await page.locator('[data-panggung]').boundingBox())!.width / 1600
  const ujungGlukosa = Math.max(
    ...(await Promise.all(
      (await page.locator('[data-molecule="glukosa"] [data-carbon]').all()).map(async (c) => {
        const k = (await c.boundingBox())!
        return k.x + k.width
      }),
    )),
  )
  const panah = (await page.locator('svg path[stroke-dasharray]').first().boundingBox())!
  expect((panah.x - ujungGlukosa) / skala).toBeGreaterThanOrEqual(15)
  const satu = page.getByRole('button', { name: '1 tahap', exact: true })
  await expect(satu).toHaveCSS('font-family', /Atkinson Hyperlegible/)
  if (await page.evaluate(() => matchMedia('(hover: hover)').matches)) {
    await page.getByRole('button', { name: '2 tahap', exact: true }).hover()
    await expect(page.getByRole('button', { name: '2 tahap', exact: true })).toHaveCSS(
      'filter',
      /drop-shadow/,
    )
  }
  await satu.click()
  await expect(satu).toHaveAttribute('aria-pressed', 'true')
  await expect
    .poll(() => satu.evaluate((el) => getComputedStyle(el, '::before').filter))
    .toContain('hue-rotate')
  await expect(satu).toHaveCSS('color', 'rgb(245, 241, 232)')
  await expect
    .poll(() => satu.evaluate((el) => getComputedStyle(el, '::before').borderImageSource))
    .toContain('interaksi-tombol-pilihan')
  await expect(page.locator('[data-gelembung]')).toContainText('dua panah putus-putus')
  expect((await draf(page)).b).toBeUndefined()
  await page.getByRole('button', { name: '2 tahap', exact: true }).click()
  await expect(page.locator('[data-gelembung]')).toContainText('Dua tahap: fase investasi energi')
  await expect(page.locator('svg').getByText('Investasi energi', { exact: true })).toBeVisible()
  await expect(page.locator('svg').getByText('Pembentukan energi', { exact: true })).toBeVisible()
  // Judul tahap tepat di atas panahnya: sela kecil dan sejajar titik tengah panah
  const satuan = (await page.locator('[data-panggung]').boundingBox())!.width / 1600
  const panahTahap = page.locator('svg path[stroke-dasharray]')
  for (const [i, judul] of ['Investasi energi', 'Pembentukan energi'].entries()) {
    const t = (await page.locator('svg').getByText(judul, { exact: true }).boundingBox())!
    const a = (await panahTahap.nth(i).boundingBox())!
    const sela = (a.y - (t.y + t.height)) / satuan
    expect(sela, judul).toBeGreaterThan(10)
    expect(sela, judul).toBeLessThan(60)
    expect(Math.abs(t.x + t.width / 2 - (a.x + a.width / 2)) / satuan, judul).toBeLessThan(10)
  }
  expect((await draf(page)).b).toBe('2 tahap: investasi energi dan pembentukan energi')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Mulai episode' })).toBeVisible()
  expect((await draf(page)).b).toBe('2 tahap: investasi energi dan pembentukan energi')
})

test('pilihan bisa memakai keyboard dan tidak terjawab selama jeda', async ({ page }) => {
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  await expect(glukosa(page)).toBeDisabled()
  expect(await draf(page)).toEqual({})
  await page.getByRole('button', { name: 'Lanjut (spasi)' }).click()
  const piruvat = page.getByRole('button', { name: 'Asam piruvat (3 atom C)', exact: true })
  await piruvat.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-gelembung]')).toContainText('justru hasil di akhir glikolisis')
  await page.waitForTimeout(150)
  await glukosa(page).focus()
  await page.keyboard.press('Space')
  const dua = page.getByRole('button', { name: '2 tahap', exact: true })
  await expect(dua).toBeVisible()
  await dua.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('[data-gelembung]')).toContainText('Dua tahap: fase investasi energi')
  await expect(page.getByRole('button', { name: 'Jeda (spasi)' })).toBeVisible()
})

test('meninggalkan pilihan membatalkan penantian dan membuka ulang dari awal', async ({ page }) => {
  const galat: string[] = []
  page.on('pageerror', (e) => galat.push(e.message))
  await page.goto('/#/peta-materi')
  await expect(page.getByRole('heading', { name: 'Peta materi', exact: true })).toBeVisible()
  await page.goto('/#/episode/1?cepat')
  await expect(page.getByRole('button', { name: 'Mulai episode' })).toBeVisible()
  await expect(glukosa(page)).toHaveCount(0)
  expect(galat).toEqual([])
})

test('popup petunjuk tetap tampil tanpa subtitle dan langsung tampil pada mode tenang', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click()
  const panel = page.getByRole('dialog', { name: 'Pengaturan' })
  await panel.getByRole('switch', { name: 'Subtitle', exact: true }).click()
  await panel.getByRole('switch', { name: 'Mode tenang (animasi dikurangi)', exact: true }).click()
  await panel.getByRole('button', { name: 'Tutup pengaturan' }).click()
  await expect(page.locator('[data-petunjuk]')).toBeVisible()
  await expect(page.locator('[data-gelembung]')).toBeHidden()
  await expect(page.locator('.pemutar-panduan')).toHaveCSS('opacity', '1')
  await expect(page.locator('.pemutar-panduan')).toHaveCSS('transform', 'none')
  await glukosa(page).click()
  await expect(page.locator('[data-petunjuk]')).toHaveText('Pilih salah satu jawaban di kartu.')
})
