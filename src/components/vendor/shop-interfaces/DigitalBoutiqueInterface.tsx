import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Globe, Package, TrendingUp, Users, DollarSign, Plus, Eye, Edit, 
  Trash2, ShoppingCart, Download, Code, Zap, BarChart3, Settings,
  Image, Upload, ExternalLink, Percent, Calendar, Star, AlertTriangle
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';

interface DigitalBoutiqueInterfaceProps {
  shopId: string;
  onAddProduct?: () => void;
  onManageOrders?: () => void;
  onDeleteShop?: () => void;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'physical' | 'digital';
  category: string;
  is_active: boolean;
  images?: string[];
  digital_file_url?: string;
  download_limit?: number;
  dropshipping_supplier?: string;
  created_at: string;
}

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  revenue: number;
  customers: number;
  conversions: number;
}

export default function DigitalBoutiqueInterface({ 
  shopId, 
  onAddProduct, 
  onManageOrders,
  onDeleteShop 
}: DigitalBoutiqueInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    revenue: 0,
    customers: 0,
    conversions: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showDropshipping, setShowDropshipping] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    type: 'digital' as 'physical' | 'digital',
    category: '',
    digital_file_url: '',
    download_limit: '5',
    dropshipping_supplier: '',
    images: [] as File[]
  });

  useEffect(() => {
    loadBoutiqueData();
  }, [user]);

  const loadBoutiqueData = async () => {
    try {
      setLoading(true);
      
      // Charger les produits
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Charger les commandes
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_amount, status, customer_id')
        .eq('seller_id', user?.id);

      // Calculer les statistiques
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(p => p.is_active).length || 0;
      const totalOrders = ordersData?.length || 0;
      const revenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const uniqueCustomers = new Set(ordersData?.map(o => o.customer_id)).size || 0;
      const conversions = totalProducts > 0 ? Math.round((totalOrders / totalProducts) * 100) : 0;

      setStats({
        totalProducts,
        activeProducts,
        totalOrders,
        revenue,
        customers: uniqueCustomers,
        conversions
      });

    } catch (error) {
      console.error('Error loading boutique data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la boutique",
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

      // Upload images si disponibles
      if (productForm.images && productForm.images.length > 0) {
        for (const image of productForm.images) {
          const fileExtension = image.name.split('.').pop();
          const fileName = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, image);

          if (!uploadError && uploadData) {
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
        type: productForm.type,
        category: productForm.category.trim(),
        is_active: true,
        currency: 'GNF' as const,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        digital_file_url: productForm.type === 'digital' ? productForm.digital_file_url : null,
        download_limit: productForm.type === 'digital' ? parseInt(productForm.download_limit) : null,
        dropshipping_supplier: productForm.dropshipping_supplier || null
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès à votre boutique numérique"
      });

      setProductForm({
        name: '',
        description: '',
        price: '',
        type: 'digital',
        category: '',
        digital_file_url: '',
        download_limit: '5',
        dropshipping_supplier: '',
        images: []
      });
      setShowAddProduct(false);
      loadBoutiqueData();

    } catch (error: any) {
      console.error('Add product error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le produit",
        variant: "destructive"
      });
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

      loadBoutiqueData();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le produit",
        variant: "destructive"
      });
    }
  };

  const handleDeleteShop = async () => {
    try {
      // Supprimer d'abord tous les produits de la boutique
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
        description: "Votre boutique a été supprimée avec succès"
      });

      setShowDeleteConfirm(false);
      onDeleteShop?.();

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la boutique",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Chargement de votre boutique numérique...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Boutique Numérique */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Globe className="h-6 w-6" />
            Boutique Numérique E-commerce
            <Badge className="bg-purple-100 text-purple-700">Pro</Badge>
          </CardTitle>
          <p className="text-purple-600">
            Solution e-commerce complète avec dropshipping, analytics avancées et marketing automation
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistiques Principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Produits</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{stats.totalProducts}</div>
                <p className="text-xs text-blue-600">{stats.activeProducts} actifs</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Commandes</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{stats.totalOrders}</div>
                <p className="text-xs text-green-600">Total ventes</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Revenus</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">{stats.revenue.toLocaleString()} GNF</div>
                <p className="text-xs text-purple-600">Chiffre d'affaires</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Clients</span>
                </div>
                <div className="text-2xl font-bold text-orange-700">{stats.customers}</div>
                <p className="text-xs text-orange-600">Clients uniques</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-800">Conversion</span>
                </div>
                <div className="text-2xl font-bold text-teal-700">{stats.conversions}%</div>
                <p className="text-xs text-teal-600">Taux conversion</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">Performance</span>
                </div>
                <div className="text-2xl font-bold text-indigo-700">Pro</div>
                <p className="text-xs text-indigo-600">Niveau boutique</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions Rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button onClick={() => setShowAddProduct(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Produit
              </Button>
              <Button variant="outline" onClick={() => setShowPromotions(true)} className="w-full">
                <Percent className="h-4 w-4 mr-2" />
                Promotions
              </Button>
              <Button variant="outline" onClick={() => setShowDropshipping(true)} className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Dropshipping
              </Button>
              <Button variant="outline" onClick={onManageOrders} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestion des Produits</h3>
            <Button onClick={() => setShowAddProduct(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Produit
            </Button>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={product.type === 'digital' ? 'default' : 'secondary'}>
                            {product.type === 'digital' ? 'Numérique' : 'Physique'}
                          </Badge>
                          <Badge variant={product.is_active ? 'default' : 'outline'}>
                            {product.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            {product.price.toLocaleString()} GNF
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de gestion des commandes avec suivi en temps réel, statuts et notifications clients.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <Card>
            <CardHeader>
              <CardTitle>Marketing & Promotions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Outils marketing avancés : coupons, promotions, email marketing, abandons de panier.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avancées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Tableaux de bord détaillés avec métriques de performance, conversion et ROI.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Paramètres de la boutique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-red-600 mb-4">Zone de danger</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800">Supprimer la boutique</h4>
                      <p className="text-sm text-red-600 mt-1">
                        Cette action est irréversible. Tous vos produits, commandes et données seront définitivement supprimés.
                      </p>
                      <Button 
                        variant="destructive" 
                        className="mt-3"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer définitivement la boutique
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Ajout Produit */}
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
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du produit"
                />
              </div>
              <div>
                <Label htmlFor="price">Prix (GNF) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Prix en GNF"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée du produit"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type de produit</Label>
                <Select
                  value={productForm.type}
                  onValueChange={(value: 'physical' | 'digital') => 
                    setProductForm(prev => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">Produit numérique</SelectItem>
                    <SelectItem value="physical">Produit physique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={productForm.category}
                  onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Catégorie du produit"
                />
              </div>
            </div>

            {productForm.type === 'digital' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="digital_file_url">URL du fichier numérique</Label>
                  <Input
                    id="digital_file_url"
                    value={productForm.digital_file_url}
                    onChange={(e) => setProductForm(prev => ({ ...prev, digital_file_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="download_limit">Limite de téléchargement</Label>
                  <Input
                    id="download_limit"
                    type="number"
                    value={productForm.download_limit}
                    onChange={(e) => setProductForm(prev => ({ ...prev, download_limit: e.target.value }))}
                    placeholder="5"
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="dropshipping_supplier">Fournisseur Dropshipping (optionnel)</Label>
              <Input
                id="dropshipping_supplier"
                value={productForm.dropshipping_supplier}
                onChange={(e) => setProductForm(prev => ({ ...prev, dropshipping_supplier: e.target.value }))}
                placeholder="Nom du fournisseur"
              />
            </div>

            <div>
              <Label htmlFor="images">Images du produit</Label>
              <Input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    setProductForm(prev => ({ ...prev, images: Array.from(files) }));
                  }
                }}
              />
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

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous absolument sûr de vouloir supprimer cette boutique ? Cette action est irréversible et supprimera :
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Tous vos produits ({stats.totalProducts})</li>
                <li>• Toutes vos commandes ({stats.totalOrders})</li>
                <li>• Toutes vos données de vente</li>
                <li>• Votre historique client</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteShop}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
