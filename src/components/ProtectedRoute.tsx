import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import RoleGuard from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Lock, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'seller' | 'courier' | 'transitaire' | 'admin' | 'taxi_moto')[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}) => {
  const { user, profile, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Écran de chargement avec sécurité renforcée
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Vérification de sécurité...</p>
        </div>
      </div>
    );
  }

  // Redirection si non authentifié
  if (requireAuth && !isAuthenticated) {
    console.warn('🔒 ACCÈS REFUSÉ: Utilisateur non authentifié tenté d\'accéder à:', location.pathname);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Validation stricte des rôles avec audit
  if (allowedRoles.length > 0) {
    if (!profile) {
      console.error('🚨 ERREUR SÉCURITÉ: Profil manquant pour utilisateur authentifié');
      return <Navigate to="/auth" replace />;
    }

    if (!allowedRoles.includes(profile.role)) {
      // Log de violation d'accès
      console.error('🚨 VIOLATION ACCÈS INTER-RÔLE:', {
        userId: user?.id,
        userRole: profile.role,
        requiredRoles: allowedRoles,
        attemptedPath: location.pathname,
        timestamp: new Date().toISOString()
      });

      // Redirection forcée vers l'interface autorisée
      const roleRedirects = {
        'client': '/client-home',
        'seller': '/vendor-dashboard',
        'courier': '/courier-dashboard',
        'taxi_moto': '/moto-dashboard',
        'transitaire': '/freight',
        'admin': '/admin-dashboard'
      };
      
      const defaultRoute = roleRedirects[profile.role as keyof typeof roleRedirects] || '/';
      
      // Afficher un écran d'erreur temporaire avant redirection
      setTimeout(() => {
        window.location.href = defaultRoute;
      }, 2000);

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Accès Non Autorisé
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-destructive/10 p-4 rounded-md">
                <p className="text-sm font-medium text-destructive mb-2">
                  Violation de sécurité détectée
                </p>
                <p className="text-xs text-muted-foreground">
                  Rôle: <strong>{profile.role}</strong><br />
                  Requis: <strong>{allowedRoles.join(' ou ')}</strong>
                </p>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Redirection vers votre interface...
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  // Envelopper dans RoleGuard pour une protection supplémentaire
  if (allowedRoles.length > 0) {
    return (
      <RoleGuard allowedRoles={allowedRoles}>
        {children}
      </RoleGuard>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
