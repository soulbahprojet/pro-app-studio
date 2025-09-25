import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import ClientNavigation from "@/components/ClientNavigation";
import { useNavigate } from "react-router-dom";
import VendorPOS from '@/components/vendor/VendorPOS';
import VendorProducts from '@/components/vendor/VendorProducts';
import VendorOrders from '@/components/vendor/VendorOrders';
import VendorMessages from '@/components/vendor/VendorMessages';
import VendorWallet from '@/components/vendor/VendorWallet';
import VendorInventory from '@/components/vendor/VendorInventory';
import VendorKYC from '@/components/vendor/VendorKYC';
import VendorSecurity from '@/components/vendor/VendorSecurity';
import VendorAnalytics from '@/components/vendor/VendorAnalytics';
import VendorEmployees from '@/components/vendor/VendorEmployees';
import VendorShopsManager from '@/components/vendor/VendorShopsManager';
import VendorCommunication from '@/components/vendor/VendorCommunication';
import VendorMarketing from '@/components/vendor/VendorMarketing';
import { VendorFeatureActivation } from '@/components/vendor/VendorFeatureActivation';
import AdvancedReports from '@/components/vendor/AdvancedReports';
import ProfessionalShopCreation from '@/components/ProfessionalShopCreation';
import { LoyaltyManager } from '@/components/vendor/pos/LoyaltyManager';
import { ClickAndCollectManager } from '@/components/vendor/pos/ClickAndCollectManager';
import { PeripheralManager } from '@/components/vendor/pos/PeripheralManager';
import { POSReports } from '@/components/vendor/pos/POSReports';
import { POSSettings } from '@/components/vendor/pos/POSSettings';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  Wallet, 
  Archive,
  Calculator,
  Gift,
  Truck,
  Printer,
  BarChart3,
  Settings,
  Search,
  Bell,
  TrendingUp,
  DollarSign,
  Users,
  Shield,
  Target,
  Zap,
  Plus,
  Bot,
  Eye,
  Cog
} from "lucide-react";

