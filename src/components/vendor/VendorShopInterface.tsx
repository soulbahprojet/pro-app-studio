import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProfessionalShopCreation } from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import ShopInterfaceManager from './shop-interfaces/ShopInterfaceManager';
import {
  Store,
  Plus,
  Settings,
  Eye,
  TrendingUp,
  Users,
  Package,
  Star,
  MapPin,
  Clock,
  Palette,
  Globe,
  BarChart3,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';

interface ShopStats {
  hasShop: boolean;
  shopName: string;
  shopType: string;
  isActive: boolean;
  productCount: number;
  visitorCount: number;
  salesCount: number;
  rating: number;
  subscriptionPlan: string;
}

export default function VendorShopInterface() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateShop, setShowCreateShop] = useState(false);
  const [showManageShop, setShowManageShop] = useState(false);
  const [shopStats, setShopStats] = useState<ShopStats>({
    hasShop: false,
    shopName: '',
    shopType: '',
    isActive: false,
    productCount: 0,
    visitorCount: 0,
    salesCount: 0,
    rating: 0,
    subscriptionPlan: 'basic'
  });
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  React.useEffect(() => {
    if (user) {
      loadShopData();
    }
  }, [user]);

  const loadShopData = async () => {
    try {
      setLoading(true);
      
      // Vérifier si l'utilisateur a une boutique
      const { data: shopData, error } = await supabase
        .from('seller_shops')
        .select('*')
        .eq('seller_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (shopData) {
        // Compter les produits actifs séparément
        const { data: productsData } = await supabase
          .from('products')
          .select('id')
          .eq('seller_id', user?.id)
          .eq('is_active', true);
        
        const activeProductsCount = productsData?.length || 0;
        
        setShopStats({
          hasShop: true,
          shopName: shopData.shop_name,
          shopType: shopData.business_type || 'mixed',
          isActive: shopData.is_active,
          productCount: activeProductsCount,
          visitorCount: 0, // À implémenter avec analytics
          salesCount: 0, // À implémenter avec les commandes
          rating: 0, // À implémenter avec les avis
          subscriptionPlan: shopData.subscription_plan
        });
      } else {
        setShopStats(prev => ({ ...prev, hasShop: false }));
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la boutique",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getShopTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'physical-products': 'Produits physiques',
      'digital-services': 'Services numériques',
      'restaurant': 'Restaurant/Livraison',
      'beauty-salon': 'Salon de beauté',
      'professional-services': 'Services professionnels',
      'events': 'Événementiel',
      'education': 'Éducation/Formation',
      'health-wellness': 'Santé/Bien-être',
      'artisanal': 'Artisanat',
      'transport': 'Transport',
      'agriculture': 'Agriculture',
      'entertainment': 'Divertissement',
      'fashion-specialized': 'Mode spécialisée',
      'home-services': 'Services à domicile',
      'mixed': 'Boutique mixte'
    };
    return typeMap[type] || type;
  };

  const handleDeleteShop = async () => {
    setDeleting(true);
    try {
      // Supprimer d'abord les produits associés
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .eq('seller_id', user?.id);

      if (productsError) throw productsError;

      // Supprimer la boutique
      const { error: shopError } = await supabase
        .from('seller_shops')
        .delete()
        .eq('seller_id', user?.id);

      if (shopError) throw shopError;

      toast({
        title: "Boutique supprimée",
        description: "Votre boutique et tous ses produits ont été supprimés définitivement"
      });

      // Recharger les données pour mettre à jour l'interface
      loadShopData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la boutique",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      {showCreateShop && (
        <ProfessionalShopCreation 
          isOpen={showCreateShop}
          onClose={() => setShowCreateShop(false)}
          onSuccess={() => {
            setShowCreateShop(false);
            loadShopData();
            toast({
              title: "Boutique créée !",
              description: "Votre boutique professionnelle a été créée avec succès"
            });
          }}
        />
      )}

      {showManageShop && shopStats.hasShop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Interface spécialisée - {shopStats.shopName}</h2>
                <Button variant="outline" onClick={() => setShowManageShop(false)}>
                  Fermer
                </Button>
              </div>
              <ShopInterfaceManager 
                shopType={shopStats.shopType}
                shopId={shopStats.shopName}
                shopName={shopStats.shopName}
                onNavigateToProducts={() => {/* Navigate to products */}}
                onNavigateToOrders={() => {/* Navigate to orders */}}
                onNavigateToSettings={() => setShowManageShop(false)}
              />
            </div>
          </div>
        </div>
      )}

      {!shopStats.hasShop ? (
        // Interface de création de boutique
        <div className="space-y-6">
          <Card className="border-2 border-dashed border-primary/20">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Créez votre boutique professionnelle</CardTitle>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Lancez votre boutique en ligne avec marketplace catégorisé, 
                interface responsive et toutes les fonctionnalités professionnelles
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">15 types d'activités</h4>
                    <p className="text-sm text-muted-foreground">
                      Produits physiques, services, restaurant, salon, et plus
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Marketplace intégré</h4>
                    <p className="text-sm text-muted-foreground">
                      Visibilité automatique sur le marketplace catégorisé
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Palette className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Interface responsive</h4>
                    <p className="text-sm text-muted-foreground">
                      Parfaite sur mobile, tablette et ordinateur
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setShowCreateShop(true)}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8"
              >
                <Plus className="mr-2 h-5 w-5" />
                Créer ma boutique professionnelle
              </Button>
            </CardContent>
          </Card>

          {/* Avantages de la boutique professionnelle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Augmentez vos ventes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • Visibilité sur le marketplace principal
                </p>
                <p className="text-sm text-muted-foreground">
                  • Filtrage par catégorie pour clients ciblés
                </p>
                <p className="text-sm text-muted-foreground">
                  • Localisation exacte pour services à proximité
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  Gestion simplifiée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • Modification facile depuis n'importe quel appareil
                </p>
                <p className="text-sm text-muted-foreground">
                  • Gestion des horaires et informations de contact
                </p>
                <p className="text-sm text-muted-foreground">
                  • Suppression sécurisée avec confirmation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        // Interface de gestion de boutique existante
        <div className="space-y-6">
          {/* En-tête de la boutique */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Store className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{shopStats.shopName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={shopStats.isActive ? "default" : "secondary"}>
                        {shopStats.isActive ? 'Boutique active' : 'Boutique inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {getShopTypeDisplayName(shopStats.shopType)}
                      </Badge>
                      <Badge variant="outline">
                        Plan {shopStats.subscriptionPlan}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowManageShop(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Gérer la boutique
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/marketplace`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir sur le marketplace
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          Supprimer la boutique
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Votre boutique "{shopStats.shopName}" et tous ses produits ({shopStats.productCount} produits) seront définitivement supprimés du marketplace.
                          <br /><br />
                          Êtes-vous sûr de vouloir continuer ?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteShop}
                          disabled={deleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleting ? 'Suppression...' : 'Supprimer définitivement'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistiques de la boutique */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produits actifs</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shopStats.productCount}</div>
                <p className="text-xs text-muted-foreground">
                  Visibles sur le marketplace
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visiteurs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shopStats.visitorCount}</div>
                <p className="text-xs text-muted-foreground">
                  Ce mois-ci
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventes</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shopStats.salesCount}</div>
                <p className="text-xs text-muted-foreground">
                  Commandes traitées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Note</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {shopStats.rating > 0 ? shopStats.rating.toFixed(1) : '-'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Satisfaction client
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions rapides pour la boutique */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline"
                onClick={() => setShowManageShop(true)}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                Modifier les informations
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.open(`/marketplace`, '_blank')}
                className="w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir la boutique
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Voir les statistiques
              </Button>
            </CardContent>
          </Card>

          {/* Conseils d'optimisation */}
          {shopStats.productCount === 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Package className="h-5 w-5" />
                  Optimisez votre boutique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 mb-3">
                  Votre boutique est créée mais aucun produit n'est encore ajouté. 
                  Commencez par ajouter vos premiers produits pour être visible sur le marketplace.
                </p>
                <Button 
                  onClick={() => {/* Navigate to products tab */}}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter des produits
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
