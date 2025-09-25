import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Globe, 
  Users, 
  Package,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  MapPin
} from 'lucide-react';

interface KPI {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: any;
  color: string;
}

interface CountryStats {
  country: string;
  shipments: number;
  revenue: number;
  avgDeliveryTime: number;
  flag: string;
}

interface PerformanceMetric {
  metric: string;
  current: number;
  target: number;
  status: 'good' | 'warning' | 'critical';
}

export default function AdvancedAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [kpis, setKpis] = useState<KPI[]>([
    {
      title: "Revenus Totaux",
      value: "847,230 USD",
      change: "+12.5%",
      trend: 'up',
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Expéditions Actives",
      value: "1,247",
      change: "+8.2%",
      trend: 'up',
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Délai Moyen Livraison",
      value: "4.2 jours",
      change: "-0.8 jours",
      trend: 'up',
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Taux de Satisfaction",
      value: "97.8%",
      change: "+2.1%",
      trend: 'up',
      icon: CheckCircle,
      color: "text-purple-600"
    }
  ]);

  const [countryStats, setCountryStats] = useState<CountryStats[]>([
    { country: "France", shipments: 342, revenue: 125430, avgDeliveryTime: 3.2, flag: "🇫🇷" },
    { country: "USA", shipments: 289, revenue: 98750, avgDeliveryTime: 5.1, flag: "🇺🇸" },
    { country: "Allemagne", shipments: 156, revenue: 67890, avgDeliveryTime: 3.8, flag: "🇩🇪" },
    { country: "Espagne", shipments: 98, revenue: 34560, avgDeliveryTime: 4.2, flag: "🇪🇸" },
    { country: "Italie", shipments: 87, revenue: 29340, avgDeliveryTime: 4.7, flag: "🇮🇹" }
  ]);

  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([
    { metric: "Livraisons à Temps", current: 94.2, target: 95.0, status: 'warning' },
    { metric: "Colis Endommagés", current: 0.8, target: 1.0, status: 'good' },
    { metric: "Réclamations Client", current: 2.1, target: 2.0, status: 'warning' },
    { metric: "Temps Traitement", current: 1.2, target: 1.5, status: 'good' },
    { metric: "Coût par Expédition", current: 89.5, target: 85.0, status: 'critical' }
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 rounded bg-gray-400"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <div className="w-4 h-4 rounded bg-gray-400"></div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Période et Contrôles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Avancées</h2>
          <p className="text-muted-foreground">
            Tableaux de bord détaillés et KPIs performance
          </p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === 'week' ? 'Semaine' : 
               period === 'month' ? 'Mois' :
               period === 'quarter' ? 'Trimestre' : 'Année'}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold">{kpi.value}</p>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(kpi.trend)}
                        <span className={`text-sm font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {kpi.change}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-primary/10`}>
                    <IconComponent className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="countries">Pays</TabsTrigger>
          <TabsTrigger value="predictive">Prédictif IA</TabsTrigger>
          <TabsTrigger value="realtime">Temps Réel</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Métriques de Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Métriques de Performance
                </CardTitle>
                <CardDescription>
                  Suivi des KPIs opérationnels vs objectifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{metric.metric}</span>
                        <Badge className={getStatusColor(metric.status)}>
                          {getStatusIcon(metric.status)}
                          <span className="ml-1">
                            {metric.current}
                            {metric.metric.includes('Temps') ? 'h' : 
                             metric.metric.includes('Coût') ? '$' : '%'}
                          </span>
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.status === 'good' ? 'bg-green-500' :
                            metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((metric.current / metric.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Objectif: {metric.target}
                        {metric.metric.includes('Temps') ? 'h' : 
                         metric.metric.includes('Coût') ? '$' : '%'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Graphique Revenus */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Revenus</CardTitle>
                <CardDescription>Tendance sur les 12 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between gap-2">
                  {[65, 78, 82, 91, 88, 95, 105, 98, 112, 125, 118, 135].map((value, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div 
                        className="w-6 bg-primary rounded-t"
                        style={{ height: `${(value / 135) * 200}px` }}
                      ></div>
                      <span className="text-xs text-muted-foreground">
                        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Performance par Pays
              </CardTitle>
              <CardDescription>
                Analyse détaillée par destination
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {countryStats.map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{country.flag}</span>
                      <div>
                        <h4 className="font-medium">{country.country}</h4>
                        <p className="text-sm text-muted-foreground">
                          {country.shipments} expéditions
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-right">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenus</p>
                        <p className="font-medium">{country.revenue.toLocaleString()} USD</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Délai Moyen</p>
                        <p className="font-medium">{country.avgDeliveryTime} jours</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Taux de Croissance</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-600">
                            +{(Math.random() * 20 + 5).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>🤖 Prédictions IA OpenAI</CardTitle>
                <CardDescription>
                  Analyse prédictive des risques et opportunités
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800">Risque de Retard Détecté</h4>
                    </div>
                    <p className="text-sm text-yellow-700">
                      L'expédition INT-001 vers Paris risque un retard de 2-3 jours due aux conditions météo.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Voir Détails
                    </Button>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium text-green-800">Opportunité Détectée</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Demande croissante prédite vers l'Allemagne (+15% prévu le mois prochain).
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Ajuster Capacité
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Optimisation Recommandée</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Réduction possible des coûts de 8% en optimisant les routes vers l'Europe.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Appliquer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Prévisions Revenue</CardTitle>
                <CardDescription>Projections pour les 6 prochains mois</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { month: 'Février', predicted: 920000, confidence: 87 },
                    { month: 'Mars', predicted: 985000, confidence: 83 },
                    { month: 'Avril', predicted: 1050000, confidence: 79 },
                    { month: 'Mai', predicted: 1120000, confidence: 75 },
                    { month: 'Juin', predicted: 1180000, confidence: 71 },
                    { month: 'Juillet', predicted: 1250000, confidence: 68 }
                  ].map((forecast, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{forecast.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">
                          {forecast.predicted.toLocaleString()} USD
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {forecast.confidence}% confiance
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Colis En Transit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">847</div>
                  <p className="text-muted-foreground">Actuellement en mouvement</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Europe</span>
                      <span>342</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Amérique</span>
                      <span>289</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Asie</span>
                      <span>216</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Équipes Actives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">23</div>
                  <p className="text-muted-foreground">Équipes en service</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Collecte</span>
                      <span className="text-green-600">8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transit</span>
                      <span className="text-blue-600">9</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Livraison</span>
                      <span className="text-orange-600">6</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Alertes Actives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">3</div>
                  <p className="text-muted-foreground">Incidents en cours</p>
                  <div className="mt-4 space-y-2">
                    <div className="p-2 bg-red-50 rounded text-xs">
                      Retard douanier - INT-045
                    </div>
                    <div className="p-2 bg-yellow-50 rounded text-xs">
                      Météo défavorable - Zone EU
                    </div>
                    <div className="p-2 bg-orange-50 rounded text-xs">
                      Surcharge entrepôt - CON-01
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
}
