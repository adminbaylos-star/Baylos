# Tahap 18 — Dashboard Afiliasi UI

## Berkas baru
- `web/affiliate-center-ui.html`: tampilan pusat afiliasi, status, tautan referral, ringkasan komisi, formulir pencairan, dan pintasan verifikasi admin.

## Status jujur
- Ini adalah UI/pratinjau frontend. Tidak mengirim pengajuan atau pembayaran dan tidak membuat angka statistik palsu.
- Tombol pencairan memvalidasi input lalu menjelaskan bahwa backend belum terhubung. Salin/bagikan referral sengaja dinonaktifkan sampai URL referral sah diterbitkan server.
- KTP harus disimpan dalam bucket privat; jangan menggunakan folder publik atau menaruh kunci service-role di browser.
- Belum menjalankan SQL. Migrasi dan kebijakan akses dikumpulkan untuk tahap integrasi akhir.

## Cara melihat
Buka `web/affiliate-center-ui.html` di browser untuk meninjau tampilan. Untuk data nyata, nanti sambungkan melalui fungsi server/RPC yang sudah diaudit.
