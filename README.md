# LapStock — Sistem Informasi Manajemen Inventaris Stok Laptop Bekas

Aplikasi web frontend (HTML5, CSS3, Vanilla JavaScript) untuk tugas **Final Project — Interaksi Manusia dan Komputer (IMK)**, Program Studi S1 Teknik Informatika, Fakultas Ilmu Komputer, Universitas Brawijaya (2026).

## Anggota Kelompok 4 (Kelas B)
1. **Faeyza Safa Izz Deyardi** (`255150207111060`)
2. **Rizky Eka Saputra** (`255150219111008`)
3. **Abdul Rasyid Baisa** (`255150200111004`)
4. **Monica Vidyaningtyas** (`255150219111002`)

**Dosen Pengampu:** Ir. Lutfi Fanani, S. Kom., M. Sc., M.T.

---

## Ringkasan Sistem & Cakupan 24 Halaman Sitemap

LapStock dirancang berdasarkan *Hierarchical Task Analysis (HTA)* (6 task utama, 66 subtask) dan *Sitemap* 24 halaman yang melayani 5 peran pengguna dengan pembatasan hak akses (*Role-Based Access Control*):

- **Area Publik (Pelanggan — tanpa login):** `PU-01` Beranda, `PU-02` Katalog (filter & pengurutan real-time), `PU-03` Detail Unit (grade tooltip & tab riwayat modifikasi), `PU-04` Cek Status Teknis Unit, `PU-05` Info Toko & Garansi.
- **Autentikasi & Umum:** `AU-01` Login, `AU-02` Dashboard Adaptif sesuai peran, `AU-03` Profil Saya & Ubah Kata Sandi, serta halaman `403 Akses Ditolak`.
- **Inventaris (Admin Gudang; Pemilik baca saja):** `IV-01` Daftar Inventaris, `IV-02` Tambah Unit (verifikasi nomor seri ganda & deteksi duplikat otomatis), `IV-03` Detail Unit Inventaris, `IV-04` Ubah Unit (penandaan kolom berubah & kunci unit terjual), `IV-05` Rekap Stok Fisik Harian.
- **Teknis (Teknisi; Admin Gudang baca saja):** `TK-01` Antrean Teknis, `TK-02` Detail Pekerjaan Teknis (pembaruan status tersinkron ke pelanggan & pencatatan riwayat modifikasi komponen).
- **Penjualan (Kasir; Pemilik baca saja riwayat/nota):** `TR-01` Pencarian Stok Cepat & Detail Cepat, `TR-02` Transaksi Baru 4-Langkah (validasi ketersediaan ulang & simulasi bentrok stok), `TR-03` Detail Transaksi & Nota Siap Cetak, `TR-04` Riwayat Transaksi.
- **Laporan & Pengguna (Pemilik Toko):** `LP-01` Laporan Penjualan, `LP-02` Laporan Keuangan, `LP-03` Laporan Stok & Aset (grafik interaktif, cetak & ekspor CSV), `PG-01` Daftar Pengguna, `PG-02` Formulir Akun Pengguna.

---

## Cara Menjalankan Aplikasi

Aplikasi ini dibangun murni menggunakan **HTML, CSS, dan JavaScript** tanpa ketergantungan backend atau proses build:

1. Buka langsung berkas `index.html` di peramban web modern (Chrome, Edge, Firefox), **atau** jalankan server statis lokal:
   ```bash
   python -m http.server 8000
   ```
   lalu buka `http://localhost:8000`.
2. Gunakan **Bar Demo Peran** di bagian atas layar untuk berpindah cepat antar 5 peran (`Pelanggan`, `Admin Gudang`, `Teknisi`, `Kasir`, `Pemilik Toko`) atau uji halaman `AU-01 Login` menggunakan akun demo:
   - Pemilik Toko: `faeyza@lapstock.id` / `password123`
   - Admin Gudang: `rizky@lapstock.id` / `password123`
   - Teknisi: `rasyid@lapstock.id` / `password123`
   - Kasir: `monica@lapstock.id` / `password123`
3. Seluruh perubahan data tersimpan otomatis di `localStorage` dan dapat dikembalikan ke kondisi awal melalui tombol **Reset** pada Bar Demo Peran.

## Struktur Direktori

```text
├── index.html                   # Entry point aplikasi
├── css/
│   └── styles.css               # Design system, layout responsif & print stylesheet
├── js/
│   ├── svg.js                   # Ikon vektor, ilustrasi laptop per merek & grafik SVG interaktif
│   ├── data.js                  # State store, data demo realistis & persistensi localStorage
│   ├── router.js                # SPA Router 24 halaman, RBAC & guard formulir belum disimpan
│   ├── app.js                   # Shell internal, sidebar adaptif, modal, drawer & toast manager
│   └── views/
│       ├── public.js            # PU-01 s.d. PU-05
│       ├── auth.js              # AU-01 s.d. AU-03 & 403 Akses Ditolak
│       ├── inventory.js         # IV-01 s.d. IV-05
│       ├── technician.js        # TK-01 & TK-02
│       ├── sales.js             # TR-01 s.d. TR-04
│       └── reports_users.js     # LP-01 s.d. LP-03, PG-01 & PG-02
├── docs/
│   └── Laporan_Akhir_IMK_Kelompok4_LapStock.docx
└── README.md
```
