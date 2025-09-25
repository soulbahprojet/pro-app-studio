import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    const body = await req.json();
    const { action, monitoring_config } = body;

    console.log('Real-time Security Monitor called:', { action });

    switch (action) {
      case 'start_monitoring':
        return await startRealTimeMonitoring(supabase, openaiKey, monitoring_config);
      
      case 'check_table_integrity':
        return await checkTableIntegrity(supabase, monitoring_config?.tables);
      
      case 'validate_api_communications':
        return await validateApiCommunications(supabase);
      
      case 'monitor_critical_flows':
        return await monitorCriticalFlows(supabase, openaiKey);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown monitoring action' }),
          { status: 400, headers: corsHeaders }
        );
    }

  } catch (error) {
    console.error('Error in Real-time Security Monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function startRealTimeMonitoring(supabase: any, openaiKey: string, config: any) {
  console.log('Starting real-time security monitoring...');

  const criticalTables = [
    'profiles', 'wallets', 'transactions', 'orders', 'escrow_transactions',
    'products', 'shipments', 'delivery_tracking', 'admin_roles'
  ];

  const monitoringResults = {
    timestamp: new Date().toISOString(),
    tables_monitored: [],
    threats_detected: [],
    automated_actions: [],
    system_health: 'healthy'
  };

  // Monitor each critical table
  for (const table of criticalTables) {
    try {
      const tableResult = await monitorTable(supabase, table, openaiKey);
      monitoringResults.tables_monitored.push({
        table,
        status: tableResult.status,
        threats_found: tableResult.threats.length,
        last_checked: new Date().toISOString()
      });

      if (tableResult.threats.length > 0) {
        monitoringResults.threats_detected.push(...tableResult.threats);
      }

      if (tableResult.automated_actions.length > 0) {
        monitoringResults.automated_actions.push(...tableResult.automated_actions);
      }

    } catch (error) {
      console.warn(`Monitoring error for ${table}:`, error.message);
      monitoringResults.tables_monitored.push({
        table,
        status: 'error',
        error: error.message,
        last_checked: new Date().toISOString()
      });
    }
  }

  // Determine overall system health
  if (monitoringResults.threats_detected.length > 5) {
    monitoringResults.system_health = 'critical';
  } else if (monitoringResults.threats_detected.length > 2) {
    monitoringResults.system_health = 'warning';
  }

  // Store monitoring session
  await supabase
    .from('security_monitoring_sessions')
    .insert({
      session_type: 'real_time_monitor',
      results: monitoringResults,
      created_at: new Date().toISOString()
    });

  // Send alerts if critical issues found
  if (monitoringResults.system_health === 'critical') {
    await supabase.functions.invoke('ai-security-orchestrator', {
      body: {
        action: 'analyze_security_event',
        event: {
          type: 'unusual_activity',
          severity: 'critical',
          description: `Monitoring critique: ${monitoringResults.threats_detected.length} menaces détectées`,
          metadata: { monitoring_results: monitoringResults }
        }
      }
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      monitoring_results: monitoringResults
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function monitorTable(supabase: any, tableName: string, openaiKey: string) {
  const result = {
    status: 'healthy',
    threats: [],
    automated_actions: []
  };

  try {
    // Get recent data (last 30 minutes)
    const { data: recentData, error } = await supabase
      .from(tableName)
      .select('*')
      .gte('created_at', new Date(Date.now() - 1800000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      result.status = 'error';
      return result;
    }

    if (!recentData || recentData.length === 0) {
      return result; // No recent activity
    }

    // Analyze patterns
    const analysis = analyzeTableActivity(tableName, recentData);
    
    if (analysis.anomalies.length > 0) {
      result.threats.push(...analysis.anomalies);
      result.status = 'suspicious';

      // AI analysis for complex patterns
      if (openaiKey && analysis.anomalies.length > 2) {
        const aiAnalysis = await analyzeWithAI(tableName, analysis, openaiKey);
        if (aiAnalysis.threats) {
          result.threats.push(...aiAnalysis.threats);
        }
        if (aiAnalysis.actions) {
          result.automated_actions.push(...aiAnalysis.actions);
        }
      }
    }

    // Role-based access violations check
    if (['profiles', 'admin_roles', 'wallets'].includes(tableName)) {
      const accessViolations = await checkAccessViolations(supabase, tableName, recentData);
      if (accessViolations.length > 0) {
        result.threats.push(...accessViolations);
        result.status = 'critical';
      }
    }

  } catch (error) {
    result.status = 'error';
    console.error(`Error monitoring ${tableName}:`, error);
  }

  return result;
}

async function checkTableIntegrity(supabase: any, tables?: string[]) {
  const criticalTables = tables || [
    'profiles', 'wallets', 'transactions', 'orders', 'products'
  ];

  const integrityResults = [];

  for (const table of criticalTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        integrityResults.push({
          table,
          status: 'error',
          error: error.message
        });
        continue;
      }

      // Check for obvious integrity issues
      const issues = [];
      
      // Check for suspicious record counts
      if (table === 'admin_roles' && count > 10) {
        issues.push('Nombre anormalement élevé d\'administrateurs');
      }

      if (table === 'wallets' && count === 0) {
        issues.push('Aucun portefeuille trouvé - problème critique');
      }

      integrityResults.push({
        table,
        status: issues.length > 0 ? 'warning' : 'healthy',
        record_count: count,
        issues
      });

    } catch (error) {
      integrityResults.push({
        table,
        status: 'error',
        error: error.message
      });
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      integrity_check: {
        tables_checked: criticalTables.length,
        results: integrityResults,
        timestamp: new Date().toISOString()
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function validateApiCommunications(supabase: any) {
  console.log('Validating API communications...');

  const apiEndpoints = [
    { name: 'profiles', table: 'profiles' },
    { name: 'orders', table: 'orders' },
    { name: 'wallets', table: 'wallets' },
    { name: 'products', table: 'products' }
  ];

  const communicationResults = [];

  for (const endpoint of apiEndpoints) {
    try {
      const start = Date.now();
      const { data, error } = await supabase
        .from(endpoint.table)
        .select('id')
        .limit(1);

      const responseTime = Date.now() - start;

      communicationResults.push({
        endpoint: endpoint.name,
        status: error ? 'error' : 'healthy',
        response_time_ms: responseTime,
        error: error?.message,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      communicationResults.push({
        endpoint: endpoint.name,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Check overall API health
  const healthyEndpoints = communicationResults.filter(r => r.status === 'healthy').length;
  const overallHealth = healthyEndpoints === apiEndpoints.length ? 'healthy' : 
                       healthyEndpoints > apiEndpoints.length / 2 ? 'degraded' : 'critical';

  return new Response(
    JSON.stringify({
      success: true,
      api_validation: {
        overall_health: overallHealth,
        endpoints_checked: apiEndpoints.length,
        healthy_endpoints: healthyEndpoints,
        results: communicationResults,
        timestamp: new Date().toISOString()
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function monitorCriticalFlows(supabase: any, openaiKey: string) {
  console.log('Monitoring critical business flows...');

  const flows = [
    {
      name: 'user_registration_flow',
      check: async () => {
        const { data } = await supabase
          .from('profiles')
          .select('user_id, created_at, role')
          .gte('created_at', new Date(Date.now() - 3600000).toISOString());
        return { success: true, data, count: data?.length || 0 };
      }
    },
    {
      name: 'order_creation_flow', 
      check: async () => {
        const { data } = await supabase
          .from('orders')
          .select('id, customer_id, seller_id, status, created_at')
          .gte('created_at', new Date(Date.now() - 3600000).toISOString());
        return { success: true, data, count: data?.length || 0 };
      }
    },
    {
      name: 'payment_escrow_flow',
      check: async () => {
        const { data } = await supabase
          .from('escrow_transactions')
          .select('id, status, total_amount, created_at')
          .gte('created_at', new Date(Date.now() - 3600000).toISOString());
        return { success: true, data, count: data?.length || 0 };
      }
    },
    {
      name: 'delivery_tracking_flow',
      check: async () => {
        const { data } = await supabase
          .from('delivery_tracking')
          .select('id, status, courier_id, created_at')
          .gte('created_at', new Date(Date.now() - 3600000).toISOString());
        return { success: true, data, count: data?.length || 0 };
      }
    }
  ];

  const flowResults = [];

  for (const flow of flows) {
    try {
      const result = await flow.check();
      
      // Analyze flow health
      let status = 'healthy';
      const issues = [];

      if (flow.name === 'user_registration_flow' && result.count > 50) {
        status = 'warning';
        issues.push('Pic d\'inscriptions inhabituellement élevé');
      }

      if (flow.name === 'order_creation_flow' && result.count === 0) {
        status = 'warning';
        issues.push('Aucune commande créée dans la dernière heure');
      }

      flowResults.push({
        flow: flow.name,
        status,
        activity_count: result.count,
        issues,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      flowResults.push({
        flow: flow.name,
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // AI analysis of flow patterns
  let aiInsights = null;
  if (openaiKey) {
    try {
      const aiAnalysis = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{
            role: 'system',
            content: 'Analysez les flux critiques d\'une plateforme e-commerce et identifiez les anomalies ou problèmes potentiels. Répondez en français.'
          }, {
            role: 'user',
            content: `Résultats des flux critiques: ${JSON.stringify(flowResults)}`
          }],
          max_tokens: 400,
          temperature: 0.3
        })
      });

      if (aiAnalysis.ok) {
        const aiData = await aiAnalysis.json();
        aiInsights = aiData.choices?.[0]?.message?.content;
      }
    } catch (error) {
      console.warn('AI analysis failed for critical flows:', error);
    }
  }

  return new Response(
    JSON.stringify({
      success: true,
      critical_flows: {
        flows_monitored: flows.length,
        results: flowResults,
        ai_insights: aiInsights,
        timestamp: new Date().toISOString()
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function analyzeTableActivity(tableName: string, data: any[]) {
  const anomalies = [];

  // Volume analysis
  if (data.length > 30) {
    anomalies.push({
      type: 'high_volume',
      table: tableName,
      message: `Volume élevé d'activité: ${data.length} enregistrements en 30min`,
      severity: 'medium'
    });
  }

  // User pattern analysis
  const userIds = data.map(d => d.user_id || d.customer_id || d.seller_id).filter(Boolean);
  const uniqueUsers = new Set(userIds).size;
  
  if (userIds.length > 15 && uniqueUsers < 3) {
    anomalies.push({
      type: 'suspicious_user_pattern',
      table: tableName,
      message: `Activité concentrée sur peu d'utilisateurs: ${uniqueUsers} utilisateurs pour ${userIds.length} actions`,
      severity: 'high'
    });
  }

  // Time pattern analysis
  const timestamps = data.map(d => new Date(d.created_at).getHours());
  const nightActivity = timestamps.filter(h => h < 6 || h > 22).length;
  
  if (nightActivity > data.length * 0.8) {
    anomalies.push({
      type: 'unusual_time_pattern',
      table: tableName,
      message: `Activité principalement nocturne: ${nightActivity}/${data.length} actions`,
      severity: 'medium'
    });
  }

  return { anomalies };
}

async function checkAccessViolations(supabase: any, tableName: string, data: any[]) {
  const violations = [];

  // Check for unauthorized admin role creations
  if (tableName === 'admin_roles') {
    const adminCreations = data.filter(d => d.role_type === 'admin' || d.role_type === 'pdg');
    if (adminCreations.length > 1) {
      violations.push({
        type: 'unauthorized_admin_creation',
        table: tableName,
        message: `Création suspecte de rôles admin: ${adminCreations.length} nouveaux admins`,
        severity: 'critical'
      });
    }
  }

  // Check for wallet manipulation
  if (tableName === 'wallets') {
    const highBalanceChanges = data.filter(d => 
      d.balance_gnf > 10000000 || d.balance_usd > 5000 || d.balance_eur > 4000
    );
    if (highBalanceChanges.length > 0) {
      violations.push({
        type: 'suspicious_wallet_activity',
        table: tableName,
        message: `Modifications de portefeuille à montant élevé détectées`,
        severity: 'high'
      });
    }
  }

  return violations;
}

async function analyzeWithAI(tableName: string, analysis: any, openaiKey: string) {
  try {
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'Vous êtes un expert en sécurité des données. Analysez les anomalies détectées et recommandez des actions.'
        }, {
          role: 'user',
          content: `Table: ${tableName}, Anomalies: ${JSON.stringify(analysis.anomalies)}`
        }],
        max_tokens: 300,
        temperature: 0.2
      })
    });

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      const content = aiData.choices?.[0]?.message?.content;
      
      return {
        threats: [{
          type: 'ai_analysis',
          table: tableName,
          message: content,
          severity: 'info'
        }],
        actions: []
      };
    }
  } catch (error) {
    console.warn('AI analysis failed:', error);
  }

  return { threats: [], actions: [] };
}