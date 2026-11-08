import { expect, test, type Page } from '@playwright/test'

const HASIL = {
  a: 'Glukosa (6 atom C)',
  b: '2 tahap: investasi energi dan pembentukan energi',
  c: 'Glukosa diberi 2 fosfat lalu terbelah menjadi 2 PGAL; memakai 2 ATP',
  d: 'PGAL dioksidasi menjadi asam piruvat; terbentuk 2 NADH, 4 ATP, 2 H₂O',
  e: '2 ATP bersih (4 terbentuk − 2 dipakai)',
  g: '2 asam piruvat, 2 NADH, 2 ATP (bersih), 2 H₂O',
  h: 'Glikolisis adalah pemecahan satu glukosa (6 C) menjadi 2 asam piruvat (3 C) di sitosol dalam kondisi anaerob (tanpa oksigen), dengan hasil sampingan 2 NADH dan 2 ATP.',
}
const TERSIMPAN = {
  draf: { a: 'draf lama' },
  drafPoe: {},
  hasil: HASIL,
  hasilPoe: {
    c: { tebakan: 3, alasan: 2, penjelasan: 0 },
    e: { tebakan: 2, alasan: 1, penjelasan: 1 },
  },
  penjelasan: '',
}

const jawaban = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('metalab-jawaban')!).state)

// Diisi sekali saja, agar isi yang disimpan halaman tetap ada setelah reload
async function siapkan(page: Page, isi: object | null = TERSIMPAN) {
  await page.addInitScript((isi) => {
    if (sessionStorage.getItem('disiapkan')) return
    sessionStorage.setItem('disiapkan', '1')
    localStorage.setItem(
      'metalab-pengaturan',
      JSON.stringify({ state: { suaraAktif: false }, version: 0 }),
    )
    if (isi) localStorage.setItem('metalab-jawaban', JSON.stringify({ state: isi, version: 0 }))
  }, isi)
}

test('Lembar Hasil tampil dari hasil tersimpan, juga setelah reload', async ({ page }) => {
  await siapkan(page)
  await page.goto('/#/episode/1/hasil')
  for (let i = 0; i < 2; i++) {
    await expect(page.getByRole('heading', { name: 'Bagan glikolisismu' })).toBeVisible()
    await expect(page.locator('[data-pin]')).toHaveCount(7)
    // Tebakan asli c (3, belum tepat) dan e (2, sama dengan yang terjadi)
    await expect(page.locator('[data-poe="c"] .guess s')).toHaveText('3')
    await expect(page.locator('[data-poe="c"] .real')).toContainText('2')
    await expect(page.locator('[data-poe="c"] .why')).toContainText(
      'Satu ATP sudah cukup untuk memecah glukosa.',
    )
    await expect(page.locator('[data-poe="e"] .guess.same')).toContainText('2')
    await expect(page.locator('[data-poe="e"] .real')).toHaveCount(0)
    await page.reload()
  }
  await expect(page.locator('svg [data-molecule="glukosa"]')).toHaveAttribute('data-karbon', '6')
  await expect(page.locator('svg [data-molecule="pgal"]')).toHaveCount(2)
  await expect(page.locator('svg [data-molecule="piruvat"]')).toHaveCount(2)
})

test('penjelasan tersimpan setelah reload', async ({ page }) => {
  await siapkan(page)
  await page.goto('/#/episode/1/hasil')
  const kolom = page.getByLabel('Kenapa glikolisis menghasilkan 2 ATP bersih, bukan 4?', {
    exact: false,
  })
  await page.getByRole('button', { name: 'Simpan penjelasan' }).click()
  await expect(page.getByText('Tulis penjelasanmu dulu.')).toBeVisible()
  await kolom.fill('Dua ATP sudah dipakai di fase investasi.')
  await page.getByRole('button', { name: 'Simpan penjelasan' }).click()
  await expect(page.getByText('Penjelasan tersimpan.')).toBeVisible()
  await page.reload()
  await expect(kolom).toHaveValue('Dua ATP sudah dipakai di fase investasi.')
})

