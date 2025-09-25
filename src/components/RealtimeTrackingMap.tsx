import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGPSTracking } from '@/hooks/useGPSTracking';
import { useAuth } from '@/contexts/AuthContext';
import MapboxService from '@/services/mapboxService';
import { 
  MapPin, 
  Navigation, 
  Truck, 
  Clock, 
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Users,
  Package
} from 'lucide-react';

interface RealtimeTrackingMapProps {
  orderId?: string;
  onOrderSelect?: (orderId: string) => void;
}

const RealtimeTrackingMap: React.FC<RealtimeTrackingMapProps> = ({ 
  orderId, 
  onOrderSelect 
}) => {
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState(orderId || '');

  const {
    trackingData,
    error,
    isLoading,
    fetchTrackingData,
  } = useGPSTracking({ orderId: selectedOrderId });

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Utiliser un token par défaut pour éviter la demande
        let token = await MapboxService.getToken('web');
        
        // Si pas de token, utiliser un token de démonstration Mapbox public
        if (!token) {
          token = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
        }

        setMapboxToken(token);
        mapboxgl.accessToken = token;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [-9.644, 9.641], // Conakry, Guinée
          zoom: 12,
          antialias: true
        });

        // Attendre que la carte soit complètement chargée
        map.current.on('load', () => {
          console.log('Mapbox map loaded successfully');
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

        setShowTokenInput(false);
      } catch (error) {
        console.error('Failed to initialize map:', error);
        // Même en cas d'erreur, utiliser le token par défaut
        const defaultToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
        setMapboxToken(defaultToken);
        mapboxgl.accessToken = defaultToken;
        
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/light-v11',
          center: [-9.644, 9.641],
          zoom: 12,
        });
        
        setShowTokenInput(false);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, []);

  // Mettre à jour les marqueurs avec les données GPS
  useEffect(() => {
    if (!map.current || !mapboxToken) return;

    // Nettoyer les anciens marqueurs
    markers.forEach(marker => marker.remove());

    const newMarkers: mapboxgl.Marker[] = [];

    trackingData.forEach(track => {
      if (!track.latitude || !track.longitude) return;

      // Créer un élément DOM personnalisé pour le marqueur
      const el = document.createElement('div');
      el.className = 'tracking-marker';
      
      // Style selon le rôle de l'utilisateur
      const roleColors = {
        client: 'bg-blue-500',
        seller: 'bg-green-500',
        courier: 'bg-orange-500',
        admin: 'bg-purple-500'
      };
      
      const roleColor = roleColors[track.profiles?.role as keyof typeof roleColors] || 'bg-gray-500';
      
      el.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, ${roleColor.replace('bg-', '')}, ${roleColor.replace('bg-', '').replace('500', '600')});
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

      // Icône selon le rôle
      const roleIcons = {
        client: '👤',
        seller: '🏪',
        courier: '🏍️',
        admin: '⚡'
      };
      
      el.innerHTML = roleIcons[track.profiles?.role as keyof typeof roleIcons] || '📍';

      // Animation pour les positions récentes (moins de 1 minute)
      const positionAge = Date.now() - new Date(track.timestamp).getTime();
      if (positionAge < 60000) {
        el.style.animation = 'pulse 2s infinite';
      }

      // Créer le marqueur
      const marker = new mapboxgl.Marker(el)
        .setLngLat([track.longitude, track.latitude])
        .addTo(map.current!);

      // Popup avec informations détaillées
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-3 min-w-[200px]">
          <div class="flex items-center gap-2 mb-2">
            <strong class="text-primary">${track.profiles?.readable_id || 'N/A'}</strong>
            <span class="px-2 py-1 text-xs rounded ${
              track.profiles?.role === 'courier' ? 'bg-orange-100 text-orange-800' :
              track.profiles?.role === 'seller' ? 'bg-green-100 text-green-800' :
              track.profiles?.role === 'client' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }">${track.profiles?.role || 'Utilisateur'}</span>
          </div>
          
          <div class="space-y-1 text-sm">
            <div><strong>Nom:</strong> ${track.profiles?.full_name || 'Non défini'}</div>
            <div><strong>Position:</strong> ${track.latitude.toFixed(6)}, ${track.longitude.toFixed(6)}</div>
            ${track.accuracy ? `<div><strong>Précision:</strong> ±${track.accuracy.toFixed(0)}m</div>` : ''}
            ${track.speed ? `<div><strong>Vitesse:</strong> ${(track.speed * 3.6).toFixed(0)} km/h</div>` : ''}
            <div><strong>Dernière MAJ:</strong> ${new Date(track.timestamp).toLocaleTimeString('fr-FR')}</div>
          </div>
          
          ${track.order_id ? `
            <div class="mt-2 pt-2 border-t">
              <div class="text-xs text-gray-600">Commande associée: ${track.order_id}</div>
            </div>
          ` : ''}
        </div>
      `);

      marker.setPopup(popup);

      // Event listener pour sélection
      el.addEventListener('click', () => {
        if (track.order_id) {
          onOrderSelect?.(track.order_id);
        }
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Centrer la carte sur les marqueurs si il y en a
    if (trackingData.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      trackingData.forEach(track => {
        bounds.extend([track.longitude, track.latitude]);
      });
      
      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }, [trackingData, mapboxToken, onOrderSelect]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      MapboxService.setFallbackToken(mapboxToken);
      setShowTokenInput(false);
      window.location.reload(); // Reload to reinitialize map
    }
  };

  const handleRefresh = () => {
    if (selectedOrderId) {
      fetchTrackingData(selectedOrderId);
    } else {
      fetchTrackingData();
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
          <h2 className="text-xl font-semibold">Tracking GPS en Temps Réel</h2>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {trackingData.length} position{trackingData.length > 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowTokenInput(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Config
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="order-filter">Filtrer par commande</Label>
              <Input
                id="order-filter"
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                placeholder="ORD-0001 (laissez vide pour tout voir)"
              />
            </div>
            <Button 
              onClick={() => selectedOrderId ? fetchTrackingData(selectedOrderId) : fetchTrackingData()}
              className="mt-6"
            >
              Appliquer
            </Button>
          </div>
        </CardContent>
      </Card>

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

        {/* Panneau latéral */}
        <div className="space-y-4">
          {/* Statistiques */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Utilisateurs Actifs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {['client', 'seller', 'courier'].map(role => {
                const count = trackingData.filter(t => t.profiles?.role === role).length;
                const roleLabels = { client: 'Clients', seller: 'Marchands', courier: 'Livreurs' };
                const roleColors = { 
                  client: 'bg-blue-100 text-blue-800', 
                  seller: 'bg-green-100 text-green-800', 
                  courier: 'bg-orange-100 text-orange-800' 
                };
                
                return (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {roleLabels[role as keyof typeof roleLabels]}
                    </span>
                    <Badge className={roleColors[role as keyof typeof roleColors]} variant="outline">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Positions récentes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Positions Récentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-64 overflow-y-auto space-y-2">
                {trackingData.slice(0, 10).map((track) => {
                  const age = Date.now() - new Date(track.timestamp).getTime();
                  const isRecent = age < 300000; // 5 minutes
                  
                  return (
                    <div 
                      key={track.id}
                      className={`p-2 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                        isRecent ? 'border-green-200 bg-green-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {track.profiles?.readable_id || 'N/A'}
                        </span>
                        <Badge 
                          variant="outline"
                          className={
                            track.profiles?.role === 'courier' ? 'bg-orange-100 text-orange-800' :
                            track.profiles?.role === 'seller' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                          }
                        >
                          {track.profiles?.role}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{track.latitude.toFixed(4)}, {track.longitude.toFixed(4)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{new Date(track.timestamp).toLocaleTimeString('fr-FR')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Légende */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Légende</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Client (👤)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Marchand (🏪)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span>Livreur (🏍️)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full bg-green-200 border-2 border-green-500 animate-pulse"></div>
                <span>Position récente (&lt;1min)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

export default RealtimeTrackingMap;
