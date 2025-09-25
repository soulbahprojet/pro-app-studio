import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EnhancedMapComponent from '@/components/maps/EnhancedMapComponent';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import MapboxService from '@/services/mapboxService';
import { 
  Navigation, 
  MapPin, 
  Route, 
  Clock, 
  Target, 
  RefreshCw,
  Truck,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface MapScreenProps {
  userRole?: 'courier' | 'client' | 'seller';
  showControls?: boolean;
}

const MapScreen: React.FC<MapScreenProps> = ({ 
  userRole = 'courier',
  showControls = true 
}) => {
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [mapMarkers, setMapMarkers] = useState<any[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  
  const { position, checkLocation, isInUnionCountry } = useGeolocation();
  const { 
    isTracking, 
    position: gpsPosition, 
    trackingData, 
    startTracking, 
    stopTracking, 
    updatePosition 
  } = useGPSTracking({ autoUpdate: true, interval: 10000 });

  // Update markers when position or tracking data changes
  useEffect(() => {
    const markers: any[] = [];

    // Add current user position
    if (position || gpsPosition) {
      const currentPos = gpsPosition || position;
      markers.push({
        id: 'current-user',
        coordinates: [currentPos.longitude, currentPos.latitude],
        type: userRole,
        title: 'Ma position',
        description: `${userRole === 'courier' ? 'Livreur' : userRole === 'client' ? 'Client' : 'Vendeur'} - Position actuelle`,
        status: isTracking ? 'En ligne' : 'Hors ligne'
      });
    }

    // Add other tracking data (other users)
    if (trackingData && trackingData.length > 0) {
      trackingData.forEach((data) => {
        // Filter out current user (compare with auth user ID if available)
        if (data.user_id) {
          markers.push({
            id: data.id,
            coordinates: [data.longitude, data.latitude],
            type: data.profiles?.role || 'client',
            title: data.profiles?.full_name || 'Utilisateur',
            description: `${data.profiles?.role || 'Client'} - Dernière position`,
            status: 'En ligne',
            data: data
          });
        }
      });
    }

    // Add mock clients for demonstration (Conakry area)
    if (userRole === 'courier') {
      const mockClients = [
        {
          id: 'client-1',
          coordinates: [-13.6921, 9.5015] as [number, number], // Kaloum
          type: 'client' as const,
          title: 'Client - Kaloum',
          description: 'Commande #1234 - 2 articles',
          status: 'En attente',
          orderDetails: {
            id: '1234',
            items: 2,
            amount: '150,000 GNF',
            address: 'Avenue de la République, Kaloum'
          }
        },
        {
          id: 'client-2', 
          coordinates: [-13.6547, 9.5582] as [number, number], // Ratoma
          type: 'client' as const,
          title: 'Client - Ratoma',
          description: 'Commande #1235 - 1 article',
          status: 'En attente',
          orderDetails: {
            id: '1235',
            items: 1,
            amount: '75,000 GNF',
            address: 'Quartier Ratoma Centre'
          }
        }
      ];
      markers.push(...mockClients);
    }

    setMapMarkers(markers);
  }, [position, gpsPosition, trackingData, userRole, isTracking]);

  const handleCenterOnUser = async () => {
    try {
      const location = await checkLocation();
      toast.success(`Position mise à jour: ${location.country}`);
    } catch (error) {
      toast.error('Impossible de récupérer votre position');
    }
  };

  const handleStartRoute = async (clientMarker: any) => {
    if (!position && !gpsPosition) {
      toast.error('Position utilisateur non disponible');
      return;
    }

    setIsCalculatingRoute(true);
    setSelectedClient(clientMarker);

    try {
      const currentPos = gpsPosition || position;
      const route = await MapboxService.getDirections(
        [currentPos.longitude, currentPos.latitude],
        clientMarker.coordinates,
        'driving'
      );

      if (route) {
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1), // km
          duration: Math.round(route.duration / 60), // minutes
          client: clientMarker
        });

        toast.success(`Itinéraire calculé: ${(route.distance / 1000).toFixed(1)}km, ${Math.round(route.duration / 60)}min`);
      } else {
        toast.error('Impossible de calculer l\'itinéraire');
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      toast.error('Erreur lors du calcul de l\'itinéraire');
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleMarkerClick = (marker: any) => {
    if (marker.type === 'client' && userRole === 'courier') {
      handleStartRoute(marker);
    }
  };

  const handleStartTracking = async () => {
    try {
      await startTracking();
      toast.success('Suivi GPS activé');
    } catch (error) {
      toast.error('Impossible d\'activer le GPS');
    }
  };

  const handleStopTracking = () => {
    stopTracking();
    toast.success('Suivi GPS désactivé');
  };

  const centerCoordinates: [number, number] = position 
    ? [position.longitude, position.latitude]
    : gpsPosition
    ? [gpsPosition.longitude, gpsPosition.latitude]
    : [-13.6924, 9.5015]; // Conakry default

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Carte 224Solutions</h1>
          <p className="text-muted-foreground">
            {userRole === 'courier' ? 'Interface Livreur' : 
             userRole === 'client' ? 'Interface Client' : 'Interface Vendeur'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isInUnionCountry ? 'default' : 'secondary'}>
            {isInUnionCountry ? '✅ Zone autorisée' : '⚠️ Hors zone'}
          </Badge>
          <Badge variant={isTracking ? 'default' : 'outline'}>
            {isTracking ? '📍 GPS actif' : '📍 GPS inactif'}
          </Badge>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GPS Control */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Contrôle GPS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Button
                  onClick={handleCenterOnUser}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Target className="w-4 h-4 mr-1" />
                  Centrer
                </Button>
                {!isTracking ? (
                  <Button
                    onClick={handleStartTracking}
                    size="sm"
                    className="flex-1"
                  >
                    Activer GPS
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopTracking}
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                  >
                    Arrêter GPS
                  </Button>
                )}
              </div>
              {position && (
                <div className="text-xs text-muted-foreground">
                  Lat: {position.latitude.toFixed(6)}
                  <br />
                  Lng: {position.longitude.toFixed(6)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Route className="w-4 h-4" />
                Itinéraire
              </CardTitle>
            </CardHeader>
            <CardContent>
              {routeInfo ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Distance:</span>
                    <span className="font-medium">{routeInfo.distance} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Durée:</span>
                    <span className="font-medium">{routeInfo.duration} min</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Vers: {routeInfo.client.title}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  {userRole === 'courier' 
                    ? 'Cliquez sur un client pour calculer l\'itinéraire'
                    : 'Aucun itinéraire actif'
                  }
                </div>
              )}
              {isCalculatingRoute && (
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Calcul en cours...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Points sur carte:</span>
                <span className="font-medium">{mapMarkers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Utilisateurs actifs:</span>
                <span className="font-medium">{trackingData?.length || 0}</span>
              </div>
              {userRole === 'courier' && (
                <div className="flex justify-between text-sm">
                  <span>Commandes en attente:</span>
                  <span className="font-medium">
                    {mapMarkers.filter(m => m.type === 'client').length}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <EnhancedMapComponent
            markers={mapMarkers}
            center={centerCoordinates}
            zoom={13}
            showSearch={true}
            showDirections={true}
            onMarkerClick={handleMarkerClick}
            height="70vh"
            className="rounded-lg overflow-hidden"
          />
        </CardContent>
      </Card>

      {/* Selected Client Info */}
      {selectedClient && userRole === 'courier' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              {selectedClient.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Détails de la commande</h4>
                <div className="space-y-1 text-sm">
                  <div>Commande: #{selectedClient.orderDetails?.id}</div>
                  <div>Articles: {selectedClient.orderDetails?.items}</div>
                  <div>Montant: {selectedClient.orderDetails?.amount}</div>
                  <div>Statut: <Badge variant="outline">{selectedClient.status}</Badge></div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Adresse</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedClient.orderDetails?.address}
                </p>
                <div className="mt-2 space-x-2">
                  <Button size="sm">
                    <Truck className="w-4 h-4 mr-1" />
                    Démarrer livraison
                  </Button>
                  <Button variant="outline" size="sm">
                    Appeler client
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MapScreen;