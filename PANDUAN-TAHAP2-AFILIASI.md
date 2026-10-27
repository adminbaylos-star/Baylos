# Baylos Afiliasi — Tahap 2: Dashboard pengguna

## Yang benar-benar ditambahkan
- `web/affiliate-dashboard.html` dan `web/affiliate-dashboard.js`: dashboard status afiliasi, pemeriksaan sesi, pembatasan tampilan berdasarkan status pengajuan, katalog produk asli.
- Tautan dashboard dari menu profil `index.html`.
- Angka klik, penjualan, dan komisi **tidak dipalsukan**: tampil `—` sampai backend transaksi/atribusi tersedia.

## Pemasangan
Unggah `index.html` dan folder `web` dari paket ini ke branch `supabase-integration` dengan struktur folder tetap. Jangan hapus file lain atau ubah branch `main`. Jangan jalankan migrasi SQL yang masih draf.

## Batasan penting
- `affiliate_applications` belum tersedia jika SQL belum diterapkan. Dashboard akan menampilkan pesan yang jelas.
- Link pelacakan, atribusi, perhitungan dan pencairan komisi belum diaktifkan. Pengujian keamanan KTP wajib sebelum menerima dokumen asli.
- Migrasi draf sebelumnya menyimpan NIK mentah: **jangan jalankan di produksi** tanpa desain perlindungan data, retensi, kontrol akses, dan audit yang memadai.
- Login dan hak akses tetap bergantung pada konfigurasi dan RLS Supabase.

## Uji cepat
1. Buka marketplace, login sebagai pengguna, pilih Akun → Dashboard & Status Afiliasi.
2. Jika tabel belum tersedia, pastikan pesan konfigurasi terlihat, bukan formulir KTP yang bisa digunakan.
3. Setelah backend aman dan disiapkan, uji status pending, approved, rejected menggunakan akun uji (tanpa KTP asli).
