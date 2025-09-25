import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Activity, AlertCircle, CheckCircle, Clock, RefreshCw, Smartphone, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface MonitoringData {
  buttons: ButtonStatus[];
  functions: FunctionStatus[];
  apis: ApiStatus[];
  lastCheck: Date;
  overallHealth: number;
}

interface ButtonStatus {
  id: string;
  name: string;
  status: 'ok' | 'warning' | 'error';
  lastTest: Date;
  description: string;
}

interface FunctionStatus {
  name: string;
  status: 'ok' | 'warning' | 'error';
  responseTime: number;
  errorCount: number;
}

interface ApiStatus {
  name: string;
  status: 'ok' | 'warning' | 'error';
  uptime: number;
  lastResponse: number;
}

const MonitoringDashboard = () => {
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [autoMonitoring, setAutoMonitoring] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Simulation des données de monitoring
  useEffect(() => {
    const simulatedData: MonitoringData = {
      buttons: [
        { id: 'generate-image', name: 'Générer Image', status: 'ok', lastTest: new Date(), description: 'IA Image Generator' },
        { id: 'save-product', name: 'Sauvegarder Produit', status: 'ok', lastTest: new Date(), description: 'Système POS' },
        { id: 'process-payment', name: 'Traiter Paiement', status: 'warning', lastTest: new Date(), description: 'Gateway Stripe' },
        { id: 'send-notification', name: 'Envoyer Notification', status: 'error', lastTest: new Date(), description: 'Service SMS/Email' },
      ],
      functions: [
        { name: 'ai-prompt', status: 'ok', responseTime: 234, errorCount: 0 },
        { name: 'copilote', status: 'ok', responseTime: 456, errorCount: 0 },
        { name: 'notifications', status: 'warning', responseTime: 1200, errorCount: 2 },
        { name: 'payment-processing', status: 'error', responseTime: 0, errorCount: 15 },
      ],
      apis: [
        { name: 'OpenAI API', status: 'ok', uptime: 99.9, lastResponse: 234 },
        { name: 'Supabase API', status: 'ok', uptime: 99.8, lastResponse: 123 },
        { name: 'Stripe API', status: 'warning', uptime: 98.2, lastResponse: 2300 },
        { name: 'Mapbox API', status: 'ok', uptime: 99.5, lastResponse: 567 },
      ],
      lastCheck: new Date(),
      overallHealth: 85
    };
    
    setMonitoring(simulatedData);
    
    if (autoMonitoring) {
      const interval = setInterval(() => {
        // Simulation de changements aléatoires
        simulatedData.lastCheck = new Date();
        simulatedData.overallHealth = 80 + Math.random() * 20;
        setMonitoring({...simulatedData});
      }, 10000); // Check toutes les 10 secondes
      
      return () => clearInterval(interval);
    }
  }, [autoMonitoring]);

  const runFullSystemCheck = async () => {
    setIsChecking(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('copilote', {
        body: { action: 'system_check' }
      });

      if (error) throw error;

      // Simuler des notifications
      const issues = data.report.results.filter((r: any) => r.status !== 'ok');
      if (issues.length > 0) {
        const notification = `🚨 ALERTE SYSTÈME: ${issues.length} problème(s) détecté(s)`;
        setNotifications(prev => [...prev, notification]);
        
        // Simulation notification mobile
        toast.warning(notification);
      } else {
        toast.success('✅ Tous les systèmes sont opérationnels');
      }
      
    } catch (error) {
      console.error('Erreur vérification:', error);
      toast.error('Erreur lors de la vérification système');
    } finally {
      setIsChecking(false);
    }
  };

  const fixIssueAutomatically = async (component: string) => {
    const shouldFix = window.confirm(
      `📱 NOTIFICATION MOBILE\n\nLe système a détecté un problème avec "${component}".\n\nVoulez-vous que le copilote tente une correction automatique ?\n\n⚠️ Cette action peut redémarrer certains services.`
    );

    if (shouldFix) {
      setIsChecking(true);
      try {
        const { data, error } = await supabase.functions.invoke('copilote', {
          body: { 
            action: 'execute_action',
            target: 'restart_function',
            executeActions: true,
            query: { function_name: component }
          }
        });

        if (error) throw error;

        toast.success(`✅ ${component} a été corrigé automatiquement`);
        setNotifications(prev => [...prev, `✅ Correction automatique: ${component}`]);
        
      } catch (error) {
        console.error('Erreur correction:', error);
        toast.error('Échec de la correction automatique');
      } finally {
        setIsChecking(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!monitoring) {
    return <div className="p-6">Chargement du monitoring...</div>;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec santé globale */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Santé Globale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(monitoring.overallHealth)}%</div>
            <Progress value={monitoring.overallHealth} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Boutons Testés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitoring.buttons.filter(b => b.status === 'ok').length}/{monitoring.buttons.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Fonctionnels</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fonctions Edge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitoring.functions.filter(f => f.status === 'ok').length}/{monitoring.functions.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Opérationnelles</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">APIs Externes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monitoring.apis.filter(a => a.status === 'ok').length}/{monitoring.apis.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Contrôles */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Button onClick={runFullSystemCheck} disabled={isChecking}>
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Activity className="h-4 w-4 mr-2" />}
            Vérification Complète
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setAutoMonitoring(!autoMonitoring)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Auto: {autoMonitoring ? 'ON' : 'OFF'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Dernière vérif: {monitoring.lastCheck.toLocaleTimeString()}
        </p>
      </div>

      {/* Notifications récentes */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              Notifications Récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {notifications.slice(-5).map((notif, index) => (
                <div key={index} className="text-sm p-2 bg-muted rounded">
                  {notif}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* État des boutons */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fonctionnalités UI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monitoring.buttons.map((button) => (
              <div key={button.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(button.status)}
                  <div>
                    <p className="font-medium text-sm">{button.name}</p>
                    <p className="text-xs text-muted-foreground">{button.description}</p>
                  </div>
                </div>
                {button.status !== 'ok' && (
                  <Button size="sm" variant="outline" onClick={() => fixIssueAutomatically(button.name)}>
                    <Zap className="h-3 w-3 mr-1" />
                    Corriger
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* État des fonctions Edge */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fonctions Edge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monitoring.functions.map((func, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(func.status)}
                    <span className="font-medium text-sm">{func.name}</span>
                  </div>
                  <Badge variant={func.status === 'ok' ? 'default' : func.status === 'warning' ? 'secondary' : 'destructive'}>
                    {func.responseTime}ms
                  </Badge>
                </div>
                {func.errorCount > 0 && (
                  <p className="text-xs text-red-600">{func.errorCount} erreurs récentes</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* État des APIs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">APIs Externes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {monitoring.apis.map((api, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(api.status)}
                    <span className="font-medium text-sm">{api.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{api.uptime}%</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Réponse: {api.lastResponse}ms
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringDashboard;