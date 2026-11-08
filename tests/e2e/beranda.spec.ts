/// <reference lib="dom" />
import { expect, test, type Page } from '@playwright/test'

// Tunggu animasi masuk (yang tidak berulang) selesai, supaya posisi akhir yang diukur
const tungguMasukSelesai = (page: Page) =>
  page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getTiming().iterations === Infinity),
  )

const kotakBertumpuk = (
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) => a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height

test('beranda menampilkan judul, logo, dan gambar sel', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { level: 1, name: 'Jelajahi respirasi aerob' }),
  ).toBeVisible()
  for (const nama of ['MetaLab', /^Sel hewan/]) {
    const gambar = page.getByRole('img', { name: nama })
    await expect(gambar).toBeVisible()
    await expect
      .poll(() => gambar.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0)
  }
})

test('latar lembaran kertas generated dengan teks gelap, partikel, dan glukosa', async ({
  page,
}) => {
  await page.goto('/')
  const latar = await page.locator('main').evaluate((el) => getComputedStyle(el).backgroundImage)
  expect(latar).toMatch(/^url\(.*latar-beranda.*\.webp/)
  // lembaran teal muda: teks harus gelap (ink) agar terbaca
  const judul = page.getByRole('heading', { level: 1 })
  await expect(judul).toHaveCSS('color', 'rgb(13, 37, 38)')
  await expect(judul).toHaveCSS('text-transform', 'uppercase')
  await expect(page.getByText('dari glukosa sampai ATP')).toHaveCSS('color', 'rgb(13, 37, 38)')
  await expect(page.locator('[data-hiasan="partikel"]')).toHaveCount(7)
  const glukosa = page.locator('[data-hiasan="glukosa"]')
  await expect(glukosa).toHaveCount(2)
  for (const g of await glukosa.all()) {
    await expect
      .poll(() => g.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0)
  }
})

test('beranda bergerak, kecuali saat gerak dikurangi', async ({ page }) => {
  await page.goto('/')
  const jumlahAnimasi = () => page.evaluate(() => document.getAnimations().length)
  expect(await jumlahAnimasi()).toBeGreaterThan(7)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(await jumlahAnimasi()).toBe(0)
})

test('maskot ilmuwan menyapa tanpa menutupi judul dan tombol', async ({ page }, info) => {
  await page.goto('/')
  const maskot = page.locator('[data-hiasan="maskot"]')
  if (info.project.name === 'hp-miring') {
    // layar pendek HP miring: maskot disembunyikan supaya isi utama muat
    await expect(maskot).toBeHidden()
    return
  }
  await expect(maskot).toBeVisible()
  await expect
    .poll(() => maskot.evaluate((el: HTMLImageElement) => el.naturalWidth))
    .toBeGreaterThan(0)
  await expect(page.getByText('Halo! Siap menjelajah sel?')).toBeVisible()
  await tungguMasukSelesai(page)
  const kotakMaskot = (await maskot.boundingBox())!
  for (const bagian of [
    page.getByRole('heading', { level: 1 }),
    page.getByRole('button', { name: 'Mulai belajar' }),
  ]) {
    expect(kotakBertumpuk(kotakMaskot, (await bagian.boundingBox())!)).toBe(false)
  }
  if (info.project.name === 'desktop') {
    // maskot besar di kanan bawah, boleh menimpa sel, di kanan kolom teks
    const tombol = (await page.getByRole('button', { name: 'Mulai belajar' }).boundingBox())!
    const sel = (await page.getByRole('img', { name: /^Sel hewan/ }).boundingBox())!
    expect(kotakMaskot.x).toBeGreaterThan(tombol.x + tombol.width)
    expect(kotakMaskot.x + kotakMaskot.width / 2).toBeGreaterThan(sel.x + sel.width / 2)
    expect(kotakMaskot.y + kotakMaskot.height / 2).toBeGreaterThan(sel.y + sel.height / 2)
    expect(kotakMaskot.height).toBeGreaterThanOrEqual(page.viewportSize()!.height / 4)
  }
})

test('efek komik: garis gerak, letupan, dan POP', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-efek="garis-gerak"]')).toHaveCount(1)
  await expect(page.locator('[data-efek="letupan"]')).toHaveCount(1)
  const huruf = page.locator('[data-efek="pop"] [data-huruf]')
  await expect(huruf).toHaveText(['P', 'O', 'P', '!'])
  for (const g of await page.locator('img[data-efek]').all()) {
    await expect
      .poll(() => g.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0)
  }
})

test('efek sekali tampil disembunyikan saat gerak dikurangi', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  for (const efek of ['garis-gerak', 'letupan', 'pop']) {
    for (const el of await page.locator(`[data-efek="${efek}"]`).all()) {
      await expect(el).toHaveCSS('opacity', '0')
    }
  }
})

const suara = (nama: string) => new RegExp(`audio/${nama}\\.(ogg|mp3)$`)

test('gaya beranda tidak memengaruhi elemen di halaman lain', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Mulai belajar' }).click()
  await page.getByLabel('Nama', { exact: true }).fill('Siswa Uji')
  await page.getByLabel('Kelas', { exact: true }).fill('XII 1')
  await page.getByRole('button', { name: 'Lanjut ke peta materi' }).click()
  await expect(page.getByRole('heading', { name: 'Peta materi' })).toBeVisible()
  const gaya = await page.evaluate(() => {
    const wadah = document.createElement('div')
    wadah.innerHTML = `
      <div class="tempel">Teks</div>
      <div class="maskot">Maskot</div>
      <div class="gelembung">Kalimat</div>
      <div class="sel-masuk">Sel</div>
      <div class="glukosa">Glukosa</div>
      <div data-efek="garis-gerak">Garis</div>
      <div data-efek="letupan">Letupan</div>
      <div data-efek="pop">Pop</div>
      <div data-huruf>Huruf</div>`
    document.body.append(wadah)
    return [...wadah.children].map((el) => ({
      animasi: getComputedStyle(el).animationName,
      opasitas: getComputedStyle(el).opacity,
      penunjuk: getComputedStyle(el).pointerEvents,
      ekor: getComputedStyle(el, '::after').content,
    }))
  })
  for (const elemen of gaya) {
    expect(elemen).toEqual({ animasi: 'none', opasitas: '1', penunjuk: 'auto', ekor: 'none' })
  }
})

