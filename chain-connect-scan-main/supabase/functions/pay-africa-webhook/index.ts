import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayAfricaWebhookPayload {
  transaction_id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  customer_email?: string;
  customer_name?: string;
  created_at: string;
  signature?: string;
}

serve(async (req) => {
  console.log('🔔 Pay.Africa webhook received:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse webhook payload
    const payload: PayAfricaWebhookPayload = await req.json();
    console.log('📦 Pay.Africa payload:', payload);

    // Verify signature if needed (implement your verification logic)
    // const isValidSignature = verifyPayAfricaSignature(payload, req.headers.get('signature'));
    // if (!isValidSignature) {
    //   throw new Error('Invalid signature');
    // }

    // Log the webhook for debugging
    const { error: logError } = await supabase
      .from('payment_webhooks')
      .insert({
        provider: 'pay_africa',
        transaction_id: payload.transaction_id,
        reference: payload.reference,
        amount: payload.amount,
        currency: payload.currency,
        status: payload.status,
        payload: payload,
        processed_at: new Date().toISOString()
      });

    if (logError) {
      console.error('❌ Error logging webhook:', logError);
    }

    // Process payment based on status
    if (payload.status === 'success' || payload.status === 'completed') {
      // Find the order or transaction by reference
      const { data: transaction, error: txError } = await supabase
        .from('transactions')
        .select('*, wallet_id')
        .eq('reference_id', payload.reference)
        .eq('status', 'pending')
        .single();

      if (txError || !transaction) {
        console.log('⚠️ Transaction not found or already processed:', payload.reference);
        return new Response(
          JSON.stringify({ 
            status: 'ok', 
            message: 'Transaction not found or already processed' 
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'completed',
          external_transaction_id: payload.transaction_id,
          completed_at: new Date().toISOString()
        })
        .eq('id', transaction.id);

      if (updateError) {
        console.error('❌ Error updating transaction:', updateError);
        throw updateError;
      }

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          [`balance_${payload.currency.toLowerCase()}`]: supabase.sql`${`balance_${payload.currency.toLowerCase()}`} + ${payload.amount}`
        })
        .eq('id', transaction.wallet_id);

      if (walletError) {
        console.error('❌ Error updating wallet:', walletError);
        throw walletError;
      }

      console.log('✅ Payment processed successfully:', payload.reference);
    } else if (payload.status === 'failed' || payload.status === 'cancelled') {
      // Update transaction as failed
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status: 'failed',
          external_transaction_id: payload.transaction_id,
          completed_at: new Date().toISOString()
        })
        .eq('reference_id', payload.reference);

      if (updateError) {
        console.error('❌ Error updating failed transaction:', updateError);
      }

      console.log('❌ Payment failed:', payload.reference);
    }

    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        message: 'Webhook processed successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});