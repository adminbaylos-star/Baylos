BAYLOS — TAHAP 11: GALERI PRODUK INTERAKTIF

Perbaikan konkret pada web/storefront.html:
- Foto di detail produk sekarang dapat diketuk untuk membuka tampilan zoom.
- Daftar foto yang dipakai zoom diisi dari foto utama + product_images yang tersedia.
- Tombol keyboard panah kiri/kanan mengganti foto saat zoom terbuka.
- Menekan Enter/Spasi pada thumbnail yang fokus membuka zoom.
- Foto yang tidak tersedia menampilkan pesan yang jelas.
- Ukuran gambar zoom di-reset saat berpindah foto agar status zoom sebelumnya tidak terbawa.

CARA PAKAI
1. Ekstrak ZIP ini ke folder baru, jangan timpa proyek lama dulu.
2. Buka web/storefront.html melalui situs GitHub Pages atau server lokal.
3. Buka produk yang memiliki foto; ketuk foto untuk zoom, lalu geser kiri/kanan pada layar atau gunakan tombol panah keyboard.
4. Pastikan URL foto berasal dari storage publik yang memang boleh diakses.

BATASAN PENTING
- Ini memperbaiki interaksi galeri front-end; bukan bukti bahwa Supabase, checkout, pembayaran, ongkir, KTP, atau komisi afiliasi sudah siap produksi.
- Zoom dua kali ketuk tersedia; pinch zoom bergantung pada browser/perangkat. Jangan anggap semua browser mendukung perilaku pinch yang sama.
- Jangan menjalankan file SQL DRAFT/PENDING REVIEW pada database produksi.
