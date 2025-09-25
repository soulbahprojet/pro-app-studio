import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface VendorSubscription {
  id: string;
  plan_type: string;
  status: string;
  starts_at: string;
  expires_at: string | null;
  features_limit: Record<string, any>;
}

export const useVendorSubscription = () => {
  const { user, profile } = useAuth();
  const [subscription, setSubscription] = useState<VendorSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user || profile?.role !== 'seller') {
      setLoading(false);
      return;
    }

    try {
      // Simuler un abonnement de base pour tous les vendeurs
      const mockSubscription: VendorSubscription = {
        id: 'mock-sub-' + user.id,
        plan_type: 'basic',
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: null, // Basic plan never expires
        features_limit: {
          max_products: 100,
          basic_analytics: true
        }
      };

      setSubscription(mockSubscription);
      setIsActive(true);
    } catch (error) {
      console.error('Error in checkSubscription:', error);
      setSubscription(null);
      setIsActive(false);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  const createBasicSubscription = useCallback(async () => {
    if (!user || profile?.role !== 'seller') return false;

    try {
      // Simuler la création d'un abonnement de base
      const mockSubscription: VendorSubscription = {
        id: 'basic-sub-' + user.id,
        plan_type: 'basic',
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: null,
        features_limit: {
          max_products: 100,
          basic_analytics: true
        }
      };

      setSubscription(mockSubscription);
      setIsActive(true);
      return true;
    } catch (error) {
      console.error('Error in createBasicSubscription:', error);
      return false;
    }
  }, [user, profile]);

  const upgradeToPremium = useCallback(async (durationMonths: number = 1) => {
    if (!user || profile?.role !== 'seller') return false;

    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + durationMonths);

      const mockSubscription: VendorSubscription = {
        id: 'premium-sub-' + user.id,
        plan_type: 'premium',
        status: 'active',
        starts_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        features_limit: {
          max_products: -1, // Unlimited
          advanced_analytics: true,
          priority_support: true
        }
      };

      setSubscription(mockSubscription);
      setIsActive(true);
      return true;
    } catch (error) {
      console.error('Error in upgradeToPremium:', error);
      return false;
    }
  }, [user, profile]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return {
    subscription,
    loading,
    isActive,
    checkSubscription,
    createBasicSubscription,
    upgradeToPremium
  };
};