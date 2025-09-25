import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeatureGate, useFeatureFlag, useRoleFeatures } from '@/hooks/useFeatureFlags';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Wallet, 
  Users, 
  MessageCircle, 
  Video,
  BarChart3,
  Settings,
  Truck
} from 'lucide-react';

/**
 * Exemple d'utilisation des feature flags dans les composants
 */
const FeatureFlagsExample: React.FC = () => {
  const { features, isLoading } = useRoleFeatures();
  const { isEnabled: walletEnabled } = useFeatureFlag('wallet');
  const { isEnabled: socialEnabled } = useFeatureFlag('social_module');
  const { isEnabled: callsEnabled } = useFeatureFlag('audio_video_calls');

  if (isLoading) {
    return <div className="animate-pulse">Chargement des fonctionnalités...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités Disponibles</CardTitle>
          <CardDescription>
            Basées sur votre rôle et les features flags activés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {features.map((featureObj) => (
              <Badge key={featureObj.feature} variant="default">
                {featureObj.description}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Portefeuille - Conditionnel */}
        <FeatureGate 
          feature="wallet"
          fallback={
            <Card className="opacity-50">
              <CardContent className="p-6">
                <Wallet className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-semibold">Portefeuille</h3>
                <p className="text-sm text-muted-foreground">Non disponible</p>
              </CardContent>
            </Card>
          }
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Wallet className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Portefeuille</h3>
              <p className="text-sm text-muted-foreground">Gérer vos finances</p>
              <Button className="w-full mt-3" size="sm">
                Accéder
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Commandes - Conditionnel */}
        <FeatureGate feature="orders">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <ShoppingCart className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Commandes</h3>
              <p className="text-sm text-muted-foreground">Gérer vos commandes</p>
              <Button className="w-full mt-3" size="sm">
                Voir Commandes
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Module Social - Conditionnel */}
        <FeatureGate 
          feature="social_module"
          fallback={
            <Card className="opacity-50">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <h3 className="font-semibold">Réseau Social</h3>
                <p className="text-sm text-muted-foreground">Bientôt disponible</p>
              </CardContent>
            </Card>
          }
        >
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Réseau Social</h3>
              <p className="text-sm text-muted-foreground">Connectez-vous</p>
              <Button className="w-full mt-3" size="sm">
                Explorer
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Appels Audio/Vidéo - Conditionnel */}
        <FeatureGate feature="audio_video_calls">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Video className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Appels Vidéo</h3>
              <p className="text-sm text-muted-foreground">Communication directe</p>
              <Button className="w-full mt-3" size="sm">
                Démarrer Appel
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Produits - Pour vendeurs uniquement */}
        <FeatureGate feature="products">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <ShoppingCart className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Produits</h3>
              <p className="text-sm text-muted-foreground">Gérer votre catalogue</p>
              <Button className="w-full mt-3" size="sm">
                Catalogue
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Livraisons - Pour livreurs uniquement */}
        <FeatureGate feature="deliveries">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <Truck className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Livraisons</h3>
              <p className="text-sm text-muted-foreground">Gérer vos livraisons</p>
              <Button className="w-full mt-3" size="sm">
                Missions
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>

        {/* Analytics - Conditionnel */}
        <FeatureGate feature="analytics">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-semibold">Statistiques</h3>
              <p className="text-sm text-muted-foreground">Analyses et rapports</p>
              <Button className="w-full mt-3" size="sm">
                Voir Stats
              </Button>
            </CardContent>
          </Card>
        </FeatureGate>
      </div>

      {/* Statut des fonctionnalités */}
      <Card>
        <CardHeader>
          <CardTitle>Statut des Fonctionnalités</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${walletEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Portefeuille</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${socialEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Module Social</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${callsEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">Appels Audio/Vidéo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">{features.length} fonctionnalités</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureFlagsExample;