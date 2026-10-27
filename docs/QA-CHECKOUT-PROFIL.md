# QA checkout dan profil Baylos

## Yang sudah diperbarui
- Detail produk: pilih varian/jumlah, tambah ke keranjang, chat admin, dan Pesan sekarang.
- Pesan sekarang menyimpan pilihan ke keranjang lalu membuka checkout.
- Keranjang membuka checkout setelah pengguna memilih lanjut.
- Checkout: alamat, jasa kirim, layanan, metode pembayaran, pilihan bank untuk transfer, ringkasan produk, dan penyerahan permintaan ke server.
- Profil pengguna memakai Supabase Auth dan tabel `profiles` bila konfigurasi, data, serta RLS tersedia.

## Pemeriksaan
- `node scripts/check-js.cjs`: lulus.
- `node tests/validation.test.cjs`: 16 assertion lulus.
- Referensi lokal HTML: 0 rusak.

## Syarat sebelum transaksi produksi
1. Pastikan migrasi dan kebijakan RLS `profiles`, `orders`, `order_items`, `product_variants`, dan `chat_*` telah ditinjau.
2. Deploy dan uji Edge Function `create-order` dengan stok/harga dihitung ulang di server dan idempotency key.
3. Hubungkan penyedia kurir untuk tarif dan resi; opsi kurir saat ini adalah pilihan antarmuka, bukan kuotasi tarif live.
4. Masukkan rekening Baylos yang benar ke konfigurasi tepercaya/admin; jangan mengandalkan nama bank pilihan sebagai instruksi transfer.
5. Hubungkan payment gateway resmi dan webhook untuk status pembayaran. Jangan mengaktifkan konfirmasi otomatis dari browser.
6. Uji end-to-end menggunakan produk uji, akun customer dan admin, termasuk stok habis, pesanan duplikat, gagal bayar, refund, dan akses pengguna lain.
