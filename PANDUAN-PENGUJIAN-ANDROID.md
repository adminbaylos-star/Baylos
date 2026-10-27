# Baylos — Panduan pengujian Android (paket kandidat, bukan rilis produksi)

## Penting
Paket ini adalah gabungan kode lokal tahap 81. Checkout, payment gateway, dan pembuatan pengiriman masih dinonaktifkan. **Jangan menerima transaksi sungguhan.** Tidak ada SQL yang perlu dijalankan untuk uji tampilan awal. Jangan jalankan semua migrasi sekaligus: sebagian masih di `supabase/migrations/pending-review/` dan belum diaudit terhadap database aktif.

## 1. Pasang di branch aman
1. Di HP Android buka GitHub, repo `baylosshop-arch/Baylos.id`.
2. Pastikan memilih branch `supabase-integration`, **bukan `main`**.
3. Simpan cadangan branch terlebih dahulu. Unggah isi folder proyek ZIP ke akar branch, **bukan folder pembungkus**. Jangan menimpa file tanpa membandingkan perubahan jika ada commit baru.
4. GitHub Pages harus dikonfigurasi untuk menayangkan branch yang ingin diuji. Jika Pages masih memakai `main`, uji melalui preview lokal/hosting staging, bukan situs publik utama.

## 2. Uji tampilan tanpa transaksi
- Buka `web/storefront.html` di URL staging/Pages. Periksa katalog, pencarian, detail, galeri, pilihan varian, dan keranjang.
- Buka `web/checkout.html`. Pastikan item dan subtotal *perkiraan* tampil. **Tombol checkout wajib tetap nonaktif**.
- Buka `web/my-orders.html`. Uji login dan riwayat pesanan dengan akun uji; bila tidak ada pesanan, halaman kosong adalah wajar.
- Buka `web/admin-inventory.html` dan `web/admin-orders.html` menggunakan akun admin uji. Pastikan akun nonadmin tidak memperoleh akses administratif. Jangan gunakan stok sementara 120000 sebagai stok riil.
- Coba di Chrome Android: mode normal dan samaran, layar portrait, koneksi lambat, refresh halaman, logout/login, dan keranjang kosong.

## 3. Uji keamanan / kegagalan yang diharapkan
- Pengunjung anonim tidak dapat mengakses data pesanan pengguna lain.
- Pelanggan biasa tidak dapat mengubah produk, varian, stok, harga reseller, atau status pembayaran melalui Supabase.
- Produk/varian tidak aktif tidak bisa dimasukkan ke keranjang.
- Checkout tidak membuat order; Edge Function `create-order` memang masih mengembalikan error penolakan.
- `admin-create-shipment` dan `biteship-webhook` belum siap menerima pengiriman riil.

## 4. Setelah kode selesai: urutan aktivasi produksi (belum dilakukan)
1. Audit struktur Supabase menggunakan SQL read-only `supabase/migrations/pending-review/02_baylos_preflight_readonly.sql`.
2. Tinjau konflik dengan migrasi lama dan buat cadangan database; jalankan hanya migrasi yang sesuai dan sudah disetujui.
3. Verifikasi stok fisik, berat produk, RLS, role admin dan harga reseller.
4. Uji transaksi atomik, checkout berulang, dua pembeli berebut stok, dan pembatalan pada database staging.
5. Sambungkan Biteship dengan API key server-side, verifikasi tarif/quote, pembuatan shipment dan webhook terautentikasi.
6. Tentukan payment gateway, pasang kredensial server-side, verifikasi signature webhook dan rekonsiliasi status pembayaran.
7. Jalankan pengujian end-to-end staging, lalu baru aktifkan checkout produksi.

## Catatan keamanan
`web/baylos-supabase-config.js` memuat publishable key (boleh publik). Jangan pernah menaruh service_role, Biteship API key, atau payment gateway secret di file web/GitHub Pages. Jangan mengunggah kredensial pribadi ke chat.
