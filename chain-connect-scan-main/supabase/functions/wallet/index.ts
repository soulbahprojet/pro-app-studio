import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Wallet function called with method:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Authenticated user:', user.id);

    if (req.method === 'GET') {
      return await handleGetWallet(supabase, user.id);
    } else if (req.method === 'POST') {
      let body = {};
      try {
        const rawBody = await req.text();
        console.log('Raw request body:', rawBody);
        if (rawBody.trim()) {
          body = JSON.parse(rawBody);
        }
      } catch (error) {
        console.error('Error parsing request body:', error);
        // If no body or invalid JSON, default to empty object
        body = {};
      }
      return await handleWalletAction(supabase, user.id, body);
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Wallet function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function handleGetWallet(supabase: any, userId: string) {
  try {
    // Get wallet data
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (walletError) {
      throw new Error(`Wallet error: ${walletError.message}`);
    }

    // If no wallet exists, create one
    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({ user_id: userId })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create wallet: ${createError.message}`);
      }

      return new Response(
        JSON.stringify({
          wallet: newWallet,
          transactions: [],
          escrow_transactions: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get recent transactions with related user info for transfers
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select(`
        *,
        wallet:wallets!inner(
          user_id,
          user:profiles!inner(readable_id, full_name, email)
        )
      `)
      .eq('wallet_id', wallet.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // For transfer transactions, we need to get the other party's information
    let enrichedTransactions = transactions || [];
    
    if (transactions) {
      for (const transaction of transactions) {
        if (transaction.type === 'transfer' || transaction.type === 'payment') {
          // Find the corresponding transaction for the other party
          const { data: relatedTransactions } = await supabase
            .from('transactions')
            .select(`
              *,
              wallet:wallets!inner(
                user_id,
                user:profiles!inner(readable_id, full_name, email)
              )
            `)
            .eq('created_at', transaction.created_at)
            .neq('wallet_id', wallet.id)
            .limit(1);
          
          if (relatedTransactions && relatedTransactions.length > 0) {
            // Add the other party's info to the transaction
            transaction.other_party = relatedTransactions[0].wallet.user;
          }
        }
      }
    }

    if (transError) {
      console.error('Transaction error:', transError);
    }

    // Get escrow transactions where user is customer or seller
    const { data: escrowTransactions, error: escrowError } = await supabase
      .from('escrow_transactions')
      .select('*')
      .or(`customer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (escrowError) {
      console.error('Escrow error:', escrowError);
    }

    return new Response(
      JSON.stringify({
        wallet,
        transactions: enrichedTransactions,
        escrow_transactions: escrowTransactions || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in handleGetWallet:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleWalletAction(supabase: any, userId: string, body: any) {
  // Si aucune action n'est spécifiée, retourner les données du wallet (comme un GET)
  if (!body || !body.action) {
    return await handleGetWallet(supabase, userId);
  }

  const { action } = body;

  switch (action) {
    case 'transfer':
      return await handleTransfer(supabase, userId, body);
    case 'withdraw':
      return await handleWithdraw(supabase, userId, body);
    case 'deposit':
      return await handleDeposit(supabase, userId, body);
    case 'get_user_by_id':
      return await getUserById(supabase, body.user_id);
    case 'escrow_payment':
      return await handleEscrowPayment(supabase, body);
    case 'confirm_delivery':
      return await handleConfirmDelivery(supabase, body);
    case 'handle_dispute':
      return await handleDispute(supabase, body);
    default:
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
  }
}

async function handleTransfer(supabase: any, senderId: string, body: any) {
  try {
    const { recipient_id, amount, currency, purpose, reference } = body;

    console.log('Starting transfer:', { senderId, recipient_id, amount, currency });

    // Validation des paramètres
    if (!recipient_id || !amount || !currency) {
      return new Response(
        JSON.stringify({ error: 'Paramètres manquants: recipient_id, amount, currency sont requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (isNaN(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Montant invalide' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get sender wallet
    const { data: senderWallet, error: senderError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', senderId)
      .single();

    if (senderError) {
      return new Response(
        JSON.stringify({ error: `Portefeuille expéditeur introuvable: ${senderError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if sender wallet is frozen
    if (senderWallet.is_frozen) {
      return new Response(
        JSON.stringify({ error: 'Votre portefeuille est bloqué' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get recipient by readable_id or user_id
    let recipientUserId = recipient_id;
    
    // Check if it's a readable_id format (numbers followed by 2 uppercase letters)
    if (typeof recipient_id === 'string' && /^\d+[A-Z]{2}$/.test(recipient_id)) {
      // It's a readable_id format (numbers + 2 letters)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('readable_id', recipient_id)
        .single();

      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ error: `Destinataire introuvable avec l'ID: ${recipient_id}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      recipientUserId = profile.user_id;
    } else {
      // Try to parse as UUID if it's not a readable_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(recipient_id)) {
        return new Response(
          JSON.stringify({ error: `Format d'ID destinataire invalide: ${recipient_id}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Get recipient wallet
    const { data: recipientWallet, error: recipientError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', recipientUserId)
      .single();

    if (recipientError) {
      return new Response(
        JSON.stringify({ error: `Destinataire introuvable: ${recipientError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if recipient wallet is frozen
    if (recipientWallet.is_frozen) {
      return new Response(
        JSON.stringify({ error: 'Le portefeuille du destinataire est bloqué' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const balanceField = `balance_${currency.toLowerCase()}`;
    const senderBalance = senderWallet[balanceField];
    const fee = Math.max(Math.round(amount * 0.01), 1); // 1% fee, minimum 1 unit
    const totalAmount = amount + fee;

    console.log(`Transfer Debug - Currency: ${currency}, Balance Field: ${balanceField}`);
    console.log(`Sender Wallet:`, senderWallet);
    console.log(`Sender Balance: ${senderBalance}, Amount: ${amount}, Fee: ${fee}, Total Required: ${totalAmount}`);

    // Check sender balance
    if (senderBalance < totalAmount) {
      return new Response(
        JSON.stringify({ error: `Solde insuffisant. Nécessaire: ${totalAmount} ${currency} (incluant frais de ${fee}), Disponible: ${senderBalance}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate transaction reference
    const transactionRef = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Process transfer using the database function
    console.log(`Calling process_wallet_transfer with:`, {
      p_sender_id: senderId,
      p_recipient_id: recipientUserId,
      p_amount: amount,
      p_currency: currency.toLowerCase(),
      p_fee: fee,
      p_reference: transactionRef,
      p_purpose: purpose || 'transfer',
      p_description: reference || 'Transfert entre utilisateurs'
    });

    const { data: transferResult, error: updateError } = await supabase.rpc('process_wallet_transfer', {
      p_sender_id: senderId,
      p_recipient_id: recipientUserId,
      p_amount: amount,
      p_currency: currency.toLowerCase(),
      p_fee: fee,
      p_reference: transactionRef,
      p_purpose: purpose || 'transfer',
      p_description: 'Transfert'
    });

    console.log(`Transfer RPC result:`, { transferResult, updateError });

    if (updateError) {
      console.error(`Transfer RPC error:`, updateError);
      return new Response(
        JSON.stringify({ error: `Échec du transfert: ${updateError.message}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send notifications (non-blocking)
    try {
      await Promise.all([
        supabase.functions.invoke('notifications', {
          body: {
            user_id: senderId,
            title: 'Transfert envoyé',
            message: `${amount} ${currency} envoyé avec succès`,
            type: 'transfer_sent',
            data: { reference: transactionRef, amount, currency }
          }
        }),
        supabase.functions.invoke('notifications', {
          body: {
            user_id: recipientUserId,
            title: 'Argent reçu',
            message: `${amount} ${currency} reçu`,
            type: 'transfer_received',
            data: { reference: transactionRef, amount, currency }
          }
        })
      ]);
    } catch (notifError) {
      console.error('Notification error:', notifError);
      // Don't fail the transfer if notifications fail
    }

    return new Response(
      JSON.stringify({
        success: true,
        reference: transactionRef,
        amount,
        currency,
        fee,
        recipient_id: recipientUserId
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('Transfer error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleWithdraw(supabase: any, userId: string, body: any) {
  const { amount, currency, bank_details } = body;

  try {
    // Get user wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      throw new Error('Wallet not found');
    }

    if (wallet.is_frozen) {
      throw new Error('Votre portefeuille est bloqué');
    }

    const balanceField = `balance_${currency.toLowerCase()}`;
    const currentBalance = wallet[balanceField];

    if (currentBalance < amount) {
      throw new Error('Solde insuffisant');
    }

    const withdrawalRef = `WTH-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create withdrawal transaction (pending admin approval)
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        wallet_id: wallet.id,
        type: 'withdrawal',
        amount: -amount,
        currency: currency.toUpperCase(),
        status: 'pending',
        description: `Demande de retrait - ${bank_details}`,
        reference_id: withdrawalRef
      });

    if (transactionError) {
      throw new Error('Erreur lors de la création de la demande');
    }

    return new Response(
      JSON.stringify({
        success: true,
        reference: withdrawalRef,
        message: 'Demande de retrait soumise pour validation'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Withdrawal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function handleDeposit(supabase: any, userId: string, body: any) {
  const { amount, currency, payment_method } = body;

  try {
    console.log('Processing deposit:', { userId, amount, currency, payment_method });

    const depositRef = `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      throw new Error('Wallet not found');
    }

    // Si c'est un crédit de test, mettre à jour directement le solde
    if (payment_method === 'Test Credit') {
      const balanceField = `balance_${currency.toLowerCase()}`;
      const currentBalance = wallet[balanceField] || 0;
      const newBalance = currentBalance + amount;

      console.log(`Updating ${balanceField} from ${currentBalance} to ${newBalance}`);

      // Mettre à jour le solde du portefeuille
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ 
          [balanceField]: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('id', wallet.id);

      if (updateError) {
        throw new Error(`Erreur lors de la mise à jour du solde: ${updateError.message}`);
      }

      // Créer une transaction completed
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'payment',
          amount: amount,
          currency: currency.toUpperCase(),
          status: 'completed',
          description: `Crédit de test pour les fonctionnalités wallet`,
          reference_id: depositRef
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        // Ne pas faire échouer le dépôt si la transaction échoue
      }

      return new Response(
        JSON.stringify({
          success: true,
          reference: depositRef,
          message: `${amount} ${currency} ajouté avec succès`,
          new_balance: newBalance
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Pour les autres méthodes de paiement, créer une transaction en attente
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'deposit',
          amount: amount,
          currency: currency.toUpperCase(),
          status: 'pending',
          description: `Dépôt via ${payment_method}`,
          reference_id: depositRef
        });

      if (transactionError) {
        throw new Error('Erreur lors de la création du dépôt');
      }

      return new Response(
        JSON.stringify({
          success: true,
          reference: depositRef,
          message: 'Demande de dépôt créée'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Deposit error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

async function getUserById(supabase: any, userId: string) {
  try {
    let query;
    
    // Check if it's a readable_id format (numbers followed by 2 uppercase letters)
    if (typeof userId === 'string' && /^\d+[A-Z]{2}$/.test(userId)) {
      query = supabase
        .from('profiles')
        .select('user_id, full_name, readable_id, role')
        .eq('readable_id', userId)
        .single();
    } else {
      query = supabase
        .from('profiles')
        .select('user_id, full_name, readable_id, role')
        .eq('user_id', userId)
        .single();
    }

    const { data: profile, error } = await query;

    if (error || !profile) {
      return new Response(
        JSON.stringify({ error: 'Utilisateur introuvable' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({
        user_id: profile.user_id,
        full_name: profile.full_name,
        readable_id: profile.readable_id,
        role: profile.role
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Get user error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// Existing escrow functions
async function handleEscrowPayment(supabase: any, body: any) {
  const { order_id, customer_id, seller_id, total_amount, commission_rate, currency } = body;

  if (!order_id || !customer_id || !seller_id || !total_amount) {
    throw new Error('Missing required fields for escrow payment');
  }

  const { data: escrowData, error: escrowError } = await supabase
    .rpc('process_escrow_payment', {
      p_order_id: order_id,
      p_customer_id: customer_id,
      p_seller_id: seller_id,
      p_total_amount: total_amount,
      p_commission_rate: commission_rate || 0.20,
      p_currency: currency || 'GNF'
    });

  if (escrowError) throw escrowError;

  return new Response(JSON.stringify({
    escrow_id: escrowData,
    message: 'Escrow payment processed successfully',
    seller_amount: total_amount * (1 - (commission_rate || 0.20)),
    commission: total_amount * (commission_rate || 0.20)
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

async function handleConfirmDelivery(supabase: any, body: any) {
  const { order_id } = body;

  if (!order_id) throw new Error('Order ID required');

  const { error: confirmError } = await supabase
    .rpc('confirm_delivery_escrow', {
      p_order_id: order_id
    });

  if (confirmError) throw confirmError;

  return new Response(JSON.stringify({
    message: 'Delivery confirmed and escrow released'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}

async function handleDispute(supabase: any, body: any) {
  const { escrow_id, dispute_action, resolution } = body;

  if (!escrow_id || !dispute_action) {
    throw new Error('Escrow ID and action required');
  }

  const { error: disputeError } = await supabase
    .rpc('handle_escrow_dispute', {
      p_escrow_id: escrow_id,
      p_action: dispute_action, // 'refund' or 'release'
      p_resolution: resolution
    });

  if (disputeError) throw disputeError;

  return new Response(JSON.stringify({
    message: `Dispute ${dispute_action} processed successfully`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
}