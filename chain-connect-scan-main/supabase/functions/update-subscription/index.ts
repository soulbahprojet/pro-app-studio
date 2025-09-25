import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[UPDATE-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Prix des plans avec Price IDs Stripe
const PLAN_PRICES = {
  basic: { price_id: null }, // Pas de Price ID pour basic (gratuit/annulation)
  standard: { price_id: 'price_1Rzh2QRxqizQJVjLaTmSUab7' },
  premium: { price_id: 'price_1Rzh9jRxqizQJVjLLCZYQYth' }
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

    const { subscriptionId, newPlanId } = await req.json();
    if (!subscriptionId || !newPlanId) {
      throw new Error("Subscription ID and new plan ID are required");
    }
    logStep("Request data received", { subscriptionId, newPlanId });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Get the existing subscription
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    if (!subscription) {
      throw new Error("Subscription not found");
    }
    logStep("Subscription found", { subscriptionId, currentStatus: subscription.status });

    // Handle basic plan (cancel subscription)
    if (newPlanId === 'basic') {
      const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
      logStep("Subscription canceled for basic plan", { subscriptionId });
      
      // Update user subscription in Supabase
      await updateUserSubscription(supabaseClient, user.id, 'basic');
      
      return new Response(JSON.stringify({
        subscription: canceledSubscription,
        message: "Abonnement annulé, passage au plan Basic gratuit"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get price ID for the new plan
    const planConfig = PLAN_PRICES[newPlanId as keyof typeof PLAN_PRICES];
    if (!planConfig || !planConfig.price_id) {
      throw new Error("Invalid plan ID or price not configured");
    }

    // Update the subscription with existing Price ID
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: planConfig.price_id,
      }],
      proration_behavior: 'create_prorations', // Proration pour ajustement de facturation
    });

    logStep("Subscription updated", { 
      subscriptionId, 
      newPlanId,
      status: updatedSubscription.status 
    });

    // Update user subscription in Supabase
    await updateUserSubscription(supabaseClient, user.id, newPlanId);

    return new Response(JSON.stringify({
      subscription: updatedSubscription,
      message: `Abonnement mis à jour vers le plan ${newPlanId}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in update-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function updateUserSubscription(supabaseClient: any, userId: string, plan: string) {
  const expiresAt = plan === 'basic' ? null : (() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString();
  })();

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

  console.log("Subscription updated successfully:", { userId, plan });
}