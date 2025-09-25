import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Initialize Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Find customer by email
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      
      // Update Supabase to reflect no subscription
      await updateUserSubscription(supabaseClient, user.id, 'basic', null);
      
      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription: null,
        customer: null,
        plan: 'basic'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    });

    logStep("Retrieved subscriptions", { 
      customerId, 
      subscriptionCount: subscriptions.data.length 
    });

    // Find active subscription
    const activeSubscription = subscriptions.data.find(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    );

    let subscriptionInfo = null;
    let planName = 'basic';
    let subscriptionEnd = null;

    if (activeSubscription) {
      // Map Stripe Price IDs to subscription tiers
      const PRICE_TO_PLAN = {
        'price_1Rzh2QRxqizQJVjLaTmSUab7': 'standard',
        'price_1Rzh9jRxqizQJVjLLCZYQYth': 'premium'
      };
      
      // Extract plan information from the subscription
      const priceId = activeSubscription.items.data[0]?.price?.id;
      const priceAmount = activeSubscription.items.data[0]?.price?.unit_amount || 0;
      
      // Determine plan based on Price ID first, fallback to amount
      planName = PRICE_TO_PLAN[priceId as keyof typeof PRICE_TO_PLAN] || 'basic';
      
      subscriptionEnd = new Date(activeSubscription.current_period_end * 1000).toISOString();
      
      subscriptionInfo = {
        id: activeSubscription.id,
        status: activeSubscription.status,
        current_period_start: new Date(activeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: subscriptionEnd,
        cancel_at_period_end: activeSubscription.cancel_at_period_end,
        canceled_at: activeSubscription.canceled_at ? new Date(activeSubscription.canceled_at * 1000).toISOString() : null,
        plan_amount: priceAmount,
        currency: activeSubscription.items.data[0]?.price?.currency || 'eur',
        price_id: priceId
      };

      logStep("Active subscription found", { 
        subscriptionId: activeSubscription.id, 
        priceId,
        planName,
        status: activeSubscription.status 
      });
    } else {
      logStep("No active subscription found");
      planName = 'basic';
    }

    // Update user subscription in Supabase
    await updateUserSubscription(supabaseClient, user.id, planName, subscriptionEnd);

    return new Response(JSON.stringify({
      subscribed: !!activeSubscription,
      subscription: subscriptionInfo,
      customer: {
        id: customerId,
        email: customers.data[0].email,
        name: customers.data[0].name
      },
      plan: planName,
      allSubscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        created: new Date(sub.created * 1000).toISOString(),
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null
      }))
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function updateUserSubscription(supabaseClient: any, userId: string, plan: string, expiresAt: string | null) {
  const { error } = await supabaseClient
    .from('profiles')
    .update({
      subscription_plan: plan,
      subscription_expires_at: expiresAt
    })
    .eq('user_id', userId);

  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Erreur lors de la mise à jour de l'abonnement");
  }

  console.log("Subscription updated successfully:", { userId, plan, expiresAt });
}