# Tahap 15 — Form Tambah Produk Admin

## Perubahan kode
- Menambahkan form produk baru pada `web/admin-inventory.html`.
- Field nama, kategori, deskripsi, harga, stok awal, foto file, atau URL gambar HTTPS.
- Foto menerima JPG/PNG/WebP sampai 5 MB dan memiliki pratinjau lokal.
- Penyimpanan dilakukan setelah memeriksa sesi login dan RPC `is_baylos_admin`. Produk baru dibuat nonaktif untuk menghindari publikasi sebelum diperiksa.
- File foto diunggah ke bucket `baylos-products` (bisa diganti dengan `window.BAYLOS_PRODUCT_IMAGE_BUCKET`) lalu dicatat ke `product_images`. Jika Storage belum dikonfigurasi, aplikasi akan menampilkan kesalahan; SQL tidak dijalankan otomatis.

## Penting
1. Ini adalah implementasi kode, bukan bukti fitur telah terhubung ke database Anda.
2. Agar upload file berfungsi, bucket Storage dan policies admin harus disiapkan saat tahap SQL akhir. Jangan menaruh service-role key di browser.
3. Produk disimpan dengan `is_active=false`; admin perlu meninjau stok, foto, dan harga lalu mengaktifkannya dari pengaturan produk.
4. Jika skema tabel `products` atau `product_images` di proyek nyata berbeda, sesuaikan setelah audit.
5. Belum melakukan uji end-to-end terhadap Supabase produksi; hanya pemeriksaan statis dan sintaks.