const VendorProfileDashboard = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showShopCreation, setShowShopCreation] = useState(false);
  const [hasShop, setHasShop] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Données simulées pour le dashboard
  const stats = {
    todaySales: 2450000,
    totalOrders: 156,
    totalProducts: 342,
    totalRevenue: 58900000,
    pendingMessages: 8,
    lowStockItems: 12
  };

  const recentActivity = [
    { type: 'sale', description: 'Vente de Samsung Galaxy A54', amount: 1500000, time: 'Il y a 5 min' },
    { type: 'order', description: 'Nouvelle commande #CC-2024-158', amount: 350000, time: 'Il y a 12 min' },
    { type: 'message', description: 'Message de Fatou Diallo', amount: 0, time: 'Il y a 1h' },
    { type: 'stock', description: 'Stock faible: Chargeur USB-C', amount: 0, time: 'Il y a 2h' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const AIProductCreationForm = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleGenerateDescription = () => {
      // Appel IA pour générer la description
      setDescription("Exemple de description générée automatiquement...");
    };

    const handleOptimizeTitle = () => {
      // Appel IA pour optimiser le titre
      setTitle("Titre optimisé automatiquement");
    };

    const handleGenerateImage = () => {
      // Appel IA pour générer une image réaliste du produit
      alert("Image générée automatiquement à partir du titre et description !");
    };

    return (
      <div className="max-w-xl mx-auto bg-card p-6 rounded-lg border">
        <h3 className="text-xl font-bold mb-4 text-foreground">Créer un produit avec IA</h3>
        
        {/* Champ titre */}
        <label className="block font-medium mb-1 text-foreground">Titre du produit</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4"
          placeholder="Entrez le titre du produit"
        />
        
        {/* Champ description */}
        <label className="block font-medium mb-1 text-foreground">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-border rounded-lg p-2 mb-2 bg-background text-foreground"
          placeholder="Décrivez votre produit"
          rows={4}
        />
        
        {/* Boutons IA en bas du champ description */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={handleGenerateDescription}
            className="px-3 py-1 text-sm bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
          >
            🤖 Générer description
          </button>
          <button
            onClick={handleOptimizeTitle}
            className="px-3 py-1 text-sm bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
          >
            ⚡ Optimiser titre
          </button>
          <button
            onClick={handleGenerateImage}
            className="px-3 py-1 text-sm bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors"
          >
            🖼️ Générer image
          </button>
        </div>
        
        {/* Bouton de création */}
        <button className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
          Créer mon produit
        </button>
      </div>
    );
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sale': return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'order': return <ShoppingCart className="w-4 h-4 text-blue-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'stock': return <Package className="w-4 h-4 text-orange-500" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const DashboardOverview = () => (
    <div className="space-y-6">
      {/* Actions principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {!hasShop ? (
          <Card className="col-span-full bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <Store className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-bold mb-2">Créez votre boutique professionnelle</h3>
              <p className="text-muted-foreground mb-4">Choisissez parmi 15 types de services pour démarrer votre activité</p>
              <button
                onClick={() => setShowShopCreation(true)}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Créer ma boutique professionnelle
              </button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-500/20">
              <CardContent className="p-6 text-center">
                <Store className="w-10 h-10 mx-auto mb-3 text-green-600" />
                <h3 className="font-semibold mb-2">Gérer ma boutique</h3>
                <p className="text-sm text-muted-foreground mb-3">Accès complet à toutes les options</p>
                <button 
                  onClick={() => setActiveTab('shops')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accéder
                </button>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <CardContent className="p-6 text-center">
                <Eye className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                <h3 className="font-semibold mb-2">Interface de ma boutique</h3>
                <p className="text-sm text-muted-foreground mb-3">Vue client en temps réel</p>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Prévisualiser
                </button>
              </CardContent>
            </Card>
          </>
        )}
        
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-green-600/5" />
            <DollarSign className="w-8 h-8 mx-auto mb-3 text-green-600" />
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.todaySales)}</div>
            <div className="text-sm text-muted-foreground font-medium">Ventes aujourd'hui</div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
            <ShoppingCart className="w-8 h-8 mx-auto mb-3 text-blue-600" />
            <div className="text-2xl font-bold text-foreground">{stats.totalOrders}</div>
            <div className="text-sm text-muted-foreground font-medium">Commandes</div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5" />
            <Package className="w-8 h-8 mx-auto mb-3 text-purple-600" />
            <div className="text-2xl font-bold text-foreground">{stats.totalProducts}</div>
            <div className="text-sm text-muted-foreground font-medium">Produits</div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5" />
            <TrendingUp className="w-8 h-8 mx-auto mb-3 text-yellow-600" />
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-sm text-muted-foreground font-medium">CA total</div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/5" />
            <MessageSquare className="w-8 h-8 mx-auto mb-3 text-red-600" />
            <div className="text-2xl font-bold text-foreground">{stats.pendingMessages}</div>
            <div className="text-sm text-muted-foreground font-medium">Messages</div>
          </CardContent>
        </Card>
        
        <Card className="relative overflow-hidden">
          <CardContent className="p-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/5" />
            <Archive className="w-8 h-8 mx-auto mb-3 text-orange-600" />
            <div className="text-2xl font-bold text-foreground">{stats.lowStockItems}</div>
            <div className="text-sm text-muted-foreground font-medium">Stock faible</div>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-primary" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80">
            <div className="p-6 space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{activity.description}</div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                  {activity.amount > 0 && (
                    <div className="font-bold text-green-600 text-lg">
                      +{formatCurrency(activity.amount)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-20">
        {/* Header professionnel avec profil vendeur */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 border-4 border-primary-foreground/20">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary-foreground text-primary text-xl font-bold">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('') || 'V'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">
                    {profile?.full_name || user?.email}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Store className="h-4 w-4" />
                    <span className="text-primary-foreground/90">Vendeur certifié</span>
                    <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                      ID: {profile?.readable_id || 'N/A'}
                    </Badge>
                  </div>
                  <p className="text-sm text-primary-foreground/80 mt-1">
                    {profile?.country || 'Non défini'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                  />
                </div>
                <button
                  onClick={() => setShowSettings(true)}
                  className="inline-flex items-center gap-2 bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-foreground/30 transition-colors"
                >
                  <Cog className="w-4 h-4" />
                  Paramètres
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interface principale avec navigation */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-10 lg:grid-cols-15 h-auto bg-card border shadow-sm overflow-x-auto">
              <TabsTrigger value="dashboard" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Store className="w-5 h-5" />
                <span className="text-xs font-medium">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="pos" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Calculator className="w-5 h-5" />
                <span className="text-xs font-medium">Caisse</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Package className="w-5 h-5" />
                <span className="text-xs font-medium">Produits</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ShoppingCart className="w-5 h-5" />
                <span className="text-xs font-medium">Commandes</span>
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-medium">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Wallet className="w-5 h-5" />
                <span className="text-xs font-medium">Portefeuille</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Archive className="w-5 h-5" />
                <span className="text-xs font-medium">Stock</span>
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Gift className="w-5 h-5" />
                <span className="text-xs font-medium">Fidélité</span>
              </TabsTrigger>
              <TabsTrigger value="collect" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Truck className="w-5 h-5" />
                <span className="text-xs font-medium">Click&Collect</span>
              </TabsTrigger>
              <TabsTrigger value="peripherals" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Printer className="w-5 h-5" />
                <span className="text-xs font-medium">Matériel</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="w-5 h-5" />
                <span className="text-xs font-medium">Rapports</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Paramètres</span>
              </TabsTrigger>
              <TabsTrigger value="ai-tools" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Bot className="w-5 h-5" />
                <span className="text-xs font-medium">Outils IA</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-medium">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="employees" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">Employés</span>
              </TabsTrigger>
              <TabsTrigger value="shops" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Store className="w-5 h-5" />
                <span className="text-xs font-medium">Mes Boutiques</span>
              </TabsTrigger>
              <TabsTrigger value="communication" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Bell className="w-5 h-5" />
                <span className="text-xs font-medium">Communication</span>
              </TabsTrigger>
              <TabsTrigger value="marketing" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Target className="w-5 h-5" />
                <span className="text-xs font-medium">Marketing</span>
              </TabsTrigger>
              <TabsTrigger value="features" className="flex flex-col gap-1 p-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Zap className="w-5 h-5" />
                <span className="text-xs font-medium">Activation</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardOverview />
            </TabsContent>

            <TabsContent value="pos">
              <VendorPOS />
            </TabsContent>

            <TabsContent value="products">
              <VendorProducts />
            </TabsContent>

            <TabsContent value="orders">
              <VendorOrders />
            </TabsContent>

            <TabsContent value="messages">
              <VendorMessages />
            </TabsContent>

            <TabsContent value="wallet">
              <VendorWallet />
            </TabsContent>

            <TabsContent value="inventory">
              <VendorInventory />
            </TabsContent>

            <TabsContent value="loyalty">
              <LoyaltyManager />
            </TabsContent>

            <TabsContent value="collect">
              <ClickAndCollectManager />
            </TabsContent>

            <TabsContent value="peripherals">
              <PeripheralManager />
            </TabsContent>

            <TabsContent value="reports">
              <AdvancedReports />
            </TabsContent>

            <TabsContent value="settings">
              <POSSettings />
            </TabsContent>

            <TabsContent value="ai-tools">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="w-6 h-6 text-primary" />
                      Outils d'Intelligence Artificielle
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AIProductCreationForm />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <VendorAnalytics />
            </TabsContent>

            <TabsContent value="employees">
              <VendorEmployees userProfile={profile} />
            </TabsContent>

            <TabsContent value="shops">
              <VendorShopsManager refreshTrigger={refreshTrigger} />
            </TabsContent>

            <TabsContent value="communication">
              <VendorCommunication userProfile={profile} />
            </TabsContent>

            <TabsContent value="marketing">
              <VendorMarketing userProfile={profile} />
            </TabsContent>

            <TabsContent value="features">
              <VendorFeatureActivation />
            </TabsContent>
          </Tabs>
        </div>

        {/* Modal de création de boutique */}
        <ProfessionalShopCreation
          isOpen={showShopCreation}
          onClose={() => setShowShopCreation(false)}
          onSuccess={() => {
            setShowShopCreation(false);
            setHasShop(true);
            setRefreshTrigger(prev => prev + 1);
          }}
        />

        {/* Modal des paramètres */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Paramètres</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6">
                <Tabs defaultValue="kyc" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="kyc" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Vérification KYC
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Sécurité
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="kyc">
                    <VendorKYC />
                  </TabsContent>
                  
                  <TabsContent value="security">
                    <VendorSecurity userProfile={profile} />
            </TabsContent>

                </Tabs>
              </div>
            </div>
          </div>
        )}
        
        <ClientNavigation />
        
        {/* Espacement pour la navigation */}
        <div className="h-20" />
      </div>
    </div>
  );
};

export default VendorProfileDashboard;