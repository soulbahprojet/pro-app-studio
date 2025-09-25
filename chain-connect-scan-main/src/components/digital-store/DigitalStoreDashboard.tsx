import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Store,
  Plus,
  BarChart3,
  Package,
  TrendingUp,
  Euro,
  Eye,
  ShoppingCart,
  Sparkles,
  Settings,
  Tag
} from 'lucide-react';
import { CreateShopModal } from './CreateShopModal';
import { ProductManagement } from './ProductManagement';
import { PromotionManager } from './PromotionManager';
import { ShopAnalytics } from './ShopAnalytics';
import { AIContentGenerator } from './AIContentGenerator';

interface DigitalShop {
  id: string;
  name: string;
  description: string;
  slug: string;
  is_active: boolean;
  created_at: string;
}

interface ShopStats {
  totalProducts: number;
  totalRevenue: number;
  totalSales: number;
  analytics: any[];
}

export default function DigitalStoreDashboard() {
  const { user } = useAuth();
  const [shops, setShops] = useState<DigitalShop[]>([]);
  const [selectedShop, setSelectedShop] = useState<DigitalShop | null>(null);
  const [shopStats, setShopStats] = useState<ShopStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadShops();
    }
  }, [user]);

  useEffect(() => {
    if (selectedShop) {
      loadShopStats();
    }
  }, [selectedShop]);

  const loadShops = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('digital-store-management', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      if (data?.shops) {
        setShops(data.shops);
        if (data.shops.length > 0 && !selectedShop) {
          setSelectedShop(data.shops[0]);
        }
      }
    } catch (error) {
      console.error('Error loading shops:', error);
      toast.error('Erreur lors du chargement des boutiques');
    } finally {
      setLoading(false);
    }
  };

  const loadShopStats = async () => {
    if (!selectedShop) return;

    try {
      const { data, error } = await supabase.functions.invoke('digital-store-management', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      setShopStats(data);
    } catch (error) {
      console.error('Error loading shop stats:', error);
    }
  };

  const handleCreateShop = async (shopData: { name: string; description: string; slug: string }) => {
    try {
      const { data, error } = await supabase.functions.invoke('digital-store-management', {
        body: {
          ...shopData,
          operation: 'create-shop'
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      setShops(prev => [data.shop, ...prev]);
      setSelectedShop(data.shop);
      setShowCreateModal(false);
      toast.success('Boutique créée avec succès !');
    } catch (error) {
      console.error('Error creating shop:', error);
      toast.error('Erreur lors de la création de la boutique');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder à votre boutique numérique.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Chargement de votre boutique...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            Boutique Numérique Pro
          </h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos produits numériques avec IA intégrée et livraison automatique
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Créer une boutique
          </Button>
        </div>
      </div>

      {/* Shop Selector */}
      {shops.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {shops.map((shop) => (
            <Button
              key={shop.id}
              variant={selectedShop?.id === shop.id ? "default" : "outline"}
              onClick={() => setSelectedShop(shop)}
              className="flex items-center gap-2"
            >
              <Store className="h-4 w-4" />
              {shop.name}
              {shop.is_active && <Badge variant="secondary" className="ml-2">Actif</Badge>}
            </Button>
          ))}
        </div>
      )}

      {/* No shops state */}
      {shops.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Aucune boutique trouvée</CardTitle>
            <CardDescription>
              Créez votre première boutique numérique pour commencer à vendre vos produits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowCreateModal(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Créer ma première boutique
            </Button>
          </CardContent>
        </Card>
      ) : selectedShop ? (
        <>
          {/* Quick Stats */}
          {shopStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produits</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{shopStats.totalProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 ce mois
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {shopStats.totalRevenue.toLocaleString()} GNF
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +12% vs mois dernier
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ventes</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{shopStats.totalSales}</div>
                  <p className="text-xs text-muted-foreground">
                    +8 cette semaine
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3.2%</div>
                  <p className="text-xs text-muted-foreground">
                    +0.5% vs mois dernier
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Aperçu
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Produits
              </TabsTrigger>
              <TabsTrigger value="ai-content" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                IA Contenu
              </TabsTrigger>
              <TabsTrigger value="promotions" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Promotions
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Paramètres
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Activité récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Nouvelle vente</p>
                          <p className="text-sm text-muted-foreground">Formation React - 49,000 GNF</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Produit ajouté</p>
                          <p className="text-sm text-muted-foreground">Guide Marketing Digital</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actions rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" onClick={() => setActiveTab('products')}>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un produit
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('ai-content')}>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer du contenu IA
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('promotions')}>
                      <Tag className="h-4 w-4 mr-2" />
                      Créer une promotion
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('analytics')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Voir les statistiques
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products">
              <ProductManagement shopId={selectedShop.id} />
            </TabsContent>

            <TabsContent value="ai-content">
              <AIContentGenerator shopId={selectedShop.id} />
            </TabsContent>

            <TabsContent value="promotions">
              <PromotionManager shopId={selectedShop.id} />
            </TabsContent>

            <TabsContent value="analytics">
              <ShopAnalytics shopId={selectedShop.id} />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres de la boutique</CardTitle>
                  <CardDescription>
                    Configurez les paramètres de votre boutique {selectedShop.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">URL de la boutique</p>
                    <p className="text-sm text-muted-foreground">
                      https://224solutions.com/shop/{selectedShop.slug}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Livraison automatique</p>
                    <Badge variant="secondary">Activée</Badge>
                  </div>
                  <div>
                    <p className="font-medium mb-2">Notifications clients</p>
                    <Badge variant="secondary">Activées</Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : null}

      {/* Create Shop Modal */}
      <CreateShopModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateShop={handleCreateShop}
      />
    </div>
  );
}