import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X,
  AlertTriangle,
  Package,
  Grid3x3,
  List,
  Calculator,
  Crown,
  Wifi,
  WifiOff,
  Settings,
  Percent,
  Receipt,
  Clock,
  QrCode,
  CreditCard,
  ArrowUp,
  Database
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  is_active: boolean;
  stock_quantity: number;
  type: 'physical' | 'digital';
}

interface CartItem {
  product: Product;
  quantity: number;
  discount?: number;
}

interface Category {
  name: string;
  count: number;
}

interface StockAlert {
  id: string;
  product_id: string;
  current_stock: number;
  threshold: number;
  product?: Product;
}

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  min_amount: number;
  is_active: boolean;
}

interface OfflineSale {
  id: string;
  cart: CartItem[];
  total: number;
  timestamp: number;
}

export default function ModernPOS() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [offlineSales, setOfflineSales] = useState<OfflineSale[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [currentSession, setCurrentSession] = useState<any>(null);

  // Vérifier l'état de la connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineSales();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadStockAlerts(),
        loadPromotions(),
        loadOfflineSales(),
        startPOSSession()
      ]);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      if (!isOnline) {
        // Charger depuis le cache local en mode hors ligne
        const cached = localStorage.getItem(`products_${user?.id}`);
        if (cached) {
          setProducts(JSON.parse(cached));
        }
      }
    }
  };

  const loadStockAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_alerts')
        .select(`
          *,
          products (*)
        `)
        .eq('seller_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setStockAlerts(data || []);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  };

  const loadPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('pos_promotions')
        .select('*')
        .eq('seller_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setPromotions((data || []) as Promotion[]);
    } catch (error) {
      console.error('Erreur chargement promotions:', error);
    }
  };

  const loadOfflineSales = () => {
    const saved = localStorage.getItem(`offline_sales_${user?.id}`);
    if (saved) {
      setOfflineSales(JSON.parse(saved));
    }
  };

  const startPOSSession = async () => {
    try {
      const { data, error } = await supabase
        .from('pos_sessions')
        .insert({
          seller_id: user?.id,
          opening_cash: 0
        })
        .select()
        .single();

      if (error) throw error;
      setCurrentSession(data);
    } catch (error) {
      console.error('Erreur ouverture session:', error);
    }
  };

  const syncOfflineSales = async () => {
    if (offlineSales.length === 0) return;

    try {
      for (const sale of offlineSales) {
        await processSaleOnline(sale.cart, sale.total);
      }
      
      // Vider les ventes hors ligne après synchronisation
      setOfflineSales([]);
      localStorage.removeItem(`offline_sales_${user?.id}`);
      
      toast({
        title: "Synchronisation réussie",
        description: `${offlineSales.length} vente(s) synchronisée(s)`,
      });
    } catch (error) {
      console.error('Erreur synchronisation:', error);
    }
  };

  // Catégories disponibles
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();
    products.forEach(product => {
      const category = product.category || 'Non catégorisé';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    return Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));
  }, [products]);

  // Produits filtrés avec recherche améliorée
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Calculs du panier avec promotions
  const cartCalculations = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    
    cart.forEach(item => {
      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;
      
      // Remise individuelle
      if (item.discount) {
        totalDiscount += (itemTotal * item.discount / 100);
      }
    });

    // Promotions automatiques
    const applicablePromotions = promotions.filter(promo => 
      promo.is_active && subtotal >= promo.min_amount
    );

    let promoDiscount = 0;
    applicablePromotions.forEach(promo => {
      if (promo.type === 'percentage') {
        promoDiscount += subtotal * (promo.value / 100);
      } else {
        promoDiscount += promo.value;
      }
    });

    const total = subtotal - totalDiscount - promoDiscount;
    
    return {
      subtotal,
      totalDiscount,
      promoDiscount,
      total: Math.max(0, total),
      itemsCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cart, promotions]);

  // Ajouter au panier avec vérifications avancées
  const addToCart = useCallback((product: Product) => {
    if (product.stock_quantity <= 0) {
      toast({
        title: "Stock épuisé",
        description: "Ce produit n'est plus en stock",
        variant: "destructive"
      });
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          toast({
            title: "Stock insuffisant",
            description: "Quantité maximum atteinte",
            variant: "destructive"
          });
          return prevCart;
        }
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });

    // Feedback tactile (vibration sur mobile)
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [toast]);

  // Modifier quantité dans le panier
  const updateCartQuantity = useCallback((productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (product && newQuantity > product.stock_quantity) {
      toast({
        title: "Stock insuffisant",
        description: `Maximum ${product.stock_quantity} unités disponibles`,
        variant: "destructive"
      });
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  }, [products, toast]);

  // Supprimer du panier
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  // Appliquer une remise
  const applyDiscount = useCallback((productId: string, discount: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, discount: Math.max(0, Math.min(100, discount)) }
          : item
      )
    );
  }, []);

  // Finaliser la vente
  const processSale = async () => {
    if (cart.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits avant de finaliser",
        variant: "destructive"
      });
      return;
    }

    if (isOnline) {
      await processSaleOnline(cart, cartCalculations.total);
    } else {
      await processSaleOffline(cart, cartCalculations.total);
    }
  };

  const processSaleOnline = async (saleCart: CartItem[], total: number) => {
    try {
      // Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user?.id,
          seller_id: user?.id,
          total_amount: total,
          currency: 'GNF' as any,
          status: 'completed' as any,
          delivery_address: 'Vente directe - POS'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Ajouter les articles de la commande
      for (const item of saleCart) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.price,
            total_price: item.product.price * item.quantity * (1 - (item.discount || 0) / 100)
          });

        if (itemError) throw itemError;

        // Mettre à jour le stock
        const { error: stockError } = await supabase
          .from('products')
          .update({
            stock_quantity: item.product.stock_quantity - item.quantity
          })
          .eq('id', item.product.id);

        if (stockError) throw stockError;
      }

      // Mettre à jour la session POS
      if (currentSession) {
        await supabase
          .from('pos_sessions')
          .update({
            total_sales: (currentSession.total_sales || 0) + total,
            total_transactions: (currentSession.total_transactions || 0) + 1
          })
          .eq('id', currentSession.id);
      }

      toast({
        title: "Vente réalisée",
        description: `Commande #${order.readable_id || order.id.slice(0, 8)} enregistrée`,
      });

      // Réinitialiser
      setCart([]);
      loadProducts(); // Recharger pour mettre à jour les stocks
      
      // Vérifier les alertes de stock
      setTimeout(() => {
        checkStockAlerts();
      }, 1000);

    } catch (error) {
      console.error('Erreur vente en ligne:', error);
      throw error;
    }
  };

  const processSaleOffline = async (saleCart: CartItem[], total: number) => {
    const offlineSale: OfflineSale = {
      id: Date.now().toString(),
      cart: saleCart,
      total,
      timestamp: Date.now()
    };

    const updatedOfflineSales = [...offlineSales, offlineSale];
    setOfflineSales(updatedOfflineSales);
    localStorage.setItem(`offline_sales_${user?.id}`, JSON.stringify(updatedOfflineSales));

    // Mettre à jour le stock localement
    const updatedProducts = products.map(product => {
      const cartItem = saleCart.find(item => item.product.id === product.id);
      if (cartItem) {
        return {
          ...product,
          stock_quantity: product.stock_quantity - cartItem.quantity
        };
      }
      return product;
    });
    
    setProducts(updatedProducts);
    localStorage.setItem(`products_${user?.id}`, JSON.stringify(updatedProducts));

    toast({
      title: "Vente enregistrée hors ligne",
      description: "La vente sera synchronisée à la reconnexion",
    });

    setCart([]);
  };

  const checkStockAlerts = async () => {
    try {
      await supabase.rpc('check_stock_alerts');
      loadStockAlerts();
    } catch (error) {
      console.error('Erreur vérification alertes:', error);
    }
  };

  const checkStorageQuota = () => {
    // Plus de restriction - système désactivé, tout est premium
    const currentPlan = 'premium';
    const storageUsed = (profile as any)?.storage_used_gb || 0;
    const quotas = { basic: 2, standard: 15, premium: 100 }; // Quota premium élargi
    const quota = quotas[currentPlan as keyof typeof quotas];
    
    // Pas d'alerte de mise à niveau si le système est désactivé
    if (storageUsed / quota > 0.95) { // Seulement si vraiment proche de la limite
      console.log('Approaching storage limit');
    }
  };

  useEffect(() => {
    checkStorageQuota();
  }, [profile]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement du POS...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header moderne */}
      <div className="border-b bg-card shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calculator className="h-6 w-6 text-primary" />
              Point de Vente
            </h1>
            
            {/* Indicateur de connexion */}
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  En ligne
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Hors ligne
                </>
              )}
            </Badge>

            {/* Alertes de stock */}
            {stockAlerts.length > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stockAlerts.length} alerte(s)
              </Badge>
            )}

            {/* Ventes hors ligne en attente */}
            {offlineSales.length > 0 && (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {offlineSales.length} vente(s) à synchroniser
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Indicateur quota stockage */}
            {showUpgrade && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpgrade(true)}
                className="text-orange-600 border-orange-600"
              >
                <ArrowUp className="h-4 w-4 mr-2" />
                Mettre à niveau
              </Button>
            )}

            {/* Total du panier */}
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {cartCalculations.total.toLocaleString()} GNF
              </div>
              <div className="text-sm text-muted-foreground">
                {cartCalculations.itemsCount} article(s)
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Paramètres POS</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Mode hors ligne</span>
                      <Badge variant="default">Activé</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Synchronisation auto</span>
                      <Badge variant="default">Activé</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Seuil d'alerte stock</span>
                      <Badge variant="secondary">10 unités</Badge>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Zone produits */}
        <div className="flex-1 flex flex-col">
          {/* Barre de recherche et filtres améliorée */}
          <div className="p-4 border-b space-y-4 bg-card">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, description, catégorie ou code-barres..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Catégories */}
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                  className="whitespace-nowrap"
                >
                  Toutes ({products.length})
                </Button>
                {categories.map(category => (
                  <Button
                    key={category.name}
                    variant={selectedCategory === category.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.name)}
                    className="whitespace-nowrap"
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Grille des produits optimisée pour tactile */}
          <ScrollArea className="flex-1 p-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredProducts.map(product => (
                  <Card 
                    key={product.id} 
                    className={`cursor-pointer hover:shadow-lg transition-all transform hover:scale-105 ${
                      product.stock_quantity <= 10 ? 'ring-2 ring-orange-200' : ''
                    }`}
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden relative">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        {product.stock_quantity <= 10 && (
                          <div className="absolute top-1 right-1">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                          </div>
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-sm truncate mb-2">{product.name}</h3>
                      
                      <div className="space-y-2">
                        <div className="text-lg font-bold text-primary">
                          {product.price.toLocaleString()} GNF
                        </div>
                        <Badge 
                          variant={product.stock_quantity > 10 ? 'default' : 
                                  product.stock_quantity > 0 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {product.stock_quantity > 0 ? `Stock: ${product.stock_quantity}` : 'Rupture'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map(product => (
                  <Card 
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {product.description}
                          </p>
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {product.category || 'Non catégorisé'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-bold text-primary mb-1">
                            {product.price.toLocaleString()} GNF
                          </div>
                          <Badge 
                            variant={product.stock_quantity > 10 ? 'default' : 
                                    product.stock_quantity > 0 ? 'secondary' : 'destructive'}
                          >
                            {product.stock_quantity > 0 ? `Stock: ${product.stock_quantity}` : 'Rupture'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Panier modernisé */}
        <div className="w-96 border-l flex flex-col bg-card">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Panier ({cartCalculations.itemsCount})
            </h2>
          </div>

          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg mb-2">Panier vide</p>
                <p className="text-sm">Touchez un produit pour l'ajouter</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <Card key={item.product.id} className="relative">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium truncate flex-1 pr-2">
                          {item.product.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.product.id)}
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Contrôles de quantité tactiles */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="h-8 w-8"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <div className="w-12 text-center font-mono font-bold text-lg">
                            {item.quantity}
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="h-8 w-8"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {(item.product.price * item.quantity * (1 - (item.discount || 0) / 100)).toLocaleString()} GNF
                          </div>
                          {item.discount && (
                            <div className="text-xs text-green-600">
                              -{item.discount}%
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Remise rapide */}
                      <div className="flex gap-1">
                        {[5, 10, 15, 20].map(discount => (
                          <Button
                            key={discount}
                            variant="outline"
                            size="sm"
                            onClick={() => applyDiscount(item.product.id, discount)}
                            className="text-xs px-2 py-1 h-6"
                          >
                            -{discount}%
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Résumé et finalisation */}
          {cart.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Détails des calculs */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Sous-total:</span>
                  <span>{cartCalculations.subtotal.toLocaleString()} GNF</span>
                </div>
                
                {cartCalculations.totalDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Remises articles:</span>
                    <span>-{cartCalculations.totalDiscount.toLocaleString()} GNF</span>
                  </div>
                )}
                
                {cartCalculations.promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promotions:</span>
                    <span>-{cartCalculations.promoDiscount.toLocaleString()} GNF</span>
                  </div>
                )}
                
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-primary">{cartCalculations.total.toLocaleString()} GNF</span>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="space-y-2">
                <Button
                  onClick={processSale}
                  className="w-full h-12 text-lg font-semibold"
                  disabled={cart.length === 0}
                >
                  <Receipt className="h-5 w-5 mr-2" />
                  Finaliser la vente
                </Button>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <QrCode className="h-4 w-4 mr-1" />
                    QR Code
                  </Button>
                  <Button variant="outline" size="sm">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Paiement
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de mise à niveau */}
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Espace de stockage presque plein
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Votre quota de stockage arrive à saturation. Passez à un plan supérieur pour continuer à ajouter des produits et accéder à toutes les fonctionnalités POS.
            </p>
            
            <div className="grid gap-3">
              <Button className="w-full">
                <ArrowUp className="h-4 w-4 mr-2" />
                Passer au plan Standard (15 Go)
              </Button>
              <Button variant="outline" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Voir tous les plans
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
