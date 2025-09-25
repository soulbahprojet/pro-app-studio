import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Wallet, Smartphone, Globe, DollarSign, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethodSelectorProps {
  selectedPlan: string;
  currentPlan: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedPlan,
  currentPlan,
  onClose,
  onSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const { toast } = useToast();

  const planPrices = {
    basic: { amount: 0, currency: 'EUR' },
    pro: { amount: 29, currency: 'EUR' },
    enterprise: { amount: 99, currency: 'EUR' }
  };

  const planNames = {
    basic: 'Basic',
    pro: 'Pro',
    enterprise: 'Enterprise'
  };

  const currentPrice = planPrices[selectedPlan as keyof typeof planPrices];

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Carte Bancaire',
      icon: CreditCard,
      description: 'Visa, MasterCard, American Express',
      status: 'active',
      fees: 'Frais: 2.9% + 0.30€'
    },
    {
      id: 'wallet',
      name: 'Wallet Interne',
      icon: Wallet,
      description: 'Utilisez le solde de votre wallet',
      status: 'active',
      fees: 'Aucun frais'
    },
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: Smartphone,
      description: 'Paiement mobile Orange',
      status: 'coming_soon',
      fees: 'Frais selon Orange'
    },
    {
      id: 'mobile_money',
      name: 'Mobile Money',
      icon: Smartphone,
      description: 'MTN Mobile Money, Moov Money',
      status: 'coming_soon',
      fees: 'Frais selon opérateur'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: Globe,
      description: 'Paiement sécurisé PayPal',
      status: 'coming_soon',
      fees: 'Frais: 3.4% + 0.35€'
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un moyen de paiement",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setPaymentResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('plan-payment', {
        body: {
          plan: selectedPlan,
          paymentMethod: selectedMethod,
          amount: currentPrice.amount,
          currency: currentPrice.currency
        }
      });

      if (error) throw error;

      setPaymentResult(data);

      if (data.success) {
        toast({
          title: "Paiement réussi !",
          description: data.message || "Votre abonnement a été mis à jour avec succès.",
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else if (data.paymentUrl) {
        // Ouvrir Stripe dans un nouvel onglet
        window.open(data.paymentUrl, '_blank');
        toast({
          title: "Redirection",
          description: "Redirection vers la page de paiement...",
        });
      } else {
        toast({
          title: "Information",
          description: data.message || "Paiement en cours de traitement",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur de paiement",
        description: error.message || "Une erreur est survenue lors du paiement",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'coming_soon': return <Clock className="w-4 h-4 text-orange-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const handleBasicPlanActivation = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('plan-payment', {
        body: {
          plan: 'basic',
          paymentMethod: 'free',
          amount: 0,
          currency: 'EUR'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Abonnement activé !",
          description: data.message || "Votre forfait Basic a été activé avec succès.",
        });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Basic plan activation error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'activation du forfait",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedPlan === 'basic') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Forfait Gratuit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              Le forfait Basic est gratuit ! Votre compte sera automatiquement mis à jour.
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1" disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={handleBasicPlanActivation} className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2" />
                  Activation...
                </>
              ) : (
                'Confirmer'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Paiement - Forfait {planNames[selectedPlan as keyof typeof planNames]}
        </CardTitle>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">
            {currentPrice.amount}€/{currentPrice.currency}
          </span>
          <Badge variant="outline">Mensuel</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {paymentResult && (
          <Alert className={paymentResult.success ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
            <AlertDescription>
              {paymentResult.message}
              {paymentResult.instructions && (
                <div className="mt-2 p-2 bg-background rounded text-sm">
                  {paymentResult.instructions}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h3 className="font-medium mb-3">Choisissez votre moyen de paiement</h3>
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={method.id} 
                    id={method.id}
                    disabled={method.status !== 'active'}
                  />
                  <Label 
                    htmlFor={method.id} 
                    className={`flex-1 cursor-pointer ${method.status !== 'active' ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                      <div className="flex items-center gap-3">
                        <method.icon className="w-5 h-5" />
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {method.name}
                            {getStatusIcon(method.status)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {method.description}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        {method.fees}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <Separator />

        <div className="flex gap-3">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            onClick={handlePayment} 
            className="flex-1"
            disabled={isLoading || !selectedMethod}
          >
            {isLoading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2" />
                Traitement...
              </>
            ) : (
              `Payer ${currentPrice.amount}€`
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Paiement sécurisé • Votre abonnement sera actif immédiatement
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodSelector;