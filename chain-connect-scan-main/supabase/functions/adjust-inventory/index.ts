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
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ ok: false, error: "Use POST method" }), { 
        status: 405,
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    const body = await req.json();
    console.log("Adjusting inventory:", body);
    
    const { product_id, location = "default", change, reason, actor_id } = body;

    if (!product_id || change === undefined) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: "product_id and change are required" 
      }), { 
        status: 400,
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    // Verify product exists and get current stock
    const { data: product, error: productError } = await adminClient
      .from("products")
      .select("id, stock_quantity, seller_id")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      console.error("Product not found:", productError);
      return new Response(JSON.stringify({ ok: false, error: "Product not found" }), { 
        status: 404,
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    // Check or create inventory record
    const { data: inventory, error: inventoryError } = await adminClient
      .from("inventory")
      .select("*")
      .eq("product_id", product_id)
      .eq("location", location)
      .maybeSingle();

    if (inventoryError) {
      console.error("Error fetching inventory:", inventoryError);
      return new Response(JSON.stringify({ ok: false, error: inventoryError.message }), { 
        status: 500,
        headers: { ...corsHeaders, "content-type": "application/json" }
      });
    }

    let newQuantity;
    let inventoryResult;

    if (!inventory) {
      // Create new inventory record
      newQuantity = Math.max(0, change);
      const { data, error } = await adminClient
        .from("inventory")
        .insert([{ 
          product_id, 
          location, 
          quantity_available: newQuantity,
          quantity_reserved: 0,
          last_updated: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error creating inventory:", error);
        return new Response(JSON.stringify({ ok: false, error: error.message }), { 
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }
      inventoryResult = data;
    } else {
      // Update existing inventory
      newQuantity = Math.max(0, (inventory.quantity_available || 0) + change);
      const { data, error } = await adminClient
        .from("inventory")
        .update({ 
          quantity_available: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq("id", inventory.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating inventory:", error);
        return new Response(JSON.stringify({ ok: false, error: error.message }), { 
          status: 500,
          headers: { ...corsHeaders, "content-type": "application/json" }
        });
      }
      inventoryResult = data;
    }

    // Update product stock_quantity to match inventory
    const { error: productUpdateError } = await adminClient
      .from("products")
      .update({ 
        stock_quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq("id", product_id);

    if (productUpdateError) {
      console.error("Error updating product stock:", productUpdateError);
    }

    // Create stock log entry (if stock_logs table exists)
    try {
      await adminClient
        .from("stock_logs")
        .insert([{ 
          product_id, 
          change, 
          reason: reason || "Stock adjustment",
          actor_id: actor_id || null,
          created_at: new Date().toISOString()
        }]);
    } catch (logError) {
      console.warn("Could not create stock log:", logError);
      // Continue anyway - stock log is optional
    }

    return new Response(JSON.stringify({ 
      ok: true, 
      data: {
        inventory: inventoryResult,
        newQuantity,
        change
      }
    }), { 
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