import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Store,
  Search, 
  ShoppingCart, 
  Heart, 
  Package, 
  CreditCard,
  MessageSquare,
  Settings,
  Filter,
  Star,
  MapPin,
  User,
  LogOut,
  Wallet,
  Globe
} from 'lucide-react';
import ClientPaymentModule from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import ClientMarketplaceInterface from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        

interface ClientStats {
  favoriteStores: number;
  activeOrders: number;
  totalOrders: number;
  walletBalance: number;
}

const ClientInterface: React.FC = () => {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Données simulées client
  const clientStats: ClientStats = {
    favoriteStores: 8,
    activeOrders: 2,
    totalOrders: 25,
    walletBalance: 150000
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Composant Accueil
  const HomeTab = () => (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Rechercher des produits, boutiques..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
      </div>

      {/* Statistiques client */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{clientStats.favoriteStores}</p>
              <p className="text-xs text-muted-foreground">Favoris</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Package className="w-6 h-6 text-orange-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{clientStats.activeOrders}</p>
              <p className="text-xs text-muted-foreground">En cours</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <ShoppingCart className="w-6 h-6 text-green-500 mx-auto mb-1" />
              <p className="text-lg font-bold">{clientStats.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CreditCard className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-sm font-bold">{formatCurrency(clientStats.walletBalance)}</p>
              <p className="text-xs text-muted-foreground">Portefeuille</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boutiques populaires */}
      <Card>
        <CardHeader>
          <CardTitle>Boutiques populaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Boutique ABC</span>
              </div>
              <div className="flex items-center space-x-1 mb-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs">4.8 (125 avis)</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Kaloum</span>
              </div>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Store className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Shop XYZ</span>
              </div>
              <div className="flex items-center space-x-1 mb-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-xs">4.6 (89 avis)</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Matam</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Marketplace - Utilisation de la nouvelle interface
  const MarketplaceTab = () => {
    return (
      <ClientMarketplaceInterface 
        onBack={() => setActiveTab('home')}
      />
    );
  };

  // Composant Favoris
  const FavoritesTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Mes Favoris</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Produits et boutiques favoris
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Commandes
  const OrdersTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Mes Commandes</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Suivi commandes (locales & internationales), historique achats
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Portefeuille
  const WalletTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Portefeuille</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Paiements (carte/Mobile Money/wallet), solde, historique
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Messages
  const MessagesTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Messages</h2>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Messagerie avec vendeurs, support client
          </p>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Paramètres
  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Mon Profil</h2>
      
      {/* Navigation rapide */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:bg-accent/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Marketplace</p>
                <p className="text-sm text-muted-foreground">Explorer les produits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:bg-accent/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Portefeuille</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(clientStats.walletBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Carte Virtuelle</p>
                <p className="text-sm text-muted-foreground">Gérer mes cartes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Services</p>
                <p className="text-sm text-muted-foreground">Tous les services</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informations profil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations du profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nom complet</p>
              <p className="font-medium">{profile?.full_name || 'Non défini'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="font-medium">{profile?.email || 'Non défini'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
              <p className="font-medium">{profile?.phone || 'Non défini'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pays</p>
              <p className="font-medium">{profile?.country || 'Non défini'}</p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            Modifier le profil
          </Button>
        </CardContent>
      </Card>

      {/* Déconnexion */}
      <Card>
        <CardContent className="p-4">
          <Button 
            variant="destructive" 
            className="w-full flex items-center gap-2"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </Button>
        </CardContent>
      </Card>

      {/* Modal de déconnexion */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <LogOut className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold">Confirmer la déconnexion</h3>
              <p className="text-muted-foreground">
                Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
              </p>
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowLogoutModal(false)}
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    logout();
                    setShowLogoutModal(false);
                  }}
                >
                  Se déconnecter
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'marketplace':
        return <MarketplaceTab />;
      case 'favorites':
        return <FavoritesTab />;
      case 'orders':
        return <OrdersTab />;
      case 'wallet':
        return <WalletTab />;
      case 'messages':
        return <MessagesTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header client */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <Store className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">224Solutions</h1>
              <p className="text-sm text-muted-foreground">
                Bonjour {profile?.full_name || 'Client'}
              </p>
            </div>
          </div>
          <Badge variant="outline">CLIENT</Badge>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-4 pb-20">
        {renderContent()}
      </div>

      {/* Footer fixe client */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-7 gap-0">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'home' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Store className="w-5 h-5 mb-1" />
              <span>Accueil</span>
            </button>
            
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'marketplace' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Search className="w-5 h-5 mb-1" />
              <span>Explorer</span>
            </button>
            
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'favorites' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Heart className="w-5 h-5 mb-1" />
              <span>Favoris</span>
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex flex-col items-center justify-center p-3 text-xs relative ${
                activeTab === 'orders' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Package className="w-5 h-5 mb-1" />
              <span>Commandes</span>
              {clientStats.activeOrders > 0 && (
                <div className="absolute top-1 right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {clientStats.activeOrders}
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
              <CreditCard className="w-5 h-5 mb-1" />
              <span>Portefeuille</span>
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
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center p-3 text-xs ${
                activeTab === 'settings' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Settings className="w-5 h-5 mb-1" />
              <span>Profil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInterface;
