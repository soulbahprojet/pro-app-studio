// Edge Function pour gérer les paiements et l'escrow
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-ESCROW] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const { action, ...body } = await req.json();
    logStep("Action requested", { action });

    switch (action) {
      case 'process_payment_webhook': {
        // Traitement des webhooks Stripe
        const { type, data } = body;
        
        switch (type) {
          case 'payment_link.payment_succeeded': {
            const paymentIntent = data.object;
            const draftOrderId = paymentIntent.metadata?.draft_order_id;
            
            if (!draftOrderId) {
              throw new Error("No draft_order_id in payment metadata");
            }

            // Récupérer le draft order
            const { data: draftOrder, error: fetchError } = await supabaseClient
              .from('draft_orders')
              .select('*')
              .eq('id', draftOrderId)
              .single();

            if (fetchError || !draftOrder) {
              throw new Error("Draft order not found");
            }

            // Calculer les montants
            const commission_rate = 0.20; // 20% de commission
            const commission_amount = draftOrder.total_amount * commission_rate;
            const seller_amount = draftOrder.total_amount - commission_amount;

            // Créer l'enregistrement escrow
            const { data: escrow, error: escrowError } = await supabaseClient
              .from('payment_escrows')
              .insert({
                draft_order_id: draftOrder.id,
                stripe_payment_intent_id: paymentIntent.id,
                stripe_charge_id: paymentIntent.latest_charge,
                stripe_customer_id: paymentIntent.customer,
                total_amount: draftOrder.total_amount,
                seller_amount,
                commission_amount,
                commission_rate,
                currency: draftOrder.currency,
                status: 'held'
              })
              .select()
              .single();

            if (escrowError) throw escrowError;

            // Mettre à jour le draft order
            await supabaseClient
              .from('draft_orders')
              .update({
                status: 'paid',
                buyer_id: paymentIntent.customer,
                paid_at: new Date().toISOString(),
                escrow_created_at: new Date().toISOString()
              })
              .eq('id', draftOrder.id);

            // Créer des entrées dans le ledger
            await supabaseClient.from('payment_ledger').insert([
              {
                draft_order_id: draftOrder.id,
                escrow_id: escrow.id,
                user_from: draftOrder.buyer_id,
                user_to: null, // Platform
                transaction_type: 'charge',
                amount: draftOrder.total_amount,
                currency: draftOrder.currency,
                stripe_reference_id: paymentIntent.id,
                reference_type: 'payment_intent',
                description: `Payment received for PI ${draftOrder.pi_number}`
              }
            ]);

            // Créer des événements
            await supabaseClient.from('payment_events').insert([
              {
                draft_order_id: draftOrder.id,
                escrow_id: escrow.id,
                user_id: draftOrder.seller_id,
                event_type: 'payment_received',
                title: 'Paiement reçu',
                message: `Paiement de ${draftOrder.total_amount} ${draftOrder.currency} reçu pour PI ${draftOrder.pi_number}`,
                severity: 'success'
              },
              {
                draft_order_id: draftOrder.id,
                escrow_id: escrow.id,
                user_id: draftOrder.seller_id,
                event_type: 'escrow_created',
                title: 'Escrow créé',
                message: `Fonds mis en séquestre. Libération automatique prévue dans ${escrow.auto_release_after_days} jours`,
                severity: 'info'
              }
            ]);

            logStep("Payment processed and escrow created", {
              piNumber: draftOrder.pi_number,
              escrowId: escrow.id,
              amount: draftOrder.total_amount
            });

            break;
          }

          case 'invoice.payment_succeeded': {
            // Traitement similaire pour les invoices Stripe
            logStep("Invoice payment succeeded", { invoiceId: data.object.id });
            break;
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'release_escrow': {
        const { escrow_id, admin_override = false } = body;

        // Authentifier l'utilisateur si ce n'est pas un override admin
        if (!admin_override) {
          const authHeader = req.headers.get("Authorization");
          if (!authHeader) throw new Error("No authorization header provided");
          
          const token = authHeader.replace("Bearer ", "");
          const { data: userData } = await supabaseClient.auth.getUser(token);
          if (!userData.user) throw new Error("User not authenticated");
        }

        // Récupérer l'escrow
        const { data: escrow, error: fetchError } = await supabaseClient
          .from('payment_escrows')
          .select(`
            *,
            draft_orders (
              id, pi_number, seller_id, buyer_id, total_amount, currency
            )
          `)
          .eq('id', escrow_id)
          .single();

        if (fetchError || !escrow) throw new Error("Escrow not found");
        if (escrow.status !== 'held') throw new Error("Escrow already processed");

        // TODO: Ici, implémenter le transfer Stripe vers le vendeur
        // Pour l'instant, nous simulons la libération

        // Mettre à jour l'escrow
        await supabaseClient
          .from('payment_escrows')
          .update({
            status: 'released',
            release_date: new Date().toISOString()
          })
          .eq('id', escrow_id);

        // Mettre à jour le draft order
        await supabaseClient
          .from('draft_orders')
          .update({ status: 'released' })
          .eq('id', escrow.draft_order_id);

        // Créer une entrée dans le ledger
        await supabaseClient.from('payment_ledger').insert({
          draft_order_id: escrow.draft_order_id,
          escrow_id: escrow.id,
          user_from: null, // Platform
          user_to: escrow.draft_orders.seller_id,
          transaction_type: 'transfer',
          amount: escrow.seller_amount,
          currency: escrow.currency,
          description: `Escrow released for PI ${escrow.draft_orders.pi_number}`
        });

        // Créer un événement
        await supabaseClient.from('payment_events').insert({
          draft_order_id: escrow.draft_order_id,
          escrow_id: escrow.id,
          user_id: escrow.draft_orders.seller_id,
          event_type: 'escrow_released',
          title: 'Fonds libérés',
          message: `${escrow.seller_amount} ${escrow.currency} libérés pour PI ${escrow.draft_orders.pi_number}`,
          severity: 'success'
        });

        logStep("Escrow released", {
          escrowId: escrow.id,
          amount: escrow.seller_amount,
          sellerId: escrow.draft_orders.seller_id
        });

        return new Response(JSON.stringify({
          success: true,
          message: "Escrow released successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'refund_escrow': {
        const { escrow_id, reason } = body;
        
        // Récupérer l'escrow
        const { data: escrow, error: fetchError } = await supabaseClient
          .from('payment_escrows')
          .select(`
            *,
            draft_orders (
              id, pi_number, seller_id, buyer_id, total_amount, currency
            )
          `)
          .eq('id', escrow_id)
          .single();

        if (fetchError || !escrow) throw new Error("Escrow not found");
        if (escrow.status !== 'held') throw new Error("Escrow already processed");

        // TODO: Implémenter le refund Stripe
        // const refund = await stripe.refunds.create({
        //   charge: escrow.stripe_charge_id,
        //   reason: 'requested_by_customer'
        // });

        // Mettre à jour l'escrow
        await supabaseClient
          .from('payment_escrows')
          .update({
            status: 'refunded',
            resolution: reason
          })
          .eq('id', escrow_id);

        // Mettre à jour le draft order
        await supabaseClient
          .from('draft_orders')
          .update({ status: 'refunded' })
          .eq('id', escrow.draft_order_id);

        // Créer une entrée dans le ledger
        await supabaseClient.from('payment_ledger').insert({
          draft_order_id: escrow.draft_order_id,
          escrow_id: escrow.id,
          user_from: null, // Platform
          user_to: escrow.draft_orders.buyer_id,
          transaction_type: 'refund',
          amount: escrow.total_amount,
          currency: escrow.currency,
          description: `Refund for PI ${escrow.draft_orders.pi_number}: ${reason}`
        });

        // Créer un événement
        await supabaseClient.from('payment_events').insert({
          draft_order_id: escrow.draft_order_id,
          escrow_id: escrow.id,
          user_id: escrow.draft_orders.buyer_id,
          event_type: 'escrow_refunded',
          title: 'Remboursement effectué',
          message: `${escrow.total_amount} ${escrow.currency} remboursé pour PI ${escrow.draft_orders.pi_number}`,
          severity: 'info'
        });

        return new Response(JSON.stringify({
          success: true,
          message: "Escrow refunded successfully"
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_escrows': {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) throw new Error("No authorization header provided");
        
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabaseClient.auth.getUser(token);
        if (!userData.user) throw new Error("User not authenticated");

        const { data: escrows, error } = await supabaseClient
          .from('payment_escrows')
          .select(`
            *,
            draft_orders (
              id, pi_number, seller_id, buyer_id, buyer_email, total_amount, currency, status
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Filtrer selon les permissions de l'utilisateur
        const userEscrows = escrows?.filter(escrow => 
          escrow.draft_orders.seller_id === userData.user.id || 
          escrow.draft_orders.buyer_id === userData.user.id
        ) || [];

        return new Response(JSON.stringify({
          success: true,
          escrows: userEscrows
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});