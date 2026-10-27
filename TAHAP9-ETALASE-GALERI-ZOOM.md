# Baylos Tahap 9 — Etalase dan Galeri Produk

Paket ini berbasis paket Baylos marketplace/afiliasi yang tersedia di percakapan, bukan hasil audit langsung dari situs GitHub Pages.

## Pembaruan
- Galeri detail produk mengambil foto dari `products.image_url` dan `product_images`.
- Thumbnail bisa dipilih; foto utama bisa diketuk untuk dibuka besar.
- Dialog foto mendukung gerakan pinch-to-zoom browser, double tap sederhana, dan geser kiri/kanan untuk foto berikutnya/sebelumnya.
- Tampilan galeri dan foto kosong dibuat lebih responsif untuk layar kecil.

## Batasan yang harus diketahui
- Galeri hanya menampilkan foto yang sudah ada di database; paket ini tidak membuat tiga foto palsu. Admin perlu menambahkan minimal tiga URL foto HTTPS di `product_images` untuk produk yang ingin memiliki tiga foto.
- Checkout, pembayaran, ongkir, tracking, dan komisi afiliasi tidak dinyatakan aktif hanya karena paket ini dipasang. Dalam versi sumber, checkout masih ditandai belum siap.
- Integrasi dan tombol lain tetap perlu diuji pada deployment aktual. Paket ini adalah pembaruan etalase/galeri, bukan klaim semua sistem backend telah selesai.

## Pasang dengan aman
1. Simpan salinan repo/branch sekarang.
2. Pasang isi ZIP pada branch pengujian, bukan `main`.
3. Jangan menimpa konfigurasi Supabase milik Anda dengan placeholder.
4. Uji halaman utama, buka detail produk, pilih thumbnail, ketuk foto utama, zoom, geser foto, dan uji pada HP.
5. Pastikan jalur foto benar-benar HTTPS dan kebijakan akses database sudah sesuai.
