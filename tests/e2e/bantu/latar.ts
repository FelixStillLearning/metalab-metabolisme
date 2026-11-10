import { expect, type Page } from '@playwright/test'

// Latar lebar di belakang panggung sejajar dengan latar adegan dan menutup seluruh layar,
// jadi layar yang lebih lebar atau lebih tinggi dari 16:9 tidak menyisakan bilah polos.
export async function latarMemenuhiLayar(page: Page, nama: string) {
  const lapisan = page.locator('.pemutar-latar')
  await expect(lapisan).toHaveCSS('background-image', new RegExp(`latar-${nama}-lebar`))
  await expect(lapisan).toHaveCSS('opacity', '1')
  const gambar = (await page.locator(`[data-latar="${nama}"] image`).boundingBox())!
  const [lebar, tinggi] = (await lapisan.evaluate((el) => getComputedStyle(el).backgroundSize))
    .split(' ')
    .map(parseFloat)
  const layar = page.viewportSize()!
  expect(Math.abs(lebar - gambar.width)).toBeLessThan(1)
  expect(Math.abs(tinggi - gambar.height)).toBeLessThan(1)
  expect(Math.abs((layar.width - lebar) / 2 - gambar.x)).toBeLessThan(1)
  expect(Math.abs((layar.height - tinggi) / 2 - gambar.y)).toBeLessThan(1)
  expect(gambar.x).toBeLessThanOrEqual(0)
  expect(gambar.y).toBeLessThanOrEqual(0)
  expect(gambar.x + gambar.width).toBeGreaterThanOrEqual(layar.width)
  expect(gambar.y + gambar.height).toBeGreaterThanOrEqual(layar.height)
}
