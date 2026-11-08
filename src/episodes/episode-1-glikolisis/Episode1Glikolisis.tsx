import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

function Episode1Glikolisis() {
  return (
    <main className="min-h-dvh p-6 sm:p-10">
      <Link
        to="/peta-materi"
        className="mb-8 inline-flex min-h-12 items-center gap-2 rounded-lg bg-paper px-4 py-3 font-head font-extrabold text-ink shadow-kertas-sm hover:bg-paper-2"
      >
        <ArrowLeft aria-hidden="true" className="size-5" />
        Peta materi
      </Link>
      <h1 className="text-balance text-4xl font-extrabold">Glikolisis</h1>
      <p className="mt-4 text-pretty">Materi glikolisis sedang disiapkan.</p>
    </main>
  )
}

export default Episode1Glikolisis
