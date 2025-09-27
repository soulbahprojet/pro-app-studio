import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Navigation, 
  Package,
  CheckCircle,
  AlertCircle,
  Route,
  User,
  Phone,
  Euro,
  Calendar,
  BarChart3,
  TrendingUp,
  Battery,
  Signal
} from 'lucide-react';

interface Delivery {
  id: string;
  orderNumber: string;
  customerName: string;
  address: string;
  phone: string;
  amount: number;
  status: 'assigned' | 'picking_up' | 'in_transit' | 'delivered' | 'failed';
  estimatedTime: string;
  distance: string;
  priority: 'low' | 'medium' | 'high';
}

interface DeliveryStats {
  todayDeliveries: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  totalEarnings: number;
  avgRating: number;
  totalDistance: number;
}

export default function DeliveryDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [currentLocation, setCurrentLocation] = useState("Place de l'Indépendance, Dakar");
  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: 'DEL-001',
      orderNumber: 'CMD-2024-001',
      customerName: 'Fatou Diop',
      address: 'Plateau, Rue 6, Dakar',
      phone: '+221 77 123 4567',
      amount: 15000,
      status: 'assigned',
      estimatedTime: '25 min',
      distance: '3.2 km',
      priority: 'high'
    },
    {
      id: 'DEL-002', 
      orderNumber: 'CMD-2024-002',
      customerName: 'Mamadou Ba',
      address: 'Sacré-Coeur, Villa 45',
      phone: '+221 70 987 6543',
      amount: 8500,
      status: 'picking_up',
      estimatedTime: '15 min',
      distance: '1.8 km',
      priority: 'medium'
    },
    {
      id: 'DEL-003',
      orderNumber: 'CMD-2024-003',
      customerName: 'Aïssatou Ndiaye',
      address: 'Almadies, Résidence Ngor',
      phone: '+221 76 456 7890',
      amount: 22000,
      status: 'in_transit',
      estimatedTime: '35 min',
      distance: '8.5 km',
      priority: 'high'
    }
  ]);

  const [stats, setStats] = useState<DeliveryStats>({
    todayDeliveries: 12,
    completedDeliveries: 9,
    pendingDeliveries: 3,
    totalEarnings: 45000,
    avgRating: 4.8,
    totalDistance: 156.7
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      assigned: { variant: 'outline' as const, icon: Package, text: 'Assignée', color: 'text-blue-600' },
      picking_up: { variant: 'default' as const, icon: Truck, text: 'Récupération', color: 'text-orange-600' },
      in_transit: { variant: 'default' as const, icon: Navigation, text: 'En transit', color: 'text-purple-600' },
      delivered: { variant: 'default' as const, icon: CheckCircle, text: 'Livrée', color: 'text-green-600' },
      failed: { variant: 'destructive' as const, icon: AlertCircle, text: 'Échec', color: 'text-red-600' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon size={12} />
        <span>{config.text}</span>
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700'
    };
    
    return (
      <Badge className={colors[priority as keyof typeof colors]}>
        {priority === 'high' ? 'Urgent' : priority === 'medium' ? 'Normal' : 'Standard'}
      </Badge>
    );
  };

  const updateDeliveryStatus = (id: string, newStatus: string) => {
    setDeliveries(deliveries.map(delivery => 
      delivery.id === id ? { ...delivery, status: newStatus as any } : delivery
    ));
  };

  return (
    <div className="w-full space-y-6">
      {/* Header avec statut en ligne */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="text-4xl font-bold">Dashboard Livreur</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Gérez vos livraisons en temps réel et optimisez vos trajets
        </p>
        <div className="flex justify-center items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="text-blue-600" size={16} />
            <span>{currentLocation}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Battery className="text-green-600" size={16} />
            <span>85%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Signal className="text-blue-600" size={16} />
            <span>4G</span>
          </div>
        </div>
      </div>

      {/* Contrôles de statut */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                variant={isOnline ? "destructive" : "default"}
                onClick={() => setIsOnline(!isOnline)}
              >
                {isOnline ? 'Se déconnecter' : 'Se connecter'}
              </Button>
              <Button variant="outline">
                <Navigation size={16} className="mr-2" />
                Actualiser position
              </Button>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Statut aujourd'hui</p>
              <p className="font-semibold">{stats.completedDeliveries}/{stats.todayDeliveries} livraisons</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques du jour */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livraisons aujourd'hui</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.todayDeliveries} assignées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gains du jour</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()} CFA</div>
            <p className="text-xs text-green-600">
              +15% vs hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distance parcourue</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDistance} km</div>
            <p className="text-xs text-muted-foreground">
              Moyenne: 13 km/livraison
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}/5</div>
            <p className="text-xs text-green-600">
              Excellent service
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Livraisons en cours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Truck size={20} />
            <span>Livraisons en cours ({deliveries.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div key={delivery.id} className="border rounded-lg p-4 space-y-4">
                {/* En-tête livraison */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{delivery.orderNumber}</span>
                      {getStatusBadge(delivery.status)}
                      {getPriorityBadge(delivery.priority)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{delivery.distance}</span>
                      <span>~{delivery.estimatedTime}</span>
                      <span>{delivery.amount.toLocaleString()} CFA</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Navigation size={14} className="mr-1" />
                    Itinéraire
                  </Button>
                </div>

                <Separator />

                {/* Informations client */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-muted-foreground" />
                      <span className="font-medium">{delivery.customerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-muted-foreground" />
                      <span className="text-sm">{delivery.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={16} className="text-muted-foreground" />
                      <span className="text-sm">{delivery.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone size={14} className="mr-1" />
                        Appeler
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Navigation size={14} className="mr-1" />
                        GPS
                      </Button>
                    </div>
                    
                    {/* Boutons de mise à jour statut */}
                    <div className="flex space-x-2">
                      {delivery.status === 'assigned' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => updateDeliveryStatus(delivery.id, 'picking_up')}
                        >
                          Récupérer
                        </Button>
                      )}
                      {delivery.status === 'picking_up' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => updateDeliveryStatus(delivery.id, 'in_transit')}
                        >
                          En route
                        </Button>
                      )}
                      {delivery.status === 'in_transit' && (
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                        >
                          Livré
                        </Button>
                      )}
                      {delivery.status !== 'delivered' && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => updateDeliveryStatus(delivery.id, 'failed')}
                        >
                          Problème
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Carte et historique */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Zone carte simulée */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin size={20} />
              <span>Carte temps réel</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <MapPin className="mx-auto text-gray-400" size={48} />
                <p className="text-muted-foreground">Carte GPS en temps réel</p>
                <p className="text-sm text-muted-foreground">Position actuelle: {currentLocation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp size={20} />
              <span>Performances cette semaine</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Livraisons réussies</span>
                <span className="font-medium">47/50</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{width: '94%'}}></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ponctualité</span>
                <span className="font-medium">89%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{width: '89%'}}></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Satisfaction client</span>
                <span className="font-medium">4.8/5</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600" style={{width: '96%'}}></div>
              </div>
            </div>

            <Separator />
            
            <div className="text-center">
              <Button variant="outline" size="sm">
                Voir historique complet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
