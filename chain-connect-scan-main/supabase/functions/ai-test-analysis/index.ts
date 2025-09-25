import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testResults, analysisType, systemLogs } = await req.json();
    
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let prompt = '';
    let systemMessage = '';

    switch (analysisType) {
      case 'error_detection':
        systemMessage = `Tu es un expert en analyse de logs et détection d'erreurs pour l'application 224SOLUTIONS. 
        Analyse les logs fournis et identifie :
        1. Les erreurs répétées ou critiques
        2. Les patterns suspects de comportement
        3. Les fonctionnalités qui semblent défaillantes
        4. Les problèmes de performance
        Fais un résumé concis et actionnable.`;
        prompt = `Analyse ces logs de tests 224SOLUTIONS :\n\n${JSON.stringify(testResults, null, 2)}\n\nLogs système :\n${systemLogs || 'Aucun log système fourni'}`;
        break;

      case 'security_audit':
        systemMessage = `Tu es un expert en cybersécurité spécialisé dans l'audit d'applications web et mobiles.
        Analyse les résultats de tests de sécurité et identifie :
        1. Les vulnérabilités potentielles (XSS, CSRF, injections)
        2. Les problèmes d'authentification et d'autorisation
        3. Les failles dans la gestion des tokens
        4. Les risques liés aux APIs exposées
        Propose des recommandations de sécurisation.`;
        prompt = `Audit de sécurité pour 224SOLUTIONS :\n\n${JSON.stringify(testResults, null, 2)}`;
        break;

      case 'performance_analysis':
        systemMessage = `Tu es un expert en optimisation de performance d'applications.
        Analyse les métriques de performance et identifie :
        1. Les goulots d'étranglement
        2. Les requêtes lentes ou redondantes
        3. Les problèmes de chargement
        4. Les optimisations possibles
        Propose des solutions concrètes.`;
        prompt = `Analyse de performance 224SOLUTIONS :\n\n${JSON.stringify(testResults, null, 2)}`;
        break;

      case 'final_report':
        systemMessage = `Tu es un chef de projet technique expérimenté qui génère des rapports de validation d'application.
        Créer un rapport final complet incluant :
        1. État général de l'application (prête pour production ?)
        2. Liste des bugs critiques à corriger
        3. Fonctionnalités validées et opérationnelles
        4. Recommandations de sécurité
        5. Plan d'action avant mise en production
        Format le rapport de manière professionnelle et structurée.`;
        prompt = `Génère un rapport final pour la validation de 224SOLUTIONS avant mise en production :\n\nRésultats des tests :\n${JSON.stringify(testResults, null, 2)}\n\nLogs système :\n${systemLogs || 'Aucun log système fourni'}`;
        break;

      case 'bug_classification':
        systemMessage = `Tu es un QA engineer expert qui classe et priorise les bugs.
        Analyse les erreurs détectées et classe-les par :
        1. Priorité (Critique, Haute, Moyenne, Basse)
        2. Impact utilisateur
        3. Complexité de résolution estimée
        4. Suggestions de fix
        Propose un plan de correction priorisé.`;
        prompt = `Classification des bugs 224SOLUTIONS :\n\n${JSON.stringify(testResults, null, 2)}`;
        break;

      default:
        systemMessage = `Tu es un assistant technique expert pour l'application 224SOLUTIONS.
        Analyse les données fournies et donne des insights pertinents.`;
        prompt = `Analyse générale :\n\n${JSON.stringify(testResults, null, 2)}`;
    }

    console.log(`🤖 AI Analysis Request - Type: ${analysisType}`);
    console.log(`📊 Test Results Count: ${Array.isArray(testResults) ? testResults.length : 'Not an array'}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log(`✅ AI Analysis completed successfully`);

    // Optionnel : sauvegarder l'analyse en base
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    try {
      await supabase.from('ai_analysis_logs').insert({
        analysis_type: analysisType,
        input_data: testResults,
        ai_response: analysis,
        system_logs: systemLogs,
        created_at: new Date().toISOString()
      });
    } catch (dbError) {
      console.warn('Could not save analysis to database:', dbError);
      // Continue même si la sauvegarde échoue
    }

    return new Response(JSON.stringify({ 
      analysis,
      analysisType,
      timestamp: new Date().toISOString(),
      model: 'gpt-4.1-2025-04-14'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-test-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});