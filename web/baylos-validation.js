/* Baylos Tahap 13: shared client-side validation helpers.
 * Client validation improves UX only; server/database must validate again.
 */
(function () {
  'use strict';
  const text = (value, max = 200) => String(value ?? '').trim().slice(0, max);
  function required(value, label, max = 200) {
    const result = text(value, max);
    if (!result) throw new Error(label + ' wajib diisi.');
    return result;
  }
  function email(value) {
    const result = text(value, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result)) throw new Error('Format email belum benar.');
    return result;
  }
  function phone(value) {
    const result = text(value, 30);
    const digits = result.replace(/[\s().+-]/g, '');
    if (!/^\d{8,15}$/.test(digits)) throw new Error('Nomor telepon harus berisi 8–15 digit.');
    return result;
  }
  function quantity(value, max = 100) {
    const n = Number(value);
    if (!Number.isSafeInteger(n) || n < 1 || n > max) throw new Error('Jumlah barang tidak valid.');
    return n;
  }
  function rupiah(value) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0 || n > 1_000_000_000_000) throw new Error('Nominal tidak valid.');
    return Math.round(n);
  }
  function httpsUrl(value) {
    const result = text(value, 2048);
    let url;
    try { url = new URL(result); } catch { throw new Error('URL tidak valid.'); }
    if (url.protocol !== 'https:') throw new Error('URL harus menggunakan HTTPS.');
    return url.href;
  }
  function postalCode(value) {
    const result = text(value, 12);
    if (result && !/^[0-9A-Za-z -]{3,12}$/.test(result)) throw new Error('Kode pos tidak valid.');
    return result;
  }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch]);
  }
  window.BaylosValidation = Object.freeze({ text, required, email, phone, quantity, rupiah, httpsUrl, postalCode, escapeHtml });
})();
