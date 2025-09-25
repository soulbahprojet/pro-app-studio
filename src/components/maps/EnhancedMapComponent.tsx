import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import MapboxService from '@/services/mapboxService';
import { 
  MapPin, 
  Navigation, 
  Search,
  Route,
  Clock,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Truck,
  Car,
  User,
  Target
} from 'lucide-react';

interface MapMarker {
  id: string;
  coordinates: [number, number];
  type: 'courier' | 'client' | 'seller' | 'pickup' | 'delivery' | 'warehouse' | 'taxi_moto';
  title: string;
  description?: string;
  status?: string;
  data?: any;
}

interface EnhancedMapComponentProps {
  markers?: MapMarker[];
  showRoutes?: boolean;
  showSearch?: boolean;
  showDirections?: boolean;
  center?: [number, number];
  zoom?: number;
  style?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  onLocationSelect?: (coordinates: [number, number], address: string) => void;
  className?: string;
  height?: string;
}

const EnhancedMapComponent: React.FC<EnhancedMapComponentProps> = ({
  markers = [],
  showRoutes = false,
  showSearch = false,
  showDirections = false,
  center = [-9.644, 9.641], // Conakry, Guinea
  zoom = 12,
  style = 'mapbox://styles/mapbox/streets-v12',
  onMarkerClick,
  onLocationSelect,
  className = '',
  height = '600px'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<mapboxgl.Marker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<any>(null);
  const [websocketConnection, setWebsocketConnection] = useState<WebSocket | null>(null);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current) return;

      try {
        const token = await MapboxService.getToken('web');
        if (!token) {
          setShowTokenInput(true);
          return;
        }

        setMapboxToken(token);
        mapboxgl.accessToken = token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: style,
          center: center,
          zoom: zoom,
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add geolocate control
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

        // Add fullscreen control
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        // Handle click events for location selection
        if (onLocationSelect) {
          map.current.on('click', async (e) => {
            const address = await MapboxService.reverseGeocode(e.lngLat.lng, e.lngLat.lat);
            onLocationSelect([e.lngLat.lng, e.lngLat.lat], address || 'Adresse inconnue');
          });
        }

        setShowTokenInput(false);
      } catch (error) {
        console.error('Failed to initialize map:', error);
        setShowTokenInput(true);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
      websocketConnection?.close();
    };
  }, [center, zoom, style, onLocationSelect]);

  // WebSocket real-time connection
  useEffect(() => {
    if (!realtimeEnabled) return;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('wss://vuqauasbhkfozehfmkjt.supabase.co/functions/v1/realtime-tracking');
        
        ws.onopen = () => {
          console.log('🔌 WebSocket connected for real-time tracking');
          setWebsocketConnection(ws);
          
          // Subscribe to all services
          ws.send(JSON.stringify({
            type: 'subscribe_to_services',
            services: ['courier', 'taxi_moto', 'freight_forwarder', 'seller', 'client']
          }));
        };

        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          
          if (message.type === 'services_update' || message.type === 'subscription_update') {
            // Update markers with real-time data
            const realtimeMarkers = message.data.map((service: any) => ({
              id: service.id,
              coordinates: [service.lng, service.lat] as [number, number],
              type: service.type,
              title: service.name || 'Service',
              description: `Statut: ${service.status}`,
              status: service.status,
              data: service
            }));
            
            // Trigger marker update
            if (onMarkerClick) {
              // This is a workaround to update markers - in a real implementation,
              // you'd want to expose a callback for marker updates
              console.log('Real-time markers updated:', realtimeMarkers.length);
            }
          }
        };

        ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          setWebsocketConnection(null);
          
          // Auto-reconnect after 5 seconds
          setTimeout(connectWebSocket, 5000);
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          setWebsocketConnection(null);
        };

      } catch (error) {
        console.error('❌ Failed to connect WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      websocketConnection?.close();
    };
  }, [realtimeEnabled]);
  

  // Update markers
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Clear existing markers
    mapMarkers.forEach(marker => marker.remove());

    const newMarkers: mapboxgl.Marker[] = [];

    markers.forEach(markerData => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'enhanced-map-marker';
      
      const markerStyles = {
        courier: { bg: '#3b82f6', icon: '🏍️', label: 'LIVREUR' }, // Blue
        client: { bg: '#10b981', icon: '👤', label: 'CLIENT' }, // Green  
        seller: { bg: '#10b981', icon: '🏪', label: 'VENDEUR' }, // Green
        pickup: { bg: '#6366f1', icon: '📦', label: 'COLLECTE' }, // Indigo
        delivery: { bg: '#ef4444', icon: '🏠', label: 'LIVRAISON' }, // Red
        warehouse: { bg: '#10b981', icon: '🏭', label: 'TRANSITAIRE' }, // Green
        taxi_moto: { bg: '#fbbf24', icon: '🚕', label: 'TAXI' } // Yellow
      };
      
      const markerStyle = markerStyles[markerData.type as keyof typeof markerStyles] || markerStyles.client;
      
      el.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${markerStyle.bg};
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        position: relative;
        transition: transform 0.2s ease;
      `;
      
      el.innerHTML = markerStyle.icon;
      
      // Hover effect
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
      });
      
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Create marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat(markerData.coordinates)
        .addTo(map.current!);

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <div class="flex items-center gap-2 mb-2">
            <strong class="text-primary">${markerData.title} - ${markerStyle.label}</strong>
            ${markerData.status ? `
              <span class="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                ${markerData.status}
              </span>
            ` : ''}
          </div>
          
          ${markerData.description ? `
            <div class="text-sm text-gray-600 mb-2">${markerData.description}</div>
          ` : ''}
          
          <div class="text-xs text-gray-500">
            <div><strong>Position:</strong> ${markerData.coordinates[1].toFixed(6)}, ${markerData.coordinates[0].toFixed(6)}</div>
          </div>
          
          <div class="mt-2 flex gap-2">
            <button class="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/80" 
                    onclick="navigator.clipboard.writeText('${markerData.coordinates[1]}, ${markerData.coordinates[0]}')">
              Copier coordonnées
            </button>
          </div>
        </div>
      `);

      marker.setPopup(popup);

      // Click handler
      el.addEventListener('click', () => {
        onMarkerClick?.(markerData);
      });

      newMarkers.push(marker);
    });

    setMapMarkers(newMarkers);

    // Fit bounds to show all markers
    if (markers.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach(marker => {
        bounds.extend(marker.coordinates);
      });
      
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [markers, mapboxToken, onMarkerClick]);

  // Search places
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await MapboxService.searchPlaces(query, center);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [center]);

  // Calculate route between markers
  const calculateRoute = useCallback(async (start: [number, number], end: [number, number]) => {
    if (!map.current) return;

    setIsLoading(true);
    try {
      const route = await MapboxService.getDirections(start, end, 'driving');
      
      if (route) {
        // Remove existing route
        if (map.current.getSource('route')) {
          map.current.removeLayer('route');
          map.current.removeSource('route');
        }

        // Add new route
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry
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
            'line-width': 6,
            'line-opacity': 0.8
          }
        });

        setCurrentRoute(route);
      }
    } catch (error) {
      console.error('Route calculation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      MapboxService.setFallbackToken(mapboxToken);
      setShowTokenInput(false);
      window.location.reload(); // Reload to reinitialize map
    }
  };

  const handlePlaceSelect = (place: any) => {
    if (map.current) {
      map.current.flyTo({
        center: place.center,
        zoom: 16
      });
    }
    onLocationSelect?.(place.center, place.place_name);
    setSearchResults([]);
    setSearchQuery('');
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
    <div className={`space-y-4 ${className}`}>
      {/* Map Controls */}
      {showControls && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">Carte Interactive 224Solutions</h3>
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {markers.length} point{markers.length > 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setRealtimeEnabled(!realtimeEnabled)}>
              {realtimeEnabled ? '📡 Temps réel ON' : '📡 Temps réel OFF'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowControls(!showControls)}>
              {showControls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowTokenInput(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Config
            </Button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {showSearch && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une adresse..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  disabled={isLoading}
                />
                {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
              </div>
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                      onClick={() => handlePlaceSelect(result)}
                    >
                      <div className="font-medium">{result.text}</div>
                      <div className="text-sm text-muted-foreground">{result.place_name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Information */}
      {currentRoute && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Route className="w-3 h-3" />
                {(currentRoute.distance / 1000).toFixed(1)} km
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {Math.round(currentRoute.duration / 60)} min
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapContainer} 
            className="w-full rounded-lg"
            style={{ height: height, minHeight: height }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMapComponent;
