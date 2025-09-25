import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { 
  Settings, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Users,
  Activity,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface FeatureStatus {
  role: string;
  feature: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface SystemStatus {
  activated: boolean;
  last_activation?: string;
  total_features?: number;
}

interface ActivationStats {
  total_features: number;
  enabled_features: number;
  disabled_features: number;
  roles_configured: number;
}

const FeaturesActivationDashboard: React.FC = () => {
  const [featuresStatus, setFeaturesStatus] = useState<Record<string, FeatureStatus[]>>({});
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({ activated: false });
  const [activationStats, setActivationStats] = useState<ActivationStats>({
    total_features: 0,
    enabled_features: 0,
    disabled_features: 0,
    roles_configured: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const roles = [
    { key: 'seller', name: 'Vendeur', icon: Users },
    { key: 'client', name: 'Client', icon: Users },
    { key: 'courier', name: 'Livreur', icon: Users },
    { key: 'transitaire', name: 'Transitaire', icon: Users },
    { key: 'taxi_moto', name: 'Moto-taxi', icon: Users },
    { key: 'admin', name: 'Administrateur', icon: Settings }
  ];

  useEffect(() => {
    loadFeaturesStatus();
  }, []);

  const loadFeaturesStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('features-activation', {
        body: { action: 'get_features_status' }
      });

      if (error) throw error;

      setFeaturesStatus(data.features_by_role || {});
      setSystemStatus(data.system_status || { activated: false });
      setActivationStats(data.activation_stats || {
        total_features: 0,
        enabled_features: 0,
        disabled_features: 0,
        roles_configured: 0
      });

    } catch (error) {
      console.error('Error loading features status:', error);
      toast.error('Erreur lors du chargement du statut des fonctionnalités');
    }
  };

  const activateAllFeatures = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('features-activation', {
        body: { action: 'activate_all_features' }
      });

      if (error) throw error;

      toast.success(`🎉 Activation terminée! ${data.results.activated_features} fonctionnalités activées`);
      
      if (data.results.failed_features > 0) {
        toast.warning(`⚠️ ${data.results.failed_features} fonctionnalités ont échoué`);
      }

      // Recharger le statut
      setTimeout(loadFeaturesStatus, 1000);

    } catch (error) {
      console.error('Error activating features:', error);
      toast.error('Erreur lors de l\'activation des fonctionnalités');
    } finally {
      setIsLoading(false);
    }
  };

  const activateRoleFeatures = async (role: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('features-activation', {
        body: { 
          action: 'activate_role_features',
          role_filter: role
        }
      });

      if (error) throw error;

      toast.success(`✅ Fonctionnalités activées pour ${role}: ${data.results.activated} fonctionnalités`);
      
      if (data.results.failed > 0) {
        toast.warning(`⚠️ ${data.results.failed} fonctionnalités ont échoué pour ${role}`);
      }

      setTimeout(loadFeaturesStatus, 1000);

    } catch (error) {
      console.error('Error activating role features:', error);
      toast.error(`Erreur lors de l'activation pour ${role}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFeature = async (role: string, feature: string, enabled: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('features-activation', {
        body: { 
          action: 'toggle_feature',
          role,
          feature,
          enabled
        }
      });

      if (error) throw error;

      toast.success(`${enabled ? 'Activé' : 'Désactivé'}: ${feature} pour ${role}`);
      
      // Mettre à jour localement
      setFeaturesStatus(prev => ({
        ...prev,
        [role]: prev[role]?.map(f => 
          f.feature === feature ? { ...f, enabled } : f
        ) || []
      }));

    } catch (error) {
      console.error('Error toggling feature:', error);
      toast.error('Erreur lors de la modification de la fonctionnalité');
    }
  };

  const getStatusColor = (enabled: boolean) => enabled ? 'default' : 'secondary';
  const getStatusIcon = (enabled: boolean) => enabled ? CheckCircle2 : XCircle;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            Activation des Fonctionnalités
          </h1>
          <p className="text-muted-foreground">
            Gestion centralisée des fonctionnalités par rôle utilisateur
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={loadFeaturesStatus}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statut Système */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Statut Système:</strong> {systemStatus.activated ? 'Activé' : 'Non activé'}
              {systemStatus.last_activation && (
                <span className="text-sm text-muted-foreground ml-2">
                  Dernière activation: {new Date(systemStatus.last_activation).toLocaleString()}
                </span>
              )}
            </div>
            <Badge variant={systemStatus.activated ? 'default' : 'secondary'}>
              {systemStatus.activated ? 'ACTIF' : 'INACTIF'}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Métriques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fonctionnalités</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activationStats.total_features}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activationStats.enabled_features}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Désactivées</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{activationStats.disabled_features}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rôles Configurés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activationStats.roles_configured}</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Actions d'Activation
          </CardTitle>
          <CardDescription>
            Activez toutes les fonctionnalités ou par rôle spécifique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={activateAllFeatures}
              disabled={isLoading}
              size="lg"
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Activer Toutes les Fonctionnalités
            </Button>

            {roles.map((role) => (
              <Button 
                key={role.key}
                onClick={() => activateRoleFeatures(role.key)}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <role.icon className="h-4 w-4" />
                {role.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gestion Détaillée par Rôle */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">Tous</TabsTrigger>
          {roles.map((role) => (
            <TabsTrigger key={role.key} value={role.key}>
              {role.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Vue d'Ensemble des Fonctionnalités</CardTitle>
              <CardDescription>
                Toutes les fonctionnalités activées par rôle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(featuresStatus).map(([role, features]) => (
                  <div key={role} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3 capitalize flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {role}
                      <Badge variant="outline">{features.length} fonctionnalités</Badge>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {features.map((feature) => {
                        const StatusIcon = getStatusIcon(feature.enabled);
                        return (
                          <Badge 
                            key={feature.feature} 
                            variant={getStatusColor(feature.enabled)}
                            className="flex items-center gap-1"
                          >
                            <StatusIcon className="h-3 w-3" />
                            {feature.feature}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {roles.map((role) => (
          <TabsContent key={role.key} value={role.key}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <role.icon className="h-5 w-5" />
                  Fonctionnalités - {role.name}
                </CardTitle>
                <CardDescription>
                  Gestion des fonctionnalités pour le rôle {role.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {featuresStatus[role.key]?.map((feature) => (
                    <div key={feature.feature} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <span className="font-medium capitalize">{feature.feature}</span>
                        <p className="text-sm text-muted-foreground">
                          Dernière mise à jour: {new Date(feature.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <Switch
                        checked={feature.enabled}
                        onCheckedChange={(enabled) => toggleFeature(role.key, feature.feature, enabled)}
                      />
                    </div>
                  )) || (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Aucune fonctionnalité configurée pour ce rôle.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default FeaturesActivationDashboard;
