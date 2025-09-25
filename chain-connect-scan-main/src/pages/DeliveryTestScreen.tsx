import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import EnhancedMapComponent from '@/components/maps/EnhancedMapComponent';
import MapboxService from '@/services/mapboxService';
import { 
  Navigation, 
  MapPin, 
  Route, 
  Clock, 
  Truck,
  User,
  RefreshCw,
  Play,
  Square,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

const DeliveryTestScreen: React.FC = () => {
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);

  // Test coordinates - Conakry, Guinea
  const courierPosition: [number, number] = [-13.6921, 9.5015]; // Kaloum
  const clientPosition: [number, number] = [-13.6547, 9.5582]; // Ratoma

  const [testMarkers, setTestMarkers] = useState([
    {
      id: 'test-courier',
      coordinates: courierPosition,
      type: 'courier' as const,
      title: 'Livreur Test - Kaloum',
      description: 'Position de départ du livreur',
      status: 'Disponible'
    },
    {
      id: 'test-client',
      coordinates: clientPosition,
      type: 'client' as const,
      title: 'Client Test - Ratoma',
      description: 'Destination de livraison',
      status: 'En attente'
    }
  ]);

  const calculateTestRoute = async () => {
    setIsCalculatingRoute(true);
    
    try {
      const route = await MapboxService.getDirections(
        courierPosition,
        clientPosition,
        'driving'
      );

      if (route) {
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1), // km
          duration: Math.round(route.duration / 60), // minutes
          steps: route.route.legs[0]?.steps || [],
          geometry: route.geometry,
          fullRoute: route
        });

        toast.success(
          `Itinéraire calculé: ${(route.distance / 1000).toFixed(1)}km en ${Math.round(route.duration / 60)}min`
        );
      } else {
        toast.error('Impossible de calculer l\'itinéraire de test');
      }
    } catch (error) {
      console.error('Test route calculation error:', error);
      toast.error('Erreur lors du calcul de l\'itinéraire de test');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const simulateDelivery = () => {
    if (isSimulating) {
      setIsSimulating(false);
      setSimulationProgress(0);
      return;
    }

    if (!routeInfo) {
      toast.error('Calculez d\'abord l\'itinéraire');
      return;
    }

    setIsSimulating(true);
    setSimulationProgress(0);

    // Simulate delivery progress
    const totalDuration = routeInfo.duration * 60 * 1000; // Convert to milliseconds
    const updateInterval = 1000; // Update every second
    const progressStep = (updateInterval / totalDuration) * 100;

    const interval = setInterval(() => {
      setSimulationProgress(prev => {
        const newProgress = prev + progressStep;
        
        if (newProgress >= 100) {
          setIsSimulating(false);
          clearInterval(interval);
          toast.success('Livraison simulée terminée!');
          
          // Update markers to show delivery completed
          setTestMarkers(prev => prev.map(marker => 
            marker.id === 'test-courier' 
              ? { ...marker, coordinates: clientPosition, status: 'Livraison terminée' }
              : marker.id === 'test-client'
              ? { ...marker, status: 'Livré' }
              : marker
          ));
          
          return 100;
        }
        
        return newProgress;
      });
    }, updateInterval);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setSimulationProgress(0);
    setRouteInfo(null);
    
    // Reset markers to initial positions
    setTestMarkers([
      {
        id: 'test-courier',
        coordinates: courierPosition,
        type: 'courier' as const,
        title: 'Livreur Test - Kaloum',
        description: 'Position de départ du livreur',
        status: 'Disponible'
      },
      {
        id: 'test-client',
        coordinates: clientPosition,
        type: 'client' as const,
        title: 'Client Test - Ratoma', 
        description: 'Destination de livraison',
        status: 'En attente'
      }
    ]);
    
    toast.success('Simulation réinitialisée');
  };

  const handleMarkerClick = (marker: any) => {
    toast.info(`Clicked on: ${marker.title}`);
  };

  useEffect(() => {
    // Auto-calculate route on component mount
    calculateTestRoute();
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test de Livraison 224Solutions</h1>
          <p className="text-muted-foreground">
            Simulation d'un trajet Kaloum → Ratoma (Conakry)
          </p>
        </div>
        
        <Badge variant="outline" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Test Conakry
        </Badge>
      </div>

      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Route Calculation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Route className="w-4 h-4" />
              Calcul d'Itinéraire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={calculateTestRoute}
              disabled={isCalculatingRoute}
              className="w-full"
              size="sm"
            >
              {isCalculatingRoute ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Calcul...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 mr-2" />
                  Calculer Route
                </>
              )}
            </Button>
            
            {routeInfo && (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Distance:</span>
                  <span className="font-medium">{routeInfo.distance} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Durée:</span>
                  <span className="font-medium">{routeInfo.duration} min</span>
                </div>
                <div className="flex justify-between">
                  <span>Étapes:</span>
                  <span className="font-medium">{routeInfo.steps.length}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simulation Control */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Simulation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={simulateDelivery}
              disabled={!routeInfo}
              variant={isSimulating ? "destructive" : "default"}
              className="w-full"
              size="sm"
            >
              {isSimulating ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Arrêter
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Démarrer
                </>
              )}
            </Button>
            
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="w-full"
              size="sm"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            
            {isSimulating && (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  Progression: {simulationProgress.toFixed(1)}%
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${simulationProgress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Points */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              Points de Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div>
                <div className="font-medium">🏍️ Livreur - Kaloum</div>
                <div className="text-xs text-muted-foreground">
                  {courierPosition[1].toFixed(4)}, {courierPosition[0].toFixed(4)}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="font-medium">👤 Client - Ratoma</div>
                <div className="text-xs text-muted-foreground">
                  {clientPosition[1].toFixed(4)}, {clientPosition[0].toFixed(4)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <EnhancedMapComponent
            markers={testMarkers}
            center={[-13.6734, 9.5298]} // Center between Kaloum and Ratoma
            zoom={12}
            showSearch={false}
            showDirections={true}
            onMarkerClick={handleMarkerClick}
            height="70vh"
            className="rounded-lg overflow-hidden"
          />
        </CardContent>
      </Card>

      {/* Route Details */}
      {routeInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Détails de l'Itinéraire de Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Informations Générales</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Distance totale:</span>
                    <span className="font-medium">{routeInfo.distance} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Durée estimée:</span>
                    <span className="font-medium">{routeInfo.duration} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nombre d'étapes:</span>
                    <span className="font-medium">{routeInfo.steps.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type de trajet:</span>
                    <span className="font-medium">Conduite (driving)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Statistiques de Test</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Vitesse moyenne:</span>
                    <span className="font-medium">
                      {((parseFloat(routeInfo.distance) / routeInfo.duration) * 60).toFixed(1)} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progression:</span>
                    <span className="font-medium">
                      {isSimulating ? `${simulationProgress.toFixed(1)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statut:</span>
                    <Badge variant={isSimulating ? "default" : "outline"}>
                      {isSimulating ? 'En cours' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeliveryTestScreen;