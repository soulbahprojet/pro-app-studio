import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import {
  Truck,
  MapPin,
  Clock,
  Package,
  Bike,
  Store,
  Navigation,
  Phone,
  Calculator,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  estimatedTime: string;
  baseFee: number;
  pricePerKm: number;
  available: boolean;
  features: string[];
}

interface DeliveryAddress {
  id: string;
  name: string;
  fullAddress: string;
  phone: string;
  isDefault: boolean;
  coordinates?: { lat: number; lng: number };
}

interface ClientDeliveryProps {
  orderTotal: number;
  onDeliverySelection: (option: DeliveryOption, address: DeliveryAddress, fee: number) => void;
  onTrackOrder: (orderId: string) => void;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'home_delivery',
    name: 'Livraison à domicile',
    description: 'Livraison directement à votre domicile',
    icon: Truck,
    estimatedTime: '2-4 heures',
    baseFee: 15000,
    pricePerKm: 1000,
    available: true,
    features: ['Suivi GPS', 'Confirmation par SMS', 'Paiement sécurisé']
  },
  {
    id: 'pickup_point',
    name: 'Point de retrait',
    description: 'Récupération dans un point de retrait proche',
    icon: Store,
    estimatedTime: '1-2 heures',
    baseFee: 5000,
    pricePerKm: 0,
    available: true,
    features: ['Gratuit dans la zone', 'Horaires flexibles', 'Stockage 48h']
  },
  {
    id: 'taxi_moto',
    name: 'Taxi-moto express',
    description: 'Livraison rapide par taxi-moto',
    icon: Bike,
    estimatedTime: '30-60 minutes',
    baseFee: 25000,
    pricePerKm: 2000,
    available: true,
    features: ['Très rapide', 'Suivi temps réel', 'Pour petits colis']
  },
  {
    id: 'scheduled',
    name: 'Livraison programmée',
    description: 'Choisissez votre créneau de livraison',
    icon: Clock,
    estimatedTime: 'Selon créneau',
    baseFee: 20000,
    pricePerKm: 1500,
    available: true,
    features: ['Créneau au choix', 'Confirmation 1h avant', 'Priorité livreur']
  }
];

