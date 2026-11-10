# MetaLab Metabolisme

MetaLab adalah media pembelajaran berbasis web untuk materi Metabolisme, Biologi kelas XII. Media ini mengikuti Aktivitas 1.5 sampai 1.11 pada buku Biologi untuk SMA/MA Kelas XII terbitan Kemendikbudristek. Siswa mengerjakan soal buku secara berurutan di dalam episode beranimasi, dan pada beberapa soal memakai metode Predict-Observe-Explain (POE).

Proyek ini dikerjakan dalam kegiatan pengabdian kepada masyarakat Program Studi Informatika, Institut Teknologi Nasional Bandung, bersama mitra SMA Negeri 16 Bandung.

Judul kegiatan: Rancang Bangun Media Pembelajaran Interaktif Berbasis Web pada Materi Metabolisme Menggunakan Metode POE untuk Siswa Kelas XII SMA Negeri 16 Bandung.

## Status

Tahap Assembly (MDLC). Beranda, peta materi, dan Episode 0–4 sudah diimplementasikan, termasuk animasi, aktivitas POE, Lembar Hasil, refleksi, serta cetak. Semua episode respirasi aerob dapat dibuka dari peta.

Episode 4 mencakup transpor elektron dan perbandingan empat tahap (Aktivitas 1.10–1.11). Perhitungan mengikuti buku: 34 ATP dari transpor elektron dan 38 ATP total respirasi aerob. Tabel perbandingan masih memerlukan validasi guru.

Pengujian perangkat fisik serta validasi guru dan siswa masih diperlukan sebelum rilis.

## Isi media

| Episode | Materi                                            | Aktivitas buku |
| ------- | ------------------------------------------------- | -------------- |
| 0       | Pengantar metabolisme, anabolisme dan katabolisme | 1.5, 1.6       |
| 1       | Glikolisis                                        | 1.7            |
| 2       | Dekarboksilasi oksidatif                          | 1.8            |
| 3       | Siklus Krebs                                      | 1.9            |
| 4       | Transpor elektron dan ringkasan                   | 1.10, 1.11     |

Media dibuka secara daring lewat browser. Di HP, beranda, peta materi, dan Lembar Hasil dipakai dengan posisi tegak, sedangkan episode dipakai dengan posisi miring dan layar penuh.

## Teknologi

| Bagian              | Teknologi                                              |
| ------------------- | ------------------------------------------------------ |
| Bahasa              | TypeScript 7                                           |
| Antarmuka           | React 19                                               |
| Build               | Vite 8                                                 |
| Routing             | React Router (mode hash, agar jalan di GitHub Pages)   |
| Styling             | Tailwind CSS 4 dengan token warna dan tipografi        |
| Komponen aksesibel  | Base UI                                                |
| Animasi materi      | GSAP                                                   |
| Animasi antarmuka   | Motion                                                 |
| Penyimpanan progres | Zustand dengan localStorage                            |
| Suara               | Howler.js                                              |
| Ikon                | Lucide React                                           |
| Font                | Grandstander dan Atkinson Hyperlegible, disimpan lokal |
| Kualitas kode       | Oxlint, Prettier, Husky, lint-staged, commitlint       |
| Pengujian unit      | Vitest dan Testing Library                             |
| Pengujian black box | Playwright, ukuran layar desktop dan HP                |
| CI dan hosting      | GitHub Actions dan GitHub Pages                        |

## Struktur folder

```text
docs/                          dokumentasi tim: arsitektur, konvensi, pengujian
public/audio/                  efek suara dan narasi
src/app/                       titik masuk aplikasi, router, provider
src/assets/images/             gambar raster, misalnya maskot
src/assets/svg/                ilustrasi vektor: sel, organel, molekul
src/components/                komponen antarmuka yang dipakai bersama
src/features/beranda/          halaman beranda
src/features/peta-materi/      halaman peta materi
src/features/pemutar-episode/  layar penuh, kontrol, pengaturan, mode tenang
src/features/poe/              tahap Tebak, Amati, Jelaskan
src/features/lembar-hasil/     rangkuman jawaban siswa di akhir episode
src/episodes/                  satu folder per episode: adegan, animasi, teks soal
src/hooks/                     React hook yang dipakai bersama
src/lib/                       fungsi bantu: suara, penyimpanan, format
src/stores/                    state progres siswa
src/styles/                    token desain dan gaya global
src/types/                     tipe TypeScript bersama
tests/unit/                    pengujian unit
tests/e2e/                     pengujian black box di browser
```

Nama folder teknis memakai bahasa Inggris. Nama fitur dan episode memakai bahasa Indonesia, sama dengan istilah di proposal.

## Menjalankan proyek

Butuh Node.js 20.19 atau lebih baru.

```sh
npm install
npx playwright install chromium   # sekali saja, untuk pengujian black box
npm run dev                       # buka http://localhost:5173
```

Untuk mencoba dari HP di jaringan Wi-Fi yang sama, jalankan `npm run dev -- --host` lalu buka alamat Network yang ditampilkan.

| Perintah               | Fungsi                                        |
| ---------------------- | --------------------------------------------- |
| `npm run dev`          | menjalankan aplikasi untuk pengembangan       |
| `npm run build`        | memeriksa tipe lalu membuat hasil build       |
| `npm run preview`      | membuka hasil build                           |
| `npm run typecheck`    | memeriksa tipe TypeScript                     |
| `npm run lint`         | memeriksa kode dengan Oxlint                  |
| `npm run format`       | merapikan format semua berkas dengan Prettier |
| `npm run format:check` | memeriksa format tanpa mengubah berkas        |
| `npm test`             | menjalankan pengujian unit                    |
| `npm run test:e2e`     | menjalankan pengujian black box               |

Setiap commit otomatis diperiksa: lint dan format pada berkas yang diubah (lint-staged) serta format pesan commit (commitlint).

## Alur kerja tim

- Branch `main` hanya berisi pekerjaan yang sudah diperiksa.
- Pekerjaan baru dibuat di branch terpisah dari `main`. Nama branch memakai awalan yang sama dengan jenis commit, yaitu `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`, atau `test/`, lalu nama singkat dengan huruf kecil dan tanda hubung, misalnya `feat/beranda` atau `fix/teks-soal-glikolisis`.
- Perubahan masuk ke `main` lewat Pull Request yang diperiksa anggota lain.
- Pesan commit memakai format Conventional Commits dengan bahasa Indonesia, misalnya `feat(beranda): tambah tombol mulai belajar` atau `fix(poe): perbaiki urutan pilihan alasan`.
- Satu commit berisi satu perubahan yang utuh.

## Aturan isi

- Jawaban dan jumlah tahap mengikuti kunci jawaban guru Biologi mitra.
- Media tidak memberi nilai atau skor. Pilihan siswa boleh dicatat tetapi tidak dinilai.
- Setiap aktivitas menunjuk butir soal buku yang dijawabnya.
- Jumlah atom dan karbon di setiap adegan harus benar dan bisa dihitung.

## Tim

Kelompok D-01, Program Studi Informatika, Institut Teknologi Nasional Bandung.

| Nama                          | NRM         | Peran                                  |
| ----------------------------- | ----------- | -------------------------------------- |
| Raelqiansyah Putranta Dibrata | 15-2023-167 | Ketua pelaksana                        |
| Ghinova Klarisa Irawadi       | 15-2023-018 | Materi, naskah, dan instrumen evaluasi |
| Felix Angga Resky             | 15-2023-148 | Pengembangan aplikasi web              |
| Difie Anggely                 | 15-2023-186 | Storyboard, ilustrasi, dan antarmuka   |

Mitra: SMA Negeri 16 Bandung.

## Lisensi

Hak cipta program akan didaftarkan. Sampai ada keputusan lisensi, seluruh hak atas kode dan aset milik proyek dalam repositori ini dilindungi. Aset pihak ketiga mengikuti lisensi pemiliknya; lihat [audit sumber audio Episode 1](public/audio/SUMBER.md) untuk status enam suara pilihan tim.
