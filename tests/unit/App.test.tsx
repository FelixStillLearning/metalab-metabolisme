import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../../src/app/App'

test('menampilkan judul beranda', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'Jelajahi respirasi aerob' })).toBeInTheDocument()
})
