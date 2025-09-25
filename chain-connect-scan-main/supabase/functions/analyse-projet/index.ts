import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting store (en mémoire, simple mais efficace)
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requêtes par heure
const RATE_WINDOW = 60 * 60 * 1000; // 1 heure en ms

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimiter.set(userId, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Token d\'authentification requis' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialiser Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Obtenir l'utilisateur actuel
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Utilisateur non authentifié' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Vérifier si l'utilisateur est PDG/Admin
    const { data: adminRole, error: roleError } = await supabase
      .from('admin_roles')
      .select('role_type')
      .eq('user_id', user.id)
      .eq('role_type', 'pdg')
      .single();

    if (roleError || !adminRole) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Accès refusé. Réservé aux PDG et Administrateurs.' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Vérifier le rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ 
        error: 'Limite de requêtes dépassée. Veuillez attendre avant de réessayer.',
        retryAfter: '1 heure'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Valider la requête
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Méthode non autorisée' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { texte } = await req.json();
    if (!texte || typeof texte !== 'string' || texte.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Le champ "texte" est requis et ne peut pas être vide' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (texte.length > 10000) {
      return new Response(JSON.stringify({ error: 'Le texte ne peut pas dépasser 10 000 caractères' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Obtenir la clé API OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Configuration OpenAI manquante' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Appel à l'API OpenAI GPT-4o-mini
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert en analyse de projet. Analyse le texte fourni et produis un rapport structuré avec :
            1. **Résumé exécutif** (2-3 lignes)
            2. **Points forts identifiés**
            3. **Risques et défis potentiels**
            4. **Recommandations stratégiques**
            5. **Prochaines étapes suggérées**
            
            Sois précis, professionnel et constructif dans ton analyse.`
          },
          {
            role: 'user',
            content: texte
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', response.status, errorData);
      return new Response(JSON.stringify({ 
        error: 'Erreur lors de l\'analyse. Veuillez réessayer plus tard.',
        details: response.status === 429 ? 'Limite de l\'API OpenAI atteinte' : 'Erreur de l\'API OpenAI'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const analyse = data.choices[0]?.message?.content;

    if (!analyse) {
      return new Response(JSON.stringify({ error: 'Aucune analyse générée' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Logger l'utilisation (optionnel)
    console.log(`Analyse générée pour l'utilisateur ${user.id} à ${new Date().toISOString()}`);

    return new Response(JSON.stringify({ 
      analyse,
      timestamp: new Date().toISOString(),
      modele: 'gpt-4o-mini'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erreur dans analyse-projet:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur interne du serveur',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});