import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ShopManagement } from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import { ProfessionalShopCreation } from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import VendorShopInterface from "../vendor/VendorShopInterface";
import { AppDownloadBanner } from "
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        ";
import VendorProducts from "../vendor/VendorProducts";
import VendorOrders from "../vendor/VendorOrders";
import VendorMessages from "../vendor/VendorMessages";
import VendorWallet from "../vendor/VendorWallet";
import VendorInventory from "../vendor/VendorInventory";
import OpportunityPipeline from "../vendor/OpportunityPipeline";
import EmployeeManagement from "../vendor/EmployeeManagement";
import AdvancedReports from "../vendor/AdvancedReports";
import { generateUserId } from "@/utils/idGenerator";
import { 
  Search, 
  Camera, 
  Grid3X3, 
  MessageSquare, 
  Truck,
  Star,
  ArrowRight,
  Package,
  Users,
  Globe,
  Shield,
  Zap,
  CheckCircle,
  Store, 
  ShoppingCart, 
  Wallet, 
  Settings,
  Plus,
  Eye,
  Edit,
  TrendingUp,
  DollarSign,
  LogOut,
  BarChart3,
  ShieldCheck,
  FileText,
  Archive,
  Target
} from "lucide-react";
import logo from "@/assets/224solutions-logo.png";

interface VendorStats {
  totalProducts: number;
  activeOrders: number;
  totalRevenue: number;
  messagesToReply: number;
}

