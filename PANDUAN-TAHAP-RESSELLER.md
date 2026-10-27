# Baylos — Tahap Pengajuan Reseller & Fondasi Afiliasi

## Yang dibuat
- Dashboard Admin memiliki menu **Pengajuan Reseller**.
- Halaman `web/admin-resellers.html` memuat pengajuan dari tabel `reseller_applications` dan menyediakan tombol Setujui/Tolak.
- Tindakan persetujuan mencoba memperbarui `reseller_applications.status`, lalu `profiles.reseller_status`. Keduanya membutuhkan kebijakan RLS yang mengizinkan admin. Jika pembaruan profil gagal setelah pembaruan pengajuan berhasil, admin harus melakukan sinkronisasi; belum ada transaksi atomik.
- Berkas SQL `supabase/migrations/pending-review/20261022_affiliate_design_NOT_APPLIED.sql` adalah rancangan tabel afiliasi dengan dua jenis komisi: percent dan fixed. **Belum diterapkan dan tidak boleh dijalankan tanpa audit skema dan RLS.**

## Belum aktif
- Link afiliasi, atribusi pesanan, pencatatan klik, perhitungan komisi, pencairan, dan status barang diterima memerlukan backend tepercaya.
- Grafik pengunjung dan editor tema belum dibuat pada tahap ini.
- Pembayaran dan checkout produksi belum diaktifkan.

## Instalasi
Unggah seluruh isi `web/` yang berubah ke branch `supabase-integration` dengan struktur yang sama; jangan mengubah `main`, jangan menghapus data lama, dan jangan menjalankan SQL draft. Pengujian dilakukan dengan akun admin asli dan pengajuan uji yang aman.