test('tombol mulai belajar memuat audio', async ({ page }) => {
  await page.goto('/')
  const bunyi = page.waitForResponse(suara('mulai'))
  await page.getByRole('button', { name: 'Mulai belajar' }).click()
  expect((await bunyi).ok()).toBe(true)
})

test('sel diketuk: audio dimuat dan letupan diputar ulang', async ({ page }) => {
  await page.goto('/')
  await tungguMasukSelesai(page)
  const bunyi = page.waitForResponse(suara('mendarat'))
  await page.getByRole('button', { name: 'Letupkan sel' }).click()
  expect((await bunyi).ok()).toBe(true)
  await expect(page.locator('[data-efek="letupan"]')).toHaveCSS('opacity', /^(?!0$)/)
})

test('maskot diketuk: audio dimuat dan gelembung berganti kalimat', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-miring', 'maskot disembunyikan di HP miring')
  await page.goto('/')
  const gelembung = page.locator('[data-hiasan="gelembung"]')
  await expect(gelembung).toHaveText('Halo! Siap menjelajah sel?')
  const bunyi = page.waitForResponse(suara('maskot'))
  await page.getByRole('button', { name: 'Ajak bicara ilmuwan' }).click()
  expect((await bunyi).ok()).toBe(true)
  await expect(gelembung).not.toHaveText('Halo! Siap menjelajah sel?')
})

test('tombol speaker mengingat pilihan bisu dan dapat dinyalakan lagi', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Matikan suara' }).click()
  await expect(page.getByRole('button', { name: 'Nyalakan suara' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Nyalakan suara' })).toBeVisible()
  // menyalakan lagi memutar ulang animasi masuk beserta suaranya
  const melesat = page.waitForResponse(suara('melesat'))
  await page.getByRole('button', { name: 'Nyalakan suara' }).click()
  expect((await melesat).ok()).toBe(true)
})

test('tombol mulai belajar membuka peta materi', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Mulai belajar' }).click()
  await page.getByLabel('Nama', { exact: true }).fill('Siswa Uji')
  await page.getByLabel('Kelas', { exact: true }).fill('XII 1')
  await page.getByRole('button', { name: 'Lanjut ke peta materi' }).click()
  await expect(page).toHaveURL(/#\/peta-materi$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Peta materi' })).toBeVisible()
})

test('tata letak mengikuti orientasi layar', async ({ page }, info) => {
  await page.goto('/')
  await tungguMasukSelesai(page)
  const tombol = (await page.getByRole('button', { name: 'Mulai belajar' }).boundingBox())!
  const sel = (await page.getByRole('img', { name: /^Sel hewan/ }).boundingBox())!
  if (info.project.name === 'hp-tegak') {
    expect(sel.y).toBeGreaterThanOrEqual(tombol.y + tombol.height)
  } else {
    // layar mendatar: sel di kanan teks dan tombol terlihat tanpa menggulir
    expect(sel.x).toBeGreaterThanOrEqual(tombol.x + tombol.width)
    expect(tombol.y + tombol.height).toBeLessThanOrEqual(page.viewportSize()!.height)
    // judul dua baris seperti mockup: "Jelajahi" / "respirasi aerob"
    const baris = await page
      .getByRole('heading', { level: 1 })
      .evaluate((el) => Math.round(el.clientHeight / parseFloat(getComputedStyle(el).lineHeight)))
    expect(baris).toBe(2)
  }
  const melebar = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  expect(melebar).toBe(false)
})

test('tombol mulai belajar memakai gambar tombol utama', async ({ page }) => {
  await page.goto('/')
  const tombol = page.getByRole('button', { name: 'Mulai belajar' })
  await expect(tombol).toHaveCSS('border-image-source', /tombol-utama.*\.webp/)
  const ok = await page.evaluate(async () => {
    const src = getComputedStyle(document.querySelector('.tombol-utama')!).borderImageSource
    return (await fetch(src.slice(5, -2))).ok
  })
  expect(ok).toBe(true)
})

test('gelembung maskot beranda sejajar kepala', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-miring', 'maskot disembunyikan di HP miring')
  await page.goto('/')
  await tungguMasukSelesai(page)
  const maskot = (await page.locator('[data-hiasan="maskot"]').boundingBox())!
  const gelembung = (await page.locator('[data-hiasan="gelembung"]').boundingBox())!
  expect(gelembung.y + gelembung.height / 2).toBeLessThan(maskot.y + maskot.height / 3)
  expect(gelembung.y + gelembung.height / 2).toBeGreaterThan(maskot.y)
})

test('maskot beranda cukup besar', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-miring', 'maskot disembunyikan di HP miring')
  await page.goto('/')
  await tungguMasukSelesai(page)
  const maskot = (await page.locator('[data-hiasan="maskot"]').boundingBox())!
  if (info.project.name === 'desktop') {
    expect(maskot.height).toBeGreaterThanOrEqual(page.viewportSize()!.height * 0.38)
  } else {
    expect(maskot.width).toBeGreaterThanOrEqual(165)
  }
})
