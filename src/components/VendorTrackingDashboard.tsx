import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '../ui/use-toast';
import NotificationSystem from './NotificationSystem';
import RealtimeTrackingMap from './RealtimeTrackingMap';
import GPSTracker from './GPSTracker';
import { 
  Store, 
  Package, 
  Truck, 
  Users, 
  MapPin, 
  Clock, 
  Phone,
  MessageCircle,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';

interface Order {
  id: string;
  readable_id: string;
  customer_id: string;
  seller_id: string;
  courier_id?: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  delivery_address?: string;
}

interface Profile {
  id: string;
  user_id: string;
  readable_id: string;
  full_name: string;
  role: string;
  phone?: string;
}

const VendorTrackingDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch vendor orders
  const fetchOrders = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);

      // Fetch related profiles
      const userIds = new Set<string>();
      ordersData?.forEach(order => {
        userIds.add(order.customer_id);
        if (order.courier_id) userIds.add(order.courier_id);
      });

      if (userIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', Array.from(userIds));

        if (profilesError) throw profilesError;

        const profilesMap: Record<string, Profile> = {};
        profilesData?.forEach(profile => {
          profilesMap[profile.user_id] = profile;
        });
        setProfiles(profilesMap);
      }

    } catch (err) {
      console.error('Error fetching orders:', err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to real-time order updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('vendor-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Order update:', payload);
          fetchOrders(); // Refresh orders
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchOrders();
  }, [user]);

  // Assign courier to order
  const assignCourier = async (orderId: string, courierId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          courier_id: courierId,
          status: 'confirmed'
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Livreur assigné à la commande",
      });

      fetchOrders();

    } catch (err) {
      console.error('Error assigning courier:', err);
      toast({
        title: "Erreur",
        description: "Impossible d'assigner le livreur",
        variant: "destructive",
      });
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Statut de commande mis à jour",
      });

      fetchOrders();

    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive",
      });
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.readable_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profiles[order.customer_id]?.readable_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profiles[order.customer_id]?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="w-8 h-8 text-primary" />
            Tableau de Bord Marchand
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos commandes et suivez les livraisons en temps réel
          </p>
        </div>
        
        <Button 
          onClick={fetchOrders}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commandes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {orders.filter(o => o.status === 'in_transit').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Livrées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Commandes
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Tracking GPS
          </TabsTrigger>
          <TabsTrigger value="couriers" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Livreurs
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="ID commande, client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="status-filter">Statut</Label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                  >
                    <option value="all">Tous</option>
                    <option value="pending">En attente</option>
                    <option value="assigned">Assigné</option>
                    <option value="in_transit">En transit</option>
                    <option value="delivered">Livré</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-3">
            {isLoading ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Chargement...</span>
                  </div>
                </CardContent>
              </Card>
            ) : filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Aucune commande trouvée
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => {
                const customer = profiles[order.customer_id];
                const courier = order.courier_id ? profiles[order.courier_id] : null;
                
                return (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                            {order.readable_id}
                          </Badge>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusLabel(order.status)}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {order.total_amount} {order.currency}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Client Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Client</span>
                          </div>
                          <div className="pl-6">
                            <div className="font-mono text-sm bg-blue-50 px-2 py-1 rounded">
                              {customer?.readable_id || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {customer?.full_name || 'Nom non défini'}
                            </div>
                            {customer?.phone && (
                              <div className="text-sm text-muted-foreground">
                                {customer.phone}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Courier Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">Livreur</span>
                          </div>
                          <div className="pl-6">
                            {courier ? (
                              <>
                                <div className="font-mono text-sm bg-orange-50 px-2 py-1 rounded">
                                  {courier.readable_id}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {courier.full_name}
                                </div>
                                {courier.phone && (
                                  <div className="text-sm text-muted-foreground">
                                    {courier.phone}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                Non assigné
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Adresse</span>
                          </div>
                          <div className="pl-6">
                            <div className="text-sm text-muted-foreground">
                              {order.delivery_address || 'Non spécifiée'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOrderId(order.id)}
                            className="flex items-center gap-1"
                          >
                            <MapPin className="w-3 h-3" />
                            Voir sur carte
                          </Button>
                          
                          {customer?.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              Appeler
                            </Button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {order.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'confirmed')}
                            >
                              Confirmer commande
                            </Button>
                          )}
                          
                          {order.status === 'confirmed' && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'shipped')}
                            >
                              Marquer expédié
                            </Button>
                          )}
                          
                          {order.status === 'shipped' && (
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order.id, 'delivered')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Marquer comme livré
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="tracking">
          <RealtimeTrackingMap 
            orderId={selectedOrderId}
            onOrderSelect={setSelectedOrderId}
          />
        </TabsContent>

        <TabsContent value="couriers">
          <GPSTracker 
            userRole="seller"
            orderId={selectedOrderId}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorTrackingDashboard;
