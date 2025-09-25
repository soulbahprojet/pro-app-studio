import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation, MapPin, Clock, Truck, Play, Square } from 'lucide-react';

interface GPSTrackerProps {
  orderId?: string;
  userRole?: 'client' | 'seller' | 'courier';
  showMap?: boolean;
}

const GPSTracker: React.FC<GPSTrackerProps> = ({ 
  orderId, 
  userRole = 'courier',
  showMap = true 
}) => {
  const { user } = useAuth();
  
  // Add detailed logging to debug the issue
  console.log('GPSTracker: Rendering with props:', { orderId, userRole, showMap });
  console.log('GPSTracker: User from auth:', user);
  const [selectedOrderId, setSelectedOrderId] = useState(orderId || '');
  
  const {
    isTracking,
    position,
    trackingData,
    error,
    isLoading,
    startTracking,
    stopTracking,
    updatePosition,
    fetchTrackingData,
  } = useGPSTracking({
    orderId: selectedOrderId,
    autoUpdate: userRole === 'courier',
    interval: 15000, // 15 secondes
  });

  // Fetch initial tracking data
  useEffect(() => {
    if (selectedOrderId) {
      fetchTrackingData(selectedOrderId);
    }
  }, [selectedOrderId, fetchTrackingData]);

  const handleManualUpdate = () => {
    if (position) {
      updatePosition(position);
    }
  };

  const formatPosition = (pos: any) => {
    return `${pos.latitude.toFixed(6)}, ${pos.longitude.toFixed(6)}`;
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR');
  };

  const getAccuracyColor = (accuracy?: number) => {
    if (!accuracy) return 'bg-gray-100 text-gray-800';
    if (accuracy < 5) return 'bg-green-100 text-green-800';
    if (accuracy < 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Configuration pour les livreurs */}
      {userRole === 'courier' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Partage de Position GPS
            </CardTitle>
            <CardDescription>
              Activez le suivi GPS pour partager votre position en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-id">ID Commande (optionnel)</Label>
              <Input
                id="order-id"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                placeholder="ORD-0001"
              />
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
                  onClick={handleManualUpdate}
                  variant="outline"
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Mettre à jour
                </Button>
              )}
            </div>

            {/* Status actuel */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Statut GPS</Label>
                <Badge variant={isTracking ? 'default' : 'secondary'}>
                  {isTracking ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
              
              {position && (
                <div className="space-y-2">
                  <Label>Précision</Label>
                  <Badge className={getAccuracyColor(position.accuracy)}>
                    {position.accuracy ? `±${position.accuracy.toFixed(0)}m` : 'N/A'}
                  </Badge>
                </div>
              )}
            </div>

            {position && (
              <div className="space-y-2">
                <Label>Position actuelle</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4" />
                    <span className="font-mono text-sm">{formatPosition(position)}</span>
                  </div>
                  {position.speed && (
                    <div className="text-sm text-muted-foreground">
                      Vitesse: {(position.speed * 3.6).toFixed(0)} km/h
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historique des positions */}
      {trackingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Historique des Positions
            </CardTitle>
            <CardDescription>
              Dernières positions GPS enregistrées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {trackingData.map((track) => (
                <div key={track.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="font-mono text-sm">{formatPosition(track)}</span>
                    </div>
                    {track.profiles && (
                      <div className="text-sm text-muted-foreground">
                        {track.profiles.readable_id} - {track.profiles.full_name}
                      </div>
                    )}
                    {track.accuracy && (
                      <Badge className={getAccuracyColor(track.accuracy)}>
                        ±{track.accuracy.toFixed(0)}m
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{formatTime(track.timestamp)}</div>
                    {track.speed && (
                      <div>{(track.speed * 3.6).toFixed(0)} km/h</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affichage des erreurs */}
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

export default GPSTracker;
