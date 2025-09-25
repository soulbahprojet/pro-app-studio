import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Hooks sécurisés pour des tables spécifiques
 * Garantit que l'utilisateur n'accède qu'à ses propres données
 */

// Hook spécifique pour les profils
export const useSecureProfile = () => {
  const { user, profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setError('Utilisateur non authentifié');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // SÉCURITÉ CRITIQUE: Récupérer uniquement le profil de l'utilisateur connecté
      const { data: result, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (queryError && queryError.code !== 'PGRST116') {
        console.error('❌ ERREUR lors de la récupération du profil:', queryError);
        setError(queryError.message);
        return;
      }

      // VÉRIFICATION DE SÉCURITÉ CRITIQUE
      if (result && result.user_id !== user.id) {
        console.error('❌ SÉCURITÉ CRITIQUE: Profil non autorisé détecté', {
          expectedUserId: user.id,
          receivedUserId: result.user_id,
          timestamp: new Date().toISOString()
        });
        toast({
          title: "🚨 VIOLATION DE SÉCURITÉ",
          description: "Tentative d'accès à un profil non autorisé détectée. Session fermée immédiatement.",
          variant: "destructive",
          duration: 10000,
        });
        await supabase.auth.signOut();
        window.location.href = '/auth';
        return;
      }

      setData(result);
    } catch (err: any) {
      console.error('❌ ERREUR:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook spécifique pour les portefeuilles
export const useSecureWallet = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setError('Utilisateur non authentifié');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // SÉCURITÉ CRITIQUE: Récupérer uniquement le portefeuille de l'utilisateur connecté
      const { data: result, error: queryError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (queryError) {
        console.error('❌ ERREUR lors de la récupération du portefeuille:', queryError);
        setError(queryError.message);
        return;
      }

      // VÉRIFICATION DE SÉCURITÉ CRITIQUE
      if (result && result.user_id !== user.id) {
        console.error('❌ SÉCURITÉ CRITIQUE: Portefeuille non autorisé détecté', {
          expectedUserId: user.id,
          receivedUserId: result.user_id,
          timestamp: new Date().toISOString()
        });
        toast({
          title: "🚨 VIOLATION DE SÉCURITÉ",
          description: "Tentative d'accès à un portefeuille non autorisé. Session fermée immédiatement.",
          variant: "destructive",
          duration: 10000,
        });
        await supabase.auth.signOut();
        window.location.href = '/auth';
        return;
      }

      setData(result);
    } catch (err: any) {
      console.error('❌ ERREUR:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook spécifique pour les transactions
export const useSecureTransactions = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setError('Utilisateur non authentifié');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Récupérer d'abord le portefeuille de l'utilisateur
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (walletError || !wallet) {
        console.error('❌ ERREUR: Portefeuille non trouvé');
        setError('Portefeuille non trouvé');
        return;
      }

      // Récupérer les transactions du portefeuille
      const { data: result, error: queryError } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false });

      if (queryError) {
        console.error('❌ ERREUR lors de la récupération des transactions:', queryError);
        setError(queryError.message);
        return;
      }

      setData(result || []);
    } catch (err: any) {
      console.error('❌ ERREUR:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook générique pour les vérifications de sécurité sur les requêtes personnalisées
 */
export const useSecurityCheck = () => {
  const { user } = useAuth();

  const verifyOwnership = useCallback((item: any, allowedFields: string[] = ['user_id']) => {
    if (!user || !item) return false;
    
    return allowedFields.some(field => {
      if (field === 'user_id' && item.user_id === user.id) return true;
      if (field === 'customer_id' && item.customer_id === user.id) return true;
      if (field === 'seller_id' && item.seller_id === user.id) return true;
      if (field === 'courier_id' && item.courier_id === user.id) return true;
      return false;
    });
  }, [user]);

  const validateAndFilter = useCallback((data: any[], allowedFields: string[] = ['user_id']) => {
    if (!Array.isArray(data) || !user) return [];
    
    const filteredData = data.filter(item => verifyOwnership(item, allowedFields));
    
    // Log de sécurité si des données ont été filtrées
    if (filteredData.length !== data.length) {
      console.warn('🔒 SÉCURITÉ: Données non autorisées filtrées', {
        original: data.length,
        filtered: filteredData.length,
        userId: user.id
      });
    }
    
    return filteredData;
  }, [user, verifyOwnership]);

  return { verifyOwnership, validateAndFilter };
};