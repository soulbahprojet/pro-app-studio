import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Zap,
  BarChart3,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  Lightbulb,
  Activity,
  PieChart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AIInsight {
  id: string;
  insight_type: string;
  confidence_score: number;
  title: string;
  description: string;
  impact_level: string;
  recommendations: string[];
  data_points: any;
  created_at: string;
}

interface FraudAlert {
  id: string;
  entity_type: string;
  entity_id: string;
  risk_score: number;
  risk_level: string;
  flags: string[];
  ai_analysis: any;
  status: string;
  created_at: string;
}

const AIInsightsDashboard = () => {
  const { toast } = useToast();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [aiStats, setAiStats] = useState({
    total_insights: 0,
    high_confidence: 0,
    fraud_detected: 0,
    recommendations_active: 0,
    efficiency_improvement: 23.5,
    cost_savings: 12750
  });

  useEffect(() => {
    loadAIData();
  }, []);

  const loadAIData = async () => {
    try {
      setLoading(true);
      
      // Charger les alertes de fraude depuis la table existante
      const { data: fraudData, error: fraudError } = await supabase
        .from('fraud_detection')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (fraudError) throw fraudError;

      // Générer des insights simulés basés sur les données existantes
      const simulatedInsights: AIInsight[] = [
        {
          id: '1',
          insight_type: 'route_optimization',
          confidence_score: 92,
          title: 'Optimisation Route Détectée',
          description: 'Analyse des patterns de livraison révèle une optimisation possible de 15%',
          impact_level: 'high',
          recommendations: ['Utiliser transporteur alternatif', 'Planifier livraisons groupées'],
          data_points: { cost_reduction: 200, time_saved: '3h' },
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          insight_type: 'performance_insight',
          confidence_score: 88,
          title: 'Performance Transporteur',
          description: 'Transporteur DHL montre 95% de ponctualité sur les derniers 30 jours',
          impact_level: 'medium',
          recommendations: ['Continuer partenariat', 'Négocier tarifs préférentiels'],
          data_points: { success_rate: 95, avg_delay: '2h' },
          created_at: new Date().toISOString()
        }
      ];

      // Transformer les données de fraude pour correspondre aux interfaces
      const transformedFraudAlerts: FraudAlert[] = (fraudData || []).map(item => ({
        id: item.id,
        entity_type: item.entity_type,
        entity_id: item.entity_id,
        risk_score: item.risk_score,
        risk_level: item.risk_level,
        flags: Array.isArray(item.flags) ? (item.flags as any[]).map(f => String(f)) : [],
        ai_analysis: item.ai_analysis || {},
        status: item.status || 'active',
        created_at: item.created_at || new Date().toISOString()
      }));

      setInsights(simulatedInsights);
      setFraudAlerts(transformedFraudAlerts);

      // Calculer les statistiques
      const totalInsights = simulatedInsights.length;
      const highConfidence = simulatedInsights.filter(i => i.confidence_score > 90).length;
      const fraudDetected = transformedFraudAlerts.filter(f => f.risk_level === 'high' || f.risk_level === 'critical').length;

      setAiStats(prev => ({
        ...prev,
        total_insights: totalInsights,
        high_confidence: highConfidence,
        fraud_detected: fraudDetected,
        recommendations_active: Math.floor(totalInsights * 0.7)
      }));

    } catch (error) {
      console.error('Error loading AI data:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données IA",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      // Simuler une analyse IA (remplacer par vraie API)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Générer de nouveaux insights simulés
      const newInsights = [
        {
          insight_type: 'route_optimization',
          confidence_score: 94,
          title: 'Optimisation Route Détectée',
          description: 'Route Paris-Berlin peut être optimisée de 15% avec changement transporteur',
          impact_level: 'high',
          recommendations: ['Changer vers transporteur premium', 'Planifier livraison en début de semaine'],
          data_points: { cost_reduction: 180, time_saved: '4h' }
        },
        {
          insight_type: 'fraud_prevention',
          confidence_score: 87,
          title: 'Activité Suspecte Détectée',
          description: 'Pattern inhabituel dans les commandes du client XYZ-789',
          impact_level: 'critical',
          recommendations: ['Vérification KYC approfondie', 'Surveillance renforcée'],
          data_points: { risk_indicators: 3, unusual_patterns: 2 }
        }
      ];

      toast({
        title: "✅ Analyse IA terminée",
        description: `${newInsights.length} nouveaux insights générés`
      });

      loadAIData();
    } catch (error) {
      console.error('Error running AI analysis:', error);
      toast({
        title: "Erreur d'analyse",
        description: "Impossible d'exécuter l'analyse IA",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'route_optimization': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'fraud_prevention': return <Shield className="w-5 h-5 text-red-600" />;
      case 'cost_optimization': return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'performance_insight': return <Target className="w-5 h-5 text-purple-600" />;
      default: return <Lightbulb className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🧠 Dashboard Intelligence IA
          </h2>
          <p className="text-muted-foreground mt-1">
            Insights avancés et prédictions intelligentes pour optimiser vos opérations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-gradient-to-r from-purple-50 to-pink-50">
            <Brain className="w-4 h-4 mr-1" />
            IA Avancée
          </Badge>
          <Button 
            onClick={runAIAnalysis}
            disabled={analyzing}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Analyser avec IA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Statistiques IA */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{aiStats.total_insights}</div>
            <p className="text-sm text-purple-600">Insights IA</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{aiStats.high_confidence}</div>
            <p className="text-sm text-blue-600">Haute Confiance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{aiStats.fraud_detected}</div>
            <p className="text-sm text-red-600">Fraudes Détectées</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{aiStats.recommendations_active}</div>
            <p className="text-sm text-green-600">Recommandations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-700">+{aiStats.efficiency_improvement}%</div>
            <p className="text-sm text-orange-600">Efficacité</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">${aiStats.cost_savings.toLocaleString()}</div>
            <p className="text-sm text-emerald-600">Économies</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Insights IA ({insights.length})
          </TabsTrigger>
          <TabsTrigger value="fraud" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Détection Fraude ({fraudAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Analytics Prédictives
          </TabsTrigger>
        </TabsList>

        {/* Insights IA */}
        <TabsContent value="insights">
          <div className="space-y-4">
            {insights.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Aucun insight disponible. Lancez une analyse IA.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              insights.map((insight) => (
                <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getInsightIcon(insight.insight_type)}
                        <div>
                          <h4 className="font-semibold text-lg">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {insight.insight_type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getImpactColor(insight.impact_level)}>
                          {insight.impact_level}
                        </Badge>
                        <Badge variant="outline">
                          IA: {insight.confidence_score}%
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{insight.description}</p>

                    {/* Barre de confiance IA */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Confiance IA</span>
                        <span className="font-medium">{insight.confidence_score}%</span>
                      </div>
                      <Progress value={insight.confidence_score} className="h-2" />
                    </div>

                    {/* Recommandations */}
                    <div className="space-y-2">
                      <h5 className="font-medium">Recommandations:</h5>
                      <ul className="space-y-1">
                        {insight.recommendations?.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Data points */}
                    {insight.data_points && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {Object.entries(insight.data_points).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key.replace('_', ' ')}:</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Voir détails
                      </Button>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Target className="w-4 h-4 mr-1" />
                        Appliquer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Détection de fraude */}
        <TabsContent value="fraud">
          <div className="space-y-4">
            {fraudAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Aucune activité frauduleuse détectée
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              fraudAlerts.map((alert) => (
                <Card key={alert.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                        <div>
                          <h4 className="font-semibold text-lg">
                            Activité Suspecte - {alert.entity_type}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            ID: {alert.entity_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      
                      <Badge className={getRiskLevelColor(alert.risk_level)}>
                        {alert.risk_level} ({alert.risk_score}/100)
                      </Badge>
                    </div>

                    {/* Score de risque */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Score de Risque</span>
                        <span className="font-medium">{alert.risk_score}/100</span>
                      </div>
                      <Progress 
                        value={alert.risk_score} 
                        className="h-3"
                        style={{
                          background: alert.risk_score > 70 ? '#fee2e2' : alert.risk_score > 40 ? '#fef3c7' : '#dcfce7'
                        }}
                      />
                    </div>

                    {/* Drapeaux de risque */}
                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Indicateurs de risque:</h5>
                      <div className="flex flex-wrap gap-2">
                        {alert.flags.map((flag, index) => (
                          <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Analyse IA */}
                    {alert.ai_analysis && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="font-medium text-red-800 mb-2">Analyse IA:</h5>
                        <p className="text-sm text-red-700">
                          {alert.ai_analysis.summary || "Analyse détaillée disponible"}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Enquêter
                      </Button>
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">
                        <Shield className="w-4 h-4 mr-1" />
                        Bloquer
                      </Button>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Analytics prédictives */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Prédictions de Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Prochaines 30 jours</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li>• Volume prévu: +18% par rapport au mois dernier</li>
                    <li>• Délais moyens: Amélioration de 12%</li>
                    <li>• Satisfaction client: Prévision 94.2%</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Opportunités d'optimisation</h4>
                  <ul className="space-y-2 text-sm text-green-700">
                    <li>• Route Paris-Lyon: Économie possible de 23%</li>
                    <li>• Transporteur premium: ROI +31% si switch</li>
                    <li>• Planification: Réduction coûts de 8%</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  Monitoring Temps Réel
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">98.7%</div>
                    <p className="text-sm text-muted-foreground">Disponibilité Système</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">1.2s</div>
                    <p className="text-sm text-muted-foreground">Temps Réponse</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">47</div>
                    <p className="text-sm text-muted-foreground">Analyses/min</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <p className="text-sm text-muted-foreground">Alertes Actives</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">IA Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Précision Prédictions:</span>
                      <span className="font-medium">94.3%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Temps Traitement:</span>
                      <span className="font-medium">0.8ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Modèles Actifs:</span>
                      <span className="font-medium">12</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsightsDashboard;
