import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';

interface AnalysisMetrics {
  userBehavior: {
    sessionDuration: number;
    pageViews: number;
    actionCount: number;
    lastActivity: Date;
  };
  systemHealth: {
    apiResponseTimes: number[];
    errorRate: number;
    connectionStatus: 'online' | 'offline' | 'unstable';
  };
  security: {
    failedLoginAttempts: number;
    suspiciousActivity: boolean;
    lastSecurityCheck: Date;
  };
  performance: {
    loadTimes: number[];
    memoryUsage: number;
    networkLatency: number;
  };
}

interface DeepAnalysisContextType {
  metrics: AnalysisMetrics;
  analyzeUserPath: (path: string, action: string) => void;
  detectAnomalies: () => Promise<any[]>;
  generateInsights: () => Promise<string[]>;
  isAnalyzing: boolean;
}

const DeepAnalysisContext = createContext<DeepAnalysisContextType | undefined>(undefined);

export const DeepAnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const { captureError } = useErrorBoundary();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [metrics, setMetrics] = useState<AnalysisMetrics>({
    userBehavior: {
      sessionDuration: 0,
      pageViews: 0,
      actionCount: 0,
      lastActivity: new Date()
    },
    systemHealth: {
      apiResponseTimes: [],
      errorRate: 0,
      connectionStatus: 'online'
    },
    security: {
      failedLoginAttempts: 0,
      suspiciousActivity: false,
      lastSecurityCheck: new Date()
    },
    performance: {
      loadTimes: [],
      memoryUsage: 0,
      networkLatency: 0
    }
  });

  // Monitor system health
  useEffect(() => {
    const healthCheckInterval = setInterval(async () => {
      try {
        const start = Date.now();
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        const responseTime = Date.now() - start;
        
        setMetrics(prev => ({
          ...prev,
          systemHealth: {
            ...prev.systemHealth,
            apiResponseTimes: [...prev.systemHealth.apiResponseTimes.slice(-9), responseTime],
            connectionStatus: error ? 'unstable' : 'online'
          }
        }));
      } catch (error) {
        captureError(error as Error, 'Health check');
        setMetrics(prev => ({
          ...prev,
          systemHealth: {
            ...prev.systemHealth,
            connectionStatus: 'offline'
          }
        }));
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheckInterval);
  }, [captureError]);

  // Track user behavior
  const analyzeUserPath = (path: string, action: string) => {
    setMetrics(prev => ({
      ...prev,
      userBehavior: {
        ...prev.userBehavior,
        pageViews: prev.userBehavior.pageViews + 1,
        actionCount: prev.userBehavior.actionCount + 1,
        lastActivity: new Date()
      }
    }));

    // Store analytics data
    if (profile) {
      supabase.functions.invoke('analytics-tracker', {
        body: {
          user_id: profile.user_id,
          path,
          action,
          timestamp: new Date().toISOString(),
          role: profile.role
        }
      }).catch(error => captureError(error, 'Analytics tracking'));
    }
  };

  // Detect system anomalies
  const detectAnomalies = async (): Promise<any[]> => {
    setIsAnalyzing(true);
    const anomalies = [];

    try {
      // Check API response times
      const avgResponseTime = metrics.systemHealth.apiResponseTimes.reduce((a, b) => a + b, 0) / metrics.systemHealth.apiResponseTimes.length;
      if (avgResponseTime > 2000) {
        anomalies.push({
          type: 'performance',
          severity: 'high',
          message: `API response time elevated: ${avgResponseTime}ms`,
          timestamp: new Date()
        });
      }

      // Check error patterns
      if (metrics.systemHealth.errorRate > 0.1) {
        anomalies.push({
          type: 'reliability',
          severity: 'medium',
          message: `Error rate elevated: ${(metrics.systemHealth.errorRate * 100).toFixed(1)}%`,
          timestamp: new Date()
        });
      }

      // Check security indicators
      if (metrics.security.failedLoginAttempts > 5) {
        anomalies.push({
          type: 'security',
          severity: 'high',
          message: `Multiple failed login attempts detected: ${metrics.security.failedLoginAttempts}`,
          timestamp: new Date()
        });
      }

      // Advanced AI-based anomaly detection
      const { data } = await supabase.functions.invoke('ai-anomaly-detection', {
        body: { metrics, user_id: profile?.user_id }
      });

      if (data?.anomalies) {
        anomalies.push(...data.anomalies);
      }

    } catch (error) {
      captureError(error as Error, 'Anomaly detection');
    } finally {
      setIsAnalyzing(false);
    }

    return anomalies;
  };

  // Generate actionable insights
  const generateInsights = async (): Promise<string[]> => {
    const insights = [];

    try {
      // Performance insights
      const avgLoadTime = metrics.performance.loadTimes.reduce((a, b) => a + b, 0) / metrics.performance.loadTimes.length;
      if (avgLoadTime > 3000) {
        insights.push(`Temps de chargement élevé détecté (${avgLoadTime}ms). Considérez l'optimisation des ressources.`);
      }

      // User behavior insights
      if (metrics.userBehavior.sessionDuration < 60000) {
        insights.push('Sessions utilisateur courtes détectées. Améliorer l\'engagement pourrait être nécessaire.');
      }

      // Security insights
      const timeSinceSecurityCheck = Date.now() - metrics.security.lastSecurityCheck.getTime();
      if (timeSinceSecurityCheck > 86400000) { // 24 hours
        insights.push('Contrôle de sécurité requis - dernière vérification il y a plus de 24h.');
      }

      // AI-powered insights
      const { data } = await supabase.functions.invoke('ai-insights-generator', {
        body: { 
          metrics, 
          user_id: profile?.user_id,
          role: profile?.role 
        }
      });

      if (data?.insights) {
        insights.push(...data.insights);
      }

    } catch (error) {
      captureError(error as Error, 'Insight generation');
    }

    return insights;
  };

  return (
    <DeepAnalysisContext.Provider
      value={{
        metrics,
        analyzeUserPath,
        detectAnomalies,
        generateInsights,
        isAnalyzing
      }}
    >
      {children}
    </DeepAnalysisContext.Provider>
  );
};

export const useDeepAnalysis = () => {
  const context = useContext(DeepAnalysisContext);
  if (context === undefined) {
    throw new Error('useDeepAnalysis must be used within a DeepAnalysisProvider');
  }
  return context;
};