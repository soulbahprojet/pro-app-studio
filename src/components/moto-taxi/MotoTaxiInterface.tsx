import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Bike,
  MapPin, 
  Clock, 
  MessageSquare, 
  Wallet, 
  Settings,
  Navigation,
  CheckCircle,
  AlertCircle,
  History,
  LogOut
} from 'lucide-react';

interface MissionStats {
  activeMissions: number;
  completedToday: number;
  totalEarnings: number;
  avgRating: number;
}

const MotoTaxiInterface: React.FC = () => {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('missions');
  const [status, setStatus] = useState<'available' | 'busy' | 'offline'>('available');
  
  // Données simulées moto-taxi
  const missionStats: MissionStats = {
    activeMissions: 2,
    completedToday: 8,
    totalEarnings: 125000,
    avgRating: 4.8
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Composant Missions
  const MissionsTab = () => (
    <div className="space-y-6">
      {/* Statut conducteur */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Statut Conducteur</span>
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
                <AlertCircle className="w-4 h-4 mr-1" />
                Occupé
              </Button>
              <Button
                size="sm"
                variant={status === 'offline' ? 'destructive' : 'outline'}
                onClick={() => setStatus('offline')}
              >
                Hors ligne
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{missionStats.activeMissions}</p>
              <p className="text-sm text-muted-foreground">Missions actives</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{missionStats.completedToday}</p>
              <p className="text-sm text-muted-foreground">Terminées aujourd'hui</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-500">{formatCurrency(missionStats.totalEarnings)}</p>
              <p className="text-sm text-muted-foreground">Gains du jour</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-500">{missionStats.avgRating}/5</p>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Missions en cours */}
      <Card>
        <CardHeader>
          <CardTitle>Missions en cours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="default">En cours</Badge>
              <span className="text-sm text-muted-foreground">15min - 2.5km</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="text-sm">Départ: Kaloum, Conakry</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="text-sm">Arrivée: Matam, Conakry</span>
              </div>
            </div>
            <div className="flex space-x-2 mt-3">
              <Button size="sm">
                <Navigation className="w-4 h-4 mr-1" />
                GPS
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
      <h2 className="text-xl font-bold">Navigation GPS</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            GPS en temps réel, ETA, itinéraires optimisés
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Historique
  const HistoryTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Historique des courses</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Historique complet des missions effectuées
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
            Communications avec les clients
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Portefeuille
  const WalletTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Portefeuille Moto-Taxi</h2>
      
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
            Configuration profil, zones de travail, préférences
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'missions':
        return <MissionsTab />;
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
        return <MissionsTab />;
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
      {/* Header moto-taxi */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <Bike className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Moto-Taxi</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.full_name || 'Conducteur'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <Badge variant="outline">MOTO-TAXI</Badge>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="ml-2"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-4 pb-20">
        {renderContent()}
      </div>

      {/* Footer fixe moto-taxi */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-6 gap-0">
            <button
              onClick={() => setActiveTab('missions')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'missions' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Bike className="w-5 h-5 mb-1" />
              <span>Missions</span>
              {missionStats.activeMissions > 0 && (
                <div className="absolute top-1 right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {missionStats.activeMissions}
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

export default MotoTaxiInterface;
