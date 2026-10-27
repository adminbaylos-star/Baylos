/* Baylos Supabase integration module. Does not override existing demo UI. */
(function () {
  'use strict';
  const config = window.BAYLOS_SUPABASE_CONFIG || {};
  const ready = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.url || '') &&
    !!config.publishableKey && !config.publishableKey.startsWith('ISI_') &&
    !!window.supabase?.createClient;
  const client = ready ? window.supabase.createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;
  const errorText = e => e?.message || 'Terjadi kesalahan';
  function requireClient() {
    if (!client) throw new Error('Supabase belum dikonfigurasi. Isi web/baylos-supabase-config.js.');
    return client;
  }
  async function signUp(email, password, fullName) {
    const { data, error } = await requireClient().auth.signUp({
      email, password, options: { data: { full_name: fullName || '' } }
    });
    if (error) throw new Error(errorText(error));
    return data;
  }
  async function signIn(email, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail))
      throw new Error('Masukkan alamat email yang valid.');
    if (typeof password !== 'string' || !password) throw new Error('Kata sandi wajib diisi.');
    const { data, error } = await requireClient().auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) throw new Error(errorText(error));
    return data;
  }
  const oauthProviders = new Set(['google', 'facebook', 'github', 'apple', 'azure', 'discord', 'gitlab', 'linkedin_oidc', 'bitbucket', 'spotify', 'slack_oidc', 'workos', 'notion', 'twitch', 'twitter']);
  async function signInWithOAuth(provider) {
    const name = String(provider || '').trim().toLowerCase();
    if (!oauthProviders.has(name)) throw new Error('Provider OAuth tidak didukung.');
    const c = requireClient();
    // Return to the current page; configure this exact origin/path in Supabase URL allow-list.
    const redirectTo = window.location.origin + window.location.pathname;
    const { data, error } = await c.auth.signInWithOAuth({ provider: name, options: { redirectTo } });
    if (error) throw new Error(errorText(error));
    return data;
  }
  async function signOut() {
    const { error } = await requireClient().auth.signOut();
    if (error) throw new Error(errorText(error));
  }
  async function session() {
    const { data, error } = await requireClient().auth.getSession();
    if (error) throw new Error(errorText(error));
    return data.session;
  }
  async function profile() {
    const s = await session();
    if (!s?.user) return null;
    const { data, error } = await requireClient().from('profiles')
      .select('id,full_name,phone,user_role,reseller_status').eq('id', s.user.id).maybeSingle();
    if (error) throw new Error(errorText(error));
    return data;
  }
  async function products() {
    const { data, error } = await requireClient().from('products')
      .select('id,name,slug,description,category,image_url,retail_price,stock,is_active')
      .eq('is_active', true).order('created_at', { ascending: false });
    if (error) throw new Error(errorText(error));
    return data || [];
  }
  async function resellerPrices() {
    const p = await profile();
    if (p?.reseller_status !== 'approved') return [];
    const { data, error } = await requireClient().from('product_prices')
      .select('product_id,reseller_price');
    if (error) throw new Error(errorText(error));
    return data || [];
  }
  async function applyReseller({ business_name, business_address, phone }) {
    const s = await session();
    if (!s?.user) throw new Error('Silakan login terlebih dahulu.');
    if (!business_name?.trim()) throw new Error('Nama usaha wajib diisi.');
    const { data, error } = await requireClient().from('reseller_applications').insert({
      user_id: s.user.id, business_name: business_name.trim(),
      business_address: business_address || null, phone: phone || null,
      status: 'pending'
    }).select().single();
    if (error) throw new Error(errorText(error));
    return data;
  }
  async function orders() {
    const s = await session();
    if (!s?.user) throw new Error('Silakan login terlebih dahulu.');
    const { data, error } = await requireClient().from('orders')
      .select('id,status,payment_method,payment_status,subtotal,shipping_cost,total,created_at,tracking_number')
      .eq('customer_id', s.user.id).order('created_at', { ascending: false });
    if (error) throw new Error(errorText(error));
    return data || [];
  }
  async function checkout(order) {
    const s = await session();
    if (!s?.access_token) throw new Error('Silakan login terlebih dahulu.');
    if (!Array.isArray(order?.items) || !order.items.length) throw new Error('Keranjang kosong.');
    // Server must calculate price, stock and shipping. Do not send browser totals.
    const payload = {
      items: order.items.map(x => ({ product_id: x.product_id || x.id, quantity: Number(x.quantity) })),
      recipient_name: order.recipient_name,
      recipient_phone: order.recipient_phone,
      shipping_address: order.shipping_address,
      shipping_postal_code: order.shipping_postal_code || '',
      shipping_courier: order.shipping_courier || '',
      shipping_service: order.shipping_service || '',
      payment_method: order.payment_method || 'manual_transfer',
      notes: order.notes || ''
    };
    if (!payload.recipient_name || !payload.recipient_phone || !payload.shipping_address)
      throw new Error('Nama, telepon, dan alamat penerima wajib diisi.');
    const { data, error } = await requireClient().functions.invoke('create-order', { body: payload });
    if (error || !data?.ok) throw new Error(data?.error || errorText(error) || 'Checkout belum aktif di server.');
    return data.order;
  }
  window.BaylosAPI = Object.freeze({ ready, client, signUp, signIn, signInWithOAuth, signOut, session, profile, products,
    resellerPrices, applyReseller, orders, checkout });
  if (!ready) console.info('[Baylos] Isi konfigurasi publik Supabase untuk mengaktifkan modul API.');
})();
