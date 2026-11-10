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
  await expect(daftar.getByRole('link')).toHaveCount(4)
  await expect(daftar.getByText('Belum tersedia', { exact: true })).toHaveCount(0)
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
  await page.getByRole('button', { name: 'Mulai belajar' }).click()
  await page.getByLabel('Nama', { exact: true }).fill('Siswa Uji')
  await page.getByLabel('Kelas', { exact: true }).fill('XII 1')
  await page.getByRole('button', { name: 'Lanjut ke peta materi' }).click()
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
  // Laci melebar dari kartu 2 (lebar sebenarnya, akordeon), episode meluncur keluar satu per satu
  // (HP tegak: laci membuka ke bawah, jadi tingginya yang beranimasi)
  await expect(page.locator('.peta-laci')).toHaveCSS('transition-property', /width|height/)
  await expect(kartu.first()).toHaveCSS('animation-name', 'peta-keluar')
  const jeda = await kartu.evaluateAll((items) =>
    items.map((el) => parseFloat(getComputedStyle(el).animationDelay)),
  )
  expect(jeda.every((n, i) => i === 0 || n > jeda[i - 1])).toBe(true)
  const lapis = await page.evaluate(() =>
    ['.peta-pemicu', '.peta-laci'].map((q) =>
      Number(getComputedStyle(document.querySelector(q)!).zIndex),
    ),
  )
  expect(lapis[0]).toBeGreaterThan(lapis[1])
  // Kartu lain mengecil dengan transisi lebar, bukan melompat, dan isinya tidak memudar
  await expect(page.locator('.peta-samping').first()).toHaveCSS('transition-property', /width/)
  const pudar = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((a) => (a as CSSAnimation).animationName?.startsWith('peta-pudar')).length,
  )
  expect(pudar).toBe(0)
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
  await expect(laci).toHaveAttribute('data-ending-style', '')
  await expect(laci).toHaveCSS('transition-property', /width|height/)
  // Kartu meluncur masuk kembali ke kartu 2, dimulai dari yang terjauh
  const kartu = laci.getByRole('listitem')
  await expect(kartu.first()).toHaveCSS('animation-name', 'peta-masuk')
  const jeda = await kartu.evaluateAll((items) =>
    items.map((el) => parseFloat(getComputedStyle(el).animationDelay)),
  )
  expect(jeda.every((n, i) => i === 0 || n < jeda[i - 1])).toBe(true)
  await expect(laci).toBeHidden()
  // Setelah laci hilang, isi kartu lain tidak memudar ulang (tidak tampak seperti dimuat ulang)
  // dan jalur sudah kembali ke awal tanpa melompat
  const pudar = await page.evaluate(
    () =>
      document
        .getAnimations()
        .filter((a) => (a as CSSAnimation).animationName?.startsWith('peta-pudar')).length,
  )
  expect(pudar).toBe(0)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await page.getByRole('button', { name: 'Tutup episode', exact: true }).click()
  await expect(laci).toBeHidden({ timeout: 100 })
})

test('di layar lebar jalur kartu berada di tengah antara judul dan pita maskot', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'khusus layar lebar')
  for (const [w, h] of [
    [1440, 900],
    [1920, 1080],
  ]) {
    await page.setViewportSize({ width: w, height: h })
    await tungguGerak(page)
    const kepala = (await page.locator('main > header').boundingBox())!
    const jalur = (await page.getByRole('region', { name: 'Jalur materi' }).boundingBox())!
    // Pita bawah (padding-bottom main) disisihkan untuk maskot, jadi tidak dihitung
    const pita = await page
      .locator('main')
      .evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom))
    const atas = jalur.y - (kepala.y + kepala.height)
    const bawah = h - pita - (jalur.y + jalur.height)
    expect(Math.abs(atas - bawah)).toBeLessThan(32)
  }
})

test('kartu 3 dan 4 sebentuk kartu 1 dan 2, warnanya menandai belum tersedia', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak memakai susunan menurun')
  await tungguGerak(page)
  const kartu = (nama: string) =>
    page.getByRole('heading', { name: nama, exact: true }).locator('..')
  const pengantar = (await kartu('Pengantar').boundingBox())!
  for (const nama of ['Respirasi Anaerob', 'Fotosintesis']) {
    const k = (await kartu(nama).boundingBox())!
    expect(Math.abs(k.width - pengantar.width)).toBeLessThan(40)
    expect(Math.abs(k.height - pengantar.height)).toBeLessThan(4)
    await expect(page.getByRole('heading', { name: nama, exact: true })).toHaveCSS(
      'writing-mode',
      'horizontal-tb',
    )
    expect(await kartu(nama).evaluate((el) => getComputedStyle(el).backgroundColor)).not.toBe(
      await kartu('Pengantar').evaluate((el) => getComputedStyle(el).backgroundColor),
    )
  }
})

