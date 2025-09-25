import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoleValidation } from '@/hooks/useRoleValidation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertTriangle, Lock, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackComponent?: React.ReactNode;
}

/**
 * Composant de garde pour protéger les composants par rôle
 * Empêche le rendu si l'utilisateur n'a pas le bon rôle
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallbackComponent 
}) => {
  const { profile, loading } = useAuth();
  const validation = useRoleValidation(allowedRoles);
  const navigate = useNavigate();

  // Chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Lock className="w-8 h-8 text-primary mx-auto animate-pulse mb-2" />
          <p className="text-sm text-muted-foreground">Vérification des autorisations...</p>
        </div>
      </div>
    );
  }

  // Accès refusé
  if (!validation.hasAccess) {
    const defaultFallback = (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Accès Refusé
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Rôle requis:</strong> {allowedRoles.join(' ou ')}
            </p>
            <p className="text-sm">
              <strong>Votre rôle:</strong> {validation.userRole}
            </p>
          </div>
          
          {validation.violations.length > 0 && (
            <div className="bg-destructive/10 p-3 rounded-md">
              <p className="text-sm font-medium mb-2">Violations détectées:</p>
              <ul className="text-xs space-y-1">
                {validation.violations.map((violation, index) => (
                  <li key={index} className="text-destructive">• {violation}</li>
                ))}
              </ul>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => {
              const roleRedirects = {
                client: '/client-home',
                seller: '/vendor-dashboard',
                courier: '/courier-dashboard',
                taxi_moto: '/moto-dashboard',
                transitaire: '/freight',
                admin: '/admin-dashboard'
              };
              const targetRoute = roleRedirects[profile?.role as keyof typeof roleRedirects];
              if (targetRoute) {
                navigate(targetRoute, { replace: true });
              }
            }}
            className="w-full"
          >
            <Shield className="w-4 h-4 mr-2" />
            Retourner à mon interface
          </Button>
        </CardContent>
      </Card>
    );

    return fallbackComponent || defaultFallback;
  }

  // Accès autorisé
  return <>{children}</>;
};

export default RoleGuard;
