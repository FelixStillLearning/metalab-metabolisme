/// <reference lib="dom" />
import { expect, test, type Page } from '@playwright/test'

const tungguGerak = (page: Page) =>
  page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'))

test.beforeEach(async ({ page }) => {
  await page.goto('/#/peta-materi')
})

test('awal hanya empat bagian utama, tanpa nomor aktivitas atau progres', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Peta materi' })).toBeVisible()
  for (const nama of ['Pengantar', 'Respirasi Aerob', 'Respirasi Anaerob', 'Fotosintesis']) {
    await expect(page.getByRole('heading', { level: 2, name: nama, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('button', { name: 'Respirasi Aerob', exact: true })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  await expect(page.getByRole('list', { name: 'Episode respirasi aerob' })).toBeHidden()
  await expect(page.getByText(/Aktivitas|Selesai|Sedang dijelajahi|Terkunci/)).toHaveCount(0)
  await expect(page.getByRole('progressbar')).toHaveCount(0)
})

test('empat episode baru muncul setelah kartu aerob dibuka, bisa ditutup dengan keyboard', async ({
  page,
}) => {
  const tombol = page.getByRole('button', { name: 'Respirasi Aerob', exact: true })
  const daftar = page.getByRole('list', { name: 'Episode respirasi aerob' })
  await tombol.focus()
  await page.keyboard.press('Enter')
  await expect(tombol).toHaveAttribute('aria-expanded', 'true')
  await expect(daftar.getByRole('listitem')).toHaveCount(4)
  for (const nama of [
    'Glikolisis',
    'Dekarboksilasi oksidatif',
    'Siklus Krebs',
    'Transpor elektron',
  ]) {
    await expect(daftar.getByRole('heading', { name: nama, exact: true })).toBeVisible()
  }
  await expect(daftar.getByRole('link')).toHaveCount(1)
  await expect(daftar.getByText('Belum tersedia', { exact: true })).toHaveCount(3)
  await expect(page.getByText(/Aktivitas/)).toHaveCount(0)
  await page.getByRole('button', { name: 'Tutup episode', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(daftar).toBeHidden()
  await expect(tombol).toHaveAttribute('aria-expanded', 'false')
  await expect(tombol).toBeFocused()
})

test('navigasi beranda, peta, dan episode 1 tersambung dua arah', async ({ page }) => {
  await page.getByRole('link', { name: 'Beranda', exact: true }).click()
  await expect(page).toHaveURL(/#\/$/)
  await page.getByRole('link', { name: 'Mulai belajar' }).click()
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await page.getByRole('link', { name: 'Buka Glikolisis' }).click()
  await expect(page).toHaveURL(/#\/episode\/1$/)
  await page.getByRole('link', { name: 'Peta materi', exact: true }).click()
  await expect(page).toHaveURL(/#\/peta-materi$/)
  await expect(page.getByRole('list', { name: 'Episode respirasi aerob' })).toBeHidden()
})

test('kartu besar dapat digeser horizontal tanpa membuat halaman melebar', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak memakai susunan menurun')
  await tungguGerak(page)
  const jalur = page.getByRole('region', { name: 'Jalur materi' })
  const pertama = (await page
    .getByRole('heading', { name: 'Pengantar', exact: true })
    .locator('..')
    .boundingBox())!
  const miring = info.project.name === 'hp-miring'
  // HP miring: kartu persegi panjang tegak supaya jalur tidak terlalu jauh digeser
  if (miring) expect(pertama.width).toBeLessThan(pertama.height * 0.8)
  else expect(pertama.width).toBeGreaterThanOrEqual(260)
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await tungguGerak(page)
  const kartu = page.getByRole('list', { name: 'Episode respirasi aerob' }).getByRole('listitem')
  const episode = (await kartu.nth(0).boundingBox())!
  if (miring) expect(episode.width).toBeLessThanOrEqual(180)
  else expect(episode.width).toBeGreaterThanOrEqual(200)
  // Judul (kata terpanjang: Dekarboksilasi) tidak boleh meluber keluar kartu yang lebih sempit
  for (const el of await page.locator('.peta-kartu .peta-nama').all()) {
    expect(await el.evaluate((k) => k.scrollWidth <= k.clientWidth)).toBe(true)
  }
  expect((await kartu.nth(1).boundingBox())!.x).toBeGreaterThan(
    (await kartu.nth(0).boundingBox())!.x,
  )
  expect(await jalur.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
  await jalur.evaluate((el) => {
    el.scrollLeft = el.scrollWidth
  })
  await expect.poll(() => jalur.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  for (const gambar of await page.locator('main img').all()) {
    await expect
      .poll(() => gambar.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0)
  }
})

test('HP tegak: kartu dan episode menurun, tanpa geser ke samping', async ({ page }, info) => {
  test.skip(info.project.name !== 'hp-tegak', 'khusus HP tegak')
  const jalur = page.getByRole('region', { name: 'Jalur materi' })
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await tungguGerak(page)
  const pengantar = (await page
    .getByRole('heading', { name: 'Pengantar', exact: true })
    .locator('..')
    .boundingBox())!
  expect(pengantar.height).toBeLessThan(400)
  const kartu = page.getByRole('list', { name: 'Episode respirasi aerob' }).getByRole('listitem')
  for (let i = 1; i < 4; i++) {
    const atas = (await kartu.nth(i - 1).boundingBox())!
    const bawah = (await kartu.nth(i).boundingBox())!
    expect(bawah.y).toBeGreaterThanOrEqual(atas.y + atas.height)
  }
  expect(await jalur.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('kartu beranimasi saat dibuka dan diam saat gerak dikurangi', async ({ page }) => {
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  const kartu = page.getByRole('list', { name: 'Episode respirasi aerob' }).getByRole('listitem')
  await expect(kartu.first()).toHaveCSS('animation-name', 'peta-tempel')
  const jeda = await kartu.evaluateAll((items) =>
    items.map((el) => parseFloat(getComputedStyle(el).animationDelay)),
  )
  expect(jeda.every((n, i) => i === 0 || n > jeda[i - 1])).toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await expect(kartu.first()).toBeVisible()
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0)
})

test('SFX buka, tutup, dan kembali disiapkan saat halaman dibuka; pilihan bisu diingat', async ({
  page,
}) => {
  const bunyi = (nama: string) => page.waitForResponse(new RegExp(`audio/${nama}\\.(ogg|mp3)$`))
  const disiapkan = ['buka-peta', 'tutup-peta', 'kembali'].map(bunyi)
  await page.reload()
  for (const r of await Promise.all(disiapkan)) expect(r.ok()).toBe(true)
  await page.getByRole('button', { name: 'Matikan suara' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Nyalakan suara' })).toBeVisible()
  await page.getByRole('button', { name: 'Nyalakan suara' }).click()
  const kembali = bunyi('kembali')
  await page.getByRole('link', { name: 'Beranda', exact: true }).click()
  expect((await kembali).ok()).toBe(true)
})

test('kartu lurus dan tanpa filter supaya rapi dan gerak tidak tersendat', async ({ page }) => {
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await tungguGerak(page)
  const gaya = await page.locator('.peta-kertas').evaluateAll((els) =>
    els.map((el) => {
      const s = getComputedStyle(el)
      return { rotate: s.rotate, filter: s.filter, clip: getComputedStyle(el, '::before').clipPath }
    }),
  )
  expect(gaya.length).toBeGreaterThanOrEqual(9)
  for (const g of gaya) expect(g).toEqual({ rotate: 'none', filter: 'none', clip: 'none' })
})

test('kartu memakai ikon bagian dan episode dari daftar aset', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-miring', 'ikon disembunyikan di layar pendek')
  const ikonKartu = (nama: string) =>
    page.getByRole('heading', { name: nama, exact: true }).locator('..').locator('img')
  await expect(ikonKartu('Pengantar')).toHaveAttribute('src', /episode-0/)
  await expect(ikonKartu('Respirasi Anaerob')).toHaveAttribute('src', /bagian-anaerob/)
  await expect(ikonKartu('Fotosintesis')).toHaveAttribute('src', /bagian-fotosintesis/)
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  const kartu = page.getByRole('list', { name: 'Episode respirasi aerob' }).getByRole('listitem')
  for (let i = 0; i < 4; i++) {
    const ikon = kartu.nth(i).locator('img')
    await expect(ikon).toHaveAttribute('src', new RegExp(`episode-${i + 1}`))
    await expect(ikon).toBeVisible()
  }
  for (const gambar of await page.locator('main img').all()) {
    await expect
      .poll(() => gambar.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0)
  }
})

test('tombol buka episode memakai gambar tombol utama', async ({ page }) => {
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await expect(page.getByRole('link', { name: 'Buka Glikolisis' })).toHaveCSS(
    'border-image-source',
    /tombol-utama.*\.webp/,
  )
})

test('laci beranimasi saat ditutup, lalu tersembunyi; tanpa animasi saat gerak dikurangi', async ({
  page,
}) => {
  const laci = page.locator('.peta-laci')
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await tungguGerak(page)
  await page.getByRole('button', { name: 'Tutup episode', exact: true }).click()
  await expect(laci).toHaveCSS('animation-name', 'peta-laci-tutup')
  // Kartu dilepas satu per satu dari yang terakhir, kebalikan urutan saat dibuka
  const kartu = laci.getByRole('listitem')
  await expect(kartu.first()).toHaveCSS('animation-name', 'peta-lepas')
  const jeda = await kartu.evaluateAll((items) =>
    items.map((el) => parseFloat(getComputedStyle(el).animationDelay)),
  )
  expect(jeda.every((n, i) => i === 0 || n < jeda[i - 1])).toBe(true)
  await expect(laci).toBeHidden()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await page.getByRole('button', { name: 'Tutup episode', exact: true }).click()
  await expect(laci).toBeHidden({ timeout: 100 })
})

test('di layar lebar jalur kartu berada di tengah ruang bawah judul', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'khusus layar lebar')
  for (const [w, h] of [
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width: w, height: h })
    await tungguGerak(page)
    const kepala = (await page.locator('main > header').boundingBox())!
    const jalur = (await page.getByRole('region', { name: 'Jalur materi' }).boundingBox())!
    const atas = jalur.y - (kepala.y + kepala.height)
    const bawah = h - (jalur.y + jalur.height)
    expect(Math.abs(atas - bawah)).toBeLessThan(32)
  }
})