test('maskot mitokondria di kiri bawah, kalimatnya mengikuti keadaan peta', async ({
  page,
}, info) => {
  const maskot = page.locator('main img[src*="maskot-mitokondria"]')
  if (info.project.name === 'hp-miring') {
    await expect(maskot).toBeHidden()
    return
  }
  await tungguGerak(page)
  await expect(maskot).toBeVisible()
  const gelembung = page.locator('.peta-maskot p')
  const awal = await gelembung.textContent()
  expect(awal).toMatch(/Respirasi Aerob/)
  if (info.project.name === 'desktop') {
    const kotak = (await maskot.boundingBox())!
    const layar = page.viewportSize()!
    expect(kotak.x).toBeLessThan(layar.width * 0.15)
    expect(kotak.x).toBeGreaterThanOrEqual(40) // tidak menempel di pojok
    expect(kotak.y + kotak.height).toBeGreaterThan(layar.height * 0.8)
  }
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await expect(gelembung).toContainText('Glikolisis')
  // Kalimat berganti tanpa gelembung ditempel ulang (tampak seperti dimuat ulang)
  expect(await gelembung.evaluate((el) => el.getAnimations().length)).toBe(0)
  await page.getByRole('button', { name: 'Tutup episode', exact: true }).click()
  await expect(gelembung).toContainText('Respirasi Aerob')
  expect(await gelembung.evaluate((el) => el.getAnimations().length)).toBe(0)
})

test('saat laci dibuka, kartu 1, 3, dan 4 mengecil menjadi lajur; kembali penuh setelah ditutup', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak memakai susunan menurun')
  const nama = ['Pengantar', 'Respirasi Anaerob', 'Fotosintesis']
  const judul = (n: string) => page.getByRole('heading', { name: n, exact: true })
  const lebar = async (n: string) => (await judul(n).locator('..').boundingBox())!.width
  await tungguGerak(page)
  const penuh = await Promise.all(nama.map(lebar))
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await tungguGerak(page)
  for (const [i, n] of nama.entries()) {
    await expect(judul(n)).toHaveCSS('writing-mode', 'vertical-rl')
    expect(await lebar(n)).toBeLessThan(penuh[i] * 0.8)
  }
  await page.getByRole('button', { name: 'Tutup episode', exact: true }).click()
  await expect(page.locator('.peta-laci')).toBeHidden()
  for (const [i, n] of nama.entries()) {
    await expect(judul(n)).toHaveCSS('writing-mode', 'horizontal-tb')
    expect(Math.abs((await lebar(n)) - penuh[i])).toBeLessThan(2)
  }
})

test('saat tertutup keempat kartu sama lebar dan berada di tengah layar lebar', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak memakai susunan menurun')
  if (info.project.name === 'desktop') await page.setViewportSize({ width: 1920, height: 1080 })
  await tungguGerak(page)
  const kartu = (nama: string) =>
    page.getByRole('heading', { name: nama, exact: true }).locator('..').boundingBox()
  const aerob = (await page
    .getByRole('button', { name: 'Respirasi Aerob', exact: true })
    .boundingBox())!
  const pertama = (await kartu('Pengantar'))!
  const terakhir = (await kartu('Fotosintesis'))!
  expect(Math.abs(aerob.width - pertama.width)).toBeLessThan(2)
  if (info.project.name === 'desktop') {
    const kanan = 1920 - (terakhir.x + terakhir.width)
    expect(Math.abs(pertama.x - kanan)).toBeLessThan(8)
  }
})

test('akordeon: kartu samping melebar bersamaan dengan laci menyusut, bukan sesudahnya', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak memakai susunan menurun')
  const laci = page.locator('.peta-laci')
  const pengantar = page.getByRole('heading', { name: 'Pengantar', exact: true }).locator('..')
  await tungguGerak(page)
  const penuh = (await pengantar.boundingBox())!.width
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await tungguGerak(page)
  const lajur = (await pengantar.boundingBox())!.width
  const lebarLaci = (await laci.boundingBox())!.width
  await page.getByRole('button', { name: 'Tutup episode', exact: true }).click()
  // Di tengah penutupan: laci masih terlihat tapi sudah menyempit, kartu samping sudah melebar
  await page.waitForTimeout(240)
  expect(await laci.isVisible()).toBe(true)
  expect((await laci.boundingBox())!.width).toBeLessThan(lebarLaci * 0.9)
  const tengah = (await pengantar.boundingBox())!.width
  expect(tengah).toBeGreaterThan(lajur + 10)
  expect(tengah).toBeLessThan(penuh - 10)
  await expect(laci).toBeHidden()
  await tungguGerak(page)
  expect(Math.abs((await pengantar.boundingBox())!.width - penuh)).toBeLessThan(2)
})

