import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, Navigation2, Truck, MapPin, Phone, Star, Clock } from 'lucide-react';
import { ServiceProvider, UserLocation, locationService } from '@/services/locationService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServicesMapProps {
  serviceType: 'courier' | 'taxi_moto' | 'freight';
}

const ServicesMap: React.FC<ServicesMapProps> = ({ serviceType }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const { toast } = useToast();

  // Récupérer le token Mapbox depuis Supabase
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('mapbox-token', {
          body: { platform: 'web' }
        });
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (error) {
        console.error('Erreur lors de la récupération du token Mapbox:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la carte",
          variant: "destructive"
        });
      }
    };

    fetchMapboxToken();
  }, []);

  // Récupérer la localisation et les services
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const location = await locationService.getCurrentLocation();
        setUserLocation(location);

        let serviceProviders: ServiceProvider[] = [];
        
        if (serviceType === 'freight') {
          const warehouses = await locationService.getNearbyWarehouses(location);
          const providers = await locationService.getNearbyProviders(location, 'freight');
          serviceProviders = [...warehouses, ...providers];
        } else {
          serviceProviders = await locationService.getNearbyProviders(location, serviceType);
        }

        setProviders(serviceProviders);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast({
          title: "Erreur de géolocalisation",
          description: "Veuillez autoriser l'accès à votre position",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (mapboxToken) {
      loadData();
    }
  }, [serviceType, mapboxToken]);

  // Initialiser la carte Mapbox
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !userLocation) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [userLocation.longitude, userLocation.latitude],
      zoom: 13
    });

    // Ajouter contrôles de navigation
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Marqueur pour la position de l'utilisateur
    new mapboxgl.Marker({ color: '#3B82F6' })
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .setPopup(new mapboxgl.Popup().setText('Votre position'))
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [userLocation, mapboxToken]);

  // Ajouter les marqueurs des services
  useEffect(() => {
    if (!map.current || providers.length === 0) return;

    providers.forEach((provider) => {
      const color = getServiceColor(provider.type);
      const icon = getServiceIcon(provider.type);

      const popup = new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <h4 class="font-semibold">${provider.name}</h4>
          <p class="text-sm text-gray-600">${provider.distance}km - ${provider.estimatedTime}</p>
          <div class="flex items-center gap-1 mt-1">
            <span class="text-yellow-500">★</span>
            <span class="text-sm">${provider.rating}</span>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker({ color })
        .setLngLat([provider.longitude, provider.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      // Ajouter un écouteur de clic sur le marqueur
      marker.getElement().addEventListener('click', () => {
        setSelectedProvider(provider);
      });
    });
  }, [providers]);

  const getServiceColor = (type: string) => {
    switch (type) {
      case 'courier': return '#3B82F6'; // Bleu
      case 'taxi_moto': return '#F59E0B'; // Jaune
      case 'freight': return '#10B981'; // Vert
      default: return '#6B7280';
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'courier': return Users;
      case 'taxi_moto': return Navigation2;
      case 'freight': return Truck;
      default: return MapPin;
    }
  };

  const getServiceLabel = (type: string) => {
    switch (type) {
      case 'courier': return 'Livreur';
      case 'taxi_moto': return 'Taxi Moto';
      case 'freight': return 'Transitaire';
      default: return 'Service';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground animate-pulse mb-4" />
          <p>Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Carte */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-0">
            <div ref={mapContainer} className="h-96 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Liste des services */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {getServiceLabel(serviceType)}s proches ({providers.length})
        </h3>
        
        {providers.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">
                Aucun {getServiceLabel(serviceType).toLowerCase()} disponible dans votre zone
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {providers.map((provider) => {
              const IconComponent = getServiceIcon(provider.type);
              return (
                <Card 
                  key={provider.id}
                  className={`cursor-pointer transition-colors ${
                    selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedProvider(provider)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getServiceColor(provider.type) + '20' }}
                      >
                        <IconComponent 
                          className="w-4 h-4" 
                          style={{ color: getServiceColor(provider.type) }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{provider.name}</h4>
                          <Badge 
                            variant={provider.isOnline ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {provider.isOnline ? 'En ligne' : 'Hors ligne'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{provider.distance}km</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{provider.estimatedTime}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-sm">{provider.rating}</span>
                          </div>
                          
                          {provider.vehicle_type && (
                            <Badge variant="outline" className="text-xs">
                              {provider.vehicle_type}
                            </Badge>
                          )}
                        </div>
                        
                        {provider.specializations && provider.specializations.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              {provider.specializations.join(' • ')}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="flex-1">
                            Réserver
                          </Button>
                          {provider.phone && (
                            <Button size="sm" variant="outline">
                              <Phone className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicesMap;
