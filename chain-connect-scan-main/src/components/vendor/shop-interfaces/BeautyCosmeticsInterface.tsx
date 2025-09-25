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
  Sparkles, Package, TrendingUp, Users, DollarSign, Plus, Eye, Edit, 
  Trash2, ShoppingCart, Star, Calendar, AlertTriangle, Gift,
  Palette, Heart, Zap, Bell, Percent, Settings
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface BeautyCosmeticsInterfaceProps {
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
  category: string;
  is_active: boolean;
  images?: string[];
  brand?: string;
  expiry_date?: string;
  batch_number?: string;
  skin_type?: string[];
  ingredients?: string;
  created_at: string;
}

const BEAUTY_CATEGORIES = [
  'Soins du visage',
  'Soins du corps',
  'Maquillage',
  'Parfums',
  'Soins des cheveux',
  'Soins des ongles',
  'Protection solaire',
  'Anti-âge',
  'Bio & Naturel'
];

const SKIN_TYPES = [
  'Tous types de peau',
  'Peau sèche',
  'Peau grasse',
  'Peau mixte',
  'Peau sensible',
  'Peau mature',
  'Peau acnéique'
];

export default function BeautyCosmeticsInterface({ 
  shopId, 
  onAddProduct, 
  onManageOrders,
  onDeleteShop 
}: BeautyCosmeticsInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    expiringProducts: 0,
    totalOrders: 0,
    revenue: 0,
    averageRating: 0,
    newCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showBundles, setShowBundles] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    expiry_date: '',
    batch_number: '',
    skin_type: [] as string[],
    ingredients: '',
    images: [] as File[]
  });

  useEffect(() => {
    loadBeautyData();
  }, [user]);

  const loadBeautyData = async () => {
    try {
      setLoading(true);
      
      // Charger les produits beauté
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .in('category', BEAUTY_CATEGORIES)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Charger les commandes
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, total_amount, status, customer_id, created_at')
        .eq('seller_id', user?.id);

      // Calculer les statistiques
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(p => p.is_active).length || 0;
      
      // Simulation produits expirant (à adapter selon votre modèle)
      const expiringProducts = 0;

      const totalOrders = ordersData?.length || 0;
      const revenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const averageRating = 4.5; // Simulation note moyenne
      
      // Nouveaux clients ce mois
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newCustomers = ordersData?.filter(order => 
        new Date(order.created_at) >= thisMonth
      ).length || 0;

      setStats({
        totalProducts,
        activeProducts,
        expiringProducts,
        totalOrders,
        revenue,
        averageRating: Math.round(averageRating * 10) / 10,
        newCustomers
      });

    } catch (error) {
      console.error('Error loading beauty data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données beauté",
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
          const fileName = `beauty/${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
          
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
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        metadata: {
          brand: productForm.brand,
          expiry_date: productForm.expiry_date,
          batch_number: productForm.batch_number,
          skin_type: productForm.skin_type,
          ingredients: productForm.ingredients
        }
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast({
        title: "Produit beauté ajouté",
        description: `${productForm.name} ajouté avec succès à votre catalogue beauté`
      });

      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        expiry_date: '',
        batch_number: '',
        skin_type: [],
        ingredients: '',
        images: []
      });
      setShowAddProduct(false);
      loadBeautyData();

    } catch (error: any) {
      console.error('Add beauty product error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le produit beauté",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Chargement de votre boutique beauté...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Cosmétiques & Beauté */}
      <Card className="bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-700">
            <Sparkles className="h-6 w-6" />
            Cosmétiques & Beauté
            <Badge className="bg-rose-100 text-rose-700">Beauty</Badge>
          </CardTitle>
          <p className="text-rose-600">
            Boutique beauté avec gestion des dates d'expiration, lots, conseils personnalisés et notifications clients
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="bundles">Packs</TabsTrigger>
          <TabsTrigger value="expiry">Expiration</TabsTrigger>
          <TabsTrigger value="advice">Conseils</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistiques Beauté */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Card className="bg-gradient-to-br from-rose-50 to-rose-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-rose-600" />
                  <span className="text-sm font-medium text-rose-800">Produits</span>
                </div>
                <div className="text-2xl font-bold text-rose-700">{stats.totalProducts}</div>
                <p className="text-xs text-rose-600">{stats.activeProducts} actifs</p>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${stats.expiringProducts > 0 ? 'from-orange-50 to-orange-100' : 'from-green-50 to-green-100'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`h-4 w-4 ${stats.expiringProducts > 0 ? 'text-orange-600' : 'text-green-600'}`} />
                  <span className={`text-sm font-medium ${stats.expiringProducts > 0 ? 'text-orange-800' : 'text-green-800'}`}>Expiration</span>
                </div>
                <div className={`text-2xl font-bold ${stats.expiringProducts > 0 ? 'text-orange-700' : 'text-green-700'}`}>
                  {stats.expiringProducts}
                </div>
                <p className={`text-xs ${stats.expiringProducts > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {stats.expiringProducts > 0 ? 'À surveiller' : 'Tout va bien'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Commandes</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">{stats.totalOrders}</div>
                <p className="text-xs text-purple-600">Ventes beauté</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Revenus</span>
                </div>
                <div className="text-2xl font-bold text-green-700">{stats.revenue.toLocaleString()}</div>
                <p className="text-xs text-green-600">GNF</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Satisfaction</span>
                </div>
                <div className="text-2xl font-bold text-yellow-700">{stats.averageRating}/5</div>
                <p className="text-xs text-yellow-600">Note moyenne</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Nouveaux</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">{stats.newCustomers}</div>
                <p className="text-xs text-blue-600">Ce mois</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">Fidélité</span>
                </div>
                <div className="text-2xl font-bold text-indigo-700">85%</div>
                <p className="text-xs text-indigo-600">Clients fidèles</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions Rapides Beauté */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Beauté</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button onClick={() => setShowAddProduct(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Produit
              </Button>
              <Button variant="outline" onClick={() => setShowBundles(true)} className="w-full">
                <Gift className="h-4 w-4 mr-2" />
                Créer Pack
              </Button>
              <Button variant="outline" onClick={() => setShowPromotions(true)} className="w-full">
                <Percent className="h-4 w-4 mr-2" />
                Promotions
              </Button>
              <Button variant="outline" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Alertes importantes */}
          {stats.expiringProducts > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alerte Expiration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-600">
                  {stats.expiringProducts} produit(s) expirent dans les 30 prochains jours. 
                  Consultez l'onglet "Expiration" pour plus de détails.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Catalogue Beauté</h3>
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
                          <Sparkles className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        {product.brand && (
                          <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{product.category}</Badge>
                          <Badge variant={product.is_active ? 'default' : 'outline'}>
                            {product.is_active ? 'En vente' : 'Hors ligne'}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            {product.price.toLocaleString()} GNF
                          </span>
                          {product.expiry_date && (
                            <span className="text-sm text-orange-600">
                              Exp: {new Date(product.expiry_date).toLocaleDateString()}
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

        <TabsContent value="bundles">
          <Card>
            <CardHeader>
              <CardTitle>Packs & Bundles Beauté</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Création de packs produits, coffrets beauté et bundles avec réductions automatiques.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiry">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Dates d'Expiration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Suivi des dates de péremption, alertes automatiques et gestion des lots par numéro de batch.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advice">
          <Card>
            <CardHeader>
              <CardTitle>Conseils Beauté Personnalisés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Recommandations basées sur le type de peau, routines beauté et conseils d'utilisation personnalisés.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle>Promotions & Nouveautés</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Notifications automatiques de nouveautés, promotions saisonnières et programme de fidélité beauté.
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
                      <h4 className="font-medium text-red-800">Supprimer la boutique beauté</h4>
                      <p className="text-sm text-red-600 mt-1">
                        Cette action supprimera tous vos produits, dates d'expiration et données de façon irréversible.
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

      {/* Modal Ajout Produit Beauté */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un produit beauté</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Crème hydratante visage"
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
                    {BEAUTY_CATEGORIES.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  value={productForm.brand}
                  onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Nom de la marque"
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
                <Label htmlFor="expiry_date">Date d'expiration</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={productForm.expiry_date}
                  onChange={(e) => setProductForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="batch_number">Numéro de lot</Label>
                <Input
                  id="batch_number"
                  value={productForm.batch_number}
                  onChange={(e) => setProductForm(prev => ({ ...prev, batch_number: e.target.value }))}
                  placeholder="Ex: LOT2024001"
                />
              </div>
            </div>

            <div>
              <Label>Types de peau compatibles</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {SKIN_TYPES.map(skinType => (
                  <div key={skinType} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={skinType}
                      checked={productForm.skin_type.includes(skinType)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProductForm(prev => ({
                            ...prev,
                            skin_type: [...prev.skin_type, skinType]
                          }));
                        } else {
                          setProductForm(prev => ({
                            ...prev,
                            skin_type: prev.skin_type.filter(t => t !== skinType)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor={skinType} className="text-sm">{skinType}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="ingredients">Ingrédients principaux</Label>
              <Textarea
                id="ingredients"
                value={productForm.ingredients}
                onChange={(e) => setProductForm(prev => ({ ...prev, ingredients: e.target.value }))}
                placeholder="Liste des ingrédients principaux..."
                rows={2}
              />
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

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              Supprimer définitivement cette boutique beauté ? Tous les produits, dates d'expiration et données seront perdus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDeleteShop?.()}
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