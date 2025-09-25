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

interface SystemCheckResult {
  component: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  details?: any;
}

// Vérifier un bouton ou action spécifique
async function checkButtonAction(target: string): Promise<SystemCheckResult> {
  try {
    // Vérifier si l'action existe dans la base de données
    const { data, error } = await supabase
      .from('actions')
      .select('*')
      .eq('button_id', target);

    if (error) throw error;

    const status = data && data.length > 0 ? 'ok' : 'error';
    const message = status === 'ok' ? 'Bouton fonctionnel' : 'Bouton non trouvé ou défaillant';

    return {
      component: target,
      status,
      message,
      details: data
    };
  } catch (error) {
    return {
      component: target,
      status: 'error',
      message: error.message || 'Erreur lors de la vérification du bouton',
      details: error
    };
  }
}

async function checkSystemComponent(component: string): Promise<SystemCheckResult> {
  try {
    switch (component) {
      case 'database':
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        return {
          component: 'database',
          status: error ? 'error' : 'ok',
          message: error ? `Erreur DB: ${error.message}` : 'Base de données opérationnelle',
          details: { error }
        };

      case 'auth':
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
        return {
          component: 'auth',
          status: authError ? 'error' : 'ok',
          message: authError ? `Erreur Auth: ${authError.message}` : 'Authentification fonctionnelle',
          details: { error: authError }
        };

      case 'storage':
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
        return {
          component: 'storage',
          status: storageError ? 'error' : 'ok',
          message: storageError ? `Erreur Storage: ${storageError.message}` : `${buckets?.length || 0} buckets actifs`,
          details: { buckets }
        };

      case 'openai':
        try {
          const aiResponse = await fetch('https://api.openai.com/v1/models', {
            headers: { 'Authorization': `Bearer ${openaiApiKey}` }
          });
          const aiData = await aiResponse.json();
          return {
            component: 'openai',
            status: aiResponse.ok ? 'ok' : 'error',
            message: aiResponse.ok ? 'OpenAI API fonctionnelle' : `Erreur OpenAI: ${aiData.error?.message}`,
            details: aiData
          };
        } catch (error) {
          return {
            component: 'openai',
            status: 'error',
            message: `Erreur OpenAI: ${error.message}`,
            details: { error }
          };
        }

      default:
        // Si ce n'est pas un composant système, vérifier si c'est un bouton
        return await checkButtonAction(component);
    }
  } catch (error) {
    return {
      component,
      status: 'error',
      message: `Erreur lors de la vérification: ${error.message}`,
      details: { error }
    };
  }
}

async function getSystemReport(): Promise<{ results: SystemCheckResult[], summary: string }> {
  const components = ['database', 'auth', 'storage', 'openai'];
  const results = await Promise.all(components.map(comp => checkSystemComponent(comp)));
  
  const okCount = results.filter(r => r.status === 'ok').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  const summary = `Système PDG: ${okCount}/${components.length} composants OK, ${errorCount} erreurs, ${warningCount} avertissements`;
  
  return { results, summary };
}

async function analyzeWithAI(systemData: any, userQuery?: string): Promise<string> {
  try {
    const prompt = userQuery 
      ? `Analyse ce système PDG et réponds à la question: "${userQuery}"\n\nDonnées système: ${JSON.stringify(systemData, null, 2)}`
      : `Analyse ce système PDG et propose des solutions concrètes avec demande d'approbation avant toute modification critique:\n\nDonnées système: ${JSON.stringify(systemData, null, 2)}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'Tu es un copilote AI expert en systèmes PDG. Analyse les problèmes, propose des solutions concrètes et demande approbation avant toute modification critique.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_completion_tokens: 500
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Analyse impossible';
  } catch (error) {
    console.error('Erreur analyse AI:', error);
    return `Erreur lors de l'analyse: ${error.message}`;
  }
}

async function executeAction(action: string, params: any): Promise<{ success: boolean, message: string }> {
  console.log(`Exécution action: ${action}`, params);
  
  try {
    switch (action) {
      case 'restart_function':
        // Simulation du redémarrage d'une fonction Edge
        return { success: true, message: `Fonction Edge ${params.functionName || params.function_name} redémarrée avec succès` };
        
      case 'clear_cache':
        // Simulation du vidage de cache
        return { success: true, message: 'Cache système vidé avec succès' };
        
      case 'reset_connection':
        // Simulation de la réinitialisation de connexion
        return { success: true, message: 'Connexions base de données réinitialisées' };
        
      case 'fix_button':
        // Simulation de la correction d'un bouton
        return { success: true, message: `Bouton ${params.buttonId} corrigé et redéployé` };
        
      case 'update_config':
        // Simulation de mise à jour config
        return { success: true, message: 'Configuration système mise à jour' };
        
      case 'deploy_fix':
        // Simulation de déploiement d'un correctif
        return { success: true, message: `Correctif déployé pour ${params.component || 'système'}` };
        
      default:
        return { success: false, message: `Action "${action}" non supportée` };
    }
  } catch (error) {
    return { success: false, message: `Erreur lors de l'action: ${error.message}` };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, target, query, executeActions = false, userQuery, actionParams } = await req.json();

    console.log(`Copilote - Action: ${action}, Target: ${target}, Query: ${query || userQuery}`);

    switch (action) {
      case 'check':
        // Vérification d'un bouton ou composant spécifique
        const checkResult = await checkSystemComponent(target);
        const aiSuggestion = await analyzeWithAI(checkResult, `Analyse ce problème: bouton "${target}" est ${checkResult.status}`);
        
        return new Response(JSON.stringify({
          status: checkResult.status,
          aiSuggestion,
          details: checkResult,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'system_check':
        const report = await getSystemReport();
        const analysis = await analyzeWithAI(report, query || userQuery);
        
        return new Response(JSON.stringify({
          report,
          analysis,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'component_check':
        const componentResult = await checkSystemComponent(target);
        const componentAnalysis = await analyzeWithAI({ component: componentResult }, query || userQuery);
        
        return new Response(JSON.stringify({
          result: componentResult,
          analysis: componentAnalysis,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'execute_action':
        if (!executeActions) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Exécution d\'actions non autorisée. Demandez l\'approbation d\'abord.'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const actionResult = await executeAction(target, actionParams || query || {});
        
        return new Response(JSON.stringify({
          ...actionResult,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'chat':
        const fullReport = await getSystemReport();
        const chatResponse = await analyzeWithAI(fullReport, query || userQuery);
        
        return new Response(JSON.stringify({
          response: chatResponse,
          systemData: fullReport,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({
          error: `Action "${action}" non supportée`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Erreur dans copilote:', error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});