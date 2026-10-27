# Baylos — Marketplace, Reseller, dan Admin

Paket ini mempertahankan struktur aplikasi yang dikirim, termasuk halaman utama, portal, modul `web/`,
Supabase Edge Functions, migrasi SQL, dan tes. Perapihan dilakukan secara konservatif agar alur utama
tidak rusak.

## Mulai dari sini

- `portal.html` — portal marketplace yang memuat alur katalog dan panel terkait.
- `index.html` — halaman storefront ringan.
- `web/storefront.html` — storefront alternatif/modul web; dipertahankan karena rute dan referensinya belum
  cukup untuk menyatakan file ini aman dihapus.
- `web/` — halaman dan modul akun, checkout, admin, reseller/afiliasi, dan chat.
- `supabase/` — Edge Functions, audit skema, dan migrasi database.
- `tests/validation.test.cjs` — pengujian validasi dasar.
- `RELEASE-CHECKLIST.md` — checklist sebelum rilis.
- `SUPABASE-NEXT-STEPS-ID.md` dan `BITESHIP-SETUP-ID.md` — panduan integrasi.

## Pengujian lokal

Membutuhkan Node.js untuk menjalankan tes validasi:

```bash
npm test
```

Pemeriksaan sintaks JavaScript (opsional):

```bash
npm run check:js
```

Halaman HTML dapat dibuka untuk pemeriksaan UI, tetapi login dan transaksi nyata tetap bergantung pada
konfigurasi layanan backend dan kebijakan keamanan yang benar.

## Status penting sebelum produksi

- Jangan gunakan kredensial demo atau menganggap login browser/localStorage sebagai autentikasi produksi.
- `supabase/functions/create-order/index.ts` sengaja menolak pembuatan order dengan `SCHEMA_AUDIT_REQUIRED`
  sampai skema aktual dan transaksi database yang aman diverifikasi. Jangan mengaktifkan checkout live
  hanya dengan mengisi konfigurasi frontend.
- File SQL dalam `supabase/migrations/pending-review/`, atau yang berlabel `DRAFT` / `NOT_APPLIED`, adalah
  bahan tinjauan dan **bukan** instruksi untuk langsung dijalankan di database produksi.
- Payment gateway harus dibuat dan diverifikasi dari backend/webhook; redirect browser saja bukan bukti bayar.
- Biteship dan secret lainnya hanya boleh disimpan di Supabase Function Secrets/server, bukan HTML/JS publik.
- `web/baylos-supabase-config.js` hanya boleh memuat URL Supabase dan publishable/anon key. Jangan taruh
  `service_role`, secret payment, atau API key pengiriman di sana.
- Tinjau `RELEASE-CHECKLIST.md` sebelum rilis.

## Catatan perapihan

- File sementara `web/Hapusini` dihapus karena hanya berisi angka `123` dan tidak dirujuk oleh halaman lokal.
- File aplikasi dan dokumentasi tahap dipertahankan apabila belum terbukti aman dihapus.
- Tidak ada migrasi database yang dijalankan, konfigurasi Supabase tidak diganti, dan checkout tidak diaktifkan
  oleh proses perapihan ini.
