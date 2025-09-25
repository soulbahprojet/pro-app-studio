import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisRequest {
  metrics: {
    userBehavior: {
      sessionDuration: number;
      pageViews: number;
      actionCount: number;
      lastActivity: string;
    };
    systemHealth: {
      apiResponseTimes: number[];
      errorRate: number;
      connectionStatus: string;
    };
    security: {
      failedLoginAttempts: number;
      suspiciousActivity: boolean;
      lastSecurityCheck: string;
    };
    performance: {
      loadTimes: number[];
      memoryUsage: number;
      networkLatency: number;
    };
  };
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { metrics, user_id }: AnalysisRequest = await req.json()
    const anomalies = []

    // Advanced statistical anomaly detection
    console.log('Analyzing metrics for anomalies:', { user_id, metrics })

    // 1. Response Time Anomaly Detection (Z-score method)
    if (metrics.systemHealth.apiResponseTimes.length > 3) {
      const times = metrics.systemHealth.apiResponseTimes
      const mean = times.reduce((a, b) => a + b, 0) / times.length
      const stdDev = Math.sqrt(times.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / times.length)
      
      const latestTime = times[times.length - 1]
      const zScore = Math.abs((latestTime - mean) / stdDev)
      
      if (zScore > 2) { // 2 standard deviations
        anomalies.push({
          type: 'performance_spike',
          severity: zScore > 3 ? 'critical' : 'high',
          message: `API response time anomaly detected: ${latestTime}ms (Z-score: ${zScore.toFixed(2)})`,
          confidence: Math.min(0.95, zScore / 3),
          timestamp: new Date().toISOString(),
          recommendation: 'Check server resources and database performance'
        })
      }
    }

    // 2. User Behavior Pattern Analysis
    const currentHour = new Date().getHours()
    const isBusinessHours = currentHour >= 8 && currentHour <= 18
    
    if (metrics.userBehavior.actionCount > 100 && !isBusinessHours) {
      anomalies.push({
        type: 'unusual_activity',
        severity: 'medium',
        message: `High activity detected outside business hours: ${metrics.userBehavior.actionCount} actions`,
        confidence: 0.7,
        timestamp: new Date().toISOString(),
        recommendation: 'Monitor for potential automated/bot activity'
      })
    }

    // 3. Security Pattern Analysis
    if (metrics.security.failedLoginAttempts > 3) {
      const riskLevel = metrics.security.failedLoginAttempts > 10 ? 'critical' : 'high'
      anomalies.push({
        type: 'security_risk',
        severity: riskLevel,
        message: `Potential brute force attack: ${metrics.security.failedLoginAttempts} failed attempts`,
        confidence: 0.9,
        timestamp: new Date().toISOString(),
        recommendation: 'Consider implementing rate limiting or temporary account lockout'
      })
    }

    // 4. Performance Degradation Analysis
    if (metrics.performance.loadTimes.length > 0) {
      const avgLoadTime = metrics.performance.loadTimes.reduce((a, b) => a + b, 0) / metrics.performance.loadTimes.length
      const baseline = 2000 // 2 seconds baseline
      
      if (avgLoadTime > baseline * 1.5) {
        anomalies.push({
          type: 'performance_degradation',
          severity: avgLoadTime > baseline * 2 ? 'high' : 'medium',
          message: `Page load times degraded: ${avgLoadTime}ms average`,
          confidence: 0.8,
          timestamp: new Date().toISOString(),
          recommendation: 'Optimize assets, enable caching, or scale infrastructure'
        })
      }
    }

    // 5. Connection Stability Analysis
    if (metrics.systemHealth.connectionStatus === 'unstable') {
      anomalies.push({
        type: 'connectivity_issue',
        severity: 'medium',
        message: 'Unstable connection detected',
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        recommendation: 'Check network infrastructure and implement retry mechanisms'
      })
    }

    // 6. Memory Usage Analysis (if available)
    if (metrics.performance.memoryUsage > 80) {
      anomalies.push({
        type: 'resource_exhaustion',
        severity: metrics.performance.memoryUsage > 90 ? 'critical' : 'high',
        message: `High memory usage detected: ${metrics.performance.memoryUsage}%`,
        confidence: 0.9,
        timestamp: new Date().toISOString(),
        recommendation: 'Investigate memory leaks and optimize application performance'
      })
    }

    // Store anomalies in database for historical analysis
    if (anomalies.length > 0 && user_id) {
      const { error } = await supabase
        .from('system_anomalies')
        .insert({
          user_id,
          anomalies,
          metrics_snapshot: metrics,
          detected_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error storing anomalies:', error)
      }
    }

    // Generate AI-powered insights using OpenAI (if configured)
    try {
      const openaiKey = Deno.env.get('OPENAI_API_KEY')
      if (openaiKey && anomalies.length > 0) {
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
              content: 'You are an expert system analyst. Analyze the detected anomalies and provide additional insights and recommendations in French.'
            }, {
              role: 'user',
              content: `Anomalies détectées: ${JSON.stringify(anomalies, null, 2)}. Fournissez des recommandations d'action prioritaires.`
            }],
            max_tokens: 500,
            temperature: 0.3
          })
        })

        if (aiResponse.ok) {
          const aiData = await aiResponse.json()
          const aiInsight = aiData.choices?.[0]?.message?.content

          if (aiInsight) {
            anomalies.push({
              type: 'ai_insight',
              severity: 'info',
              message: aiInsight,
              confidence: 0.75,
              timestamp: new Date().toISOString(),
              recommendation: 'AI-generated analysis and recommendations'
            })
          }
        }
      }
    } catch (aiError) {
      console.warn('AI analysis failed:', aiError)
    }

    console.log(`Detected ${anomalies.length} anomalies`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        anomalies,
        total_detected: anomalies.length,
        analysis_timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in anomaly detection:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})