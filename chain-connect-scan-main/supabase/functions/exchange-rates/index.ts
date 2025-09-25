import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
  time_last_update_utc: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const apiKey = Deno.env.get('EXCHANGE_RATE_API_KEY');
    if (!apiKey) {
      throw new Error('EXCHANGE_RATE_API_KEY not configured');
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'refresh';

    if (action === 'refresh') {
      // Fetch latest rates from ExchangeRate-API
      console.log('Fetching exchange rates from API...');
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: ExchangeRateResponse = await response.json();
      
      if (data.result !== 'success') {
        throw new Error('Exchange rate API returned error');
      }

      // Update rates in database
      const rates = data.conversion_rates;
      const lastUpdated = new Date(data.time_last_update_utc);
      
      // Batch update rates
      const updates = Object.entries(rates).map(([currency, rate]) => ({
        base_currency: 'USD',
        target_currency: currency,
        rate: rate,
        last_updated: lastUpdated.toISOString(),
        source: 'exchangerate-api'
      }));

      // Insert or update rates
      for (const update of updates) {
        const { error } = await supabase
          .from('exchange_rates')
          .upsert(update, {
            onConflict: 'base_currency,target_currency',
            ignoreDuplicates: false
          });

        if (error) {
          console.error('Error updating rate for', update.target_currency, error);
        }
      }

      console.log(`Updated ${updates.length} exchange rates`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Updated ${updates.length} exchange rates`,
          lastUpdated: lastUpdated.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'convert') {
      const from = url.searchParams.get('from') || 'USD';
      const to = url.searchParams.get('to') || 'GNF';
      const amount = parseFloat(url.searchParams.get('amount') || '1');

      if (from === to) {
        return new Response(
          JSON.stringify({ convertedAmount: amount, rate: 1 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get rate from database first
      let { data: rateData, error } = await supabase
        .from('exchange_rates')
        .select('rate')
        .eq('base_currency', from)
        .eq('target_currency', to)
        .order('last_updated', { ascending: false })
        .limit(1)
        .single();

      if (error || !rateData) {
        // Try reverse conversion
        const { data: reverseRateData, error: reverseError } = await supabase
          .from('exchange_rates')
          .select('rate')
          .eq('base_currency', to)
          .eq('target_currency', from)
          .order('last_updated', { ascending: false })
          .limit(1)
          .single();

        if (reverseError || !reverseRateData) {
          // Fetch direct conversion from API
          console.log(`Fetching conversion rate ${from} to ${to} from API...`);
          const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}/${amount}`
          );
          
          if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          
          return new Response(
            JSON.stringify({ 
              convertedAmount: data.conversion_result,
              rate: data.conversion_rate
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // Use reverse rate
          const rate = 1 / reverseRateData.rate;
          return new Response(
            JSON.stringify({ 
              convertedAmount: amount * rate,
              rate: rate
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      const convertedAmount = amount * rateData.rate;
      
      return new Response(
        JSON.stringify({ 
          convertedAmount: convertedAmount,
          rate: rateData.rate
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'rates') {
      // Get all current rates
      const { data: rates, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .order('last_updated', { ascending: false });

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({ rates }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Exchange rates error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});