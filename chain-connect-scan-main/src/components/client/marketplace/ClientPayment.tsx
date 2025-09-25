import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Smartphone,
  QrCode,
  Receipt,
  Shield,
  CheckCircle,
  AlertCircle,
  Download,
  ArrowLeft,
  Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'mobile_money' | 'card' | 'merchant_code' | 'wallet';
  icon: React.ElementType;
  description: string;
  fees: number;
  available: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currency: string;
}

interface ClientPaymentProps {
  cartItems: CartItem[];
  subtotal: number;
  onPaymentComplete: (paymentData: any) => void;
  onGoBack: () => void;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'orange_money',
    name: 'Orange Money',
    type: 'mobile_money',
    icon: Smartphone,
    description: 'Paiement via Orange Money Guinée',
    fees: 0.02, // 2%
    available: true
  },
  {
    id: 'mtn_money',
    name: 'MTN Mobile Money',
    type: 'mobile_money',
    icon: Smartphone,
    description: 'Paiement via MTN Money',
    fees: 0.025, // 2.5%
    available: true
  },
  {
    id: 'moov_money',
    name: 'Moov Money',
    type: 'mobile_money',
    icon: Smartphone,
    description: 'Paiement via Moov Money',
    fees: 0.02, // 2%
    available: true
  },
  {
    id: 'visa_card',
    name: 'Carte Visa',
    type: 'card',
    icon: CreditCard,
    description: 'Paiement par carte bancaire internationale',
    fees: 0.035, // 3.5%
    available: true
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    type: 'card',
    icon: CreditCard,
    description: 'Paiement par carte Mastercard',
    fees: 0.035, // 3.5%
    available: true
  },
  {
    id: 'merchant_code',
    name: 'Code Marchand',
    type: 'merchant_code',
    icon: QrCode,
    description: 'Paiement sur place avec code de validation',
    fees: 0, // Gratuit
    available: true
  },
  {
    id: 'wallet_balance',
    name: 'Solde Portefeuille',
    type: 'wallet',
    icon: Wallet,
    description: 'Utiliser le solde de votre portefeuille 224Solutions',
    fees: 0, // Gratuit
    available: true
  }
];

