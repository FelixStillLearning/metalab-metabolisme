import { expect, test } from '@playwright/test'

const rute = [
  { hash: '#/', judul: 'Jelajahi respirasi aerob' },
  { hash: '#/peta-materi', judul: 'Peta materi' },
  { hash: '#/episode/1', judul: 'Glikolisis' },
]

for (const { hash, judul } of rute) {
  test(`rute ${hash} membuka halaman ${judul}`, async ({ page }) => {
    await page.goto(`/${hash}`)
    await expect(page.getByRole('heading', { level: 1, name: judul })).toBeVisible()
  })
}

test('rute yang tidak dikenal kembali ke beranda', async ({ page }) => {
  await page.goto('/#/tidak-ada')
  await expect(page).toHaveURL(/#\/$/)
  await expect(
    page.getByRole('heading', { level: 1, name: 'Jelajahi respirasi aerob' }),
  ).toBeVisible()
})
