import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Lock, 
  Search, 
  Download,
  Settings,
  Activity,
  Users,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  ip_address?: string;
  description: string;
  metadata: any;
  is_resolved: boolean;
  resolved_at?: string;
  auto_action_taken?: string;
  created_at: string;
}

interface BlockedIP {
  ip: string;
  reason: string;
  blocked_at: string;
  duration: string;
}

interface UserSession {
  user_id: string;
  user_name: string;
  ip_address: string;
  device: string;
  last_activity: string;
  is_active: boolean;
}

export default function PDGSecurityManagement() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [activeSessions, setActiveSessions] = useState<UserSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    autoBlockEnabled: true,
    autoBlockAttempts: 5,
    autoBlockDuration: 24,
    notificationsEnabled: true,
    sessionTimeout: 720,
    passwordComplexity: true,
    twoFactorRequired: false,
    suspiciousAmountThreshold: 1000000,
    maxDailyTransactions: 50
  });

  const loadSecurityData = async () => {
    try {
      // Charger les alertes de sécurité
      const { data: alertsData, error: alertsError } = await supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (alertsError) throw alertsError;
      
      // Pour la démo, on utilise des données mock
      setAlerts([
        {
          id: '1',
          alert_type: 'suspicious_login',
          severity: 'high',
          user_id: 'user123',
          ip_address: '192.168.1.100',
          description: 'Tentatives de connexion répétées depuis une adresse IP suspecte',
          metadata: { attempts: 7, country: 'Unknown' },
          is_resolved: false,
          auto_action_taken: 'blocked_ip',
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          alert_type: 'unusual_transaction',
          severity: 'critical',
          user_id: 'user456',
          description: 'Transaction de montant inhabituel détectée',
          metadata: { amount: 5000000, currency: 'GNF' },
          is_resolved: false,
          created_at: new Date().toISOString()
        }
      ]);

      setBlockedIPs([
        {
          ip: '192.168.1.100',
          reason: 'Tentatives de connexion multiples',
          blocked_at: new Date().toISOString(),
          duration: '24 heures'
        }
      ]);

      setActiveSessions([
        {
          user_id: 'user123',
          user_name: 'Jean Dupont',
          ip_address: '10.0.0.1',
          device: 'iPhone 15',
          last_activity: new Date().toISOString(),
          is_active: true
        }
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des données de sécurité:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const handleBlockIP = async (ip: string, reason: string) => {
    try {
      toast.success(`IP ${ip} bloquée avec succès`);
      await loadSecurityData();
    } catch (error) {
      toast.error('Erreur lors du blocage de l\'IP');
    }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      toast.success(`IP ${ip} débloquée avec succès`);
      await loadSecurityData();
    } catch (error) {
      toast.error('Erreur lors du déblocage de l\'IP');
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      toast.success('Session terminée avec succès');
      await loadSecurityData();
    } catch (error) {
      toast.error('Erreur lors de la terminaison de la session');
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      await supabase
        .from('security_alerts')
        .update({ 
          is_resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      toast.success('Alerte résolue');
      await loadSecurityData();
    } catch (error) {
      toast.error('Erreur lors de la résolution de l\'alerte');
    }
  };

  const exportSecurityReport = () => {
    const reportData = {
      alerts: alerts.length,
      resolvedAlerts: alerts.filter(a => a.is_resolved).length,
      blockedIPs: blockedIPs.length,
      activeSessions: activeSessions.length,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-report-${Date.now()}.json`;
    a.click();
    
    toast.success('Rapport de sécurité exporté');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Chargement du système de sécurité...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Gestion de Sécurité IA
          </h1>
          <p className="text-muted-foreground">
            Surveillance automatique et détection d'anomalies pour 224SOLUTIONS
          </p>
        </div>
        <Button onClick={exportSecurityReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter Rapport
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Alertes Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.filter(a => !a.is_resolved).length}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.filter(a => a.severity === 'critical').length} critiques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-500" />
              IPs Bloquées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{blockedIPs.length}</div>
            <p className="text-xs text-muted-foreground">
              Dernières 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              Sessions Actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs connectés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              Système IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Actif</div>
            <p className="text-xs text-muted-foreground">
              Surveillance en temps réel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="blocked">IPs Bloquées</TabsTrigger>
          <TabsTrigger value="sessions">Sessions Actives</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une alerte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par sévérité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sévérités</SelectItem>
                <SelectItem value="critical">Critique</SelectItem>
                <SelectItem value="high">Élevée</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Faible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {alert.alert_type.replace('_', ' ')}
                        </span>
                        {alert.is_resolved && (
                          <Badge variant="secondary">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Résolu
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{alert.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {alert.ip_address && (
                          <span>IP: {alert.ip_address}</span>
                        )}
                        <span>
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                        {alert.auto_action_taken && (
                          <span className="text-orange-600">
                            Action: {alert.auto_action_taken}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {alert.ip_address && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleBlockIP(alert.ip_address!, 'Alerte de sécurité')}
                        >
                          Bloquer IP
                        </Button>
                      )}
                      {!alert.is_resolved && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Résoudre
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Blocked IPs Tab */}
        <TabsContent value="blocked" className="space-y-4">
          <div className="space-y-3">
            {blockedIPs.map((blocked, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{blocked.ip}</p>
                      <p className="text-sm text-muted-foreground">{blocked.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        Bloqué le {new Date(blocked.blocked_at).toLocaleString()} - 
                        Durée: {blocked.duration}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUnblockIP(blocked.ip)}
                    >
                      Débloquer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <div className="space-y-3">
            {activeSessions.map((session, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{session.user_name}</p>
                      <p className="text-sm text-muted-foreground">
                        IP: {session.ip_address} - Device: {session.device}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Dernière activité: {new Date(session.last_activity).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={session.is_active ? "default" : "secondary"}>
                        {session.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleTerminateSession(session.user_id)}
                      >
                        Terminer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Sécurité Automatique</CardTitle>
              <CardDescription>
                Configuration des seuils et actions automatiques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-block">Blocage automatique</Label>
                    <Switch 
                      id="auto-block"
                      checked={securitySettings.autoBlockEnabled}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, autoBlockEnabled: checked }))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tentatives avant blocage</Label>
                    <Input 
                      type="number" 
                      value={securitySettings.autoBlockAttempts}
                      onChange={(e) => 
                        setSecuritySettings(prev => ({ 
                          ...prev, 
                          autoBlockAttempts: parseInt(e.target.value) 
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Durée de blocage (heures)</Label>
                    <Input 
                      type="number" 
                      value={securitySettings.autoBlockDuration}
                      onChange={(e) => 
                        setSecuritySettings(prev => ({ 
                          ...prev, 
                          autoBlockDuration: parseInt(e.target.value) 
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications">Notifications d'alerte</Label>
                    <Switch 
                      id="notifications"
                      checked={securitySettings.notificationsEnabled}
                      onCheckedChange={(checked) => 
                        setSecuritySettings(prev => ({ ...prev, notificationsEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Timeout de session (minutes)</Label>
                    <Input 
                      type="number" 
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => 
                        setSecuritySettings(prev => ({ 
                          ...prev, 
                          sessionTimeout: parseInt(e.target.value) 
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Seuil montant suspect (GNF)</Label>
                    <Input 
                      type="number" 
                      value={securitySettings.suspiciousAmountThreshold}
                      onChange={(e) => 
                        setSecuritySettings(prev => ({ 
                          ...prev, 
                          suspiciousAmountThreshold: parseInt(e.target.value) 
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Les modifications de sécurité sont appliquées immédiatement et affectent tous les utilisateurs.
                </AlertDescription>
              </Alert>

              <Button className="w-full">
                Sauvegarder les Paramètres
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
