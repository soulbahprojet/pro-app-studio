import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Crown, 
  Zap, 
  Database, 
  ArrowUp, 
  Check,
  AlertTriangle,
  Sparkles
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  storage: number;
  features: string[];
  isRecommended?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basique',
    price: 0,
    storage: 2,
    features: [
      'Jusqu\'à 50 produits',
      '2 Go de stockage',
      'POS basique',
      'Support par email'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 15000,
    storage: 15,
    features: [
      'Jusqu\'à 500 produits',
      '15 Go de stockage',
      'POS avancé avec promotions',
      'Gestion hors ligne',
      'Analytics avancées',
      'Support prioritaire'
    ],
    isRecommended: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 30000,
    storage: 30,
    features: [
      'Produits illimités',
      '30 Go de stockage',
      'Toutes les fonctionnalités POS',
      'Multi-boutiques',
      'API personnalisée',
      'Support dédié 24/7'
    ]
  }
];

export default function SubscriptionManager() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
  const [storageUsage, setStorageUsage] = useState(0);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const currentPlan = plans.find(plan => plan.id === profile?.subscription_plan) || plans[0];
  const storagePercentage = (storageUsage / currentPlan.storage) * 100;
  const isNearLimit = storagePercentage > 80;

  useEffect(() => {
    loadStorageUsage();
  }, [user]);

  const loadStorageUsage = async () => {
    if (!user) return;
    
    try {
      const usage = (profile as any)?.storage_used_gb || 0;
      setStorageUsage(usage);
      
      // Afficher l'alerte si proche de la limite
      if (usage / currentPlan.storage > 0.9) {
        setShowUpgradePrompt(true);
      }
    } catch (error) {
      console.error('Erreur chargement utilisation stockage:', error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    if (!user?.id) return;
    
    setUpgradeLoading(planId);
    try {
      if (planId === 'basic') {
        // Free plan - update directly in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_plan: 'basic',
            subscription_expires_at: null
          })
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Plan mis à jour",
          description: "Vous êtes maintenant sur le plan Basic gratuit."
        });
        
        // Refresh profile data
        window.location.reload();
      } else {
        // Check if user already has an active subscription
        const { data: checkData, error: checkError } = await supabase.functions.invoke('check-subscription');
        
        if (checkError) {
          console.error('Error checking subscription:', checkError);
        }

        // Create new subscription
        const plan = plans.find(p => p.id === planId);
        if (!plan) throw new Error('Plan non trouvé');

        const { data, error } = await supabase.functions.invoke('create-subscription', {
          body: {
            planId: planId,
            price: plan.price // Use the price directly (already in correct format)
          }
        });

        if (error) throw error;

        if (data.url) {
          // Redirect to Stripe checkout
          toast({
            title: "Redirection vers Stripe",
            description: "Vous allez être redirigé vers la page de paiement sécurisée."
          });
          // Redirect after a short delay to show the toast
          setTimeout(() => {
            window.location.href = data.url;
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à niveau le plan",
        variant: "destructive"
      });
    } finally {
      setUpgradeLoading(null);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return <Database className="h-5 w-5" />;
      case 'standard': return <Zap className="h-5 w-5" />;
      case 'premium': return <Crown className="h-5 w-5" />;
      default: return <Database className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* État actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPlanIcon(currentPlan.id)}
            Plan actuel : {currentPlan.name}
          </CardTitle>
          <CardDescription>
            {currentPlan.price === 0 ? 'Plan gratuit' : `${currentPlan.price.toLocaleString()} GNF/mois`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Utilisation du stockage */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Stockage utilisé</span>
              <span className={isNearLimit ? 'text-destructive font-medium' : ''}>
                {storageUsage.toFixed(1)} / {currentPlan.storage} Go
              </span>
            </div>
            <Progress 
              value={storagePercentage} 
              className={`h-2 ${isNearLimit ? '[&>div]:bg-destructive' : ''}`}
            />
            {isNearLimit && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Espace de stockage presque plein
              </div>
            )}
          </div>

          {/* Alerte de mise à niveau */}
          {showUpgradePrompt && (
            <div className="border border-orange-200 bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800 font-medium mb-2">
                <AlertTriangle className="h-4 w-4" />
                Mise à niveau recommandée
              </div>
              <p className="text-orange-700 text-sm mb-3">
                Votre espace de stockage est presque plein. Passez à un plan supérieur pour continuer à ajouter des produits.
              </p>
              <Button 
                size="sm" 
                onClick={() => handleUpgrade('standard')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Passer au plan Standard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plans disponibles */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.isRecommended ? 'border-primary ring-2 ring-primary/20' : ''} ${
              plan.id === currentPlan.id ? 'bg-muted/50' : ''
            }`}
          >
            {plan.isRecommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-3 py-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Recommandé
                </Badge>
              </div>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-2">
                {getPlanIcon(plan.id)}
              </div>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price === 0 ? 'Gratuit' : `${plan.price.toLocaleString()}`}
                {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground"> GNF/mois</span>}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="text-center">
                <Badge variant="secondary">
                  {plan.storage} Go de stockage
                </Badge>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4">
                {plan.id === currentPlan.id ? (
                  <Button disabled className="w-full">
                    Plan actuel
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={plan.isRecommended ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgradeLoading === plan.id}
                  >
                    {upgradeLoading === plan.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <>
                        <ArrowUp className="h-4 w-4 mr-2" />
                        {plan.price === 0 ? 'Rétrograder' : 'Passer à ce plan'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fonctionnalités détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des fonctionnalités</CardTitle>
          <CardDescription>
            Découvrez toutes les fonctionnalités disponibles selon votre plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Fonctionnalité</th>
                  {plans.map(plan => (
                    <th key={plan.id} className="text-center p-2">{plan.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="p-2">Interface POS moderne</td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Gestion des stocks en temps réel</td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Promotions et remises</td>
                  <td className="text-center p-2">Limitées</td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Mode hors ligne</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Analytics avancées</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-2">Multi-boutiques</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2">-</td>
                  <td className="text-center p-2"><Check className="h-4 w-4 text-green-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}