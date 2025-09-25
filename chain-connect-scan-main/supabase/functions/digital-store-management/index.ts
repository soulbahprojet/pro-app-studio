import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

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
    const operation = url.searchParams.get('operation');

    switch (operation) {
      case 'create-shop': {
        const { name, description, slug } = await req.json();
        
        // Create digital shop
        const { data: shop, error } = await supabaseService
          .from('digital_shops')
          .insert({
            user_id: user.id,
            name,
            description,
            slug,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;

        // Create default categories
        const defaultCategories = [
          { name: 'Formations', description: 'Cours et formations en ligne' },
          { name: 'eBooks', description: 'Livres électroniques' },
          { name: 'Logiciels', description: 'Applications et outils' },
          { name: 'Templates', description: 'Modèles et designs' }
        ];

        const { error: categoriesError } = await supabaseService
          .from('digital_categories')
          .insert(
            defaultCategories.map((cat, index) => ({
              shop_id: shop.id,
              ...cat,
              sort_order: index
            }))
          );

        if (categoriesError) console.warn('Categories creation warning:', categoriesError);

        return new Response(JSON.stringify({ shop }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }

      case 'get-shops': {
        const { data: shops, error } = await supabaseClient
          .from('digital_shops')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ shops }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'get-shop-analytics': {
        const shopId = url.searchParams.get('shop_id');
        if (!shopId) throw new Error('Shop ID required');

        // Get shop analytics
        const { data: analytics, error: analyticsError } = await supabaseClient
          .from('shop_analytics')
          .select('*')
          .eq('shop_id', shopId)
          .order('date', { ascending: false })
          .limit(30);

        if (analyticsError) throw analyticsError;

        // Get product stats
        const { data: products, error: productsError } = await supabaseClient
          .from('products')
          .select('id, name, price, type, created_at')
          .eq('shop_id', shopId);

        if (productsError) throw productsError;

        // Get sales stats
        const { data: sales, error: salesError } = await supabaseClient
          .from('digital_sales')
          .select('*')
          .eq('seller_id', user.id)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (salesError) throw salesError;

        const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
        const totalSales = sales.length;

        return new Response(JSON.stringify({
          analytics,
          totalProducts: products.length,
          totalRevenue,
          totalSales,
          products
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'create-promo-code': {
        const { shopId, code, discountType, discountValue, minAmount, maxUses, expiresAt } = await req.json();

        const { data: promo, error } = await supabaseService
          .from('promo_codes')
          .insert({
            shop_id: shopId,
            code,
            discount_type: discountType,
            discount_value: discountValue,
            min_amount: minAmount || 0,
            max_uses: maxUses,
            expires_at: expiresAt,
            is_active: true
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({ promo }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201,
        });
      }

      case 'get-promo-codes': {
        const shopId = url.searchParams.get('shop_id');
        if (!shopId) throw new Error('Shop ID required');

        const { data: promoCodes, error } = await supabaseClient
          .from('promo_codes')
          .select('*')
          .eq('shop_id', shopId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ promoCodes }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'auto-deliver-product': {
        const { orderId, productId, customerId } = await req.json();

        // Create digital access
        const { data: product } = await supabaseClient
          .from('products')
          .select('digital')
          .eq('id', productId)
          .single();

        if (!product?.digital) throw new Error('Product is not digital');

        const downloadLimit = product.digital.downloadLimit || 5;
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        const { data: access, error: accessError } = await supabaseService
          .from('digital_access')
          .insert({
            customer_id: customerId,
            product_id: productId,
            download_limit: downloadLimit,
            expires_at: expiresAt.toISOString(),
            access_token: crypto.randomUUID()
          })
          .select()
          .single();

        if (accessError) throw accessError;

        // Record sale
        const { error: saleError } = await supabaseService
          .from('digital_sales')
          .insert({
            product_id: productId,
            customer_id: customerId,
            seller_id: user.id,
            amount: product.price || 0,
            payment_status: 'completed',
            delivered_at: new Date().toISOString()
          });

        if (saleError) throw saleError;

        return new Response(JSON.stringify({ 
          message: 'Product delivered successfully',
          access 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      default:
        return new Response('Invalid operation', { 
          status: 400, 
          headers: corsHeaders 
        });
    }
  } catch (error) {
    console.error('Digital store management error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});