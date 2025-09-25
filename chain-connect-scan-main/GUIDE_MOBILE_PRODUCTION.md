# Guide de Génération APK/AAB/IPA - 224Solutions

## 🚨 IMPORTANT - Limitations de Lovable

**Lovable ne peut pas générer directement des fichiers APK/AAB/IPA**. Voici ce que j'ai préparé pour vous :

### ✅ Ce qui est automatisé par Lovable :
- Configuration Capacitor optimisée pour la production
- Toutes les intégrations (Firebase, Supabase, Agora, OpenAI, Mapbox) restent fonctionnelles
- Code source sans traces de Lovable pour les utilisateurs finaux
- Configuration des permissions Android et iOS
- Scripts de build automatisés

### 🔧 Ce que vous devez faire manuellement :
- Compilation finale avec Android Studio (APK/AAB)
- Compilation finale avec Xcode (IPA)
- Configuration des clés de signature

---

## 📱 Instructions Étape par Étape

### 1. Préparation initiale

```bash
# Cloner votre projet depuis GitHub
git clone [votre-repo-224solutions]
cd [nom-du-projet]

# Installer les dépendances
npm install

# Build de production
npm run build
```

### 2. Configuration Capacitor

```bash
# Initialiser Capacitor avec la config de production
npx cap init --config capacitor.production.config.ts

# Ajouter les plateformes
npx cap add android --config capacitor.production.config.ts
npx cap add ios --config capacitor.production.config.ts

# Synchroniser
npx cap sync --config capacitor.production.config.ts
```

### 3. Configuration des clés API

#### Android (`android/app/src/main/res/values/strings.xml`) :
```xml
<resources>
    <string name="app_name">224Solutions</string>
    <string name="mapbox_access_token">VOTRE_MAPBOX_TOKEN_ICI</string>
</resources>
```

#### iOS (`ios/App/App/Info.plist`) :
```xml
<key>MGLMapboxAccessToken</key>
<string>VOTRE_MAPBOX_TOKEN_ICI</string>
```

### 4. Ajouter les fichiers Firebase

#### Android :
- Copier `google-services.json` dans `android/app/`

#### iOS :
- Copier `GoogleService-Info.plist` dans `ios/App/App/`

---

## 🤖 Génération Android (APK/AAB)

### Étapes :
1. **Ouvrir Android Studio**
2. **Ouvrir le projet** : `android/` 
3. **Build > Generate Signed Bundle/APK**
4. **Choisir** :
   - **Android App Bundle (AAB)** → Pour Google Play Store
   - **APK** → Pour tests internes
5. **Configurer la signature** (créer ou utiliser un keystore existant)
6. **Build** → Votre fichier sera dans `android/app/release/`

### Keystore (première fois) :
```bash
keytool -genkey -v -keystore 224solutions.keystore -alias 224solutions -keyalg RSA -keysize 2048 -validity 10000
```

---

## 🍎 Génération iOS (IPA)

### Étapes :
1. **Ouvrir Xcode**
2. **Ouvrir** : `ios/App/App.xcworkspace` (pas .xcodeproj !)
3. **Configurer Team et Bundle ID** dans Project Settings
4. **Product > Archive**
5. **Distribute App > App Store Connect**
6. **Upload** vers App Store Connect

### Prérequis iOS :
- Compte Apple Developer ($99/an)
- Certificat de distribution iOS
- Provisioning Profile

---

## 🔄 Mise à jour automatique

### Quand vous ajoutez des fonctionnalités dans Lovable :

1. **Git pull** pour récupérer les changements
2. **npm run build** pour rebuild
3. **npx cap sync** pour synchroniser
4. **Refaire la compilation** Android Studio / Xcode

---

## 📦 Configuration des Stores

### Google Play Store (AAB) :
- Utiliser le fichier `.aab` généré
- Configuration dans Google Play Console
- Upload du bundle signé

### Apple App Store (IPA) :
- Utiliser Xcode pour l'upload
- Configuration dans App Store Connect
- Soumission pour review

---

## 🔐 Sécurité et Performance

### Optimisations incluses :
- ✅ Minification du code
- ✅ Compression des assets
- ✅ Suppression des traces Lovable
- ✅ Configuration SSL/HTTPS
- ✅ Permissions minimales requises

### Variables d'environnement sécurisées :
- Toutes les clés API restent dans Supabase Edge Functions
- Aucune clé sensible exposée dans le code client
- Configuration CORS optimisée

---

## 🚀 Scripts de build rapide

### Commandes créées pour vous :

```bash
# Build complet + préparation mobile
node scripts/build-mobile.js

# Ouvrir directement les IDEs
npx cap open android --config capacitor.production.config.ts
npx cap open ios --config capacitor.production.config.ts
```

---

## 📞 Support et Dépannage

### Erreurs communes :

**Android :**
- `AAPT: error: resource android:attr/lStar not found` → Mettre à jour Android SDK
- Erreur de signature → Vérifier le keystore

**iOS :**
- Code signing error → Configurer Team et Certificates
- Archive failed → Vérifier Provisioning Profile

### Logs et debug :
```bash
# Android
npx cap run android --livereload --external

# iOS  
npx cap run ios --livereload --external
```

---

## 🎯 Résumé Final

1. **Votre app reste hébergée sur Lovable** ✅
2. **Toutes les intégrations fonctionnent** ✅  
3. **Pas de traces Lovable visibles** ✅
4. **Vous obtenez APK/AAB/IPA** ✅ (via Android Studio/Xcode)
5. **Mises à jour automatisées** ✅ (rebuild + resync)

**La seule étape manuelle : Compilation finale dans les IDEs natifs**

C'est la méthode standard pour TOUTES les apps React/Capacitor, même les grandes entreprises font ainsi.