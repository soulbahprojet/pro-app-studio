import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LoyaltyCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  total_spent: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  joined_at: string;
}

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'points';
  value: number;
  min_purchase: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface GiftCard {
  id: string;
  code: string;
  value: number;
  status: 'active' | 'used' | 'expired';
  issued_to?: string;
  expires_at: string;
  created_at: string;
}

export function useLoyaltySystem() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const addPoints = async (customerId: string, points: number, orderId?: string, description?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('loyalty-system', {
        body: {
          action: 'add_points',
          data: {
            customer_id: customerId,
            points,
            order_id: orderId,
            description
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Points ajoutés",
        description: `${points} points ajoutés avec succès`,
      });

      return data;
    } catch (error: any) {
      console.error('Error adding points:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les points",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const redeemPoints = async (customerId: string, points: number, description?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('loyalty-system', {
        body: {
          action: 'redeem_points',
          data: {
            customer_id: customerId,
            points,
            description
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Points utilisés",
        description: `${points} points utilisés avec succès`,
      });

      return data;
    } catch (error: any) {
      console.error('Error redeeming points:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'utiliser les points",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async (promotionData: Omit<Promotion, 'id' | 'is_active'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('loyalty-system', {
        body: {
          action: 'create_promotion',
          data: promotionData
        }
      });

      if (error) throw error;

      toast({
        title: "Promotion créée",
        description: "La promotion a été créée avec succès",
      });

      return data;
    } catch (error: any) {
      console.error('Error creating promotion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la promotion",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createGiftCard = async (value: number, recipientEmail?: string, expiresAt?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('loyalty-system', {
        body: {
          action: 'create_gift_card',
          data: {
            value,
            recipient_email: recipientEmail,
            expires_at: expiresAt
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Carte cadeau créée",
        description: `Code: ${data.gift_card?.code}`,
      });

      return data;
    } catch (error: any) {
      console.error('Error creating gift card:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la carte cadeau",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const checkPromotion = async (promotionCode?: string, amount?: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('loyalty-system', {
        body: {
          action: 'check_promotion',
          data: {
            promotion_code: promotionCode,
            amount
          }
        }
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error checking promotion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const calculatePointsEarned = (amount: number, pointsRatio: number = 0.01) => {
    // 1 point pour chaque 100 GNF dépensé par défaut
    return Math.floor(amount * pointsRatio);
  };

  const calculateLoyaltyLevel = (totalSpent: number): LoyaltyCustomer['level'] => {
    if (totalSpent >= 500000) return 'platinum';
    if (totalSpent >= 200000) return 'gold';
    if (totalSpent >= 50000) return 'silver';
    return 'bronze';
  };

  const getPointsValue = (points: number, pointValue: number = 100) => {
    // 1 point = 100 GNF par défaut
    return points * pointValue;
  };

  return {
    loading,
    addPoints,
    redeemPoints,
    createPromotion,
    createGiftCard,
    checkPromotion,
    calculatePointsEarned,
    calculateLoyaltyLevel,
    getPointsValue
  };
}