import { Dialog } from '@base-ui/react/dialog'
import { useId, useState, type ReactElement } from 'react'
import { useSiswa } from '../../stores/siswa'
import './identitas-siswa.css'

type Props = { pemicu: ReactElement; setelahSimpan?: () => void }

function IdentitasSiswa({ pemicu, setelahSimpan }: Props) {
  const siswa = useSiswa()
  const [buka, setBuka] = useState(false)
  const [nama, setNama] = useState(siswa.nama)
  const [kelas, setKelas] = useState(siswa.kelas)
  const id = useId()

  return (
    <Dialog.Root
      open={buka}
      onOpenChange={(buka) => {
        if (buka) {
          setNama(siswa.nama)
          setKelas(siswa.kelas)
        }
        setBuka(buka)
      }}
    >
      <Dialog.Trigger render={pemicu} />
      <Dialog.Portal>
        <Dialog.Backdrop className="siswa-latar" />
        <Dialog.Popup className="siswa-dialog">
          <Dialog.Title>Nama dan kelasmu</Dialog.Title>
          <Dialog.Description>
            Isi untuk dicantumkan di lembar jawaban. Data disimpan di browser ini dan bisa kamu ubah
            nanti.
          </Dialog.Description>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              siswa.simpan(nama, kelas)
              setBuka(false)
              setelahSimpan?.()
            }}
          >
            <label htmlFor={`${id}-nama`}>Nama</label>
            <input
              id={`${id}-nama`}
              name="nama"
              autoComplete="name"
              required
              pattern=".*\S.*"
              title="Isi nama, bukan hanya spasi."
              maxLength={100}
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
            <label htmlFor={`${id}-kelas`}>Kelas</label>
            <input
              id={`${id}-kelas`}
              name="kelas"
              placeholder="Contoh: XII IPA 1"
              required
              pattern=".*\S.*"
              title="Isi kelas, bukan hanya spasi."
              maxLength={40}
              value={kelas}
              onChange={(e) => setKelas(e.target.value)}
            />
            <div className="siswa-aksi">
              <Dialog.Close className="siswa-batal">Batal</Dialog.Close>
              <button type="submit" className="tombol-utama">
                {setelahSimpan ? 'Lanjut ke peta materi' : 'Simpan identitas'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default IdentitasSiswa
