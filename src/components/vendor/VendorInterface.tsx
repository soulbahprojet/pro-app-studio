import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ShopManagement } from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import { ProfessionalShopCreation } from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import VendorShopInterface from '../vendor/VendorShopInterface';
import { AppDownloadBanner } from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import VendorProducts from '../vendor/VendorProducts';
import VendorOrders from '../vendor/VendorOrders';
import VendorMessages from '../vendor/VendorMessages';
import VendorWallet from '../vendor/VendorWallet';
import VendorPaymentModule from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import VendorInventory from '../vendor/VendorInventory';
import OpportunityPipeline from '../vendor/OpportunityPipeline';
import EmployeeManagement from '../vendor/EmployeeManagement';
import AdvancedReports from '../vendor/AdvancedReports';
import { AIContentGenerator } from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import ModernPOS from '../vendor/pos/ModernPOS';
import { generateUserId } from '@/utils/idGenerator';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Wallet, 
  Settings,
  Plus,
  Eye,
  Edit,
  TrendingUp,
  Users,
  DollarSign,
  LogOut,
  BarChart3,
  ShieldCheck,
  FileText,
  Truck,
  Archive,
  Target,
  Sparkles,
  Bot,
  Zap,
  Calculator,
  CreditCard
} from 'lucide-react';

interface VendorStats {
  totalProducts: number;
  activeOrders: number;
  totalRevenue: number;
  messagesToReply: number;
}

