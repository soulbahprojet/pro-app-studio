import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Truck, 
  Bike, 
  Globe, 
  Package, 
  ShoppingCart,
  User,
  MapPin,
  CreditCard,
  MessageSquare,
  Settings
} from 'lucide-react';

export default function QuickAccess() {
  const { profile } = useAuth();

  const getDashboardConfig = () => {
    switch (profile?.role) {
      case 'courier':
        return {
          title: 'Interface Livreur',
          description: 'Gestion des livraisons locales',
          icon: Truck,
          link: '/courier-dashboard',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          features: ['📦 Missions de livraison', '🗺️ Navigation GPS', '📱 Mode hors ligne', '💰 Suivi des gains']
        };
      case 'taxi_moto':
        return {
          title: 'Interface Taxi Moto',
          description: 'Transport de personnes',
          icon: Bike,
          link: '/moto-dashboard',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          features: ['🚕 Réservations temps réel', '💳 Paiements intégrés', '⭐ Évaluations clients', '📍 Suivi trajet GPS']
        };
      case 'transitaire':
        return {
          title: 'Interface Transitaire',
          description: 'Logistique internationale',
          icon: Globe,
          link: '/freight-dashboard',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          features: ['🏢 Multi-entrepôts', '📱 Scan QR colis', '👥 Gestion employés', '📊 Rapports avancés']
        };
      case 'seller':
        return {
          title: 'Interface Vendeur',
          description: 'Gestion boutique et ventes',
          icon: Package,
          link: '/seller-dashboard',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          features: ['🏪 Gestion boutique', '📦 Inventaire', '💰 Commandes', '📈 Statistiques']
        };
      default:
        return {
          title: 'Espace Client',
          description: 'Achats et commandes',
          icon: User,
          link: '/profile-dashboard',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          features: ['🛒 Commandes', '❤️ Favoris', '📦 Suivi livraisons', '💬 Messages']
        };
    }
  };

  const config = getDashboardConfig();
  const IconComponent = config.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Interface principale */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${config.bgColor}`}>
              <IconComponent className={`w-8 h-8 ${config.color}`} />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {config.title}
                {(profile as any)?.vest_number && (
                  <Badge variant="outline">#{(profile as any).vest_number}</Badge>
                )}
              </CardTitle>
              <CardDescription>{config.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Fonctionnalités */}
          <div className="grid grid-cols-2 gap-2">
            {config.features.map((feature, index) => (
              <div key={index} className="text-sm text-muted-foreground">
                {feature}
              </div>
            ))}
          </div>
          
          {/* Bouton d'accès */}
          <Button asChild className="w-full">
            <Link to={config.link}>
              <IconComponent className="w-4 h-4 mr-2" />
              Accéder à l'interface
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/marketplace">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Marketplace
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/wallet">
              <CreditCard className="w-4 h-4 mr-2" />
              Portefeuille
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/messages">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/order-tracking">
              <MapPin className="w-4 h-4 mr-2" />
              Suivi Colis
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link to="/profile-dashboard">
              <Settings className="w-4 h-4 mr-2" />
              Paramètres
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
