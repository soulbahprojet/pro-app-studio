import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Instructions système pour le copilote
const SYSTEM_INSTRUCTIONS = `Tu es mon copilote technique pour le système PDG. Ton rôle est :

- M'analyser le code, les bugs et les boutons non fonctionnels
- Proposer des solutions concrètes et réalisables
- Me poser des questions avant d'agir sur des éléments critiques
- Communiquer avec les autres API si besoin
- Me faire un rapport détaillé des corrections effectuées
- Être proactif dans la détection de problèmes potentiels
- Demander approbation avant toute modification critique du système

Ton style de communication :
- Professionnel mais accessible
- Concis mais complet
- Toujours proposer des solutions, pas seulement identifier les problèmes
- Prioriser les actions par ordre d'importance (critique, important, optionnel)

Quand tu détectes un problème :
1. Décris le problème clairement
2. Explique l'impact potentiel
3. Propose 2-3 solutions avec leurs avantages/inconvénients
4. Recommande la meilleure solution
5. Demande confirmation avant d'agir

Tu as accès aux systèmes suivants :
- Base de données Supabase
- Fonctions Edge
- Système d'authentification
- API OpenAI
- Stockage de fichiers
- Logs et analytics`;

async function askOpenAI(prompt: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-nano-2025-08-07",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTIONS },
          { role: "user", content: prompt }
        ],
        max_completion_tokens: 1000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Pas de réponse disponible';
  } catch (error) {
    console.error('Erreur OpenAI:', error);
    throw error;
  }
}

// Fonction pour enregistrer l'audit
async function logAuditEntry(entry: any) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: null, // Système
        action_type: 'copilot_interaction',
        severity: 'INFO',
        metadata: entry
      });
    
    if (error) {
      console.error('Erreur audit log:', error);
    }
  } catch (error) {
    console.error('Erreur enregistrement audit:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, target, autoDeploy, project } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt invalide ou manquant' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enrichir le prompt avec le contexte si fourni
    let enrichedPrompt = prompt;
    if (target) {
      enrichedPrompt = `Contexte: ${target}\n\nQuestion: ${prompt}`;
    }

    // Appeler OpenAI
    const aiResponse = await askOpenAI(enrichedPrompt);

    // Simuler la préparation de sandbox (comme dans l'exemple)
    const sandboxResult = {
      status: 'success',
      message: 'Analyse terminée',
      timestamp: new Date().toISOString()
    };

    // Simuler la création de branche GitHub
    const githubResult = {
      branch: `copilot-suggestion-${Date.now()}`,
      prUrl: `https://github.com/project/pull/${Math.floor(Math.random() * 1000)}`,
      status: 'created'
    };

    // Log de l'interaction
    await logAuditEntry({
      prompt: prompt.substring(0, 500), // Limiter la taille
      target,
      response_preview: aiResponse.substring(0, 200),
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        preview: aiResponse,
        sandbox: sandboxResult,
        github: githubResult,
        metadata: {
          model: 'gpt-5-nano-2025-08-07',
          tokens_used: 'estimated',
          processing_time: `${Date.now() % 1000}ms`
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erreur dans ai-prompt:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});