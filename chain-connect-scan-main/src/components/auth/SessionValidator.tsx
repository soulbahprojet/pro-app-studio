import React, { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

/**
 * Composant de validation de session en temps réel
 * S'assure que la session utilisateur est toujours valide et sécurisée
 */
const SessionValidator: React.FC = () => {
  const { user, session, profile } = useAuth();
  const navigate = useNavigate();

  const validateUserSession = useCallback(async () => {
    if (!user || !session) return;

    try {
      // 1. Vérifier que la session existe toujours côté serveur
      const { data: currentSession, error } = await supabase.auth.getSession();
      
      if (error || !currentSession.session) {
        console.error('❌ SÉCURITÉ: Session expirée côté serveur');
        toast({
          title: "Session expirée",
          description: "Votre session a expiré. Reconnexion nécessaire.",
          variant: "destructive",
        });
        navigate('/auth');
        return;
      }

      // 2. Vérifier que l'utilisateur n'a pas changé
      if (currentSession.session.user.id !== user.id) {
        console.error('❌ SÉCURITÉ: Utilisateur différent détecté');
        toast({
          title: "Erreur de sécurité",
          description: "Changement d'utilisateur détecté. Reconnexion nécessaire.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }

      // 3. Vérifier l'intégrité du profil
      if (profile) {
        const { data: currentProfile, error: profileError } = await supabase
          .from('profiles')
          .select('user_id, role')
          .eq('user_id', user.id)
          .single();

        if (profileError || !currentProfile) {
          console.error('❌ SÉCURITÉ: Profil utilisateur non trouvé');
          toast({
            title: "Erreur de profil",
            description: "Profil utilisateur invalide. Reconnexion nécessaire.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          navigate('/auth');
          return;
        }

        // Vérifier que le profil correspond à l'utilisateur
        if (currentProfile.user_id !== user.id) {
          console.error('❌ SÉCURITÉ: Incohérence profil-utilisateur');
          toast({
            title: "Erreur de sécurité",
            description: "Incohérence de profil détectée. Reconnexion nécessaire.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          navigate('/auth');
          return;
        }
      }

    } catch (error) {
      console.error('❌ ERREUR lors de la validation de session:', error);
      // En cas d'erreur de validation, on considère que c'est suspect
      toast({
        title: "Erreur de validation",
        description: "Impossible de valider votre session. Reconnexion nécessaire.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate('/auth');
    }
  }, [user, session, profile, navigate]);

  // Validation périodique de la session
  useEffect(() => {
    if (user && session) {
      // Validation immédiate
      validateUserSession();
      
      // Validation toutes les 2 minutes
      const intervalId = setInterval(validateUserSession, 120000);
      
      return () => clearInterval(intervalId);
    }
  }, [validateUserSession, user, session]);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          console.log('📤 Déconnexion détectée');
          navigate('/auth');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token rafraîchi');
          // Re-valider après refresh du token
          setTimeout(validateUserSession, 1000);
        } else if (event === 'USER_UPDATED') {
          console.log('👤 Utilisateur mis à jour');
          // Re-valider après mise à jour
          setTimeout(validateUserSession, 1000);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, validateUserSession]);

  return null; // Ce composant ne rend rien visuellement
};

export default SessionValidator;