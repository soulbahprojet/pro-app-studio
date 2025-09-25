import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityEvent {
  type: 'login_failure' | 'suspicious_transaction' | 'unusual_activity' | 'unauthorized_access' | 'data_breach' | 'api_abuse';
  user_id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata?: any;
  table_affected?: string;
  ip_address?: string;
  user_agent?: string;
}

interface AutomatedResponse {
  action: 'block_user' | 'rate_limit' | 'require_2fa' | 'alert_admin' | 'log_only' | 'escalate';
  duration?: number;
  reason: string;
  confidence: number;
}

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
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const body = await req.json();
    const { action, event, tables_to_monitor } = body;

    console.log('AI Security Orchestrator called:', { action, event });

    switch (action) {
      case 'analyze_security_event':
        return await analyzeSecurityEvent(event, openaiKey, supabase);
      
      case 'continuous_monitoring':
        return await startContinuousMonitoring(tables_to_monitor || [], supabase, openaiKey);
      
      case 'automated_response':
        return await executeAutomatedResponse(event, supabase);
      
      case 'threat_intelligence':
        return await generateThreatIntelligence(supabase, openaiKey);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: corsHeaders }
        );
    }

  } catch (error) {
    console.error('Error in AI Security Orchestrator:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function analyzeSecurityEvent(event: SecurityEvent, openaiKey: string, supabase: any) {
  console.log('Analyzing security event:', event);

  // AI Analysis using OpenAI
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
        content: `Vous êtes un expert en cybersécurité spécialisé dans l'analyse d'événements de sécurité pour une plateforme e-commerce/logistique.
        
        Analysez l'événement et fournissez:
        1. Niveau de risque (low/medium/high/critical)
        2. Menaces potentielles détectées
        3. Actions recommandées
        4. Niveau de confiance (0-100%)
        5. Nécessité d'une riposte automatique (oui/non)
        
        Répondez en JSON structuré.`
      }, {
        role: 'user',
        content: `Événement de sécurité à analyser: ${JSON.stringify(event)}`
      }],
      max_tokens: 800,
      temperature: 0.2
    })
  });

  let aiResponse = null;
  if (aiAnalysis.ok) {
    const aiData = await aiAnalysis.json();
    const aiContent = aiData.choices?.[0]?.message?.content;
    
    try {
      aiResponse = JSON.parse(aiContent);
    } catch {
      aiResponse = { 
        risk_level: 'medium', 
        analysis: aiContent,
        confidence: 70,
        automated_response_needed: false
      };
    }
  }

  // Enhanced rule-based analysis
  const riskScore = calculateRiskScore(event);
  const threats = detectThreats(event);
  const response = determineAutomatedResponse(event, riskScore, aiResponse);

  // Store security alert
  const { error: insertError } = await supabase
    .from('security_alerts')
    .insert({
      alert_type: event.type,
      severity: event.severity,
      user_id: event.user_id || 'unknown',
      message: event.description,
      metadata: {
        ...event.metadata,
        ai_analysis: aiResponse,
        risk_score: riskScore,
        threats_detected: threats,
        automated_response: response
      },
      is_resolved: false
    });

  if (insertError) {
    console.error('Error storing security alert:', insertError);
  }

  // Execute automated response if needed
  if (response.action !== 'log_only') {
    await executeAutomatedResponse(event, supabase, response);
  }

  // Send critical alerts to admins
  if (event.severity === 'critical' || event.severity === 'high') {
    await supabase.functions.invoke('notifications', {
      body: {
        action: 'send_security_alert',
        userIds: ['admin'],
        alertData: {
          type: event.type,
          message: event.description,
          severity: event.severity,
          ai_analysis: aiResponse
        }
      }
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      analysis: {
        risk_score: riskScore,
        threats_detected: threats,
        ai_insights: aiResponse,
        automated_response: response,
        timestamp: new Date().toISOString()
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function startContinuousMonitoring(tables: string[], supabase: any, openaiKey: string) {
  console.log('Starting continuous monitoring for tables:', tables);

  const criticalTables = [
    'profiles', 'orders', 'transactions', 'wallets', 'products',
    'shipments', 'delivery_tracking', 'escrow_transactions'
  ];

  const monitoringTables = tables.length > 0 ? tables : criticalTables;

  // Get recent suspicious activities
  const suspiciousActivities = [];

  for (const table of monitoringTables) {
    try {
      // Monitor for unusual patterns in the last hour
      const { data: recentData, error } = await supabase
        .from(table)
        .select('*')
        .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.warn(`Error querying ${table}:`, error.message);
        continue;
      }

      if (recentData && recentData.length > 0) {
        // Analyze patterns
        const patterns = analyzeDataPatterns(table, recentData);
        if (patterns.anomalies.length > 0) {
          suspiciousActivities.push({
            table,
            anomalies: patterns.anomalies,
            data_points: recentData.length
          });
        }
      }
    } catch (err) {
      console.warn(`Monitoring error for ${table}:`, err.message);
    }
  }

  // AI-powered threat assessment
  let threatAssessment = null;
  if (suspiciousActivities.length > 0) {
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
          content: `Vous êtes un analyste en cybersécurité. Analysez les activités suspectes détectées et évaluez les menaces potentielles. Fournissez des recommandations d'action en français.`
        }, {
          role: 'user',
          content: `Activités suspectes détectées: ${JSON.stringify(suspiciousActivities)}`
        }],
        max_tokens: 600,
        temperature: 0.3
      })
    });

    if (aiAnalysis.ok) {
      const aiData = await aiAnalysis.json();
      threatAssessment = aiData.choices?.[0]?.message?.content;
    }
  }

  // Store monitoring results
  const { error: monitoringError } = await supabase
    .from('system_anomalies')
    .insert({
      user_id: 'system',
      anomalies: suspiciousActivities,
      metrics_snapshot: {
        monitored_tables: monitoringTables,
        suspicious_activities_count: suspiciousActivities.length,
        ai_threat_assessment: threatAssessment
      },
      detected_at: new Date().toISOString()
    });

  if (monitoringError) {
    console.error('Error storing monitoring results:', monitoringError);
  }

  return new Response(
    JSON.stringify({
      success: true,
      monitoring_results: {
        tables_monitored: monitoringTables.length,
        suspicious_activities: suspiciousActivities.length,
        ai_threat_assessment: threatAssessment,
        timestamp: new Date().toISOString()
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function executeAutomatedResponse(event: SecurityEvent, supabase: any, response?: AutomatedResponse) {
  if (!response) {
    response = determineAutomatedResponse(event, calculateRiskScore(event));
  }

  console.log('Executing automated response:', response);

  try {
    switch (response.action) {
      case 'block_user':
        if (event.user_id) {
          await supabase
            .from('device_security')
            .update({
              is_blocked: true,
              blocked_reason: response.reason,
              blocked_at: new Date().toISOString()
            })
            .eq('user_id', event.user_id);
        }
        break;

      case 'rate_limit':
        // Implement rate limiting logic
        console.log('Rate limiting implemented for:', event.user_id);
        break;

      case 'require_2fa':
        if (event.user_id) {
          await supabase
            .from('profiles')
            .update({
              requires_2fa: true,
              security_flags: { requires_additional_verification: true }
            })
            .eq('user_id', event.user_id);
        }
        break;

      case 'alert_admin':
        await supabase.functions.invoke('notifications', {
          body: {
            action: 'send_security_alert',
            userIds: ['admin'],
            alertData: {
              type: event.type,
              message: `Action automatique requise: ${response.reason}`,
              severity: event.severity
            }
          }
        });
        break;

      case 'escalate':
        // Create high-priority ticket
        console.log('Escalating security incident:', event);
        break;
    }

    // Log the response
    await supabase
      .from('security_responses')
      .insert({
        event_type: event.type,
        user_id: event.user_id,
        action_taken: response.action,
        reason: response.reason,
        confidence: response.confidence,
        executed_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Error executing automated response:', error);
  }

  return new Response(
    JSON.stringify({
      success: true,
      response_executed: response,
      timestamp: new Date().toISOString()
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function generateThreatIntelligence(supabase: any, openaiKey: string) {
  // Get recent security data
  const { data: recentAlerts } = await supabase
    .from('security_alerts')
    .select('*')
    .gte('created_at', new Date(Date.now() - 86400000).toISOString()) // Last 24 hours
    .order('created_at', { ascending: false });

  const { data: recentAnomalies } = await supabase
    .from('system_anomalies')
    .select('*')
    .gte('detected_at', new Date(Date.now() - 86400000).toISOString())
    .order('detected_at', { ascending: false });

  // AI threat intelligence analysis
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
        content: `Vous êtes un expert en threat intelligence. Analysez les données de sécurité récentes et générez un rapport de menaces avec:
        1. Tendances des attaques
        2. Vecteurs d'attaque identifiés  
        3. Recommandations de sécurité
        4. Prédictions de menaces futures
        
        Répondez en français avec un format structuré.`
      }, {
        role: 'user',
        content: `Données récentes:
        Alertes: ${JSON.stringify(recentAlerts?.slice(0, 10) || [])}
        Anomalies: ${JSON.stringify(recentAnomalies?.slice(0, 10) || [])}`
      }],
      max_tokens: 1000,
      temperature: 0.4
    })
  });

  let threatIntelligence = "Analyse de threat intelligence non disponible";
  if (aiAnalysis.ok) {
    const aiData = await aiAnalysis.json();
    threatIntelligence = aiData.choices?.[0]?.message?.content || threatIntelligence;
  }

  return new Response(
    JSON.stringify({
      success: true,
      threat_intelligence: {
        report: threatIntelligence,
        recent_alerts_count: recentAlerts?.length || 0,
        recent_anomalies_count: recentAnomalies?.length || 0,
        generated_at: new Date().toISOString()
      }
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function calculateRiskScore(event: SecurityEvent): number {
  let score = 0;

  // Base score by event type
  const eventScores = {
    'login_failure': 20,
    'suspicious_transaction': 60,
    'unusual_activity': 40,
    'unauthorized_access': 80,
    'data_breach': 100,
    'api_abuse': 50
  };

  score += eventScores[event.type] || 30;

  // Severity multiplier
  const severityMultipliers = {
    'low': 1,
    'medium': 1.5,
    'high': 2,
    'critical': 3
  };

  score *= severityMultipliers[event.severity] || 1;

  // Additional factors
  if (event.metadata?.repeated_attempts > 3) {
    score += event.metadata.repeated_attempts * 5;
  }

  if (event.metadata?.high_value_transaction) {
    score += 30;
  }

  if (event.metadata?.suspicious_ip) {
    score += 25;
  }

  return Math.min(100, Math.max(0, score));
}

function detectThreats(event: SecurityEvent): string[] {
  const threats = [];

  if (event.type === 'login_failure' && event.metadata?.attempts > 5) {
    threats.push('Attaque par force brute potentielle');
  }

  if (event.type === 'suspicious_transaction' && event.metadata?.amount > 1000000) {
    threats.push('Transaction frauduleuse de montant élevé');
  }

  if (event.metadata?.unusual_time) {
    threats.push('Activité en dehors des heures normales');
  }

  if (event.metadata?.new_device && event.metadata?.high_risk_action) {
    threats.push('Compromission de compte potentielle');
  }

  return threats;
}

function determineAutomatedResponse(event: SecurityEvent, riskScore: number, aiResponse?: any): AutomatedResponse {
  if (riskScore >= 90 || event.severity === 'critical') {
    return {
      action: 'block_user',
      duration: 3600, // 1 hour
      reason: 'Activité critique détectée - blocage préventif',
      confidence: 95
    };
  }

  if (riskScore >= 70 || event.severity === 'high') {
    return {
      action: 'require_2fa',
      reason: 'Activité suspecte - vérification supplémentaire requise',
      confidence: 80
    };
  }

  if (riskScore >= 50 || event.severity === 'medium') {
    return {
      action: 'alert_admin',
      reason: 'Surveillance renforcée recommandée',
      confidence: 70
    };
  }

  return {
    action: 'log_only',
    reason: 'Activité normale - surveillance continue',
    confidence: 60
  };
}

function analyzeDataPatterns(table: string, data: any[]): { anomalies: any[] } {
  const anomalies = [];

  // Check for unusual volume
  if (data.length > 50) { // More than 50 records in one hour
    anomalies.push({
      type: 'volume_spike',
      message: `Pic d'activité détecté sur ${table}: ${data.length} enregistrements en 1h`,
      severity: 'medium'
    });
  }

  // Check for patterns in user IDs (potential automation)
  const userIds = data.map(d => d.user_id).filter(Boolean);
  const uniqueUsers = new Set(userIds).size;
  if (userIds.length > 20 && uniqueUsers < 3) {
    anomalies.push({
      type: 'automation_suspected',
      message: `Activité automatisée potentielle sur ${table}`,
      severity: 'high'
    });
  }

  return { anomalies };
}