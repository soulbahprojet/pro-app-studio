import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  BarChart3,
  Plus,
  Eye,
  Edit,
  Settings,
  AlertTriangle,
  Trash2,
  Upload,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Sparkles,
  Brain,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  description?: string;
  images?: string[];
  category?: string;
  is_active: boolean;
  created_at: string;
}

interface StatsData {
  totalProducts: number;
  totalStock: number;
  pendingOrders: number;
  lowStock: number;
  deliveries: number;
  revenue: number;
  customers: number;
}

interface PhysicalProductsInterfaceProps {
  shopId: string;
  onAddProduct?: () => void;
  onManageInventory?: () => void;
}

export default function PhysicalProductsInterface({ 
  shopId, 
  onAddProduct, 
  onManageInventory 
}: PhysicalProductsInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalProducts: 0,
    totalStock: 0,
    pendingOrders: 0,
    lowStock: 0,
    deliveries: 0,
    revenue: 0,
    customers: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    images: [] as File[]
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les produits
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .eq('type', 'physical')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      setProducts(productsData || []);

      // Charger les commandes en attente
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('seller_id', user?.id)
        .in('status', ['pending', 'confirmed']);

      // Calculer les statistiques
      const totalProducts = productsData?.length || 0;
      const totalStock = productsData?.reduce((sum, p) => sum + (p.stock_quantity || 0), 0) || 0;
      const lowStock = productsData?.filter(p => (p.stock_quantity || 0) <= 5).length || 0;
      const pendingOrders = ordersData?.length || 0;

      setStats({
        totalProducts,
        totalStock,
        pendingOrders,
        lowStock,
        deliveries: 0, // À implémenter avec le système de livraison
        revenue: 0, // À calculer avec les ventes
        customers: 0 // À calculer avec les commandes uniques
      });

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir au moins le nom et le prix",
        variant: "destructive"
      });
      return;
    }

    try {
      let uploadedImageUrls: string[] = [];

      // Upload images if any are selected
      if (productForm.images && productForm.images.length > 0) {
        for (const image of productForm.images) {
          const fileExtension = image.name.split('.').pop();
          const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, image, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            toast({
              title: "Erreur d'upload",
              description: `Impossible d'uploader l'image ${image.name}`,
              variant: "destructive"
            });
            continue;
          }

          if (uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(uploadData.path);
            
            uploadedImageUrls.push(publicUrl);
          }
        }
      }

      
      
      const productData = {
        seller_id: user?.id,
        name: productForm.name.trim(),
        description: productForm.description.trim(),
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity) || 0,
        category: productForm.category.trim(),
        type: 'physical' as const,
        is_active: true,
        currency: 'GNF' as const,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null
      };

      console.log('Inserting product data:', productData);

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast({
        title: "Produit ajouté",
        description: `Le produit a été ajouté avec succès${uploadedImageUrls.length > 0 ? ` avec ${uploadedImageUrls.length} image(s)` : ''}`
      });

      setProductForm({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: '',
        images: []
      });
      setShowAddProduct(false);
      loadData();

    } catch (error: any) {
      console.error('Add product error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le produit",
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setProductForm(prev => ({
        ...prev,
        images: fileArray
      }));
      
      toast({
        title: "Images sélectionnées",
        description: `${fileArray.length} image(s) sélectionnée(s)`,
      });
    }
  };

  const handleAIOptimization = async (action: string) => {
    if (!productForm.name && !productForm.description) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez saisir au moins le nom du produit pour l'optimisation AI",
        variant: "destructive"
      });
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-product-optimization', {
        body: {
          action: action,
          productData: productForm
        }
      });

      if (error) throw error;

      if (data.result) {
        switch (action) {
          case 'optimize_title':
            setAiInsights(`Suggestions de titres optimisés :\n\n${data.result}`);
            break;
          case 'generate_description':
            setProductForm(prev => ({ ...prev, description: data.result }));
            toast({
              title: "Description générée",
              description: "Une description optimisée a été générée par l'AI",
            });
            return;
          case 'suggest_price':
            setAiInsights(`Analyse de prix :\n\n${data.result}`);
            break;
          case 'analyze_market':
            setAiInsights(`Analyse du marché :\n\n${data.result}`);
            break;
        }
        setShowAIInsights(true);
      }
    } catch (error: any) {
      console.error('AI optimization error:', error);
      toast({
        title: "Erreur AI",
        description: error.message || "Impossible d'obtenir l'optimisation AI",
        variant: "destructive"
      });
    } finally {
      setAiLoading(false);
    }
  };

  const getSmartInventoryInsights = async () => {
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-inventory-insights');

      if (error) throw error;

      if (data.insights) {
        setAiInsights(data.insights);
        setShowAIInsights(true);
      }
    } catch (error: any) {
      console.error('Smart inventory insights error:', error);
      toast({
        title: "Erreur Insights",
        description: error.message || "Impossible d'obtenir les insights d'inventaire",
        variant: "destructive"
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès"
      });

      loadData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le produit",
        variant: "destructive"
      });
    }
  };

  const handleUpdateStock = async (productId: string, newStock: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Stock mis à jour",
        description: "Le stock a été mis à jour avec succès"
      });

      loadData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le stock",
        variant: "destructive"
      });
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
      {/* Tableau de bord produits physiques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Gestion des produits physiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Stock total</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalStock}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalProducts} produits en stock
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Commandes</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">En attente</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Stock faible</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
              <p className="text-xs text-muted-foreground">À réapprovisionner</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Livraisons</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.deliveries}</div>
              <p className="text-xs text-muted-foreground">En cours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions principales */}
      <Card>
        <CardHeader>
          <CardTitle>Actions principales</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={() => setShowAddProduct(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowInventory(true)}
            className="w-full"
          >
            <Package className="h-4 w-4 mr-2" />
            Gérer le stock
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowStats(true)}
            className="w-full"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Voir les statistiques
          </Button>
          
          <Button 
            variant="outline" 
            onClick={getSmartInventoryInsights}
            disabled={aiLoading}
            className="w-full text-purple-600 border-purple-600 hover:bg-purple-50"
          >
            {aiLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            Insights AI
          </Button>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>Mes produits ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun produit</h3>
              <p className="text-muted-foreground mb-4">
                Commencez par ajouter votre premier produit
              </p>
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{product.name}</h4>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Actif" : "Inactif"}
                        </Badge>
                        {(product.stock_quantity || 0) <= 5 && (
                          <Badge variant="destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Stock faible
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.description || "Aucune description"}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium text-green-600">
                          {product.price.toLocaleString()} GNF
                        </span>
                        <span>Stock: {product.stock_quantity || 0}</span>
                        {product.category && (
                          <Badge variant="outline">{product.category}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fonctionnalités spécialisées */}
      <Card>
        <CardHeader>
          <CardTitle>Outils spécialisés pour produits physiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Package className="h-4 w-4" />
                Gestion du stock avancée
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Suivi automatique des stocks, alertes de rupture, gestion des variantes
              </p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowInventory(true)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurer
              </Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4" />
                Panier intelligent
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Panier avec recommandations, promotions groupées, calcul automatique
              </p>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Voir détails
              </Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4" />
                Paiement sécurisé
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Paiements multiples, escrow automatique, factures numériques
              </p>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurer
              </Button>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <Truck className="h-4 w-4" />
                Suivi de livraison
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                Tracking GPS, notifications automatiques, gestion des transporteurs
              </p>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Gérer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal d'ajout de produit */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau produit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  placeholder="Nom du produit..."
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  placeholder="Ex: Électronique, Vêtements..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                placeholder="Description du produit..."
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIOptimization('generate_description')}
                  disabled={aiLoading || !productForm.name}
                  className="text-purple-600 border-purple-600 hover:bg-purple-50"
                >
                  {aiLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-2"></div>
                  ) : (
                    <Sparkles className="h-3 w-3 mr-2" />
                  )}
                  Générer avec AI
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIOptimization('optimize_title')}
                  disabled={aiLoading || !productForm.name}
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <Brain className="h-3 w-3 mr-2" />
                  Optimiser titre
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIOptimization('suggest_price')}
                  disabled={aiLoading || !productForm.name}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <TrendingUpIcon className="h-3 w-3 mr-2" />
                  Prix suggéré
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (GNF) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock initial</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="images">Images du produit</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <input
                  type="file"
                  id="product-images"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Cliquez pour ajouter des images ou glissez-déposez
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('product-images')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choisir des images
                  </Button>
                  {productForm.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        {productForm.images.length} image(s) sélectionnée(s)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {productForm.images.map((file, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {file.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddProduct}>
                Ajouter le produit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de gestion d'inventaire */}
      <Dialog open={showInventory} onOpenChange={setShowInventory}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Gestion du stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun produit à gérer</h3>
                <p className="text-muted-foreground mb-4">
                  Vous devez d'abord ajouter des produits pour pouvoir gérer leur stock.
                </p>
                <Button 
                  onClick={() => {
                    setShowInventory(false);
                    setShowAddProduct(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter mon premier produit
                </Button>
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Stock actuel: {product.stock_quantity || 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        className="w-20"
                        defaultValue={product.stock_quantity || 0}
                        onBlur={(e) => {
                          const newStock = parseInt(e.target.value) || 0;
                          if (newStock !== (product.stock_quantity || 0)) {
                            handleUpdateStock(product.id, newStock);
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">unités</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal des statistiques */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Statistiques détaillées</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Ventes totales</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.revenue.toLocaleString()} GNF</div>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Clients</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.customers}</div>
              <p className="text-xs text-muted-foreground">Clients uniques</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Temps moyen</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">2.5h</div>
              <p className="text-xs text-muted-foreground">Traitement commande</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal des insights AI */}
      <Dialog open={showAIInsights} onOpenChange={setShowAIInsights}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Insights Intelligence Artificielle
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800">Analyse AI</span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{aiInsights}</div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowAIInsights(false)}>
                Fermer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}