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
import { Checkbox } from '../../ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shirt, Package, TrendingUp, Users, DollarSign, Plus, Eye, Edit, 
  Trash2, ShoppingCart, Star, Palette, Ruler, Tag, Percent,
  Image as ImageIcon, Sparkles, Calendar, Filter, AlertTriangle, Settings
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';

interface FashionAccessoriesInterfaceProps {
  shopId: string;
  onAddProduct?: () => void;
  onManageOrders?: () => void;
  onDeleteShop?: () => void;
}

interface ProductVariant {
  size: string;
  color: string;
  stock: number;
  price_modifier: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_active: boolean;
  images?: string[];
  variants?: ProductVariant[];
  brand?: string;
  material?: string;
  created_at: string;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const COLORS = [
  { name: 'Noir', value: '#000000' },
  { name: 'Blanc', value: '#FFFFFF' },
  { name: 'Rouge', value: '#DC2626' },
  { name: 'Bleu', value: '#2563EB' },
  { name: 'Vert', value: '#16A34A' },
  { name: 'Jaune', value: '#EAB308' },
  { name: 'Rose', value: '#EC4899' },
  { name: 'Gris', value: '#6B7280' },
  { name: 'Marron', value: '#A16207' },
  { name: 'Violet', value: '#7C3AED' }
];

export default function FashionAccessoriesInterface({ 
  shopId, 
  onAddProduct, 
  onManageOrders,
  onDeleteShop 
}: FashionAccessoriesInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    revenue: 0,
    averageRating: 0,
    topCategory: ''
  });
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showPromotions, setShowPromotions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    material: '',
    variants: [] as ProductVariant[],
    images: [] as File[]
  });
  
  const [currentVariant, setCurrentVariant] = useState({
    size: '',
    color: '',
    stock: '',
    price_modifier: '0'
  });

  useEffect(() => {
    loadFashionData();
  }, [user]);

  const loadFashionData = async () => {
    try {
      setLoading(true);
      
      // Charger les produits mode
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .eq('category', 'fashion')
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;
      
      // Transform Supabase data to local Product interface
      const transformedProducts: Product[] = (productsData || []).map((item: any): Product => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        is_active: item.is_active,
        images: Array.isArray(item.images) ? item.images : [],
        variants: (() => {
          try {
            if (typeof item.variants === 'string') {
              return JSON.parse(item.variants) || [];
            }
            return Array.isArray(item.variants) ? item.variants : [];
          } catch {
            return [];
          }
        })(),
        brand: item.brand,
        material: item.material,
        created_at: item.created_at
      }));
      setProducts(transformedProducts);

      // Charger les commandes et avis
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, total_amount, status')
        .eq('seller_id', user?.id);

      // Simulation avis (à adapter selon votre système d'avis)

      // Calculer les statistiques
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(p => p.is_active).length || 0;
      const totalOrders = ordersData?.length || 0;
      const revenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const averageRating = 4.2; // Simulation note moyenne
      
      // Trouver la catégorie la plus populaire
      const categoryCount = productsData?.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      const topCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b, 'Mode'
      );

      setStats({
        totalProducts,
        activeProducts,
        totalOrders,
        revenue,
        averageRating: Math.round(averageRating * 10) / 10,
        topCategory
      });

    } catch (error) {
      console.error('Error loading fashion data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données mode",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addVariant = () => {
    if (!currentVariant.size || !currentVariant.color || !currentVariant.stock) {
      toast({
        title: "Variante incomplète",
        description: "Veuillez remplir tous les champs de la variante",
        variant: "destructive"
      });
      return;
    }

    const newVariant: ProductVariant = {
      size: currentVariant.size,
      color: currentVariant.color,
      stock: parseInt(currentVariant.stock),
      price_modifier: parseFloat(currentVariant.price_modifier) || 0
    };

    setProductForm(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));

    setCurrentVariant({
      size: '',
      color: '',
      stock: '',
      price_modifier: '0'
    });

    toast({
      title: "Variante ajoutée",
      description: `${newVariant.color} - ${newVariant.size} ajouté avec succès`
    });
  };

  const removeVariant = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleAddProduct = async () => {
    if (!productForm.name || !productForm.price || productForm.variants.length === 0) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs et ajouter au moins une variante",
        variant: "destructive"
      });
      return;
    }

    try {
      let uploadedImageUrls: string[] = [];

      if (productForm.images && productForm.images.length > 0) {
        for (const image of productForm.images) {
          const fileExtension = image.name.split('.').pop();
          const fileName = `fashion/${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
          
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
        category: 'fashion',
        is_active: true,
        currency: 'GNF' as const,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : null,
        metadata: {
          brand: productForm.brand,
          material: productForm.material,
          variants: productForm.variants
        }
      };

      const { error } = await supabase
        .from('products')
        .insert(productData);

      if (error) throw error;

      toast({
        title: "Produit mode ajouté",
        description: `${productForm.name} avec ${productForm.variants.length} variante(s) ajouté avec succès`
      });

      setProductForm({
        name: '',
        description: '',
        price: '',
        category: '',
        brand: '',
        material: '',
        variants: [],
        images: []
      });
      setShowAddProduct(false);
      loadFashionData();

    } catch (error: any) {
      console.error('Add fashion product error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le produit mode",
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
        description: "Votre boutique mode a été supprimée avec succès"
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
        <p className="mt-2 text-muted-foreground">Chargement de votre boutique mode...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête Mode & Accessoires */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-700">
            <Shirt className="h-6 w-6" />
            Mode & Accessoires
            <Badge className="bg-pink-100 text-pink-700">Fashion</Badge>
          </CardTitle>
          <p className="text-pink-600">
            Boutique mode spécialisée avec gestion des tailles, couleurs, variantes et système d'avis clients
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="reviews">Avis</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Statistiques Mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-pink-50 to-pink-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shirt className="h-4 w-4 text-pink-600" />
                  <span className="text-sm font-medium text-pink-800">Articles</span>
                </div>
                <div className="text-2xl font-bold text-pink-700">{stats.totalProducts}</div>
                <p className="text-xs text-pink-600">{stats.activeProducts} en vente</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Commandes</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">{stats.totalOrders}</div>
                <p className="text-xs text-purple-600">Ventes mode</p>
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
                  <span className="text-sm font-medium text-yellow-800">Note</span>
                </div>
                <div className="text-2xl font-bold text-yellow-700">{stats.averageRating}/5</div>
                <p className="text-xs text-yellow-600">Moyenne avis</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Top Catégorie</span>
                </div>
                <div className="text-lg font-bold text-blue-700">{stats.topCategory}</div>
                <p className="text-xs text-blue-600">Plus vendue</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-800">Tendances</span>
                </div>
                <div className="text-2xl font-bold text-indigo-700">+15%</div>
                <p className="text-xs text-indigo-600">Ce mois</p>
              </CardContent>
            </Card>
          </div>

          {/* Actions Rapides Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Mode</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button onClick={() => setShowAddProduct(true)} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Article
              </Button>
              <Button variant="outline" onClick={() => setShowPromotions(true)} className="w-full">
                <Percent className="h-4 w-4 mr-2" />
                Soldes & Promos
              </Button>
              <Button variant="outline" className="w-full">
                <Palette className="h-4 w-4 mr-2" />
                Couleurs Tendance
              </Button>
              <Button variant="outline" className="w-full">
                <Ruler className="h-4 w-4 mr-2" />
                Guide des Tailles
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Collection Mode</h3>
            <Button onClick={() => setShowAddProduct(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Article
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
                          <Shirt className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        {product.brand && (
                          <p className="text-sm text-muted-foreground font-medium">{product.brand}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={product.is_active ? 'default' : 'outline'}>
                            {product.is_active ? 'En vente' : 'Hors ligne'}
                          </Badge>
                          <span className="text-sm font-medium text-green-600">
                            {product.price.toLocaleString()} GNF
                          </span>
                          {product.variants && (
                            <span className="text-sm text-blue-600">
                              {product.variants.length} variante(s)
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

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Gestion Inventaire Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Suivi des stocks par taille et couleur, alertes de réassort et gestion des variantes.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <Card>
            <CardHeader>
              <CardTitle>Promotions & Soldes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Création de promotions saisonnières, soldes par catégorie et codes de réduction exclusifs.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Avis & Notes Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gestion des avis clients, photos produits partagées et système de notation détaillé.
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
                      <h4 className="font-medium text-red-800">Supprimer la boutique mode</h4>
                      <p className="text-sm text-red-600 mt-1">
                        Cette action est irréversible. Tous vos articles, variantes, commandes et données seront définitivement supprimés.
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

      {/* Modal Ajout Produit Mode */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un article mode</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de l'article *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: T-shirt coton bio"
                />
              </div>
              <div>
                <Label htmlFor="price">Prix de base (GNF) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Prix de base"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  value={productForm.brand}
                  onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Nom de la marque"
                />
              </div>
              <div>
                <Label htmlFor="material">Matière</Label>
                <Input
                  id="material"
                  value={productForm.material}
                  onChange={(e) => setProductForm(prev => ({ ...prev, material: e.target.value }))}
                  placeholder="Ex: 100% coton"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description détaillée de l'article"
                rows={3}
              />
            </div>

            {/* Section Variantes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Variantes (Tailles & Couleurs)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>Taille</Label>
                    <Select value={currentVariant.size} onValueChange={(value) => 
                      setCurrentVariant(prev => ({ ...prev, size: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Taille" />
                      </SelectTrigger>
                      <SelectContent>
                        {SIZES.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Couleur</Label>
                    <Select value={currentVariant.color} onValueChange={(value) => 
                      setCurrentVariant(prev => ({ ...prev, color: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Couleur" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map(color => (
                          <SelectItem key={color.name} value={color.name}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border" 
                                style={{ backgroundColor: color.value }}
                              />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={currentVariant.stock}
                      onChange={(e) => setCurrentVariant(prev => ({ ...prev, stock: e.target.value }))}
                      placeholder="Quantité"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addVariant} size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                {/* Liste des variantes ajoutées */}
                {productForm.variants.length > 0 && (
                  <div className="space-y-2">
                    <Label>Variantes ajoutées:</Label>
                    <div className="grid gap-2">
                      {productForm.variants.map((variant, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">
                            {variant.color} - {variant.size} (Stock: {variant.stock})
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeVariant(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              <Label htmlFor="images">Photos de l'article</Label>
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
              <p className="text-xs text-muted-foreground mt-1">
                Ajoutez plusieurs photos sous différents angles
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddProduct(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddProduct}>
                Ajouter l'article
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
              Êtes-vous absolument sûr de vouloir supprimer cette boutique mode ? Cette action est irréversible et supprimera :
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Tous vos articles mode ({stats.totalProducts})</li>
                <li>• Toutes les variantes de taille/couleur</li>
                <li>• Toutes vos commandes ({stats.totalOrders})</li>
                <li>• Votre historique de ventes</li>
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
