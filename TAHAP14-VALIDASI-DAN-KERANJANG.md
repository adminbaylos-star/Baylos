# Tahap 14 — Validasi Formulir & Fondasi Keranjang

## Tujuan
Meningkatkan keamanan input di sisi browser dan menambahkan uji otomatis untuk helper validasi. Ini bukan pengganti validasi di server/database.

## Perubahan
- Menambahkan `tests/validation.test.cjs` untuk menguji input wajib, email, telepon, jumlah, nominal, URL HTTPS, kode pos, dan escaping HTML.
- Keranjang/checkout tetap menampilkan status belum siap jika endpoint server untuk stok, ongkir, total, dan pembayaran belum tersedia. Jangan menganggap tampilan saja sebagai checkout aktif.

## Menjalankan tes lokal
Perlu Node.js terpasang. Dari folder proyek jalankan:

```sh
node tests/validation.test.cjs
```

Hasil yang diharapkan: `PASS: 16 assertion validasi Baylos.`

## Catatan penting
- Validasi browser hanya untuk kenyamanan pengguna; server wajib mengulangi seluruh pemeriksaan.
- Harga, stok, ongkir, total, dan komisi tidak boleh dipercaya dari browser. Server harus mengambil harga/stok dari database dan menghitung ulang.
- Jangan menyimpan service-role key, rahasia gateway, token Biteship, atau dokumen KTP di JavaScript frontend.
- SQL dan migrasi belum dijalankan pada tahap ini.
