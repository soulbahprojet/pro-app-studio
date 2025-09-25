import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ShoppingBag, 
  Package, 
  Wallet, 
  AlertTriangle, 
  TrendingUp,
  Users,
  Star,
  Eye,
  Calculator,
  Crown,
  ArrowUp,
  ArrowLeft,
  Database,
  Settings,
  Store,
  Monitor
} from 'lucide-react';

// Import des composants des modules
import VendorProducts from './VendorProducts';
import VendorOrders from './VendorOrders';
import VendorInventory from './VendorInventory';
import VendorWallet from './VendorWallet';
import VendorPOS from './VendorPOS';
import SupermarketPOS from './SupermarketPOS';
import KYCVerification from '@/components/KYCVerification';
import SubscriptionManager from '@/components/SubscriptionManager';
import ModernPOS from '@/components/ModernPOS';
import VendorShopInterface from './VendorShopInterface';
import MultiWarehouseManager from './MultiWarehouseManager';
import AdvancedAnalytics from './AdvancedAnalytics';

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  walletBalance: number;
  lowStockProducts: number;
  pendingKYC: boolean;
  currentPlan: string;
  storageUsed: number;
  storageQuota: number;
}

export default function VendorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    walletBalance: 0,
    lowStockProducts: 0,
    pendingKYC: true,
    currentPlan: 'premium', // Tout le monde est premium maintenant
    storageUsed: 0,
    storageQuota: 2
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      // Charger le profil utilisateur avec les données d'abonnement
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      console.log('Profil utilisateur:', profile);

      // Vérifier et corriger le rôle utilisateur
      if (profile && profile.role !== 'seller') {
        console.log('Mise à jour du rôle utilisateur vers seller');
        await supabase
          .from('profiles')
          .update({ role: 'seller' })
          .eq('user_id', user?.id);
        
        toast({
          title: "Rôle mis à jour",
          description: "Votre rôle a été défini comme vendeur",
        });
      }

      // Vérifier si le vendeur existe
      const { data: vendorProfile } = await supabase
        .from('vendor_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      console.log('Profil vendeur:', vendorProfile);

      if (!vendorProfile) {
        // Créer le profil vendeur s'il n'existe pas
        await createVendorProfile();
        return;
      }

      // Charger les statistiques (utilisation temporaire avec any)
      const [productsResult, ordersResult, walletResult, inventoryResult] = await Promise.all([
        supabase
          .from('products')
          .select('id, is_active')
          .eq('seller_id', user?.id) as any,
        supabase
          .from('orders')
          .select('id, status, total_amount')
          .eq('seller_id', user?.id) as any,
        supabase
          .from('vendor_wallets')
          .select('balance')
          .eq('vendor_id', user?.id)
          .maybeSingle() as any,
        supabase
          .from('inventory')
          .select('quantity_available, reorder_threshold')
          .eq('vendor_id', user?.id) as any
      ]);

      const products = productsResult.data || [];
      const orders = ordersResult.data || [];
      const wallet = walletResult.data;
      const inventory = inventoryResult.data || [];

      const lowStockCount = inventory.filter((item: any) => 
        item.quantity_available <= item.reorder_threshold
      ).length;

      setStats({
        totalProducts: products.length,
        activeProducts: products.filter((p: any) => p.is_active).length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => ['pending', 'processing'].includes(o.status)).length,
        totalRevenue: orders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0),
        walletBalance: wallet?.balance || 0,
        lowStockProducts: lowStockCount,
        pendingKYC: false, // TEMPORAIREMENT DÉSACTIVÉ POUR TESTS
        currentPlan: 'premium', // Force premium pour tous
        storageUsed: (profile as any)?.storage_used_gb || 0,
        storageQuota: (profile as any)?.storage_quota_gb || 2
      });

    } catch (error) {
      console.error('Erreur chargement stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createVendorProfile = async () => {
    try {
      console.log('Création du profil vendeur pour:', user?.id);
      
      // D'abord, s'assurer que le rôle est bien défini comme seller
      await supabase
        .from('profiles')
        .update({ role: 'seller' })
        .eq('user_id', user?.id);

      const { error } = await supabase
        .from('vendor_profiles')
        .insert({
          user_id: user?.id,
          business_name: 'Ma Boutique',
          business_type: 'Autre',
          email: user?.email || '',
          phone: '',
          is_active: true, // Activer par défaut
          kyc_status: 'incomplete',
          rating: 0,
          total_sales: 0
        });

      if (error) {
        console.error('Erreur création vendor_profiles:', error);
        throw error;
      }

      // Créer aussi le wallet
      const { error: walletError } = await supabase
        .from('vendor_wallets')
        .insert({
          vendor_id: user?.id,
          balance: 0,
          total_earnings: 0,
          pending_amount: 0
        });

      if (walletError) {
        console.error('Erreur création wallet:', walletError);
        // Ne pas bloquer si le wallet existe déjà
      }

      toast({
        title: "Profil créé",
        description: "Votre profil vendeur a été créé avec succès !",
      });

      // Recharger les stats après création
      setTimeout(() => {
        loadDashboardStats();
      }, 1000);

      setActiveTab('overview');
    } catch (error) {
      console.error('Erreur création profil:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Chargement du tableau de bord...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">Tableau de bord Vendeur</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Badge Premium pour tous */}
          <Badge variant="default" className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-purple-700">
            <Crown className="h-3 w-3 text-yellow-300" />
            Premium - Toutes fonctionnalités débloquées
          </Badge>
          
          {/* Alerte quota */}
          {(stats.storageUsed / stats.storageQuota) > 0.8 && (
            <Button
              variant="outline"
              onClick={() => setActiveTab('subscription')}
              className="text-orange-600 border-orange-600 hover:bg-orange-50"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Quota presque plein
            </Button>
          )}
          
          {stats.pendingKYC && (
            <Badge variant="destructive" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              KYC requis
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-2 h-auto p-2 bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
          <TabsTrigger value="overview" className="bg-white/80 hover:bg-white shadow-sm border border-border/20">
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="shop" className="bg-white/80 hover:bg-white shadow-sm border border-border/20">
            <Store className="h-4 w-4 mr-2" />
            Boutique
          </TabsTrigger>
          <TabsTrigger value="warehouses" className="bg-white/80 hover:bg-white shadow-sm border border-border/20">
            <Database className="h-4 w-4 mr-2" />
            Entrepôts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="bg-white/80 hover:bg-white shadow-sm border border-border/20">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="supermarket-pos" className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md">
            <Monitor className="h-4 w-4 mr-2" />
            POS Super
          </TabsTrigger>
          <TabsTrigger value="pos" className="bg-white/80 hover:bg-white shadow-sm border border-border/20">
            <Calculator className="h-4 w-4 mr-2" />
            POS
          </TabsTrigger>
          <TabsTrigger value="products" className="bg-white/80 hover:bg-white shadow-sm border border-border/20">
            <Package className="h-4 w-4 mr-2" />
            Produits
          </TabsTrigger>
          <TabsTrigger value="orders" className="bg-white/80 hover:bg-white shadow-sm border border-border/20">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Commandes
          </TabsTrigger>
          <TabsTrigger value="inventory" className="bg-white/80 hover:bg-white shadow-sm border border-border/20">
            <Package className="h-4 w-4 mr-2" />
            Stock
          </TabsTrigger>
          <TabsTrigger value="wallet" className="bg-white/80 hover:bg-white shadow-sm border border-border/20">
            <Wallet className="h-4 w-4 mr-2" />
            Portefeuille
          </TabsTrigger>
          <TabsTrigger value="subscription" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md">
            <Crown className="h-4 w-4 mr-2" />
            Abonnement
          </TabsTrigger>
          <TabsTrigger value="kyc" className="bg-white/80 hover:bg-white shadow-sm border border-border/20">
            <Settings className="h-4 w-4 mr-2" />
            KYC
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Indicateur de quota de stockage */}
          {(stats.storageUsed / stats.storageQuota) > 0.7 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Database className="h-5 w-5" />
                  Utilisation du stockage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Stockage utilisé</span>
                    <span className="font-medium">
                      {stats.storageUsed.toFixed(1)} / {stats.storageQuota} Go
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.storageUsed / stats.storageQuota) * 100, 100)}%` }}
                    />
                  </div>
                  {(stats.storageUsed / stats.storageQuota) > 0.9 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-orange-700">
                        Espace presque plein ! Passez à un plan supérieur.
                      </span>
                      <Button
                        size="sm"
                        onClick={() => setActiveTab('subscription')}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <ArrowUp className="h-3 w-3 mr-1" />
                        Mettre à niveau
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-orange-700">
                      Pensez à passer à un plan supérieur pour plus d'espace.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alertes */}
          {(stats.pendingKYC || stats.lowStockProducts > 0) && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Alertes importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.pendingKYC && (
                  <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <span>Votre KYC est en attente. Complétez votre vérification pour activer votre boutique.</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('kyc')}
                    >
                      Compléter KYC
                    </Button>
                  </div>
                )}
                {stats.lowStockProducts > 0 && (
                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <span>{stats.lowStockProducts} produit(s) en stock faible</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('inventory')}
                    >
                      Voir stock
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeProducts} actifs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commandes</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingOrders} en attente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalRevenue.toLocaleString()} GNF
                </div>
                <p className="text-xs text-muted-foreground">
                  Total des ventes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Solde</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.walletBalance.toLocaleString()} GNF
                </div>
                <p className="text-xs text-muted-foreground">
                  Disponible
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={() => setActiveTab('supermarket-pos')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                POS Supermarché
              </Button>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => setActiveTab('pos')}
              >
                <Calculator className="h-4 w-4 mr-2" />
                POS Classique
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  setActiveTab('products');
                  // Déclencher l'ouverture du formulaire d'ajout de produit
                  setTimeout(() => {
                    const addButton = document.querySelector('[data-add-product-button]') as HTMLButtonElement;
                    if (addButton) addButton.click();
                  }, 100);
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveTab('orders')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir commandes
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveTab('wallet')}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Demander retrait
              </Button>
            </CardContent>
          </Card>
          
          {/* Accès direct à la boutique */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Accès boutique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Gérez votre boutique professionnelle depuis l'onglet dédié
                  </p>
                  <Button 
                    onClick={() => setActiveTab('shop')}
                    variant="outline"
                  >
                    <Store className="mr-2 h-4 w-4" />
                    Aller à la boutique
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop" className="space-y-6">
          <VendorShopInterface />
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-6">
          <MultiWarehouseManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="supermarket-pos">
          <SupermarketPOS />
        </TabsContent>

        <TabsContent value="pos">
          <ModernPOS />
        </TabsContent>

        <TabsContent value="products">
          <VendorProducts />
        </TabsContent>

        <TabsContent value="orders">
          <VendorOrders />
        </TabsContent>

        <TabsContent value="inventory">
          <VendorInventory />
        </TabsContent>

        <TabsContent value="wallet">
          <VendorWallet />
        </TabsContent>

        <TabsContent value="subscription">
          <SubscriptionManager />
        </TabsContent>

        <TabsContent value="kyc">
          <KYCVerification />
        </TabsContent>
      </Tabs>
    </div>
  );
}