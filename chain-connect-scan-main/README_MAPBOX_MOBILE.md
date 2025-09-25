# 📱 Guide de Déploiement Mobile - 224Solutions

## 📋 Prérequis Capacitor

Pour déployer 224Solutions sur appareils mobiles (Android/iOS), nous utilisons **Capacitor** qui permet de transformer votre application web en app native.

## 🚀 Installation et Configuration

### 1. Installation des Dépendances Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

### 2. Initialisation Capacitor

```bash
npx cap init
```

Configuration automatique avec ces valeurs:
- **App ID**: `app.lovable.10e539c2bff349158cfde4213339deb6`
- **App Name**: `224Solutions`

### 3. Configuration Hot-Reload

Le fichier `capacitor.config.ts` est configuré pour le hot-reload depuis Lovable:

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.10e539c2bff349158cfde4213339deb6',
  appName: '224Solutions',
  webDir: 'dist',
  server: {
    url: 'https://10e539c2-bff3-4915-8cfd-e4213339deb6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  }
};

export default config;
```

## 📱 Déploiement sur Dispositif Physique

### Étapes Obligatoires

1. **Exporter vers GitHub**
   - Cliquer sur "Export to Github" dans Lovable
   - Cloner le projet depuis votre repo GitHub

2. **Installation des dépendances**
   ```bash
   cd votre-projet-224solutions
   npm install
   ```

3. **Ajout des plateformes**
   ```bash
   # Pour Android
   npx cap add android
   
   # Pour iOS (macOS requis)
   npx cap add ios
   ```

4. **Construction du projet**
   ```bash
   npm run build
   ```

5. **Synchronisation**
   ```bash
   npx cap sync
   ```

6. **Lancement sur dispositif**
   ```bash
   # Android (nécessite Android Studio)
   npx cap run android
   
   # iOS (nécessite Xcode sur macOS)
   npx cap run ios
   ```

## 🔧 Configuration Spécifique Mapbox Mobile

### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<!-- Permissions requises -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<application>
    <!-- Token Mapbox Android -->
    <meta-data
        android:name="com.mapbox.token"
        android:value="ACCESS_TOKEN_ANDROID" />
        
    <!-- Package restrictions -->
    <meta-data
        android:name="com.mapbox.sdk.PACKAGE_NAME"
        android:value="app.lovable.10e539c2bff349158cfde4213339deb6" />
</application>
```

### iOS (`ios/App/App/Info.plist`)

```xml
<!-- Token Mapbox iOS -->
<key>MGLMapboxAccessToken</key>
<string>ACCESS_TOKEN_IOS</string>

<!-- Permissions de localisation -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>224Solutions utilise votre localisation pour optimiser les services de transport et livraison.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>224Solutions a besoin d'accéder à votre localisation pour le suivi en temps réel.</string>

<!-- Configuration réseau pour Mapbox -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>api.mapbox.com</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.0</string>
        </dict>
    </dict>
</key>

<!-- Permissions caméra pour QR codes -->
<key>NSCameraUsageDescription</key>
<string>224Solutions utilise l'appareil photo pour scanner les codes QR des colis.</string>

<!-- Background modes pour GPS -->
<key>UIBackgroundModes</key>
<array>
    <string>location</string>
    <string>background-fetch</string>
    <string>remote-notification</string>
</array>

<!-- URL Schemes pour deep linking -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>app.lovable.10e539c2bff349158cfde4213339deb6</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>224solutions</string>
        </array>
    </dict>
</array>
```

## 🗺️ Fonctionnalités Mapbox sur Mobile

### Livreurs (Marqueurs Bleus)
- ✅ Tracking GPS temps réel
- ✅ Notifications de missions
- ✅ Calcul d'itinéraires optimisés
- ✅ Mode hors-ligne partiel

### Taxi Moto (Marqueurs Jaunes)  
- ✅ Réservation de courses
- ✅ ETA précis
- ✅ Mode conducteur/passager
- ✅ Navigation turn-by-turn

### Transitaires (Marqueurs Verts)
- ✅ Suivi colis international
- ✅ Scan QR codes
- ✅ Localisation entrepôts
- ✅ Multi-modal tracking

## 📊 Performance Mobile

### Optimisations Mapbox

```javascript
// Configuration mobile-friendly
const mobileMapConfig = {
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-9.644, 9.641], // Conakry
  zoom: 12,
  pitch: 0, // Désactiver l'inclinaison pour de meilleures performances
  bearing: 0,
  // Réduire les détails pour mobile
  maxZoom: 18,
  minZoom: 8
};

// Clustering adaptatif selon la taille d'écran
const isMobile = window.innerWidth < 768;
const clusterRadius = isMobile ? 30 : 50;
```

### Gestion de la Batterie

