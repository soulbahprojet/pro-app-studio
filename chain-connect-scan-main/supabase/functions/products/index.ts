import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) throw new Error('User not authenticated');

    const { method } = req;
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const productId = pathSegments[pathSegments.length - 1];

    switch (method) {
      case 'GET':
        // Get seller's products
        const { data: products, error: fetchError } = await supabaseClient
          .from('products')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        return new Response(JSON.stringify({ products }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

      case 'POST':
        // Create new product
        let productData;
        try {
          productData = await req.json();
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
        
        const { data: newProduct, error: createError } = await supabaseClient
          .from('products')
          .insert({
            ...productData,
            seller_id: user.id,
          })
          .select()
          .single();

        if (createError) throw createError;

        return new Response(JSON.stringify({ product: newProduct }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });

      case 'PUT':
        // Update product
        if (!productId) throw new Error('Product ID required');
        
        let updateData;
        try {
          updateData = await req.json();
        } catch (e) {
          throw new Error('Invalid JSON in request body');
        }
        
        const { data: updatedProduct, error: updateError } = await supabaseClient
          .from('products')
          .update(updateData)
          .eq('id', productId)
          .eq('seller_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ product: updatedProduct }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

      case 'DELETE':
        // Delete product
        if (!productId) throw new Error('Product ID required');
        
        const { error: deleteError } = await supabaseClient
          .from('products')
          .delete()
          .eq('id', productId)
          .eq('seller_id', user.id);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ message: 'Product deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

      default:
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }
  } catch (error) {
    console.error('Products API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});