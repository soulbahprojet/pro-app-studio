import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FACEBOOK_PAGE_ID = Deno.env.get("FACEBOOK_PAGE_ID")!;
const FACEBOOK_PAGE_TOKEN = Deno.env.get("FACEBOOK_PAGE_TOKEN")!;
const PUBLIC_BASE_URL = Deno.env.get("PUBLIC_BASE_URL") || "https://224solutions.com";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const adminClient = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

type Body = {
  plan?: "basic" | "pro" | "premium";
  vendor_ids?: string[];
  limitPerVendor?: number;
  dryRun?: boolean;
};

type Vendor = { 
  vendor_id: string; 
  plan_tier: string; 
  end_date: string | null;
};

type Product = {
  id: string;
  title?: string | null;
  name?: string | null;
  description?: string | null;
  images?: string[] | null;
  is_active?: boolean | null;
  seller_id?: string | null;
};

async function fetchEligibleVendors(plan?: string, vendorIds?: string[]): Promise<Vendor[]> {
  let query = adminClient.from("eligible_boost_vendors").select("vendor_id, plan_tier, end_date");

  if (plan) query = query.eq("plan_tier", plan);
  if (vendorIds && vendorIds.length > 0) query = query.in("vendor_id", vendorIds);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Vendor[];
}

async function fetchTopProductsForVendor(vendorId: string, limit: number): Promise<Product[]> {
  const { data, error } = await adminClient
    .from("products")
    .select("id, title, name, description, images, is_active, seller_id")
    .eq("seller_id", vendorId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as Product[];
}

function buildMessage(vendor: Vendor, product: Product): string {
  const productTitle = product.title || product.name || "Nouveau produit";
  const link = `${PUBLIC_BASE_URL}/marketplace`;
  
  const lines = [
    `🔥 Coup de projecteur 224Solutions (${vendor.plan_tier.toUpperCase()})`,
    `• ${productTitle}`,
    product.description ? `• ${product.description.substring(0, 100)}...` : undefined,
    `👉 Découvrir sur: ${link}`,
    "#224Solutions #Commerce #Guinée"
  ].filter(Boolean);
  
  return lines.join("\n");
}

async function postToFacebook(message: string, imageUrl?: string | null) {
  const endpoint = `https://graph.facebook.com/v19.0/${FACEBOOK_PAGE_ID}/feed`;
  const form = new URLSearchParams();
  form.set("message", message);
  form.set("access_token", FACEBOOK_PAGE_TOKEN);
  
  if (imageUrl) {
    form.set("link", imageUrl);
  }

  const resp = await fetch(endpoint, {
    method: "POST",
    body: form,
  });

  const json = await resp.json();
  if (!resp.ok) {
    throw new Error(`Facebook error ${resp.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

async function logResult(row: {
  vendor_id: string;
  plan_tier: string;
  product_id?: string;
  status: "success" | "error";
  fb_post_id?: string;
  error_message?: string;
  payload?: unknown;
}) {
  await adminClient.from("boost_posts_log").insert({
    vendor_id: row.vendor_id,
    plan_tier: row.plan_tier,
    product_id: row.product_id ?? null,
    status: row.status,
    fb_post_id: row.fb_post_id ?? null,
    error_message: row.error_message ?? null,
    payload: row.payload ? row.payload as any : null,
  });
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response("Use POST", { 
        status: 405,
        headers: corsHeaders 
      });
    }

    const body = (await req.json()) as Body;
    const plan = body.plan;
    const limitPerVendor = Math.max(1, Math.min(body.limitPerVendor ?? 1, 10));

    console.log("Boost request:", { plan, vendor_ids: body.vendor_ids, limitPerVendor, dryRun: body.dryRun });

    // 1) Récupérer vendeurs éligibles
    const vendors = await fetchEligibleVendors(plan, body.vendor_ids);
    console.log(`Found ${vendors.length} eligible vendors`);
    
    if (vendors.length === 0) {
      return new Response(JSON.stringify({ 
        ok: true, 
        message: "Aucun vendeur éligible" 
      }), {
        headers: { 
          "content-type": "application/json",
          ...corsHeaders 
        },
      });
    }

    // 2) Pour chaque vendeur, récupérer des produits et publier
    const results: any[] = [];
    
    for (const v of vendors) {
      console.log(`Processing vendor ${v.vendor_id} (${v.plan_tier})`);
      
      const products = await fetchTopProductsForVendor(v.vendor_id, limitPerVendor);
      if (products.length === 0) {
        await logResult({
          vendor_id: v.vendor_id,
          plan_tier: v.plan_tier,
          status: "error",
          error_message: "Aucun produit actif",
        });
        results.push({ vendor_id: v.vendor_id, status: "skipped_no_product" });
        continue;
      }

      for (const p of products) {
        const message = buildMessage(v, p);
        const imageUrl = p.images && p.images.length > 0 ? p.images[0] : null;

        if (body.dryRun) {
          console.log("DRY RUN - Would post:", message);
          results.push({ 
            vendor_id: v.vendor_id, 
            product_id: p.id, 
            status: "dry_run", 
            message 
          });
          continue;
        }

        try {
          const fb = await postToFacebook(message, imageUrl);
          console.log("Facebook post successful:", fb.id);
          
          await logResult({
            vendor_id: v.vendor_id,
            plan_tier: v.plan_tier,
            product_id: p.id,
            status: "success",
            fb_post_id: fb.id,
            payload: { message, image_url: imageUrl },
          });
          
          results.push({ 
            vendor_id: v.vendor_id, 
            product_id: p.id, 
            status: "success", 
            fb_post_id: fb.id 
          });
        } catch (e) {
          console.error("Facebook post failed:", e);
          
          await logResult({
            vendor_id: v.vendor_id,
            plan_tier: v.plan_tier,
            product_id: p.id,
            status: "error",
            error_message: (e as Error).message,
            payload: { message, image_url: imageUrl },
          });
          
          results.push({ 
            vendor_id: v.vendor_id, 
            product_id: p.id, 
            status: "error", 
            error: (e as Error).message 
          });
        }
      }
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      count: results.length, 
      results 
    }), {
      headers: { 
        "content-type": "application/json",
        ...corsHeaders 
      },
    });
  } catch (e) {
    console.error("Boost function error:", e);
    
    return new Response(JSON.stringify({ 
      ok: false, 
      error: (e as Error).message 
    }), {
      status: 500,
      headers: { 
        "content-type": "application/json",
        ...corsHeaders 
      },
    });
  }
});