import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock,
  Package,
  Plus,
  Edit,
  Trash2,
  Shield,
  Bell,
  Settings
} from 'lucide-react';

interface Address {
  id: string;
  name: string;
  fullAddress: string;
  phone: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money';
  name: string;
  details: string;
  isDefault: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  total: number;
  currency: string;
  itemsCount: number;
}

const ClientProfile: React.FC = () => {
  const [profile, setProfile] = useState({
    fullName: 'Amadou Diallo',
    email: 'amadou.diallo@email.com',
    phone: '+224 628 12 34 56',
    country: 'Guinée',
    city: 'Conakry'
  });

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Domicile',
      fullAddress: 'Quartier Almamya, Commune de Kaloum, Conakry',
      phone: '+224 628 12 34 56',
      isDefault: true
    },
    {
      id: '2',
      name: 'Bureau',
      fullAddress: 'Immeuble Mama Yemo, Centre-ville, Conakry',
      phone: '+224 628 12 34 56',
      isDefault: false
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'mobile_money',
      name: 'Orange Money',
      details: '**** **** 1234',
      isDefault: true
    },
    {
      id: '2',
      type: 'card',
      name: 'Visa',
      details: '**** **** **** 5678',
      isDefault: false
    }
  ]);

  const [orderHistory, setOrderHistory] = useState<Order[]>([
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      date: '15 Jan 2024',
      status: 'Livré',
      total: 450000,
      currency: 'GNF',
      itemsCount: 2
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      date: '10 Jan 2024',
      status: 'En transit',
      total: 125000,
      currency: 'GNF',
      itemsCount: 1
    }
  ]);

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletters: false,
    sms: true
  });

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Livré': 'bg-green-100 text-green-800',
      'En transit': 'bg-blue-100 text-blue-800',
      'En attente': 'bg-yellow-100 text-yellow-800',
      'Annulé': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête profil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Mon Espace Client
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{profile.fullName}</h3>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {profile.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {profile.city}, {profile.country}
                </span>
              </div>
            </div>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="addresses">Adresses</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        {/* Historique des commandes */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Historique des commandes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderHistory.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{order.orderNumber}</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.itemsCount} article{order.itemsCount > 1 ? 's' : ''} • {order.date}
                      </p>
                      <p className="font-bold text-primary">
                        {formatPrice(order.total, order.currency)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <div className="mt-2">
                      <Button variant="outline" size="sm">
                        Détails
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adresses */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Mes adresses
                </CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{address.name}</h4>
                        {address.isDefault && (
                          <Badge variant="secondary">Par défaut</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-1">{address.fullAddress}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {address.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Moyens de paiement */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Moyens de paiement
                </CardTitle>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{method.name}</h4>
                          {method.isDefault && (
                            <Badge variant="secondary">Défaut</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{method.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Préférences de notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Mises à jour des commandes</h4>
                    <p className="text-sm text-muted-foreground">
                      Notifications sur le statut de vos commandes
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {notifications.orderUpdates ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Promotions et offres</h4>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les dernières offres spéciales
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {notifications.promotions ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifications SMS</h4>
                    <p className="text-sm text-muted-foreground">
                      Recevoir les notifications par SMS
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    {notifications.sms ? 'Activé' : 'Désactivé'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Sécurité du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Mot de passe</h4>
                    <p className="text-sm text-muted-foreground">
                      Dernière modification il y a 30 jours
                    </p>
                  </div>
                  <Button variant="outline">Modifier</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Authentification à deux facteurs</h4>
                    <p className="text-sm text-muted-foreground">
                      Protection supplémentaire pour votre compte
                    </p>
                  </div>
                  <Button variant="outline">Configurer</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Sessions actives</h4>
                    <p className="text-sm text-muted-foreground">
                      Gérer vos connexions actives
                    </p>
                  </div>
                  <Button variant="outline">Voir</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientProfile;
