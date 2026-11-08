import { MousePointerClick } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { usePemutar } from '../../stores/pemutar'
import { usePengaturan } from '../../stores/pengaturan'
import { petunjukInteraksi } from './petunjuk'

function PetunjukInteraksi() {
  const state = usePemutar()
  const petunjuk = petunjukInteraksi(state)
  const tenang = usePengaturan((s) => s.tenang)
  const gerakDikurangi = useReducedMotion()
  const diam = tenang ?? gerakDikurangi
  const posisi =
    state.poe?.tahap === 'tebak' ||
    state.lengkapi ||
    (state.pilihan && !state.pilihan.opsi[0]?.posisi)
      ? 'atas'
      : state.poe?.tahap === 'jelaskan'
        ? 'bawah'
        : 'tengah'

  return (
    <div className="pemutar-panduan-wadah" role="status" aria-label="Petunjuk interaksi">
      <AnimatePresence mode="wait">
        {petunjuk && (
          <motion.div
            key={petunjuk}
            className="pemutar-panduan"
            data-posisi={posisi}
            initial={{ opacity: diam ? 1 : 0, x: diam ? 0 : -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: diam ? 0 : -12 }}
            transition={{ duration: diam ? 0 : 0.2, ease: 'easeOut' }}
          >
            <div className="pemutar-panduan-kartu">
              <MousePointerClick className="pemutar-panduan-ikon" aria-hidden="true" />
              <span data-petunjuk>{petunjuk}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PetunjukInteraksi
