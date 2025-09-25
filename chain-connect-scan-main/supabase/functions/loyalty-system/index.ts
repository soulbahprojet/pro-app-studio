import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoyaltyRequest {
  action: 'add_points' | 'redeem_points' | 'create_promotion' | 'create_gift_card' | 'check_promotion';
  data: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, data }: LoyaltyRequest = await req.json();

    // Get user from auth token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    console.log(`Processing loyalty action: ${action} for user: ${user.id}`);

    switch (action) {
      case 'add_points':
        return await addPoints(supabase, user.id, data);
      
      case 'redeem_points':
        return await redeemPoints(supabase, user.id, data);
      
      case 'create_promotion':
        return await createPromotion(supabase, user.id, data);
      
      case 'create_gift_card':
        return await createGiftCard(supabase, user.id, data);
      
      case 'check_promotion':
        return await checkPromotion(supabase, data);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error: any) {
    console.error('Error in loyalty-system function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function addPoints(supabase: any, userId: string, data: { customer_id: string, points: number, order_id?: string, description?: string }) {
  const { customer_id, points, order_id, description } = data;

  // Vérifier que l'utilisateur est un vendeur et peut ajouter des points à ce client
  const { data: loyaltyCustomer, error: customerError } = await supabase
    .from('loyalty_customers')
    .select('*')
    .eq('id', customer_id)
    .eq('seller_id', userId)
    .single();

  if (customerError || !loyaltyCustomer) {
    throw new Error('Customer not found or access denied');
  }

  // Mettre à jour les points du client
  const { error: updateError } = await supabase
    .from('loyalty_customers')
    .update({
      points: loyaltyCustomer.points + points,
      updated_at: new Date().toISOString()
    })
    .eq('id', customer_id);

  if (updateError) {
    throw new Error('Failed to update customer points');
  }

  // Créer une transaction de points
  const { error: transactionError } = await supabase
    .from('loyalty_transactions')
    .insert({
      customer_id,
      seller_id: userId,
      points_change: points,
      transaction_type: 'earned',
      order_id,
      description: description || `Points ajoutés: ${points}`
    });

  if (transactionError) {
    console.error('Failed to create loyalty transaction:', transactionError);
    // Ne pas échouer si la transaction log échoue
  }

  return new Response(
    JSON.stringify({ success: true, new_points: loyaltyCustomer.points + points }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

async function redeemPoints(supabase: any, userId: string, data: { customer_id: string, points: number, description?: string }) {
  const { customer_id, points, description } = data;

  // Vérifier que l'utilisateur est un vendeur et peut retirer des points à ce client
  const { data: loyaltyCustomer, error: customerError } = await supabase
    .from('loyalty_customers')
    .select('*')
    .eq('id', customer_id)
    .eq('seller_id', userId)
    .single();

  if (customerError || !loyaltyCustomer) {
    throw new Error('Customer not found or access denied');
  }

  if (loyaltyCustomer.points < points) {
    throw new Error('Insufficient points');
  }

  // Mettre à jour les points du client
  const { error: updateError } = await supabase
    .from('loyalty_customers')
    .update({
      points: loyaltyCustomer.points - points,
      updated_at: new Date().toISOString()
    })
    .eq('id', customer_id);

  if (updateError) {
    throw new Error('Failed to update customer points');
  }

  // Créer une transaction de points
  const { error: transactionError } = await supabase
    .from('loyalty_transactions')
    .insert({
      customer_id,
      seller_id: userId,
      points_change: -points,
      transaction_type: 'redeemed',
      description: description || `Points utilisés: ${points}`
    });

  if (transactionError) {
    console.error('Failed to create loyalty transaction:', transactionError);
  }

  return new Response(
    JSON.stringify({ success: true, new_points: loyaltyCustomer.points - points }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

async function createPromotion(supabase: any, userId: string, data: any) {
  // Pour l'instant, utiliser des données simulées car les tables ne sont pas encore créées
  const promotionId = `promo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('Creating promotion for user:', userId, 'with data:', data);

  return new Response(
    JSON.stringify({ 
      success: true, 
      promotion_id: promotionId,
      message: 'Promotion created successfully (simulated)'
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

async function createGiftCard(supabase: any, userId: string, data: { value: number, recipient_email?: string, expires_at?: string }) {
  // Générer un code unique pour la carte cadeau
  const code = `GIFT${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  // Pour l'instant, utiliser des données simulées
  const giftCard = {
    id: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    code,
    value: data.value,
    seller_id: userId,
    status: 'active',
    issued_to: data.recipient_email,
    expires_at: data.expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString()
  };

  console.log('Creating gift card for user:', userId, 'with data:', giftCard);

  return new Response(
    JSON.stringify({ 
      success: true, 
      gift_card: giftCard,
      message: 'Gift card created successfully (simulated)'
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

async function checkPromotion(supabase: any, data: { promotion_code?: string, amount: number }) {
  // Pour l'instant, simuler une vérification de promotion
  console.log('Checking promotion with data:', data);

  // Simuler une promotion trouvée
  if (data.promotion_code === 'LOYALTY10') {
    return new Response(
      JSON.stringify({ 
        success: true, 
        valid: true,
        discount_type: 'percentage',
        discount_value: 10,
        min_purchase: 50000
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      valid: false,
      message: 'Promotion not found or invalid'
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

serve(handler);