const Index = () => {
  const { isAuthenticated, loading, profile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("marketplace");
  const [vendorActiveTab, setVendorActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [showShopManagement, setShowShopManagement] = useState(false);
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [showShopInterface, setShowShopInterface] = useState(false);

  // Données vendeur
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
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  useEffect(() => {
    if (!loading && isAuthenticated && profile) {
      console.log('Utilisateur connecté:', profile.role);
      
      // Vérifier les paramètres URL pour activer l'onglet vendeur
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam === 'vendor' && profile.role === 'seller') {
        setActiveTab('vendor');
      }
    }
  }, [isAuthenticated, loading, navigate, profile]);

  // Charger les produits depuis la base de données
  useEffect(() => {
    const fetchProducts = async () => {
      // Produits récents pour la section "au top du classement"
      const { data: recentProducts, error: recentError } = await supabase
        .from('products')
        .select('id, name, price, currency, images, category, description, stock_quantity')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (recentError) {
        console.error('Erreur lors du chargement des produits récents:', recentError);
      } else {
        setProducts(recentProducts || []);
      }

      // Produits en vedette pour la section "meilleures offres"
      const { data: featured, error: featuredError } = await supabase
        .from('products')
        .select('id, name, price, currency, images, category, description, stock_quantity, is_featured')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
      
      if (featuredError) {
        console.error('Erreur lors du chargement des produits en vedette:', featuredError);
      } else {
        setFeaturedProducts(featured || []);
      }
    };

    fetchProducts();
  }, []);

  // Déterminer quel contenu afficher selon le rôle utilisateur et l'onglet actif
  const shouldShowVendorInterface = isAuthenticated && profile?.role === 'seller' && activeTab === 'vendor';
  
  const tabs = shouldShowVendorInterface ? 
    ["marketplace", "vendor"] : 
    ["Produits", "Ville", "Explorer par régions"];
  
  const quickActions = shouldShowVendorInterface ? [
    // Actions vendeur
    { 
      icon: Package, 
      label: "Mes produits", 
      color: "text-primary",
      action: () => setVendorActiveTab('catalog')
    },
    { 
      icon: ShoppingCart, 
      label: "Mes commandes", 
      color: "text-accent",
      action: () => setVendorActiveTab('orders')
    },
    { 
      icon: MessageSquare, 
      label: "Messages clients", 
      color: "text-secondary-foreground",
      action: () => setVendorActiveTab('messages')
    },
    { 
      icon: Wallet, 
      label: "Mon portefeuille", 
      color: "text-green-600",
      action: () => setVendorActiveTab('wallet')
    }
  ] : [
    // Actions client
    { 
      icon: Grid3X3, 
      label: "Explorer par catégories", 
      color: "text-primary",
      action: () => navigate('/services')
    },
    { 
      icon: MessageSquare, 
      label: "Demander un devis", 
      color: "text-accent",
      action: () => navigate('/services')
    },
    { 
      icon: Truck, 
      label: "Services de proximité", 
      color: "text-secondary-foreground",
      action: () => navigate('/nearby-services')
    },
    { 
      icon: Users, 
      label: "Devenir vendeur", 
      color: "text-green-600",
      action: () => navigate('/vendor-auth')
    }
  ];
  
  // Composants Vendeur
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

      {/* Bannière de téléchargement d'app mobile */}
      {vendorActiveTab === 'home' && <AppDownloadBanner />}

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => setVendorActiveTab('catalog')} className="h-auto p-4 flex-col">
              <Plus className="w-6 h-6 mb-2" />
              <span>Ajouter un produit</span>
            </Button>
            <Button onClick={() => setVendorActiveTab('orders')} variant="outline" className="h-auto p-4 flex-col">
              <Eye className="w-6 h-6 mb-2" />
              <span>Voir les commandes</span>
            </Button>
            <Button onClick={() => setVendorActiveTab('messages')} variant="outline" className="h-auto p-4 flex-col">
              <MessageSquare className="w-6 h-6 mb-2" />
              <span>Répondre aux messages</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
            <CardTitle>Configuration Boutique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowShopManagement(true)}
            >
              <Store className="w-4 h-4 mr-2" />
              Gérer ma boutique
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowCreateShop(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une boutique professionnelle
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowShopInterface(true)}
            >
              <Store className="w-4 h-4 mr-2" />
              Interface de boutique
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Vérification KYC
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setVendorActiveTab('inventory')}
            >
              <Archive className="w-4 h-4 mr-2" />
              Gestion de stock
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setVendorActiveTab('employees')}
            >
              <Users className="w-4 h-4 mr-2" />
              Gestion des employés
            </Button>
          </CardContent>
        </Card>

        {/* Marketing & Promotions */}
        <Card>
          <CardHeader>
            <CardTitle>Marketing & Promotions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
              onClick={() => setVendorActiveTab('pipeline')}
            >
              <Target className="w-4 h-4 mr-2" />
              Pipeline opportunités
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setVendorActiveTab('reports')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Rapports détaillés
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

  const renderVendorContent = () => {
    switch (vendorActiveTab) {
      case 'home':
        return <VendorHome />;
      case 'catalog':
        return <VendorProducts />;
      case 'orders':
        return <VendorOrders />;
      case 'messages':
        return <VendorMessages />;
      case 'wallet':
        return <VendorWallet />;
      case 'inventory':
        return <VendorInventory />;
      case 'pipeline':
        return <OpportunityPipeline />;
      case 'employees':
        return <EmployeeManagement />;
      case 'reports':
        return <AdvancedReports />;
      case 'settings':
        return <VendorSettings />;
      default:
        return <VendorHome />;
    }
  };

  const sampleProducts = [
    { name: "Historique", price: "480 $US", image: "/placeholder.svg", category: "Électronique" },
    { name: "Tables à ongles", price: "180 $US", image: "/placeholder.svg", category: "Beauté" },
    { name: "Câbles de comm.", price: "32 $US", image: "/placeholder.svg", category: "Électronique" },
    { name: "Ensembles", price: "25 $US", image: "/placeholder.svg", category: "Maison" }
  ];
  
  const specialOffers = [
    { name: "Imprimante professionnelle", price: "7,64 $US", originalPrice: "8,50 $US", discount: "-10%", image: "/placeholder.svg" },
    { name: "Robot culinaire multifonction", price: "15,80 $US", originalPrice: "20,00 $US", discount: "-21%", image: "/placeholder.svg" },
    { name: "Vêtement mode", price: "14,40 $US", originalPrice: "18,00 $US", discount: "-20%", image: "/placeholder.svg" }
  ];
  
  const categories = ["Tous", "Construction et immobilier", "Chaussures et accessoires", "Électronique"];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si c'est un vendeur et qu'il est sur l'onglet vendeur, afficher l'interface vendeur complète
  if (shouldShowVendorInterface) {
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
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('marketplace')}>
                  <ArrowRight className="w-4 h-4" />
                  Marketplace
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/services')}>
                  <Truck className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('marketplace')}>
                  <ArrowRight className="w-4 h-4" />
                  Retour
                </Button>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="max-w-6xl mx-auto p-4 pb-20">
            {renderVendorContent()}
          </div>

          {/* FOOTER FIXE VENDEUR */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-7 gap-0">
                <button
                  onClick={() => setVendorActiveTab('home')}
                  className={`p-3 text-center transition-colors ${
                    vendorActiveTab === 'home' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Store className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Accueil</span>
                </button>
                <button
                  onClick={() => setVendorActiveTab('catalog')}
                  className={`p-3 text-center transition-colors ${
                    vendorActiveTab === 'catalog' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Package className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Catalogue</span>
                </button>
                <button
                  onClick={() => setVendorActiveTab('orders')}
                  className={`p-3 text-center transition-colors ${
                    vendorActiveTab === 'orders' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Commandes</span>
                </button>
                <button
                  onClick={() => setVendorActiveTab('messages')}
                  className={`p-3 text-center transition-colors ${
                    vendorActiveTab === 'messages' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Messages</span>
                </button>
                <button
                  onClick={() => setVendorActiveTab('wallet')}
                  className={`p-3 text-center transition-colors ${
                    vendorActiveTab === 'wallet' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Wallet className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Portefeuille</span>
                </button>
                <button
                  onClick={() => setVendorActiveTab('reports')}
                  className={`p-3 text-center transition-colors ${
                    vendorActiveTab === 'reports' 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BarChart3 className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-xs">Analyses</span>
                </button>
                <button
                  onClick={() => setVendorActiveTab('settings')}
                  className={`p-3 text-center transition-colors ${
                    vendorActiveTab === 'settings' 
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
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section avec Logo */}
      <div className="bg-gradient-to-r from-white to-amber-100 text-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Logo et titre principal */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img src={logo} alt="224SOLUTIONS" className="h-16 w-16 mr-4" />
              <h1 className="text-4xl font-bold">224SOLUTIONS</h1>
            </div>
            <p className="text-lg text-amber-700">La plateforme complète pour votre business en Afrique</p>
          </div>
          {/* Tabs navigation */}
          <div className="flex space-x-6 mb-4">
            {isAuthenticated && profile?.role === 'seller' ? (
              // Navigation pour vendeurs
              <>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className={`pb-2 text-base font-medium transition-colors cursor-pointer ${
                    activeTab === 'marketplace' 
                      ? "border-b-2 border-amber-600 text-gray-800" 
                      : "text-amber-700 hover:text-gray-800"
                  }`}
                >
                  Marketplace
                </button>
                <button
                  onClick={() => setActiveTab('vendor')}
                  className={`pb-2 text-base font-medium transition-colors cursor-pointer ${
                    activeTab === 'vendor' 
                      ? "border-b-2 border-amber-600 text-gray-800" 
                      : "text-amber-700 hover:text-gray-800"
                  }`}
                >
                  Mon Espace Vendeur
                </button>
              </>
            ) : (
              // Navigation pour clients
              tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (tab === "Ville") {
                      console.log("Navigation vers la recherche par ville");
                    } else if (tab === "Explorer par régions") {
                      console.log("Navigation vers l'exploration par régions");
                    } else if (tab === "Produits") {
                      console.log("Affichage des produits");
                    }
                  }}
                  className={`pb-2 text-base font-medium transition-colors cursor-pointer ${
                    activeTab === tab 
                      ? "border-b-2 border-amber-600 text-gray-800" 
                      : "text-amber-700 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))
            )}
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <Input
              type="text"
              placeholder="accessoires de cuisine"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-20 py-3 text-base bg-white text-foreground border-0 rounded-full"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-2">
              <Button 
                size="sm" 
                variant="ghost" 
                className="rounded-full p-2 hover:bg-muted"
                onClick={() => {
                  // Fonction de recherche par image
                  console.log("Recherche par image activée");
                  // Ici on peut ajouter la logique pour ouvrir la caméra ou uploader une image
                }}
              >
                <Camera className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button 
                size="sm" 
                className="rounded-full px-4 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  // Fonction de recherche
                  if (searchQuery.trim()) {
                    console.log("Recherche pour:", searchQuery);
                    navigate(`/marketplace?search=${encodeURIComponent(searchQuery)}`);
                  } else {
                    navigate('/marketplace');
                  }
                }}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Action rapides avec design moderne */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-8">Nos Services</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-elegant transition-all duration-300 cursor-pointer hover:-translate-y-1 border-border/50" onClick={action.action}>
              <CardContent className="p-6 text-center">
                <div className="bg-gradient-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <action.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Stats Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold mb-8">224SOLUTIONS en chiffres</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary">10K+</div>
              <p className="text-muted-foreground">Utilisateurs actifs</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">50+</div>
              <p className="text-muted-foreground">Services disponibles</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">24/7</div>
              <p className="text-muted-foreground">Support client</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">99%</div>
              <p className="text-muted-foreground">Satisfaction client</p>
            </div>
          </div>
        </div>
      </div>

      {/* Produits populaires */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sampleProducts.map((product, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-3">
                <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="text-lg font-bold text-primary mb-1">{product.price}</div>
                <div className="text-sm text-foreground font-medium mb-1">{product.name}</div>
                <div className="text-xs text-muted-foreground">{product.category}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex space-x-6 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category}
                className={`whitespace-nowrap pb-2 text-sm font-medium transition-colors ${
                  category === "Tous" 
                    ? "border-b-2 border-primary text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
            <Button variant="ghost" size="sm" className="ml-auto">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Meilleures offres */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Meilleures offres</h2>
            <p className="text-sm text-muted-foreground">Trouvez les meilleurs prix sur 224Solutions.com</p>
          </div>
          <Button variant="ghost" className="text-primary">
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredProducts.length > 0 ? featuredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="relative">
                  <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground z-10">
                    Offres spéciales
                  </Badge>
                  <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg font-bold text-accent">
                    {product.price} {product.currency}
                  </span>
                  <Badge variant="secondary" className="text-xs">En vedette</Badge>
                </div>
                <p className="text-sm text-foreground mb-2 line-clamp-2">{product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {product.stock_quantity > 0 ? `Stock: ${product.stock_quantity}` : 'Produit populaire'}
                </p>
              </CardContent>
            </Card>
          )) : (
            // Message quand aucun produit en vedette n'est disponible
            <div className="col-span-full text-center py-8">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucune offre spéciale pour le moment</h3>
              <p className="text-muted-foreground mb-4">Les marchands vont bientôt mettre en vedette leurs meilleurs produits !</p>
              <Button variant="outline" onClick={() => navigate('/marketplace')}>
                Explorer tous les produits
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Produits au top du classement */}
      <div className="bg-gradient-accent/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Produits au top du classement</h2>
              <p className="text-sm text-muted-foreground">Suivez les tendances grâce aux clients</p>
            </div>
            <Button variant="ghost" className="text-primary">
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.length > 0 ? products.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer bg-white">
                <CardContent className="p-3">
                  <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-xs text-muted-foreground ml-1">4.8</span>
                  </div>
                  <div className="text-sm text-foreground font-medium mb-1 line-clamp-2">{product.name}</div>
                  <div className="text-lg font-bold text-accent">
                    {product.price} {product.currency}
                  </div>
                  {product.stock_quantity > 0 && (
                    <div className="text-xs text-green-600 mt-1">En stock ({product.stock_quantity})</div>
                  )}
                </CardContent>
              </Card>
            )) : (
              // Message quand aucun produit n'est disponible
              <div className="col-span-full text-center py-8">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Aucun produit disponible</h3>
                <p className="text-muted-foreground mb-4">Les marchands vont bientôt ajouter leurs produits !</p>
                <Button variant="outline" onClick={() => navigate('/marketplace')}>
                  Visiter le marketplace
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bouton d'accès PDG en bas de page */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => navigate('/pdg-dashboard')}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 text-sm font-semibold rounded-full"
        >
          <Shield className="h-4 w-4 mr-2" />
          Interface PDG
        </Button>
      </div>
    </div>
  );
};

export default Index;