test('tanpa hasil tersimpan diarahkan ke awal episode', async ({ page }) => {
  await siapkan(page, null)
  await page.goto('/#/episode/1/hasil')
  await page.waitForURL(/#\/episode\/1$/)
  await expect(page.getByRole('button', { name: 'Mulai episode' })).toBeVisible()
})

test('cetak untuk guru: lembar cetak berisi nama, jawaban, catatan POE, penjelasan', async ({
  page,
}) => {
  await siapkan(page)
  await page.addInitScript(() => {
    window.print = () => {}
  })
  await page.goto('/#/episode/1/hasil')
  await page.getByRole('button', { name: 'Ubah identitas' }).click()
  await page.getByLabel('Nama', { exact: true }).fill('Siswa Uji')
  await page.getByLabel('Kelas', { exact: true }).fill('XII IPA 1')
  await page.getByRole('button', { name: 'Simpan identitas' }).click()
  await page
    .getByLabel('Kenapa glikolisis menghasilkan 2 ATP bersih, bukan 4?', { exact: false })
    .fill('Dua ATP dipakai di awal.\nEmpat ATP terbentuk kemudian.')
  await page.getByRole('button', { name: 'Cetak untuk guru' }).click()
  await page.emulateMedia({ media: 'print' })
  const cetak = page.locator('.hasil-cetak')
  await expect(cetak).toBeVisible()
  await expect(cetak).toContainText('Siswa Uji')
  await expect(cetak).toContainText('XII IPA 1')
  await expect(cetak).toContainText('Lembar Hasil Aktivitas 1.7 (Glikolisis)')
  await expect(cetak).not.toContainText('Episode 1')
  await expect(cetak.locator('.hasil-cetak-penjelasan')).toHaveText(
    'Dua ATP dipakai di awal.\nEmpat ATP terbentuk kemudian.',
  )
  for (const selector of ['h2', 'h3', 'td', 'th']) {
    await expect(cetak.locator(selector).first()).toHaveCSS('font-family', /Times New Roman/)
  }
  await expect(cetak.locator('h3').first()).toHaveCSS('break-after', 'avoid')
  await expect(cetak).toContainText(HASIL.d)
  await expect(cetak.locator('tr')).toHaveCount(1 + 7 + 1 + 2)
  await expect(page.locator('.hasil')).toBeHidden()
})

test('putar ulang tanpa jeda tidak mengubah hasil tersimpan', async ({ page }, info) => {
  test.skip(info.project.name === 'hp-tegak', 'Episode dimainkan saat HP miring')
  await siapkan(page)
  await page.goto('/#/episode/1/hasil?cepat')
  const sebelum = await jawaban(page)
  await page.getByRole('button', { name: 'Putar ulang tanpa jeda' }).click()
  await page.waitForURL(/#\/episode\/1$/)
  await expect(page.getByRole('button', { name: 'Mulai episode' })).toHaveCount(0)
  await expect(page.locator('[data-molecule="glukosa"]')).toHaveCount(1, { timeout: 15000 })
  await page.waitForURL(/#\/episode\/1\/hasil/, { timeout: 120000 })
  expect(await jawaban(page)).toEqual(sebelum)
  await expect(page.locator('[data-poe="c"] .guess s')).toHaveText('3')
})

test('HP tegak: Lembar Hasil tanpa ajakan putar HP dan tanpa geser mendatar', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'hp-tegak', 'Khusus HP tegak')
  await siapkan(page)
  await page.goto('/#/episode/1/hasil')
  await expect(page.getByRole('heading', { name: 'Bagan glikolisismu' })).toBeVisible()
  await expect(page.getByText('Putar HP-mu')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Simpan penjelasan' })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360)
})

test('identitas dapat dikoreksi dari hasil, tanpa mengubah jawaban tersimpan', async ({ page }) => {
  await siapkan(page)
  await page.goto('/#/episode/1/hasil')
  const sebelum = await jawaban(page)
  await page.getByRole('button', { name: 'Ubah identitas' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Nama', { exact: true }).fill('Siswa Uji')
  await dialog.getByLabel('Kelas', { exact: true }).fill('XII IPA 1')
  await dialog.getByRole('button', { name: 'Simpan identitas' }).click()
  await expect(page.locator('.hasil-identitas')).toContainText('Siswa Uji · XII IPA 1')
  await page.reload()
  await expect(page.locator('.hasil-identitas')).toContainText('Siswa Uji · XII IPA 1')
  expect(await jawaban(page)).toEqual(sebelum)
  await expect(page.locator('.hasil')).not.toContainText('Aktivitas 1.7')
  await expect(page.locator('.hasil-episode')).toHaveText('Episode 1 · Glikolisis')
  const font = await page.locator('.hasil h1').evaluate((el) => getComputedStyle(el).fontFamily)
  for (const selector of ['.hasil h2', '.pair .n', '.hasil textarea', '.dg .pin .besar']) {
    await expect(page.locator(selector).first()).toHaveCSS('font-family', font)
  }
})
