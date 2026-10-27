# BAYLOS — Tahap 10: Audit integrasi dan uji awal

## Hasil pemeriksaan statis
- Arsip Tahap 9 berhasil diekstrak dan pemeriksaan integritas ZIP lulus.
- Semua berkas JavaScript di folder `web/` lolos pemeriksaan sintaks `node --check`.
- Etalase utama `index.html` memiliki pencarian produk, detail produk, pilihan varian, keranjang lokal, login/daftar Supabase, dan UI galeri foto. Ini adalah hasil pemeriksaan kode, bukan bukti alur berhasil di browser atau perangkat nyata.

## Belum boleh dianggap selesai
- Checkout/pembuatan pesanan belum aktif; halaman secara eksplisit memberi tahu bahwa checkout menunggu validasi server.
- Payment gateway dan ongkir/pelacakan kurir belum diverifikasi end-to-end.
- Persetujuan afiliasi/KTP, komisi, dan pembayaran komisi belum boleh dianggap aktif atau aman hanya karena file halaman/script tersedia.
- Role admin, RLS, Storage privat untuk KTP, dan seluruh kebijakan Supabase perlu audit terhadap schema produksi sebelum migrasi apa pun dijalankan.
- Galeri hanya dapat menampilkan foto yang benar-benar tersedia pada `products.image_url` atau tabel gambar terkait. Foto tidak otomatis dibuat jika data gambar kosong.

## Cara uji aman
1. Buat/cek branch uji di GitHub; jangan timpa `main` dulu.
2. Jangan jalankan file SQL bernama DRAFT atau PENDING REVIEW pada database produksi.
3. Buka halaman etalase di browser dan cek: muat ulang, pencarian, detail produk, thumbnail, foto utama, tombol perbesar, navigasi foto, pilihan varian, tambah/hapus keranjang, login, daftar, dan logout.
4. Cek Console/Network. Catat pesan error dan respons Supabase tanpa membagikan password, service-role key, token sesi, atau data KTP.
5. Uji dengan akun non-admin dan akun admin terpisah. Pastikan akun non-admin tidak dapat membuka fungsi admin hanya dengan mengetik URL.
6. Jangan menerima atau menyimpan foto KTP sampai bucket privat, policy Storage, dan akses admin sudah ditinjau.

## Integrasi yang perlu diselesaikan berikutnya
1. Audit konfigurasi Supabase publik (`web/baylos-supabase-config.js`) dan koneksi Auth.
2. Audit schema aktual, role admin, RLS dan policy tabel yang dipakai aplikasi.
3. Selesaikan checkout melalui server/Edge Function dengan validasi harga, stok, varian dan total di server.
4. Hubungkan penyedia pembayaran dan pengiriman hanya setelah kredensial disimpan sebagai secrets server-side.
5. Implementasikan afiliasi dengan atribusi referral dan perhitungan komisi server-side, status order yang jelas, idempotensi, dan pembatalan/refund.

**Peringatan:** Tahap 10 ini paket audit awal. Ini tidak menyatakan bahwa integrasi Supabase, pembayaran, pengiriman, atau afiliasi sudah lulus pengujian end-to-end.
