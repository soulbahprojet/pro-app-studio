import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Store, Package, TrendingUp, Users, DollarSign, Plus, Eye, Edit, 
  Trash2, ShoppingCart, Download, Truck, BarChart3, Settings,
  Globe, Archive, Calendar, Filter
} from 'lucide-react';

interface MixedBoutiqueInterfaceProps {
  shopId: string;
  onAddProduct?: () => void;
  onManageOrders?: () => void;
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
  stock_quantity?: number;
  digital_file_url?: string;
  created_at: string;
}

export default function MixedBoutiqueInterface({ 
  shopId, 
  onAddProduct, 
  onManageOrders 
}: MixedBoutiqueInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    physicalProducts: 0,
    digitalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    customers: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filterType, setFilterType] = useState<'all' | 'physical' | 'digital'>('all');
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    type: 'physical' as 'physical' | 'digital',
    category: '',
    stock_quantity: '',
    digital_file_url: '',
    images: [] as File[]
  });

  useEffect(() => {
    loadMixedBoutiqueData();
  }, [user]);

  const loadMixedBoutiqueData = async () => {
    try {
      setLoading(true);
      
      // Charger tous les produits
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Charger les commandes
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, total_amount, status, customer_id')
        .eq('seller_id', user?.id);

      // Calculer les statistiques
      const totalProducts = productsData?.length || 0;
      const physicalProducts = productsData?.filter(p => p.type === 'physical').length || 0;
      const digitalProducts = productsData?.filter(p => p.type === 'digital').length || 0;
      const totalOrders = ordersData?.length || 0;
      const revenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const uniqueCustomers = new Set(ordersData?.map(o => o.customer_id)).size || 0;

      setStats({
        totalProducts,
        physicalProducts,
        digitalProducts,
        totalOrders,
        revenue,
        customers: uniqueCustomers
      });

    } catch (error) {
      console.error('Error loading mixed boutique data:', error);
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
        stock_quantity: productForm.type === 'physical' ? parseInt(productForm.stock_quantity) || 0 : null,
        digital_file_url: productForm.type === 'digital' ? productForm.digital_file_url : null
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast({
        title: "Produit ajouté",
        description: `Le produit ${productForm.type === 'digital' ? 'numérique' : 'physique'} a été ajouté avec succès`
      });

      setProductForm({
        name: '',
        description: '',
        price: '',
        type: 'physical',
        category: '',
        stock_quantity: '',
        digital_file_url: '',
        images: []
      });
      setShowAddProduct(false);
      loadMixedBoutiqueData();

    } catch (error: any) {
      console.error('Add product error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le produit",
        variant: "destructive"
      });
    }
  };

  const filteredProducts = products.filter(product => {
    if (filterType === 'all') return true;
    return product.type === filterType;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Chargement de votre boutique mixte...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Boutique Mixte */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Store className="h-6 w-6" />
            Boutique Mixte - Physique & Numérique
            <Badge className="bg-indigo-100 text-indigo-700">Hybride</Badge>
          </CardTitle>
          <p className="text-indigo-600">
            Gestion unifiée de produits physiques et numériques avec multi-transporteurs et checkout combiné
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="logistics">Logistique</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Total</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{stats.totalProducts}</div>
                <p className="text-xs text-blue-600">Produits</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Archive className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Physiques</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{stats.physicalProducts}</div>
                <p className="text-xs text-green-600">Avec stock</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Numériques</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">{stats.digitalProducts}</div>
                <p className="text-xs text-purple-600">Téléchargeables</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Commandes</span>
                </div>
                <div className="text-2xl font-bold text-orange-700">{stats.totalOrders}</div>
                <p className="text-xs text-orange-600">Mixtes</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-800">Revenus</span>
                </div>
                <div className="text-2xl font-bold text-teal-700">{stats.revenue.toLocaleString()}</div>
                <p className="text-xs text-teal-600">GNF</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-rose-50 to-rose-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-rose-600" />
                  <span className="text-sm font-medium text-rose-800">Clients</span>
                </div>
                <div className="text-2xl font-bold text-rose-700">{stats.customers}</div>
                <p className="text-xs text-rose-600">Uniques</p>
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
              <Button variant="outline" onClick={onManageOrders} className="w-full">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Commandes Mixtes
              </Button>
              <Button variant="outline" className="w-full">
                <Truck className="h-4 w-4 mr-2" />
                Multi-Transporteurs
              </Button>
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics Unifiées
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Catalogue Mixte</h3>
            <div className="flex items-center gap-2">
              <Select value={filterType} onValueChange={(value: 'all' | 'physical' | 'digital') => setFilterType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="physical">Produits physiques</SelectItem>
                  <SelectItem value="digital">Produits numériques</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setShowAddProduct(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Produit
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredProducts.map((product) => (
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
                          {product.type === 'physical' && product.stock_quantity !== undefined && (
                            <span className="text-sm text-muted-foreground">
                              Stock: {product.stock_quantity}
                            </span>
                          )}
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
                      <Button variant="outline" size="sm">
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
              <CardTitle>Commandes Mixtes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gestion unifiée des commandes physiques et numériques avec checkout combiné et livraison multi-transporteurs.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logistics">
          <Card>
            <CardHeader>
              <CardTitle>Logistique Multi-Transporteurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configuration des transporteurs, zones de livraison et tarification automatique.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Ajout Produit */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un produit mixte</DialogTitle>
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
                    <SelectItem value="physical">Produit physique</SelectItem>
                    <SelectItem value="digital">Produit numérique</SelectItem>
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

            {productForm.type === 'physical' && (
              <div>
                <Label htmlFor="stock_quantity">Quantité en stock</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="Quantité disponible"
                />
              </div>
            )}

            {productForm.type === 'digital' && (
              <div>
                <Label htmlFor="digital_file_url">URL du fichier numérique</Label>
                <Input
                  id="digital_file_url"
                  value={productForm.digital_file_url}
                  onChange={(e) => setProductForm(prev => ({ ...prev, digital_file_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            )}

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
    </div>
  );
}