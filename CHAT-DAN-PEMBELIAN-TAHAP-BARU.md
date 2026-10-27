# Baylos — Chat admin & tampilan pembelian

## Yang ditambahkan
- Tiga aksi di detail produk: Chat admin, Keranjang, Pesan sekarang.
- Chat produk membuat percakapan di database untuk akun yang sudah masuk.
- Halaman admin-chat.html untuk admin melihat chat dan membalas.
- Migrasi SQL untuk tabel chat dan kebijakan RLS.

## WAJIB sebelum chat aktif
1. Buka Supabase project `baylos-s` → SQL Editor → New query.
2. Jalankan seluruh isi `supabase/migrations/20261025_customer_admin_chat.sql` satu kali.
3. Pastikan akun admin memiliki `profiles.user_role = 'admin'`.
4. Unggah isi proyek ini ke branch `supabase-integration`, termasuk file baru `web/admin-chat.html` dan migrasi SQL. Jangan unggah ZIP sebagai satu file.
5. Uji dengan akun pelanggan untuk membuat chat, lalu login sebagai admin dan buka `web/admin-chat.html`.

## Catatan checkout
Tombol Pesan sekarang menambahkan item ke keranjang dan menunjukkan status kesiapan checkout. Ia sengaja tidak membuat pesanan palsu: checkout final masih memerlukan endpoint server yang memvalidasi stok, ongkir, dan pembayaran.
