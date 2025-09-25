import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Download,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentScreenProps {
  shipmentId: string;
  totalCost: number;
  currency: string;
  onPaymentComplete: () => void;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  available: boolean;
  processingFee?: number;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Carte de crédit',
    icon: CreditCard,
    description: 'Visa, Mastercard, American Express',
    available: true,
    processingFee: 2.9
  },
  {
    id: 'wallet',
    name: 'Portefeuille 224Solutions',
    icon: Wallet,
    description: 'Utilisez le solde de votre portefeuille',
    available: true,
    processingFee: 0
  },
  {
    id: 'mobile_money',
    name: 'Mobile Money',
    icon: Smartphone,
    description: 'Orange Money, MTN Mobile Money',
    available: true,
    processingFee: 1.5
  }
];

export default function InternationalPaymentScreen({ 
  shipmentId, 
  totalCost, 
  currency, 
  onPaymentComplete 
}: PaymentScreenProps) {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('wallet', {
        body: { action: 'getBalance', currency }
      });

      if (error) throw error;
      setWalletBalance(data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const calculateTotalWithFees = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method || !method.processingFee) return totalCost;
    
    const fee = (totalCost * method.processingFee) / 100;
    return totalCost + fee;
  };

  const processPayment = async () => {
    if (!selectedMethod) {
      toast({
        title: "Méthode de paiement requise",
        description: "Veuillez sélectionner une méthode de paiement",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const finalAmount = calculateTotalWithFees(selectedMethod);

      // Check wallet balance if using wallet
      if (selectedMethod === 'wallet' && walletBalance < finalAmount) {
        toast({
          title: "Solde insuffisant",
          description: `Votre solde (${walletBalance} ${currency}) est insuffisant pour ce paiement (${finalAmount} ${currency})`,
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('plan-payment', {
        body: {
          shipmentId,
          amount: finalAmount,
          currency,
          paymentMethod: selectedMethod,
          description: `Paiement expédition internationale`
        }
      });

      if (error) throw error;

      setPaymentResult(data);

      if (data.success) {
        // Update shipment payment status
        await supabase
          .from('shipment_payments')
          .update({
            payment_status: 'completed',
            payment_date: new Date().toISOString(),
            payment_method: selectedMethod,
            transaction_id: data.transactionId
          })
          .eq('shipment_id', shipmentId);

        toast({
          title: "Paiement réussi",
          description: "Votre paiement a été traité avec succès",
          variant: "default"
        });

        onPaymentComplete();
      } else if (data.paymentUrl) {
        // Open Stripe checkout in new tab
        window.open(data.paymentUrl, '_blank');
        
        toast({
          title: "Redirection vers le paiement",
          description: "Vous allez être redirigé vers la page de paiement sécurisée",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur de paiement",
        description: "Une erreur est survenue lors du traitement du paiement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manual-invoice', {
        body: {
          shipmentId,
          amount: totalCost,
          currency,
          type: 'shipping_payment'
        }
      });

      if (error) throw error;

      // Download invoice
      const link = document.createElement('a');
      link.href = data.invoiceUrl;
      link.download = `facture-expedition-${shipmentId}.pdf`;
      link.click();

      toast({
        title: "Facture générée",
        description: "La facture a été téléchargée",
        variant: "default"
      });

    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Paiement de l'expédition
          </CardTitle>
          <CardDescription>
            Choisissez votre méthode de paiement préférée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-3xl font-bold">{totalCost} {currency}</div>
            <div className="text-muted-foreground">Montant à payer</div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h4 className="font-medium">Méthodes de paiement disponibles</h4>
            
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const totalWithFees = calculateTotalWithFees(method.id);
              const isWalletInsufficient = method.id === 'wallet' && walletBalance < totalWithFees;
              
              return (
                <div
                  key={method.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedMethod === method.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:border-primary/50'
                  } ${!method.available || isWalletInsufficient ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (method.available && !isWalletInsufficient) {
                      setSelectedMethod(method.id);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-sm text-muted-foreground">{method.description}</div>
                        {method.id === 'wallet' && (
                          <div className="text-sm text-muted-foreground">
                            Solde disponible: {walletBalance} {currency}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">{totalWithFees} {currency}</div>
                      {method.processingFee && method.processingFee > 0 && (
                        <div className="text-xs text-muted-foreground">
                          +{method.processingFee}% frais
                        </div>
                      )}
                      {isWalletInsufficient && (
                        <Badge variant="destructive" className="text-xs mt-1">
                          Solde insuffisant
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {selectedMethod === method.id && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Méthode sélectionnée</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <Button 
              onClick={processPayment} 
              disabled={loading || !selectedMethod}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Procéder au paiement
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={generateInvoice}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Télécharger la facture
            </Button>
          </div>

          {paymentResult && (
            <div className="mt-6 p-4 rounded-lg bg-muted">
              {paymentResult.success ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Paiement réussi!</span>
                </div>
              ) : paymentResult.error ? (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Erreur de paiement: {paymentResult.error}</span>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  En attente de confirmation du paiement...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informations importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Le paiement doit être effectué avant le traitement de l'expédition</p>
          <p>• Les frais de traitement varient selon la méthode de paiement</p>
          <p>• Un reçu sera envoyé par email après confirmation du paiement</p>
          <p>• En cas de problème, contactez notre service client</p>
        </CardContent>
      </Card>
    </div>
  );
}