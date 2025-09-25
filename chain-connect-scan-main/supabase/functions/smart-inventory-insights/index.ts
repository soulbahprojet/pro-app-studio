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

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's products and inventory data
    const { data: products, error: productsError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('seller_id', user.id)

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`)
    }

    // Get inventory data
    const { data: inventory, error: inventoryError } = await supabaseClient
      .from('inventory')
      .select('*')
      .eq('vendor_id', user.id)

    if (inventoryError) {
      console.warn('No inventory data found:', inventoryError.message)
    }

    // Get orders data for analysis
    const { data: orders, error: ordersError } = await supabaseClient
      .from('orders')
      .select('*')
      .eq('seller_id', user.id)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())

    if (ordersError) {
      console.warn('No orders data found:', ordersError.message)
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Analyze inventory and generate insights
    const insights = await generateInventoryInsights(
      products || [],
      inventory || [],
      orders || [],
      openaiApiKey
    )

    console.log('Generated inventory insights for user:', user.id)

    return new Response(
      JSON.stringify({ success: true, insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in smart inventory insights:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function generateInventoryInsights(products: any[], inventory: any[], orders: any[], apiKey: string) {
  // Prepare data summary for AI analysis
  const productsSummary = products.map(p => ({
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock_quantity,
    active: p.is_active,
    created: p.created_at
  }))

  const inventorySummary = inventory.map(i => ({
    productId: i.product_id,
    available: i.quantity_available,
    reserved: i.quantity_reserved,
    sold: i.quantity_sold,
    threshold: i.reorder_threshold
  }))

  const salesSummary = orders.map(o => ({
    status: o.status,
    amount: o.total_amount,
    date: o.created_at
  }))

  const prompt = `
  Analyse ces données d'inventaire et de ventes pour un vendeur en Guinée et fournis des insights stratégiques :

  PRODUITS (${products.length} total):
  ${JSON.stringify(productsSummary, null, 2)}

  INVENTAIRE:
  ${JSON.stringify(inventorySummary, null, 2)}

  VENTES (90 derniers jours):
  ${JSON.stringify(salesSummary, null, 2)}

  Fournis une analyse complète avec :

  1. ANALYSE DES PERFORMANCES
  - Produits les plus/moins performants
  - Tendances de vente par catégorie
  - Rotation des stocks

  2. ALERTES ET RECOMMANDATIONS
  - Produits en rupture ou stock faible
  - Produits dormants à liquider
  - Opportunités de réapprovisionnement

  3. OPTIMISATION STRATÉGIQUE
  - Suggestions de pricing
  - Nouveaux produits à introduire
  - Périodes optimales de promotion

  4. PRÉVISIONS BUSINESS
  - Estimation des ventes futures
  - Budget de réapprovisionnement recommandé
  - Stratégies saisonnières

  Réponds en français avec des données chiffrées concrètes et des actions précises.
  `

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en gestion d\'inventaire et analyse business pour les marchés africains. Tes analyses doivent être pratiques et actionables.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'Analyse non disponible'
}