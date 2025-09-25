import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck,
  Package, 
  Navigation, 
  MessageSquare, 
  Wallet, 
  Settings,
  MapPin,
  CheckCircle,
  Clock,
  History
} from 'lucide-react';

interface CourierStats {
  activeDeliveries: number;
  completedToday: number;
  totalEarnings: number;
  avgRating: number;
}

const CourierInterface: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('deliveries');
  const [status, setStatus] = useState<'available' | 'busy' | 'offline'>('available');
  
  // Données simulées livreur
  const courierStats: CourierStats = {
    activeDeliveries: 3,
    completedToday: 12,
    totalEarnings: 85000,
    avgRating: 4.9
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Composant Livraisons
  const DeliveriesTab = () => (
    <div className="space-y-6">
      {/* Statut livreur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Statut Livreur</span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={status === 'available' ? 'default' : 'outline'}
                onClick={() => setStatus('available')}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Disponible
              </Button>
              <Button
                size="sm"
                variant={status === 'busy' ? 'default' : 'outline'}
                onClick={() => setStatus('busy')}
              >
                En livraison
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{courierStats.activeDeliveries}</p>
              <p className="text-sm text-muted-foreground">Livraisons actives</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{courierStats.completedToday}</p>
              <p className="text-sm text-muted-foreground">Terminées aujourd'hui</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-500">{formatCurrency(courierStats.totalEarnings)}</p>
              <p className="text-sm text-muted-foreground">Gains du jour</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{courierStats.avgRating}/5</p>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Livraisons en cours */}
      <Card>
        <CardHeader>
          <CardTitle>Livraisons en cours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="default">À récupérer</Badge>
              <span className="text-sm text-muted-foreground">CMD-001234</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Récupération: Boutique XYZ, Kaloum</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm">Livraison: Résidence ABC, Matam</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm">ETA: 25 minutes</span>
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              <Button size="sm">
                <Navigation className="w-4 h-4 mr-1" />
                Itinéraire
              </Button>
              <Button size="sm" variant="outline">
                <MessageSquare className="w-4 h-4 mr-1" />
                Client
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Composant GPS/Navigation
  const GPSTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">GPS & Navigation</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Navigation GPS optimisée, ETA en temps réel
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Historique
  const HistoryTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Historique des livraisons</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Historique complet des livraisons effectuées
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Messagerie
  const MessagesTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Messagerie Client</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Communications avec les clients et vendeurs
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Portefeuille
  const WalletTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Portefeuille Livreur</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Gains, retraits, historique des paiements
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Paramètres
  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Paramètres</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Configuration profil, zones de livraison, véhicule
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'deliveries':
        return <DeliveriesTab />;
      case 'gps':
        return <GPSTab />;
      case 'history':
        return <HistoryTab />;
      case 'messages':
        return <MessagesTab />;
      case 'wallet':
        return <WalletTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DeliveriesTab />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-orange-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header livreur */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <Truck className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Interface Livreur</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.full_name || 'Livreur'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <Badge variant="outline">LIVREUR</Badge>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-4 pb-20">
        {renderContent()}
      </div>

      {/* Footer fixe livreur */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-6 gap-0">
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`flex flex-col items-center justify-center p-3 text-xs relative ${
                activeTab === 'deliveries' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Package className="w-5 h-5 mb-1" />
              <span>Livraisons</span>
              {courierStats.activeDeliveries > 0 && (
                <div className="absolute top-1 right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {courierStats.activeDeliveries}
                </div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('gps')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'gps' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Navigation className="w-5 h-5 mb-1" />
              <span>GPS</span>
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'history' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <History className="w-5 h-5 mb-1" />
              <span>Historique</span>
            </button>
            
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'messages' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <MessageSquare className="w-5 h-5 mb-1" />
              <span>Messages</span>
            </button>
            
            <button
              onClick={() => setActiveTab('wallet')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'wallet' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Wallet className="w-5 h-5 mb-1" />
              <span>Portefeuille</span>
            </button>
            
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'settings' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span>Paramètres</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierInterface;