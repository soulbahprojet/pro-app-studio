import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Truck,
  Package, 
  FileText, 
  MessageSquare, 
  Wallet, 
  Settings,
  Plus,
  Eye,
  MapPin,
  Plane,
  Ship,
  Clock
} from 'lucide-react';

interface TransitaireStats {
  activeShipments: number;
  pendingDocuments: number;
  totalRevenue: number;
  clientMessages: number;
}

const TransitaireInterface: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Données simulées transitaire
  const stats: TransitaireStats = {
    activeShipments: 15,
    pendingDocuments: 8,
    totalRevenue: 2750000,
    clientMessages: 3
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Composant Dashboard
  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord Transitaire</h1>
        <p className="text-muted-foreground">Gestion des expéditions internationales</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeShipments}</p>
                <p className="text-sm text-muted-foreground">Expéditions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{stats.pendingDocuments}</p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wallet className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground">Revenus</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.clientMessages}</p>
                <p className="text-sm text-muted-foreground">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expéditions récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Expéditions en cours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Ship className="w-4 h-4 text-blue-500" />
                <span className="font-medium">EXP-2024-001</span>
              </div>
              <Badge variant="outline">En transit</Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Conakry → Paris → Marseille</p>
              <p>15 colis - 250kg</p>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>ETA: 5 jours</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Expéditions
  const ShipmentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestion des Expéditions</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle expédition
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Création/gestion expéditions, étapes (pickup/transit/douane/livré)
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Documents
  const DocumentsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Documents & Douane</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Documents douane/KYC, certifications, autorisations
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Devis/Factures
  const InvoicesTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Devis & Factures</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Devis personnalisés, factures, tracking ID
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Messagerie
  const MessagesTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Messagerie</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Communications avec vendeurs/clients
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Portefeuille
  const WalletTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Portefeuille Transitaire</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Revenus, commissions, retraits
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
            Configuration entreprise, tarifs, zones
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'shipments':
        return <ShipmentsTab />;
      case 'documents':
        return <DocumentsTab />;
      case 'invoices':
        return <InvoicesTab />;
      case 'messages':
        return <MessagesTab />;
      case 'wallet':
        return <WalletTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header transitaire */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <Truck className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Transitaire International</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.full_name || 'Transitaire'}
              </p>
            </div>
          </div>
          <Badge variant="outline">TRANSITAIRE</Badge>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-4 pb-20">
        {renderContent()}
      </div>

      {/* Footer fixe transitaire */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-7 gap-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'dashboard' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Truck className="w-5 h-5 mb-1" />
              <span>Accueil</span>
            </button>
            
            <button
              onClick={() => setActiveTab('shipments')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'shipments' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Package className="w-5 h-5 mb-1" />
              <span>Expéditions</span>
              {stats.activeShipments > 0 && (
                <div className="absolute top-1 right-2 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {stats.activeShipments > 9 ? '9+' : stats.activeShipments}
                </div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'documents' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <FileText className="w-5 h-5 mb-1" />
              <span>Documents</span>
              {stats.pendingDocuments > 0 && (
                <div className="absolute top-1 right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {stats.pendingDocuments}
                </div>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'invoices' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <FileText className="w-5 h-5 mb-1" />
              <span>Factures</span>
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
              {stats.clientMessages > 0 && (
                <div className="absolute top-1 right-2 bg-purple-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {stats.clientMessages}
                </div>
              )}
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

export default TransitaireInterface;