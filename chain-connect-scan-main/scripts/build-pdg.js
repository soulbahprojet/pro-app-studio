#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Construction de l\'application PDG...\n');

try {
  // 1. Build de l'application web PDG
  console.log('📦 Construction de la version web PDG...');
  execSync('vite build --config vite-pdg.config.ts', { stdio: 'inherit' });
  console.log('✅ Version web PDG construite avec succès!\n');

  // 2. Préparation pour mobile (si Capacitor est configuré)
  if (fs.existsSync('capacitor-pdg.config.ts')) {
    console.log('📱 Préparation pour les applications mobiles...');
    
    // Synchronisation Capacitor
    execSync('npx cap sync --config capacitor-pdg.config.ts', { stdio: 'inherit' });
    console.log('✅ Synchronisation Capacitor terminée!\n');

    console.log('📱 Pour construire les applications mobiles:');
    console.log('   Android: npx cap build android --config capacitor-pdg.config.ts');
    console.log('   iOS: npx cap build ios --config capacitor-pdg.config.ts\n');
  }

  // 3. Création du script de démarrage local
  const startScript = `#!/usr/bin/env node
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir les fichiers statiques de l'app PDG
app.use(express.static(path.join(__dirname, 'dist-pdg')));

// Route catch-all pour SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist-pdg', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`🚀 Interface PDG démarrée sur http://localhost:\${PORT}\`);
  console.log(\`📱 Accès sécurisé pour les administrateurs 224SOLUTIONS\`);
});
`;

  fs.writeFileSync('start-pdg-server.js', startScript);
  console.log('✅ Script de serveur PDG créé: start-pdg-server.js\n');

  // 4. Création du package.json pour l'app PDG standalone
  const pdgPackage = {
    name: "224solutions-pdg-interface",
    version: "1.0.0",
    description: "Interface PDG standalone pour 224Solutions",
    main: "start-pdg-server.js",
    scripts: {
      "start": "node start-pdg-server.js",
      "install-deps": "npm install express"
    },
    dependencies: {
      "express": "^4.18.2"
    },
    author: "224Solutions",
    license: "Private"
  };

  fs.writeFileSync('dist-pdg/package.json', JSON.stringify(pdgPackage, null, 2));
  console.log('✅ Package.json PDG créé dans dist-pdg/\n');

  // 5. Instructions finales
  console.log('🎉 Construction PDG terminée avec succès!\n');
  console.log('📋 Instructions de déploiement:\n');
  console.log('1. Version Web PDG:');
  console.log('   - Dossier: dist-pdg/');
  console.log('   - Servir avec: node start-pdg-server.js');
  console.log('   - URL: http://localhost:3000\n');
  
  console.log('2. Application Mobile PDG:');
  console.log('   - Configurer les plateformes: npx cap add android/ios --config capacitor-pdg.config.ts');
  console.log('   - Construire Android APK: npx cap build android --config capacitor-pdg.config.ts');
  console.log('   - Construire iOS IPA: npx cap build ios --config capacitor-pdg.config.ts\n');
  
  console.log('3. Déploiement Standalone:');
  console.log('   - Copier le dossier dist-pdg/ sur le serveur de destination');
  console.log('   - Installer les dépendances: cd dist-pdg && npm run install-deps');
  console.log('   - Démarrer: npm start\n');
  
  console.log('🔒 SÉCURITÉ: Cette interface est réservée aux administrateurs PDG uniquement!');

} catch (error) {
  console.error('❌ Erreur lors de la construction:', error.message);
  process.exit(1);
}