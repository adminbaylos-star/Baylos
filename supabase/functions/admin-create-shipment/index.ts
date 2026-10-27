// Fail-closed: shipment creation remains disabled until this project's real order/payment schema is validated.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const json=(b:unknown,s=200)=>new Response(JSON.stringify(b),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
serve(async(req)=>{
 if(req.method!=="POST") return json({error:"POST required"},405);
 const url=Deno.env.get("SUPABASE_URL"), anon=Deno.env.get("SUPABASE_ANON_KEY"), service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), key=Deno.env.get("BITESHIP_API_KEY");
 if(!url||!anon||!service||!key) return json({error:"Server integration is not configured"},503);
 const auth=req.headers.get("Authorization"); if(!auth)return json({error:"Authentication required"},401);
 const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}}); const {data:{user},error}=await userClient.auth.getUser(); if(error||!user)return json({error:"Invalid session"},401);
 const admins=(Deno.env.get("BAYLOS_ADMIN_USER_IDS")||"").split(",").map(x=>x.trim()).filter(Boolean); if(!admins.includes(user.id))return json({error:"Admin access required"},403);
 return json({error:"Shipment creation disabled until trusted order/payment/address validation is implemented for the actual schema."},409);
});
