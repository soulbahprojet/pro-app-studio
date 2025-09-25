import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  CreditCard,
  Package
} from 'lucide-react';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    currency: string;
    images: string[];
    seller_id: string;
  };
}

interface ClientCartProps {
  onProceedToPayment: (items: CartItem[], total: number) => void;
  onCancelOrder: () => void;
}

const ClientCart: React.FC<ClientCartProps> = ({ onProceedToPayment, onCancelOrder }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      setLoading(true);
      
      // Données simulées pour le panier
      const mockCartItems: CartItem[] = [
        {
          id: '1',
          quantity: 2,
          product_id: '1',
          products: {
            id: '1',
            name: 'Smartphone Samsung Galaxy A54',
            price: 2500000,
            currency: 'GNF',
            images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop'],
            seller_id: '1'
          }
        },
        {
          id: '2',
          quantity: 1,
          product_id: '2',
          products: {
            id: '2',
            name: 'Robe Traditionnelle Guinéenne',
            price: 850000,
            currency: 'GNF',
            images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop'],
            seller_id: '2'
          }
        }
      ];

      setCartItems(mockCartItems);
      
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.products.price * item.quantity), 0);
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const getImageUrl = (images: string[]) => {
    return images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
  };

  const handleProceedToPayment = () => {
    if (cartItems.length === 0) return;
    onProceedToPayment(cartItems, calculateTotal());
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-muted-foreground">Chargement du panier...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Mon Panier ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
      </Card>

      {cartItems.length > 0 ? (
        <>
          {/* Articles du panier */}
          <Card>
            <CardHeader>
              <CardTitle>Articles dans votre panier</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img
                    src={getImageUrl(item.products.images)}
                    alt={item.products.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.products.name}</h3>
                    <p className="font-bold text-primary text-lg">
                      {formatPrice(item.products.price, item.products.currency)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      className="w-16 text-center"
                      min={1}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-xl">
                      {formatPrice(item.products.price * item.quantity, item.products.currency)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Récapitulatif */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Sous-total:</span>
                <span className="font-bold">{formatPrice(calculateTotal(), 'GNF')}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Frais de livraison:</span>
                <span>Calculés à l'étape suivante</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total estimé:</span>
                <span className="text-primary">{formatPrice(calculateTotal(), 'GNF')}</span>
              </div>
              
              <div className="pt-4 space-y-3">
                <Button 
                  className="w-full"
                  size="lg"
                  onClick={handleProceedToPayment}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Procéder au paiement
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Vous pourrez modifier ou annuler votre commande avant le paiement final
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Votre panier est vide</h3>
            <p className="text-muted-foreground mb-6">
              Découvrez nos produits et ajoutez-les à votre panier
            </p>
            <Button size="lg">
              <Package className="w-5 h-5 mr-2" />
              Explorer les produits
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClientCart;