import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { action, from, to, amount } = await req.json()

    const exchangeApiKey = Deno.env.get('EXCHANGE_RATE_API_KEY')
    if (!exchangeApiKey) {
      console.warn('Exchange rate API key not configured, using cached rates')
    }

    let result;

    switch (action) {
      case 'get_rate':
        result = await getExchangeRate(from, to, supabaseClient, exchangeApiKey)
        break
      case 'convert':
        result = await convertCurrency(from, to, amount, supabaseClient, exchangeApiKey)
        break
      case 'get_popular_rates':
        result = await getPopularRates(supabaseClient, exchangeApiKey)
        break
      case 'update_rates':
        result = await updateAllRates(supabaseClient, exchangeApiKey)
        break
      default:
        throw new Error('Action not supported')
    }

    console.log('Currency exchange result:', result)

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in currency exchange API:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function getExchangeRate(from: string, to: string, supabase: any, apiKey?: string) {
  // Try to get cached rate first
  const { data: cachedRate } = await supabase
    .from('exchange_rates')
    .select('rate, last_updated')
    .eq('base_currency', from.toUpperCase())
    .eq('target_currency', to.toUpperCase())
    .single()

  // If cached rate is recent (less than 1 hour old), use it
  if (cachedRate && new Date().getTime() - new Date(cachedRate.last_updated).getTime() < 3600000) {
    return {
      rate: cachedRate.rate,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      cached: true,
      lastUpdated: cachedRate.last_updated
    }
  }

  // Otherwise, fetch fresh rate if API key is available
  if (apiKey) {
    try {
      const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from.toUpperCase()}/${to.toUpperCase()}`)
      if (!response.ok) throw new Error('Exchange rate API error')
      
      const data = await response.json()
      const rate = data.conversion_rate

      // Update cache
      await supabase
        .from('exchange_rates')
        .upsert({
          base_currency: from.toUpperCase(),
          target_currency: to.toUpperCase(),
          rate: rate,
          last_updated: new Date().toISOString(),
          source: 'exchangerate-api'
        })

      return {
        rate: rate,
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        cached: false,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.warn('Failed to fetch fresh rate:', error)
    }
  }

  // Fallback to cached rate even if old, or return default
  if (cachedRate) {
    return {
      rate: cachedRate.rate,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      cached: true,
      lastUpdated: cachedRate.last_updated,
      warning: 'Rate might be outdated'
    }
  }

  // Default rates for common pairs (fallback)
  const defaultRates: { [key: string]: number } = {
    'USD_GNF': 8600,
    'EUR_GNF': 9400,
    'GNF_USD': 0.000116,
    'GNF_EUR': 0.000106,
    'USD_EUR': 0.92,
    'EUR_USD': 1.09
  }

  const pairKey = `${from.toUpperCase()}_${to.toUpperCase()}`
  const defaultRate = defaultRates[pairKey]

  if (defaultRate) {
    return {
      rate: defaultRate,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      cached: false,
      lastUpdated: new Date().toISOString(),
      warning: 'Using default rate - API not available'
    }
  }

  throw new Error('Exchange rate not available')
}

async function convertCurrency(from: string, to: string, amount: number, supabase: any, apiKey?: string) {
  const rateData = await getExchangeRate(from, to, supabase, apiKey)
  const convertedAmount = amount * rateData.rate

  return {
    originalAmount: amount,
    convertedAmount: convertedAmount,
    fromCurrency: from.toUpperCase(),
    toCurrency: to.toUpperCase(),
    rate: rateData.rate,
    timestamp: new Date().toISOString()
  }
}

async function getPopularRates(supabase: any, apiKey?: string) {
  const popularPairs = [
    ['USD', 'GNF'],
    ['EUR', 'GNF'],
    ['USD', 'EUR'],
    ['GNF', 'USD'],
    ['GNF', 'EUR']
  ]

  const rates = []
  for (const [from, to] of popularPairs) {
    try {
      const rate = await getExchangeRate(from, to, supabase, apiKey)
      rates.push(rate)
    } catch (error) {
      console.warn(`Failed to get rate for ${from}/${to}:`, error)
    }
  }

  return rates
}

async function updateAllRates(supabase: any, apiKey?: string) {
  if (!apiKey) {
    throw new Error('API key required for rate updates')
  }

  const currencies = ['USD', 'EUR', 'GNF', 'XOF', 'NGN']
  const updatedRates = []

  for (let i = 0; i < currencies.length; i++) {
    for (let j = 0; j < currencies.length; j++) {
      if (i !== j) {
        try {
          const rate = await getExchangeRate(currencies[i], currencies[j], supabase, apiKey)
          updatedRates.push(rate)
          // Add delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.warn(`Failed to update rate ${currencies[i]}/${currencies[j]}:`, error)
        }
      }
    }
  }

  return {
    message: `Updated ${updatedRates.length} exchange rates`,
    rates: updatedRates,
    timestamp: new Date().toISOString()
  }
}
