import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Store, 
  Bike,
  Building2,
  CreditCard,
  Truck,
  Smartphone,
  Shield,
  Globe,
  Users,
  Zap,
  Activity
} from 'lucide-react';

interface FeatureStatus {
  id: string;
  name: string;
  description: string;
  icon: any;
  isActive: boolean;
  category: 'marketplace' | 'delivery' | 'union' | 'payments' | 'international' | 'security';
  dependencies?: string[];
}

const ActivationManager = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [features, setFeatures] = useState<FeatureStatus[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeFeatures();
  }, [profile]);

  const initializeFeatures = () => {
    const featureList: FeatureStatus[] = [
      {
        id: 'marketplace',
        name: 'Marketplace & Boutique',
        description: 'Boutique professionnelle multi-types avec produits physiques et numériques',
        icon: Store,
        isActive: true,
        category: 'marketplace'
      },
      {
        id: 'delivery_tracking',
        name: 'Livreurs / Motards',
        description: 'Tableau de bord complet avec GPS, SOS et missions',
        icon: Bike,
        isActive: true,
        category: 'delivery'
      },
      {
        id: 'union_bureau',
        name: 'Bureau Syndicat',
        description: 'Gestion complète des badges, tickets et numéros de gilet',
        icon: Building2,
        isActive: true,
        category: 'union'
      },
      {
        id: 'virtual_cards',
        name: 'Cartes Virtuelles',
        description: 'Style Wise avec limite 3 cartes/jour et sécurité renforcée',
        icon: CreditCard,
        isActive: true,
        category: 'payments'
      },
      {
        id: 'international_freight',
        name: 'Transitaire International',
        description: 'Multi-entrepôts, scan QR, gestion employés',
        icon: Truck,
        isActive: true,
        category: 'international'
      },
      {
        id: 'taxi_moto',
        name: 'Taxi / Motard',
        description: 'Courses temps réel, paiement intégré, SOS',
        icon: Smartphone,
        isActive: true,
        category: 'delivery'
      },
      {
        id: 'security_system',
        name: 'Système de Sécurité',
        description: 'Données chiffrées, audit complet, suivi actions',
        icon: Shield,
        isActive: true,
        category: 'security'
      },
      {
        id: 'offline_sync',
        name: 'Synchronisation Hors ligne',
        description: 'Fonctionnement sans connexion et sync automatique',
        icon: Activity,
        isActive: true,
        category: 'security'
      },
      {
        id: 'realtime_updates',
        name: 'Mises à jour Temps Réel',
        description: 'Synchronisation immédiate entre tous les modules',
        icon: Zap,
        isActive: true,
        category: 'security'
      }
    ];

    setFeatures(featureList);
  };

  const activateAllFeatures = async () => {
    setLoading(true);
    try {
      // Simuler l'activation de toutes les fonctionnalités
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedFeatures = features.map(feature => ({
        ...feature,
        isActive: true
      }));
      
      setFeatures(updatedFeatures);
      
      toast({
        title: "✅ Activation terminée",
        description: "Toutes les fonctionnalités sont maintenant opérationnelles",
      });
    } catch (error) {
      toast({
        title: "❌ Erreur d'activation",
        description: "Impossible d'activer certaines fonctionnalités",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, isActive: !feature.isActive }
        : feature
    ));
    
    const feature = features.find(f => f.id === featureId);
    toast({
      title: feature?.isActive ? "Fonctionnalité désactivée" : "Fonctionnalité activée",
      description: `${feature?.name} ${feature?.isActive ? 'désactivée' : 'activée'} avec succès`
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "default" : "secondary";
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? CheckCircle : AlertCircle;
  };

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      marketplace: 'Commerce',
      delivery: 'Livraison',
      union: 'Syndicat',
      payments: 'Paiements',
      international: 'International',
      security: 'Sécurité'
    };
    return categories[category] || category;
  };

  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = [];
    }
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<string, FeatureStatus[]>);

  const activeCount = features.filter(f => f.isActive).length;
  const totalCount = features.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Gestionnaire d'Activation
              </CardTitle>
              <CardDescription>
                Contrôle central de toutes les fonctionnalités de l'application
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {activeCount}/{totalCount}
                </div>
                <p className="text-sm text-muted-foreground">
                  Fonctionnalités actives
                </p>
              </div>
              <Button 
                onClick={activateAllFeatures}
                disabled={loading || activeCount === totalCount}
                size="lg"
              >
                {loading ? (
                  <>
                    <Activity className="h-4 w-4 mr-2 animate-spin" />
                    Activation...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Activer Tout
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statut global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Fonctionnalités Actives</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateur Connecté</p>
                <p className="text-lg font-medium">{profile?.role || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pays</p>
                <p className="text-lg font-medium">{profile?.country || 'Guinée'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des fonctionnalités par catégorie */}
      {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              {getCategoryName(category)}
            </CardTitle>
            <CardDescription>
              {categoryFeatures.length} fonctionnalité(s) dans cette catégorie
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {categoryFeatures.map((feature) => {
                const StatusIcon = getStatusIcon(feature.isActive);
                const FeatureIcon = feature.icon;
                
                return (
                  <div key={feature.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FeatureIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {feature.name}
                          <Badge variant={getStatusColor(feature.isActive)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {feature.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={feature.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => toggleFeature(feature.id)}
                      >
                        {feature.isActive ? 'Désactiver' : 'Activer'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions de Maintenance</CardTitle>
          <CardDescription>
            Actions pour maintenir et optimiser l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col space-y-1">
              <Activity className="h-5 w-5" />
              <span className="text-xs">Vérifier Statut</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-1">
              <Shield className="h-5 w-5" />
              <span className="text-xs">Audit Sécurité</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-1">
              <Zap className="h-5 w-5" />
              <span className="text-xs">Optimiser Perf.</span>
            </Button>
            <Button variant="outline" className="h-16 flex flex-col space-y-1">
              <Settings className="h-5 w-5" />
              <span className="text-xs">Configuration</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivationManager;