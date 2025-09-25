import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Filter, Package, Truck, CheckCircle, Clock, 
  AlertTriangle, Eye, Printer, MapPin, User, Calendar,
  DollarSign, MessageCircle, RefreshCw, X
} from "lucide-react";
import { toast } from "sonner";

const VendorOrderManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Commandes fictives - à remplacer par des vraies données
  const orders = [
    {
      id: "ORD-2024-001",
      customer: "Mamadou Diallo",
      customerId: "CLT-0001",
      date: "2024-01-15T10:30:00Z",
      status: "pending",
      total: "485,000 GNF",
      items: [
        { name: "iPhone 15 Pro", quantity: 1, price: "450,000 GNF" },
        { name: "Coque protection", quantity: 1, price: "35,000 GNF" }
      ],
      shippingAddress: "Kaloum, Conakry, Guinée",
      phone: "+224 622 123 456",
      paymentMethod: "Mobile Money",
      paymentStatus: "paid",
      trackingNumber: null,
      estimatedDelivery: null,
      notes: "Livraison urgente demandée"
    },
    {
      id: "ORD-2024-002", 
      customer: "Aissatou Bah",
      customerId: "CLT-0002",
      date: "2024-01-14T15:45:00Z",
      status: "processing",
      total: "125,000 GNF",
      items: [
        { name: "Casque Bluetooth", quantity: 1, price: "125,000 GNF" }
      ],
      shippingAddress: "Matam, Conakry, Guinée",
      phone: "+224 664 789 012",
      paymentMethod: "Carte bancaire",
      paymentStatus: "paid",
      trackingNumber: "TRK-001234",
      estimatedDelivery: "2024-01-16",
      notes: ""
    },
    {
      id: "ORD-2024-003",
      customer: "Ibrahima Camara",
      customerId: "CLT-0003", 
      date: "2024-01-13T09:15:00Z",
      status: "shipped",
      total: "89,000 GNF",
      items: [
        { name: "Chargeur rapide", quantity: 2, price: "89,000 GNF" }
      ],
      shippingAddress: "Dixinn, Conakry, Guinée",
      phone: "+224 655 456 789",
      paymentMethod: "Mobile Money",
      paymentStatus: "paid",
      trackingNumber: "TRK-001235",
      estimatedDelivery: "2024-01-15",
      notes: ""
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "outline" as const, color: "border-orange-500 text-orange-700" },
      confirmed: { label: "Confirmée", variant: "outline" as const, color: "border-blue-500 text-blue-700" },
      processing: { label: "Préparation", variant: "outline" as const, color: "border-purple-500 text-purple-700" },
      shipped: { label: "Expédiée", variant: "outline" as const, color: "border-green-500 text-green-700" },
      delivered: { label: "Livrée", variant: "default" as const, color: "" },
      cancelled: { label: "Annulée", variant: "destructive" as const, color: "" },
      refunded: { label: "Remboursée", variant: "outline" as const, color: "border-red-500 text-red-700" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'processing': return <Package className="h-4 w-4 text-purple-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <X className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    toast.success(`Commande ${orderId} mise à jour vers: ${newStatus}`);
  };

  const printOrder = (orderId: string) => {
    toast.info(`Impression de la commande ${orderId}`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Commandes</h2>
          <p className="text-muted-foreground">Suivez et gérez toutes vos commandes</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{orderStats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{orderStats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Préparation</p>
                <p className="text-2xl font-bold text-purple-600">{orderStats.processing}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expédiées</p>
                <p className="text-2xl font-bold text-blue-600">{orderStats.shipped}</p>
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Livrées</p>
                <p className="text-2xl font-bold text-green-600">{orderStats.delivered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro de commande ou client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="processing">Préparation</SelectItem>
                <SelectItem value="shipped">Expédiées</SelectItem>
                <SelectItem value="delivered">Livrées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des commandes */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-semibold text-lg">{order.id}</h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {order.customer} • {order.customerId}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-muted-foreground">Total</p>
                      <p className="font-bold text-lg text-primary">{order.total}</p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Date</p>
                      <p className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(order.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">Adresse</p>
                      <p className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {order.shippingAddress}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {item.quantity}x {item.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 min-w-[200px]">
                  {order.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, 'confirmed')}>
                        Confirmer
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, 'processing')}>
                        Préparer
                      </Button>
                    </>
                  )}
                  {order.status === 'processing' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, 'shipped')}>
                      <Truck className="h-3 w-3 mr-1" />
                      Marquer expédiée
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button size="sm" onClick={() => updateOrderStatus(order.id, 'delivered')}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Marquer livrée
                    </Button>
                  )}
                  
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-3 w-3 mr-1" />
                          Détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Détails de la commande {order.id}</DialogTitle>
                        </DialogHeader>
                        {selectedOrder && (
                          <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-2">Informations client</h4>
                                <p className="text-sm"><strong>Nom:</strong> {selectedOrder.customer}</p>
                                <p className="text-sm"><strong>Téléphone:</strong> {selectedOrder.phone}</p>
                                <p className="text-sm"><strong>Adresse:</strong> {selectedOrder.shippingAddress}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Informations commande</h4>
                                <p className="text-sm"><strong>Date:</strong> {new Date(selectedOrder.date).toLocaleString('fr-FR')}</p>
                                <p className="text-sm"><strong>Paiement:</strong> {selectedOrder.paymentMethod}</p>
                                <p className="text-sm"><strong>Statut paiement:</strong> {selectedOrder.paymentStatus}</p>
                                {selectedOrder.trackingNumber && (
                                  <p className="text-sm"><strong>Suivi:</strong> {selectedOrder.trackingNumber}</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Articles commandés</h4>
                              <div className="space-y-2">
                                {selectedOrder.items.map((item: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-3 bg-accent/50 rounded-lg">
                                    <div>
                                      <p className="font-medium">{item.name}</p>
                                      <p className="text-sm text-muted-foreground">Quantité: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold">{item.price}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between items-center mt-4 p-3 bg-primary/10 rounded-lg">
                                <p className="font-bold">Total</p>
                                <p className="font-bold text-lg text-primary">{selectedOrder.total}</p>
                              </div>
                            </div>

                            {selectedOrder.notes && (
                              <div>
                                <h4 className="font-semibold mb-2">Notes</h4>
                                <p className="text-sm bg-accent/50 p-3 rounded-lg">{selectedOrder.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button size="sm" variant="outline" onClick={() => printOrder(order.id)}>
                      <Printer className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucune commande trouvée</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Essayez d'ajuster vos filtres de recherche"
                : "Vos commandes apparaîtront ici"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorOrderManager;