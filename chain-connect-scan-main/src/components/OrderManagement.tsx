import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Bell,
  Search,
  Filter,
  Eye,
  QrCode,
  MapPin,
  User,
  Calendar,
  CreditCard,
  RefreshCw
} from 'lucide-react';

interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  qr_code: string;
  created_at: string;
  delivery_address?: string;
  notes?: string;
  order_items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  profiles?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

interface OrderManagementProps {
  userId: string;
}

const OrderManagement: React.FC<OrderManagementProps> = ({ userId }) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);

  useEffect(() => {
    loadOrders();
    
    if (realTimeEnabled) {
      setupRealTime();
    }

    return () => {
      // Cleanup realtime subscriptions
      supabase.removeAllChannels();
    };
  }, [userId, realTimeEnabled]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          profiles!orders_customer_id_fkey(full_name, email, phone)
        `)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setOrders(data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commandes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealTime = () => {
    // Écouter les nouvelles commandes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${userId}`
        },
        async (payload) => {
          console.log('Nouvelle commande reçue:', payload);
          
          // Charger les détails complets de la commande
          const { data } = await supabase
            .from('orders')
            .select(`
              *,
              order_items(*),
              profiles!orders_customer_id_fkey(full_name, email, phone)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setOrders(prev => [data, ...prev]);
            
            // Notification sonore et visuelle
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nouvelle commande reçue!', {
                body: `Commande #${payload.new.id.slice(0, 8)} - ${formatAmount(payload.new.total_amount, payload.new.currency)}`,
                icon: '/favicon.ico'
              });
            }

            toast({
              title: "🎉 Nouvelle commande!",
              description: `Commande #${payload.new.id.slice(0, 8)} reçue`,
              duration: 5000
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${userId}`
        },
        (payload) => {
          console.log('Commande mise à jour:', payload);
          
          setOrders(prev => prev.map(order => 
            order.id === payload.new.id 
              ? { ...order, ...payload.new }
              : order
          ));

          toast({
            title: "Commande mise à jour",
            description: `Statut: ${getStatusLabel(payload.new.status)}`,
          });
        }
      )
      .subscribe();

    // Demander permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'GNF' ? 'USD' : currency,
      minimumFractionDigits: currency === 'GNF' ? 0 : 2
    });

    if (currency === 'GNF') {
      return `${amount.toLocaleString()} GNF`;
    }

    return formatter.format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      confirmed: { label: 'Confirmé', variant: 'default' as const, icon: CheckCircle, color: 'text-blue-600' },
      shipped: { label: 'Expédié', variant: 'default' as const, icon: Truck, color: 'text-purple-600' },
      delivered: { label: 'Livré', variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      cancelled: { label: 'Annulé', variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {config.label}
      </Badge>
    );
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

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `Commande passée au statut: ${getStatusLabel(newStatus)}`
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      totalRevenue: orders.reduce((sum, o) => sum + o.total_amount, 0)
    };
    return stats;
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Gestion des Commandes</h2>
          <p className="text-muted-foreground">
            {stats.total} commandes • {formatAmount(stats.totalRevenue, 'GNF')} de revenus
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={realTimeEnabled ? 'default' : 'outline'}
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            className="flex items-center gap-2"
          >
            <Bell className={`h-4 w-4 ${realTimeEnabled ? 'animate-pulse' : ''}`} />
            Temps réel {realTimeEnabled ? 'ON' : 'OFF'}
          </Button>
          <Button variant="outline" onClick={loadOrders}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmées</p>
                <p className="font-bold">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Expédiées</p>
                <p className="font-bold">{stats.shipped}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Livrées</p>
                <p className="font-bold">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Revenus</p>
                <p className="font-bold text-sm">{formatAmount(stats.totalRevenue, 'GNF')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Rechercher</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ID commande, client, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <Label>Filtrer par statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="shipped">Expédié</SelectItem>
                  <SelectItem value="delivered">Livré</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">Commande #{order.id.slice(0, 8)}</h3>
                    {getStatusBadge(order.status)}
                    {order.created_at && new Date(order.created_at) > new Date(Date.now() - 30 * 60 * 1000) && (
                      <Badge className="bg-red-500 animate-pulse">Nouveau</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{order.profiles?.full_name || 'Client'}</p>
                        <p className="text-muted-foreground">{order.profiles?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-bold">{formatAmount(order.total_amount, order.currency)}</p>
                        <p className="text-muted-foreground">{order.order_items.length} articles</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p>{new Date(order.created_at).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">{new Date(order.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-mono text-xs">{order.qr_code}</p>
                        <p className="text-muted-foreground">Code livraison</p>
                      </div>
                    </div>
                  </div>

                  {order.delivery_address && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-muted-foreground">{order.delivery_address}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 min-w-48">
                  <Label>Changer le statut</Label>
                  <Select
                    value={order.status}
                    onValueChange={(value) => updateOrderStatus(order.id, value as 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="confirmed">Confirmer</SelectItem>
                      <SelectItem value="shipped">Expédier</SelectItem>
                      <SelectItem value="delivered">Marquer livré</SelectItem>
                      <SelectItem value="cancelled">Annuler</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir détails
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Aucune commande trouvée</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucune commande ne correspond aux critères de recherche'
                  : 'Vous n\'avez pas encore reçu de commandes'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;