/* Baylos Stage 50 — variant-aware cart, browser-side selection only.
   Not a checkout/payment implementation. Server MUST revalidate everything. */
(function () {
  'use strict';
  const KEY = 'baylos_cart_v2';
  const MAX_LINES = 50;
  const MAX_QTY = 100;
  const uuid = x => typeof x === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
  const qty = x => Number.isSafeInteger(x) && x >= 1 && x <= MAX_QTY;
  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter(x => uuid(x.product_id) && (x.variant_id === null || uuid(x.variant_id)) && qty(x.quantity)).slice(0, MAX_LINES);
    } catch { return []; }
  }
  function save(lines) { localStorage.setItem(KEY, JSON.stringify(lines)); window.dispatchEvent(new CustomEvent('baylos:cart-changed', { detail: { count: lines.reduce((s, x) => s + x.quantity, 0) } })); }
  function getClient() { const c = window.BaylosAPI?.client; if (!c) throw Error('Supabase belum terhubung.'); return c; }
  async function choose(productId, variantId, quantity = 1) {
    if (!uuid(productId) || (variantId !== null && !uuid(variantId)) || !qty(quantity)) throw Error('Pilihan produk atau jumlah tidak valid.');
    const c = getClient();
    const { data: p, error: pe } = await c.from('products').select('id,name,stock,is_active').eq('id', productId).single();
    if (pe || !p?.is_active) throw Error('Produk tidak tersedia.');
    const { data: variants, error: ve } = await c.from('product_variants').select('id,product_id,stock,is_active').eq('product_id', productId);
    if (ve) throw Error('Tidak dapat memeriksa varian produk.');
    const allVariants = variants || [];
    const active = allVariants.filter(v => v.is_active);
    let available;
    // If any variants exist, never fall back to main stock when all are inactive.
    if (allVariants.length) {
      if (!variantId) throw Error('Pilih ukuran dan warna terlebih dahulu.');
      const selected = active.find(v => v.id === variantId);
      if (!selected) throw Error('Varian tidak tersedia untuk produk ini.');
      available = selected.stock;
    } else {
      if (variantId !== null) throw Error('Produk ini tidak memiliki varian aktif.');
      available = p.stock;
    }
    const lines = read();
    const existing = lines.find(x => x.product_id === productId && x.variant_id === variantId);
    const total = (existing?.quantity || 0) + quantity;
    if (!qty(total) || total > available) throw Error('Jumlah melebihi stok yang tersedia.');
    if (existing) existing.quantity = total;
    else { if (lines.length >= MAX_LINES) throw Error('Keranjang maksimal 50 jenis barang.'); lines.push({ product_id: productId, variant_id: variantId, quantity }); }
    save(lines);
    return read();
  }
  function remove(productId, variantId = null) { save(read().filter(x => !(x.product_id === productId && x.variant_id === variantId))); }
  function clear() { save([]); }
  function checkoutItems() { return read().map(({ product_id, variant_id, quantity }) => ({ product_id, variant_id, quantity })); }
  window.BaylosVariantCart = Object.freeze({ read, choose, remove, clear, checkoutItems });
})();
