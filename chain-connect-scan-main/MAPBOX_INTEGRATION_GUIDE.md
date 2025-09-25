# Guide d'Intégration Mapbox 224Solutions

## 📍 Vue d'ensemble

Intégration complète de Mapbox pour tous les modules de 224Solutions avec suivi GPS en temps réel, marqueurs dynamiques, calcul d'itinéraires et ETA.

## 🔑 Configuration des Clés Mapbox

### Clés par Plateforme (Sécurisées dans Supabase)

```bash
MAPBOX_ACCESS_TOKEN_WEB      # Restrictions: domaines web
MAPBOX_ACCESS_TOKEN_ANDROID  # Restrictions: Package Name + SHA1  
MAPBOX_ACCESS_TOKEN_IOS      # Restrictions: Bundle ID
```

### Récupération Sécurisée des Tokens

```typescript
// Récupération automatique via Edge Function
const token = await MapboxService.getToken('web|android|ios');
```

## 🗺️ Modules Intégrés

### 1. Interface Livreurs (Marqueurs Bleus 🔵)
- **Route**: `/tracking` → Onglet "Livreurs"
- **Couleur**: Bleu (#3B82F6)
- **Fonctionnalités**: 
  - Suivi GPS temps réel
  - Missions actives
  - Notifications push
  - Calcul d'itinéraires optimisés

### 2. Interface Taxi Moto (Marqueurs Jaunes 🟡)
- **Route**: `/tracking` → Onglet "Taxi Moto"  
- **Couleur**: Jaune (#EAB308)
- **Fonctionnalités**:
  - Réservation de courses
  - ETA précis en temps réel
  - Mode conducteur/passager
  - Routes optimisées selon trafic

### 3. Interface Transitaire (Marqueurs Verts 🟢)
- **Route**: `/tracking` → Onglet "Transitaire"
- **Couleur**: Vert (#10B981)
- **Fonctionnalités**:
  - Suivi colis international
  - Localisation entrepôts
  - Tracking codes
  - Logistique multimodale

## 🌐 Implémentation Web

### Configuration Base
```html
<script src="https://api.mapbox.com/mapbox-gl-js/v2.18.0/mapbox-gl.js"></script>
<link href="https://api.mapbox.com/mapbox-gl-js/v2.18.0/mapbox-gl.css" rel="stylesheet" />
```

### Initialisation Mapbox
```javascript
// Récupération sécurisée du token
const token = await fetch('/supabase/functions/v1/mapbox-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ platform: 'web' })
}).then(r => r.json());

mapboxgl.accessToken = token.token;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-9.644, 9.641], // Conakry, Guinée
  zoom: 12
});
```

### Marqueurs Dynamiques par Service
```javascript
const serviceColors = {
  'livreur': '#3B82F6',      // Bleu
  'taxi_moto': '#EAB308',    // Jaune  
  'transitaire': '#10B981'   // Vert
};

function createServiceMarker(service) {
  const el = document.createElement('div');
  el.style.cssText = `
    width: 40px; height: 40px; border-radius: 50%;
    background: ${serviceColors[service.type]};
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    display: flex; align-items: center; justify-content: center;
    color: white; font-weight: bold; cursor: pointer;
  `;
  
  const marker = new mapboxgl.Marker(el)
    .setLngLat([service.lng, service.lat])
    .setPopup(new mapboxgl.Popup().setHTML(`
      <div class="p-3">
        <h3>${service.type.toUpperCase()}</h3>
        <p>ID: ${service.id}</p>
        <p>Statut: ${service.status}</p>
        <p>Dernière MAJ: ${service.lastUpdate}</p>
      </div>
    `))
    .addTo(map);
    
  return marker;
}
```

### Suivi Temps Réel
```javascript
// WebSocket pour mises à jour live
const ws = new WebSocket('wss://your-domain/supabase/functions/v1/realtime-tracking');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  updateServicePosition(update.id, update.lat, update.lng);
};

function updateServicePosition(id, lat, lng) {
  if (markers[id]) {
    markers[id].setLngLat([lng, lat]);
    // Animation pulse pour positions récentes
    markers[id].getElement().style.animation = 'pulse 2s infinite';
  }
}
```

### Calcul d'Itinéraires et ETA
```javascript
async function calculateRoute(start, end, profile = 'driving') {
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.routes[0]) {
    const route = data.routes[0];
    return {
      geometry: route.geometry,
      distance: (route.distance / 1000).toFixed(1) + ' km',
      duration: Math.round(route.duration / 60) + ' min',
      eta: new Date(Date.now() + route.duration * 1000).toLocaleTimeString()
    };
  }
}

// Affichage de l'itinéraire sur la carte
function displayRoute(routeGeoJSON) {
  map.addLayer({
    id: 'route',
    type: 'line',
    source: {
      type: 'geojson',
      data: routeGeoJSON
    },
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3B82F6',
      'line-width': 5,
      'line-opacity': 0.75
    }
  });
}
```

## 📱 Implémentation Android

### Configuration AndroidManifest.xml
```xml
<meta-data
    android:name="com.mapbox.token"
    android:value="ACCESS_TOKEN_ANDROID" />
    
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### Activity Kotlin
```kotlin
class MapActivity : AppCompatActivity() {
    private lateinit var mapView: MapView
    private lateinit var annotationApi: AnnotationApi
    private val serviceMarkers = mutableMapOf<String, PointAnnotation>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        mapView = MapView(this)
        setContentView(mapView)

        mapView.getMapboxMap().loadStyleUri(Style.MAPBOX_STREETS) { style ->
            // Activer la localisation
            mapView.location.updateSettings {
                enabled = true
                locationPuck = LocationPuck2D(
                    bearingImage = AppCompatResources.getDrawable(this@MapActivity, R.drawable.mapbox_user_puck_icon),
                    shadowImage = AppCompatResources.getDrawable(this@MapActivity, R.drawable.mapbox_user_icon_shadow)
                )
            }
            
            // Initialiser les marqueurs
            annotationApi = mapView.annotations
            initializeServiceMarkers()
        }
    }

    private fun initializeServiceMarkers() {
        val services = listOf(
            Service("1", "livreur", 9.540, 13.240, "actif"),
            Service("2", "taxi_moto", 9.530, 13.230, "disponible"),
            Service("3", "transitaire", 9.538, 13.235, "en_transit")
        )

        val pointAnnotationManager = annotationApi.createPointAnnotationManager()
        
        services.forEach { service ->
            val pointAnnotationOptions = PointAnnotationOptions()
                .withPoint(Point.fromLngLat(service.lng, service.lat))
                .withIconImage(getServiceIcon(service.type))
                .withIconSize(1.5)
                .withData(Gson().toJsonTree(service))

            val annotation = pointAnnotationManager.create(pointAnnotationOptions)
            serviceMarkers[service.id] = annotation
        }

        // Listener pour les clics sur marqueurs
        pointAnnotationManager.addClickListener { annotation ->
            val service = Gson().fromJson(annotation.getData(), Service::class.java)
            showServiceDetails(service)
            true
        }
    }

    private fun getServiceIcon(serviceType: String): String {
        return when (serviceType) {
            "livreur" -> "delivery_blue_icon"
            "taxi_moto" -> "taxi_yellow_icon"
            "transitaire" -> "freight_green_icon"
            else -> "default_marker"
        }
    }

    private fun updateServicePosition(serviceId: String, lat: Double, lng: Double) {
        serviceMarkers[serviceId]?.let { marker ->
            marker.point = Point.fromLngLat(lng, lat)
            // Actualiser sur la carte
            annotationApi.createPointAnnotationManager().update(marker)
        }
    }

    // Calcul d'itinéraire Android
    private fun calculateRouteAndroid(origin: Point, destination: Point) {
        val routeOptions = RouteOptions.builder()
            .applyDefaultNavigationOptions()
            .applyLanguageAndVoiceUnitOptions(this)
            .coordinatesList(listOf(origin, destination))
            .build()

        MapboxNavigation.requestRoutes(routeOptions, object : NavigationRouterCallback {
            override fun onRoutesReady(routes: List<NavigationRoute>, routerOrigin: RouterOrigin) {
                val route = routes.first()
                val distance = route.directionsRoute.distance()?.div(1000)?.toInt()
                val duration = route.directionsRoute.duration()?.div(60)?.toInt()
                
                displayRouteInfo("Distance: ${distance}km, Durée: ${duration}min")
            }

            override fun onFailure(reasons: List<RouterFailure>, routeOptions: RouteOptions) {
                Log.e("Navigation", "Route calculation failed: $reasons")
            }

            override fun onCanceled(routeOptions: RouteOptions, routerOrigin: RouterOrigin) {}
        })
    }
}

data class Service(
    val id: String,
    val type: String,
    val lat: Double,
    val lng: Double,
    val status: String
)
```

## 🍎 Implémentation iOS

### Configuration Info.plist
```xml
<key>MGLMapboxAccessToken</key>
<string>ACCESS_TOKEN_IOS</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>224Solutions utilise votre localisation pour optimiser les services de transport et livraison.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>224Solutions a besoin d'accéder à votre localisation pour le suivi en temps réel.</string>
```

### MapViewController Swift
```swift
import UIKit
import MapboxMaps
import CoreLocation

class MapViewController: UIViewController {
    internal var mapView: MapView!
    private var pointAnnotationManager: PointAnnotationManager?
    private var serviceAnnotations: [String: PointAnnotation] = [:]

    override func viewDidLoad() {
        super.viewDidLoad()
        setupMapView()
        setupLocationServices()
        loadServices()
    }

    private func setupMapView() {
        let myResourceOptions = ResourceOptions(accessToken: "ACCESS_TOKEN_IOS")
        let myMapInitOptions = MapInitOptions(
            resourceOptions: myResourceOptions,
            styleURI: StyleURI.streets
        )
        
        mapView = MapView(frame: view.bounds, mapInitOptions: myMapInitOptions)
        mapView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        view.addSubview(mapView)
        
        // Centrer sur Conakry
        let conakryCoordinate = CLLocationCoordinate2D(latitude: 9.641, longitude: -9.644)
        let camera = CameraOptions(center: conakryCoordinate, zoom: 12)
        mapView.mapboxMap.setCamera(to: camera)
    }

    private func setupLocationServices() {
        let locationManager = CLLocationManager()
        locationManager.delegate = self
        locationManager.requestWhenInUseAuthorization()
        
        mapView.location.options.puckType = .puck2D()
        mapView.location.locationProvider = locationManager
    }

    private func loadServices() {
        let services = [
            Service(id: "1", type: .livreur, lat: 9.540, lng: -9.640, status: "actif"),
            Service(id: "2", type: .taxiMoto, lat: 9.530, lng: -9.630, status: "disponible"),
            Service(id: "3", type: .transitaire, lat: 9.538, lng: -9.635, status: "en_transit")
        ]
        
        addServiceMarkers(services: services)
    }

    private func addServiceMarkers(services: [Service]) {
        clearMarkers()
        
        pointAnnotationManager = mapView.annotations.makePointAnnotationManager()
        var annotations: [PointAnnotation] = []
        
        for service in services {
            var annotation = PointAnnotation(coordinate: CLLocationCoordinate2D(
                latitude: service.lat,
                longitude: service.lng
            ))
            
            // Couleur selon le type de service
            let markerColor = getServiceColor(for: service.type)
            annotation.image = .init(image: createServiceMarker(color: markerColor), name: service.type.rawValue)
            annotation.iconSize = 1.5
            
            annotations.append(annotation)
            serviceAnnotations[service.id] = annotation
        }
        
        pointAnnotationManager?.annotations = annotations
        
        // Gestionnaire de tap
        pointAnnotationManager?.onTap = { [weak self] annotation in
            self?.showServiceDetails(annotation)
        }
    }

    private func createServiceMarker(color: UIColor) -> UIImage {
        let size = CGSize(width: 40, height: 40)
        let renderer = UIGraphicsImageRenderer(size: size)
        
        return renderer.image { context in
            let rect = CGRect(origin: .zero, size: size)
            
            // Cercle de fond
            context.cgContext.setFillColor(color.cgColor)
            context.cgContext.fillEllipse(in: rect)
            
            // Bordure blanche
            context.cgContext.setStrokeColor(UIColor.white.cgColor)
            context.cgContext.setLineWidth(3)
            context.cgContext.strokeEllipse(in: rect)
        }
    }

    private func getServiceColor(for serviceType: ServiceType) -> UIColor {
        switch serviceType {
        case .livreur:
            return UIColor(red: 59/255, green: 130/255, blue: 246/255, alpha: 1) // Bleu
        case .taxiMoto:
            return UIColor(red: 234/255, green: 179/255, blue: 8/255, alpha: 1)  // Jaune
        case .transitaire:
            return UIColor(red: 16/255, green: 185/255, blue: 129/255, alpha: 1)  // Vert
        }
    }

    private func updateServicePosition(serviceId: String, lat: Double, lng: Double) {
        guard var annotation = serviceAnnotations[serviceId] else { return }
        
        annotation.coordinate = CLLocationCoordinate2D(latitude: lat, longitude: lng)
        serviceAnnotations[serviceId] = annotation
        
        // Mettre à jour sur la carte
        if let manager = pointAnnotationManager {
            let updatedAnnotations = Array(serviceAnnotations.values)
            manager.annotations = updatedAnnotations
        }
        
        // Animation d'actualisation
        UIView.animate(withDuration: 0.3) {
            // Animation légère pour indiquer la mise à jour
        }
    }

    private func showServiceDetails(_ annotation: PointAnnotation) {
        let alert = UIAlertController(
            title: "Service 224Solutions",
            message: "Type: \(annotation.image?.name ?? "Service")\nPosition mise à jour",
            preferredStyle: .alert
        )
        
        alert.addAction(UIAlertAction(title: "Fermer", style: .default))
        present(alert, animated: true)
    }

    private func clearMarkers() {
        pointAnnotationManager?.annotations = []
        serviceAnnotations.removeAll()
    }
}

// MARK: - Extensions et Types
extension MapViewController: CLLocationManagerDelegate {
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        // Traitement des mises à jour de localisation
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Erreur de localisation: \(error.localizedDescription)")
    }
}

struct Service {
    let id: String
    let type: ServiceType
    let lat: Double
    let lng: Double
    let status: String
}

enum ServiceType: String, CaseIterable {
    case livreur = "livreur"
    case taxiMoto = "taxi_moto"  
    case transitaire = "transitaire"
    
    var displayName: String {
        switch self {
        case .livreur: return "Livreur"
        case .taxiMoto: return "Taxi Moto"
        case .transitaire: return "Transitaire"
        }
    }
}
```

## 🔄 Backend et Temps Réel

### Edge Function - Tracking WebSocket
```typescript
// supabase/functions/realtime-tracking/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const upgrade = req.headers.get("upgrade") || "";
  if (upgrade.toLowerCase() !== "websocket") {
    return new Response("Expected websocket", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.onopen = () => {
    console.log("WebSocket connecté pour tracking temps réel");
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'subscribe') {
        // S'abonner aux mises à jour GPS pour ce service
        console.log(`Abonnement tracking: ${data.serviceId}`);
      }
      
      if (data.type === 'position_update') {
        // Diffuser la nouvelle position à tous les abonnés
        const positionUpdate = {
          type: 'position_update',
          serviceId: data.serviceId,
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date().toISOString(),
          serviceType: data.serviceType
        };
        
        socket.send(JSON.stringify(positionUpdate));
      }
    } catch (error) {
      console.error('Erreur WebSocket:', error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket tracking fermé");
  };

  return response;
});
```

### Supabase RLS et Tables GPS
```sql
-- Table pour tracking GPS temps réel
CREATE TABLE IF NOT EXISTS public.gps_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(8, 2),
  speed DECIMAL(8, 2),
  heading DECIMAL(5, 2),
  altitude DECIMAL(8, 2),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  order_id UUID REFERENCES orders(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger pour notification temps réel
CREATE OR REPLACE FUNCTION notify_position_update()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'position_update',
    json_build_object(
      'user_id', NEW.user_id,
      'latitude', NEW.latitude,
      'longitude', NEW.longitude,
      'timestamp', NEW.timestamp,
      'order_id', NEW.order_id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER gps_position_notify
  AFTER INSERT ON public.gps_tracking
  FOR EACH ROW
  EXECUTE FUNCTION notify_position_update();
```

## 📊 Performance et Optimisation

### Optimisations Web
```javascript
// Throttling des mises à jour GPS
let lastUpdate = 0;
const UPDATE_INTERVAL = 5000; // 5 secondes

function throttledPositionUpdate(position) {
  const now = Date.now();
  if (now - lastUpdate >= UPDATE_INTERVAL) {
    updateUserPosition(position.lat, position.lng);
    lastUpdate = now;
  }
}

// Clustering des marqueurs pour de meilleures performances
map.addSource('services', {
  type: 'geojson',
  data: servicesGeoJSON,
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50
});
```

### Optimisations Mobile
```kotlin
// Android - Gestion de la batterie
private val locationRequest = LocationRequest.create().apply {
    interval = 10000 // 10 secondes
    fastestInterval = 5000
    priority = LocationRequest.PRIORITY_BALANCED_POWER_ACCURACY
}
```

```swift
// iOS - Gestion de la batterie
locationManager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
locationManager.distanceFilter = 10.0 // Metres
```

## 🚀 Déploiement et Tests

### Tests par Plateforme

#### Web
1. Ouvrir `/tracking` dans le navigateur
2. Vérifier le chargement des cartes Mapbox
3. Tester les onglets Livreurs/Taxi/Transitaire
4. Valider les marqueurs colorés
5. Tester la recherche par tracking ID

#### Android  
1. Construire l'APK avec `npx cap run android`
2. Tester sur émulateur/dispositif physique
3. Vérifier les permissions de localisation
4. Valider les marqueurs et popups

#### iOS
1. Construire avec `npx cap run ios` (macOS requis)
2. Tester sur simulateur/dispositif physique
3. Vérifier les permissions de localisation
4. Valider l'interface et les marqueurs

### Performance Monitoring
```javascript
// Surveillance des performances Mapbox
map.on('sourcedata', (e) => {
  if (e.sourceId === 'services' && e.isSourceLoaded) {
    console.log('Services chargés:', performance.now());
  }
});

// Métriques de tracking
const trackingMetrics = {
  positionsReceived: 0,
  markersUpdated: 0,
  routesCalculated: 0,
  averageLatency: 0
};
```

## 📚 Documentation API

### MapboxService API
```typescript
interface MapboxService {
  // Authentification
  getToken(platform: 'web' | 'android' | 'ios'): Promise<string>
  
  // Géocodage
  geocodeAddress(address: string): Promise<GeocodeResult>
  reverseGeocode(lng: number, lat: number): Promise<string>
  
  // Navigation
  getDirections(start: [number, number], end: [number, number], profile?: string): Promise<RouteResult>
  getDistanceMatrix(origins: Array, destinations: Array): Promise<MatrixResult>
  
  // Recherche
  searchPlaces(query: string, proximity?: [number, number]): Promise<PlaceResult[]>
}
```

### WebSocket Events
```typescript
// Messages envoyés au serveur
type ClientMessage = 
  | { type: 'subscribe', serviceId: string }
  | { type: 'unsubscribe', serviceId: string }
  | { type: 'position_update', lat: number, lng: number, serviceType: string }

// Messages reçus du serveur  
type ServerMessage =
  | { type: 'position_update', serviceId: string, lat: number, lng: number, timestamp: string }
  | { type: 'service_status', serviceId: string, status: string }
  | { type: 'route_update', serviceId: string, eta: string, distance: string }
```

## 🔧 Troubleshooting

### Erreurs Communes

**Token Mapbox invalide**
```bash
Error: Invalid access token
Solution: Vérifier la configuration des secrets Supabase
```

**Marqueurs non affichés**
```javascript
// Vérifier le format des coordonnées
console.log('Lat/Lng:', lat, lng); // Lat doit être -90 à 90, Lng -180 à 180
```

**WebSocket déconnecté**
```javascript
// Reconnexion automatique
ws.onclose = () => {
  setTimeout(() => {
    connectWebSocket();
  }, 5000);
};
```

### Support et Maintenance

- **Logs**: Consulter les logs Supabase Edge Functions
- **Monitoring**: Surveiller l'usage des quotas Mapbox
- **Updates**: Vérifier les mises à jour Mapbox GL JS/SDK

---

## ✅ Checklist de Validation

- [ ] ✅ Clés Mapbox configurées pour chaque plateforme
- [ ] ✅ Cartes s'affichent correctement sur Web/Android/iOS  
- [ ] ✅ Marqueurs colorés selon le type de service
- [ ] ✅ Suivi GPS temps réel fonctionnel
- [ ] ✅ Calcul d'itinéraires et ETA
- [ ] ✅ Interface responsive sur tous écrans
- [ ] ✅ WebSocket pour mises à jour live
- [ ] ✅ Recherche par tracking ID
- [ ] ✅ Documentation complète

🎉 **Intégration Mapbox 224Solutions : COMPLÈTE !**