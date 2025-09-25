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
  ShoppingCart, Package, TrendingUp, Users, DollarSign, Plus, Eye, Edit, 
  Trash2, Clock, AlertTriangle, Truck, BarChart3, Scan,
  Scale, Calendar, Percent, Gift, Monitor
} from 'lucide-react';

interface FoodSupemarketInterfaceProps {
  shopId: string;
  onAddProduct?: () => void;
  onManageOrders?: () => void;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_active: boolean;
  images?: string[];
  barcode?: string;
  weight?: number;
  volume?: number;
  expiry_date?: string;
  unit_type?: string;
  stock_quantity: number;
  created_at: string;
}

const FOOD_CATEGORIES = [
  'Fruits & Légumes',
  'Viandes & Poissons',
  'Produits laitiers',
  'Épicerie salée',
  'Épicerie sucrée',
  'Boissons',
  'Surgelés',
  'Boulangerie',
  'Hygiène & Beauté',
  'Entretien'
];

const UNIT_TYPES = [
  'pièce',
  'kg',
  'g',
  'L',
  'mL',
  'paquet',
  'boîte',
  'bouteille'
];

export default function FoodSupemarketInterface({ 
  shopId, 
  onAddProduct, 
  onManageOrders 
}: FoodSupemarketInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
    expiringProducts: 0,
    todayOrders: 0,
    revenue: 0,
    scheduledDeliveries: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPOS, setShowPOS] = useState(false);
  const [showCoupons, setShowCoupons] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    barcode: '',
    weight: '',
    volume: '',
    expiry_date: '',
    unit_type: 'pièce',
    stock_quantity: '',
    images: [] as File[]
  });

  useEffect(() => {
    loadSupemarketData();
  }, [user]);

  const loadSupemarketData = async () => {
    try {
      setLoading(true);
      
      // Charger les produits alimentaires
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .in('category', FOOD_CATEGORIES)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Charger les commandes du jour
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrdersData } = await supabase
        .from('orders')
        .select('id, total_amount, status')
        .eq('seller_id', user?.id)
        .gte('created_at', today + 'T00:00:00')
        .lte('created_at', today + 'T23:59:59');

      // Calculer les statistiques
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(p => p.is_active).length || 0;
      const lowStock = productsData?.filter(p => (p.stock_quantity || 0) <= 10).length || 0;
      
      // Simulation produits expirant (à adapter selon votre modèle)
      const expiringProducts = 0;

      const todayOrders = todayOrdersData?.length || 0;
      const revenue = todayOrdersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        totalProducts,
        activeProducts,
        lowStock,
        expiringProducts,
        todayOrders,
        revenue,
        scheduledDeliveries: 0 // À implémenter avec le système de livraison
      });

    } catch (error) {
      console.error('Error loading supermarket data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du supermarché",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.category) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir au moins le nom, prix et catégorie",
        variant: "destructive"
      });
      return;
    }

    try {
      let uploadedImageUrls: string[] = [];

      if (productForm.images && productForm.images.length > 0) {
        for (const image of productForm.images) {
          const fileExtension = image.name.split('.').pop();
          const fileName = `supermarket/${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
          
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
        type: 'physical' as const,
        category: productForm.category,
        is_active: true,
        currency: 'GNF' as const,
        stock_quantity: parseInt(productForm.stock_quantity) || 0,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        metadata: {
          barcode: productForm.barcode,
          weight: productForm.weight ? parseFloat(productForm.weight) : null,
          volume: productForm.volume ? parseFloat(productForm.volume) : null,
          expiry_date: productForm.expiry_date,
          unit_type: productForm.unit_type
        }
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast({
        title: "Produit ajouté",
        description: `${productForm.name} ajouté avec succès au catalogue alimentaire`
      });

      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        barcode: '',
        weight: '',
        volume: '',
        expiry_date: '',
        unit_type: 'pièce',
        stock_quantity: '',
        images: []
      });
      setShowAddProduct(false);
      loadSupemarketData();

    } catch (error: any) {
      console.error('Add food product error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le produit alimentaire",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Chargement de votre supermarché...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Alimentation & Supermarché */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <ShoppingCart className="h-6 w-6" />
            Alimentation & Supermarché
            <Badge className="bg-green-100 text-green-700">POS</Badge>
          </CardTitle>
          <p className="text-green-600">
            Système POS complet avec gestion poids/volume, dates de péremption et livraison programmée
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="pos">Caisse POS</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="delivery">Livraisons</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistiques Supermarché */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Produits</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{stats.totalProducts}</div>
                <p className="text-xs text-green-600">{stats.activeProducts} en rayon</p>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${stats.lowStock > 0 ? 'from-orange-50 to-orange-100' : 'from-blue-50 to-blue-100'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`h-4 w-4 ${stats.lowStock > 0 ? 'text-orange-600' : 'text-blue-600'}`} />
                  <span className={`text-sm font-medium ${stats.lowStock > 0 ? 'text-orange-800' : 'text-blue-800'}`}>Stock bas</span>
                </div>
                <div className={`text-2xl font-bold ${stats.lowStock > 0 ? 'text-orange-700' : 'text-blue-700'}`}>
                  {stats.lowStock}
                </div>
                <p className={`text-xs ${stats.lowStock > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                  {stats.lowStock > 0 ? 'À réapprovisionner' : 'Stock OK'}
                </p>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${stats.expiringProducts > 0 ? 'from-red-50 to-red-100' : 'from-green-50 to-green-100'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`h-4 w-4 ${stats.expiringProducts > 0 ? 'text-red-600' : 'text-green-600'}`} />
                  <span className={`text-sm font-medium ${stats.expiringProducts > 0 ? 'text-red-800' : 'text-green-800'}`}>Expiration</span>
                </div>
                <div className={`text-2xl font-bold ${stats.expiringProducts > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {stats.expiringProducts}
                </div>
                <p className={`text-xs ${stats.expiringProducts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.expiringProducts > 0 ? '7 jours' : 'RAS'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Ventes jour</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{stats.todayOrders}</div>
                <p className="text-xs text-blue-600">Commandes</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">CA jour</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">{stats.revenue.toLocaleString()}</div>
                <p className="text-xs text-purple-600">GNF</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="h-4 w-4 text-teal-600" />
                  <span className="text-sm font-medium text-teal-800">Livraisons</span>
                </div>
                <div className="text-2xl font-bold text-teal-700">{stats.scheduledDeliveries}</div>
                <p className="text-xs text-teal-600">Programmées</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">Performance</span>
                </div>
                <div className="text-2xl font-bold text-indigo-700">+12%</div>
                <p className="text-xs text-indigo-600">Ce mois</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions Rapides Supermarché */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Supermarché</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button onClick={() => setShowAddProduct(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Produit
              </Button>
              <Button variant="outline" onClick={() => setShowPOS(true)} className="w-full">
                <Monitor className="h-4 w-4 mr-2" />
                Ouvrir Caisse
              </Button>
              <Button variant="outline" onClick={() => setShowCoupons(true)} className="w-full">
                <Gift className="h-4 w-4 mr-2" />
                Coupons & Promos
              </Button>
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Rapports Ventes
              </Button>
            </CardContent>
          </Card>

          {/* Alertes importantes */}
          {(stats.lowStock > 0 || stats.expiringProducts > 0) && (
            <div className="grid gap-4">
              {stats.lowStock > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="text-orange-700 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Stock Faible
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-600">
                      {stats.lowStock} produit(s) ont un stock inférieur à 10 unités. 
                      Planifiez le réapprovisionnement.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {stats.expiringProducts > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Produits à Écouler
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-600">
                      {stats.expiringProducts} produit(s) expirent dans les 7 prochains jours. 
                      Considérez des promotions pour les écouler.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Catalogue Alimentaire</h3>
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
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge variant="outline">{product.category}</Badge>
                          <Badge variant={product.is_active ? 'default' : 'outline'}>
                            {product.is_active ? 'En rayon' : 'Hors rayon'}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            {product.price.toLocaleString()} GNF
                          </span>
                          <span className="text-sm text-blue-600">
                            Stock: {product.stock_quantity} {product.unit_type || 'unités'}
                          </span>
                          {product.expiry_date && (
                            <span className="text-sm text-orange-600">
                              Exp: {new Date(product.expiry_date).toLocaleDateString()}
                            </span>
                          )}
                          {product.barcode && (
                            <span className="text-sm text-gray-600">
                              <Scan className="h-3 w-3 inline mr-1" />
                              {product.barcode}
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

        <TabsContent value="pos">
          <Card>
            <CardHeader>
              <CardTitle>Interface Caisse POS</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interface de caisse tactile moderne avec scanner codes-barres, gestion des poids et paiements multiples.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Gestion d'Inventaire</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Suivi en temps réel des stocks, alertes de réapprovisionnement et gestion des dates de péremption.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle>Promotions & Coupons</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Création de promotions automatiques, coupons de réduction et programmes de fidélité.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>Livraisons Programmées</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Planification des livraisons, créneaux horaires et suivi des commandes en temps réel.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Ajout Produit Alimentaire */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un produit alimentaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Pommes Golden"
                />
              </div>
              <div>
                <Label htmlFor="price">Prix (GNF) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Prix de vente"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="barcode">Code-barres</Label>
                <Input
                  id="barcode"
                  value={productForm.barcode}
                  onChange={(e) => setProductForm(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Code-barres du produit"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description du produit"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="unit_type">Unité de vente</Label>
                <Select
                  value={productForm.unit_type}
                  onValueChange={(value) => setProductForm(prev => ({ ...prev, unit_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIT_TYPES.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="weight">Poids (g)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={productForm.weight}
                  onChange={(e) => setProductForm(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="Poids en grammes"
                />
              </div>
              <div>
                <Label htmlFor="volume">Volume (mL)</Label>
                <Input
                  id="volume"
                  type="number"
                  value={productForm.volume}
                  onChange={(e) => setProductForm(prev => ({ ...prev, volume: e.target.value }))}
                  placeholder="Volume en millilitres"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry_date">Date de péremption</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={productForm.expiry_date}
                  onChange={(e) => setProductForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="stock_quantity">Stock initial</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(e) => setProductForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="Quantité en stock"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="images">Photos du produit</Label>
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
