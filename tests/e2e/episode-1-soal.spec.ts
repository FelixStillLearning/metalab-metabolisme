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
  await expect(page.locator('[data-petunjuk]')).toHaveText(
    'Ketuk molekul yang menjadi bahan awal glikolisis.',
  )
  await expect(glukosa(page).locator('.pemutar-ajakan')).toBeVisible()
  await expect(glukosa(page).locator('.pemutar-ajakan')).toHaveCSS(
    'animation-name',
    'pemutar-ajakan',
  )
  await expect(page.locator('[data-molecule="glukosa"] [data-carbon]')).toHaveCount(6)
  await expect(page.locator('[data-molecule="piruvat"] [data-carbon]')).toHaveCount(3)
  await expect(page.locator('[data-molecule="o2"]')).toHaveAttribute('data-oksigen', '2')
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
  expect((await draf(page)).b).toBe('2 tahap: investasi energi dan pembentukan energi')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Mulai episode' })).toBeVisible()
  expect((await draf(page)).b).toBe('2 tahap: investasi energi dan pembentukan energi')
})

test('pilihan bisa memakai keyboard dan tidak terjawab selama jeda', async ({ page }) => {
  await page.getByRole('button', { name: 'Jeda (spasi)' }).click()
  await expect(glukosa(page)).toBeDisabled()
  await expect(glukosa(page).locator('.pemutar-ajakan')).toHaveCSS('animation-play-state', 'paused')
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

test('petunjuk interaksi tetap tampil tanpa subtitle, penanda diam pada mode tenang', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Pengaturan', exact: true }).click()
  const panel = page.getByRole('dialog', { name: 'Pengaturan' })
  await panel.getByRole('switch', { name: 'Subtitle', exact: true }).click()
  await panel.getByRole('switch', { name: 'Mode tenang (animasi dikurangi)', exact: true }).click()
  await panel.getByRole('button', { name: 'Tutup pengaturan' }).click()
  await expect(page.locator('[data-petunjuk]')).toBeVisible()
  await expect(page.locator('[data-gelembung]')).toBeHidden()
  await expect(glukosa(page).locator('.pemutar-ajakan')).toHaveCSS('animation-name', 'none')
  await glukosa(page).click()
  await expect(page.locator('[data-petunjuk]')).toHaveText('Pilih salah satu jawaban di kartu.')
})
