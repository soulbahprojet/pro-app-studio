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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) throw new Error('User not authenticated');

    const { method, url } = req;
    const urlObj = new URL(url);
    const operation = urlObj.searchParams.get('operation');
    
    switch (operation) {
      case 'checkout': {
        const { items, customerInfo } = await req.json();
        
        // Calculer les frais
        const FRAIS_APP = 0.01;
        const COMMISSION_API = 0.02;
        
        let subtotal = 0;
        const processedItems = [];
        
        // Vérifier la disponibilité de chaque produit
        for (const item of items) {
          const { data: product } = await supabaseClient
            .from('products')
            .select('id, name, price, seller_id')
            .eq('id', item.productId)
            .eq('is_active', true)
            .single();
          
          if (!product) {
            throw new Error(`Produit ${item.productId} non trouvé ou inactif`);
          }

          // Vérifier stock
          const { data: inventory } = await supabaseClient
            .from('inventory')
            .select('quantity_available')
            .eq('product_id', item.productId)
            .single();

          if (!inventory || inventory.quantity_available < item.quantity) {
            throw new Error(`Stock insuffisant pour ${product.name}`);
          }

          const itemTotal = product.price * item.quantity;
          subtotal += itemTotal;
          
          processedItems.push({
            productId: item.productId,
            productName: product.name,
            unitPrice: product.price,
            quantity: item.quantity,
            totalPrice: itemTotal,
            sellerId: product.seller_id
          });
        }
        
        // Calculer frais client
        const clientFees = Math.round(subtotal * (FRAIS_APP + COMMISSION_API));
        const totalAmount = subtotal + clientFees;
        
        // Créer la commande
        const { data: order, error: orderError } = await supabaseClient
          .from('orders')
          .insert({
            customer_id: user.id,
            seller_id: processedItems[0].sellerId, // Pour le moment, un seul vendeur par commande
            status: 'pending',
            total_amount: totalAmount,
            currency: 'GNF',
            delivery_address: customerInfo.address,
            notes: customerInfo.notes || ''
          })
          .select()
          .single();

        if (orderError) throw orderError;

        // Créer les items de commande
        const orderItems = processedItems.map(item => ({
          order_id: order.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice
        }));

        await supabaseClient
          .from('order_items')
          .insert(orderItems);

        // Réserver le stock
        for (const item of processedItems) {
          await supabaseClient.rpc('reserve_stock', {
            p_product_id: item.productId,
            p_quantity: item.quantity,
            p_order_id: order.id
          });
        }

        return new Response(JSON.stringify({
          success: true,
          orderId: order.id,
          orderNumber: order.readable_id,
          subtotal,
          fees: clientFees,
          total: totalAmount
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'confirm-payment': {
        const { orderId } = await req.json();
        
        // Confirmer le paiement et libérer le stock réservé vers vendu
        const { data: order } = await supabaseClient
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();

        if (!order) throw new Error('Commande non trouvée');

        // Confirmer la vente dans l'inventaire
        for (const item of order.order_items) {
          await supabaseClient.rpc('confirm_sale', {
            p_product_id: item.product_id,
            p_quantity: item.quantity,
            p_order_id: orderId
          });
        }

        // Créditer le portefeuille du vendeur
        const { data: wallet } = await supabaseClient
          .from('vendor_wallets')
          .select('balance')
          .eq('vendor_id', order.seller_id)
          .single();

        const newBalance = (wallet?.balance || 0) + (order.total_amount - Math.round(order.total_amount * 0.03));

        await supabaseClient
          .from('vendor_wallets')
          .update({ balance: newBalance })
          .eq('vendor_id', order.seller_id);

        // Enregistrer la transaction
        await supabaseClient
          .from('vendor_transactions')
          .insert({
            vendor_id: order.seller_id,
            order_id: orderId,
            type: 'sale',
            amount: order.total_amount - Math.round(order.total_amount * 0.03),
            description: `Vente - Commande #${order.readable_id}`,
            status: 'completed'
          });

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      case 'request-payout': {
        const { amount, bankDetails } = await req.json();
        
        // Vérifier le solde du vendeur
        const { data: wallet } = await supabaseClient
          .from('vendor_wallets')
          .select('balance')
          .eq('vendor_id', user.id)
          .single();

        if (!wallet || wallet.balance < amount) {
          throw new Error('Solde insuffisant');
        }

        // Calculer les frais de retrait
        const FRAIS_RETRAIT = 1000;
        const COMMISSION_API_OUT = 0.02;
        const fees = FRAIS_RETRAIT + Math.round(amount * COMMISSION_API_OUT);
        const netAmount = amount - fees;

        if (netAmount <= 0) {
          throw new Error('Le montant après frais doit être positif');
        }

        // Créer la demande de retrait
        const { data: payout, error } = await supabaseClient
          .from('payout_requests')
          .insert({
            vendor_id: user.id,
            amount,
            net_amount: netAmount,
            fees,
            status: 'pending',
            bank_details: bankDetails
          })
          .select()
          .single();

        if (error) throw error;

        // Mettre à jour le solde (retirer le montant en attente)
        await supabaseClient
          .from('vendor_wallets')
          .update({ 
            balance: wallet.balance - amount,
            pending_amount: (wallet.pending_amount || 0) + amount
          })
          .eq('vendor_id', user.id);

        return new Response(JSON.stringify({
          success: true,
          payoutId: payout.id,
          netAmount
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      default:
        throw new Error('Opération non supportée');
    }
  } catch (error) {
    console.error('Erreur vendor operations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});