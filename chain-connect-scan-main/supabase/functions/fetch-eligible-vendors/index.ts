import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const adminClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const plan = url.searchParams.get("plan") ?? undefined;

    // Use the existing eligible_boost_vendors view
    let query = adminClient.from("eligible_boost_vendors").select("vendor_id, plan_tier, end_date");
    
    if (plan) {
      query = query.eq("plan_tier", plan);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching eligible vendors:", error);
      return new Response(JSON.stringify({ ok: false, error: error.message }), { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ ok: true, data }), { 
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  } catch (e) {
    console.error("Unexpected error:", e);
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), { 
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" }
    });
  }
});