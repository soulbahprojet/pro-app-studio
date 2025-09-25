import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const { subscriptionId, cancelAtPeriodEnd = false } = await req.json();
    if (!subscriptionId) {
      throw new Error("Subscription ID is required");
    }
    logStep("Request data received", { subscriptionId, cancelAtPeriodEnd });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    let canceledSubscription;
    
    if (cancelAtPeriodEnd) {
      // Annulation à la fin de la période de facturation
      canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      logStep("Subscription scheduled for cancellation", { 
        subscriptionId, 
        cancelAt: new Date(canceledSubscription.current_period_end * 1000).toISOString()
      });
    } else {
      // Annulation immédiate
      canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
      logStep("Subscription canceled immediately", { subscriptionId });
      
      // Update user subscription in Supabase to basic plan
      await updateUserSubscription(supabaseClient, user.id, 'basic');
    }

    const message = cancelAtPeriodEnd 
      ? "Abonnement programmé pour annulation à la fin de la période de facturation"
      : "Abonnement annulé immédiatement";

    return new Response(JSON.stringify({
      subscription: canceledSubscription,
      message,
      canceledAt: cancelAtPeriodEnd ? null : new Date().toISOString(),
      cancelsAt: cancelAtPeriodEnd ? new Date(canceledSubscription.current_period_end * 1000).toISOString() : null
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in cancel-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function updateUserSubscription(supabaseClient: any, userId: string, plan: string) {
  const { error } = await supabaseClient
    .from('profiles')
    .update({
      subscription_plan: plan,
      subscription_expires_at: null
    })
    .eq('user_id', userId);

  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Erreur lors de la mise à jour de l'abonnement");
  }

  console.log("Subscription updated successfully:", { userId, plan });
}