import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlag, useRoleFeatures, useActivateFeatures } from '@/hooks/useFeatureFlags';
import { useVendorSubscription } from '@/hooks/useVendorSubscription';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Switch } from '../../ui/switch';
import { AlertCircle, Crown, Check, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';
import { toast } from 'sonner';

export const VendorFeatureActivation: React.FC = () => {
  const { profile, user } = useAuth();
  const { features, isLoading, hasActiveSubscription } = useRoleFeatures();
  const { activateUserFeatures } = useActivateFeatures();
  const { subscription, isActive: subscriptionActive, createBasicSubscription, upgradeToPremium } = useVendorSubscription();
  const [activatingFeatures, setActivatingFeatures] = useState(false);

  // Auto-activate features on mount
  useEffect(() => {
    if (user && profile && profile.role === 'seller') {
      activateFeatures();
    }
  }, [user, profile]);

  const activateFeatures = async () => {
    setActivatingFeatures(true);
    const success = await activateUserFeatures();
    if (success) {
      toast.success('Fonctionnalités activées avec succès');
    } else {
      toast.error('Erreur lors de l\'activation des fonctionnalités');
    }
    setActivatingFeatures(false);
  };

  const handleCreateBasicSubscription = async () => {
    const success = await createBasicSubscription();
    if (success) {
      toast.success('Abonnement de base créé');
      await activateFeatures();
    } else {
      toast.error('Erreur lors de la création de l\'abonnement');
    }
  };

  const handleUpgradeToPremium = async () => {
    const success = await upgradeToPremium();
    if (success) {
      toast.success('Mise à niveau vers Premium réussie');
      await activateFeatures();
    } else {
      toast.error('Erreur lors de la mise à niveau');
    }
  };

  if (profile?.role !== 'seller') {
    return null;
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Chargement des fonctionnalités...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const freeFeatures = features.filter(f => !f.requires_subscription);
  const premiumFeatures = features.filter(f => f.requires_subscription);

  return (
    <div className="space-y-6">
      {/* Status de l'abonnement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Statut d'abonnement vendeur
          </CardTitle>
          <CardDescription>
            Gérez votre abonnement et accédez aux fonctionnalités premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!subscription ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Aucun abonnement actif. Créez un abonnement de base pour commencer.
                </AlertDescription>
              </Alert>
              <Button onClick={handleCreateBasicSubscription}>
                Créer un abonnement de base gratuit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant={subscriptionActive ? "default" : "destructive"}>
                    {subscription.plan_type.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {subscription.expires_at 
                      ? `Expire le ${new Date(subscription.expires_at).toLocaleDateString()}`
                      : 'Abonnement permanent'
                    }
                  </p>
                </div>
                {subscription.plan_type === 'basic' && (
                  <Button onClick={handleUpgradeToPremium}>
                    Passer à Premium
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fonctionnalités gratuites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Fonctionnalités de base (Gratuites)
          </CardTitle>
          <CardDescription>
            Fonctionnalités incluses dans tous les abonnements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {freeFeatures.map((feature) => (
              <div key={feature.feature} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{feature.feature.replace('_', ' ')}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Activé
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fonctionnalités premium */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Fonctionnalités Premium
          </CardTitle>
          <CardDescription>
            Fonctionnalités avancées pour les abonnements premium
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {premiumFeatures.map((feature) => {
              const isAvailable = subscriptionActive && subscription?.plan_type === 'premium';
              return (
                <div key={feature.feature} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {feature.feature.replace('_', ' ')}
                      {!isAvailable && <Lock className="h-4 w-4 text-amber-500" />}
                    </h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Badge 
                    variant={isAvailable ? "default" : "secondary"}
                    className={isAvailable ? "text-green-600 border-green-600" : ""}
                  >
                    {isAvailable ? 'Activé' : 'Premium requis'}
                  </Badge>
                </div>
              );
            })}
          </div>

          {premiumFeatures.length > 0 && (!subscriptionActive || subscription?.plan_type !== 'premium') && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 mb-3">
                Passez à Premium pour accéder à toutes ces fonctionnalités avancées.
              </p>
              <Button onClick={handleUpgradeToPremium} variant="outline">
                Passer à Premium
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Gérez l'activation de vos fonctionnalités
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={activateFeatures} 
            disabled={activatingFeatures}
            className="w-full"
          >
            {activatingFeatures ? 'Activation en cours...' : 'Réactiver toutes les fonctionnalités'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