const VendorInterface: React.FC = () => {
  const { profile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [showShopManagement, setShowShopManagement] = useState(false);
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [showShopInterface, setShowShopInterface] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  
  // Données réinitialisées du vendeur (stats à zéro par défaut)
  const vendorStats: VendorStats = {
    totalProducts: 0,
    activeOrders: 0,
    totalRevenue: 0,
    messagesToReply: 0
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // La redirection est gérée par le AuthContext
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  // Composant Accueil Vendeur
  const VendorHome = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Bienvenue dans votre espace vendeur</h1>
        <p className="text-muted-foreground">Gérez votre boutique et vos ventes</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{vendorStats.totalProducts}</p>
                <p className="text-sm text-muted-foreground">Produits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{vendorStats.activeOrders}</p>
                <p className="text-sm text-muted-foreground">Commandes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-lg font-bold">{formatCurrency(vendorStats.totalRevenue)}</p>
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
                <p className="text-2xl font-bold">{vendorStats.messagesToReply}</p>
                <p className="text-sm text-muted-foreground">Messages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bannière de téléchargement d'app mobile - Seulement sur l'accueil */}
      {activeTab === 'home' && <AppDownloadBanner />}

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => setActiveTab('catalog')} className="h-auto p-4 flex-col">
              <Plus className="w-6 h-6 mb-2" />
              <span>Ajouter un produit</span>
            </Button>
            <Button onClick={() => setActiveTab('orders')} variant="outline" className="h-auto p-4 flex-col">
              <Eye className="w-6 h-6 mb-2" />
              <span>Voir les commandes</span>
            </Button>
            <Button onClick={() => setActiveTab('pos')} variant="outline" className="h-auto p-4 flex-col">
              <Calculator className="w-6 h-6 mb-2" />
              <span>Point de Vente (POS)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Composant Catalogue - Maintenant opérationnel
  const VendorCatalog = () => <VendorProducts />;

  // Composant Commandes - Maintenant opérationnel
  const VendorOrdersTab = () => <VendorOrders />;

  // Composant Messagerie - Maintenant opérationnel
  const VendorMessagesTab = () => <VendorMessages />;

  // Composant Portefeuille - Maintenant opérationnel
  const VendorWalletTab = () => <VendorWallet />;
  
  // Composant Gestion de stock
  const VendorInventoryTab = () => <VendorInventory />;

  // Composant Paramètres avec bouton de déconnexion
  const VendorSettings = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Paramètres</h2>
      
      <div className="grid gap-6">
        {/* Profil vendeur */}
        <Card>
          <CardHeader>
            <CardTitle>Profil Vendeur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{profile?.full_name}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <p className="text-xs text-muted-foreground">
                  ID: {profile?.readable_id || generateUserId(profile?.country)}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration boutique */}
        <Card>
          <CardHeader>
            <CardTitle>Gestion Boutique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowCreateShop(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer/Gérer ma boutique
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowShopInterface(true)}
            >
              <Store className="w-4 h-4 mr-2" />
              Interface boutique spécialisée
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Vérification KYC
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('employees')}
            >
              <Users className="w-4 h-4 mr-2" />
              Gestion des employés
            </Button>
          </CardContent>
        </Card>

        {/* Marketing & IA */}
        <Card>
          <CardHeader>
            <CardTitle>Marketing & Intelligence Artificielle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowAIGenerator(true)}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              IA - Générateur de contenu
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Bot className="w-4 h-4 mr-2" />
              IA - Optimisation prix & titre
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Produits sponsorisés
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Codes promo
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('pipeline')}
            >
              <Target className="w-4 h-4 mr-2" />
              Pipeline opportunités
            </Button>
          </CardContent>
        </Card>

        {/* Sécurité & Administration */}
        <Card>
          <CardHeader>
            <CardTitle>Sécurité & Administration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Sécurité du compte
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4 mr-2" />
              Historique d'activité
            </Button>
          </CardContent>
        </Card>

        {/* Déconnexion */}
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Se déconnecter
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la déconnexion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir vous déconnecter de votre espace vendeur ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Se déconnecter
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <VendorHome />;
      case 'catalog':
        return <VendorCatalog />;
      case 'orders':
        return <VendorOrdersTab />;
      case 'messages':
        return <VendorMessagesTab />;
      case 'wallet':
        return <VendorWalletTab />;
      case 'inventory':
        return <VendorInventoryTab />;
      case 'pipeline':
        return <OpportunityPipeline />;
      case 'employees':
        return <EmployeeManagement />;
      case 'reports':
        return <AdvancedReports />;
      case 'pos':
        return <ModernPOS />;
      case 'settings':
        return <VendorSettings />;
      default:
        return <VendorHome />;
    }
  };

  return (
    <>
      {/* Modals de gestion de boutique */}
      {showShopManagement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-end p-4 border-b">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowShopManagement(false)}
              >
                ✕ Fermer
              </Button>
            </div>
            <div className="p-6">
              <ShopManagement 
                onEditShop={() => {
                  toast({
                    title: "Boutique",
                    description: "Mode édition de la boutique activé"
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      {showCreateShop && (
        <ProfessionalShopCreation 
          isOpen={showCreateShop}
          onClose={() => setShowCreateShop(false)}
          onSuccess={() => {
            setShowCreateShop(false);
            toast({
              title: "Succès",
              description: "Boutique professionnelle créée avec succès"
            });
          }}
        />
      )}
      
      {showShopInterface && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg border shadow-lg max-w-6xl w-full max-h-[90vh] overflow-auto mx-4">
            <div className="flex justify-end p-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowShopInterface(false)}
              >
                ✕
              </Button>
            </div>
            <div className="px-6 pb-6">
              <VendorShopInterface />
            </div>
          </div>
        </div>
      )}

      {showAIGenerator && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg border shadow-lg max-w-6xl w-full max-h-[90vh] overflow-auto mx-4">
            <div className="flex justify-end p-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowAIGenerator(false)}
              >
                ✕
              </Button>
            </div>
            <div className="px-6 pb-6">
              <AIContentGenerator shopId="vendor" />
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-background">
      {/* Header vendeur */}
      <div className="bg-white border-b border-border p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <Store className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-lg font-semibold">Espace Vendeur</h1>
              <p className="text-sm text-muted-foreground">
                {profile?.full_name || 'Vendeur'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">VENDEUR</Badge>
            <Button variant="ghost" size="sm" onClick={() => navigate('/services')}>
              <Truck className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <LogOut className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Déconnexion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Voulez-vous vraiment vous déconnecter ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>
                    Déconnexion
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto p-4 pb-20">
        {renderContent()}
      </div>

      {/* FOOTER FIXE VENDEUR - EXIGENCE CRITIQUE */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-7 gap-0">
            <button
              onClick={() => setActiveTab('home')}
              className={`p-3 text-center transition-colors ${
                activeTab === 'home' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Store className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Accueil</span>
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`p-3 text-center transition-colors ${
                activeTab === 'catalog' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Catalogue</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`p-3 text-center transition-colors ${
                activeTab === 'orders' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShoppingCart className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Commandes</span>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`p-3 text-center transition-colors ${
                activeTab === 'messages' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Messages</span>
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`p-3 text-center transition-colors ${
                activeTab === 'wallet' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Wallet className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Portefeuille</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`p-3 text-center transition-colors ${
                activeTab === 'inventory' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Archive className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Stock</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`p-3 text-center transition-colors ${
                activeTab === 'settings' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Settings className="w-5 h-5 mx-auto mb-1" />
              <span className="text-xs">Paramètres</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default VendorInterface;