const ClientDelivery: React.FC<ClientDeliveryProps> = ({
  orderTotal,
  onDeliverySelection,
  onTrackOrder
}) => {
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [estimatedDistance, setEstimatedDistance] = useState(5); // km
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [newAddress, setNewAddress] = useState({
    name: '',
    fullAddress: '',
    phone: ''
  });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [activeOrders, setActiveOrders] = useState([
    {
      id: 'ORD-001',
      status: 'in_transit',
      driver: { name: 'Mamadou Diallo', phone: '+224 628 12 34 56' },
      estimatedArrival: '15 min',
      currentLocation: 'Kaloum - Route du Niger'
    }
  ]);

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    calculateDeliveryFee();
  }, [selectedOption, estimatedDistance]);

  const loadAddresses = () => {
    // Simulation des adresses enregistrées
    const mockAddresses: DeliveryAddress[] = [
      {
        id: '1',
        name: 'Domicile',
        fullAddress: 'Quartier Almamya, Commune de Kaloum, Conakry',
        phone: '+224 628 12 34 56',
        isDefault: true,
        coordinates: { lat: 9.5370, lng: -13.6785 }
      },
      {
        id: '2',
        name: 'Bureau',
        fullAddress: 'Immeuble Mama Yemo, Kaloum, Conakry',
        phone: '+224 628 12 34 56',
        isDefault: false,
        coordinates: { lat: 9.5320, lng: -13.6790 }
      }
    ];
    setAddresses(mockAddresses);
    
    // Sélectionner l'adresse par défaut
    const defaultAddress = mockAddresses.find(addr => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress.id);
    }
  };

  const calculateDeliveryFee = () => {
    const option = deliveryOptions.find(opt => opt.id === selectedOption);
    if (option) {
      const fee = option.baseFee + (option.pricePerKm * estimatedDistance);
      setDeliveryFee(fee);
    }
  };

  const formatPrice = (price: number, currency: string = 'GNF') => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const handleAddAddress = () => {
    if (!newAddress.name || !newAddress.fullAddress) {
      toast({
        title: "Informations incomplètes",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    const address: DeliveryAddress = {
      id: Date.now().toString(),
      name: newAddress.name,
      fullAddress: newAddress.fullAddress,
      phone: newAddress.phone,
      isDefault: addresses.length === 0
    };

    setAddresses(prev => [...prev, address]);
    setSelectedAddress(address.id);
    setNewAddress({ name: '', fullAddress: '', phone: '' });
    setShowAddAddress(false);

    toast({
      title: "Adresse ajoutée",
      description: "Votre nouvelle adresse a été enregistrée"
    });
  };

  const handleConfirmDelivery = () => {
    if (!selectedOption || !selectedAddress) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez choisir une option de livraison et une adresse",
        variant: "destructive"
      });
      return;
    }

    const option = deliveryOptions.find(opt => opt.id === selectedOption);
    const address = addresses.find(addr => addr.id === selectedAddress);

    if (option && address) {
      onDeliverySelection(option, address, deliveryFee);
      toast({
        title: "Livraison confirmée",
        description: `Votre commande sera livrée via ${option.name}`
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Suivi des commandes en cours */}
      {activeOrders.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Navigation className="w-5 h-5" />
              Suivi en temps réel
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-white rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-semibold">Commande {order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.currentLocation}</p>
                    <p className="text-sm font-medium text-green-600">
                      Arrivée estimée: {order.estimatedArrival}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Button variant="outline" size="sm" onClick={() => onTrackOrder(order.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Suivre
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Livreur: {order.driver.name}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Options de livraison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Choisir le mode de livraison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-4">
            {deliveryOptions.map((option) => {
              const IconComponent = option.icon;
              const optionFee = option.baseFee + (option.pricePerKm * estimatedDistance);
              
              return (
                <div 
                  key={option.id}
                  className={`flex items-start space-x-4 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 ${
                    selectedOption === option.id ? 'border-primary bg-primary/5' : ''
                  } ${!option.available ? 'opacity-50' : ''}`}
                >
                  <RadioGroupItem 
                    value={option.id} 
                    id={option.id} 
                    disabled={!option.available}
                  />
                  <Label htmlFor={option.id} className="cursor-pointer flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-semibold">{option.name}</p>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(optionFee)}</p>
                        <p className="text-xs text-muted-foreground">{option.estimatedTime}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {option.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Estimation des frais */}
      {selectedOption && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Estimation des frais de livraison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="distance">Distance estimée (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  value={estimatedDistance}
                  onChange={(e) => setEstimatedDistance(Number(e.target.value) || 0)}
                  min={1}
                  max={50}
                />
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  Calculer automatiquement
                </Button>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Frais de base:</span>
                <span>{formatPrice(deliveryOptions.find(opt => opt.id === selectedOption)?.baseFee || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Distance ({estimatedDistance}km):</span>
                <span>{formatPrice((deliveryOptions.find(opt => opt.id === selectedOption)?.pricePerKm || 0) * estimatedDistance)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total livraison:</span>
                <span className="text-primary">{formatPrice(deliveryFee)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adresses de livraison */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Adresse de livraison
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAddAddress(!showAddAddress)}
            >
              Ajouter une adresse
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAddAddress && (
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <h4 className="font-semibold">Nouvelle adresse</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addressName">Nom de l'adresse *</Label>
                  <Input
                    id="addressName"
                    placeholder="Ex: Domicile, Bureau..."
                    value={newAddress.name}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="addressPhone">Téléphone</Label>
                  <Input
                    id="addressPhone"
                    placeholder="+224 628 12 34 56"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="fullAddress">Adresse complète *</Label>
                <Input
                  id="fullAddress"
                  placeholder="Quartier, commune, ville..."
                  value={newAddress.fullAddress}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, fullAddress: e.target.value }))}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddAddress}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Enregistrer
                </Button>
                <Button variant="outline" onClick={() => setShowAddAddress(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}

          <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
            {addresses.map((address) => (
              <div 
                key={address.id}
                className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-accent/50 ${
                  selectedAddress === address.id ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <RadioGroupItem value={address.id} id={address.id} />
                <Label htmlFor={address.id} className="cursor-pointer flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold">{address.name}</p>
                    {address.isDefault && (
                      <Badge variant="outline" className="text-xs">Par défaut</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{address.fullAddress}</p>
                  {address.phone && (
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {address.phone}
                    </p>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Récapitulatif final */}
      {selectedOption && selectedAddress && (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif de livraison</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mode de livraison</p>
                <p className="font-semibold">
                  {deliveryOptions.find(opt => opt.id === selectedOption)?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temps estimé</p>
                <p className="font-semibold">
                  {deliveryOptions.find(opt => opt.id === selectedOption)?.estimatedTime}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Adresse de livraison</p>
              <p className="font-semibold">
                {addresses.find(addr => addr.id === selectedAddress)?.fullAddress}
              </p>
            </div>

            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total commande</p>
                <p className="font-bold">{formatPrice(orderTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frais de livraison</p>
                <p className="font-bold text-primary">{formatPrice(deliveryFee)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total final</p>
                <p className="font-bold text-xl">{formatPrice(orderTotal + deliveryFee)}</p>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleConfirmDelivery}>
              <Truck className="w-5 h-5 mr-2" />
              Confirmer la livraison
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientDelivery;
