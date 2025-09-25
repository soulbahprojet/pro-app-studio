import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bot, 
  Clock, 
  Smartphone, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Bell,
  Settings,
  Activity,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MonitoringConfig {
  enabled: boolean;
  interval: number; // en minutes
  autoFix: boolean;
  notifications: boolean;
  criticalOnly: boolean;
  reportFrequency: 'realtime' | 'hourly' | 'daily';
}

interface MonitoringLog {
  id: string;
  timestamp: Date;
  type: 'check' | 'fix' | 'alert' | 'report';
  component: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  action?: string;
}

const AutomaticMonitor = () => {
  const [config, setConfig] = useState<MonitoringConfig>({
    enabled: false,
    interval: 5,
    autoFix: false,
    notifications: true,
    criticalOnly: false,
    reportFrequency: 'hourly'
  });
  
  const [logs, setLogs] = useState<MonitoringLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [nextCheck, setNextCheck] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    totalChecks: 0,
    issuesDetected: 0,
    autoFixed: 0,
    notificationsSent: 0
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (config.enabled) {
      setIsRunning(true);
      
      // Démarrer le monitoring automatique
      const runMonitoring = () => {
        performSystemCheck();
        updateNextCheckTime();
      };
      
      // Premier check immédiat
      runMonitoring();
      
      // Puis checks périodiques
      interval = setInterval(runMonitoring, config.interval * 60 * 1000);
      
      addLog('check', 'system', 'success', `Monitoring automatique démarré (${config.interval}min)`);
    } else {
      setIsRunning(false);
      if (interval) {
        clearInterval(interval);
        addLog('check', 'system', 'success', 'Monitoring automatique arrêté');
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [config.enabled, config.interval]);

  const updateNextCheckTime = () => {
    const next = new Date();
    next.setMinutes(next.getMinutes() + config.interval);
    setNextCheck(next);
  };

  const performSystemCheck = async () => {
    const checkTime = new Date();
    setLastCheck(checkTime);
    
    try {
      addLog('check', 'system', 'success', 'Début de la vérification automatique');
      
      const { data, error } = await supabase.functions.invoke('copilote', {
        body: { 
          action: 'system_check',
          query: 'Vérification automatique complète du système'
        }
      });

      if (error) throw error;

      setStats(prev => ({ ...prev, totalChecks: prev.totalChecks + 1 }));

      // Analyser les résultats
      const issues = data.report.results.filter((r: any) => r.status !== 'ok');
      
      if (issues.length > 0) {
        setStats(prev => ({ ...prev, issuesDetected: prev.issuesDetected + issues.length }));
        
        addLog('alert', 'system', 'warning', `${issues.length} problème(s) détecté(s)`);
        
        // Notifications mobile
        if (config.notifications) {
          sendMobileNotification(issues);
        }
        
        // Auto-correction si activée
        if (config.autoFix) {
          await attemptAutoFix(issues);
        }
      } else {
        addLog('check', 'system', 'success', 'Tous les systèmes opérationnels');
      }

    } catch (error) {
      console.error('Erreur monitoring:', error);
      addLog('check', 'system', 'error', `Erreur monitoring: ${error.message}`);
    }
  };

  const sendMobileNotification = (issues: any[]) => {
    const criticalIssues = issues.filter(i => i.status === 'error');
    
    if (config.criticalOnly && criticalIssues.length === 0) return;
    
    const message = criticalIssues.length > 0 
      ? `🚨 CRITIQUE: ${criticalIssues.length} système(s) en panne`
      : `⚠️ ${issues.length} avertissement(s) système`;
    
    // Simuler notification mobile
    toast({
      title: "📱 Notification Mobile",
      description: message,
      variant: criticalIssues.length > 0 ? "destructive" : "default",
    });
    
    setStats(prev => ({ ...prev, notificationsSent: prev.notificationsSent + 1 }));
    addLog('alert', 'notification', 'success', `Notification envoyée: ${message}`);
    
    // Simulation d'une vraie notification mobile
    if (criticalIssues.length > 0) {
      setTimeout(() => {
        const shouldAutoFix = window.confirm(
          `📱 ALERTE SYSTÈME PDG\n\n${message}\n\nLe copilote peut tenter une correction automatique.\n\nAutoriser ?`
        );
        
        if (shouldAutoFix && !config.autoFix) {
          attemptAutoFix(criticalIssues);
        }
      }, 2000);
    }
  };

  const attemptAutoFix = async (issues: any[]) => {
    let fixedCount = 0;
    
    for (const issue of issues) {
      try {
        const { data, error } = await supabase.functions.invoke('copilote', {
          body: { 
            action: 'execute_action',
            target: 'restart_function',
            executeActions: true,
            query: { component: issue.component }
          }
        });

        if (!error) {
          fixedCount++;
          addLog('fix', issue.component, 'success', `Auto-correction réussie: ${issue.component}`);
        } else {
          addLog('fix', issue.component, 'error', `Échec auto-correction: ${issue.component}`);
        }
        
        // Délai entre les corrections
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        addLog('fix', issue.component, 'error', `Erreur auto-correction: ${error.message}`);
      }
    }
    
    if (fixedCount > 0) {
      setStats(prev => ({ ...prev, autoFixed: prev.autoFixed + fixedCount }));
      
      toast({
        title: "🔧 Auto-correction terminée",
        description: `${fixedCount}/${issues.length} problèmes corrigés automatiquement`,
      });
      
      // Re-vérifier après corrections
      setTimeout(() => {
        performSystemCheck();
      }, 5000);
    }
  };

  const addLog = (type: MonitoringLog['type'], component: string, status: MonitoringLog['status'], message: string, action?: string) => {
    const log: MonitoringLog = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      component,
      status,
      message,
      action
    };
    
    setLogs(prev => [log, ...prev.slice(0, 49)]); // Garder seulement les 50 derniers logs
  };

  const getLogIcon = (type: string, status: string) => {
    if (status === 'error') return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (status === 'warning') return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
    
    switch (type) {
      case 'check': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'fix': return <Zap className="h-4 w-4 text-purple-500" />;
      case 'alert': return <Bell className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Monitoring Automatique 24/7
          </h3>
          <p className="text-sm text-muted-foreground">
            Surveillance continue et auto-correction du système PDG
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={isRunning ? "default" : "secondary"}>
            {isRunning ? 'ACTIF' : 'ARRÊTÉ'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
          >
            {config.enabled ? 'Arrêter' : 'Démarrer'}
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration du Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="monitoring">Monitoring Actif</Label>
              <Switch
                id="monitoring"
                checked={config.enabled}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, enabled: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="autofix">Auto-Correction</Label>
              <Switch
                id="autofix"
                checked={config.autoFix}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, autoFix: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Notifications Mobiles</Label>
              <Switch
                id="notifications"
                checked={config.notifications}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, notifications: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="critical">Critiques Seulement</Label>
              <Switch
                id="critical"
                checked={config.criticalOnly}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, criticalOnly: checked }))
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>Intervalle de vérification:</Label>
            <select 
              value={config.interval}
              onChange={(e) => setConfig(prev => ({ ...prev, interval: Number(e.target.value) }))}
              className="border rounded px-2 py-1"
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 heure</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.totalChecks}</div>
            <p className="text-xs text-muted-foreground">Vérifications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.issuesDetected}</div>
            <p className="text-xs text-muted-foreground">Problèmes détectés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.autoFixed}</div>
            <p className="text-xs text-muted-foreground">Auto-corrections</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.notificationsSent}</div>
            <p className="text-xs text-muted-foreground">Notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Status en temps réel */}
      {isRunning && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <div className="flex justify-between items-center">
              <span>
                <strong>Monitoring actif</strong> - Dernière vérif: {lastCheck?.toLocaleTimeString() || 'N/A'}
              </span>
              <span className="text-sm text-muted-foreground">
                Prochaine: {nextCheck?.toLocaleTimeString() || 'N/A'}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Journal d'activité */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Journal d'Activité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucune activité enregistrée</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2 border-l-2 border-l-gray-200">
                  {getLogIcon(log.type, log.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{log.component}</span>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.message}</p>
                    {log.action && (
                      <p className="text-xs text-blue-600">Action: {log.action}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomaticMonitor;