import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  ShieldCheck, 
  ArrowLeft, 
  Check,
  Smartphone,
  Building,
  Wallet,
  Lock,
  AlertCircle,
  MapPin,
  Truck,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile' | 'bank' | 'wallet';
  name: string;
  icon: React.ReactNode;
  description: string;
  fees: string;
  isRecommended?: boolean;
}

interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  items: number;
}

export default function Payment() {
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('orange-money');
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: 'Dakar',
    postalCode: '',
    country: 'Sénégal'
  });

  const orderSummary: OrderSummary = {
    subtotal: 89700,
    shipping: 5000,
    tax: 0,
    discount: 8970,
    total: 85730,
    items: 3
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'orange-money',
      type: 'mobile',
      name: 'Orange Money',
      icon: <Smartphone className="text-orange-600" size={24} />,
      description: 'Paiement mobile sécurisé',
      fees: 'Gratuit',
      isRecommended: true
    },
    {
      id: 'wave',
      type: 'mobile', 
      name: 'Wave',
      icon: <Smartphone className="text-blue-600" size={24} />,
      description: 'Paiement mobile instantané',
      fees: 'Gratuit'
    },
    {
      id: 'free-money',
      type: 'mobile',
      name: 'Free Money',
      icon: <Smartphone className="text-purple-600" size={24} />,
      description: 'Portefeuille mobile',
      fees: '1%'
    },
    {
      id: 'visa-card',
      type: 'card',
      name: 'Carte Visa/Mastercard',
      icon: <CreditCard className="text-blue-600" size={24} />,
      description: 'Cartes internationales',
      fees: '2.5%'
    },
    {
      id: 'bank-transfer',
      type: 'bank',
      name: 'Virement bancaire',
      icon: <Building className="text-green-600" size={24} />,
      description: 'Paiement par virement',
      fees: 'Gratuit'
    },
    {
      id: 'wallet',
      type: 'wallet',
      name: 'Portefeuille 224Solutions',
      icon: <Wallet className="text-purple-600" size={24} />,
      description: 'Crédit disponible: 125,000 CFA',
      fees: 'Gratuit'
    }
  ];

  const processPayment = async () => {
    setIsProcessing(true);
    
    // Simulation du traitement
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsProcessing(false);
    
    // Redirection vers une page de confirmation
    alert('Paiement réussi ! Votre commande a été confirmée.');
    navigate('/');
  };

  const renderPaymentForm = () => {
    const selectedMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    
    if (!selectedMethod) return null;

    switch (selectedMethod.type) {
      case 'mobile':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Numéro de téléphone</label>
              <Input
                type="tel"
                placeholder="77 123 45 67"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Smartphone className="text-blue-600" size={16} />
                <span className="text-sm font-medium">Instructions</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                1. Entrez votre numéro de téléphone<br/>
                2. Vous recevrez un code de confirmation<br/>
                3. Saisissez votre code PIN pour valider
              </p>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Numéro de carte</label>
              <Input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Date d'expiration</label>
                <Input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">CVV</label>
                <Input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 'bank':
        return (
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <Building className="text-yellow-600" size={16} />
              <span className="text-sm font-medium">Virement bancaire</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p><strong>Bénéficiaire:</strong> 224Solutions SARL</p>
              <p><strong>Banque:</strong> Banque Atlantique Sénégal</p>
              <p><strong>IBAN:</strong> SN08 BK00 1234 5678 9012 3456 78</p>
              <p><strong>Référence:</strong> CMD-2024-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className="text-green-600" size={16} />
                <span className="text-sm font-medium">Crédit disponible</span>
              </div>
              <span className="text-lg font-bold text-green-600">125,000 CFA</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Solde suffisant pour cette commande
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/cart')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Paiement sécurisé</h1>
          <p className="text-muted-foreground">Finalisez votre commande en toute sécurité</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Formulaire de paiement */}
        <div className="lg:col-span-2 space-y-6">
          {/* Méthodes de paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard size={20} />
                <span>Méthode de paiement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-all
                    ${selectedPaymentMethod === method.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {method.icon}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{method.name}</span>
                          {method.isRecommended && (
                            <Badge className="bg-green-100 text-green-700">Recommandé</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{method.fees}</p>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPaymentMethod === method.id 
                          ? 'border-primary bg-primary' 
                          : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <Check size={12} className="text-white m-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Formulaire de paiement */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              {renderPaymentForm()}
            </CardContent>
          </Card>

          {/* Adresse de facturation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin size={20} />
                <span>Adresse de facturation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Adresse"
                value={billingAddress.street}
                onChange={(e) => setBillingAddress({...billingAddress, street: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Ville"
                  value={billingAddress.city}
                  onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                />
                <Input
                  placeholder="Code postal"
                  value={billingAddress.postalCode}
                  onChange={(e) => setBillingAddress({...billingAddress, postalCode: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Résumé de commande */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total ({orderSummary.items} articles)</span>
                  <span>{orderSummary.subtotal.toLocaleString()} CFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>{orderSummary.shipping.toLocaleString()} CFA</span>
                </div>
                {orderSummary.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Remise</span>
                    <span>-{orderSummary.discount.toLocaleString()} CFA</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{orderSummary.total.toLocaleString()} CFA</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                disabled={isProcessing}
                onClick={processPayment}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <Lock size={16} className="mr-2" />
                    Payer {orderSummary.total.toLocaleString()} CFA
                  </>
                )}
              </Button>

              {/* Informations de sécurité */}
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="text-green-600" size={16} />
                  <span>Paiement 100% sécurisé SSL</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck size={16} />
                  <span>Livraison sous 24-48h</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>Support client 24h/7j</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Garanties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Vos garanties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Check className="text-green-600 mt-0.5" size={16} />
                <span>Remboursement garanti si problème</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="text-green-600 mt-0.5" size={16} />
                <span>Service client réactif</span>
              </div>
              <div className="flex items-start space-x-2">
                <Check className="text-green-600 mt-0.5" size={16} />
                <span>Suivi de livraison en temps réel</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
