import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Heart, 
  ArrowRight,
  ShoppingCart,
  CreditCard,
  Truck,
  Shield,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  vendor_name?: string;
  in_stock: boolean;
  discount?: number;
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const navigate = useNavigate();

  // Données de démonstration
  useEffect(() => {
    const mockCartItems: CartItem[] = [
      {
        id: '1',
        name: 'Smartphone Samsung Galaxy',
        price: 599,
        quantity: 1,
        image_url: '/api/placeholder/150/150',
        vendor_name: 'TechStore',
        in_stock: true
      },
      {
        id: '2',
        name: 'Casque Audio Bluetooth',
        price: 149,
        quantity: 2,
        image_url: '/api/placeholder/150/150',
        vendor_name: 'AudioWorld',
        in_stock: true,
        discount: 10
      }
    ];
    setCartItems(mockCartItems);
  }, []);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'welcome10') {
      setAppliedPromo('WELCOME10');
      setPromoCode('');
    } else {
      alert('Code promo invalide');
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  const promoDiscount = appliedPromo === 'WELCOME10' ? subtotal * 0.1 : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal - promoDiscount + shipping;

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="space-y-6">
            <div className="text-6xl">🛒</div>
            <h2 className="text-2xl font-bold">Votre panier est vide</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Découvrez nos produits exceptionnels et commencez vos achats sur notre marketplace
            </p>
            <Button onClick={() => navigate('/marketplace')} size="lg">
              <ShoppingBag className="mr-2" size={20} />
              Continuer mes achats
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mon Panier</h1>
          <p className="text-muted-foreground">{cartItems.length} article{cartItems.length > 1 ? 's' : ''}</p>
        </div>
        <Button variant="outline" onClick={clearCart}>
          <Trash2 size={16} className="mr-2" />
          Vider le panier
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Articles du panier */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Image produit */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <img 
                      src={item.image_url || '/api/placeholder/150/150'} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>

                  {/* Informations produit */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.vendor_name && (
                          <p className="text-sm text-muted-foreground">Vendu par {item.vendor_name}</p>
                        )}
                        {item.discount && (
                          <Badge variant="destructive" className="text-xs">
                            -{item.discount}%
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>

                    {/* Prix et quantité */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold">
                          {item.discount ? (
                            <>
                              <span className="line-through text-muted-foreground text-sm mr-2">
                                {item.price}€
                              </span>
                              {(item.price * (1 - item.discount / 100)).toFixed(2)}€
                            </>
                          ) : (
                            `${item.price}€`
                          )}
                        </span>
                      </div>

                      {/* Contrôles quantité */}
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button variant="ghost" size="sm">
                        <Heart size={14} className="mr-1" />
                        Favoris
                      </Button>
                      {!item.in_stock && (
                        <Badge variant="destructive">Rupture de stock</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Code promo */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Code promo</h3>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Entrez votre code promo"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <Button onClick={applyPromoCode}>
                  <Tag size={16} className="mr-2" />
                  Appliquer
                </Button>
              </div>
              {appliedPromo && (
                <div className="mt-2 text-green-600 text-sm">
                  ✓ Code {appliedPromo} appliqué (-10%)
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Résumé de commande */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Détail des prix */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Remise ({appliedPromo})</span>
                    <span>-{promoDiscount.toFixed(2)}€</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className={shipping === 0 ? "text-green-600" : ""}>
                    {shipping === 0 ? 'Gratuite' : `${shipping}€`}
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
              </div>

              {/* Bouton commande */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate('/payment')}
              >
                <CreditCard size={20} className="mr-2" />
                Procéder au paiement
              </Button>

              {/* Informations supplémentaires */}
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Truck size={16} />
                  <span>Livraison gratuite à partir de 100€</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield size={16} />
                  <span>Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowRight size={16} />
                  <span>Retours gratuits sous 30 jours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Continuer les achats */}
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => navigate('/marketplace')}
          >
            <ShoppingCart size={16} className="mr-2" />
            Continuer mes achats
          </Button>
        </div>
      </div>
    </div>
  );
}
