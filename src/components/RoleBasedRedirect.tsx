import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const RoleBasedRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && profile) {
      const currentPath = location.pathname;
      
      // Ne pas rediriger si on est sur la page d'auth ou de profil
      if (currentPath === '/auth' || currentPath === '/profile') {
        return;
      }
      
      // Définir l'interface autorisée pour chaque rôle
      const roleRoutes = {
        'client': ['/client-home', '/marketplace', '/tracking', '/orders', '/favorites', '/wallet', '/virtual-cards', '/services', '/nearby-services', '/digital-store'],
        'seller': ['/vendor-dashboard'],
        'courier': ['/courier-dashboard'],
        'taxi_moto': ['/moto-dashboard'],
        'transitaire': ['/freight'],
        'admin': ['/admin-dashboard', '/pdg-dashboard', '/interfacepdg224gn', '/pdg-login', '/security-dashboard', '/features-activation']
      };

      const allowedRoutes = roleRoutes[profile.role as keyof typeof roleRoutes] || [];
      
      // Vérifier si l'utilisateur est sur une route autorisée
      const isOnAllowedRoute = allowedRoutes.some(route => currentPath.startsWith(route));
      
      if (!isOnAllowedRoute) {
        // Rediriger vers l'interface appropriée selon le rôle
        const redirections = {
          'client': '/client-home',
          'seller': '/vendor-dashboard',
          'courier': '/courier-dashboard',
          'taxi_moto': '/moto-dashboard',
          'transitaire': '/freight',
          'admin': '/admin-dashboard'
        };
        
        const targetRoute = redirections[profile.role as keyof typeof redirections] || '/client-home';
        console.log(`RoleBasedRedirect: Redirecting ${profile.role} from ${currentPath} to ${targetRoute}`);
        navigate(targetRoute, { replace: true });
      }
    }
  }, [profile, loading, location.pathname, navigate]);

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Chargement de votre interface...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleBasedRedirect;
