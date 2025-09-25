import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface RoleValidationResult {
  isValid: boolean;
  hasAccess: boolean;
  violations: string[];
  requiredRole?: string;
  userRole?: string;
}

/**
 * Hook de validation stricte des rôles
 * Vérifie que l'utilisateur a uniquement accès à son interface
 */
export const useRoleValidation = (requiredRoles?: string[]) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [validation, setValidation] = useState<RoleValidationResult>({
    isValid: false,
    hasAccess: false,
    violations: []
  });

  useEffect(() => {
    if (loading) return;

    const violations: string[] = [];
    let isValid = false;
    let hasAccess = false;

    // Vérifier l'authentification
    if (!user || !profile) {
      violations.push('Utilisateur non authentifié');
      setValidation({ isValid: false, hasAccess: false, violations });
      return;
    }

    // Vérifier le rôle si spécifié
    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(profile.role)) {
        violations.push(`Rôle requis: ${requiredRoles.join(' ou ')}. Rôle actuel: ${profile.role}`);
      } else {
        hasAccess = true;
      }
    } else {
      hasAccess = true; // Pas de restriction de rôle
    }

    // Validation des accès inter-rôles (CRITIQUE)
    const currentPath = location.pathname;
    const roleInterferences = {
      client: ['/vendor-dashboard', '/courier-dashboard', '/moto-dashboard', '/freight', '/admin-dashboard'],
      seller: ['/client-home', '/marketplace', '/courier-dashboard', '/moto-dashboard', '/freight', '/admin-dashboard'],
      courier: ['/client-home', '/marketplace', '/vendor-dashboard', '/moto-dashboard', '/freight', '/admin-dashboard'],
      taxi_moto: ['/client-home', '/marketplace', '/vendor-dashboard', '/courier-dashboard', '/freight', '/admin-dashboard'],
      transitaire: ['/client-home', '/marketplace', '/vendor-dashboard', '/courier-dashboard', '/moto-dashboard', '/admin-dashboard'],
      admin: [] // Admin peut accéder à ses interfaces spécifiques uniquement
    };

    const forbiddenPaths = roleInterferences[profile.role as keyof typeof roleInterferences] || [];
    const isInterference = forbiddenPaths.some(path => currentPath.startsWith(path));

    if (isInterference) {
      violations.push(`Accès inter-rôle interdit: ${profile.role} -> ${currentPath}`);
      hasAccess = false;
      
      // Log de sécurité critique
      console.error('🚨 VIOLATION INTER-RÔLE DÉTECTÉE:', {
        userId: user.id,
        userRole: profile.role,
        attemptedPath: currentPath,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "Violation de sécurité",
        description: "Tentative d'accès à une interface non autorisée détectée.",
        variant: "destructive",
      });
    }

    isValid = violations.length === 0;

    setValidation({
      isValid,
      hasAccess,
      violations,
      requiredRole: requiredRoles?.join(' ou '),
      userRole: profile.role
    });

  }, [user, profile, loading, location.pathname, requiredRoles]);

  return validation;
};

/**
 * Hook pour forcer la redirection vers l'interface appropriée
 */
export const useRoleRedirect = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const redirectToUserInterface = () => {
    if (!profile) return;

    const roleRedirects = {
      client: '/client-home',
      seller: '/vendor-dashboard',
      courier: '/courier-dashboard',
      taxi_moto: '/moto-dashboard',
      transitaire: '/freight',
      admin: '/admin-dashboard'
    };

    const targetRoute = roleRedirects[profile.role as keyof typeof roleRedirects];
    if (targetRoute) {
      navigate(targetRoute, { replace: true });
    }
  };

  return { redirectToUserInterface };
};