import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Star, 
  Clock, 
  DollarSign, 
  MapPin, 
  CheckCircle,
  TrendingUp,
  Package,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Award,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Carrier {
  id: string;
  name: string;
  country: string;
  service_types: string[];
  coverage_areas: string[];
  performance_rating: number;
  reliability_score: number;
  cost_competitiveness: number;
  is_active: boolean;
  created_at: string;
}

interface CarrierComparison {
  carrier: Carrier;
  estimated_cost: number;
  estimated_time: string;
  service_quality: number;
  customer_rating: number;
  on_time_percentage: number;
}

const MultiCarrierSelector = () => {
  const { toast } = useToast();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [comparisons, setComparisons] = useState<CarrierComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  
  // Critères de recherche
  const [searchCriteria, setSearchCriteria] = useState({
    origin: '',
    destination: '',
    weight: '',
    priority: 'standard',
    service_type: 'all'
  });

  useEffect(() => {
    loadCarriers();
  }, []);

  const loadCarriers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('carrier_options')
        .select('*')
        .eq('is_active', true)
        .order('performance_rating', { ascending: false });

      if (error) throw error;
      setCarriers(data || []);
      
    } catch (error) {
      console.error('Error loading carriers:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les transporteurs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const compareCarriers = async () => {
    if (!searchCriteria.origin || !searchCriteria.destination) {
      toast({
        title: "Données manquantes",
        description: "Veuillez renseigner l'origine et la destination",
        variant: "destructive"
      });
      return;
    }

    setComparing(true);
    try {
      // Simuler une comparaison IA (remplacer par vraie API)
      const mockComparisons: CarrierComparison[] = carriers.map((carrier, index) => ({
        carrier,
        estimated_cost: Math.floor(Math.random() * 500) + 200 + (index * 50),
        estimated_time: ['1-2 jours', '2-3 jours', '3-5 jours', '5-7 jours'][Math.floor(Math.random() * 4)],
        service_quality: Math.floor(Math.random() * 30) + 70,
        customer_rating: Math.floor(Math.random() * 2) + 4,
        on_time_percentage: Math.floor(Math.random() * 20) + 80
      }));

      // Trier par meilleur score global
      mockComparisons.sort((a, b) => {
        const scoreA = (a.carrier.performance_rating + a.service_quality + a.on_time_percentage) / 3;
        const scoreB = (b.carrier.performance_rating + b.service_quality + b.on_time_percentage) / 3;
        return scoreB - scoreA;
      });

      setComparisons(mockComparisons);
      
      toast({
        title: "✅ Comparaison terminée",
        description: `${mockComparisons.length} transporteurs analysés`
      });

    } catch (error) {
      console.error('Error comparing carriers:', error);
      toast({
        title: "Erreur de comparaison",
        description: "Impossible de comparer les transporteurs",
        variant: "destructive"
      });
    } finally {
      setComparing(false);
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'express': return <Zap className="w-4 h-4 text-red-500" />;
      case 'standard': return <Package className="w-4 h-4 text-blue-500" />;
      case 'freight': return <Truck className="w-4 h-4 text-green-500" />;
      default: return <Globe className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return 'text-green-600';
    if (rating >= 80) return 'text-yellow-600';
    if (rating >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getOverallScore = (comparison: CarrierComparison) => {
    const weights = {
      performance: 0.3,
      cost: 0.25,
      reliability: 0.25,
      service: 0.2
    };

    const costScore = Math.max(0, 100 - (comparison.estimated_cost / 10)); // Moins cher = meilleur
    const performanceScore = comparison.carrier.performance_rating;
    const reliabilityScore = comparison.on_time_percentage;
    const serviceScore = comparison.service_quality;

    return Math.round(
      performanceScore * weights.performance +
      costScore * weights.cost +
      reliabilityScore * weights.reliability +
      serviceScore * weights.service
    );
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            🚛 Sélecteur Multi-Transporteurs
          </h2>
          <p className="text-muted-foreground mt-1">
            Comparaison intelligente et sélection automatique du meilleur transporteur
          </p>
        </div>
        <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-blue-50">
          <Award className="w-4 h-4 mr-1" />
          Smart Selection
        </Badge>
      </div>

      {/* Formulaire de recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Critères de Comparaison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="origin">Origine</Label>
              <Input
                id="origin"
                placeholder="Ville de départ"
                value={searchCriteria.origin}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, origin: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                placeholder="Ville d'arrivée"
                value={searchCriteria.destination}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, destination: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="weight">Poids (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="0"
                value={searchCriteria.weight}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, weight: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priorité</Label>
              <select
                id="priority"
                className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background"
                value={searchCriteria.priority}
                onChange={(e) => setSearchCriteria(prev => ({ ...prev, priority: e.target.value }))}
              >
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={compareCarriers}
                disabled={comparing}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {comparing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Comparaison...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Comparer
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comparison" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Comparaison
          </TabsTrigger>
          <TabsTrigger value="carriers" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Transporteurs ({carriers.length})
          </TabsTrigger>
        </TabsList>

        {/* Résultats de comparaison */}
        <TabsContent value="comparison">
          {comparisons.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-48">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Utilisez le formulaire ci-dessus pour comparer les transporteurs
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Meilleure recommandation */}
              <Card className="ring-2 ring-green-500 ring-offset-2 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-700">🏆 Meilleure Recommandation</CardTitle>
                    <Badge className="bg-green-500">
                      <Award className="w-3 h-3 mr-1" />
                      Score: {getOverallScore(comparisons[0])}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <Truck className="w-8 h-8 text-green-600" />
                      <div>
                        <h4 className="font-bold text-lg">{comparisons[0].carrier.name}</h4>
                        <p className="text-sm text-muted-foreground">{comparisons[0].carrier.country}</p>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">${comparisons[0].estimated_cost}</div>
                      <p className="text-sm text-muted-foreground">Coût estimé</p>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{comparisons[0].estimated_time}</div>
                      <p className="text-sm text-muted-foreground">Délai livraison</p>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{comparisons[0].on_time_percentage}%</div>
                      <p className="text-sm text-muted-foreground">Ponctualité</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sélectionner ce transporteur
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Autres options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comparisons.slice(1).map((comparison, index) => (
                  <Card key={comparison.carrier.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{comparison.carrier.name}</CardTitle>
                        <Badge variant="outline">
                          Score: {getOverallScore(comparison)}/100
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span>${comparison.estimated_cost}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span>{comparison.estimated_time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-600" />
                          <span>{comparison.customer_rating}/5</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                          <span>{comparison.on_time_percentage}%</span>
                        </div>
                      </div>

                      {/* Barres de performance */}
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Performance</span>
                            <span>{comparison.carrier.performance_rating}%</span>
                          </div>
                          <Progress value={comparison.carrier.performance_rating} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Fiabilité</span>
                            <span>{comparison.carrier.reliability_score}%</span>
                          </div>
                          <Progress value={comparison.carrier.reliability_score} className="h-2" />
                        </div>
                      </div>

                      <Button variant="outline" className="w-full">
                        Choisir ce transporteur
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Liste des transporteurs */}
        <TabsContent value="carriers">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {carriers.map((carrier) => (
              <Card key={carrier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{carrier.name}</CardTitle>
                    <Badge variant="outline">{carrier.country}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Scores de performance */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance</span>
                      <span className={`font-medium ${getRatingColor(carrier.performance_rating)}`}>
                        {carrier.performance_rating}/100
                      </span>
                    </div>
                    <Progress value={carrier.performance_rating} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Fiabilité</span>
                      <span className={`font-medium ${getRatingColor(carrier.reliability_score)}`}>
                        {carrier.reliability_score}%
                      </span>
                    </div>
                    <Progress value={carrier.reliability_score} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compétitivité Prix</span>
                      <span className={`font-medium ${getRatingColor(carrier.cost_competitiveness)}`}>
                        {carrier.cost_competitiveness}/100
                      </span>
                    </div>
                    <Progress value={carrier.cost_competitiveness} className="h-2" />
                  </div>

                  {/* Services offerts */}
                  <div>
                    <h5 className="text-sm font-medium mb-2">Services:</h5>
                    <div className="flex flex-wrap gap-1">
                      {carrier.service_types.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {getServiceTypeIcon(service)}
                          <span className="ml-1 capitalize">{service}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Shield className="w-4 h-4 mr-2" />
                    Voir détails
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MultiCarrierSelector;