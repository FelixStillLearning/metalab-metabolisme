import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import App from '../../src/app/App'

test('menampilkan judul aplikasi', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: 'MetaLab Metabolisme' })).toBeInTheDocument()
})
