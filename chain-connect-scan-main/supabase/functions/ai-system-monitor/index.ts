import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

console.log('AI System Monitor - API Keys check:', {
  hasOpenAI: !!openAIApiKey,
  hasSupabaseUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey
});

interface SystemCheckResult {
  name: string;
  type: 'function' | 'database' | 'api' | 'interface';
  status: 'success' | 'warning' | 'error';
  responseTime: number;
  error?: string;
  metadata?: any;
}

async function checkEdgeFunction(functionName: string): Promise<SystemCheckResult> {
  const start = Date.now();
  
  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { test: true, monitor: true }
    });
    
    const responseTime = Date.now() - start;
    
    if (error) {
      return {
        name: functionName,
        type: 'function',
        status: 'error',
        responseTime,
        error: error.message
      };
    }
    
    return {
      name: functionName,
      type: 'function',
      status: 'success',
      responseTime,
      metadata: { response: data }
    };
    
  } catch (err) {
    const responseTime = Date.now() - start;
    return {
      name: functionName,
      type: 'function',
      status: 'error',
      responseTime,
      error: err.message
    };
  }
}

async function checkDatabase(): Promise<SystemCheckResult> {
  const start = Date.now();
  
  try {
    // Test de base : compter les profils
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    const responseTime = Date.now() - start;
    
    if (error) {
      return {
        name: 'database',
        type: 'database',
        status: 'error',
        responseTime,
        error: error.message
      };
    }
    
    // Test supplémentaire : vérifier les tables critiques
    const tables = ['wallets', 'orders', 'products', 'transactions'];
    const tableChecks = await Promise.all(
      tables.map(async (table) => {
        try {
          const { error } = await supabase
            .from(table)
            .select('count')
            .limit(1);
          return { table, status: error ? 'error' : 'ok', error: error?.message };
        } catch (err) {
          return { table, status: 'error', error: err.message };
        }
      })
    );
    
    const hasErrors = tableChecks.some(check => check.status === 'error');
    
    return {
      name: 'database',
      type: 'database',
      status: hasErrors ? 'warning' : 'success',
      responseTime,
      metadata: { tableChecks }
    };
    
  } catch (err) {
    const responseTime = Date.now() - start;
    return {
      name: 'database',
      type: 'database',
      status: 'error',
      responseTime,
      error: err.message
    };
  }
}

async function checkOpenAIAPI(): Promise<SystemCheckResult> {
  const start = Date.now();
  
  try {
    if (!openAIApiKey) {
      return {
        name: 'openai-api',
        type: 'api',
        status: 'error',
        responseTime: 0,
        error: 'OpenAI API key not configured'
      };
    }
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    const responseTime = Date.now() - start;
    
    if (!response.ok) {
      const errorBody = await response.text();
      return {
        name: 'openai-api',
        type: 'api',
        status: 'error',
        responseTime,
        error: `HTTP ${response.status}: ${errorBody}`
      };
    }
    
    const data = await response.json();
    
    return {
      name: 'openai-api',
      type: 'api',
      status: 'success',
      responseTime,
      metadata: { modelCount: data.data?.length || 0 }
    };
    
  } catch (err) {
    const responseTime = Date.now() - start;
    return {
      name: 'openai-api',
      type: 'api',
      status: 'error',
      responseTime,
      error: err.message
    };
  }
}

