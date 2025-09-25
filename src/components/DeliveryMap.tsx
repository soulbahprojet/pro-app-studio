import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DeliveryTracking, Courier } from '@/types';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Clock, 
  Phone, 
  MessageCircle,
  RefreshCw,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

interface DeliveryMapProps {
  deliveries: DeliveryTracking[];
  couriers: Courier[];
  onCourierSelect?: (courier: Courier) => void;
  onDeliverySelect?: (delivery: DeliveryTracking) => void;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({ 
  deliveries, 
  couriers, 
  onCourierSelect, 
  onDeliverySelect 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(!mapboxToken);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryTracking | null>(null);
  const [isTracking, setIsTracking] = useState(true);
  const [courierMarkers, setCourierMarkers] = useState<mapboxgl.Marker[]>([]);

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-9.644, 9.641], // Conakry, Guinée
      zoom: 12,
    });

    // Ajouter les contrôles de navigation
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Ajouter contrôle de géolocalisation
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      }),
      'top-right'
    );

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Mettre à jour les marqueurs des livreurs
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Nettoyer les anciens marqueurs
    courierMarkers.forEach(marker => marker.remove());

    const newMarkers: mapboxgl.Marker[] = [];

    couriers.forEach(courier => {
      if (!courier.location) return;

      // Créer un élément DOM personnalisé pour le marqueur
      const el = document.createElement('div');
      el.className = 'courier-marker';
      el.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #22c55e, #16a34a);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        position: relative;
      `;

      // Ajouter icône selon le statut
      if (courier.status === 'available') {
        el.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        el.innerHTML = '🏍️';
      } else if (courier.status === 'busy') {
        el.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        el.innerHTML = '📦';
      } else {
        el.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
        el.innerHTML = '💤';
      }

      // Créer le marqueur
      const marker = new mapboxgl.Marker(el)
        .setLngLat([courier.location.lng, courier.location.lat])
        .addTo(map.current!);

      // Popup avec informations du livreur
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3">
          <h3 class="font-semibold text-sm">${courier.name}</h3>
          <p class="text-xs text-gray-600">${courier.vehicleInfo.type} - ${courier.vehicleInfo.plate}</p>
          <div class="flex items-center mt-2">
            <span class="text-xs px-2 py-1 rounded ${
              courier.status === 'available' ? 'bg-green-100 text-green-800' :
              courier.status === 'busy' ? 'bg-orange-100 text-orange-800' :
              'bg-gray-100 text-gray-800'
            }">${courier.status}</span>
          </div>
        </div>
      `);

      marker.setPopup(popup);

      // Event listener pour sélection
      el.addEventListener('click', () => {
        onCourierSelect?.(courier);
      });

      newMarkers.push(marker);
    });

    setCourierMarkers(newMarkers);
  }, [couriers, mapboxToken, onCourierSelect]);

  // Mettre à jour les routes de livraison
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    deliveries.forEach(delivery => {
      // Ajouter marqueur point de collecte
      const pickupEl = document.createElement('div');
      pickupEl.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
      `;
      pickupEl.innerHTML = '📦';

      new mapboxgl.Marker(pickupEl)
        .setLngLat([delivery.route.pickup.lng, delivery.route.pickup.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h4 class="font-medium text-sm">Point de collecte</h4>
            <p class="text-xs text-gray-600">${delivery.route.pickup.address}</p>
            <p class="text-xs mt-1">Commande: ${delivery.orderId}</p>
          </div>
        `))
        .addTo(map.current!);

      // Ajouter marqueur point de livraison
      const deliveryEl = document.createElement('div');
      deliveryEl.style.cssText = `
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
      `;
      deliveryEl.innerHTML = '🏠';

      new mapboxgl.Marker(deliveryEl)
        .setLngLat([delivery.route.delivery.lng, delivery.route.delivery.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h4 class="font-medium text-sm">Point de livraison</h4>
            <p class="text-xs text-gray-600">${delivery.route.delivery.address}</p>
            <p class="text-xs mt-1">ETA: ${new Date(delivery.estimatedArrival).toLocaleTimeString()}</p>
          </div>
        `))
        .addTo(map.current!);

      // Ajouter position actuelle du livreur si en cours
      if (delivery.status === 'in_transit') {
        const courierEl = document.createElement('div');
        courierEl.style.cssText = `
          width: 35px;
          height: 35px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          animation: pulse 2s infinite;
        `;
        courierEl.innerHTML = '🏍️';

        new mapboxgl.Marker(courierEl)
          .setLngLat([delivery.currentLocation.lng, delivery.currentLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <h4 class="font-medium text-sm">Livreur en cours</h4>
              <p class="text-xs text-gray-600">Commande: ${delivery.orderId}</p>
              <p class="text-xs">Dernière position: ${new Date(delivery.currentLocation.timestamp).toLocaleTimeString()}</p>
            </div>
          `))
          .addTo(map.current!);
      }
    });
  }, [deliveries, mapboxToken]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'assigned': return 'Assigné';
      case 'picked_up': return 'Collecté';
      case 'in_transit': return 'En transit';
      case 'delivered': return 'Livré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  if (showTokenInput) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Configuration Mapbox</CardTitle>
          <CardDescription>
            Entrez votre token Mapbox public pour activer les cartes. 
            Créez un compte gratuit sur <a href="https://mapbox.com" target="_blank" className="text-primary underline">mapbox.com</a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="mapbox-token">Token Mapbox Public</Label>
            <Input
              id="mapbox-token"
              type="password"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6Ii..."
            />
          </div>
          <Button onClick={handleTokenSubmit} disabled={!mapboxToken.trim()}>
            Activer les cartes
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contrôles de la carte */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Tracking GPS Livraisons</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTracking(!isTracking)}
          >
            {isTracking ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {isTracking ? 'Tracking ON' : 'Tracking OFF'}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowTokenInput(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Config
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Carte principale */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              <div 
                ref={mapContainer} 
                className="w-full h-[600px] rounded-lg"
                style={{ minHeight: '600px' }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Panneau de contrôle */}
        <div className="space-y-4">
          {/* Statistiques rapides */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Statistiques Live</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Livreurs actifs</span>
                <Badge variant="default">{couriers.filter(c => c.status !== 'offline').length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Livraisons en cours</span>
                <Badge variant="outline">{deliveries.filter(d => d.status === 'in_transit').length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">En attente</span>
                <Badge variant="secondary">{deliveries.filter(d => d.status === 'assigned').length}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Liste des livraisons */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Livraisons Actives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deliveries.slice(0, 5).map((delivery) => (
                <div 
                  key={delivery.id}
                  className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedDelivery(delivery);
                    onDeliverySelect?.(delivery);
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">#{delivery.orderId.slice(-6)}</span>
                    <Badge className={getStatusColor(delivery.status)} variant="outline">
                      {getStatusLabel(delivery.status)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{delivery.route.pickup.address.slice(0, 25)}...</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>ETA: {formatTime(delivery.estimatedArrival)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Phone className="w-3 h-3 mr-1" />
                      Appeler
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Légende */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Légende</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Livreur disponible</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span>Livreur occupé</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Point de collecte</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <span>Point de livraison</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;