```javascript
// Position updates intelligents
const updateInterval = {
  driving: 5000,    // 5s en conduite
  walking: 10000,   // 10s à pied  
  idle: 30000       // 30s inactif
};

// Réduire la précision si batterie faible
navigator.getBattery?.()?.then(battery => {
  if (battery.level < 0.2) {
    locationOptions.enableHighAccuracy = false;
  }
});
```

## 🔧 Troubleshooting Mobile

### Erreurs Communes

**1. Mapbox ne s'affiche pas**
```bash
# Vérifier les tokens dans les fichiers de config
grep -r "ACCESS_TOKEN" android/ ios/
```

**2. Permissions de localisation refusées**
```javascript
// Demander explicitement les permissions
if ('geolocation' in navigator) {
  navigator.permissions.query({name: 'geolocation'}).then(result => {
    if (result.state === 'denied') {
      // Rediriger vers les paramètres
      showLocationPermissionDialog();
    }
  });
}
```

**3. WebSocket ne fonctionne pas**
```javascript
// Fallback HTTP pour les réseaux restreints
const useWebSocket = 'WebSocket' in window && !isRestrictedNetwork();
if (useWebSocket) {
  initWebSocketTracking();
} else {
  initPollingTracking();
}
```

### Debug Mode

```bash
# Android - Logs en temps réel
npx cap run android --external

# iOS - Console Xcode
npx cap run ios --external
```

## 📱 Tests sur Dispositifs

### Test Checklist

- [ ] ✅ Mapbox s'affiche correctement
- [ ] ✅ Permissions de localisation accordées
- [ ] ✅ Marqueurs colorés selon les services
- [ ] ✅ Tracking GPS temps réel fonctionnel
- [ ] ✅ Calcul d'itinéraires
- [ ] ✅ Interface responsive sur différentes tailles
- [ ] ✅ Performance acceptable (60fps)
- [ ] ✅ Consommation batterie raisonnable
- [ ] ✅ Fonctionne avec connexion faible

### Profils de Test

**Livreur Moto**
```javascript
const livreurTest = {
  role: 'courier',
  vehicle: 'moto', 
  location: {lat: 9.540, lng: -9.640},
  status: 'active',
  missions: ['delivery-001', 'delivery-002']
};
```

**Chauffeur Taxi**
```javascript
const taxiTest = {
  role: 'taxi_moto',
  vehicle: 'taxi',
  location: {lat: 9.530, lng: -9.630}, 
  status: 'available',
  activeRide: null
};
```

**Agent Transitaire**
```javascript
const transitaireTest = {
  role: 'freight',
  warehouse: 'warehouse-001',
  location: {lat: 9.538, lng: -9.635},
  packages: ['PKG-001', 'PKG-002']
};
```

## 🚀 Publication App Stores

### Google Play Store (Android)

1. **Build de production**
   ```bash
   npm run build
   npx cap copy android
   npx cap open android
   ```

2. **Génération APK signé** (dans Android Studio)
   - Build → Generate Signed Bundle/APK
   - Suivre le processus de signature

3. **Upload sur Play Console**
   - Créer une nouvelle app sur Google Play Console
   - Upload de l'APK/AAB signé

### Apple App Store (iOS)

1. **Build de production** (macOS requis)
   ```bash
   npm run build
   npx cap copy ios
   npx cap open ios
   ```

2. **Configuration Xcode**
   - Configurer l'équipe de développement
   - Vérifier les certificats et profils

3. **Upload via Xcode**
   - Product → Archive
   - Distribute App → App Store

## 📊 Monitoring Production

### Analytics Mobiles

```javascript
// Tracking d'usage Mapbox
const trackMapboxUsage = {
  mapLoads: 0,
  markersDisplayed: 0,
  routesCalculated: 0,
  gpsUpdates: 0
};

// Performance monitoring
const performanceMetrics = {
  appStartTime: performance.now(),
  mapLoadTime: 0,
  averageFPS: 0,
  memoryUsage: 0
};
```

### Error Reporting

```javascript
// Crash reporting pour mobile
window.addEventListener('error', (error) => {
  // Logger les erreurs critiques
  console.error('App Error:', error);
  
  // Envoyer à votre service de monitoring
  if (isProduction) {
    sendErrorReport(error);
  }
});
```

---

## 📖 Ressources Utiles

- **Blog Lovable Mobile**: [https://lovable.dev/blogs/mobile](https://lovable.dev/blogs/mobile)
- **Capacitor Docs**: [https://capacitorjs.com/docs](https://capacitorjs.com/docs)
- **Mapbox Mobile**: [https://docs.mapbox.com/android/](https://docs.mapbox.com/android/)

🎉 **Votre app 224Solutions est prête pour le mobile !**