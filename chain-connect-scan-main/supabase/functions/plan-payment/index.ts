import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  plan: string;
  paymentMethod: string;
  amount: number;
  currency: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Plan payment function called");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // Use service role key for admin operations
      {
        auth: { persistSession: false }
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const { plan, paymentMethod, amount, currency }: PaymentRequest = await req.json();
    
    console.log("Payment request:", { plan, paymentMethod, amount, currency, userId: userData.user.id });

    let result: any = {};

    // Cas spécial pour le forfait basic (gratuit)
    if (plan === 'basic' || amount === 0) {
      console.log("Processing free basic plan");
      await updateUserSubscription(supabaseClient, userData.user.id, plan);
      return new Response(JSON.stringify({
        success: true,
        message: "Votre abonnement Basic a été activé avec succès !",
        plan: plan
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    switch (paymentMethod) {
      case 'stripe':
        result = await handleStripePayment(plan, amount, currency, userData.user.email!);
        break;
        
      case 'wallet':
        result = await handleWalletPayment(supabaseClient, userData.user.id, plan, amount, currency);
        break;
        
      case 'orange_money':
        result = await handleOrangeMoneyPayment(plan, amount, currency, userData.user.phone || userData.user.email!);
        break;
        
      case 'mobile_money':
        result = await handleMobileMoneyPayment(plan, amount, currency, userData.user.phone || userData.user.email!);
        break;
        
      case 'paypal':
        result = await handlePayPalPayment(plan, amount, currency, userData.user.email!);
        break;
        
      default:
        throw new Error("Méthode de paiement non supportée");
    }

    // Si le paiement est réussi (ou pour wallet), mettre à jour l'abonnement
    if (result.success) {
      await updateUserSubscription(supabaseClient, userData.user.id, plan);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in plan-payment:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

async function handleStripePayment(plan: string, amount: number, currency: string, email: string) {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : undefined;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : email,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: { 
              name: `Abonnement ${plan.toUpperCase()}`,
              description: `Mise à niveau vers le forfait ${plan.toUpperCase()}`
            },
            unit_amount: Math.round(amount * 100), // Stripe utilise les centimes
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovable.dev') || 'http://localhost:3000'}/seller-dashboard?payment=success&plan=${plan}`,
      cancel_url: `${Deno.env.get("SUPABASE_URL")?.replace('supabase.co', 'lovable.dev') || 'http://localhost:3000'}/seller-dashboard?payment=cancelled`,
    });

    return {
      success: false, // False car le paiement n'est pas encore confirmé
      paymentUrl: session.url,
      sessionId: session.id,
      message: "Redirection vers Stripe pour le paiement"
    };
  } catch (error) {
    console.error("Stripe error:", error);
    throw new Error("Erreur lors du traitement du paiement Stripe");
  }
}

async function handleWalletPayment(supabaseClient: any, userId: string, plan: string, amount: number, currency: string) {
  try {
    // Récupérer ou créer le wallet de l'utilisateur
    let { data: wallet, error: walletError } = await supabaseClient
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Si le wallet n'existe pas, le créer
    if (!wallet && !walletError) {
      console.log("Creating wallet for user:", userId);
      const { data: newWallet, error: createError } = await supabaseClient
        .from('wallets')
        .insert({
          user_id: userId,
          balance_gnf: 0,
          balance_usd: 0,
          balance_eur: 0,
          balance_cny: 0,
          balance_xof: 0
        })
        .select()
        .single();
      
      if (createError) {
        console.error("Error creating wallet:", createError);
        throw new Error("Impossible de créer le wallet");
      }
      
      wallet = newWallet;
    } else if (walletError) {
      console.error("Error fetching wallet:", walletError);
      throw new Error("Erreur lors de la récupération du wallet");
    }

    if (!wallet) {
      throw new Error("Wallet non trouvé");
    }

    // Vérifier le solde selon la devise
    const balanceField = `balance_${currency.toLowerCase()}`;
    const currentBalance = wallet[balanceField] || 0;

    if (currentBalance < amount) {
      throw new Error(`Solde insuffisant. Solde actuel: ${currentBalance} ${currency.toUpperCase()}, Montant requis: ${amount} ${currency.toUpperCase()}`);
    }

    // Débiter le wallet
    const { error: updateError } = await supabaseClient
      .from('wallets')
      .update({ [balanceField]: currentBalance - amount })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error("Erreur lors du débit du wallet");
    }

    // Créer une transaction
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'subscription_payment',
        amount: -amount,
        currency: currency.toUpperCase(),
        description: `Paiement abonnement ${plan.toUpperCase()}`,
        reference_id: `SUB-${Date.now()}`
      });

    if (transactionError) {
      console.error("Erreur transaction:", transactionError);
    }

    return {
      success: true,
      message: `Paiement de ${amount} ${currency.toUpperCase()} effectué avec succès depuis votre wallet`
    };
  } catch (error) {
    console.error("Wallet payment error:", error);
    throw error;
  }
}

async function handleOrangeMoneyPayment(plan: string, amount: number, currency: string, phone: string) {
  // Placeholder pour Orange Money - à configurer avec l'API Orange Money
  console.log("Orange Money payment request:", { plan, amount, currency, phone });
  
  return {
    success: false,
    message: "Orange Money en cours de configuration",
    paymentUrl: null,
    instructions: `Pour payer ${amount} ${currency} via Orange Money, composez le *144# et suivez les instructions. Référence: OM-${Date.now()}`
  };
}

async function handleMobileMoneyPayment(plan: string, amount: number, currency: string, phone: string) {
  // Placeholder pour Mobile Money (MTN, Moov, etc.) - à configurer avec les APIs respectives
  console.log("Mobile Money payment request:", { plan, amount, currency, phone });
  
  return {
    success: false,
    message: "Mobile Money en cours de configuration",
    paymentUrl: null,
    instructions: `Pour payer ${amount} ${currency} via Mobile Money, utilisez votre application mobile money. Référence: MM-${Date.now()}`
  };
}

async function handlePayPalPayment(plan: string, amount: number, currency: string, email: string) {
  // Placeholder pour PayPal - à configurer avec l'API PayPal
  console.log("PayPal payment request:", { plan, amount, currency, email });
  
  return {
    success: false,
    message: "PayPal en cours de configuration",
    paymentUrl: null,
    instructions: `Paiement PayPal de ${amount} ${currency} pour l'abonnement ${plan.toUpperCase()}. Référence: PP-${Date.now()}`
  };
}

async function updateUserSubscription(supabaseClient: any, userId: string, plan: string) {
  const planMapping: Record<string, string> = {
    'basic': 'basic',
    'pro': 'standard',
    'enterprise': 'premium'
  };

  const mappedPlan = planMapping[plan.toLowerCase()] || 'basic';
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 mois d'abonnement

  const { error } = await supabaseClient
    .from('profiles')
    .update({
      subscription_plan: mappedPlan,
      subscription_expires_at: expiresAt.toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Erreur lors de la mise à jour de l'abonnement");
  }

  console.log("Subscription updated successfully:", { userId, plan: mappedPlan });
}