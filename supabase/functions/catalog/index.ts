import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, apikey, content-type, x-client-info",
  "access-control-allow-methods": "GET, OPTIONS",
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "GET") return json({ error: "GET required" }, 405);
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) return json({ error: "Catalog backend is not configured" }, 503);

  const authorization = req.headers.get("Authorization");
  const client = createClient(url, anonKey, {
    global: authorization ? { headers: { Authorization: authorization } } : {},
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: products, error: productError } = await client
    .from("products")
    .select("id,name,slug,description,category,image_url,retail_price,stock,is_active,created_at")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(200);
  if (productError) {
    console.error("catalog query failed", productError.code);
    return json({ error: "Unable to load catalog" }, 500);
  }

  let resellerPrices: Record<string, number> = {};
  let resellerApproved = false;
  if (authorization?.startsWith("Bearer ")) {
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (!authError && user) {
      const { data: profile, error: profileError } = await client
        .from("profiles").select("user_role,reseller_status").eq("id", user.id).maybeSingle();
      if (!profileError && profile?.user_role !== "admin" && profile?.reseller_status === "approved") {
        resellerApproved = true;
        const { data: prices, error: pricesError } = await client
          .from("product_prices").select("product_id,reseller_price");
        if (pricesError) {
          console.error("reseller price query failed", pricesError.code);
          return json({ error: "Unable to load reseller prices" }, 500);
        }
        resellerPrices = Object.fromEntries(
          (prices ?? []).map((row) => [String(row.product_id), Number(row.reseller_price)]),
        );
      }
    }
  }
  return json({ products: products ?? [], reseller_approved: resellerApproved, reseller_prices: resellerPrices });
});
