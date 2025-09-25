import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { action, productData } = await req.json()

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let result;

    switch (action) {
      case 'optimize_title':
        result = await optimizeProductTitle(productData, openaiApiKey)
        break
      case 'generate_description':
        result = await generateProductDescription(productData, openaiApiKey)
        break
      case 'suggest_price':
        result = await suggestOptimalPrice(productData, openaiApiKey)
        break
      case 'analyze_market':
        result = await analyzeMarketTrends(productData, openaiApiKey)
        break
      default:
        throw new Error('Action not supported')
    }

    console.log('AI optimization result:', result)

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in AI product optimization:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function callOpenAI(prompt: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert en marketing et e-commerce spécialisé dans l\'optimisation de produits pour le marché africain, particulièrement la Guinée. Réponds toujours en français.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

async function optimizeProductTitle(productData: any, apiKey: string) {
  const prompt = `
  Optimise ce titre de produit pour améliorer sa visibilité et son attractivité sur une marketplace africaine :
  
  Titre actuel: "${productData.name}"
  Catégorie: ${productData.category || 'Non spécifiée'}
  Prix: ${productData.price} GNF
  
  Suggestions d'amélioration (3-5 titres alternatifs optimisés pour le SEO et l'engagement):
  `
  
  return await callOpenAI(prompt, apiKey)
}

async function generateProductDescription(productData: any, apiKey: string) {
  const prompt = `
  Génère une description attractive et détaillée pour ce produit destiné au marché guinéen :
  
  Nom du produit: "${productData.name}"
  Catégorie: ${productData.category || 'Non spécifiée'}
  Prix: ${productData.price} GNF
  Description existante: "${productData.description || 'Aucune'}"
  
  Crée une description qui :
  - Met en valeur les bénéfices du produit
  - Utilise des termes recherchés localement
  - Inclut un appel à l'action
  - Est optimisée pour le référencement
  - Fait entre 150-300 mots
  `
  
  return await callOpenAI(prompt, apiKey)
}

async function suggestOptimalPrice(productData: any, apiKey: string) {
  const prompt = `
  Analyse et suggère une stratégie de prix optimale pour ce produit sur le marché guinéen :
  
  Produit: "${productData.name}"
  Prix actuel: ${productData.price} GNF
  Catégorie: ${productData.category || 'Non spécifiée'}
  
  Fournis :
  1. Une fourchette de prix recommandée
  2. Une stratégie de pricing (ex: prix psychologique, prix premium, etc.)
  3. Des justifications basées sur le marché local
  4. Des suggestions pour maximiser les ventes
  `
  
  return await callOpenAI(prompt, apiKey)
}

async function analyzeMarketTrends(productData: any, apiKey: string) {
  const prompt = `
  Analyse les tendances du marché pour ce type de produit en Guinée et en Afrique de l'Ouest :
  
  Produit: "${productData.name}"
  Catégorie: ${productData.category || 'Non spécifiée'}
  
  Fournis une analyse incluant :
  1. Tendances actuelles du marché
  2. Saisonnalité et périodes de forte demande
  3. Concurrence probable
  4. Opportunités de croissance
  5. Recommandations marketing
  `
  
  return await callOpenAI(prompt, apiKey)
}