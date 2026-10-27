# Langkah aman Baylos + Supabase (HP Android)

## A. Etalase ringkas
`index.html` di paket ini sudah memiliki CSS ringkas untuk etalase. Cek di browser dan bandingkan dengan situs lama. CSS ini hanya mengubah tampilan area `.product-rail`; data produk demo tetap disimpan di file.

## B. Jangan jalankan migrasi tebakan
Proyek `baylos-s` telah memiliki tabel `profiles`, `products`, `product_prices`, `reseller_applications`, `orders`, dan `order_items`. Tabel `products` saat ini kosong. Kolom yang diketahui meliputi `id`, `name`, `slug`, `description`, `category`, `image_url`, `retail_price`, `stock`, `is_active`, `created_at`.

Sebelum memasukkan produk, buka Table Editor dan pastikan apakah `id` memiliki default `gen_random_uuid()` dan `created_at` memiliki default `now()`. Jika default belum ada, jangan impor CSV sampai skemanya dibetulkan dengan SQL yang sesuai.

## C. Data produk
Produk demo dalam HTML memakai struktur yang lebih kaya: `id`/`sku`, `name`, `category`, `msrp`, `stock`, `image`, `images`, `colors`, dan data varian. Jangan mengimpor `sku` sebagai `id` UUID. Pemetaan dasar: `name`→`name`, `category`→`category`, `msrp`→`retail_price`, `stock`→`stock`, `image`→`image_url`, `caption` jika ada→`description`, status aktif→`is_active`. Galeri/warna/ukuran belum memiliki kolom di skema sekarang; jangan buang datanya. Tambahkan kolom JSONB atau tabel varian setelah rancangan disetujui.

## D. Supabase browser config
Setelah siap menghubungkan aplikasi, tambahkan SDK Supabase dan konfigurasi URL + publishable key di branch integrasi. Jangan pernah masukkan `service_role` key, secret key, atau password database ke `index.html`. RLS wajib aktif dan diuji.

## E. Urutan implementasi yang direkomendasikan
1. Etalase compact diuji.
2. Data demo diekspor/dipetakan; produk diimpor tanpa duplikasi.
3. Katalog membaca produk aktif dari Supabase dengan fallback demo jika koneksi gagal selama pengujian.
4. Supabase Auth menggantikan login demo secara terpisah.
5. Pendaftaran reseller, profil, tier pricing, dan approval diuji dengan RLS.
6. Pembuatan order, validasi harga, dan pengurangan stok dipindahkan ke RPC/Edge Function/backend terpercaya; jangan percaya total harga dari browser.
7. Admin dan pembayaran diuji dengan akun/lingkungan uji.
8. Baru setelah semua lolos, pertimbangkan merge ke `main`.

## Jika memakai GitHub lewat HP
Pastikan label branch menunjukkan `supabase-integration`. Buat perubahan/commit hanya pada branch ini. Jangan memilih `main` pada menu branch dan jangan menekan merge.

## Checkout langsung di website
Versi UI terbaru membuat pesanan demo tanpa redirect WhatsApp dan menyimpan nomor pesanan pada browser. Ini belum cloud checkout. Jangan mengisi konfigurasi backend pada HTML sebelum fungsi server `create-order` dibuat, diverifikasi terhadap skema aktual `baylos-s`, dan diuji dengan RLS. Nilai harga, stok, status reseller, voucher, serta total harus dihitung/diterapkan di server/database, bukan dipercayai dari browser.
