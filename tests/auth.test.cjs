const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(new URL('../web/baylos-supabase.js', `file://${__filename}`), 'utf8');
const calls = [];
const client = { auth: {
  signInWithOAuth: async args => { calls.push(args); return { data: { provider: args.provider }, error: null }; },
  signInWithPassword: async args => { calls.push({ passwordLogin: args }); return { data: { user: { id: 'test' } }, error: null }; },
  signUp: async () => ({ data: {}, error: null }), signOut: async () => ({ error: null }),
  getSession: async () => ({ data: { session: null }, error: null })
}};
const window = {
  BAYLOS_SUPABASE_CONFIG: { url: 'https://example.supabase.co', publishableKey: 'sb_publishable_test' },
  location: { origin: 'https://baylos.example', pathname: '/web/storefront.html' },
  supabase: { createClient: () => client }
};
vm.runInNewContext(source, { window, console });
(async () => {
  assert.equal(window.BaylosAPI.ready, true);
  await window.BaylosAPI.signInWithOAuth('google');
  await window.BaylosAPI.signInWithOAuth('facebook');
  await window.BaylosAPI.signInWithOAuth('github');
  assert.deepEqual(calls.slice(0, 3).map(x => x.provider), ['google', 'facebook', 'github']);
  assert.equal(calls[0].options.redirectTo, 'https://baylos.example/web/storefront.html');
  await assert.rejects(() => window.BaylosAPI.signInWithOAuth('unknown-provider'), /tidak didukung/);
  await window.BaylosAPI.signIn(' TEST@example.com ', 'valid-password');
  assert.equal(calls[3].passwordLogin.email, 'test@example.com');
  await assert.rejects(() => window.BaylosAPI.signIn('bukan-email', 'x'), /email yang valid/);
  console.log('PASS: OAuth allowlist, redirect, email normalization, and invalid-input checks.');
})().catch(e => { console.error(e); process.exitCode = 1; });
