import { createHashRouter, Navigate } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import Episode1Glikolisis from '../episodes/episode-1-glikolisis/Episode1Glikolisis'
import HasilEpisode1 from '../episodes/episode-1-glikolisis/HasilEpisode1'
import PenutupEpisode1 from '../episodes/episode-1-glikolisis/PenutupEpisode1'
import Episode0Pengantar from '../episodes/episode-0-pengantar/Episode0Pengantar'
import HasilEpisode0 from '../episodes/episode-0-pengantar/HasilEpisode0'
import Episode2Dekarboksilasi from '../episodes/episode-2-dekarboksilasi/Episode2Dekarboksilasi'
import HasilEpisode2 from '../episodes/episode-2-dekarboksilasi/HasilEpisode2'
import Episode3Krebs from '../episodes/episode-3-krebs/Episode3Krebs'
import HasilEpisode3 from '../episodes/episode-3-krebs/HasilEpisode3'
import Episode4TransporElektron from '../episodes/episode-4-transpor-elektron/Episode4TransporElektron'
import HasilEpisode4 from '../episodes/episode-4-transpor-elektron/HasilEpisode4'
import Beranda from '../features/beranda/Beranda'
import PetaMateri from '../features/peta-materi/PetaMateri'

// Mode hash agar setiap rute tetap bisa dibuka langsung di GitHub Pages
const router = createHashRouter([
  { path: '/', element: <Beranda /> },
  { path: '/peta-materi', element: <PetaMateri /> },
  { path: '/episode/0', element: <Episode0Pengantar /> },
  { path: '/episode/0/hasil', element: <HasilEpisode0 /> },
  { path: '/episode/1', element: <Episode1Glikolisis /> },
  { path: '/episode/1/hasil', element: <HasilEpisode1 /> },
  { path: '/episode/1/penutup', element: <PenutupEpisode1 /> },
  { path: '/episode/2', element: <Episode2Dekarboksilasi /> },
  { path: '/episode/2/hasil', element: <HasilEpisode2 /> },
  { path: '/episode/3', element: <Episode3Krebs /> },
  { path: '/episode/3/hasil', element: <HasilEpisode3 /> },
  { path: '/episode/4', element: <Episode4TransporElektron /> },
  { path: '/episode/4/hasil', element: <HasilEpisode4 /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
