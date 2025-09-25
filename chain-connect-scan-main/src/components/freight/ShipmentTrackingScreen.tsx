import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  MapPin, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Truck,
  Plane,
  Ship,
  Navigation,
  FileText,
  Phone,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ShipmentDetails {
  id: string;
  tracking_code: string;
  status: string;
  sender_name: string;
  sender_city: string;
  sender_country: string;
  recipient_name: string;
  recipient_city: string;
  recipient_country: string;
  current_location: any;
  route_history: any[];
  estimated_delivery_date: string;
  actual_delivery_date?: string;
  transport_mode: string;
  service_type: string;
  weight_kg: number;
  commodity_type: string;
  carrier_name?: string;
  created_at: string;
}

interface StatusHistoryItem {
  id: string;
  status: string;
  location: string;
  timestamp: string;
  notes?: string;
  automatic: boolean;
}

const statusConfig = {
  created: { label: 'Créé', color: 'bg-blue-500', icon: Package },
  picked_up: { label: 'Collecté', color: 'bg-yellow-500', icon: Truck },
  in_transit: { label: 'En transit', color: 'bg-orange-500', icon: Plane },
  customs: { label: 'Douane', color: 'bg-purple-500', icon: FileText },
  out_for_delivery: { label: 'En livraison', color: 'bg-green-500', icon: Truck },
  delivered: { label: 'Livré', color: 'bg-green-600', icon: CheckCircle },
  exception: { label: 'Exception', color: 'bg-red-500', icon: AlertTriangle }
};

const transportIcons = {
  air: Plane,
  sea: Ship,
  road: Truck,
  multimodal: Navigation
};

export default function ShipmentTrackingScreen() {
  const { toast } = useToast();
  const [trackingCode, setTrackingCode] = useState('');
  const [shipment, setShipment] = useState<ShipmentDetails | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    // Check for existing Mapbox token
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    } else {
      setShowTokenInput(true);
    }
  }, []);

  useEffect(() => {
    if (shipment && mapboxToken && mapContainer.current) {
      initializeMap();
    }
  }, [shipment, mapboxToken]);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      zoom: 2,
      center: [0, 20]
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add route visualization if available
    if (shipment?.route_history && shipment.route_history.length > 0) {
      map.current.on('load', () => {
        addRouteToMap();
      });
    }
  };

  const addRouteToMap = () => {
    if (!map.current || !shipment?.route_history) return;

    const coordinates = shipment.route_history.map(point => [point.lng, point.lat]);
    
    // Add route line
    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }
    });

    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4
      }
    });

    // Add markers for key points
    shipment.route_history.forEach((point, index) => {
      const isCurrentLocation = index === shipment.route_history.length - 1;
      
      const el = document.createElement('div');
      el.className = `w-4 h-4 rounded-full ${isCurrentLocation ? 'bg-green-500' : 'bg-blue-500'}`;
      
      new mapboxgl.Marker(el)
        .setLngLat([point.lng, point.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <div class="font-medium">${point.location}</div>
              <div class="text-sm text-gray-600">${new Date(point.timestamp).toLocaleString()}</div>
              ${isCurrentLocation ? '<div class="text-sm text-green-600 font-medium">Position actuelle</div>' : ''}
            </div>
          `)
        )
        .addTo(map.current);
    });

    // Fit map to route
    const bounds = new mapboxgl.LngLatBounds();
    coordinates.forEach(coord => bounds.extend(coord as [number, number]));
    map.current.fitBounds(bounds, { padding: 50 });
  };

  const trackShipment = async () => {
    if (!trackingCode.trim()) {
      toast({
        title: "Code de suivi requis",
        description: "Veuillez entrer un code de suivi",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('track-shipment', {
        body: { trackingCode: trackingCode.trim() }
      });

      if (error) throw error;

      if (!data.shipment) {
        toast({
          title: "Expédition non trouvée",
          description: "Aucune expédition trouvée avec ce code de suivi",
          variant: "destructive"
        });
        return;
      }

      setShipment(data.shipment);
      setStatusHistory(data.statusHistory || []);
      
      toast({
        title: "Expédition trouvée",
        description: `Statut: ${statusConfig[data.shipment.status as keyof typeof statusConfig]?.label || data.shipment.status}`
      });

    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast({
        title: "Erreur de suivi",
        description: "Impossible de récupérer les informations de suivi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMapboxToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken);
      setShowTokenInput(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusProgress = (status: string) => {
    const statusOrder = ['created', 'picked_up', 'in_transit', 'customs', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const TransportIcon = shipment ? transportIcons[shipment.transport_mode as keyof typeof transportIcons] : Truck;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Suivi d'expédition</h1>
        <p className="text-muted-foreground">
          Suivez votre colis en temps réel avec des mises à jour détaillées
        </p>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Rechercher une expédition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Entrez votre code de suivi (ex: INTL-1234567)"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && trackShipment()}
              className="flex-1"
            />
            <Button onClick={trackShipment} disabled={loading}>
              {loading ? 'Recherche...' : 'Suivre'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mapbox Token Input */}
      {showTokenInput && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configuration Mapbox</CardTitle>
            <CardDescription>
              Entrez votre token Mapbox public pour activer la visualisation sur carte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Token Mapbox public"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleMapboxToken}>
                Valider
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {shipment && (
        <div className="space-y-6">
          {/* Shipment Overview */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TransportIcon className="w-5 h-5" />
                    {shipment.tracking_code}
                  </CardTitle>
                  <CardDescription>
                    {shipment.sender_city}, {shipment.sender_country} → {shipment.recipient_city}, {shipment.recipient_country}
                  </CardDescription>
                </div>
                <Badge 
                  className={`${statusConfig[shipment.status as keyof typeof statusConfig]?.color || 'bg-gray-500'} text-white`}
                >
                  {statusConfig[shipment.status as keyof typeof statusConfig]?.label || shipment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Expéditeur</h4>
                  <p className="text-sm">{shipment.sender_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {shipment.sender_city}, {shipment.sender_country}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Destinataire</h4>
                  <p className="text-sm">{shipment.recipient_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {shipment.recipient_city}, {shipment.recipient_country}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Détails</h4>
                  <p className="text-sm">{shipment.weight_kg} kg</p>
                  <p className="text-sm text-muted-foreground">{shipment.commodity_type}</p>
                  {shipment.carrier_name && (
                    <p className="text-sm text-muted-foreground">via {shipment.carrier_name}</p>
                  )}
                </div>
              </div>

              {shipment.estimated_delivery_date && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      Livraison estimée: {formatDate(shipment.estimated_delivery_date)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Historique des statuts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusHistory.map((item, index) => {
                    const StatusIcon = statusConfig[item.status as keyof typeof statusConfig]?.icon || Package;
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          statusConfig[item.status as keyof typeof statusConfig]?.color || 'bg-gray-500'
                        } text-white`}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {statusConfig[item.status as keyof typeof statusConfig]?.label || item.status}
                              </p>
                              <p className="text-sm text-muted-foreground">{item.location}</p>
                              {item.notes && (
                                <p className="text-sm text-muted-foreground mt-1">{item.notes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm">{formatDate(item.timestamp)}</p>
                              {item.automatic && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  Automatique
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Position actuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mapboxToken ? (
                  <div ref={mapContainer} className="w-full h-80 rounded-lg" />
                ) : (
                  <div className="w-full h-80 bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Configurez Mapbox pour voir la carte
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setShowTokenInput(true)}
                      >
                        Configurer
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}