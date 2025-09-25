import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  Settings,
  Eye,
  Loader2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Package,
  TrendingUp,
  Edit3,
  Save,
  X,
  Plus,
  Upload,
  Clock,
  DollarSign,
  ShoppingCart,
  BarChart3,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Shop {
  id: string;
  seller_id: string;
  shop_name: string;
  description: string;
  business_type: string;
  business_address: string;
  contact_phone: string;
  contact_email: string;
  shop_category: string;
  is_active: boolean;
  created_at: string;
  product_count: number;
  slug: string;
  subscription_plan: string;
  business_hours?: any;
  logo_url?: string;
  banner_url?: string;
  theme_color?: string;
  social_links?: any;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  is_active: boolean;
  images: string[];
  shop_id: string;
}

interface VendorShopsManagerProps {
  refreshTrigger?: number;
}

const VendorShopsManager = ({ refreshTrigger }: VendorShopsManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [showShopManager, setShowShopManager] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingShop, setEditingShop] = useState(false);
  const [shopData, setShopData] = useState<Partial<Shop>>({});

  const fetchShops = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seller_shops')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setShops(data || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des boutiques:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos boutiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchShopProducts = async (shopId: string) => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setShopProducts(data || []);
    } catch (error: any) {
      console.error('Erreur lors de la récupération des produits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits de la boutique",
        variant: "destructive"
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleViewShop = (shop: Shop) => {
    setSelectedShop(shop);
    setShopData(shop);
    setShowShopManager(true);
    setActiveTab('overview');
    fetchShopProducts(shop.id);
  };

  const handleEditShop = (shop: Shop) => {
    setSelectedShop(shop);
    setShopData(shop);
    setEditingShop(true);
    setShowShopManager(true);
    setActiveTab('settings');
  };

  const handleSaveShop = async () => {
    if (!selectedShop || !shopData.shop_name) return;

    try {
      const { error } = await supabase
        .from('seller_shops')
        .update({
          shop_name: shopData.shop_name,
          description: shopData.description,
          business_address: shopData.business_address,
          contact_phone: shopData.contact_phone,
          contact_email: shopData.contact_email,
          business_hours: shopData.business_hours,
          theme_color: shopData.theme_color || '#3B82F6',
          is_active: shopData.is_active
        })
        .eq('id', selectedShop.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Boutique mise à jour avec succès"
      });

      setEditingShop(false);
      fetchShops();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la boutique",
        variant: "destructive"
      });
    }
  };

  const toggleShopStatus = async (shop: Shop) => {
    try {
      const { error } = await supabase
        .from('seller_shops')
        .update({ is_active: !shop.is_active })
        .eq('id', shop.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: `Boutique ${!shop.is_active ? 'activée' : 'désactivée'} avec succès`
      });

      fetchShops();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de la boutique",
        variant: "destructive"
      });
    }
  };

  const copyShopLink = async (shop: Shop) => {
    const shopUrl = `${window.location.origin}/boutique/${shop.slug}`;
    
    try {
      await navigator.clipboard.writeText(shopUrl);
      toast({
        title: "Lien copié !",
        description: "Le lien de votre boutique a été copié dans le presse-papiers"
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchShops();
  }, [user, refreshTrigger]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getShopTypeIcon = (businessType: string) => {
    switch (businessType) {
      case 'restaurant':
        return '🍽️';
      case 'physical-products':
        return '🛍️';
      case 'digital-services':
        return '💻';
      case 'beauty-salon':
        return '💄';
      default:
        return '🏪';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' GNF';
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Chargement de vos boutiques...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (shops.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="text-center p-6">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Aucune boutique trouvée</h3>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas encore créé de boutique professionnelle.
          </p>
          <p className="text-sm text-muted-foreground">
            Utilisez le bouton "Créer ma boutique professionnelle" pour commencer.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mes Boutiques</h2>
        <Badge variant="outline" className="text-sm">
          {shops.length} boutique{shops.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {shops.map((shop) => (
          <Card key={shop.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getShopTypeIcon(shop.business_type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{shop.shop_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{shop.shop_category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={shop.is_active}
                    onCheckedChange={() => toggleShopStatus(shop)}
                    className="scale-75"
                  />
                  <Badge 
                    variant={shop.is_active ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {shop.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {shop.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">
                    {shop.business_address}
                  </span>
                </div>
                
                {shop.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {shop.contact_phone}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {shop.contact_email}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>{shop.product_count} produits</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(shop.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => copyShopLink(shop)}
                    title="Copier le lien"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewShop(shop)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditShop(shop)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Gérer
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plan:</span>
                  <Badge variant="outline" className="text-xs uppercase">
                    {shop.subscription_plan}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {shops.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Résumé de vos boutiques</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Total boutiques: </span>
              <span className="text-blue-900">{shops.length}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Boutiques actives: </span>
              <span className="text-blue-900">{shops.filter(s => s.is_active).length}</span>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Total produits: </span>
              <span className="text-blue-900">{shops.reduce((sum, s) => sum + s.product_count, 0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion de boutique */}
      <Dialog open={showShopManager} onOpenChange={setShowShopManager}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <div className="text-2xl">
                  {selectedShop && getShopTypeIcon(selectedShop.business_type)}
                </div>
                Gestion de "{selectedShop?.shop_name}"
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowShopManager(false);
                  setEditingShop(false);
                  setSelectedShop(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedShop && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="products">Produits ({shopProducts.length})</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
                <TabsTrigger value="analytics">Statistiques</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-blue-500" />
                        <CardTitle className="text-sm">Produits</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedShop.product_count}</div>
                      <p className="text-xs text-muted-foreground">Produits actifs</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-green-500" />
                        <CardTitle className="text-sm">Commandes</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-muted-foreground">Ce mois</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-yellow-500" />
                        <CardTitle className="text-sm">Revenus</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0 GNF</div>
                      <p className="text-xs text-muted-foreground">Ce mois</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations de la boutique</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Type d'activité</Label>
                        <p className="text-sm text-muted-foreground">{selectedShop.shop_category}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Statut</Label>
                        <Badge variant={selectedShop.is_active ? "default" : "secondary"} className="text-xs ml-2">
                          {selectedShop.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Adresse</Label>
                        <p className="text-sm text-muted-foreground">{selectedShop.business_address}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Contact</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedShop.contact_phone || selectedShop.contact_email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Date de création</Label>
                        <p className="text-sm text-muted-foreground">{formatDate(selectedShop.created_at)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Plan d'abonnement</Label>
                        <Badge variant="outline" className="text-xs ml-2">
                          {selectedShop.subscription_plan}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button onClick={() => copyShopLink(selectedShop)} variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Voir en ligne
                      </Button>
                      <Button onClick={() => {
                        setActiveTab('settings');
                        setEditingShop(true);
                      }}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Produits de la boutique</h3>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un produit
                  </Button>
                </div>

                {loadingProducts ? (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Chargement des produits...</span>
                  </div>
                ) : shopProducts.length === 0 ? (
                  <Card>
                    <CardContent className="text-center p-6">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Aucun produit</h3>
                      <p className="text-muted-foreground mb-4">
                        Cette boutique n'a pas encore de produits.
                      </p>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter votre premier produit
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shopProducts.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                              {product.images.length > 0 ? (
                                <img 
                                  src={product.images[0]} 
                                  alt={product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{product.name}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.description}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="font-semibold text-primary">
                                  {formatPrice(product.price)}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  Stock: {product.stock_quantity}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Paramètres de la boutique</h3>
                  <div className="flex gap-2">
                    {editingShop && (
                      <>
                        <Button variant="outline" onClick={() => setEditingShop(false)}>
                          Annuler
                        </Button>
                        <Button onClick={handleSaveShop}>
                          <Save className="h-4 w-4 mr-2" />
                          Sauvegarder
                        </Button>
                      </>
                    )}
                    {!editingShop && (
                      <Button onClick={() => setEditingShop(true)}>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Informations générales</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="shop_name">Nom de la boutique</Label>
                          <Input
                            id="shop_name"
                            value={shopData.shop_name || ''}
                            onChange={(e) => setShopData({...shopData, shop_name: e.target.value})}
                            disabled={!editingShop}
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={shopData.description || ''}
                            onChange={(e) => setShopData({...shopData, description: e.target.value})}
                            disabled={!editingShop}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="business_address">Adresse</Label>
                          <Textarea
                            id="business_address"
                            value={shopData.business_address || ''}
                            onChange={(e) => setShopData({...shopData, business_address: e.target.value})}
                            disabled={!editingShop}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Contact</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="contact_phone">Téléphone</Label>
                          <Input
                            id="contact_phone"
                            value={shopData.contact_phone || ''}
                            onChange={(e) => setShopData({...shopData, contact_phone: e.target.value})}
                            disabled={!editingShop}
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact_email">Email</Label>
                          <Input
                            id="contact_email"
                            type="email"
                            value={shopData.contact_email || ''}
                            onChange={(e) => setShopData({...shopData, contact_email: e.target.value})}
                            disabled={!editingShop}
                          />
                        </div>
                        <div>
                          <Label htmlFor="theme_color">Couleur thème</Label>
                          <Input
                            id="theme_color"
                            type="color"
                            value={shopData.theme_color || '#3B82F6'}
                            onChange={(e) => setShopData({...shopData, theme_color: e.target.value})}
                            disabled={!editingShop}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Statut</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>Boutique active</Label>
                            <p className="text-sm text-muted-foreground">
                              Visible publiquement
                            </p>
                          </div>
                          <Switch
                            checked={shopData.is_active || false}
                            onCheckedChange={(checked) => 
                              setShopData({...shopData, is_active: checked})
                            }
                            disabled={!editingShop}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <h3 className="text-lg font-semibold">Statistiques de la boutique</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-sm text-muted-foreground">Vues cette semaine</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <ShoppingCart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-sm text-muted-foreground">Commandes ce mois</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">0 GNF</div>
                      <p className="text-sm text-muted-foreground">Revenus totaux</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold">0%</div>
                      <p className="text-sm text-muted-foreground">Taux de conversion</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Graphique des ventes</CardTitle>
                  </CardHeader>
                  <CardContent className="h-64 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                      <p>Aucune donnée disponible pour le moment</p>
                      <p className="text-sm">Les statistiques apparaîtront une fois que vous aurez des ventes</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorShopsManager;