import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Lock } from 'lucide-react';

interface StrictRoleEnforcerProps {
  children: React.ReactNode;
}

/**
 * MIDDLEWARE CRITIQUE - SÉPARATION STRICTE DES RÔLES
 * Empêche absolument tout accès croisé entre les rôles
 * Audit et logging complet de tous les accès
 */
const StrictRoleEnforcer: React.FC<StrictRoleEnforcerProps> = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [accessViolation, setAccessViolation] = useState<{
    type: string;
    message: string;
    userRole: string;
    attemptedPath: string;
  } | null>(null);

  // CONFIGURATION STRICTE DES RÔLES - AUCUN PARTAGE AUTORISÉ
  const STRICT_ROLE_CONFIG = {
    client: {
      allowedPaths: [
        '/client-home',
        '/marketplace', 
        '/services',
        '/nearby-services',
        '/tracking',
        '/orders',
        '/favorites',
        '/client-favorites',
        '/wallet',
        '/virtual-cards',
        '/digital-store',
        '/client-checkout',
        '/client-messages',
        '/profile'
      ],
      defaultRoute: '/client-home',
      interfaceName: 'Interface Client'
    },
    seller: {
      allowedPaths: [
        '/vendor-dashboard',
        '/profile'
      ],
      defaultRoute: '/vendor-dashboard',
      interfaceName: 'Interface Vendeur'
    },
    courier: {
      allowedPaths: [
        '/courier-dashboard',
        '/profile'
      ],
      defaultRoute: '/courier-dashboard',
      interfaceName: 'Interface Livreur'
    },
    taxi_moto: {
      allowedPaths: [
        '/moto-dashboard',
        '/profile'
      ],
      defaultRoute: '/moto-dashboard',
      interfaceName: 'Interface Moto-Taxi'
    },
    transitaire: {
      allowedPaths: [
        '/freight',
        '/new-shipment',
        '/shipment-tracking',
        '/shipment-history',
        '/profile'
      ],
      defaultRoute: '/freight',
      interfaceName: 'Interface Transitaire'
    },
    admin: {
      allowedPaths: [
        '/admin-dashboard',
        '/pdg-dashboard',
        '/interfacepdg224gn',
        '/profile'
      ],
      defaultRoute: '/admin-dashboard',
      interfaceName: 'Interface Administrateur'
    }
  };

  // ROUTES PUBLIQUES (accessibles sans authentification)
  const PUBLIC_ROUTES = [
    '/',
    '/auth',
    '/client-auth',
    '/vendor-auth',
    '/pdg-login',
    '/staff-pro-login'
  ];

  // AUDIT ET LOGGING DES ACCÈS
  const logAccessAttempt = (type: 'ALLOWED' | 'DENIED', details: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type,
      userId: user?.id,
      userRole: profile?.role,
      attemptedPath: location.pathname,
      userAgent: navigator.userAgent,
      ...details
    };

    console.log(`🔒 ROLE ENFORCEMENT [${type}]:`, logEntry);
    
    // En production, envoyer vers un service d'audit
    if (type === 'DENIED') {
      // Envoyer l'alerte de violation de sécurité
      fetch('/api/security-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      }).catch(console.error);
    }
  };

  // VÉRIFICATION STRICTE D'ACCÈS
  useEffect(() => {
    if (!loading) {
      const currentPath = location.pathname;

      // Autoriser les routes publiques
      if (PUBLIC_ROUTES.includes(currentPath)) {
        return;
      }

      // Vérifier l'authentification
      if (!user || !profile) {
        logAccessAttempt('DENIED', {
          reason: 'NOT_AUTHENTICATED',
          redirectTo: '/auth'
        });
        navigate('/auth', { replace: true });
        return;
      }

      // Vérifier la configuration du rôle
      const roleConfig = STRICT_ROLE_CONFIG[profile.role as keyof typeof STRICT_ROLE_CONFIG];
      if (!roleConfig) {
        setAccessViolation({
          type: 'INVALID_ROLE',
          message: `Rôle invalide: ${profile.role}`,
          userRole: profile.role,
          attemptedPath: currentPath
        });
        logAccessAttempt('DENIED', {
          reason: 'INVALID_ROLE',
          role: profile.role
        });
        return;
      }

      // Vérifier l'accès au chemin
      const isPathAllowed = roleConfig.allowedPaths.some(allowedPath => 
        currentPath === allowedPath || currentPath.startsWith(allowedPath + '/')
      );

      if (!isPathAllowed) {
        setAccessViolation({
          type: 'UNAUTHORIZED_ACCESS',
          message: `Accès refusé: Le rôle "${profile.role}" ne peut pas accéder à "${currentPath}"`,
          userRole: profile.role,
          attemptedPath: currentPath
        });
        
        logAccessAttempt('DENIED', {
          reason: 'UNAUTHORIZED_PATH',
          role: profile.role,
          allowedPaths: roleConfig.allowedPaths,
          attemptedPath: currentPath
        });
        
        toast({
          title: "Accès refusé",
          description: `Vous n'êtes pas autorisé à accéder à cette section.`,
          variant: "destructive",
        });

        // Redirection forcée vers l'interface autorisée
        setTimeout(() => {
          navigate(roleConfig.defaultRoute, { replace: true });
        }, 2000);
        
        return;
      }

      // Accès autorisé
      logAccessAttempt('ALLOWED', {
        role: profile.role,
        interface: roleConfig.interfaceName
      });
      
      // Réinitialiser les violations d'accès
      setAccessViolation(null);
    }
  }, [user, profile, loading, location.pathname, navigate]);

  // ÉCRAN DE VIOLATION DE SÉCURITÉ
  if (accessViolation) {
    const roleConfig = profile ? STRICT_ROLE_CONFIG[profile.role as keyof typeof STRICT_ROLE_CONFIG] : null;
    
    return (
      <div className="min-h-screen bg-destructive/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive">
          <CardHeader className="text-center">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <CardTitle className="text-destructive">
              Violation de Sécurité Détectée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Type:</strong> {accessViolation.type}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Votre rôle:</strong> {accessViolation.userRole}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Chemin tenté:</strong> {accessViolation.attemptedPath}
              </p>
            </div>
            
            <div className="bg-destructive/10 p-3 rounded-md">
              <p className="text-sm font-medium text-destructive">
                {accessViolation.message}
              </p>
            </div>

            {roleConfig && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Interface autorisée:</p>
                <p className="text-sm text-muted-foreground">
                  {roleConfig.interfaceName}
                </p>
                <Button 
                  onClick={() => navigate(roleConfig.defaultRoute, { replace: true })}
                  className="w-full"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Retourner à mon interface
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ÉCRAN DE CHARGEMENT SÉCURISÉ
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default StrictRoleEnforcer;