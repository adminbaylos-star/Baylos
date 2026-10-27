import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

// Fail-closed scaffold: deliberately performs no database writes until the real schema
// and guest/authenticated checkout requirements have been verified.
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST required" }, 405);
  if (!Deno.env.get("SUPABASE_URL") || !Deno.env.get("SUPABASE_ANON_KEY") ||
      !Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
    return json({ error: "Checkout backend is not configured" }, 503);
  }
  // Before enabling writes, confirm actual orders/order_items/product column types,
  // guest checkout rules, reseller approval, payment state, idempotency and RLS.
  // Production implementation must calculate totals server-side and atomically create
  // order + items + stock reservation using a transaction/RPC. Never trust client totals.
  return json({
    error: "Checkout is disabled until the schema audit and transactional implementation are complete.",
    code: "SCHEMA_AUDIT_REQUIRED",
  }, 409);
});