test('kartu episode setinggi laci, sampai ke bawah', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak: kartu setinggi isinya')
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await tungguGerak(page)
  const laci = (await page.locator('.peta-laci').boundingBox())!
  const kartu = (await page
    .getByRole('list', { name: 'Episode respirasi aerob' })
    .getByRole('listitem')
    .first()
    .boundingBox())!
  // Di bawah kartu hanya tersisa baris ringkasan alur dan jarak tepi laci
  expect(laci.y + laci.height - (kartu.y + kartu.height)).toBeLessThan(90)
})

test('saat menutup, teks kartu samping tetap tegak sampai kartu penuh, lalu langsung mendatar', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak memakai susunan menurun')
  const judul = page.getByRole('heading', { name: 'Pengantar', exact: true })
  await page.getByRole('button', { name: 'Respirasi Aerob', exact: true }).click()
  await tungguGerak(page)
  await page.getByRole('button', { name: 'Tutup episode', exact: true }).click()
  // Di tengah penutupan kartu masih sempit: teks belum boleh mendatar (terlipat)
  await page.waitForTimeout(150)
  await expect(page.locator('.peta-laci')).toBeVisible()
  await expect(judul).toHaveCSS('writing-mode', 'vertical-rl')
  await expect(page.locator('.peta-laci')).toBeHidden()
  await expect(judul).toHaveCSS('writing-mode', 'horizontal-tb')
})

test('maskot peta cukup besar dan gelembungnya sejajar kepala', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-miring', 'maskot disembunyikan di HP miring')
  await tungguGerak(page)
  const maskot = (await page.locator('.peta-maskot img').boundingBox())!
  const gelembung = (await page.locator('.peta-maskot p').boundingBox())!
  if (info.project.name === 'desktop') expect(maskot.height).toBeGreaterThanOrEqual(150)
  // Tengah gelembung di sepertiga atas maskot (setinggi kepala)
  expect(gelembung.y + gelembung.height / 2).toBeLessThan(maskot.y + maskot.height / 3)
  expect(gelembung.y + gelembung.height / 2).toBeGreaterThan(maskot.y)
})

test('HP miring: kartu utama memakai ikon kecil dan tetap muat setinggi layar', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'hp-miring', 'khusus HP miring')
  await tungguGerak(page)
  for (const nama of ['Pengantar', 'Respirasi Aerob', 'Respirasi Anaerob', 'Fotosintesis']) {
    // Kartu Respirasi Aerob adalah tombolnya; kartu lain adalah induk judulnya
    const kartu =
      nama === 'Respirasi Aerob'
        ? page.getByRole('button', { name: nama, exact: true })
        : page.getByRole('heading', { name: nama, exact: true }).locator('..')
    const ikon = kartu.locator('img')
    await expect(ikon).toBeVisible()
    expect((await ikon.boundingBox())!.height).toBeLessThanOrEqual(48)
    expect(await kartu.evaluate((el) => el.scrollHeight <= el.clientHeight + 1)).toBe(true)
  }
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true)
})

test('membuka kartu 2 tetap menampilkan kartu 1 di kiri pada kedua mode gerak', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'hp-tegak', 'HP tegak memakai susunan menurun')
  const pengantar = page.getByRole('heading', { name: 'Pengantar', exact: true }).locator('..')
  const aerob = page.getByRole('button', { name: 'Respirasi Aerob', exact: true })
  const jalur = page.getByRole('region', { name: 'Jalur materi' })
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion })
    await page.reload()
    await tungguGerak(page)
    await aerob.click()
    // Termasuk gulir otomatis yang dijadwalkan sesudah akordeon selesai.
    await page.waitForTimeout(1100)
    const pertama = (await pengantar.boundingBox())!
    const kedua = (await aerob.boundingBox())!
    expect(pertama.x).toBeGreaterThanOrEqual(0)
    expect(pertama.x + pertama.width).toBeLessThanOrEqual(kedua.x)
    await expect(jalur).toHaveJSProperty('scrollLeft', 0)
    await expect(page.getByRole('link', { name: 'Buka Glikolisis' })).toBeInViewport()
    // Sesudah pengguna menggeser ke episode akhir, menutup lalu membuka tetap kembali ke awal.
    await jalur.evaluate((el) => {
      el.scrollLeft = el.scrollWidth
    })
    await expect.poll(() => jalur.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
    await page.getByRole('button', { name: 'Tutup episode', exact: true }).click()
    await expect(page.locator('.peta-laci')).toBeHidden()
    await aerob.click()
    await page.waitForTimeout(1100)
    expect((await pengantar.boundingBox())!.x).toBeGreaterThanOrEqual(0)
  }
})
