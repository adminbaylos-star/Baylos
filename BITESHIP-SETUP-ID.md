# Baylos — Panduan setup Biteship + Supabase (Indonesia)

## Status paket
Frontend Baylos saat ini tetap menyertakan mode demo browser (`localStorage`) agar halaman dan alur UI bisa dicoba tanpa akun cloud. Login demo bukan autentikasi produksi. Data demo tidak sinkron antar perangkat dan tidak boleh dipakai untuk transaksi nyata.

Paket ini menambahkan kerangka aman untuk integrasi ongkir Biteship. Endpoint sengaja menolak request jika secret/konfigurasi belum disetel. Integrasi live baru aktif setelah database, Supabase Auth, fungsi Edge, dan Biteship API key dikonfigurasi serta diuji.

## 1. Buka proyek
- Ekstrak ZIP.
- Buka `index.html` untuk mencoba demo UI, atau deploy isi folder sebagai static site.
- Jangan mengandalkan kredensial demo untuk autentikasi produksi. Gunakan akun Supabase Auth yang benar dan role yang divalidasi di backend.
- Mode demo/browser bukan autentikasi produksi; jangan gunakan untuk transaksi nyata atau data pelanggan.

## 2. Supabase
1. Pastikan proyek `baylos-s` dan tabel yang sudah ada tetap dipertahankan.
2. Periksa tipe `orders.id` sebelum membuat tabel shipment. SQL contoh ada di `supabase/migrations/20261010_shipments.sql` dan mengasumsikan `orders.id` adalah UUID.
3. Deploy fungsi dengan Supabase CLI dari folder repo.
4. Atur secrets dari terminal/CI, jangan taruh secret di HTML atau GitHub:
   - `BITESHIP_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (hanya server/Edge Function)
   - `BAYLOS_ADMIN_USER_IDS` (UUID user admin yang diverifikasi manual, dipisahkan koma)
5. Aktifkan verifikasi JWT untuk `shipping-rates` dan `admin-create-shipment`. Webhook memerlukan verifikasi tanda tangan sesuai konfigurasi Biteship akun Anda sebelum menerima event; endpoint contoh menolak jika `BITESHIP_WEBHOOK_SECRET` tidak disetel.

## 3. Asal pengiriman
Sebelum memakai tarif ongkir, masukkan alamat gudang Baylos yang sebenarnya dan kode area Biteship yang dikonfirmasi dari endpoint area resmi. Jangan menebak kode area. Konfigurasi disediakan melalui secret `BITESHIP_ORIGIN_AREA_ID` dan `BITESHIP_ORIGIN_POSTAL_CODE`.

## 4. Yang belum boleh dianggap live
- Login, role admin, persetujuan reseller, order, pembayaran, stok dan tarif di frontend lama masih demo.
- Jangan mengaktifkan create shipment untuk order demo. Fungsi pembuatan shipment memerlukan order valid dan status pembayaran yang sudah diverifikasi server.
- Biteship webhook signature/authenticity harus disesuaikan dengan metode resmi yang berlaku untuk akun Anda. Kerangka ini fail-closed dan tidak mengklaim signature sudah diverifikasi otomatis.
- Uji tarif, order, duplikasi request, kegagalan provider, status pembayaran, webhook berulang, dan akses pengguna sebelum produksi.

Dokumentasi resmi: https://biteship.com/id/docs/api · https://biteship.com/id/docs/api/rates · https://biteship.com/id/docs/api/orders · https://biteship.com/id/docs/api/webhook/overview · https://supabase.com/docs/guides/functions/secrets
