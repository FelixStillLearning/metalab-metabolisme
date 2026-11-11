import { Maximize } from 'lucide-react'

function TombolLayarPenuh() {
  return (
    <button
      type="button"
      aria-label="Layar penuh"
      title="Masuk/keluar layar penuh"
      onClick={() => {
        const janji = document.fullscreenElement
          ? document.exitFullscreen()
          : document.documentElement.requestFullscreen?.()
        janji?.catch(() => {})
      }}
      className="grid size-12 shrink-0 place-items-center rounded-full bg-paper text-ink shadow-kertas-sm transition-transform duration-(--durasi-ui) ease-pose hover:-translate-y-0.5 active:translate-y-0.5"
    >
      <Maximize aria-hidden="true" className="size-6" />
    </button>
  )
}

export default TombolLayarPenuh
