import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import EnhancedMapComponent from './EnhancedMapComponent';
import MapboxService from '@/services/mapboxService';
import { 
  Car, 
  Navigation, 
  MapPin, 
  Clock,
  DollarSign,
  User,
  Play,
  Square,
  Route,
  Target,
  Phone
} from 'lucide-react';

interface TaxiMotoMapInterfaceProps {
  rideId?: string;
  mode?: 'driver' | 'passenger';
}

const TaxiMotoMapInterface: React.FC<TaxiMotoMapInterfaceProps> = ({ 
  rideId, 
  mode = 'driver' 
}) => {
  const { user } = useAuth();
  const [selectedRideId, setSelectedRideId] = useState(rideId || '');
  const [pickupLocation, setPickupLocation] = useState<[number, number] | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<[number, number] | null>(null);
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [rideStatus, setRideStatus] = useState<'waiting' | 'accepted' | 'picked_up' | 'in_transit' | 'completed'>('waiting');
  
  const {
    isTracking,
    position,
    trackingData,
    error,
    startTracking,
    stopTracking,
    updatePosition,
  } = useGPSTracking({
    orderId: selectedRideId,
    autoUpdate: mode === 'driver',
    interval: 10000, // 10 secondes pour taxi moto
  });

  const [mapMarkers, setMapMarkers] = useState<any[]>([]);

  // Update map markers
  useEffect(() => {
    const markers = [];

    // Add current position if tracking (for driver) - JAUNE pour taxi/moto
    if (position && mode === 'driver') {
      markers.push({
        id: 'driver-position',
        coordinates: [position.longitude, position.latitude],
        type: 'taxi_moto',
        title: 'Ma position (Chauffeur)',
        description: `Vitesse: ${position.speed ? (position.speed * 3.6).toFixed(0) + ' km/h' : 'N/A'}`,
        status: isTracking ? 'En ligne' : 'Hors ligne',
        color: '#eab308', // JAUNE spécifique taxi/moto
        icon: '🏍️',
        data: position
      });
    }

    // Add pickup location
    if (pickupLocation) {
      markers.push({
        id: 'pickup',
        coordinates: pickupLocation,
        type: 'pickup',
        title: 'Point de collecte',
        description: 'Lieu de prise en charge du passager',
        status: 'Actif'
      });
    }

    // Add dropoff location
    if (dropoffLocation) {
      markers.push({
        id: 'dropoff',
        coordinates: dropoffLocation,
        type: 'delivery',
        title: 'Destination',
        description: 'Lieu de dépose du passager',
        status: 'Actif'
      });
    }

    // Add other taxi motos nearby - JAUNE seulement pour taxi/moto
    trackingData.forEach(track => {
      if (track.user_id !== user?.id && track.profiles?.role === 'taxi_moto') {
        markers.push({
          id: track.id,
          coordinates: [track.longitude, track.latitude],
          type: 'taxi_moto',
          title: `Taxi ${track.profiles?.readable_id || 'Moto'}`,
          description: track.profiles?.full_name || 'Chauffeur',
          status: 'Disponible',
          color: '#eab308', // JAUNE spécifique taxi/moto
          icon: '🏍️',
          data: track
        });
      }
    });

    setMapMarkers(markers);
  }, [position, trackingData, user?.id, isTracking, pickupLocation, dropoffLocation, mode]);

  // Calculate fare and duration when both locations are set
  useEffect(() => {
    const calculateRideDetails = async () => {
      if (pickupLocation && dropoffLocation) {
        try {
          const route = await MapboxService.getDirections(pickupLocation, dropoffLocation, 'driving');
          
          if (route) {
            setEstimatedDuration(Math.round(route.duration / 60)); // Convert to minutes
            
            // Simple fare calculation (adjust based on your pricing model)
            const baseFare = 5000; // Base fare in GNF
            const perKmRate = 1000; // Rate per km in GNF
            const distanceKm = route.distance / 1000;
            const calculatedFare = baseFare + (distanceKm * perKmRate);
            
            setEstimatedFare(Math.round(calculatedFare));
          }
        } catch (error) {
          console.error('Error calculating ride details:', error);
        }
      }
    };

    calculateRideDetails();
  }, [pickupLocation, dropoffLocation]);

  const handleLocationSelect = (coordinates: [number, number], address: string) => {
    if (!pickupLocation) {
      setPickupLocation(coordinates);
    } else if (!dropoffLocation) {
      setDropoffLocation(coordinates);
    }
  };

  const handleMarkerClick = (marker: any) => {
    console.log('Marker clicked:', marker);
    // Handle marker interactions (call driver, show details, etc.)
  };

  const clearLocations = () => {
    setPickupLocation(null);
    setDropoffLocation(null);
    setEstimatedFare(null);
    setEstimatedDuration(null);
  };

  const acceptRide = () => {
    setRideStatus('accepted');
    if (mode === 'driver') {
      startTracking();
    }
  };

  const startRide = () => {
    setRideStatus('in_transit');
  };

  const completeRide = () => {
    setRideStatus('completed');
    if (mode === 'driver') {
      stopTracking();
    }
  };

  return (
    <div className="space-y-6">
      {/* Taxi Moto Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            {mode === 'driver' ? 'Interface Chauffeur' : 'Réservation Taxi Moto'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Driver Controls */}
          {mode === 'driver' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Statut</label>
                <Badge variant={isTracking ? 'default' : 'secondary'} className="w-full justify-center">
                  {isTracking ? '🟢 En ligne' : '🔴 Hors ligne'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Course</label>
                <Badge variant="outline" className="w-full justify-center">
                  {rideStatus === 'waiting' && '⏳ En attente'}
                  {rideStatus === 'accepted' && '✅ Acceptée'}
                  {rideStatus === 'picked_up' && '🚗 Collecté'}
                  {rideStatus === 'in_transit' && '🏃 En transit'}
                  {rideStatus === 'completed' && '🏁 Terminée'}
                </Badge>
              </div>
              
              {position && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vitesse</label>
                  <Badge variant="outline" className="w-full justify-center">
                    {position.speed ? (position.speed * 3.6).toFixed(0) + ' km/h' : '0 km/h'}
                  </Badge>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Taxis à proximité</label>
                <Badge variant="outline" className="w-full justify-center">
                  {trackingData.filter(t => t.profiles?.role === 'taxi_moto').length}
                </Badge>
              </div>
            </div>
          )}

          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Point de collecte</Label>
              <div className="p-2 border rounded-lg bg-muted">
                {pickupLocation ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="text-sm">
                      {pickupLocation[1].toFixed(4)}, {pickupLocation[0].toFixed(4)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">Cliquez sur la carte</span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Destination</Label>
              <div className="p-2 border rounded-lg bg-muted">
                {dropoffLocation ? (
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-500" />
                    <span className="text-sm">
                      {dropoffLocation[1].toFixed(4)}, {dropoffLocation[0].toFixed(4)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {pickupLocation ? 'Sélectionnez la destination' : 'Sélectionnez d\'abord le point de collecte'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Fare and Duration Estimate */}
          {estimatedFare && estimatedDuration && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Tarif estimé</div>
                  <div className="font-semibold">{estimatedFare.toLocaleString()} GNF</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm text-muted-foreground">Durée estimée</div>
                  <div className="font-semibold">{estimatedDuration} min</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {mode === 'driver' && (
              <>
                {!isTracking ? (
                  <Button onClick={startTracking} className="flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Se mettre en ligne
                  </Button>
                ) : (
                  <Button 
                    onClick={stopTracking} 
                    variant="destructive" 
                    className="flex items-center gap-2"
                  >
                    <Square className="w-4 h-4" />
                    Se mettre hors ligne
                  </Button>
                )}
                
                {rideStatus === 'waiting' && pickupLocation && dropoffLocation && (
                  <Button onClick={acceptRide} variant="default">
                    Accepter la course
                  </Button>
                )}
                
                {rideStatus === 'accepted' && (
                  <Button onClick={startRide} variant="default">
                    Démarrer la course
                  </Button>
                )}
                
                {rideStatus === 'in_transit' && (
                  <Button onClick={completeRide} variant="default">
                    Terminer la course
                  </Button>
                )}
              </>
            )}
            
            <Button onClick={clearLocations} variant="outline">
              Effacer les positions
            </Button>
            
            {pickupLocation && dropoffLocation && (
              <Button variant="outline" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Appeler le chauffeur
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Map */}
      <EnhancedMapComponent
        markers={mapMarkers}
        showSearch={true}
        showDirections={true}
        showRoutes={!!(pickupLocation && dropoffLocation)}
        onMarkerClick={handleMarkerClick}
        onLocationSelect={handleLocationSelect}
        height="500px"
        className="w-full"
      />

      {/* Current Position Info */}
      {position && mode === 'driver' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Position Actuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="text-muted-foreground">Latitude</label>
                <div className="font-mono">{position.latitude.toFixed(6)}</div>
              </div>
              <div>
                <label className="text-muted-foreground">Longitude</label>
                <div className="font-mono">{position.longitude.toFixed(6)}</div>
              </div>
              <div>
                <label className="text-muted-foreground">Précision</label>
                <div>±{position.accuracy?.toFixed(0) || 'N/A'}m</div>
              </div>
              <div>
                <label className="text-muted-foreground">Dernière MAJ</label>
                <div>{new Date().toLocaleTimeString('fr-FR')}</div>
              </div>
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

export default TaxiMotoMapInterface;
