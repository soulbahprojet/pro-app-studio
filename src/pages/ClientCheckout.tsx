import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { 
  ArrowLeft,
  Wallet,
  CreditCard,
  Shield,
  CheckCircle,
  Package,
  Truck
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  seller: string;
}

const ClientCheckout = () => {
  const [cartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Samsung Galaxy A54",
      price: 850000,
      quantity: 1,
      image: "/placeholder.svg",
      seller: "TechStore Conakry"
    },
    {
      id: "2", 
      name: "Robe Africaine Traditionnelle",
      price: 120000,
      quantity: 2,
      image: "/placeholder.svg",
      seller: "Mode Africaine"
    }
  ]);

  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transactionCode, setTransactionCode] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 25000; // 25,000 GNF shipping
  const total = subtotal + shipping;

  useEffect(() => {
    fetchWalletBalance();
  }, [user]);

  const fetchWalletBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance_gnf')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setWalletBalance(data?.balance_gnf || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const generateTransactionCode = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_transaction_code');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating transaction code:', error);
      // Fallback: generate client-side
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const letter = letters[Math.floor(Math.random() * letters.length)];
      const numbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return letter + numbers;
    }
  };

  const processPayment = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour effectuer un achat");
      return;
    }

    if (walletBalance < total) {
      toast.error("Solde insuffisant dans votre wallet");
      navigate("/wallet");
      return;
    }

    setLoading(true);
    
    try {
      // Generate transaction code
      const code = await generateTransactionCode();
      
      // Create order with transaction code
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user.id,
          seller_id: user.id, // Temporary - should be actual seller
          total_amount: total,
          currency: 'GNF',
          status: 'pending',
          transaction_code: code,
          delivery_address: profile?.address || 'Adresse non définie'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance_gnf: walletBalance - total 
        })
        .eq('user_id', user.id);

      if (walletError) throw walletError;

      // Create transaction record
      const walletData = await supabase.from('wallets').select('id').eq('user_id', user.id).single();
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: walletData.data?.id || '',
          type: 'payment',
          amount: -total,
          currency: 'GNF',
          description: `Achat - Code: ${code}`,
          reference_id: order.id
        });

      if (transactionError) throw transactionError;

      setTransactionCode(code);
      toast.success(`Paiement effectué avec succès! Code: ${code}`);
      
      // Navigate to order confirmation
      setTimeout(() => {
        navigate(`/order-confirmation/${order.id}`);
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  if (transactionCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-foreground">Paiement réussi!</h2>
            <p className="text-muted-foreground mb-4">
              Votre commande a été traitée avec succès
            </p>
            <div className="bg-accent/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Code de transaction</p>
              <p className="text-2xl font-bold text-primary">{transactionCode}</p>
            </div>
            <Button onClick={() => navigate("/orders")} className="w-full">
              Voir mes commandes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/cart">
              <Button size="icon" variant="outline">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Finaliser la commande</h1>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Récapitulatif des articles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Récapitulatif de la commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.seller}</p>
                  <p className="text-sm text-muted-foreground">Qté: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">
                    {(item.price * item.quantity).toLocaleString()} GNF
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Adresse de livraison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Adresse de livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{profile?.full_name}</p>
            <p className="text-muted-foreground">{profile?.address || 'Adresse non définie'}</p>
            <p className="text-muted-foreground">{profile?.country}</p>
          </CardContent>
        </Card>

        {/* Méthode de paiement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Méthode de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Wallet 224SOLUTIONS</p>
                  <p className="text-sm text-muted-foreground">
                    Solde: {walletBalance.toLocaleString()} GNF
                  </p>
                </div>
              </div>
              <Badge variant="default">Par défaut</Badge>
            </div>
            
            {walletBalance < total && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive">
                  Solde insuffisant. Vous devez recharger votre wallet.
                </p>
                <Link to="/wallet">
                  <Button variant="outline" size="sm" className="mt-2">
                    Recharger le wallet
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Récapitulatif des prix */}
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="text-foreground">{subtotal.toLocaleString()} GNF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span className="text-foreground">{shipping.toLocaleString()} GNF</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{total.toLocaleString()} GNF</span>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Paiement sécurisé par 224SOLUTIONS</span>
        </div>

        {/* Bouton de paiement */}
        <Button 
          onClick={processPayment}
          disabled={loading || walletBalance < total}
          className="w-full h-12 text-lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Traitement...
            </div>
          ) : (
            `Payer ${total.toLocaleString()} GNF`
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          En confirmant votre commande, vous acceptez nos conditions d'utilisation.
          Un code de transaction unique vous sera fourni pour le suivi.
        </p>
      </div>
    </div>
  );
};

export default ClientCheckout;
