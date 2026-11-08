import { createHashRouter, Link, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import Episode1Glikolisis from '../episodes/episode-1-glikolisis/Episode1Glikolisis'
import HasilEpisode1 from '../episodes/episode-1-glikolisis/HasilEpisode1'
import Beranda from '../features/beranda/Beranda'
import PetaMateri from '../features/peta-materi/PetaMateri'

// Mode hash agar setiap rute tetap bisa dibuka langsung di GitHub Pages
const router = createHashRouter([
  { path: '/', element: <Beranda /> },
  { path: '/peta-materi', element: <PetaMateri /> },
  { path: '/episode/1', element: <Episode1Glikolisis /> },
  { path: '/episode/1/hasil', element: <HasilEpisode1 /> },
  // Sementara sampai peta penutup dibuat
  {
    path: '/episode/1/penutup',
    element: (
      <main className="grid min-h-dvh place-content-center gap-4 p-8 text-center">
        <h1 className="text-3xl">Peta penutup menyusul</h1>
        <Link to="/peta-materi" className="underline underline-offset-4">
          Kembali ke peta materi
        </Link>
      </main>
    ),
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
