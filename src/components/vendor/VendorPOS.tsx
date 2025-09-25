import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
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
  Filter,
  Calculator
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

interface QuantityPadProps {
  onQuantitySet: (productId: string, quantity: number) => void;
  selectedProduct: Product | null;
  onClose: () => void;
}

function QuantityPad({ onQuantitySet, selectedProduct, onClose }: QuantityPadProps) {
  const [quantity, setQuantity] = useState("");

  const handleNumberClick = (num: string) => {
    setQuantity((prev) => prev + num);
  };

  const handleClear = () => {
    setQuantity("");
  };

  const handleDelete = () => {
    setQuantity((prev) => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    if (selectedProduct && quantity) {
      const qty = parseInt(quantity) || 0;
      onQuantitySet(selectedProduct.id, qty);
      setQuantity("");
      onClose();
    }
  };

  return (
    <div className="bg-background p-4 rounded-xl border shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Saisir la quantité</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {selectedProduct && (
        <p className="text-sm text-muted-foreground mb-2 truncate">
          {selectedProduct.name}
        </p>
      )}

      {/* Champ affichage quantité */}
      <Input
        type="text"
        value={quantity}
        readOnly
        className="w-full text-right text-lg mb-4"
        placeholder="0"
      />

      {/* Pavé numérique */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {["1","2","3","4","5","6","7","8","9","0"].map((num) => (
          <Button
            key={num}
            onClick={() => handleNumberClick(num)}
            variant="outline"
            className="h-12 text-lg font-semibold"
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={handleDelete}
          variant="outline"
          className="h-12 text-lg font-semibold bg-yellow-100 hover:bg-yellow-200"
        >
          ⌫
        </Button>
        <Button
          onClick={handleClear}
          variant="outline"
          className="h-12 text-lg font-semibold bg-red-100 hover:bg-red-200"
        >
          C
        </Button>
      </div>

      <div className="flex gap-2">
        <Button onClick={onClose} variant="outline" className="flex-1">
          Annuler
        </Button>
        <Button 
          onClick={handleConfirm} 
          className="flex-1"
          disabled={!quantity || !selectedProduct}
        >
          Confirmer
        </Button>
      </div>
    </div>
  );
}

export default function VendorPOS() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const [showQuantityPad, setShowQuantityPad] = useState(false);
  const [selectedProductForQuantity, setSelectedProductForQuantity] = useState<Product | null>(null);

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
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const itemTotal = item.product.price * item.quantity;
      const discount = item.discount || 0;
      return total + (itemTotal - (itemTotal * discount / 100));
    }, 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

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
      return [...prevCart, { product, quantity: 1 }];
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

  // Ouvrir le pavé numérique pour un produit
  const openQuantityPad = (product: Product) => {
    setSelectedProductForQuantity(product);
    setShowQuantityPad(true);
  };

  // Fermer le pavé numérique
  const closeQuantityPad = () => {
    setShowQuantityPad(false);
    setSelectedProductForQuantity(null);
  };

  // Définir la quantité via le pavé numérique
  const handleQuantityPadSet = (productId: string, quantity: number) => {
    updateCartQuantity(productId, quantity);
  };

  // Appliquer une remise
  const applyDiscount = (productId: string, discount: number) => {
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

    try {
      // Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user?.id, // Pour les ventes directes, le vendeur est aussi le client
          seller_id: user?.id,
          total_amount: cartTotal,
          currency: 'GNF' as any,
          status: 'delivered' as any,
          delivery_address: 'Vente directe - POS'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Ajouter les articles de la commande
      for (const item of cart) {
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

      toast({
        title: "Vente réalisée",
        description: `Commande #${order.id} enregistrée avec succès`,
      });

      // Réinitialiser
      setCart([]);
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
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement du POS...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Point de Vente (POS)
          </h1>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {cartItemsCount} article(s) - {cartTotal.toLocaleString()} GNF
          </Badge>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Zone produits */}
        <div className="flex-1 flex flex-col">
          {/* Barre de recherche et filtres */}
          <div className="p-4 border-b space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
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
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
              >
                Toutes ({products.length})
              </Button>
              {categories.map(category => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name} ({category.count})
                </Button>
              ))}
            </div>
          </div>

          {/* Grille des produits */}
          <ScrollArea className="flex-1 p-4">
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {filteredProducts.map(product => (
                  <Card 
                    key={product.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow h-fit"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-2">
                      <div className="aspect-square bg-muted rounded-lg mb-2 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-xs leading-tight mb-2 line-clamp-2 min-h-[2rem]">{product.name}</h3>
                      <div className="space-y-1">
                        <div className="font-bold text-xs text-primary">
                          {product.price.toLocaleString()} GNF
                        </div>
                        <Badge 
                          variant={product.stock_quantity > 0 ? 'default' : 'destructive'}
                          className="w-full text-xs py-0 justify-center"
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
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {product.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {product.price.toLocaleString()} GNF
                          </div>
                          <Badge variant={product.stock_quantity > 0 ? 'default' : 'destructive'}>
                            Stock: {product.stock_quantity}
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

        {/* Panier */}
        <div className="w-96 border-l flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Panier ({cartItemsCount})
            </h2>
          </div>

          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Panier vide</p>
                <p className="text-sm">Cliquez sur un produit pour l'ajouter</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tableau de saisie rapide pour le vendeur */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Saisie rapide quantités</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1 mr-2">{item.product.name}</span>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value) || 0)}
                              className="w-16 h-7 text-center"
                              min="0"
                              max={item.product.stock_quantity}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openQuantityPad(item.product)}
                              className="h-7 px-2"
                            >
                              📱
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Liste détaillée du panier */}
                 <div className="space-y-4">
                   {cart.map(item => (
                     <Card key={item.product.id}>
                       <CardContent className="p-3">
                         <div className="flex justify-between items-start mb-2">
                           <h4 className="font-medium truncate flex-1">
                             {item.product.name}
                           </h4>
                           <Button
                             variant="ghost"
                             size="icon"
                             onClick={() => removeFromCart(item.product.id)}
                             className="h-6 w-6"
                           >
                             <X className="h-4 w-4" />
                           </Button>
                         </div>
                         
                         <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-2">
                             <Button
                               variant="outline"
                               size="icon"
                               onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                               className="h-6 w-6"
                             >
                               <Minus className="h-3 w-3" />
                             </Button>
                             <span className="font-mono font-bold min-w-[2ch] text-center">
                               {item.quantity}
                             </span>
                             <Button
                               variant="outline"
                               size="icon"
                               onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                               className="h-6 w-6"
                             >
                               <Plus className="h-3 w-3" />
                             </Button>
                           </div>
                           <span className="font-bold">
                             {(item.product.price * item.quantity).toLocaleString()} GNF
                           </span>
                         </div>

                         {/* Remise */}
                         <div className="flex items-center gap-2">
                           <Input
                             type="number"
                             placeholder="Remise %"
                             value={item.discount || ''}
                             onChange={(e) => applyDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                             className="h-6 text-xs"
                             min="0"
                             max="100"
                           />
                           {item.discount && (
                             <Badge variant="secondary" className="text-xs">
                               -{item.discount}%
                             </Badge>
                           )}
                         </div>
                       </CardContent>
                     </Card>
                   ))}
                 </div>
               </div>
            )}
          </ScrollArea>

          {/* Total et validation */}
          {cart.length > 0 && (
            <div className="p-4 border-t space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Sous-total:</span>
                  <span className="font-bold">
                    {cart.reduce((total, item) => total + (item.product.price * item.quantity), 0).toLocaleString()} GNF
                  </span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Remises:</span>
                  <span className="font-bold text-red-600">
                    -{(cart.reduce((total, item) => total + (item.product.price * item.quantity), 0) - cartTotal).toLocaleString()} GNF
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{cartTotal.toLocaleString()} GNF</span>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={processSale}
              >
                Finaliser la vente
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pavé numérique modal */}
      {showQuantityPad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <QuantityPad
            selectedProduct={selectedProductForQuantity}
            onQuantitySet={handleQuantityPadSet}
            onClose={closeQuantityPad}
          />
        </div>
      )}
    </div>
  );
}