async function runSystemAnalysis() {
  console.log('Starting comprehensive system analysis...');
  
  const results: SystemCheckResult[] = [];
  
  // Vérifier les fonctions Edge critiques
  const criticalFunctions = [
    'ai-prompt',
    'wallet', 
    'notifications',
    'payment-escrow',
    'ai-deploy'
  ];
  
  for (const func of criticalFunctions) {
    try {
      const result = await checkEdgeFunction(func);
      results.push(result);
    } catch (err) {
      results.push({
        name: func,
        type: 'function',
        status: 'error',
        responseTime: 0,
        error: `Check failed: ${err.message}`
      });
    }
  }
  
  // Vérifier la base de données
  const dbResult = await checkDatabase();
  results.push(dbResult);
  
  // Vérifier l'API OpenAI
  const openaiResult = await checkOpenAIAPI();
  results.push(openaiResult);
  
  // Calculer les statistiques globales
  const totalChecks = results.length;
  const successCount = results.filter(r => r.status === 'success').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalChecks;
  
  // Log détaillé pour debugging
  console.log('System Analysis Results:', {
    totalChecks,
    successCount,
    warningCount,
    errorCount,
    avgResponseTime: Math.round(avgResponseTime),
    details: results
  });
  
  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalChecks,
      successCount,
      warningCount,
      errorCount,
      avgResponseTime: Math.round(avgResponseTime),
      healthScore: Math.round((successCount / totalChecks) * 100)
    },
    checks: results,
    recommendations: generateRecommendations(results)
  };
}

function generateRecommendations(results: SystemCheckResult[]) {
  const recommendations = [];
  
  const errorResults = results.filter(r => r.status === 'error');
  const slowResults = results.filter(r => r.responseTime > 5000);
  
  if (errorResults.length > 0) {
    recommendations.push({
      type: 'critical',
      title: 'Erreurs critiques détectées',
      description: `${errorResults.length} composant(s) en erreur: ${errorResults.map(r => r.name).join(', ')}`,
      action: 'investigate_errors',
      priority: 1
    });
  }
  
  if (slowResults.length > 0) {
    recommendations.push({
      type: 'performance',
      title: 'Performance dégradée',
      description: `${slowResults.length} composant(s) lent(s): ${slowResults.map(r => r.name).join(', ')}`,
      action: 'optimize_performance',
      priority: 2
    });
  }
  
  // Recommandations spécifiques selon les erreurs
  errorResults.forEach(result => {
    if (result.name === 'openai-api') {
      recommendations.push({
        type: 'configuration',
        title: 'Problème OpenAI API',
        description: 'Vérifiez la clé API et le quota OpenAI',
        action: 'check_openai_config',
        priority: 1
      });
    }
    
    if (result.type === 'function') {
      recommendations.push({
        type: 'deployment',
        title: `Fonction ${result.name} défaillante`,
        description: 'Considérez un redéploiement de la fonction',
        action: 'redeploy_function',
        priority: 2,
        metadata: { function: result.name }
      });
    }
  });
  
  return recommendations;
}

async function sendNotification(title: string, message: string, type: 'info' | 'warning' | 'error' = 'info') {
  // Log la notification (dans un vrai système, envoyer via SMS/WhatsApp/Push)
  console.log(`📱 Notification [${type.toUpperCase()}]: ${title} - ${message}`);
  
  // Sauvegarder dans les logs d'audit
  try {
    await supabase.from('audit_logs').insert({
      user_id: null,
      action_type: 'ai_notification',
      severity: type.toUpperCase(),
      metadata: {
        title,
        message,
        timestamp: new Date().toISOString(),
        source: 'ai-system-monitor'
      }
    });
  } catch (error) {
    console.warn('Failed to log notification:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action = 'analyze' } = await req.json().catch(() => ({ action: 'analyze' }));
    
    switch (action) {
      case 'analyze':
        const analysisResult = await runSystemAnalysis();
        
        // Envoyer des notifications si des problèmes critiques sont détectés
        if (analysisResult.summary.errorCount > 0) {
          await sendNotification(
            'Problèmes système détectés',
            `${analysisResult.summary.errorCount} erreur(s) détectée(s) dans l'infrastructure`,
            'error'
          );
        }
        
        return new Response(JSON.stringify({
          success: true,
          data: analysisResult
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      case 'health':
        // Version simplifiée pour check rapide
        const healthCheck = {
          timestamp: new Date().toISOString(),
          status: 'healthy',
          version: '1.0.0'
        };
        
        return new Response(JSON.stringify({
          success: true,
          data: healthCheck
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      default:
        return new Response(JSON.stringify({
          error: 'Action non reconnue. Utilisez "analyze" ou "health".'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
    
  } catch (error) {
    console.error('Erreur AI System Monitor:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});