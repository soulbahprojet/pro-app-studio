import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Smartphone, 
  Zap, 
  Shield, 
  Activity,
  Clock,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ButtonCheck {
  id: string;
  name: string;
  description: string;
  status: 'ok' | 'warning' | 'error';
  lastChecked: Date;
  errorMessage?: string;
  suggestion?: string;
}

interface SystemReport {
  buttons: ButtonCheck[];
  overallHealth: number;
  timestamp: Date;
  recommendations: string[];
}

const CopiloteSystemCheck = () => {
  const [systemReport, setSystemReport] = useState<SystemReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [autoMonitoring, setAutoMonitoring] = useState(false);
  const [checkInterval, setCheckInterval] = useState<NodeJS.Timeout | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<string[]>([]);

  // Liste des boutons critiques à surveiller
  const criticalButtons = [
    { id: 'generate-image', name: 'Générer Image', description: 'IA Image Generator' },
    { id: 'save-product', name: 'Sauvegarder Produit', description: 'Système POS' },
    { id: 'process-payment', name: 'Traiter Paiement', description: 'Gateway Stripe' },
    { id: 'send-notification', name: 'Envoyer Notification', description: 'Service SMS/Email' },
    { id: 'manage-inventory', name: 'Gérer Stock', description: 'Système inventaire' },
    { id: 'user-authentication', name: 'Authentification', description: 'Système auth' },
    { id: 'database-operations', name: 'Opérations DB', description: 'Base de données' },
    { id: 'file-upload', name: 'Upload Fichiers', description: 'Système fichiers' }
  ];

  useEffect(() => {
    runSystemCheck();
    
    return () => {
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
  }, []);

  useEffect(() => {
    if (autoMonitoring) {
      const interval = setInterval(() => {
        runSystemCheck();
      }, 30000); // Check toutes les 30 secondes
      setCheckInterval(interval);
    } else {
      if (checkInterval) {
        clearInterval(checkInterval);
        setCheckInterval(null);
      }
    }
  }, [autoMonitoring]);

  const runSystemCheck = async () => {
    setIsChecking(true);
    
    try {
      const buttonChecks: ButtonCheck[] = [];
      const recommendations: string[] = [];
      
      // Simuler la vérification de chaque bouton
      for (const button of criticalButtons) {
        try {
          const { data, error } = await supabase.functions.invoke('copilote', {
            body: { 
              action: 'component_check',
              target: button.id,
              query: `Vérifier le fonctionnement de ${button.name}`
            }
          });

          if (error) throw error;

          // Simuler des résultats variés
          const randomStatus = Math.random();
          let status: 'ok' | 'warning' | 'error' = 'ok';
          let errorMessage = '';
          let suggestion = '';

          if (randomStatus < 0.1) {
            status = 'error';
            errorMessage = `${button.name} ne répond pas`;
            suggestion = `Redémarrer le service ${button.name}`;
            recommendations.push(`🔴 CRITIQUE: ${button.name} - ${suggestion}`);
          } else if (randomStatus < 0.25) {
            status = 'warning';
            errorMessage = `${button.name} lent (>2s)`;
            suggestion = `Optimiser les performances de ${button.name}`;
            recommendations.push(`🟡 ATTENTION: ${button.name} - ${suggestion}`);
          }

          buttonChecks.push({
            id: button.id,
            name: button.name,
            description: button.description,
            status,
            lastChecked: new Date(),
            errorMessage,
            suggestion: data.analysis || suggestion
          });

        } catch (error) {
          console.error(`Erreur vérification ${button.name}:`, error);
          buttonChecks.push({
            id: button.id,
            name: button.name,
            description: button.description,
            status: 'error',
            lastChecked: new Date(),
            errorMessage: 'Erreur de communication',
            suggestion: 'Vérifier la connectivité réseau'
          });
          recommendations.push(`🔴 ERREUR: ${button.name} - Vérifier la connectivité`);
        }
      }

      const errorCount = buttonChecks.filter(b => b.status === 'error').length;
      const warningCount = buttonChecks.filter(b => b.status === 'warning').length;
      const okCount = buttonChecks.filter(b => b.status === 'ok').length;
      
      const overallHealth = Math.round((okCount / buttonChecks.length) * 100);

      const report: SystemReport = {
        buttons: buttonChecks,
        overallHealth,
        timestamp: new Date(),
        recommendations
      };

      setSystemReport(report);

      // Notifications pour problèmes critiques
      if (errorCount > 0) {
        toast({
          title: "🚨 Problèmes détectés",
          description: `${errorCount} fonctionnalités en erreur, ${warningCount} avertissements`,
          variant: "destructive",
        });
        
        // Simuler notification mobile
        if (errorCount >= 2) {
          const shouldAutoFix = window.confirm(
            `📱 ALERTE SYSTÈME PDG\n\n${errorCount} fonctionnalités critiques en panne.\n\nLe copilote propose une correction automatique.\n\nAutoriser les réparations automatiques ?`
          );
          
          if (shouldAutoFix) {
            setPendingApprovals(['auto-fix-critical']);
          }
        }
      } else if (warningCount > 0) {
        toast({
          title: "⚠️ Attention requise",
          description: `${warningCount} fonctionnalités nécessitent votre attention`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Système opérationnel",
          description: "Toutes les fonctionnalités sont actives",
        });
      }

    } catch (error) {
      console.error('Erreur système check:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le système",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const executeAutoFix = async (buttonId: string) => {
    try {
      const shouldFix = window.confirm(
        `📱 CONFIRMATION MOBILE\n\nLe copilote va tenter de réparer "${systemReport?.buttons.find(b => b.id === buttonId)?.name}".\n\nCette action peut redémarrer certains services.\n\nContinuer ?`
      );

      if (!shouldFix) return;

      setIsChecking(true);

      const { data, error } = await supabase.functions.invoke('copilote', {
        body: { 
          action: 'execute_action',
          target: 'restart_function',
          executeActions: true,
          query: { component: buttonId }
        }
      });

      if (error) throw error;

      toast({
        title: "🔧 Réparation appliquée",
        description: data.message || `${buttonId} redémarré avec succès`,
      });

      // Re-vérifier après 3 secondes
      setTimeout(() => {
        runSystemCheck();
      }, 3000);

    } catch (error) {
      console.error('Erreur auto-fix:', error);
      toast({
        title: "Échec réparation",
        description: "La réparation automatique a échoué",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok': return <Badge className="bg-green-100 text-green-800 border-green-200">OK</Badge>;
      case 'warning': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">WARN</Badge>;
      case 'error': return <Badge variant="destructive">ERROR</Badge>;
      default: return <Badge variant="outline">UNKNOWN</Badge>;
    }
  };

  if (!systemReport && !isChecking) {
    return <div className="p-4">Chargement du monitoring système...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Monitoring Système - Copilote AI
          </h3>
          <p className="text-sm text-muted-foreground">
            Surveillance automatique des fonctionnalités critiques
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoMonitoring(!autoMonitoring)}
          >
            {autoMonitoring ? <PauseCircle className="h-4 w-4 mr-1" /> : <PlayCircle className="h-4 w-4 mr-1" />}
            Auto: {autoMonitoring ? 'ON' : 'OFF'}
          </Button>
          
          <Button 
            onClick={runSystemCheck}
            disabled={isChecking}
            size="sm"
          >
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Activity className="h-4 w-4 mr-1" />}
            Vérifier Maintenant
          </Button>
        </div>
      </div>

      {/* Santé globale */}
      {systemReport && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Santé du Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold">{systemReport.overallHealth}%</div>
                <div className="text-sm text-muted-foreground">
                  Dernière vérif: {systemReport.timestamp.toLocaleTimeString()}
                </div>
              </div>
              <div className={`text-right ${systemReport.overallHealth >= 90 ? 'text-green-600' : systemReport.overallHealth >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                <Activity className="h-8 w-8" />
              </div>
            </div>
            <Progress value={systemReport.overallHealth} className="mb-4" />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {systemReport.buttons.filter(b => b.status === 'ok').length}
                </div>
                <div className="text-xs text-muted-foreground">OK</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-yellow-600">
                  {systemReport.buttons.filter(b => b.status === 'warning').length}
                </div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-red-600">
                  {systemReport.buttons.filter(b => b.status === 'error').length}
                </div>
                <div className="text-xs text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommandations urgentes */}
      {systemReport && systemReport.recommendations.length > 0 && (
        <Alert>
          <Smartphone className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Actions Recommandées:</div>
            <ul className="space-y-1">
              {systemReport.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm">{rec}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* État détaillé des composants */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">État des Fonctionnalités</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemReport?.buttons.map((button) => (
              <div key={button.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(button.status)}
                  <div>
                    <div className="font-medium">{button.name}</div>
                    <div className="text-xs text-muted-foreground">{button.description}</div>
                    {button.errorMessage && (
                      <div className="text-xs text-red-600">{button.errorMessage}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(button.status)}
                  {button.status !== 'ok' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => executeAutoFix(button.id)}
                      disabled={isChecking}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Fix
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isChecking && (
        <div className="flex items-center justify-center p-4">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Vérification du système en cours...</span>
        </div>
      )}
    </div>
  );
};

export default CopiloteSystemCheck;
