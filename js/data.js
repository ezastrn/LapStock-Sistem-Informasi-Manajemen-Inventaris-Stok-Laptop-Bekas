/* ==========================================================================
   LapStock State & Persistence Store (localStorage)
   ========================================================================== */

window.LapStore = (function () {
  const STORAGE_KEY = 'lapstock_imk_v2_state';

  const ROLE_INFO = {
    pelanggan: {
      key: 'pelanggan',
      label: 'Pelanggan (Publik)',
      desc: 'Akses area publik tanpa login: katalog, detail unit, cek status teknis, dan info garansi.'
    },
    admin_gudang: {
      key: 'admin_gudang',
      label: 'Admin Gudang',
      desc: 'Mencatat unit masuk (verifikasi nomor seri ganda), mengelola inventaris, merekap stok fisik, dan membaca antrean teknis.'
    },
    teknisi: {
      key: 'teknisi',
      label: 'Teknisi',
      desc: 'Mengelola antrean teknis, memperbarui status pengerjaan, mencatat riwayat modifikasi komponen, dan menandai unit selesai.'
    },
    kasir: {
      key: 'kasir',
      label: 'Kasir',
      desc: 'Mencari stok cepat, menyusun transaksi 4-langkah, memproses pembayaran, mencetak nota, dan melihat riwayat transaksi.'
    },
    pemilik: {
      key: 'pemilik',
      label: 'Pemilik Toko',
      desc: 'Memantau dashboard analitik, laporan penjualan/keuangan/stok, mengelola akun pengguna, serta melihat inventaris & transaksi (baca saja).'
    }
  };

  const GRADE_INFO = {
    'Grade A': 'Mulus seperti baru — bodi sangat mulus tanpa penyok/goresan berarti, layar jernih tanpa dead pixel, kesehatan baterai ≥ 85%.',
    'Grade B': 'Baik / pemakaian wajar — terdapat goresan halus minor pada bodi luar, layar & fungsi hardware 100% normal, kesehatan baterai ≥ 75%.',
    'Grade C': 'Fungsional ekonomis — bekas pemakaian terlihat jelas di casing/palmrest, seluruh fungsi utama dan port bekerja normal.'
  };

  const DEFAULT_DATA = {
    users: [
      {
        id: 'USR-01',
        nama: 'Faeyza Safa Izz Deyardi',
        email: 'faeyza@lapstock.id',
        password: 'password123',
        role: 'pemilik',
        aktif: true,
        dibuatPada: '2026-09-01'
      },
      {
        id: 'USR-02',
        nama: 'Rizky Eka Saputra',
        email: 'rizky@lapstock.id',
        password: 'password123',
        role: 'admin_gudang',
        aktif: true,
        dibuatPada: '2026-09-01'
      },
      {
        id: 'USR-03',
        nama: 'Abdul Rasyid Baisa',
        email: 'rasyid@lapstock.id',
        password: 'password123',
        role: 'teknisi',
        aktif: true,
        dibuatPada: '2026-09-01'
      },
      {
        id: 'USR-04',
        nama: 'Monica Vidyaningtyas',
        email: 'monica@lapstock.id',
        password: 'password123',
        role: 'kasir',
        aktif: true,
        dibuatPada: '2026-09-01'
      },
      {
        id: 'USR-05',
        nama: 'Dimas Pratama',
        email: 'dimas@lapstock.id',
        password: 'password123',
        role: 'admin_gudang',
        aktif: false,
        dibuatPada: '2026-10-05'
      }
    ],
    units: [
      {
        id: 'LP-2026-001',
        kode: 'LP-2026-001',
        serialNumber: 'PF3X9K2L-LEN',
        merek: 'Lenovo',
        model: 'ThinkPad T14 Gen 2',
        cpu: 'Intel Core i5-1145G7',
        ram: '16 GB',
        storage: '512GB NVMe SSD',
        layar: '14" FHD IPS Anti-Glare',
        grade: 'Grade A',
        status: 'Tersedia',
        statusTeknis: 'Selesai',
        kelengkapan: ['Charger Original', 'Kabel Power', 'Kartu Garansi Toko'],
        hargaBeli: 5400000,
        hargaJual: 7200000,
        garansi: '90 Hari',
        catatanInspeksi: 'Thermal paste diganti baru, kesehatan baterai 91%, keyboard backlight & seluruh port USB-C/HDMI lulus uji 100%.',
        foto: '',
        tanggalMasuk: '2026-11-18',
        updatedAt: '2026-11-24 14:20',
        modifikasi: [
          { tanggal: '2026-11-19', jenis: 'Upgrade RAM', komponenLama: '8 GB DDR4 3200MHz', komponenBaru: '16 GB DDR4 Dual-Channel', catatan: 'Penambahan keping 8GB Samsung OEM, lulus MemTest86.', teknisi: 'Abdul Rasyid Baisa' },
          { tanggal: '2026-11-19', jenis: 'Maintenance', komponenLama: 'Thermal Paste Bawaan', komponenBaru: 'Arctic MX-4 Thermal Paste', catatan: 'Pembersihan fan & heatsink, suhu idle stabil 41°C.', teknisi: 'Abdul Rasyid Baisa' }
        ],
        logs: [
          { waktu: '2026-11-18 09:15', status: 'Dalam Inspeksi', pelaku: 'Rizky Eka Saputra', catatan: 'Unit dicatat masuk dengan verifikasi SN ganda.' },
          { waktu: '2026-11-19 11:30', status: 'Instalasi', pelaku: 'Abdul Rasyid Baisa', catatan: 'Upgrade RAM ke 16GB & instalasi Windows 11 Pro original.' },
          { waktu: '2026-11-19 15:10', status: 'Tersedia', pelaku: 'Abdul Rasyid Baisa', catatan: 'Inspeksi akhir selesai, siap dijual.' }
        ]
      },
      {
        id: 'LP-2026-002',
        kode: 'LP-2026-002',
        serialNumber: '7H8X2Q3-DEL',
        merek: 'Dell',
        model: 'Latitude 7420 Carbon',
        cpu: 'Intel Core i7-1185G7',
        ram: '16 GB',
        storage: '512GB NVMe SSD',
        layar: '14" FHD IPS 400-nit',
        grade: 'Grade A',
        status: 'Tersedia',
        statusTeknis: 'Selesai',
        kelengkapan: ['Charger Original', 'Tas Laptop', 'Kartu Garansi Toko'],
        hargaBeli: 6700000,
        hargaJual: 8650000,
        garansi: '90 Hari',
        catatanInspeksi: 'Bodi carbon fiber mulus, baterai 88%, webcam shutter & fingerprint berfungsi normal.',
        foto: '',
        tanggalMasuk: '2026-11-19',
        updatedAt: '2026-11-23 16:05',
        modifikasi: [
          { tanggal: '2026-11-20', jenis: 'Upgrade Storage', komponenLama: '256GB NVMe SSD', komponenBaru: '512GB NVMe Gen4 WD SN740', catatan: 'Health SSD 100%, read speed 4.800 MB/s.', teknisi: 'Abdul Rasyid Baisa' }
        ],
        logs: [
          { waktu: '2026-11-19 10:05', status: 'Dalam Inspeksi', pelaku: 'Rizky Eka Saputra', catatan: 'Unit masuk stok gudang.' },
          { waktu: '2026-11-20 14:40', status: 'Tersedia', pelaku: 'Abdul Rasyid Baisa', catatan: 'Lulus seluruh QC hardware & baterai.' }
        ]
      },
      {
        id: 'LP-2026-003',
        kode: 'LP-2026-003',
        serialNumber: '5CD1248M-HP',
        merek: 'HP',
        model: 'EliteBook 840 G8',
        cpu: 'Intel Core i5-1135G7',
        ram: '16 GB',
        storage: '256GB NVMe SSD',
        layar: '14" FHD IPS SureView',
        grade: 'Grade A',
        status: 'Tersedia',
        statusTeknis: 'Selesai',
        kelengkapan: ['Charger Original', 'Kabel Power', 'Kartu Garansi Toko'],
        hargaBeli: 4900000,
        hargaJual: 6450000,
        garansi: '60 Hari',
        catatanInspeksi: 'Chassis aluminum bersih, speaker Bang & Olufsen jernih, baterai 86%.',
        foto: '',
        tanggalMasuk: '2026-11-20',
        updatedAt: '2026-11-22 13:10',
        modifikasi: [],
        logs: [
          { waktu: '2026-11-20 09:40', status: 'Dalam Inspeksi', pelaku: 'Rizky Eka Saputra', catatan: 'Pencatatan unit baru.' },
          { waktu: '2026-11-21 12:15', status: 'Tersedia', pelaku: 'Abdul Rasyid Baisa', catatan: 'Lolos QC dan instalasi driver.' }
        ]
      },
      {
        id: 'LP-2026-004',
        kode: 'LP-2026-004',
        serialNumber: 'C02G48K1-APL',
        merek: 'Apple',
        model: 'MacBook Air M1 2020',
        cpu: 'Apple M1 8-Core',
        ram: '8 GB',
        storage: '256GB SSD',
        layar: '13.3" Retina True Tone',
        grade: 'Grade A',
        status: 'Tersedia',
        statusTeknis: 'Selesai',
        kelengkapan: ['Charger Original', 'Dus / Box', 'Kartu Garansi Toko'],
        hargaBeli: 8100000,
        hargaJual: 10400000,
        garansi: '90 Hari',
        catatanInspeksi: 'Cycle count 112 (Battery Health 94%), iCloud bersih, Touch ID responsif, layar bebas staingate.',
        foto: '',
        tanggalMasuk: '2026-11-20',
        updatedAt: '2026-11-24 10:00',
        modifikasi: [],
        logs: [
          { waktu: '2026-11-20 11:20', status: 'Dalam Inspeksi', pelaku: 'Rizky Eka Saputra', catatan: 'Unit MacBook Air M1 Space Gray masuk.' },
          { waktu: '2026-11-21 16:00', status: 'Tersedia', pelaku: 'Abdul Rasyid Baisa', catatan: 'Reset macOS Sequoia bersih & lulus QC.' }
        ]
      },
      {
        id: 'LP-2026-005',
        kode: 'LP-2026-005',
        serialNumber: 'M8N0CV19-ASU',
        merek: 'ASUS',
        model: 'ZenBook 14 OLED UX3402',
        cpu: 'Intel Core i5-1240P',
        ram: '16 GB',
        storage: '512GB NVMe SSD',
        layar: '14" 2.8K OLED 90Hz',
        grade: 'Grade B',
        status: 'Tersedia',
        statusTeknis: 'Selesai',
        kelengkapan: ['Charger Original', 'Tas Laptop', 'Kartu Garansi Toko'],
        hargaBeli: 6900000,
        hargaJual: 8900000,
        garansi: '60 Hari',
        catatanInspeksi: 'Panel OLED jernih tanpa burn-in, goresan sangat halus di tutup atas, fungsi Thunderbolt 4 normal.',
        foto: '',
        tanggalMasuk: '2026-11-21',
        updatedAt: '2026-11-24 17:30',
        modifikasi: [],
        logs: [
          { waktu: '2026-11-21 10:15', status: 'Dalam Inspeksi', pelaku: 'Rizky Eka Saputra', catatan: 'Unit masuk stok.' },
          { waktu: '2026-11-22 15:40', status: 'Tersedia', pelaku: 'Abdul Rasyid Baisa', catatan: 'Inspeksi OLED & kalibrasi warna selesai.' }
        ]
      },
      {
        id: 'LP-2026-006',
        kode: 'LP-2026-006',
        serialNumber: 'NXA8TSN-ACR',
        merek: 'Acer',
        model: 'Swift 3 SF314-511',
        cpu: 'Intel Core i5-1135G7',
        ram: '8 GB',
        storage: '512GB NVMe SSD',
        layar: '14" FHD IPS 100% sRGB',
        grade: 'Grade B',
        status: 'Tersedia',
        statusTeknis: 'Selesai',
        kelengkapan: ['Charger Original', 'Kartu Garansi Toko'],
        hargaBeli: 3650000,
        hargaJual: 4850000,
        garansi: '30 Hari',
        catatanInspeksi: 'Ringan & dingin, baterai 81%, minor scratch di sudut kanan bawah.',
        foto: '',
        tanggalMasuk: '2026-11-22',
        updatedAt: '2026-11-24 11:45',
        modifikasi: [],
        logs: [
          { waktu: '2026-11-22 09:00', status: 'Dalam Inspeksi', pelaku: 'Rizky Eka Saputra', catatan: 'Dicatat masuk gudang.' },
          { waktu: '2026-11-23 13:20', status: 'Tersedia', pelaku: 'Abdul Rasyid Baisa', catatan: 'Selesai QC & siap jual.' }
        ]
      },
      {
        id: 'LP-2026-007',
        kode: 'LP-2026-007',
        serialNumber: 'PF2M99X1-LEN',
        merek: 'Lenovo',
        model: 'ThinkPad X1 Carbon Gen 9',
        cpu: 'Intel Core i7-1185G7',
        ram: '16 GB',
        storage: '512GB NVMe SSD',
        layar: '14" FHD+ IPS 16:10',
        grade: 'Grade A',
        status: 'Dalam Inspeksi',
        statusTeknis: 'Dalam Inspeksi',
        kelengkapan: ['Charger Original', 'Kartu Garansi Toko'],
        hargaBeli: 8500000,
        hargaJual: 11200000,
        garansi: '90 Hari',
        catatanInspeksi: 'Sedang dilakukan stress test CPU/GPU dan pengecekan kalibrasi baterai.',
        foto: '',
        tanggalMasuk: '2026-11-24',
        updatedAt: '2026-11-25 09:10',
        modifikasi: [],
        logs: [
          { waktu: '2026-11-24 15:30', status: 'Dalam Inspeksi', pelaku: 'Rizky Eka Saputra', catatan: 'Unit masuk antrean inspeksi teknisi.' }
        ]
      },
      {
        id: 'LP-2026-008',
        kode: 'LP-2026-008',
        serialNumber: '9K3M7P2-DEL',
        merek: 'Dell',
        model: 'XPS 13 9310',
        cpu: 'Intel Core i7-1165G7',
        ram: '16 GB',
        storage: '512GB NVMe SSD',
        layar: '13.4" FHD+ InfinityEdge',
        grade: 'Grade A',
        status: 'Menunggu Komponen',
        statusTeknis: 'Menunggu Komponen',
        kelengkapan: ['Charger Original', 'Kartu Garansi Toko'],
        hargaBeli: 7900000,
        hargaJual: 10500000,
        garansi: '90 Hari',
        catatanInspeksi: 'Menunggu kedatangan baterai OEM pengganti karena health awal di bawah 70%.',
        foto: '',
        tanggalMasuk: '2026-11-23',
        updatedAt: '2026-11-25 10:15',
        modifikasi: [],
        logs: [
          { waktu: '2026-11-23 11:00', status: 'Dalam Inspeksi', pelaku: 'Rizky Eka Saputra', catatan: 'Unit masuk gudang.' },
          { waktu: '2026-11-24 14:20', status: 'Menunggu Komponen', pelaku: 'Abdul Rasyid Baisa', catatan: 'Order baterai Dell OEM 52Wh.' }
        ]
      },
      {
        id: 'LP-2026-009',
        kode: 'LP-2026-009',
        serialNumber: '5CG2109K-HP',
        merek: 'HP',
        model: 'ProBook 445 G8',
        cpu: 'AMD Ryzen 5 5600U',
        ram: '16 GB',
        storage: '512GB NVMe SSD',
        layar: '14" FHD IPS',
        grade: 'Grade B',
        status: 'Instalasi',
        statusTeknis: 'Instalasi',
        kelengkapan: ['Charger Original', 'Kabel Power', 'Kartu Garansi Toko'],
        hargaBeli: 4200000,
        hargaJual: 5750000,
        garansi: '60 Hari',
        catatanInspeksi: 'Upgrade RAM 16GB dan SSD 512GB selesai dipasang, sedang proses instalasi OS & driver.',
        foto: '',
        tanggalMasuk: '2026-11-24',
        updatedAt: '2026-11-25 11:30',
        modifikasi: [
          { tanggal: '2026-11-25', jenis: 'Upgrade RAM', komponenLama: '8 GB DDR4', komponenBaru: '16 GB DDR4 Dual-Channel', catatan: 'Upgrade untuk performa multitasking optimal.', teknisi: 'Abdul Rasyid Baisa' }
        ],
        logs: [
          { waktu: '2026-11-24 09:20', status: 'Dalam Inspeksi', pelaku: 'Rizky Eka Saputra', catatan: 'Unit dicatat masuk.' },
          { waktu: '2026-11-25 11:30', status: 'Instalasi', pelaku: 'Abdul Rasyid Baisa', catatan: 'Pemasangan RAM selesai, lanjut instalasi OS.' }
        ]
      },
      {
        id: 'LP-2026-010',
        kode: 'LP-2026-010',
        serialNumber: 'PF1R44T8-LEN',
        merek: 'Lenovo',
        model: 'ThinkPad T490',
        cpu: 'Intel Core i5-8365U',
        ram: '16 GB',
        storage: '256GB NVMe SSD',
        layar: '14" FHD IPS',
        grade: 'Grade B',
        status: 'Terjual',
        statusTeknis: 'Selesai',
        kelengkapan: ['Charger Original', 'Kartu Garansi Toko'],
        hargaBeli: 3900000,
        hargaJual: 5600000,
        garansi: '60 Hari',
        catatanInspeksi: 'Normal 100%, baterai 84%.',
        foto: '',
        tanggalMasuk: '2026-11-12',
        updatedAt: '2026-11-19 14:15',
        modifikasi: [],
        logs: [
          { waktu: '2026-11-12 09:00', status: 'Dalam Inspeksi', pelaku: 'Rizky Eka Saputra', catatan: 'Unit masuk.' },
          { waktu: '2026-11-13 15:00', status: 'Tersedia', pelaku: 'Abdul Rasyid Baisa', catatan: 'Lulus QC.' },
          { waktu: '2026-11-19 14:15', status: 'Terjual', pelaku: 'Monica Vidyaningtyas', catatan: 'Terjual pada nota INV-20261119-001.' }
        ]
      },
      {
        id: 'LP-2026-011',
        kode: 'LP-2026-011',
        serialNumber: 'C02F19Z8-APL',
        merek: 'Apple',
        model: 'MacBook Pro 13 M1',
        cpu: 'Apple M1 8-Core',
        ram: '8 GB',
        storage: '512GB SSD',
        layar: '13.3" Retina Touch Bar',
        grade: 'Grade A',
        status: 'Terjual',
        statusTeknis: 'Selesai',
        kelengkapan: ['Charger Original', 'Dus / Box', 'Kartu Garansi Toko'],
        hargaBeli: 9200000,
        hargaJual: 11800000,
        garansi: '90 Hari',
        catatanInspeksi: 'Touch Bar & True Tone normal, BH 92%.',
        foto: '',
        tanggalMasuk: '2026-11-14',
        updatedAt: '2026-11-21 16:40',
        modifikasi: [],
        logs: [
          { waktu: '2026-11-21 16:40', status: 'Terjual', pelaku: 'Monica Vidyaningtyas', catatan: 'Terjual pada nota INV-20261121-002.' }
        ]
      },
      {
        id: 'LP-2026-012',
        kode: 'LP-2026-012',
        serialNumber: 'PF2X71W4-LEN',
        merek: 'Lenovo',
        model: 'ThinkPad X13 Gen 2',
        cpu: 'Intel Core i5-1145G7',
        ram: '16 GB',
        storage: '512GB NVMe SSD',
        layar: '13.3" WUXGA IPS',
        grade: 'Grade A',
        status: 'Terjual',
        statusTeknis: 'Selesai',
        kelengkapan: ['Charger Original', 'Tas Laptop', 'Kartu Garansi Toko'],
        hargaBeli: 6200000,
        hargaJual: 8200000,
        garansi: '90 Hari',
        catatanInspeksi: 'Sangat mulus, lulus uji lengkap.',
        foto: '',
        tanggalMasuk: '2026-11-16',
        updatedAt: '2026-11-23 13:25',
        modifikasi: [],
        logs: [
          { waktu: '2026-11-23 13:25', status: 'Terjual', pelaku: 'Monica Vidyaningtyas', catatan: 'Terjual pada nota INV-20261123-003.' }
        ]
      },
      {
        id: 'LP-2026-013',
        kode: 'LP-2026-013',
        serialNumber: '4B9V3K2-DEL',
        merek: 'Dell',
        model: 'Latitude 5420',
        cpu: 'Intel Core i5-1145G7',
        ram: '16 GB',
        storage: '256GB NVMe SSD',
        layar: '14" FHD IPS',
        grade: 'Grade B',
        status: 'Terjual',
        statusTeknis: 'Selesai',
        kelengkapan: ['Charger Original', 'Kartu Garansi Toko'],
        hargaBeli: 4700000,
        hargaJual: 6250000,
        garansi: '60 Hari',
        catatanInspeksi: 'Normal dan siap pakai.',
        foto: '',
        tanggalMasuk: '2026-11-17',
        updatedAt: '2026-11-25 11:05',
        modifikasi: [],
        logs: [
          { waktu: '2026-11-25 11:05', status: 'Terjual', pelaku: 'Monica Vidyaningtyas', catatan: 'Terjual pada nota INV-20261125-004.' }
        ]
      }
    ],
    transactions: [
      {
        id: 'INV-20261119-001',
        tanggal: '2026-11-19',
        waktu: '14:15',
        kasir: 'Monica Vidyaningtyas',
        pembeliNama: 'Budi Santoso',
        pembeliKontak: '0812-3456-7811',
        metode: 'Transfer Bank',
        dibayar: 5600000,
        kembalian: 0,
        total: 5600000,
        totalModal: 3900000,
        items: [
          { unitId: 'LP-2026-010', kode: 'LP-2026-010', serialNumber: 'PF1R44T8-LEN', nama: 'Lenovo ThinkPad T490', merek: 'Lenovo', grade: 'Grade B', garansi: '60 Hari', harga: 5600000, modal: 3900000 }
        ]
      },
      {
        id: 'INV-20261121-002',
        tanggal: '2026-11-21',
        waktu: '16:40',
        kasir: 'Monica Vidyaningtyas',
        pembeliNama: 'Nadia Kusuma',
        pembeliKontak: '0857-9021-4430',
        metode: 'QRIS',
        dibayar: 11800000,
        kembalian: 0,
        total: 11800000,
        totalModal: 9200000,
        items: [
          { unitId: 'LP-2026-011', kode: 'LP-2026-011', serialNumber: 'C02F19Z8-APL', nama: 'Apple MacBook Pro 13 M1', merek: 'Apple', grade: 'Grade A', garansi: '90 Hari', harga: 11800000, modal: 9200000 }
        ]
      },
      {
        id: 'INV-20261123-003',
        tanggal: '2026-11-23',
        waktu: '13:25',
        kasir: 'Monica Vidyaningtyas',
        pembeliNama: 'Hendra Wijaya',
        pembeliKontak: '0813-8877-2190',
        metode: 'Tunai',
        dibayar: 8500000,
        kembalian: 300000,
        total: 8200000,
        totalModal: 6200000,
        items: [
          { unitId: 'LP-2026-012', kode: 'LP-2026-012', serialNumber: 'PF2X71W4-LEN', nama: 'Lenovo ThinkPad X13 Gen 2', merek: 'Lenovo', grade: 'Grade A', garansi: '90 Hari', harga: 8200000, modal: 6200000 }
        ]
      },
      {
        id: 'INV-20261125-004',
        tanggal: '2026-11-25',
        waktu: '11:05',
        kasir: 'Monica Vidyaningtyas',
        pembeliNama: 'Siti Rahmawati',
        pembeliKontak: '0821-5543-9087',
        metode: 'Transfer Bank',
        dibayar: 6250000,
        kembalian: 0,
        total: 6250000,
        totalModal: 4700000,
        items: [
          { unitId: 'LP-2026-013', kode: 'LP-2026-013', serialNumber: '4B9V3K2-DEL', nama: 'Dell Latitude 5420', merek: 'Dell', grade: 'Grade B', garansi: '60 Hari', harga: 6250000, modal: 4700000 }
        ]
      }
    ],
    rekapHistory: [
      {
        id: 'RKP-20261124',
        tanggal: '2026-11-24',
        pelaku: 'Rizky Eka Saputra',
        stokSistem: 7,
        hitunganFisik: 7,
        selisih: 0,
        catatan: 'Seluruh unit tersedia sesuai rak gudang A & etalase toko.'
      }
    ],
    session: {
      role: 'pelanggan',
      userId: null
    },
    cart: [],
    catalogFilters: {
      q: '',
      merek: '',
      harga: '',
      cpu: '',
      ram: '',
      grade: '',
      sort: 'terbaru',
      page: 1
    }
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULT_DATA);
      const parsed = JSON.parse(raw);
      return Object.assign(clone(DEFAULT_DATA), parsed);
    } catch (e) {
      return clone(DEFAULT_DATA);
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Storage quota fallback
    }
  }

  function reset() {
    state = clone(DEFAULT_DATA);
    save();
  }

  function getState() {
    return state;
  }

  function getCurrentUser() {
    if (!state.session.userId) return null;
    return state.users.find(u => u.id === state.session.userId) || null;
  }

  function getCurrentRole() {
    return state.session.role || 'pelanggan';
  }

  function switchRoleDemo(roleKey) {
    if (roleKey === 'pelanggan') {
      state.session = { role: 'pelanggan', userId: null };
    } else {
      const user = state.users.find(u => u.role === roleKey && u.aktif) || state.users.find(u => u.role === roleKey);
      if (user) {
        state.session = { role: user.role, userId: user.id };
      }
    }
    save();
    return getCurrentUser();
  }

  function login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = state.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user || user.password !== password) {
      return { ok: false, message: 'Email atau kata sandi salah' };
    }
    if (!user.aktif) {
      return { ok: false, message: 'Akun Anda sedang dinonaktifkan. Hubungi Pemilik Toko.' };
    }
    state.session = { role: user.role, userId: user.id };
    save();
    return { ok: true, user };
  }

  function logout() {
    state.session = { role: 'pelanggan', userId: null };
    state.cart = [];
    save();
  }

  function getUnitById(id) {
    return state.units.find(u => u.id === id || u.kode.toLowerCase() === String(id).toLowerCase());
  }

  function isSerialDuplicate(sn, excludeUnitId = null) {
    const target = (sn || '').trim().toUpperCase();
    if (!target) return false;
    return state.units.some(u => u.id !== excludeUnitId && u.serialNumber.toUpperCase() === target);
  }

  function nextUnitCode() {
    const nums = state.units.map(u => {
      const m = u.kode.match(/(\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const next = (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
    return `LP-2026-${next}`;
  }

  function nowStr() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function todayStr() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function addUnit(payload) {
    const user = getCurrentUser();
    const kode = nextUnitCode();
    const unit = {
      id: kode,
      kode,
      serialNumber: payload.serialNumber.trim().toUpperCase(),
      merek: payload.merek,
      model: payload.model.trim(),
      cpu: payload.cpu.trim(),
      ram: payload.ram,
      storage: payload.storage.trim(),
      layar: payload.layar.trim(),
      grade: payload.grade,
      status: 'Dalam Inspeksi',
      statusTeknis: 'Dalam Inspeksi',
      kelengkapan: payload.kelengkapan || [],
      hargaBeli: Number(payload.hargaBeli) || 0,
      hargaJual: Number(payload.hargaJual) || 0,
      garansi: payload.garansi,
      catatanInspeksi: '',
      foto: payload.foto || '',
      tanggalMasuk: todayStr(),
      updatedAt: nowStr(),
      modifikasi: [],
      logs: [
        {
          waktu: nowStr(),
          status: 'Dalam Inspeksi',
          pelaku: user ? user.nama : 'Admin Gudang',
          catatan: 'Unit baru dicatat masuk dengan verifikasi nomor seri ganda.'
        }
      ]
    };
    state.units.unshift(unit);
    save();
    return unit;
  }

  function updateUnit(id, patch, changedFields = []) {
    const unit = getUnitById(id);
    if (!unit || unit.status === 'Terjual') return null;
    const user = getCurrentUser();
    const oldSN = unit.serialNumber;
    Object.assign(unit, patch);
    unit.updatedAt = nowStr();
    const snNote = (patch.serialNumber && patch.serialNumber !== oldSN)
      ? ` Perubahan nomor seri: ${oldSN} → ${patch.serialNumber}.`
      : '';
    unit.logs.unshift({
      waktu: nowStr(),
      status: unit.status,
      pelaku: user ? user.nama : 'Admin Gudang',
      catatan: `Data unit diperbarui (${changedFields.join(', ') || 'spesifikasi'}).${snNote}`
    });
    save();
    return unit;
  }

  function deactivateUnit(id, alasan) {
    const unit = getUnitById(id);
    if (!unit) return null;
    const user = getCurrentUser();
    unit.status = 'Nonaktif';
    unit.updatedAt = nowStr();
    unit.logs.unshift({
      waktu: nowStr(),
      status: 'Nonaktif',
      pelaku: user ? user.nama : 'Admin Gudang',
      catatan: `Unit dinonaktifkan. Alasan: ${alasan}`
    });
    state.cart = state.cart.filter(cid => cid !== unit.id);
    save();
    return unit;
  }

  function updateTechStatus(id, newStatus, catatanInspeksi) {
    const unit = getUnitById(id);
    if (!unit) return null;
    const user = getCurrentUser();
    unit.statusTeknis = newStatus;
    if (typeof catatanInspeksi === 'string') {
      unit.catatanInspeksi = catatanInspeksi;
    }
    if (newStatus === 'Selesai') {
      unit.status = 'Tersedia';
    } else {
      unit.status = newStatus;
    }
    unit.updatedAt = nowStr();
    unit.logs.unshift({
      waktu: nowStr(),
      status: unit.status,
      pelaku: user ? user.nama : 'Teknisi',
      catatan: newStatus === 'Selesai'
        ? 'Pekerjaan teknis ditandai selesai. Unit kini berstatus Tersedia.'
        : `Status teknis diperbarui menjadi ${newStatus}.`
    });
    save();
    return unit;
  }

  function addModification(id, mod) {
    const unit = getUnitById(id);
    if (!unit) return null;
    const user = getCurrentUser();
    unit.modifikasi.unshift({
      tanggal: mod.tanggal || todayStr(),
      jenis: mod.jenis,
      komponenLama: mod.komponenLama,
      komponenBaru: mod.komponenBaru,
      catatan: mod.catatan || '-',
      teknisi: user ? user.nama : 'Teknisi'
    });
    unit.updatedAt = nowStr();
    unit.logs.unshift({
      waktu: nowStr(),
      status: unit.status,
      pelaku: user ? user.nama : 'Teknisi',
      catatan: `Riwayat modifikasi dicatat: ${mod.jenis} (${mod.komponenLama} → ${mod.komponenBaru}).`
    });
    save();
    return unit;
  }

  function addToCart(unitId) {
    const unit = getUnitById(unitId);
    if (!unit || unit.status !== 'Tersedia') return { ok: false, reason: 'Unit tidak berstatus Tersedia.' };
    if (state.cart.includes(unitId)) return { ok: false, reason: 'Unit sudah ada di daftar transaksi.' };
    state.cart.push(unitId);
    save();
    return { ok: true };
  }

  function removeFromCart(unitId) {
    state.cart = state.cart.filter(id => id !== unitId);
    save();
  }

  function clearCart() {
    state.cart = [];
    save();
  }

  function createTransaction({ pembeliNama, pembeliKontak, metode, dibayar }) {
    const user = getCurrentUser();
    const cartUnits = state.cart.map(id => getUnitById(id)).filter(Boolean);
    const unavailable = cartUnits.filter(u => u.status !== 'Tersedia');
    if (unavailable.length > 0) {
      state.cart = state.cart.filter(id => !unavailable.some(u => u.id === id));
      save();
      return { ok: false, unavailable };
    }
    if (cartUnits.length === 0) {
      return { ok: false, reason: 'Tidak ada unit tersedia dalam transaksi.' };
    }

    const total = cartUnits.reduce((s, u) => s + u.hargaJual, 0);
    const totalModal = cartUnits.reduce((s, u) => s + u.hargaBeli, 0);
    const paid = Number(dibayar) || total;
    const kembalian = Math.max(0, paid - total);

    const datePart = todayStr().replace(/-/g, '');
    const seq = String(state.transactions.length + 1).padStart(3, '0');
    const trxId = `INV-${datePart}-${seq}`;
    const timePart = nowStr().slice(11);

    const trx = {
      id: trxId,
      tanggal: todayStr(),
      waktu: timePart,
      kasir: user ? user.nama : 'Kasir',
      pembeliNama: pembeliNama.trim(),
      pembeliKontak: pembeliKontak.trim(),
      metode,
      dibayar: paid,
      kembalian,
      total,
      totalModal,
      items: cartUnits.map(u => ({
        unitId: u.id,
        kode: u.kode,
        serialNumber: u.serialNumber,
        nama: `${u.merek} ${u.model}`,
        merek: u.merek,
        grade: u.grade,
        garansi: u.garansi,
        harga: u.hargaJual,
        modal: u.hargaBeli
      }))
    };

    cartUnits.forEach(u => {
      u.status = 'Terjual';
      u.updatedAt = nowStr();
      u.logs.unshift({
        waktu: nowStr(),
        status: 'Terjual',
        pelaku: user ? user.nama : 'Kasir',
        catatan: `Terjual kepada ${trx.pembeliNama} (${trxId}).`
      });
    });

    state.transactions.unshift(trx);
    state.cart = [];
    save();
    return { ok: true, trx };
  }

  function saveRekap(record) {
    const user = getCurrentUser();
    const item = {
      id: 'RKP-' + record.tanggal.replace(/-/g, '') + '-' + (state.rekapHistory.length + 1),
      tanggal: record.tanggal,
      pelaku: user ? user.nama : 'Admin Gudang',
      stokSistem: record.stokSistem,
      hitunganFisik: record.hitunganFisik,
      selisih: record.selisih,
      catatan: record.catatan || 'Rekap harian selesai.'
    };
    state.rekapHistory.unshift(item);
    save();
    return item;
  }

  function saveUser(payload, editId = null) {
    const cleanEmail = payload.email.trim().toLowerCase();
    const dup = state.users.some(u => u.id !== editId && u.email.toLowerCase() === cleanEmail);
    if (dup) return { ok: false, message: 'Email sudah terdaftar pada akun lain.' };

    if (editId) {
      const target = state.users.find(u => u.id === editId);
      if (!target) return { ok: false, message: 'Pengguna tidak ditemukan.' };
      target.nama = payload.nama.trim();
      target.email = cleanEmail;
      target.role = payload.role;
      if (payload.password) target.password = payload.password;
      save();
      return { ok: true, user: target };
    } else {
      const nextNum = String(state.users.length + 1).padStart(2, '0');
      const newUser = {
        id: 'USR-' + nextNum,
        nama: payload.nama.trim(),
        email: cleanEmail,
        password: payload.password || 'lapstock123',
        role: payload.role,
        aktif: true,
        dibuatPada: todayStr()
      };
      state.users.push(newUser);
      save();
      return { ok: true, user: newUser };
    }
  }

  function toggleUserActive(userId) {
    const current = getCurrentUser();
    if (current && current.id === userId) {
      return { ok: false, message: 'Akun milik sendiri tidak dapat dinonaktifkan.' };
    }
    const target = state.users.find(u => u.id === userId);
    if (!target) return { ok: false, message: 'Akun tidak ditemukan.' };
    target.aktif = !target.aktif;
    save();
    return { ok: true, user: target };
  }

  function changePassword(oldPass, newPass) {
    const user = getCurrentUser();
    if (!user) return { ok: false, field: 'old', message: 'Sesi pengguna tidak valid.' };
    if (user.password !== oldPass) return { ok: false, field: 'old', message: 'Kata sandi lama tidak sesuai.' };
    if (newPass.length < 6) return { ok: false, field: 'new', message: 'Kata sandi baru minimal 6 karakter.' };
    user.password = newPass;
    save();
    return { ok: true };
  }

  // Formatting utilities
  function formatRupiah(num) {
    const n = Number(num) || 0;
    return 'Rp ' + n.toLocaleString('id-ID');
  }

  function parseRupiah(str) {
    return parseInt(String(str || '').replace(/[^\d]/g, ''), 10) || 0;
  }

  function statusBadge(status) {
    const map = {
      'Tersedia': 'badge-success',
      'Selesai': 'badge-success',
      'Dalam Inspeksi': 'badge-info',
      'Menunggu Komponen': 'badge-warning',
      'Instalasi': 'badge-purple',
      'Terjual': 'badge-neutral',
      'Nonaktif': 'badge-danger'
    };
    const cls = map[status] || 'badge-neutral';
    return `<span class="badge ${cls}"><span class="badge-dot"></span>${status}</span>`;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return {
    ROLE_INFO,
    GRADE_INFO,
    getState,
    save,
    reset,
    getCurrentUser,
    getCurrentRole,
    switchRoleDemo,
    login,
    logout,
    getUnitById,
    isSerialDuplicate,
    addUnit,
    updateUnit,
    deactivateUnit,
    updateTechStatus,
    addModification,
    addToCart,
    removeFromCart,
    clearCart,
    createTransaction,
    saveRekap,
    saveUser,
    toggleUserActive,
    changePassword,
    formatRupiah,
    parseRupiah,
    statusBadge,
    escapeHtml,
    todayStr,
    nowStr
  };
})();
