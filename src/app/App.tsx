import { createHashRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import Episode1Glikolisis from '../episodes/episode-1-glikolisis/Episode1Glikolisis'
import Beranda from '../features/beranda/Beranda'
import PetaMateri from '../features/peta-materi/PetaMateri'

// Mode hash agar setiap rute tetap bisa dibuka langsung di GitHub Pages
const router = createHashRouter([
  { path: '/', element: <Beranda /> },
  { path: '/peta-materi', element: <PetaMateri /> },
  { path: '/episode/1', element: <Episode1Glikolisis /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
