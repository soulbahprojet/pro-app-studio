#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Construction des applications mobiles 224Solutions...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log('✅ Terminé!\n');
  } catch (error) {
    console.error(`❌ Erreur: ${error.message}`);
    process.exit(1);
  }
}

function main() {
  // 1. Build de l'application web
  console.log('📦 Construction de l\'application web...');
  runCommand('npm run build', 'Build Vite');
  
  // 2. Synchronisation Capacitor
  console.log('🔄 Synchronisation Capacitor...');
  runCommand('npx cap sync --config capacitor.production.config.ts', 'Sync Capacitor');
  
  // 3. Instructions pour Android
  console.log('📱 ANDROID - Instructions de compilation:');
  console.log('   1. Ouvrir Android Studio');
  console.log('   2. Ouvrir le projet: android/');
  console.log('   3. Build > Generate Signed Bundle/APK');
  console.log('   4. Choisir "Android App Bundle" pour le Play Store');
  console.log('   5. Ou choisir "APK" pour les tests internes\n');
  
  // 4. Instructions pour iOS
  console.log('🍎 iOS - Instructions de compilation:');
  console.log('   1. Ouvrir Xcode');
  console.log('   2. Ouvrir le projet: ios/App/App.xcworkspace');
  console.log('   3. Product > Archive');
  console.log('   4. Distribute App > App Store Connect\n');
  
  // 5. Créer le fichier de configuration des clés
  const keysTemplate = `# Configuration des clés pour la production
# Copier ce fichier et ajouter vos clés

# Android
MAPBOX_ACCESS_TOKEN_ANDROID=your_mapbox_token_here
GOOGLE_SERVICES_JSON=path/to/google-services.json

# iOS  
MAPBOX_ACCESS_TOKEN_IOS=your_mapbox_token_here
GOOGLE_SERVICE_INFO_PLIST=path/to/GoogleService-Info.plist

# Instructions:
# 1. Remplacer les valeurs par vos vraies clés
# 2. Ajouter google-services.json dans android/app/
# 3. Ajouter GoogleService-Info.plist dans ios/App/
`;
  
  fs.writeFileSync('mobile-keys.env.example', keysTemplate);
  console.log('✅ Fichier mobile-keys.env.example créé');
  
  console.log('\n🎉 Préparation terminée!');
  console.log('\n📋 Étapes suivantes:');
  console.log('1. Configurer les clés API (voir mobile-keys.env.example)');
  console.log('2. Ouvrir Android Studio pour générer AAB/APK');
  console.log('3. Ouvrir Xcode pour générer IPA');
  console.log('4. Publier sur les stores respectifs');
}

main();