const ClientPayment: React.FC<ClientPaymentProps> = ({
  cartItems,
  subtotal,
  onPaymentComplete,
  onGoBack
}) => {
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  });
  const [processing, setProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [invoice, setInvoice] = useState<any>(null);
  const [walletBalance] = useState(1250000); // Simulation du solde portefeuille

  const calculateFees = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    return method ? subtotal * method.fees : 0;
  };

  const calculateTotal = () => {
    const fees = selectedPaymentMethod ? calculateFees(selectedPaymentMethod) : 0;
    return subtotal + fees;
  };

  const formatPrice = (price: number, currency: string = 'GNF') => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const generateInvoice = () => {
    return {
      number: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      items: cartItems,
      subtotal,
      fees: calculateFees(selectedPaymentMethod),
      total: calculateTotal(),
      paymentMethod: paymentMethods.find(m => m.id === selectedPaymentMethod)?.name,
      status: 'paid'
    };
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "Méthode de paiement requise",
        description: "Veuillez sélectionner une méthode de paiement",
        variant: "destructive"
      });
      return;
    }

    const method = paymentMethods.find(m => m.id === selectedPaymentMethod);
    if (!method) return;

    // Validation des champs selon la méthode
    if (method.type === 'mobile_money' && !paymentDetails.phoneNumber) {
      toast({
        title: "Numéro requis",
        description: "Veuillez saisir votre numéro de téléphone",
        variant: "destructive"
      });
      return;
    }

    if (method.type === 'card' && (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv)) {
      toast({
        title: "Informations carte incomplètes",
        description: "Veuillez remplir tous les champs de la carte",
        variant: "destructive"
      });
      return;
    }

    if (method.type === 'wallet' && walletBalance < calculateTotal()) {
      toast({
        title: "Solde insuffisant",
        description: "Votre solde portefeuille est insuffisant",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      // Simulation du processus de paiement
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const invoiceData = generateInvoice();
      setInvoice(invoiceData);
      setPaymentComplete(true);
      
      toast({
        title: "Paiement réussi !",
        description: "Votre commande a été confirmée et votre facture générée"
      });

      onPaymentComplete({
        ...invoiceData,
        paymentMethod: method
      });

    } catch (error) {
      toast({
        title: "Erreur de paiement",
        description: "Le paiement a échoué. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadInvoice = () => {
    // Simulation du téléchargement de facture
    const invoiceContent = `
FACTURE ÉLECTRONIQUE - 224Solutions
=====================================
Numéro: ${invoice.number}
Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}

ARTICLES:
${invoice.items.map((item: CartItem) => 
  `- ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
).join('\n')}

RÉSUMÉ:
Sous-total: ${formatPrice(invoice.subtotal)}
Frais: ${formatPrice(invoice.fees)}
TOTAL: ${formatPrice(invoice.total)}

Méthode: ${invoice.paymentMethod}
Statut: ${invoice.status.toUpperCase()}

Merci pour votre confiance !
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture-${invoice.number}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Facture téléchargée",
      description: "La facture a été téléchargée avec succès"
    });
  };

  if (paymentComplete && invoice) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Paiement réussi !</h2>
            <p className="text-green-700">
              Votre commande a été confirmée et votre facture électronique est prête
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Facture électronique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">Facture N° {invoice.number}</p>
                <p className="text-sm text-muted-foreground">
                  Générée le {new Date(invoice.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800">Payée</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total:</span>
                <span>{formatPrice(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frais de traitement:</span>
                <span>{formatPrice(invoice.fees)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total payé:</span>
                <span className="text-green-600">{formatPrice(invoice.total)}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button onClick={downloadInvoice} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Télécharger la facture
              </Button>
              <Button variant="outline" onClick={onGoBack}>
                Retour au marketplace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onGoBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Paiement & Facturation
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Récapitulatif de commande */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif de votre commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between">
            <span>Sous-total:</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {selectedPaymentMethod && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Frais de traitement:</span>
              <span>{formatPrice(calculateFees(selectedPaymentMethod))}</span>
            </div>
          )}
          <hr />
          <div className="flex justify-between font-bold text-lg">
            <span>Total à payer:</span>
            <span className="text-primary">{formatPrice(calculateTotal())}</span>
          </div>
        </CardContent>
      </Card>

      {/* Méthodes de paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Choisissez votre méthode de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedPaymentMethod} 
            onValueChange={setSelectedPaymentMethod}
            className="space-y-3"
          >
            {paymentMethods.map((method) => {
              const IconComponent = method.icon;
              const fees = calculateFees(method.id);
              const isWalletInsufficient = method.type === 'wallet' && walletBalance < calculateTotal();
              
              return (
                <div 
                  key={method.id} 
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 ${
                    selectedPaymentMethod === method.id ? 'border-primary bg-primary/5' : ''
                  } ${!method.available || isWalletInsufficient ? 'opacity-50' : ''}`}
                >
                  <RadioGroupItem 
                    value={method.id} 
                    id={method.id} 
                    disabled={!method.available || isWalletInsufficient}
                  />
                  <Label htmlFor={method.id} className="flex items-center space-x-3 cursor-pointer flex-1">
                    <IconComponent className="w-6 h-6 text-primary" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{method.name}</p>
                        {fees > 0 && (
                          <Badge variant="outline" className="text-xs">
                            +{formatPrice(fees)} frais
                          </Badge>
                        )}
                        {method.id === 'wallet_balance' && (
                          <Badge variant="outline" className="text-xs">
                            Solde: {formatPrice(walletBalance)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      {isWalletInsufficient && (
                        <p className="text-xs text-red-600">Solde insuffisant</p>
                      )}
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Détails de paiement */}
      {selectedPaymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle>Informations de paiement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.find(m => m.id === selectedPaymentMethod)?.type === 'mobile_money' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  id="phone"
                  placeholder="Ex: 628 12 34 56"
                  value={paymentDetails.phoneNumber}
                  onChange={(e) => setPaymentDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Vous recevrez un code de confirmation par SMS
                </p>
              </div>
            )}

            {paymentMethods.find(m => m.id === selectedPaymentMethod)?.type === 'card' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Date d'expiration</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentDetails.cvv}
                      onChange={(e) => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardName">Nom sur la carte</Label>
                  <Input
                    id="cardName"
                    placeholder="Nom du titulaire"
                    value={paymentDetails.cardHolderName}
                    onChange={(e) => setPaymentDetails(prev => ({ ...prev, cardHolderName: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {paymentMethods.find(m => m.id === selectedPaymentMethod)?.type === 'merchant_code' && (
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-blue-800 mb-2">Code marchand</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Un code de validation vous sera fourni après confirmation. 
                  Présentez ce code au vendeur lors du retrait.
                </p>
                <Badge className="bg-blue-100 text-blue-800">
                  Paiement à effectuer sur place
                </Badge>
              </div>
            )}

            {paymentMethods.find(m => m.id === selectedPaymentMethod)?.type === 'wallet' && (
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <Wallet className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-800 mb-2">Paiement par portefeuille</h3>
                <p className="text-sm text-green-700 mb-2">
                  Solde disponible: {formatPrice(walletBalance)}
                </p>
                <p className="text-sm text-green-700">
                  Montant à débiter: {formatPrice(calculateTotal())}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sécurité */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">Paiement sécurisé</p>
              <p className="text-sm text-green-700">
                Vos informations sont protégées et chiffrées. 
                Une facture électronique sera générée automatiquement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bouton de paiement */}
      <Card>
        <CardContent className="p-6">
          <Button
            className="w-full"
            size="lg"
            onClick={handlePayment}
            disabled={!selectedPaymentMethod || processing}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Traitement en cours...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Payer {formatPrice(calculateTotal())}
              </>
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground mt-2">
            En cliquant sur "Payer", vous acceptez nos conditions de vente
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientPayment;