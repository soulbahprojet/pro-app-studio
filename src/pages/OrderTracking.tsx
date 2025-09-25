import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { 
  ArrowLeft,
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  MessageCircle,
  Phone,
  Copy,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Order {
  id: string;
  transaction_code: string;
  total_amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  delivery_address: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
  }>;
  seller_name?: string;
  courier_name?: string;
}

const OrderTracking = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const statusConfig = {
    pending: { label: "En attente", color: "bg-yellow-500", icon: Clock },
    processing: { label: "Traitement", color: "bg-blue-500", icon: Package },
    shipped: { label: "Expédié", color: "bg-purple-500", icon: Truck },
    delivered: { label: "Livré", color: "bg-green-500", icon: CheckCircle },
    cancelled: { label: "Annulé", color: "bg-red-500", icon: X }
  };

  const statusFilters = [
    { value: "all", label: "Toutes" },
    { value: "pending", label: "En attente" },
    { value: "processing", label: "Traitement" },
    { value: "shipped", label: "Expédié" },
    { value: "delivered", label: "Livré" },
    { value: "cancelled", label: "Annulé" }
  ];

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    let filtered = orders;

    // Filter by search term (transaction code or product name)
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.transaction_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(order => order.status === selectedStatus);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, selectedStatus]);

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            products (name)
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: Order[] = data?.map(order => ({
        id: order.id,
        transaction_code: order.transaction_code || 'N/A',
        total_amount: order.total_amount,
        currency: order.currency,
        status: (order.status === 'confirmed' ? 'processing' : order.status) as 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
        created_at: order.created_at,
        delivery_address: order.delivery_address,
        items: order.order_items?.map(item => ({
          product_name: item.products?.name || 'Produit inconnu',
          quantity: item.quantity,
          unit_price: item.unit_price
        })) || []
      })) || [];

      setOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };

  const copyTransactionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copié dans le presse-papier");
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = steps.indexOf(currentStatus);
    
    if (currentStatus === 'cancelled') {
      return steps.map((step, index) => ({
        status: step,
        completed: false,
        active: false,
        cancelled: true
      }));
    }
    
    return steps.map((step, index) => ({
      status: step,
      completed: index <= currentIndex,
      active: index === currentIndex,
      cancelled: false
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/profile">
              <Button size="icon" variant="outline">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Mes commandes</h1>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Rechercher par code ou produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtres de statut */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedStatus === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(filter.value)}
                className="whitespace-nowrap"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="px-4 py-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {orders.length === 0 ? "Aucune commande" : "Aucun résultat"}
              </h3>
              <p className="text-muted-foreground">
                {orders.length === 0 
                  ? "Vous n'avez pas encore passé de commande"
                  : "Aucune commande ne correspond à vos critères"
                }
              </p>
              {orders.length === 0 && (
                <Link to="/marketplace">
                  <Button className="mt-4">
                    Explorer le marketplace
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = statusConfig[order.status];
              const StatusIcon = statusInfo.icon;
              
              return (
                <Card key={order.id} className="hover:shadow-md transition-smooth">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${statusInfo.color} rounded-full flex items-center justify-center`}>
                          <StatusIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            Commande #{order.transaction_code}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="secondary" 
                          className={`${statusInfo.color} text-white`}
                        >
                          {statusInfo.label}
                        </Badge>
                        <p className="text-sm font-semibold text-foreground mt-1">
                          {order.total_amount.toLocaleString()} {order.currency}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Transaction Code */}
                    <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground">Code de transaction</p>
                        <p className="font-bold text-primary">{order.transaction_code}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyTransactionCode(order.transaction_code)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copier
                      </Button>
                    </div>

                    {/* Order Items */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Articles:</p>
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.product_name} x{item.quantity}
                          </span>
                          <span className="text-foreground">
                            {(item.unit_price * item.quantity).toLocaleString()} {order.currency}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Status Timeline */}
                    <div>
                      <p className="text-sm font-medium text-foreground mb-3">Suivi:</p>
                      <div className="flex items-center justify-between">
                        {getStatusSteps(order.status).map((step, index) => {
                          const StepIcon = statusConfig[step.status].icon;
                          return (
                            <div key={step.status} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step.cancelled 
                                  ? 'bg-red-100 text-red-500'
                                  : step.completed 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                <StepIcon className="h-4 w-4" />
                              </div>
                              <p className={`text-xs mt-1 ${
                                step.completed ? 'text-primary' : 'text-muted-foreground'
                              }`}>
                                {statusConfig[step.status].label}
                              </p>
                              {index < getStatusSteps(order.status).length - 1 && (
                                <div className={`w-8 h-0.5 mt-1 ${
                                  step.completed ? 'bg-primary' : 'bg-muted'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link to={`/order/${order.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          Détails
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Support
                      </Button>
                      {order.status === 'shipped' && (
                        <Button variant="outline" size="sm">
                          <Truck className="h-3 w-3 mr-1" />
                          Suivre
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
