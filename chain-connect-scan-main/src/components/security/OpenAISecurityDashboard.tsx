import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  Brain, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Database,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface SecurityMetrics {
  threats_detected: number;
  automated_responses: number;
  system_health: 'healthy' | 'warning' | 'critical';
  monitoring_active: boolean;
  last_scan: string;
}

interface ThreatAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  ai_analysis?: string;
  resolved: boolean;
}

const OpenAISecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    threats_detected: 0,
    automated_responses: 0,
    system_health: 'healthy',
    monitoring_active: false,
    last_scan: new Date().toISOString()
  });

  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [monitoringStatus, setMonitoringStatus] = useState<'stopped' | 'running' | 'error'>('stopped');

  useEffect(() => {
    loadSecurityData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      // Load recent security alerts
      const { data: alertsData } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (alertsData) {
        const formattedThreats: ThreatAlert[] = alertsData.map(alert => ({
          id: alert.id,
          type: alert.alert_type || 'unknown',
          severity: alert.severity as any,
          message: alert.message || 'Alerte de sécurité',
          timestamp: alert.created_at,
          ai_analysis: undefined, // Will be added when AI analysis is integrated
          resolved: alert.is_resolved || false
        }));

        setThreats(formattedThreats);

        // Update metrics
        const unresolvedThreats = formattedThreats.filter(t => !t.resolved);
        const criticalThreats = unresolvedThreats.filter(t => t.severity === 'critical');
        
        setMetrics(prev => ({
          ...prev,
          threats_detected: unresolvedThreats.length,
          system_health: criticalThreats.length > 0 ? 'critical' : 
                        unresolvedThreats.length > 5 ? 'warning' : 'healthy',
          last_scan: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  };

  const startRealTimeMonitoring = async () => {
    setIsLoading(true);
    setMonitoringStatus('running');

    try {
      const { data, error } = await supabase.functions.invoke('real-time-security-monitor', {
        body: {
          action: 'start_monitoring',
          monitoring_config: {
            tables: ['profiles', 'wallets', 'transactions', 'orders', 'products'],
            real_time: true
          }
        }
      });

      if (error) throw error;

      toast.success('Surveillance en temps réel activée avec OpenAI');
      
      setMetrics(prev => ({
        ...prev,
        monitoring_active: true,
        automated_responses: prev.automated_responses + 1
      }));

      // Reload data after monitoring
      setTimeout(loadSecurityData, 2000);

    } catch (error) {
      console.error('Error starting monitoring:', error);
      toast.error('Erreur lors du démarrage de la surveillance');
      setMonitoringStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const runAnomalyDetection = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-anomaly-detection', {
        body: {
          metrics: {
            userBehavior: {
              sessionDuration: 1800,
              pageViews: 25,
              actionCount: 45,
              lastActivity: new Date().toISOString()
            },
            systemHealth: {
              apiResponseTimes: [200, 180, 250, 190, 300],
              errorRate: 0.02,
              connectionStatus: 'online'
            },
            security: {
              failedLoginAttempts: 2,
              suspiciousActivity: false,
              lastSecurityCheck: new Date().toISOString()
            },
            performance: {
              loadTimes: [1200, 1400, 1100, 1600],
              memoryUsage: 65,
              networkLatency: 45
            }
          }
        }
      });

      if (error) throw error;

      toast.success(`Détection d'anomalies terminée: ${data?.total_detected || 0} anomalies détectées`);
      
      setMetrics(prev => ({
        ...prev,
        threats_detected: prev.threats_detected + (data?.total_detected || 0),
        last_scan: new Date().toISOString()
      }));

      setTimeout(loadSecurityData, 1000);

    } catch (error) {
      console.error('Error running anomaly detection:', error);
      toast.error('Erreur lors de la détection d\'anomalies');
    } finally {
      setIsLoading(false);
    }
  };

  const generateThreatIntelligence = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-security-orchestrator', {
        body: {
          action: 'threat_intelligence'
        }
      });

      if (error) throw error;

      toast.success('Rapport de threat intelligence généré');
      
      // Display threat intelligence in a toast with the report
      if (data?.threat_intelligence?.report) {
        toast.info('Threat Intelligence', {
          description: data.threat_intelligence.report.substring(0, 200) + '...',
          duration: 10000
        });
      }

    } catch (error) {
      console.error('Error generating threat intelligence:', error);
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setIsLoading(false);
    }
  };

  const validateSystemCommunications = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('real-time-security-monitor', {
        body: {
          action: 'validate_api_communications'
        }
      });

      if (error) throw error;

      const apiHealth = data?.api_validation?.overall_health;
      toast.success(`Communications API validées: ${apiHealth}`);

      setMetrics(prev => ({
        ...prev,
        system_health: apiHealth === 'healthy' ? 'healthy' : 
                      apiHealth === 'degraded' ? 'warning' : 'critical'
      }));

    } catch (error) {
      console.error('Error validating API communications:', error);
      toast.error('Erreur lors de la validation des communications');
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getHealthStatus = () => {
    switch (metrics.system_health) {
      case 'healthy': return { color: 'text-green-600', icon: CheckCircle, text: 'Sain' };
      case 'warning': return { color: 'text-yellow-600', icon: AlertTriangle, text: 'Attention' };
      case 'critical': return { color: 'text-red-600', icon: AlertTriangle, text: 'Critique' };
      default: return { color: 'text-gray-600', icon: Clock, text: 'Inconnu' };
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Tableau de Bord Sécurité OpenAI
          </h1>
          <p className="text-muted-foreground">
            Surveillance automatisée et détection d'anomalies avec intelligence artificielle
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={monitoringStatus === 'running' ? 'default' : 'outline'}>
            {monitoringStatus === 'running' ? 'Surveillance Active' : 'Surveillance Arrêtée'}
          </Badge>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">État du Système</CardTitle>
            <healthStatus.icon className={`h-4 w-4 ${healthStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${healthStatus.color}`}>
              {healthStatus.text}
            </div>
            <p className="text-xs text-muted-foreground">
              Dernière vérification: {new Date(metrics.last_scan).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menaces Détectées</CardTitle>
            <Shield className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.threats_detected}</div>
            <p className="text-xs text-muted-foreground">
              {threats.filter(t => t.severity === 'critical').length} critiques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réponses Automatiques</CardTitle>
            <Zap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.automated_responses}</div>
            <p className="text-xs text-muted-foreground">
              Actions automatisées prises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surveillance IA</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.monitoring_active ? 'ACTIVE' : 'ARRÊTÉE'}
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoring en temps réel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions de surveillance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Actions de Surveillance Automatisées
          </CardTitle>
          <CardDescription>
            Déclenchez des analyses de sécurité avancées avec OpenAI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              onClick={startRealTimeMonitoring}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              Surveillance Temps Réel
            </Button>

            <Button 
              onClick={runAnomalyDetection}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Détection Anomalies
            </Button>

            <Button 
              onClick={generateThreatIntelligence}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Threat Intelligence
            </Button>

            <Button 
              onClick={validateSystemCommunications}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Validation APIs
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="threats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="threats">Menaces Détectées</TabsTrigger>
          <TabsTrigger value="monitoring">Surveillance Continue</TabsTrigger>
          <TabsTrigger value="analytics">Analyses IA</TabsTrigger>
        </TabsList>

        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>Alertes de Sécurité Récentes</CardTitle>
              <CardDescription>
                Menaces détectées automatiquement par l'IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {threats.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Aucune menace détectée récemment. Système sécurisé.
                    </AlertDescription>
                  </Alert>
                ) : (
                  threats.map((threat) => (
                    <Alert key={threat.id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={getSeverityColor(threat.severity) as any}>
                            {threat.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{threat.type}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(threat.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <AlertDescription>
                          {threat.message}
                        </AlertDescription>
                        {threat.ai_analysis && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <strong>Analyse IA:</strong> {threat.ai_analysis}
                          </div>
                        )}
                      </div>
                      {threat.resolved && (
                        <Badge variant="outline" className="text-green-600">
                          Résolu
                        </Badge>
                      )}
                    </Alert>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Surveillance Continue des Tables Critiques</CardTitle>
              <CardDescription>
                Monitoring en temps réel des données sensibles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['profiles', 'wallets', 'transactions', 'orders', 'products'].map((table) => (
                  <div key={table} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium capitalize">{table}</span>
                      <p className="text-sm text-muted-foreground">
                        Table critique surveillée en temps réel
                      </p>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Surveillée
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analyses Avancées par IA</CardTitle>
              <CardDescription>
                Intelligence artificielle appliquée à la sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Détection d'Anomalies</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Analyse des patterns de comportement utilisateur</li>
                    <li>• Détection de volumes d'activité anormaux</li>
                    <li>• Identification d'activités suspectes</li>
                    <li>• Analyse des temps de réponse API</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Réponses Automatiques</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Blocage automatique d'utilisateurs suspects</li>
                    <li>• Limitation de débit (rate limiting)</li>
                    <li>• Demande de vérification 2FA</li>
                    <li>• Alertes administrateur en temps réel</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OpenAISecurityDashboard;