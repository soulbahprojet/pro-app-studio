import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Route, 
  MapPin, 
  Clock, 
  DollarSign, 
  Zap, 
  Truck, 
  Globe, 
  TrendingUp,
  Navigation,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Leaf
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RouteOptimization {
  id: string;
  origin_address: string;
  destination_address: string;
  optimization_type: string;
  recommended_carrier: string | null;
  estimated_time: string | null;
  estimated_cost: number | null;
  currency: string;
  route_polyline: string | null;
  ai_confidence_score: number;
  created_at: string;
}

interface Carrier {
  id: string;
  name: string;
  performance_rating: number;
  reliability_score: number;
  cost_competitiveness: number;
}

const RouteOptimizationScreen = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [routes, setRoutes] = useState<RouteOptimization[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    optimizationType: 'balanced',
    weight: '',
    dimensions: '',
    priority: 'standard'
  });

  // Optimization results
  const [optimizationResults, setOptimizationResults] = useState<any>(null);

  useEffect(() => {
    loadCarriers();
    loadRecentOptimizations();
  }, []);

  const loadCarriers = async () => {
    try {
      const { data, error } = await supabase
        .from('carrier_options')
        .select('*')
        .eq('is_active', true)
        .order('performance_rating', { ascending: false });

      if (error) throw error;
      setCarriers(data || []);
    } catch (error) {
      console.error('Error loading carriers:', error);
    }
  };

  const loadRecentOptimizations = async () => {
    try {
      const { data, error } = await supabase
        .from('route_optimization')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRoutes((data || []) as RouteOptimization[]);
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  };

  const optimizeRoute = async () => {
    if (!formData.origin || !formData.destination) {
      toast({
        title: "Données manquantes",
        description: "Veuillez renseigner l'origine et la destination",
        variant: "destructive"
      });
      return;
    }

    setOptimizing(true);
    try {
      // Simuler l'optimisation IA (remplacer par vraie API)
      const mockResults = {
        recommendations: [
          {
            carrier: carriers[0],
            cost: 1250,
            time: '2-3 jours',
            reliability: 98,
            co2_impact: 'low',
            route_quality: 'excellent'
          },
          {
            carrier: carriers[1],
            cost: 1100,
            time: '3-4 jours',
            reliability: 95,
            co2_impact: 'medium',
            route_quality: 'good'
          },
          {
            carrier: carriers[2],
            cost: 950,
            time: '4-6 jours',
            reliability: 92,
            co2_impact: 'high',
            route_quality: 'standard'
          }
        ],
        ai_insights: {
          confidence_score: 94,
          risk_factors: ['weather_delays', 'traffic_congestion'],
          recommendations: [
            'Route recommandée avec transporteur premium pour livraison garantie',
            'Alternative économique disponible avec délai acceptable',
            'Éviter période de pointe (15-25 du mois) pour meilleurs tarifs'
          ]
        }
      };

      setOptimizationResults(mockResults);
      
      // Sauvegarder en base
      const { error } = await supabase
        .from('route_optimization')
        .insert({
          origin_address: formData.origin,
          destination_address: formData.destination,
          optimization_type: formData.optimizationType,
          recommended_carrier: mockResults.recommendations[0].carrier.id,
          estimated_cost: mockResults.recommendations[0].cost,
          estimated_time: mockResults.recommendations[0].time,
          ai_confidence_score: mockResults.ai_insights.confidence_score
        });

      if (error) throw error;

      toast({
        title: "✅ Optimisation réussie",
        description: `Route optimisée avec ${mockResults.ai_insights.confidence_score}% de confiance IA`
      });

    } catch (error) {
      console.error('Error optimizing route:', error);
      toast({
        title: "Erreur d'optimisation",
        description: "Impossible d'optimiser la route",
        variant: "destructive"
      });
    } finally {
      setOptimizing(false);
    }
  };

  const getOptimizationTypeIcon = (type: string) => {
    switch (type) {
      case 'fastest': return <Zap className="w-4 h-4" />;
      case 'cheapest': return <DollarSign className="w-4 h-4" />;
      case 'eco': return <Leaf className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getOptimizationTypeColor = (type: string) => {
    switch (type) {
      case 'fastest': return 'bg-red-500';
      case 'cheapest': return 'bg-green-500';
      case 'eco': return 'bg-emerald-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🚀 Optimisation Routes IA
          </h2>
          <p className="text-muted-foreground mt-1">
            Intelligence artificielle pour optimiser vos itinéraires de livraison
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-purple-50">
          <BarChart3 className="w-4 h-4 mr-1" />
          Analytics Avancées
        </Badge>
      </div>

      <Tabs defaultValue="optimizer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="optimizer" className="flex items-center gap-2">
            <Route className="w-4 h-4" />
            Optimisateur
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Résultats
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Optimisateur */}
        <TabsContent value="optimizer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire d'optimisation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-blue-600" />
                  Configuration Route
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="origin">Origine</Label>
                    <Input
                      id="origin"
                      placeholder="Adresse de départ"
                      value={formData.origin}
                      onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="destination">Destination</Label>
                    <Input
                      id="destination"
                      placeholder="Adresse d'arrivée"
                      value={formData.destination}
                      onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="optimization">Type d'optimisation</Label>
                    <Select value={formData.optimizationType} onValueChange={(value) => setFormData(prev => ({ ...prev, optimizationType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fastest">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-red-500" />
                            Plus rapide
                          </div>
                        </SelectItem>
                        <SelectItem value="cheapest">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            Moins cher
                          </div>
                        </SelectItem>
                        <SelectItem value="balanced">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-500" />
                            Équilibré
                          </div>
                        </SelectItem>
                        <SelectItem value="eco">
                          <div className="flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-emerald-500" />
                            Écologique
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="weight">Poids (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="0"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dimensions">Dimensions (cm³)</Label>
                      <Input
                        id="dimensions"
                        placeholder="L x l x h"
                        value={formData.dimensions}
                        onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={optimizeRoute}
                  disabled={optimizing}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {optimizing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Optimisation IA en cours...
                    </>
                  ) : (
                    <>
                      <Route className="w-4 h-4 mr-2" />
                      Optimiser avec IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Statistiques transporteurs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-green-600" />
                  Transporteurs Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {carriers.slice(0, 4).map((carrier) => (
                    <div key={carrier.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{carrier.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          ⭐ {carrier.performance_rating}/100
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Fiabilité: {carrier.reliability_score}%</div>
                        <div>Coût: {carrier.cost_competitiveness}/100</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Résultats d'optimisation */}
        <TabsContent value="results">
          {optimizationResults ? (
            <div className="space-y-6">
              {/* Score IA */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Analyse IA Complétée</h3>
                      <p className="text-muted-foreground">
                        Confiance: {optimizationResults.ai_insights.confidence_score}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {optimizationResults.ai_insights.confidence_score}%
                      </div>
                      <Badge variant="secondary">IA Confiance</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommandations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {optimizationResults.recommendations.map((rec: any, index: number) => (
                  <Card key={index} className={`${index === 0 ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{rec.carrier.name}</CardTitle>
                        {index === 0 && (
                          <Badge className="bg-blue-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Recommandé
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>${rec.cost}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>{rec.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span>{rec.reliability}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-emerald-600" />
                          <span className="capitalize">{rec.co2_impact}</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <Badge variant="outline" className="w-full justify-center">
                          Qualité: {rec.route_quality}
                        </Badge>
                      </div>
                      
                      <Button 
                        variant={index === 0 ? "default" : "outline"} 
                        className="w-full"
                      >
                        {index === 0 ? "Sélectionner" : "Choisir"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Insights IA */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Insights & Recommandations IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Facteurs de risque détectés:</h4>
                    <div className="flex flex-wrap gap-2">
                      {optimizationResults.ai_insights.risk_factors.map((risk: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700">
                          {risk.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Recommandations:</h4>
                    <ul className="space-y-2">
                      {optimizationResults.ai_insights.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-48">
                <div className="text-center">
                  <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucune optimisation en cours. Utilisez l'optimisateur pour commencer.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Optimisations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {routes.map((route) => (
                  <div key={route.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getOptimizationTypeColor(route.optimization_type)}`} />
                        <span className="font-medium">{route.origin_address} → {route.destination_address}</span>
                      </div>
                      <Badge variant="outline">
                        IA: {route.ai_confidence_score}%
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getOptimizationTypeIcon(route.optimization_type)}
                        <span className="capitalize">{route.optimization_type}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{route.currency} {route.estimated_cost}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(route.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RouteOptimizationScreen;