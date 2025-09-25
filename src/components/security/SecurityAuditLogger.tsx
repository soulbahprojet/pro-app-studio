import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

interface SecurityEvent {
  type: 'ACCESS' | 'VIOLATION' | 'LOGIN' | 'LOGOUT' | 'ROLE_CHANGE';
  userId?: string;
  userRole?: string;
  details: Record<string, any>;
  timestamp: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

/**
 * Service d'audit et de logging pour la sécurité
 * Enregistre tous les événements de sécurité critiques
 */
class SecurityAuditService {
  private static logs: SecurityEvent[] = [];
  private static maxLogs = 1000;

  static log(event: Omit<SecurityEvent, 'timestamp'>) {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.logs.unshift(fullEvent);
    
    // Maintenir la limite de logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log dans la console avec couleurs
    const colors = {
      LOW: '🟢',
      MEDIUM: '🟡', 
      HIGH: '🟠',
      CRITICAL: '🔴'
    };

    console.log(`${colors[event.severity]} SECURITY AUDIT [${event.type}]:`, fullEvent);

    // En production, envoyer vers un service d'audit externe
    if (event.severity === 'CRITICAL') {
      this.sendToAuditService(fullEvent);
    }

    // Stocker localement pour debug
    if (typeof window !== 'undefined') {
      localStorage.setItem('security_audit_logs', JSON.stringify(this.logs.slice(0, 100)));
    }
  }

  private static async sendToAuditService(event: SecurityEvent) {
    try {
      // Envoi vers service d'audit (à implémenter)
      await fetch('/api/security-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Erreur envoi audit:', error);
    }
  }

  static getLogs(severity?: SecurityEvent['severity']): SecurityEvent[] {
    if (severity) {
      return this.logs.filter(log => log.severity === severity);
    }
    return [...this.logs];
  }

  static getViolations(): SecurityEvent[] {
    return this.logs.filter(log => log.type === 'VIOLATION');
  }

  static clearLogs() {
    this.logs = [];
    if (typeof window !== 'undefined') {
      localStorage.removeItem('security_audit_logs');
    }
  }
}

/**
 * Composant pour logger automatiquement les accès aux pages
 */
const SecurityAuditLogger = () => {
  const { user, profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user && profile) {
      // Vérifier les accès autorisés pour chaque rôle
      const roleAccess = {
        client: ['/client-home', '/marketplace', '/services', '/tracking', '/orders', '/favorites', '/wallet', '/virtual-cards', '/digital-store'],
        seller: ['/vendor-dashboard'],
        courier: ['/courier-dashboard'],
        taxi_moto: ['/moto-dashboard'],
        transitaire: ['/freight', '/new-shipment', '/shipment-tracking', '/shipment-history'],
        admin: ['/admin-dashboard', '/pdg-dashboard', '/interfacepdg224gn']
      };

      const allowedPaths = roleAccess[profile.role as keyof typeof roleAccess] || [];
      const isPathAllowed = allowedPaths.some(path => location.pathname.startsWith(path)) || 
                           location.pathname === '/profile' ||
                           location.pathname === '/' ||
                           location.pathname.startsWith('/auth');

      if (isPathAllowed) {
        SecurityAuditService.log({
          type: 'ACCESS',
          userId: user.id,
          userRole: profile.role,
          severity: 'LOW',
          details: {
            path: location.pathname,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        });
      } else {
        SecurityAuditService.log({
          type: 'VIOLATION',
          userId: user.id,
          userRole: profile.role,
          severity: 'CRITICAL',
          details: {
            violationType: 'UNAUTHORIZED_PATH_ACCESS',
            attemptedPath: location.pathname,
            userRole: profile.role,
            allowedPaths,
            userAgent: navigator.userAgent,
            referrer: document.referrer
          }
        });
      }
    }
  }, [user, profile, location.pathname]);

  return null;
};

export { SecurityAuditService };
export default SecurityAuditLogger;
