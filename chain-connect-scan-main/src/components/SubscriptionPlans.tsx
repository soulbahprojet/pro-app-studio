import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Crown, Zap, Check, Lock, ArrowRight } from 'lucide-react';

const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 0,
    currency: 'EUR',
    maxProducts: 10,
    features: [
      'Mini boutique',
      'Jusqu\'à 10 produits',
      'Support basique',
      'Gestion commandes de base'
    ],
    limitations: [
      'Pas de promotions',
      'Pas de codes promo',
      'Analytics limitées',
      'Pas de SEO avancé'
    ],
    icon: Store,
    color: 'bg-slate-500',
    popular: false
  },
  standard: {
    name: 'Standard',
    price: 29,
    currency: 'EUR',
    maxProducts: 'Illimité',
    features: [
      'Boutique complète',
      'Produits illimités',
      'Promotions et codes promo',
      'Analytics basiques',
      'Gestion stock avancée',
      'Support par email'
    ],
    limitations: [
      'Analytics limitées',
      'Pas de newsletter',
      'SEO basique'
    ],
    icon: Crown,
    color: 'bg-blue-500',
    popular: true
  },
  premium: {
    name: 'Premium',
    price: 79,
    currency: 'EUR',
    maxProducts: 'Illimité',
    features: [
      'Tout Standard +',
      'Analytics avancées',
      'Newsletter intégrée',
      'SEO avancé',
      'Codes promo avancés',
      'Support prioritaire',
      'Intégration paiement avancée',
      'Rapports détaillés'
    ],
    limitations: [],
    icon: Zap,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    popular: false
  }
};

interface SubscriptionPlansProps {
  currentPlan?: 'basic' | 'standard' | 'premium';
  onPlanChange?: () => void;
}

export function SubscriptionPlans({ currentPlan = 'basic', onPlanChange }: SubscriptionPlansProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlanSelection = async (planKey: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour changer de plan",
        variant: "destructive"
      });
      return;
    }

    if (planKey === currentPlan) {
      toast({
        title: "Plan actuel",
        description: "Vous utilisez déjà ce plan",
      });
      return;
    }

    setLoading(planKey);

    try {
      if (planKey === 'basic') {
        // Passage au plan gratuit
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_plan: 'basic',
            subscription_expires_at: null
          })
          .eq('user_id', user.id);

        if (error) throw error;

        toast({
          title: "Plan modifié",
          description: "Vous êtes maintenant sur le plan Basic gratuit",
        });

        onPlanChange?.();
      } else {
        // Appel à l'edge function pour créer la session de paiement
        const { data, error } = await supabase.functions.invoke('plan-payment', {
          body: {
            plan: planKey,
            paymentMethod: 'stripe',
            amount: SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS].price,
            currency: 'EUR'
          }
        });

        if (error) throw error;

        if (data.url) {
          // Ouvrir Stripe Checkout dans un nouvel onglet
          window.open(data.url, '_blank');
        } else {
          throw new Error('URL de paiement non reçue');
        }
      }
    } catch (error: any) {
      console.error('Error changing plan:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de changer de plan",
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  const PlanCard = ({ planKey, plan, isSelected }: any) => {
    const Icon = plan.icon;
    const isLoadingThis = loading === planKey;

    return (
      <Card 
        className={`relative transition-all duration-200 ${
          isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
        } ${plan.popular ? 'border-2 border-primary' : ''}`}
      >
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground px-3 py-1">
              Plus populaire
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${plan.color} mb-4`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          
          <CardTitle className="text-xl">{plan.name}</CardTitle>
          
          <div className="space-y-1">
            <div className="text-3xl font-bold">
              {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
            </div>
            {plan.price > 0 && (
              <CardDescription>/mois</CardDescription>
            )}
          </div>

          {isSelected && (
            <Badge variant="outline" className="mx-auto">
              Plan actuel
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Produits autorisés
            </p>
            <p className="text-lg font-semibold">
              {typeof plan.maxProducts === 'number' ? `${plan.maxProducts} max` : plan.maxProducts}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-green-600">✓ Inclus :</h4>
            <ul className="space-y-2">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {plan.limitations.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-red-600">✗ Limitations :</h4>
              <ul className="space-y-2">
                {plan.limitations.map((limitation: string, index: number) => (
                  <li key={index} className="flex items-start text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button 
            className="w-full"
            variant={isSelected ? 'outline' : 'default'}
            onClick={() => handlePlanSelection(planKey)}
            disabled={isLoadingThis || isSelected}
          >
            {isLoadingThis ? (
              'Traitement...'
            ) : isSelected ? (
              'Plan actuel'
            ) : plan.price === 0 ? (
              'Passer au gratuit'
            ) : (
              <>
                Passer à {plan.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choisissez votre plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sélectionnez le plan qui correspond le mieux à vos besoins. 
          Vous pouvez changer de plan à tout moment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
          <PlanCard
            key={key}
            planKey={key}
            plan={plan}
            isSelected={currentPlan === key}
          />
        ))}
      </div>

      <div className="text-center space-y-4 pt-8 border-t">
        <h3 className="text-lg font-semibold">Questions fréquentes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-2">Puis-je changer de plan à tout moment ?</h4>
            <p className="text-muted-foreground">
              Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. 
              Les changements prennent effet immédiatement.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Que se passe-t-il si je dépasse la limite de produits ?</h4>
            <p className="text-muted-foreground">
              Pour le plan Basic, vous devrez passer à un plan supérieur pour ajouter plus de produits. 
              Les plans Standard et Premium n'ont pas de limite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}