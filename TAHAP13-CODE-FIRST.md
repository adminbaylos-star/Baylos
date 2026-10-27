TAHAP 13 — CODE-FIRST PERSIAPAN BAYLOS

Tujuan: melanjutkan kode tanpa menjalankan SQL atau mengubah database.

Perubahan tahap ini:
- Menambahkan web/baylos-validation.js sebagai utilitas validasi input bersama.
- Memuat utilitas tersebut di index.html.
- Tidak menjalankan migrasi, tidak mengubah tabel, dan tidak menghapus data.

Utilitas tersedia melalui window.BaylosValidation: text, required, email, phone, quantity, rupiah, httpsUrl, postalCode, escapeHtml. Validasi browser hanya untuk pengalaman pengguna; backend tetap wajib memvalidasi ulang.

PENTING: file helper belum menggantikan validasi tiap formulir dan belum berarti semua fitur telah aktif. Tahap selanjutnya adalah menerapkan helper ini pada formulir akun, profil, produk dan checkout, lalu mengaudit tiap alur.

JANGAN jalankan SQL sekarang. Seluruh SQL/migrasi akan dikumpulkan, direview, dan dijalankan bersama setelah kode siap. Jangan pernah memasukkan service_role/secret key ke file web.
