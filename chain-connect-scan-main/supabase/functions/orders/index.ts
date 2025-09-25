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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) throw new Error('User not authenticated');

    const { method } = req;
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (method) {
      case 'POST':
        if (action === 'create') {
          // Create new order with QR code
          const orderData = await req.json();
          
          const { data: newOrder, error: orderError } = await supabaseClient
            .from('orders')
            .insert({
              ...orderData,
              customer_id: user.id,
              qr_code: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            })
            .select()
            .single();

          if (orderError) throw orderError;

          // Create order items
          if (orderData.items && orderData.items.length > 0) {
            const { error: itemsError } = await supabaseClient
              .from('order_items')
              .insert(
                orderData.items.map((item: any) => ({
                  order_id: newOrder.id,
                  product_id: item.product_id,
                  quantity: item.quantity,
                  unit_price: item.unit_price,
                  total_price: item.total_price,
                }))
              );

            if (itemsError) throw itemsError;
          }

          // Update wallet balances (escrow)
          if (orderData.total_amount) {
            // Deduct from customer wallet
            const { error: walletError } = await supabaseClient.rpc(
              'update_wallet_balance',
              {
                user_id: user.id,
                amount: -orderData.total_amount,
                currency_col: `balance_${orderData.currency.toLowerCase()}`,
              }
            );

            if (walletError) console.warn('Wallet update failed:', walletError);
          }

          return new Response(JSON.stringify({ order: newOrder }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201,
          });
        }

        if (action === 'validate-delivery') {
          // Validate delivery QR code by courier
          const { order_id, qr_code } = await req.json();
          
          const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .eq('qr_code', qr_code)
            .single();

          if (orderError || !order) throw new Error('Invalid QR code or order not found');

          // Update order status and delivery tracking
          const { error: updateError } = await supabaseClient
            .from('orders')
            .update({ status: 'in_transit' })
            .eq('id', order_id);

          if (updateError) throw updateError;

          const { error: trackingError } = await supabaseClient
            .from('delivery_tracking')
            .update({
              status: 'picked_up',
              courier_id: user.id,
            })
            .eq('order_id', order_id);

          if (trackingError) console.warn('Tracking update failed:', trackingError);

          return new Response(JSON.stringify({ message: 'Delivery validated successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        if (action === 'confirm-reception') {
          // Confirm reception by customer
          const { order_id, qr_code } = await req.json();
          
          const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', order_id)
            .eq('qr_code', qr_code)
            .eq('customer_id', user.id)
            .single();

          if (orderError || !order) throw new Error('Invalid QR code or order not found');

          // Update order status to delivered
          const { error: updateError } = await supabaseClient
            .from('orders')
            .update({
              status: 'delivered',
              delivered_at: new Date().toISOString(),
            })
            .eq('id', order_id);

          if (updateError) throw updateError;

          // Release escrow funds to seller
          const { error: releaseError } = await supabaseClient.rpc(
            'release_escrow_funds',
            {
              order_id: order_id,
            }
          );

          if (releaseError) console.warn('Escrow release failed:', releaseError);

          return new Response(JSON.stringify({ message: 'Order delivered successfully' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }

        break;

      case 'GET':
        // Get orders for user
        const { data: orders, error: fetchError } = await supabaseClient
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              products (name, price, currency)
            )
          `)
          .or(`customer_id.eq.${user.id},seller_id.eq.${user.id},courier_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        return new Response(JSON.stringify({ orders }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });

      default:
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }
  } catch (error) {
    console.error('Orders API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});