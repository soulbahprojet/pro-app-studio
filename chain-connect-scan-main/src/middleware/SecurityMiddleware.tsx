import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SessionValidator from '@/components/auth/SessionValidator';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

/**
 * Middleware de sécurité critique pour empêcher l'accès non autorisé entre utilisateurs
 * Vérifie constamment que le token JWT correspond à l'utilisateur authentifié
 */
const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  const { user, session, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Vérification de sécurité en temps réel
  useEffect(() => {
    if (!loading) {
      // Vérifier l'intégrité de la session
      if (session && user) {
        // Vérifier que le token n'est pas expiré
        const currentTime = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < currentTime) {
          console.error('❌ SÉCURITÉ: Token expiré détecté');
          toast({
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        // Vérifier que l'user_id du token correspond au profil
        if (profile && user.id !== profile.user_id) {
          console.error('❌ SÉCURITÉ: Incohérence user_id détectée', {
            sessionUserId: user.id,
            profileUserId: profile.user_id
          });
          toast({
            title: "Erreur de sécurité",
            description: "Session invalide détectée. Reconnexion requise.",
            variant: "destructive",
          });
          supabase.auth.signOut();
          navigate('/auth');
          return;
        }

        // Vérification périodique de la validité de la session
        const validateSession = async () => {
          try {
            const { data: { session: currentSession }, error } = await supabase.auth.getSession();
            
            if (error || !currentSession) {
              console.error('❌ SÉCURITÉ: Session invalide lors de la validation', error);
              toast({
                title: "Session invalide",
                description: "Votre session n'est plus valide. Reconnexion requise.",
                variant: "destructive",
              });
              navigate('/auth');
              return;
            }

            // Vérifier que l'utilisateur n'a pas changé
            if (currentSession.user.id !== user.id) {
              console.error('❌ SÉCURITÉ: Changement d\'utilisateur détecté');
              toast({
                title: "Erreur de sécurité",
                description: "Changement d'utilisateur détecté. Reconnexion requise.",
                variant: "destructive",
              });
              supabase.auth.signOut();
              navigate('/auth');
              return;
            }

          } catch (error) {
            console.error('❌ SÉCURITÉ: Erreur lors de la validation de session', error);
          }
        };

        // Valider la session toutes les 30 secondes
        const intervalId = setInterval(validateSession, 30000);

        return () => clearInterval(intervalId);
      }
    }
  }, [session, user, profile, loading, navigate, location.pathname]);

  // Vérifier les tentatives d'accès non autorisées aux routes
  useEffect(() => {
    if (!loading && profile) {
      const path = location.pathname;
      
      // Vérifier que l'utilisateur accède uniquement à ses interfaces autorisées
      const roleRoutes = {
        'client': ['/client-home', '/marketplace', '/tracking', '/profile', '/orders', '/favorites', '/wallet', '/virtual-cards', '/services', '/digital-store'],
        'seller': ['/vendor-dashboard', '/profile'],
        'courier': ['/courier-dashboard', '/profile'],
        'taxi_moto': ['/moto-dashboard', '/profile'],
        'transitaire': ['/freight', '/profile'],
        'admin': ['/admin-dashboard', '/pdg-dashboard', '/interfacepdg224gn', '/pdg-login', '/profile']
      };

      const allowedRoutes = roleRoutes[profile.role as keyof typeof roleRoutes] || ['/profile'];
      const isRouteAllowed = allowedRoutes.some(route => path.startsWith(route)) || 
                           path === '/' || 
                           path === '/auth' || 
                           path.startsWith('/syndicat-bureau');

      if (!isRouteAllowed) {
        console.error('❌ SÉCURITÉ: Tentative d\'accès à une route non autorisée', {
          userRole: profile.role,
          attemptedPath: path,
          allowedRoutes
        });
        
        toast({
          title: "Accès refusé",
          description: "Vous n'êtes pas autorisé à accéder à cette section.",
          variant: "destructive",
        });

        // Rediriger vers l'interface appropriée
        const defaultRoute = {
          'client': '/client-home',
          'seller': '/vendor-dashboard',
          'courier': '/courier-dashboard',
          'taxi_moto': '/moto-dashboard',
          'transitaire': '/freight',
          'admin': '/admin-dashboard'
        }[profile.role] || '/profile';

        navigate(defaultRoute, { replace: true });
      }
    }
  }, [profile, loading, location.pathname, navigate]);

  // Protection contre les attaques de session fixation
  useEffect(() => {
    if (session && user) {
      // Stocker l'empreinte de la session pour détecter les changements
      const sessionFingerprint = `${user.id}-${session.access_token.substring(0, 10)}`;
      const storedFingerprint = localStorage.getItem('session_fingerprint');

      if (storedFingerprint && storedFingerprint !== sessionFingerprint) {
        console.error('❌ SÉCURITÉ: Session fixation détectée');
        toast({
          title: "Erreur de sécurité",
          description: "Activité suspecte détectée. Reconnexion requise.",
          variant: "destructive",
        });
        supabase.auth.signOut();
        localStorage.removeItem('session_fingerprint');
        navigate('/auth');
        return;
      }

      localStorage.setItem('session_fingerprint', sessionFingerprint);
    } else {
      localStorage.removeItem('session_fingerprint');
    }
  }, [session, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Vérification de sécurité...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SessionValidator />
      {children}
    </>
  );
};

export default SecurityMiddleware;