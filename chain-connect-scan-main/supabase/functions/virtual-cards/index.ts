import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateCardRequest {
  name: string;
  cardType: 'virtual' | 'physical';
  spendingControls?: {
    spending_limits?: {
      amount: number;
      interval: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
    }[];
    blocked_categories?: string[];
    allowed_categories?: string[];
  };
  shippingAddress?: {
    line1: string;
    city: string;
    country: string;
    postal_code: string;
    line2?: string;
    state?: string;
  };
}

interface CardActionRequest {
  action: 'freeze' | 'unfreeze' | 'cancel' | 'update_spending_controls';
  cardId: string;
  spendingControls?: any;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-ISSUING] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY_ISSUING");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY_ISSUING is not configured");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id || !user?.email) throw new Error("User not authenticated or missing email");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const body = await req.json();
    const { action } = body;

    if (action === 'create') {
      return await handleCreateCard(supabaseClient, stripe, user, body as CreateCardRequest, req);
    } else if (action === 'get_cards') {
      return await handleGetCards(supabaseClient, user.id);
    } else if (action === 'get_transactions') {
      return await handleGetTransactions(supabaseClient, stripe, user.id, body.cardId);
    } else {
      return await handleCardAction(supabaseClient, stripe, user.id, body as CardActionRequest, req);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCreateCard(supabaseClient: any, stripe: Stripe, user: any, request: CreateCardRequest, req: Request) {
  logStep("Creating new Stripe Issuing card", { userId: user.id, cardType: request.cardType });

  try {
    // Check if user has a Stripe cardholder
    let cardholderId: string;
    const { data: existingCardholder } = await supabaseClient
      .from('stripe_cardholders')
      .select('stripe_cardholder_id')
      .eq('user_id', user.id)
      .single();

    if (existingCardholder) {
      cardholderId = existingCardholder.stripe_cardholder_id;
      logStep("Using existing cardholder", { cardholderId });
    } else {
      // Create new cardholder
      logStep("Creating new cardholder");
      
      const cardholderData: Stripe.Issuing.CardholderCreateParams = {
        type: 'individual',
        name: user.user_metadata?.full_name || user.email,
        email: user.email,
        individual: {
          first_name: user.user_metadata?.first_name || 'User',
          last_name: user.user_metadata?.last_name || 'Name',
          dob: {
            day: 1,
            month: 1,
            year: 1990,
          },
        },
        billing: {
          address: {
            line1: "123 Main St",
            city: "Conakry",
            country: "GN",
            postal_code: "00000",
          },
        },
      };

      const cardholder = await stripe.issuing.cardholders.create(cardholderData);
      cardholderId = cardholder.id;

      // Store cardholder in database
      await supabaseClient
        .from('stripe_cardholders')
        .insert({
          user_id: user.id,
          stripe_cardholder_id: cardholderId,
          individual: cardholderData.individual,
          billing: cardholderData.billing,
          status: 'active'
        });

      logStep("Cardholder created", { cardholderId });
    }

    // Create spending controls
    const spendingControls: Stripe.Issuing.CardCreateParams.SpendingControls = {
      spending_limits: request.spendingControls?.spending_limits || [
        {
          amount: 100000, // 1000 GNF default daily limit
          interval: 'daily',
        },
        {
          amount: 500000, // 5000 GNF default monthly limit 
          interval: 'monthly',
        },
      ],
      blocked_categories: request.spendingControls?.blocked_categories,
      allowed_categories: request.spendingControls?.allowed_categories,
    };

    // Create Stripe Issuing card
    const cardData: Stripe.Issuing.CardCreateParams = {
      cardholder: cardholderId,
      currency: 'usd', // Stripe Issuing requires USD
      type: request.cardType,
      spending_controls: spendingControls,
      metadata: {
        user_id: user.id,
        card_name: request.name,
      },
    };

    if (request.cardType === 'physical' && request.shippingAddress) {
      cardData.shipping = {
        address: request.shippingAddress,
        name: user.user_metadata?.full_name || user.email,
      };
    }

    const stripeCard = await stripe.issuing.cards.create(cardData);
    logStep("Stripe card created", { stripeCardId: stripeCard.id, type: stripeCard.type });

    // Store card in database
    const { data: card, error: cardError } = await supabaseClient
      .from('virtual_cards')
      .insert({
        user_id: user.id,
        stripe_card_id: stripeCard.id,
        stripe_cardholder_id: cardholderId,
        card_name: request.name,
        card_type_stripe: request.cardType,
        status: stripeCard.status,
        last_four: stripeCard.last4,
        spending_controls: spendingControls,
        shipping_address: request.shippingAddress || {},
        balance: 0, // Stripe Issuing doesn't use balance like prepaid cards
        daily_limit: spendingControls.spending_limits?.[0]?.amount || 100000,
        monthly_limit: spendingControls.spending_limits?.[1]?.amount || 500000,
        transaction_limit: spendingControls.spending_limits?.[0]?.amount || 100000,
      })
      .select()
      .single();

    if (cardError) throw cardError;

    // Create transaction record
    await supabaseClient
      .from('card_transactions')
      .insert({
        card_id: card.id,
        transaction_type: 'create',
        description: `Carte Stripe Issuing ${request.cardType} créée`,
        reference_id: stripeCard.id
      });

    // Send notification
    await createNotification(supabaseClient, user.id, card.id, 'card_created', 
      'Nouvelle carte Stripe créée', `Votre carte ${request.name} a été créée avec succès via Stripe Issuing`);

    logStep("Card created successfully", { cardId: card.id, stripeCardId: stripeCard.id });

    return new Response(JSON.stringify({ 
      success: true, 
      card: {
        ...card,
        stripe_details: {
          id: stripeCard.id,
          brand: stripeCard.brand,
          exp_month: stripeCard.exp_month,
          exp_year: stripeCard.exp_year,
          last4: stripeCard.last4,
          type: stripeCard.type,
          status: stripeCard.status,
        }
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (stripeError: any) {
    logStep("Stripe error during card creation", { error: stripeError.message });
    throw new Error(`Erreur Stripe: ${stripeError.message}`);
  }
}

async function handleGetCards(supabaseClient: any, userId: string) {
  logStep("Getting user cards", { userId });

  const { data: cards, error } = await supabaseClient
    .from('virtual_cards')
    .select('*')
    .eq('user_id', userId)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Remove sensitive data and add Stripe info
  const safeCards = cards.map((card: any) => ({
    ...card,
    cvv: undefined,
    pin_hash: undefined,
    has_stripe_issuing: !!card.stripe_card_id,
  }));

  return new Response(JSON.stringify({ cards: safeCards }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function handleGetTransactions(supabaseClient: any, stripe: Stripe, userId: string, cardId: string) {
  logStep("Getting card transactions", { userId, cardId });

  // Verify card ownership
  const { data: card } = await supabaseClient
    .from('virtual_cards')
    .select('*')
    .eq('id', cardId)
    .eq('user_id', userId)
    .single();

  if (!card) throw new Error("Card not found or access denied");

  // Get local transactions
  const { data: localTransactions, error } = await supabaseClient
    .from('card_transactions')
    .select('*')
    .eq('card_id', cardId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  let allTransactions = localTransactions;

  // If it's a Stripe Issuing card, also get Stripe transactions
  if (card.stripe_card_id) {
    try {
      const stripeTransactions = await stripe.issuing.transactions.list({
        card: card.stripe_card_id,
        limit: 50,
      });

      // Convert Stripe transactions to our format
      const convertedStripeTransactions = stripeTransactions.data.map(tx => ({
        id: tx.id,
        card_id: cardId,
        transaction_type: tx.type,
        amount: tx.amount / 100, // Convert from cents
        currency: tx.currency.toUpperCase(),
        description: `${tx.merchant?.name || 'Unknown merchant'} - ${tx.merchant?.city || 'Unknown location'}`,
        status: tx.authorization?.approved ? 'completed' : 'declined',
        merchant_name: tx.merchant?.name,
        location: tx.merchant?.city,
        created_at: new Date(tx.created * 1000).toISOString(),
        reference_id: tx.id,
        is_stripe_transaction: true,
      }));

      allTransactions = [...localTransactions, ...convertedStripeTransactions];
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    } catch (stripeError: any) {
      logStep("Error fetching Stripe transactions", { error: stripeError.message });
      // Continue with local transactions only
    }
  }

  return new Response(JSON.stringify({ transactions: allTransactions }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
}

async function handleCardAction(supabaseClient: any, stripe: Stripe, userId: string, request: CardActionRequest, req: Request) {
  logStep("Handling card action", { userId, action: request.action, cardId: request.cardId });

  // Verify card ownership
  const { data: card, error: cardError } = await supabaseClient
    .from('virtual_cards')
    .select('*')
    .eq('id', request.cardId)
    .eq('user_id', userId)
    .single();

  if (cardError || !card) throw new Error("Card not found or access denied");

  let updateData: any = {};
  let description = '';
  let notificationTitle = '';
  let notificationMessage = '';

  try {
    if (card.stripe_card_id) {
      // Handle Stripe Issuing card actions
      switch (request.action) {
        case 'freeze':
          await stripe.issuing.cards.update(card.stripe_card_id, { status: 'inactive' });
          updateData.status = 'frozen';
          description = 'Carte Stripe gelée';
          notificationTitle = 'Carte gelée';
          notificationMessage = `Votre carte ${card.card_name} a été gelée via Stripe`;
          break;

        case 'unfreeze':
          await stripe.issuing.cards.update(card.stripe_card_id, { status: 'active' });
          updateData.status = 'active';
          description = 'Carte Stripe dégelée';
          notificationTitle = 'Carte dégelée';
          notificationMessage = `Votre carte ${card.card_name} a été dégelée via Stripe`;
          break;

        case 'cancel':
          await stripe.issuing.cards.update(card.stripe_card_id, { status: 'canceled' });
          updateData.status = 'canceled';
          description = 'Carte Stripe annulée';
          notificationTitle = 'Carte annulée';
          notificationMessage = `Votre carte ${card.card_name} a été annulée via Stripe`;
          break;

        case 'update_spending_controls':
          if (!request.spendingControls) throw new Error("Spending controls are required");
          await stripe.issuing.cards.update(card.stripe_card_id, {
            spending_controls: request.spendingControls
          });
          updateData.spending_controls = request.spendingControls;
          description = 'Limites de dépenses mises à jour';
          notificationTitle = 'Limites mises à jour';
          notificationMessage = `Les limites de dépenses de votre carte ${card.card_name} ont été mises à jour`;
          break;

        default:
          throw new Error("Invalid action for Stripe Issuing card");
      }
    } else {
      // Handle legacy simulated card actions
      switch (request.action) {
        case 'freeze':
          if (card.status === 'frozen') throw new Error("Card is already frozen");
          updateData.status = 'frozen';
          description = 'Carte gelée';
          break;

        case 'unfreeze':
          if (card.status !== 'frozen') throw new Error("Card is not frozen");
          updateData.status = 'active';
          description = 'Carte dégelée';
          break;

        default:
          throw new Error("Action not supported for legacy cards");
      }
    }

    // Update card in database
    const { error: updateError } = await supabaseClient
      .from('virtual_cards')
      .update(updateData)
      .eq('id', request.cardId);

    if (updateError) throw updateError;

    // Create transaction record
    await supabaseClient
      .from('card_transactions')
      .insert({
        card_id: request.cardId,
        transaction_type: request.action,
        description,
        reference_id: `${request.action.toUpperCase()}-${request.cardId}-${Date.now()}`
      });

    // Send notification
    await createNotification(supabaseClient, userId, request.cardId, `card_${request.action}`, 
      notificationTitle, notificationMessage);

    logStep("Card action completed", { action: request.action, cardId: request.cardId });

    return new Response(JSON.stringify({ success: true, message: description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (stripeError: any) {
    logStep("Stripe error during card action", { error: stripeError.message });
    throw new Error(`Erreur Stripe: ${stripeError.message}`);
  }
}

async function createNotification(supabaseClient: any, userId: string, cardId: string, type: string, title: string, message: string) {
  await supabaseClient
    .from('card_notifications')
    .insert({
      user_id: userId,
      card_id: cardId,
      type,
      title,
      message
    });
}