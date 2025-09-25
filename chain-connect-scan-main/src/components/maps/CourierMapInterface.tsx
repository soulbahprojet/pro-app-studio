import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import EnhancedMapComponent from './EnhancedMapComponent';
import { 
  Truck, 
  Navigation, 
  Play, 
  Square, 
  Package,
  Clock,
  MapPin,
  Route
} from 'lucide-react';

interface CourierMapInterfaceProps {
  orderId?: string;
  showMissions?: boolean;
}

const CourierMapInterface: React.FC<CourierMapInterfaceProps> = ({ 
  orderId, 
  showMissions = true 
}) => {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState(orderId || '');
  
  const {
    isTracking,
    position,
    trackingData,
    error,
    startTracking,
    stopTracking,
    updatePosition,
    fetchTrackingData,
  } = useGPSTracking({
    orderId: selectedOrderId,
    autoUpdate: true,
    interval: 15000, // 15 secondes
  });

  const [mapMarkers, setMapMarkers] = useState<any[]>([]);

    // Update map markers when tracking data changes
    useEffect(() => {
      const markers = [];

      // Add current position if tracking
      if (position) {
        markers.push({
          id: 'current-position',
          coordinates: [position.longitude, position.latitude],
          type: 'courier',
          title: 'Ma position actuelle',
          description: `Précision: ±${position.accuracy?.toFixed(0) || 'N/A'}m`,
          status: isTracking ? 'En ligne' : 'Hors ligne',
          data: position
        });
      }

      // Add other tracking data with 224Solutions service types
      trackingData.forEach(track => {
        if (track.user_id !== user?.id && track.profiles?.role === 'courier') {
          // INTERFACE LIVREURS - Afficher SEULEMENT les autres livreurs (BLEU)
          markers.push({
            id: track.id,
            coordinates: [track.longitude, track.latitude],
            type: 'courier',
            title: track.profiles?.readable_id || 'Livreur',
            description: track.profiles?.full_name || 'Nom non défini',
            status: 'Actif',
            color: '#3b82f6', // BLEU spécifique livreurs
            icon: '🚚',
            data: track
          });
        }
      });

      setMapMarkers(markers);
    }, [position, trackingData, user?.id, isTracking]);

  const handleMarkerClick = (marker: any) => {
    console.log('Marker clicked:', marker);
    // Handle marker click (show details, navigate, etc.)
  };

  const handleLocationSelect = (coordinates: [number, number], address: string) => {
    console.log('Location selected:', coordinates, address);
    // Handle location selection for navigation
  };

  return (
    <div className="space-y-6">
      {/* Courier Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Suivi GPS Livreur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut GPS</label>
              <Badge variant={isTracking ? 'default' : 'secondary'} className="w-full justify-center">
                {isTracking ? '🟢 Actif' : '🔴 Inactif'}
              </Badge>
            </div>
            
            {position && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Précision</label>
                  <Badge variant="outline" className="w-full justify-center">
                    ±{position.accuracy?.toFixed(0) || 'N/A'}m
                  </Badge>
                </div>
                
                {position.speed && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vitesse</label>
                    <Badge variant="outline" className="w-full justify-center">
                      {(position.speed * 3.6).toFixed(0)} km/h
                    </Badge>
                  </div>
                )}
              </>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Positions</label>
              <Badge variant="outline" className="w-full justify-center">
                {trackingData.length} actives
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isTracking ? (
              <Button onClick={startTracking} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Démarrer le suivi
              </Button>
            ) : (
              <Button 
                onClick={stopTracking} 
                variant="destructive" 
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Arrêter le suivi
              </Button>
            )}
            
            {position && (
              <Button 
                onClick={() => updatePosition(position)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Mettre à jour
              </Button>
            )}
          </div>

          {position && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="font-mono text-sm">
                  {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Map */}
      <EnhancedMapComponent
        markers={mapMarkers}
        showSearch={true}
        showDirections={true}
        showRoutes={true}
        onMarkerClick={handleMarkerClick}
        onLocationSelect={handleLocationSelect}
        height="500px"
        className="w-full"
      />

      {/* Active Missions */}
      {showMissions && trackingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Missions Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trackingData.slice(0, 5).map((track) => (
                <div 
                  key={track.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {track.profiles?.readable_id || 'N/A'}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {track.profiles?.role || 'utilisateur'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {track.profiles?.full_name || 'Nom non défini'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Position: {track.latitude.toFixed(4)}, {track.longitude.toFixed(4)}
                    </div>
                  </div>
                  
                  <div className="text-right text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(track.timestamp).toLocaleTimeString('fr-FR')}
                    </div>
                    {track.order_id && (
                      <div className="text-xs text-primary">
                        Commande: {track.order_id.slice(-6)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <MapPin className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourierMapInterface;