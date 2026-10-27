# Operasional Admin Marketplace Baylos

## Halaman admin
- `web/admin-dashboard.html`: pusat navigasi admin.
- `web/admin-inventory.html`: tambah produk, edit data/harga/stok, publikasi, varian, dan galeri foto. Upload file langsung bergantung pada konfigurasi Supabase Storage.
- `web/admin-orders.html`: daftar dan filter pesanan, detail penerima/item, ekspor CSV, dan cetak ringkasan. Status pesanan masih baca-saja; data resi saat ini draf lokal, bukan update server.
- `web/admin-analytics.html`: ringkasan pesanan, pendapatan pesanan selesai dan paid, rata-rata nilai pesanan, stok nol, status pesanan, tren 7 hari, dan item terbanyak. Membaca maksimal 500 pesanan terbaru.
- `web/admin-affiliates.html`: alur pengajuan afiliasi pengguna.

## Yang harus diverifikasi sebelum operasi produksi
1. Jalankan audit SQL `supabase/schema-current-project.sql` di Supabase SQL Editor dan simpan hasilnya.
2. Pastikan RLS aktif dan semua operasi tulis dibatasi role admin di server; jangan mengandalkan pemeriksaan UI saja.
3. Siapkan bucket Storage privat/publik sesuai kebutuhan dan policy upload admin, lalu uji unggah/hapus gambar.
4. Implementasikan RPC/Edge Function tervalidasi untuk transisi status order dan simpan kurir, layanan, resi, serta riwayat perubahan ke database.
5. Integrasikan penyedia pembayaran dan pengiriman melalui backend/webhook tervalidasi; jangan menandai pembayaran lunas berdasarkan input browser.
6. Tambahkan tabel event analytics dan persetujuan privasi untuk pengunjung, halaman dilihat, referral, serta funnel checkout. Halaman analytics saat ini tidak mengarang angka pengunjung.
7. Uji stok secara transaksional di server agar dua checkout bersamaan tidak menjual stok yang sama.

Tidak ada migrasi database yang dijalankan dalam pembaruan ini. Fitur yang membutuhkan skema/provider belum diverifikasi sengaja tetap nonaktif atau baca-saja.
