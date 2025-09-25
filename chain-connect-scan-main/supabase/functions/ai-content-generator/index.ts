import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, prompt, productData } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    switch (type) {
      case 'generate-image': {
        // Generate marketing image using DALL-E
        const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: `Professional marketing image for digital product: ${prompt}. Modern, clean, high-quality commercial design.`,
            n: 1,
            size: '1024x1024',
            quality: 'high',
            style: 'vivid'
          }),
        });

        if (!imageResponse.ok) {
          const error = await imageResponse.json();
          throw new Error(error.error?.message || 'Failed to generate image');
        }

        const imageData = await imageResponse.json();
        
        return new Response(JSON.stringify({ 
          imageUrl: imageData.data[0].url,
          type: 'image'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'generate-description': {
        // Generate product description using GPT
        const descriptionPrompt = `
          Créez une description marketing professionnelle pour ce produit numérique:
          
          Nom du produit: ${productData?.name || prompt}
          Type: ${productData?.type || 'Produit numérique'}
          Prix: ${productData?.price || 'Non spécifié'}
          
          Incluez:
          1. Un titre accrocheur (max 60 caractères)
          2. Une description détaillée (150-200 mots)
          3. 5 points clés/avantages
          4. 5 mots-clés SEO
          5. 3 hashtags marketing
          
          Format de réponse en JSON:
          {
            "title": "...",
            "description": "...",
            "benefits": ["...", "...", "...", "...", "..."],
            "keywords": ["...", "...", "...", "...", "..."],
            "hashtags": ["...", "...", "..."]
          }
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-5-2025-08-07',
            messages: [
              { 
                role: 'system', 
                content: 'Vous êtes un expert en marketing digital spécialisé dans la création de contenu commercial optimisé pour les produits numériques.' 
              },
              { role: 'user', content: descriptionPrompt }
            ],
            max_completion_tokens: 1000
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to generate description');
        }

        const data = await response.json();
        let generatedContent;
        
        try {
          generatedContent = JSON.parse(data.choices[0].message.content);
        } catch {
          // Fallback if not valid JSON
          generatedContent = {
            title: productData?.name || prompt,
            description: data.choices[0].message.content,
            benefits: [],
            keywords: [],
            hashtags: []
          };
        }

        return new Response(JSON.stringify({ 
          content: generatedContent,
          type: 'description'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'analyze-content': {
        // Analyze existing content for improvements
        const analysisPrompt = `
          Analysez ce contenu de produit numérique et suggérez des améliorations:
          
          Titre: ${productData?.title}
          Description: ${productData?.description}
          
          Fournissez des suggestions pour:
          1. Améliorer le titre (SEO et marketing)
          2. Optimiser la description
          3. Détecter les incohérences
          4. Suggérer des mots-clés manquants
          
          Répondez en JSON avec ces clés: titleSuggestions, descriptionImprovements, inconsistencies, missingKeywords
        `;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-5-2025-08-07',
            messages: [
              { 
                role: 'system', 
                content: 'Vous êtes un analyste de contenu marketing spécialisé dans l\'optimisation de produits numériques.' 
              },
              { role: 'user', content: analysisPrompt }
            ],
            max_completion_tokens: 800
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'Failed to analyze content');
        }

        const data = await response.json();
        let analysis;
        
        try {
          analysis = JSON.parse(data.choices[0].message.content);
        } catch {
          analysis = {
            titleSuggestions: ['Améliorer la clarté du titre'],
            descriptionImprovements: ['Ajouter plus de détails'],
            inconsistencies: [],
            missingKeywords: []
          };
        }

        return new Response(JSON.stringify({ 
          analysis,
          type: 'analysis'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error('Invalid content generation type');
    }
  } catch (error) {
    console.error('AI content generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});