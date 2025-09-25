# 📚 Documentation: Système d'Activation des Fonctionnalités

## 🎯 Objectif

Ce système permet d'activer/désactiver des fonctionnalités spécifiques pour chaque rôle utilisateur, offrant un contrôle granulaire sur les capacités de votre plateforme 224SOLUTIONS.

## 🏗️ Architecture

### 1. Tables de Base de Données

```sql
-- Table principale des fonctionnalités par rôle
user_features (
  id, role, feature, enabled, created_at, updated_at
)

-- Configurations système
system_configurations (
  config_key, config_value, description
)
```

### 2. Edge Function Sécurisée

- **Endpoint**: `/functions/v1/features-activation`
- **Sécurité**: Authentification + vérification rôle PDG
- **Actions**: activate_all_features, activate_role_features, get_features_status, toggle_feature

### 3. Hooks React

- `useFeatureFlag(featureName)`: Vérifier si une fonctionnalité est activée
- `useRoleFeatures()`: Récupérer toutes les fonctionnalités d'un rôle
- `FeatureGate`: Composant conditionnel basé sur les flags

## 🚀 Utilisation

### Activation Globale

```typescript
// Activer toutes les fonctionnalités
const { data } = await supabase.functions.invoke('features-activation', {
  body: { action: 'activate_all_features' }
});
```

### Activation par Rôle

```typescript
// Activer pour un rôle spécifique
const { data } = await supabase.functions.invoke('features-activation', {
  body: { 
    action: 'activate_role_features',
    role_filter: 'seller'
  }
});
```

### Utilisation dans les Composants

```tsx
import { FeatureGate, useFeatureFlag } from '@/hooks/useFeatureFlags';

// Composant conditionnel
<FeatureGate feature="wallet">
  <WalletComponent />
</FeatureGate>

// Hook direct
const { isEnabled } = useFeatureFlag('social_module');
if (isEnabled) {
  // Afficher le module social
}
```

## 🔧 Configuration par Rôle

### Vendeur (seller)
- `products`: Gestion catalogue produits
- `orders`: Gestion commandes
- `wallet`: Portefeuille
- `subscription`: Abonnements
- `social_module`: Réseau social
- `audio_video_calls`: Appels audio/vidéo
- `pos_system`: Système de point de vente
- `analytics`: Statistiques

### Client (client)
- `orders`: Suivi commandes
- `wallet`: Portefeuille
- `subscription`: Abonnements
- `social_module`: Réseau social
- `audio_video_calls`: Appels audio/vidéo
- `marketplace`: Place de marché
- `favorites`: Favoris
- `reviews`: Avis et évaluations

### Livreur (courier)
- `deliveries`: Gestion livraisons
- `tracking`: Suivi GPS
- `wallet`: Portefeuille
- `audio_video_calls`: Appels audio/vidéo
- `gps_tracking`: Localisation
- `earnings`: Revenus

### Transitaire (transitaire)
- `shipments`: Expéditions internationales
- `tracking`: Suivi colis
- `wallet`: Portefeuille
- `audio_video_calls`: Appels audio/vidéo
- `international_freight`: Fret international
- `customs_docs`: Documents douaniers

### Moto-taxi (taxi_moto)
- `rides`: Courses
- `tracking`: Suivi GPS
- `wallet`: Portefeuille
- `audio_video_calls`: Appels audio/vidéo
- `gps_tracking`: Localisation
- `earnings`: Revenus

### Administrateur (admin)
- `all_features`: Toutes fonctionnalités
- `system_management`: Gestion système
- `user_management`: Gestion utilisateurs
- `analytics`: Analyses avancées
- `security`: Sécurité
- `configurations`: Configurations

## 🔒 Sécurité

### Authentification Requise
- Toutes les modifications nécessitent un token JWT valide
- Seuls les utilisateurs avec rôle PDG peuvent modifier les configurations

### Politiques RLS
```sql
-- Seuls les admins PDG peuvent gérer
CREATE POLICY "Admins can manage all features" 
ON user_features FOR ALL USING (is_pdg_user());

-- Utilisateurs voient leurs fonctionnalités
CREATE POLICY "Users can view their role features" 
ON user_features FOR SELECT USING (
  role = (SELECT profiles.role::text FROM profiles WHERE profiles.user_id = auth.uid())
);
```

## 📊 Interface d'Administration

**URL**: `/features-activation`

### Fonctionnalités
- ✅ Vue d'ensemble des statuts
- ⚡ Activation globale en un clic
- 🎯 Activation par rôle
- 🔀 Toggle individuel par fonctionnalité
- 📈 Métriques et statistiques
- 🔄 Actualisation en temps réel

### Métriques Affichées
- Total des fonctionnalités
- Fonctionnalités activées/désactivées
- Rôles configurés
- Dernière activation système

## 🧪 Tests et Validation

### Script de Démonstration
```bash
# Lancer la démonstration complète
./scripts/demo-features-activation.sh
```

### Tests Automatisés
- Vérification des permissions
- Test des activations par rôle
- Validation des feature flags
- Test de performance

## 🔍 Surveillance

### Logs Disponibles
- Tentatives d'activation
- Modifications de fonctionnalités
- Erreurs de permissions
- Performances des requêtes

### Métriques de Performance
- Temps de réponse des feature flags
- Utilisation par rôle
- Taux d'activation/désactivation

## 🔧 Dépannage

### Problèmes Courants

1. **Fonctionnalité non activée**
   - Vérifier la table `user_features`
   - Contrôler les permissions RLS
   - Valider le rôle utilisateur

2. **Erreur 403 - Access denied**
   - S'assurer d'avoir le rôle PDG
   - Vérifier l'authentification

3. **Feature flag ne fonctionne pas**
   - Contrôler la fonction SQL `is_feature_enabled`
   - Vérifier les données en base

### Debugging
```sql
-- Vérifier les fonctionnalités d'un rôle
SELECT * FROM user_features WHERE role = 'seller';

-- Vérifier le statut système
SELECT * FROM system_configurations WHERE config_key = 'features_activation_status';

-- Tester la fonction
SELECT is_feature_enabled('seller', 'wallet');
```

## 🚀 Déploiement

### Prérequis
- Accès PDG configuré
- Edge function déployée
- Tables créées avec RLS

### Checklist de Déploiement
- [ ] Migration base de données exécutée
- [ ] Edge function testée
- [ ] Permissions RLS validées
- [ ] Interface admin accessible
- [ ] Feature flags testés
- [ ] Documentation à jour

## 📈 Évolutions Futures

### Améliorations Prévues
- Feature flags avec dates d'expiration
- A/B testing intégré
- Analytics d'utilisation
- API publique pour partenaires
- Cache Redis pour les performances
- Versioning des configurations

### Roadmap
1. **Phase 1**: ✅ Système de base
2. **Phase 2**: Analytics avancées
3. **Phase 3**: A/B testing
4. **Phase 4**: API publique