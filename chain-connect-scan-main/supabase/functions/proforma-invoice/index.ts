// Edge Function pour gérer les Proforma Invoices (PI) et Payment Links
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROFORMA-INVOICE] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase with service role for backend operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("ERROR: STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    const { action, ...body } = await req.json();
    logStep("Action requested", { action });

    switch (action) {
      case 'create_draft_order': {
        const { buyer_email, items, notes, payment_terms, delivery_terms, expires_in_days = 30 } = body;
        
        // Calculer les totaux
        let subtotal = 0;
        let tax_amount = 0;
        let shipping_amount = body.shipping_amount || 0;
        
        for (const item of items) {
          subtotal += item.quantity * item.unit_price;
          tax_amount += item.tax || 0;
        }
        
        const total_amount = subtotal + tax_amount + shipping_amount;
        const expires_at = new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000);

        // Créer le draft order
        const { data: draftOrder, error: draftError } = await supabaseClient
          .from('draft_orders')
          .insert({
            seller_id: user.id,
            buyer_email,
            items,
            subtotal,
            tax_amount,
            shipping_amount,
            total_amount,
            currency: body.currency || 'GNF',
            notes,
            payment_terms,
            delivery_terms,
            expires_at: expires_at.toISOString()
          })
          .select()
          .single();

        if (draftError) throw draftError;

        // Créer un événement
        await supabaseClient.from('payment_events').insert({
          draft_order_id: draftOrder.id,
          user_id: user.id,
          event_type: 'pi_created',
          title: 'Proforma Invoice créée',
          message: `PI ${draftOrder.pi_number} créée pour ${buyer_email}`,
          severity: 'info'
        });

        logStep("Draft order created", { piNumber: draftOrder.pi_number });
        
        return new Response(JSON.stringify({
          success: true,
          draft_order: draftOrder
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'generate_payment_link': {
        const { draft_order_id } = body;

        // Récupérer le draft order
        const { data: draftOrder, error: fetchError } = await supabaseClient
          .from('draft_orders')
          .select('*')
          .eq('id', draft_order_id)
          .eq('seller_id', user.id)
          .single();

        if (fetchError || !draftOrder) throw new Error("Draft order not found");
        if (draftOrder.status !== 'draft') throw new Error("Payment link already generated");

        // Créer ou récupérer le customer Stripe
        const customers = await stripe.customers.list({ 
          email: draftOrder.buyer_email, 
          limit: 1 
        });

        let customerId;
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        } else {
          const customer = await stripe.customers.create({
            email: draftOrder.buyer_email,
            metadata: {
              draft_order_id: draftOrder.id,
              pi_number: draftOrder.pi_number
            }
          });
          customerId = customer.id;
        }

        // Créer le Payment Link via Stripe
        const paymentLink = await stripe.paymentLinks.create({
          line_items: [
            {
              price_data: {
                currency: draftOrder.currency.toLowerCase(),
                product_data: {
                  name: `Commande ${draftOrder.pi_number}`,
                  description: `Paiement pour Proforma Invoice ${draftOrder.pi_number}`,
                },
                unit_amount: Math.round(draftOrder.total_amount * 100), // Stripe utilise les centimes
              },
              quantity: 1,
            },
          ],
          metadata: {
            draft_order_id: draftOrder.id,
            pi_number: draftOrder.pi_number,
            seller_id: user.id
          },
          after_completion: {
            type: 'redirect',
            redirect: {
              url: `${req.headers.get("origin")}/payment-success?pi=${draftOrder.pi_number}`
            }
          },
          allow_promotion_codes: true,
          customer_creation: 'always',
          invoice_creation: {
            enabled: true,
            invoice_data: {
              description: `Invoice pour PI ${draftOrder.pi_number}`,
              metadata: {
                draft_order_id: draftOrder.id,
                pi_number: draftOrder.pi_number
              }
            }
          }
        });

        // Mettre à jour le draft order
        const { error: updateError } = await supabaseClient
          .from('draft_orders')
          .update({
            status: 'awaiting_payment',
            stripe_payment_link_id: paymentLink.id,
            payment_link_url: paymentLink.url
          })
          .eq('id', draftOrder.id);

        if (updateError) throw updateError;

        // Créer un événement
        await supabaseClient.from('payment_events').insert({
          draft_order_id: draftOrder.id,
          user_id: user.id,
          event_type: 'payment_link_generated',
          title: 'Payment Link généré',
          message: `Payment Link créé pour PI ${draftOrder.pi_number}`,
          severity: 'success',
          metadata: { payment_link_url: paymentLink.url }
        });

        logStep("Payment link generated", { 
          piNumber: draftOrder.pi_number, 
          paymentLinkId: paymentLink.id 
        });

        return new Response(JSON.stringify({
          success: true,
          payment_link: {
            id: paymentLink.id,
            url: paymentLink.url
          }
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_draft_orders': {
        const { status } = body;
        
        let query = supabaseClient
          .from('draft_orders')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (status) {
          query = query.eq('status', status);
        }

        const { data: draftOrders, error } = await query;
        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          draft_orders: draftOrders || []
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case 'get_draft_order': {
        const { draft_order_id } = body;

        const { data: draftOrder, error } = await supabaseClient
          .from('draft_orders')
          .select('*')
          .eq('id', draft_order_id)
          .eq('seller_id', user.id)
          .single();

        if (error) throw error;

        return new Response(JSON.stringify({
          success: true,
          draft_order: draftOrder
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