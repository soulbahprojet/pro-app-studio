import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook pour vérifier si une fonctionnalité est activée pour l'utilisateur actuel
 * Version temporaire utilisant la fonction RPC existante
 */
export const useFeatureFlag = (featureName: string) => {
  const { profile } = useAuth();
  const [isEnabled, setIsEnabled] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [requiresSubscription, setRequiresSubscription] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!profile?.role) {
      setIsEnabled(false);
      setIsLoading(false);
      return;
    }

    const checkFeature = async () => {
      try {
        // Pour l'instant, utiliser is_feature_enabled existant
        const { data, error } = await supabase.rpc('is_feature_enabled', {
          user_role: profile.role,
          feature_name: featureName
        });

        if (error) {
          console.error('Error checking feature flag:', error);
          setIsEnabled(false);
        } else {
          setIsEnabled(data || false);
        }
      } catch (error) {
        console.error('Error in useFeatureFlag:', error);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkFeature();
  }, [profile?.role, featureName]);

  return { isEnabled, isLoading, requiresSubscription };
};

/**
 * Composant pour afficher conditionnellement du contenu selon les feature flags
 */
interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null 
}: FeatureGateProps) => {
  const { isEnabled, isLoading } = useFeatureFlag(feature);

  if (isLoading) {
    return React.createElement('div', { className: 'animate-pulse bg-muted h-8 rounded' });
  }

  return isEnabled ? children : fallback;
};

// Interface pour les objets de fonctionnalités
interface FeatureObject {
  feature: string;
  description: string;
  requires_subscription: boolean;
}

/**
 * Hook pour récupérer toutes les fonctionnalités d'un rôle (version temporaire)
 */
export const useRoleFeatures = () => {
  const { profile } = useAuth();
  const [features, setFeatures] = React.useState<FeatureObject[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [hasActiveSubscription, setHasActiveSubscription] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (!profile?.role) {
      setFeatures([]);
      setIsLoading(false);
      return;
    }

    const loadFeatures = async () => {
      try {
        // Pour l'instant, simuler des fonctionnalités selon le rôle
        let roleFeatures: FeatureObject[] = [];
        
        switch (profile.role) {
          case 'seller':
            roleFeatures = [
              { feature: 'product_management', description: 'Gestion des produits', requires_subscription: false },
              { feature: 'basic_inventory', description: 'Inventaire de base', requires_subscription: false },
              { feature: 'order_processing', description: 'Traitement des commandes', requires_subscription: false },
              { feature: 'basic_analytics', description: 'Analytics de base', requires_subscription: false },
              { feature: 'advanced_analytics', description: 'Analytics avancées', requires_subscription: true },
              { feature: 'bulk_operations', description: 'Opérations en masse', requires_subscription: true }
            ];
            break;
          case 'client':
            roleFeatures = [
              { feature: 'browse_products', description: 'Parcourir les produits', requires_subscription: false },
              { feature: 'place_orders', description: 'Passer des commandes', requires_subscription: false },
              { feature: 'track_orders', description: 'Suivre les commandes', requires_subscription: false },
              { feature: 'manage_favorites', description: 'Gérer les favoris', requires_subscription: false }
            ];
            break;
          case 'courier':
            roleFeatures = [
              { feature: 'delivery_assignments', description: 'Missions de livraison', requires_subscription: false },
              { feature: 'route_optimization', description: 'Optimisation de routes', requires_subscription: false },
              { feature: 'earnings_tracking', description: 'Suivi des gains', requires_subscription: false }
            ];
            break;
          case 'admin':
            roleFeatures = [
              { feature: 'user_management', description: 'Gestion des utilisateurs', requires_subscription: false },
              { feature: 'system_settings', description: 'Paramètres système', requires_subscription: false },
              { feature: 'platform_analytics', description: 'Analytics plateforme', requires_subscription: false }
            ];
            break;
        }

        setFeatures(roleFeatures);
        setHasActiveSubscription(profile.role === 'seller'); // Simuler abonnement actif pour vendeurs
      } catch (error) {
        console.error('Error in useRoleFeatures:', error);
        setFeatures([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatures();
  }, [profile?.role]);

  return { 
    features, 
    isLoading, 
    hasActiveSubscription 
  };
};

/**
 * Hook pour activer automatiquement les fonctionnalités d'un utilisateur (version temporaire)
 */
export const useActivateFeatures = () => {
  const activateUserFeatures = React.useCallback(async () => {
    // Pour l'instant, simuler l'activation
    return new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(true), 1000);
    });
  }, []);

  return { activateUserFeatures };
};