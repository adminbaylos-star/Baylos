/* Baylos checkout adapter. Requires window.BaylosAPI, deployed create-order Edge Function.
   Does not activate payments, shipping, or server checkout. */
(function () {
  'use strict';
  const KEY = 'baylos_pending_checkout_v1';
  const uuid = () => crypto.randomUUID();
  function normalize(items) {
    if (!Array.isArray(items) || items.length < 1 || items.length > 50) throw Error('Keranjang harus berisi 1–50 item.');
    const seen = new Set();
    return items.map(item => {
      const product_id = String(item.product_id || item.id || '');
      const variant_id = item.variant_id == null || item.variant_id === '' ? null : String(item.variant_id);
      const quantity = Number(item.quantity);
      if (!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(product_id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) throw Error('Produk atau jumlah tidak valid.');
      if (variant_id && !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(variant_id)) throw Error('ID varian tidak valid.');
      const key = `${product_id}:${variant_id || ''}`;
      if (seen.has(key)) throw Error('Item duplikat dalam keranjang.');
      seen.add(key);
      return { product_id, variant_id, quantity };
    });
  }
  function build(order) {
    if (!order || typeof order !== 'object') throw Error('Data pesanan tidak valid.');
    const items = normalize(order.items);
    const recipient_name = String(order.recipient_name || '').trim();
    const recipient_phone = String(order.recipient_phone || '').trim();
    const shipping_address = String(order.shipping_address || '').trim();
    if (recipient_name.length < 2 || recipient_phone.length < 6 || shipping_address.length < 8) throw Error('Lengkapi data penerima.');
    const payment_method = String(order.payment_method || 'manual_transfer');
    if (!['manual_transfer', 'payment_gateway'].includes(payment_method)) throw Error('Metode pembayaran tidak valid.');
    if (payment_method === 'manual_transfer' && !['BCA','BRI','BNI','MANDIRI','BSI'].includes(String(order.payment_bank || ''))) throw Error('Pilih bank transfer yang tersedia.');
    return { items, recipient_name, recipient_phone, shipping_address,
      shipping_postal_code: String(order.shipping_postal_code || '').trim(),
      destination_area_id: String(order.destination_area_id || '').trim(),
      shipping_courier: String(order.shipping_courier || '').trim(),
      shipping_service: String(order.shipping_service || '').trim(),
      payment_method,
      payment_bank: String(order.payment_bank || '').trim(),
      notes: String(order.notes || '').trim() };
  }
  function stable(obj) { return JSON.stringify(obj); }
  async function checkout(order) {
    const client = window.BaylosAPI?.client;
    if (!client) throw Error('Hubungkan Supabase terlebih dahulu.');
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) throw Error('Silakan masuk sebelum checkout.');
    const payload = build(order);
    const fingerprint = stable(payload);
    let pending;
    try { pending = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch { pending = null; }
    if (!pending || pending.user_id !== user.id || pending.fingerprint !== fingerprint) {
      pending = { user_id: user.id, fingerprint, checkout_request_id: uuid() };
      sessionStorage.setItem(KEY, JSON.stringify(pending));
    }
    // No browser prices, totals, weights or shipping costs are submitted.
    const { data, error } = await client.functions.invoke('create-order', {
      body: { ...payload, checkout_request_id: pending.checkout_request_id }
    });
    if (error || !data?.ok || !data?.order) throw Error(data?.error || error?.message || 'Checkout belum tersedia di server.');
    sessionStorage.removeItem(KEY);
    return data.order;
  }
  window.BaylosCheckout = Object.freeze({ checkout, build });
})();
