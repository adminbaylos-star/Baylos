// Fail-closed placeholder. Implement the exact verification method configured in the Biteship account.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
serve(async(req)=>{
 if(req.method!=="POST") return new Response("POST required",{status:405});
 if(!Deno.env.get("BITESHIP_WEBHOOK_SECRET")) return new Response("Webhook verification is not configured",{status:503});
 return new Response("Webhook verification and event deduplication adapter must be configured before activation",{status:501});
});
