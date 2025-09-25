import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface StrictSecurityGuardProps {
  children: React.ReactNode;
}

/**
 * GARDE DE SÉCURITÉ STRICTE - CORRECTION CRITIQUE
 * Ce composant empêche strictement l'accès croisé entre utilisateurs
 * et force la redirection vers l'interface appropriée selon le rôle
 */
const StrictSecurityGuard: React.FC<StrictSecurityGuardProps> = ({ children }) => {
  const { profile, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    const publicRoutes = [
      '/', '/auth', '/simple-auth', '/client-auth', '/business-auth', 
      '/vendor-auth', '/pdg-login', '/staff-pro-login'
    ];

    // Vérifier si c'est une route publique
    const isPublicRoute = publicRoutes.some(route => 
      currentPath === route || 
      currentPath.startsWith(route + '/') ||
      currentPath.startsWith(route + '?') ||
      currentPath.startsWith(route + '#')
    );

    // Si c'est une route publique, permettre l'accès
    if (isPublicRoute) {
      return;
    }

    // Pour les routes protégées, vérifier l'authentification
    if (!loading && (!user || !profile)) {
      console.log('🔒 Route protégée nécessite une authentification:', currentPath);
      navigate('/auth', { replace: true });
      return;
    }

    // Si l'utilisateur est authentifié, vérifier les permissions de rôle
    if (!loading && user && profile) {
      // DÉFINITION STRICTE DES ROUTES AUTORISÉES PAR RÔLE
      const strictRoleRoutes = {
        'client': [
          '/profile', '/client-home', '/tracking', '/orders', '/favorites', 
          '/wallet', '/virtual-cards', '/client-checkout', '/client-messages',
          '/order-tracking', '/nearby-services'
        ],
        'seller': [
          '/profile', '/vendor-dashboard', '/seller-dashboard', '/digital-store-pro'
        ],
        'courier': [
          '/profile', '/courier-dashboard', '/delivery-interface'
        ],
        'taxi_moto': [
          '/profile', '/moto-dashboard'
        ],
        'transitaire': [
          '/profile', '/freight', '/freight-dashboard', '/new-shipment',
          '/shipment-tracking', '/shipment-history'
        ],
        'admin': [
          '/profile', '/admin-dashboard', '/pdg-dashboard', '/security-test',
          '/testing-dashboard', '/comprehensive-test'
        ]
      };

      const allowedRoutes = strictRoleRoutes[profile.role as keyof typeof strictRoleRoutes] || [];
      
      // Vérifier si la route est autorisée pour ce rôle
      const isRouteAllowed = allowedRoutes.some(route => 
        currentPath === route || 
        currentPath.startsWith(route + '/') ||
        currentPath.startsWith(route + '?') ||
        currentPath.startsWith(route + '#')
      );

      if (!isRouteAllowed) {
        console.error('🚨 SÉCURITÉ: Accès non autorisé à une route protégée', {
          userRole: profile.role,
          userId: user.id,
          attemptedPath: currentPath,
          allowedRoutes: allowedRoutes
        });

        toast({
          title: "🚨 Accès Refusé",
          description: `Cette section n'est pas accessible avec votre rôle ${profile.role}.`,
          variant: "destructive",
          duration: 3000,
        });

        // REDIRECTION vers l'interface appropriée
        const roleRedirectMap = {
          'client': '/client-home',
          'seller': '/vendor-dashboard',
          'courier': '/courier-dashboard',
          'taxi_moto': '/moto-dashboard',
          'transitaire': '/freight',
          'admin': '/admin-dashboard'
        };

        const redirectPath = roleRedirectMap[profile.role as keyof typeof roleRedirectMap] || '/';
        navigate(redirectPath, { replace: true });
        return;
      }

      // VALIDATION SUPPLÉMENTAIRE: Vérifier que l'utilisateur correspond au profil
      if (profile.user_id !== user.id) {
        console.error('🚨 SÉCURITÉ CRITIQUE: Incohérence utilisateur-profil détectée', {
          sessionUserId: user.id,
          profileUserId: profile.user_id
        });

        toast({
          title: "🚨 Erreur de Sécurité Critique",
          description: "Session invalide détectée. Déconnexion immédiate.",
          variant: "destructive",
          duration: 5000,
        });

        navigate('/auth', { replace: true });
        return;
      }
    }
  }, [profile, user, loading, location.pathname, navigate]);

  // Afficher un écran de chargement sécurisé pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-lg font-medium text-foreground">🔒 Vérification de sécurité...</div>
          <div className="text-sm text-muted-foreground">Validation des permissions en cours</div>
        </div>
      </div>
    );
  }

  // Permettre l'accès aux routes publiques même sans authentification
  const currentPath = location.pathname;
  const publicRoutes = [
    '/', '/auth', '/simple-auth', '/client-auth', '/business-auth', 
    '/vendor-auth', '/pdg-login', '/staff-pro-login'
  ];
  
  const isPublicRoute = publicRoutes.some(route => 
    currentPath === route || 
    currentPath.startsWith(route + '/') ||
    currentPath.startsWith(route + '?') ||
    currentPath.startsWith(route + '#')
  );

  // Si c'est une route publique, permettre l'accès sans authentification
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Pour les routes protégées, exiger une authentification
  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="text-lg font-medium text-orange-600">🔒 Authentification requise</div>
          <div className="text-sm text-muted-foreground">Cette section nécessite une connexion</div>
          <button 
            onClick={() => navigate('/auth')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default StrictSecurityGuard;