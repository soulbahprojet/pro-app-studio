import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  User,
  ShoppingBag
} from 'lucide-react';

interface ClickCollectOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: 'pending' | 'ready' | 'collected' | 'expired';
  ordered_at: string;
  ready_at?: string;
  collected_at?: string;
  pickup_notes?: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export function ClickAndCollectManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<ClickCollectOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'ready' | 'collected'>('all');

  useEffect(() => {
    loadClickCollectOrders();
  }, [user]);

  const loadClickCollectOrders = async () => {
    if (!user) return;
    
    try {
      // Simulation de données Click & Collect
      const mockOrders: ClickCollectOrder[] = [
        {
          id: '1',
          order_number: 'CC-2024-001',
          customer_name: 'Fatou Diallo',
          customer_phone: '+224 620 00 00 01',
          customer_email: 'fatou@example.com',
          items: [
            {
              id: '1',
              product_name: 'Téléphone Samsung Galaxy A54',
              quantity: 1,
              unit_price: 1500000,
              total_price: 1500000
            },
            {
              id: '2',
              product_name: 'Coque de protection',
              quantity: 1,
              unit_price: 25000,
              total_price: 25000
            }
          ],
          total_amount: 1525000,
          currency: 'GNF',
          status: 'pending',
          ordered_at: '2024-01-15T10:30:00Z',
          pickup_notes: 'Prévoir un parking proche'
        },
        {
          id: '2',
          order_number: 'CC-2024-002',
          customer_name: 'Alpha Condé',
          customer_phone: '+224 620 00 00 02',
          customer_email: 'alpha@example.com',
          items: [
            {
              id: '3',
              product_name: 'Chaussures de sport Nike',
              quantity: 2,
              unit_price: 350000,
              total_price: 700000
            }
          ],
          total_amount: 700000,
          currency: 'GNF',
          status: 'ready',
          ordered_at: '2024-01-14T14:20:00Z',
          ready_at: '2024-01-15T09:00:00Z'
        },
        {
          id: '3',
          order_number: 'CC-2024-003',
          customer_name: 'Mariama Bah',
          customer_phone: '+224 620 00 00 03',
          customer_email: 'mariama@example.com',
          items: [
            {
              id: '4',
              product_name: 'Robe traditionnelle',
              quantity: 1,
              unit_price: 180000,
              total_price: 180000
            }
          ],
          total_amount: 180000,
          currency: 'GNF',
          status: 'collected',
          ordered_at: '2024-01-13T16:45:00Z',
          ready_at: '2024-01-14T11:30:00Z',
          collected_at: '2024-01-14T17:20:00Z'
        }
      ];
      
      setOrders(mockOrders);
      
    } catch (error) {
      console.error('Erreur chargement commandes Click & Collect:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes Click & Collect",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: ClickCollectOrder['status']) => {
    setOrders(prev =>
      prev.map(order => {
        if (order.id === orderId) {
          const updatedOrder = { ...order, status: newStatus };
          
          if (newStatus === 'ready') {
            updatedOrder.ready_at = new Date().toISOString();
          } else if (newStatus === 'collected') {
            updatedOrder.collected_at = new Date().toISOString();
          }
          
          return updatedOrder;
        }
        return order;
      })
    );

    toast({
      title: "Statut mis à jour",
      description: `Commande marquée comme ${newStatus === 'ready' ? 'prête' : newStatus === 'collected' ? 'collectée' : newStatus}`
    });
  };

  const callCustomer = (phone: string, customerName: string) => {
    // Simulation d'appel
    toast({
      title: "Appel en cours",
      description: `Appel vers ${customerName} (${phone})`,
    });
  };

  const getStatusColor = (status: ClickCollectOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'collected': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ClickCollectOrder['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'collected': return <Package className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Click & Collect */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">En préparation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'ready').length}
                </p>
                <p className="text-sm text-muted-foreground">Prêtes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {orders.filter(o => o.status === 'collected').length}
                </p>
                <p className="text-sm text-muted-foreground">Collectées</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-lg font-bold">
                  {orders.reduce((sum, o) => sum + o.total_amount, 0).toLocaleString()} GNF
                </p>
                <p className="text-sm text-muted-foreground">CA total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Commandes Click & Collect
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Toutes ({orders.length})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              En préparation ({orders.filter(o => o.status === 'pending').length})
            </Button>
            <Button
              variant={filter === 'ready' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('ready')}
            >
              Prêtes ({orders.filter(o => o.status === 'ready').length})
            </Button>
            <Button
              variant={filter === 'collected' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('collected')}
            >
              Collectées ({orders.filter(o => o.status === 'collected').length})
            </Button>
          </div>

          <ScrollArea className="h-96">
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <Card key={order.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{order.order_number}</h3>
                          <Badge className={getStatusColor(order.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status === 'pending' ? 'En préparation' : 
                               order.status === 'ready' ? 'Prête' : 
                               order.status === 'collected' ? 'Collectée' : 'Expirée'}
                            </div>
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {order.customer_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {order.customer_phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(order.ordered_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {order.total_amount.toLocaleString()} {order.currency}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} article(s)
                        </div>
                      </div>
                    </div>

                    {/* Articles */}
                    <div className="space-y-2 mb-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm bg-muted p-2 rounded">
                          <span>{item.product_name} x{item.quantity}</span>
                          <span>{item.total_price.toLocaleString()} GNF</span>
                        </div>
                      ))}
                    </div>

                    {/* Notes de retrait */}
                    {order.pickup_notes && (
                      <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded">
                        <div className="flex items-center gap-1 text-blue-800 text-sm font-medium">
                          <MapPin className="w-4 h-4" />
                          Notes de retrait:
                        </div>
                        <p className="text-blue-700 text-sm">{order.pickup_notes}</p>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="space-y-1 text-xs text-muted-foreground mb-4">
                      <div>Commandé: {new Date(order.ordered_at).toLocaleString()}</div>
                      {order.ready_at && (
                        <div>Prêt: {new Date(order.ready_at).toLocaleString()}</div>
                      )}
                      {order.collected_at && (
                        <div>Collecté: {new Date(order.collected_at).toLocaleString()}</div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => callCustomer(order.customer_phone, order.customer_name)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Appeler
                      </Button>
                      
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Marquer prête
                        </Button>
                      )}
                      
                      {order.status === 'ready' && (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, 'collected')}
                        >
                          <Package className="w-4 h-4 mr-1" />
                          Marquer collectée
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}