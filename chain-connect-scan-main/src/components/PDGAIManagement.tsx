import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bot, 
  Brain, 
  Eye, 
  TrendingUp,
  AlertTriangle,
  Settings,
  Play,
  Pause,
  BarChart3,
  Zap,
  Target,
  RefreshCw,
  MessageSquare,
  Users,
  DollarSign,
  Shield
} from "lucide-react";
import AICopilotPanel from "./ai-copilot/AICopilotPanel";
import AITestPanel from "./ai-copilot/AITestPanel";
import CopiloteChat from "./ai-copilot/CopiloteChat";
import CopiloteSystemCheck from "./ai-copilot/CopiloteSystemCheck";
import AutomaticMonitor from "./ai-copilot/AutomaticMonitor";
import PDGAgentDashboard from "./agent/PDGAgentDashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AIModule {
  id: string;
  name: string;
  description: string;
  type: 'surveillance' | 'analysis' | 'automation' | 'prediction';
  status: 'active' | 'inactive' | 'error';
  lastRun: string;
  performance: number;
  alerts: number;
}

interface AIAlert {
  id: string;
  module: string;
  type: 'anomaly' | 'fraud' | 'performance' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  timestamp: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

interface AIAnalytics {
  totalScans: number;
  anomaliesDetected: number;
  fraudPrevented: number;
  performanceGain: number;
  accuracyRate: number;
  costSavings: number;
}

const PDGAIManagement = () => {
  const [aiModules, setAiModules] = useState<AIModule[]>([]);
  const [aiAlerts, setAiAlerts] = useState<AIAlert[]>([]);
  const [analytics, setAnalytics] = useState<AIAnalytics>({
    totalScans: 0,
    anomaliesDetected: 0,
    fraudPrevented: 0,
    performanceGain: 0,
    accuracyRate: 0,
    costSavings: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [aiSettings, setAiSettings] = useState({
    realTimeMonitoring: true,
    autoResponse: false,
    sensitivityLevel: 'medium',
    reportFrequency: 'daily',
    enablePredictions: true,
    learningMode: true,
  });

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      setIsLoading(true);
      
      // Simuler les données IA (remplacer par de vraies requêtes)
      const mockModules: AIModule[] = [
        {
          id: '1',
          name: 'Surveillance Financière',
          description: 'Détection d\'anomalies dans les transactions financières',
          type: 'surveillance',
          status: 'active',
          lastRun: new Date().toISOString(),
          performance: 98.5,
          alerts: 3
        },
        {
          id: '2',
          name: 'Analyse Comportementale',
          description: 'Analyse des patterns de comportement utilisateur',
          type: 'analysis',
          status: 'active',
          lastRun: new Date(Date.now() - 300000).toISOString(),
          performance: 94.2,
          alerts: 1
        },
        {
          id: '3',
          name: 'Prédiction de Fraude',
          description: 'Prédiction et prévention des tentatives de fraude',
          type: 'prediction',
          status: 'active',
          lastRun: new Date(Date.now() - 600000).toISOString(),
          performance: 96.8,
          alerts: 5
        },
        {
          id: '4',
          name: 'Optimisation Automatique',
          description: 'Optimisation automatique des processus',
          type: 'automation',
          status: 'inactive',
          lastRun: new Date(Date.now() - 3600000).toISOString(),
          performance: 89.3,
          alerts: 0
        }
      ];

      const mockAlerts: AIAlert[] = [
        {
          id: '1',
          module: 'Surveillance Financière',
          type: 'anomaly',
          severity: 'high',
          title: 'Transaction suspecte détectée',
          description: 'Transaction de 50000 GNF à 03:00 depuis une nouvelle adresse IP',
          recommendation: 'Vérifier l\'identité de l\'utilisateur et bloquer temporairement le compte',
          timestamp: new Date().toISOString(),
          status: 'new'
        },
        {
          id: '2',
          module: 'Analyse Comportementale',
          type: 'security',
          severity: 'medium',
          title: 'Pattern de connexion inhabituel',
          description: 'Utilisateur connecté depuis 5 appareils différents en 24h',
          recommendation: 'Demander une authentification supplémentaire',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: 'acknowledged'
        },
        {
          id: '3',
          module: 'Prédiction de Fraude',
          type: 'fraud',
          severity: 'critical',
          title: 'Tentative de fraude imminente',
          description: 'Schéma de fraude détecté avec 87% de probabilité',
          recommendation: 'Bloquer immédiatement les comptes suspects et alerter les autorités',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          status: 'new'
        }
      ];

      const mockAnalytics: AIAnalytics = {
        totalScans: 245678,
        anomaliesDetected: 1234,
        fraudPrevented: 89,
        performanceGain: 34.5,
        accuracyRate: 96.2,
        costSavings: 125000
      };

      setAiModules(mockModules);
      setAiAlerts(mockAlerts);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading AI data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données IA.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModule = async (moduleId: string) => {
    try {
      setAiModules(modules =>
        modules.map(module =>
          module.id === moduleId
            ? { ...module, status: module.status === 'active' ? 'inactive' : 'active' }
            : module
        )
      );
      
      toast({
        title: "Module mis à jour",
        description: "Le statut du module IA a été modifié.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le module.",
        variant: "destructive",
      });
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      setAiAlerts(alerts =>
        alerts.map(alert =>
          alert.id === alertId
            ? { ...alert, status: 'acknowledged' as const }
            : alert
        )
      );
      
      toast({
        title: "Alerte accusée",
        description: "L'alerte a été marquée comme accusée réception.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accuser réception de l'alerte.",
        variant: "destructive",
      });
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      setAiAlerts(alerts =>
        alerts.map(alert =>
          alert.id === alertId
            ? { ...alert, status: 'resolved' as const }
            : alert
        )
      );
      
      toast({
        title: "Alerte résolue",
        description: "L'alerte a été marquée comme résolue.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de résoudre l'alerte.",
        variant: "destructive",
      });
    }
  };

  const runManualScan = async (moduleId: string) => {
    try {
      toast({
        title: "Scan lancé",
        description: "Le scan manuel a été démarré.",
      });
      
      // Simuler un scan
      setTimeout(() => {
        setAiModules(modules =>
          modules.map(module =>
            module.id === moduleId
              ? { ...module, lastRun: new Date().toISOString() }
              : module
          )
        );
        
        toast({
          title: "Scan terminé",
          description: "Le scan manuel s'est terminé avec succès.",
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de lancer le scan.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'surveillance': return <Eye className="h-4 w-4" />;
      case 'analysis': return <BarChart3 className="h-4 w-4" />;
      case 'automation': return <Zap className="h-4 w-4" />;
      case 'prediction': return <Target className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement du système IA...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Brain className="h-6 w-6 mr-2 text-primary" />
            Intelligence Artificielle - Surveillance 24/7
          </h2>
          <p className="text-muted-foreground">Système IA autonome de supervision et analyse</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configuration IA
        </Button>
      </div>

      {/* AI Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scans Total</p>
                <p className="text-2xl font-bold">{analytics.totalScans.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Anomalies</p>
                <p className="text-2xl font-bold text-orange-600">{analytics.anomaliesDetected}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fraudes Évitées</p>
                <p className="text-2xl font-bold text-red-600">{analytics.fraudPrevented}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gain Performance</p>
                <p className="text-2xl font-bold text-green-600">+{analytics.performanceGain}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Précision</p>
                <p className="text-2xl font-bold text-purple-600">{analytics.accuracyRate}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Économies</p>
                <p className="text-2xl font-bold text-teal-600">{analytics.costSavings.toLocaleString()} GNF</p>
              </div>
              <DollarSign className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Management Tabs */}
      <Tabs defaultValue="modules" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="modules">Modules IA</TabsTrigger>
          <TabsTrigger value="alerts">Alertes IA</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Configuration</TabsTrigger>
          <TabsTrigger value="copilot">AI Copilote</TabsTrigger>
          <TabsTrigger value="monitoring">🤖 Monitoring Auto</TabsTrigger>
          <TabsTrigger value="intelligent">🧠 Copilote AI</TabsTrigger>
          <TabsTrigger value="agents">👥 Agents</TabsTrigger>
        </TabsList>

        <TabsContent value="modules">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiModules.map((module) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(module.type)}
                      <div>
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(module.status)}`}></div>
                      <Badge variant={module.status === 'active' ? 'default' : 'secondary'}>
                        {module.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Performance</p>
                      <p className="text-lg font-bold">{module.performance}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Alertes</p>
                      <p className="text-lg font-bold text-orange-600">{module.alerts}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Dernière exécution</p>
                    <p className="text-sm">{new Date(module.lastRun).toLocaleString()}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={module.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => toggleModule(module.id)}
                    >
                      {module.status === 'active' ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Arrêter
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Démarrer
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => runManualScan(module.id)}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Scan Manuel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertes IA en Temps Réel</CardTitle>
              <CardDescription>Détections et recommandations automatiques</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiAlerts.map((alert) => (
                  <Alert key={alert.id} className="border-l-4 border-l-orange-500">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">{alert.type}</Badge>
                              <Badge variant={alert.status === 'new' ? 'destructive' : 'secondary'}>
                                {alert.status}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {alert.module}
                              </span>
                            </div>
                            <h4 className="font-semibold">{alert.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium text-blue-800">Recommandation IA:</p>
                              <p className="text-sm text-blue-700">{alert.recommendation}</p>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </div>
                        </div>
                        
                        {alert.status === 'new' && (
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                              Accuser Réception
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                              Résoudre
                            </Button>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance des Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiModules.map((module) => (
                    <div key={module.id} className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(module.type)}
                        <span className="font-medium">{module.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{module.performance}%</p>
                        <p className="text-sm text-muted-foreground">{module.alerts} alertes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tendances de Sécurité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Tentatives de fraude bloquées</span>
                    <span className="font-bold text-green-600">↓ -23%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Anomalies détectées</span>
                    <span className="font-bold text-orange-600">↑ +12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Faux positifs</span>
                    <span className="font-bold text-red-600">↓ -45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Temps de réponse</span>
                    <span className="font-bold text-blue-600">↓ -67%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Système IA</CardTitle>
              <CardDescription>Paramètres avancés et personnalisation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="real-time">Surveillance en temps réel</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer la surveillance continue 24/7
                  </p>
                </div>
                <Switch 
                  id="real-time"
                  checked={aiSettings.realTimeMonitoring}
                  onCheckedChange={(checked) => 
                    setAiSettings({...aiSettings, realTimeMonitoring: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-response">Réponse automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre au système IA de prendre des actions automatiques
                  </p>
                </div>
                <Switch 
                  id="auto-response"
                  checked={aiSettings.autoResponse}
                  onCheckedChange={(checked) => 
                    setAiSettings({...aiSettings, autoResponse: checked})
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sensitivity">Niveau de sensibilité</Label>
                <Select 
                  value={aiSettings.sensitivityLevel} 
                  onValueChange={(value) => 
                    setAiSettings({...aiSettings, sensitivityLevel: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible - Moins d'alertes</SelectItem>
                    <SelectItem value="medium">Moyen - Équilibré</SelectItem>
                    <SelectItem value="high">Élevé - Maximum de détection</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reports">Fréquence des rapports</Label>
                <Select 
                  value={aiSettings.reportFrequency} 
                  onValueChange={(value) => 
                    setAiSettings({...aiSettings, reportFrequency: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                    <SelectItem value="daily">Quotidien</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="predictions">Prédictions avancées</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer les modèles prédictifs avancés
                  </p>
                </div>
                <Switch 
                  id="predictions"
                  checked={aiSettings.enablePredictions}
                  onCheckedChange={(checked) => 
                    setAiSettings({...aiSettings, enablePredictions: checked})
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="learning">Mode apprentissage</Label>
                  <p className="text-sm text-muted-foreground">
                    Permettre au système d'apprendre et de s'améliorer
                  </p>
                </div>
                <Switch 
                  id="learning"
                  checked={aiSettings.learningMode}
                  onCheckedChange={(checked) => 
                    setAiSettings({...aiSettings, learningMode: checked})
                  }
                />
              </div>

              <Button className="w-full">
                Sauvegarder la Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="copilot">
          <div className="space-y-6">
            <AICopilotPanel />
            <AITestPanel />
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="space-y-6">
            <CopiloteSystemCheck />
            <AutomaticMonitor />
          </div>
        </TabsContent>

        <TabsContent value="intelligent">
          <CopiloteChat />
        </TabsContent>

        <TabsContent value="agents">
          <PDGAgentDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PDGAIManagement;