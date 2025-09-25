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
    if (req.method === "POST") {
      const body = await req.json();
      console.log("Creating product:", body);
      
      // Validate required fields
      if (!body.seller_id || !body.title) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: "seller_id and title are required" 
        }), { 
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }

      const { data, error } = await adminClient
        .from("products")
        .insert([{
          seller_id: body.seller_id,
          title: body.title,
          name: body.name || body.title,
          description: body.description,
          price: body.price || 0,
          currency: body.currency || 'GNF',
          stock_quantity: body.stock_quantity || 0,
          images: body.images || [],
          is_active: body.is_active !== false,
          category: body.category,
          sku: body.sku
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating product:", error);
        return new Response(JSON.stringify({ ok: false, error: error.message }), { 
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ ok: true, data }), { 
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    if (req.method === "PUT") {
      const body = await req.json();
      console.log("Updating product:", body);
      
      if (!body.id || !body.seller_id) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: "id and seller_id are required" 
        }), { 
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }

      // Verify seller owns product
      const { data: product, error: fetchError } = await adminClient
        .from("products")
        .select("seller_id")
        .eq("id", body.id)
        .single();

      if (fetchError) {
        console.error("Error fetching product:", fetchError);
        return new Response(JSON.stringify({ ok: false, error: "Product not found" }), { 
          status: 404,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }

      if (!product || product.seller_id !== body.seller_id) {
        return new Response(JSON.stringify({ ok: false, error: "Not authorized" }), { 
          status: 403,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }

      const { data, error } = await adminClient
        .from("products")
        .update({
          title: body.title,
          name: body.name,
          description: body.description,
          price: body.price,
          currency: body.currency,
          stock_quantity: body.stock_quantity,
          images: body.images,
          is_active: body.is_active,
          category: body.category,
          sku: body.sku,
          updated_at: new Date().toISOString()
        })
        .eq("id", body.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating product:", error);
        return new Response(JSON.stringify({ ok: false, error: error.message }), { 
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ ok: true, data }), { 
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const sellerId = url.searchParams.get("seller_id");
      
      if (!sellerId) {
        return new Response(JSON.stringify({ 
          ok: false, 
          error: "seller_id parameter is required" 
        }), { 
          status: 400,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }

      const { data, error } = await adminClient
        .from("products")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        return new Response(JSON.stringify({ ok: false, error: error.message }), { 
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ ok: true, data }), { 
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), { 
      status: 405,
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