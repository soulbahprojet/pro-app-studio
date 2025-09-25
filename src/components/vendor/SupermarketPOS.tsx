import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
import { Separator } from '../../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X,
  Package,
  CreditCard,
  Banknote,
  Scan,
  Receipt,
  Calculator,
  Monitor,
  Keyboard,
  Clock,
  User,
  DollarSign,
  Percent,
  Trash2,
  PrinterIcon,
  ShoppingBag
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
  barcode?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  discount?: number;
  unit_price: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
}

export default function SupermarketPOS() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [customerName, setCustomerName] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  // Méthodes de paiement disponibles
  const paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Espèces', icon: <Banknote className="h-5 w-5" />, available: true },
    { id: 'card', name: 'Carte bancaire', icon: <CreditCard className="h-5 w-5" />, available: true },
    { id: 'mobile', name: 'Paiement mobile', icon: <Monitor className="h-5 w-5" />, available: true },
    { id: 'check', name: 'Chèque', icon: <Receipt className="h-5 w-5" />, available: false },
  ];

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

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
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

  // Produits filtrés
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Calculs du panier
  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + (item.unit_price * item.quantity);
    }, 0);
  }, [cart]);

  const cartDiscountAmount = useMemo(() => {
    const itemDiscounts = cart.reduce((total, item) => {
      const itemTotal = item.unit_price * item.quantity;
      const discount = item.discount || 0;
      return total + (itemTotal * discount / 100);
    }, 0);
    
    const globalDiscountAmount = (cartSubtotal - itemDiscounts) * (globalDiscount / 100);
    return itemDiscounts + globalDiscountAmount;
  }, [cart, cartSubtotal, globalDiscount]);

  const cartTotal = cartSubtotal - cartDiscountAmount;

  const cartItemsCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Ajouter au panier par code-barres
  const addByBarcode = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.id === barcode);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      toast({
        title: "Produit introuvable",
        description: `Aucun produit trouvé avec le code: ${barcode}`,
        variant: "destructive"
      });
    }
  };

  // Ajouter au panier
  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast({
        title: "Stock insuffisant",
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
      return [...prevCart, { 
        product, 
        quantity: 1, 
        unit_price: product.price,
        discount: 0 
      }];
    });
  };

  // Modifier quantité dans le panier
  const updateCartQuantity = (productId: string, newQuantity: number) => {
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
  };

  // Supprimer du panier
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  // Vider le panier
  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setGlobalDiscount(0);
    setShowPayment(false);
    setSelectedPaymentMethod('');
  };

  // Appliquer une remise sur un article
  const applyItemDiscount = (productId: string, discount: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId
          ? { ...item, discount: Math.max(0, Math.min(100, discount)) }
          : item
      )
    );
  };

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

    if (!selectedPaymentMethod) {
      toast({
        title: "Méthode de paiement requise",
        description: "Sélectionnez une méthode de paiement",
        variant: "destructive"
      });
      return;
    }

    try {
      // Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user?.id,
          seller_id: user?.id,
          total_amount: cartTotal,
          currency: 'GNF' as any,
          status: 'completed' as any,
          delivery_address: `Vente POS - ${customerName || 'Client anonyme'}`,
          payment_method: selectedPaymentMethod
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Ajouter les articles de la commande
      for (const item of cart) {
        const itemTotal = item.unit_price * item.quantity;
        const discountAmount = itemTotal * (item.discount || 0) / 100;
        const finalPrice = itemTotal - discountAmount;

        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: finalPrice
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

      toast({
        title: "Vente réalisée",
        description: `Commande #${order.readable_id || order.id} enregistrée`,
      });

      // Réinitialiser
      clearCart();
      loadProducts(); // Recharger pour mettre à jour les stocks

    } catch (error) {
      console.error('Erreur lors de la vente:', error);
      toast({
        title: "Erreur",
        description: "Impossible de finaliser la vente",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="h-screen">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement du système POS...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Section principale de l'écran POS */}
      <div className="flex-1 flex flex-col">
        {/* En-tête avec heure et utilisateur */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">CAISSE PRINCIPALE</h1>
              <p className="text-xs opacity-90">{user?.email?.split('@')[0] || 'Caissier'}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            <div className="text-xs opacity-90">{currentTime.toLocaleDateString('fr-FR')}</div>
          </div>
        </div>

        {/* Interface principale avec colonnes colorées */}
        <div className="flex-1 grid grid-cols-12 gap-2 p-3">
          {/* Catégories principales - colonne gauche */}
          <div className="col-span-3 space-y-2">
            {/* Catégorie TOUS - Vert */}
            <div 
              className={`h-24 rounded-xl cursor-pointer transition-all hover:scale-105 shadow-lg ${
                selectedCategory === '' ? 'bg-green-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'
              }`}
              onClick={() => setSelectedCategory('')}
            >
              <div className="p-4 h-full flex flex-col justify-center items-center">
                <div className="text-xl font-bold">TOUS</div>
                <div className="text-sm opacity-90">{products.length} articles</div>
              </div>
            </div>

            {/* Première catégorie - Rouge */}
            {categories[0] && (
              <div 
                className={`h-24 rounded-xl cursor-pointer transition-all hover:scale-105 shadow-lg ${
                  selectedCategory === categories[0].name ? 'bg-red-600 text-white' : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                onClick={() => setSelectedCategory(categories[0].name)}
              >
                <div className="p-4 h-full flex flex-col justify-center items-center">
                  <div className="text-lg font-bold">{categories[0].name.toUpperCase()}</div>
                  <div className="text-sm opacity-90">{categories[0].count} articles</div>
                </div>
              </div>
            )}

            {/* Deuxième catégorie - Orange */}
            {categories[1] && (
              <div 
                className={`h-24 rounded-xl cursor-pointer transition-all hover:scale-105 shadow-lg ${
                  selectedCategory === categories[1].name ? 'bg-orange-600 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
                onClick={() => setSelectedCategory(categories[1].name)}
              >
                <div className="p-4 h-full flex flex-col justify-center items-center">
                  <div className="text-lg font-bold">{categories[1].name.toUpperCase()}</div>
                  <div className="text-sm opacity-90">{categories[1].count} articles</div>
                </div>
              </div>
            )}

            {/* Troisième catégorie - Bleu */}
            {categories[2] && (
              <div 
                className={`h-24 rounded-xl cursor-pointer transition-all hover:scale-105 shadow-lg ${
                  selectedCategory === categories[2].name ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
                onClick={() => setSelectedCategory(categories[2].name)}
              >
                <div className="p-4 h-full flex flex-col justify-center items-center">
                  <div className="text-lg font-bold">{categories[2].name.toUpperCase()}</div>
                  <div className="text-sm opacity-90">{categories[2].count} articles</div>
                </div>
              </div>
            )}
          </div>

          {/* Zone centrale - Produits et recherche */}
          <div className="col-span-6 flex flex-col">
            {/* Barre de recherche */}
            <div className="bg-white rounded-xl p-4 mb-3 shadow-lg">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher un produit ou scanner code-barres..."
                  value={barcodeInput || searchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d+$/.test(value)) {
                      setBarcodeInput(value);
                      setSearchTerm('');
                    } else {
                      setSearchTerm(value);
                      setBarcodeInput('');
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && barcodeInput) {
                      addByBarcode(barcodeInput);
                    }
                  }}
                  className="pl-10 text-lg h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                />
              </div>
            </div>

            {/* Grille des produits */}
            <ScrollArea className="flex-1 bg-white rounded-xl shadow-lg">
              <div className="p-4 grid grid-cols-4 gap-3">
                {filteredProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="bg-white border-2 border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-all hover:border-blue-300 p-3"
                    onClick={() => addToCart(product)}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm truncate mb-1">{product.name}</h3>
                    <div className="space-y-1">
                      <div className="font-bold text-lg text-blue-600">
                        {product.price.toLocaleString()} F
                      </div>
                      <Badge 
                        variant={product.stock_quantity > 10 ? 'default' : product.stock_quantity > 0 ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {product.stock_quantity > 0 ? `${product.stock_quantity} stock` : 'RUPTURE'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Zone de caisse - Panier et paiement */}
          <div className="col-span-3 bg-white rounded-xl shadow-lg flex flex-col">
            {/* En-tête du panier */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-t-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  TICKET DE CAISSE
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="text-white border-white/30 hover:bg-white/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Total en grand */}
              <div className="text-center">
                <div className="text-3xl font-bold">{cartTotal.toLocaleString()} F</div>
                <div className="text-sm opacity-90">{cartItemsCount} article(s)</div>
              </div>
            </div>

            {/* Liste des articles du panier */}
            <ScrollArea className="flex-1">
              {cart.length === 0 ? (
                <div className="text-center text-gray-300 py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Panier vide</p>
                  <p className="text-xs">Scannez un produit</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {cart.map(item => (
                    <div key={item.product.id} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm truncate flex-1 text-gray-800">
                          {item.product.name}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.product.id)}
                          className="h-5 w-5 text-red-500 hover:bg-red-100"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="h-6 w-6 border-purple-300"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-bold text-center min-w-[2ch] text-sm bg-white px-2 py-1 rounded">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="h-6 w-6 border-purple-300"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-700">
                            {(item.unit_price * item.quantity).toLocaleString()} F
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Zone paiement */}
            <div className="p-4 border-t border-purple-200">
              {/* Méthodes de paiement */}
              {cart.length > 0 && (
                <div className="space-y-3 mb-4">
                  <label className="text-sm font-medium text-gray-700">PAIEMENT:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.filter(pm => pm.available).map(method => (
                      <Button
                        key={method.id}
                        variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`flex flex-col gap-1 h-auto py-3 ${
                          selectedPaymentMethod === method.id 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        {method.icon}
                        <span className="text-xs">{method.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton final */}
              <Button
                onClick={processSale}
                disabled={cart.length === 0 || !selectedPaymentMethod}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg"
                size="lg"
              >
                <DollarSign className="h-6 w-6 mr-2" />
                VALIDER LA VENTE
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
