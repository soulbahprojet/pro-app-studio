import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bike, 
  MapPin, 
  Clock, 
  Navigation, 
  User,
  Phone,
  Euro,
  Route,
  Star,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  TrendingUp,
  Battery,
  Signal,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface Ride {
  id: string;
  rideNumber: string;
  passengerName: string;
  pickupAddress: string;
  destinationAddress: string;
  phone: string;
  fare: number;
  status: 'requested' | 'accepted' | 'pickup' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime: string;
  distance: string;
  priority: 'normal' | 'urgent';
  rating?: number;
}

interface DriverStats {
  todayRides: number;
  completedRides: number;
  activeRides: number;
  totalEarnings: number;
  avgRating: number;
  totalDistance: number;
  hoursWorked: number;
}

export default function TransportDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [currentLocation, setCurrentLocation] = useState("Plateau, Dakar");
  const [rides, setRides] = useState<Ride[]>([
    {
      id: 'RIDE-001',
      rideNumber: 'MTX-2024-001',
      passengerName: 'Aminata Sow',
      pickupAddress: 'Gare Routière Pompiers, Dakar',
      destinationAddress: 'Université Cheikh Anta Diop',
      phone: '+221 77 345 6789',
      fare: 2500,
      status: 'requested',
      estimatedTime: '15 min',
      distance: '8.2 km',
      priority: 'normal'
    },
    {
      id: 'RIDE-002',
      rideNumber: 'MTX-2024-002', 
      passengerName: 'Omar Ndao',
      pickupAddress: 'Marché Sandaga',
      destinationAddress: 'Aéroport LSS',
      phone: '+221 70 234 5678',
      fare: 8000,
      status: 'accepted',
      estimatedTime: '35 min',
      distance: '18.5 km',
      priority: 'urgent'
    }
  ]);

  const [stats, setStats] = useState<DriverStats>({
    todayRides: 18,
    completedRides: 15,
    activeRides: 3,
    totalEarnings: 67500,
    avgRating: 4.9,
    totalDistance: 234.6,
    hoursWorked: 8.5
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      requested: { variant: 'outline' as const, icon: Clock, text: 'Demandée' },
      accepted: { variant: 'default' as const, icon: CheckCircle, text: 'Acceptée' },
      pickup: { variant: 'default' as const, icon: MapPin, text: 'Récupération' },
      in_progress: { variant: 'default' as const, icon: Navigation, text: 'En cours' },
      completed: { variant: 'default' as const, icon: CheckCircle, text: 'Terminée' },
      cancelled: { variant: 'destructive' as const, icon: AlertCircle, text: 'Annulée' }
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

  const updateRideStatus = (id: string, newStatus: string) => {
    setRides(rides.map(ride => 
      ride.id === id ? { ...ride, status: newStatus as any } : ride
    ));
  };

  return (
    <div className="w-full space-y-6">
      {/* Header avec statut chauffeur */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <Bike className="text-blue-600" size={32} />
          <h1 className="text-4xl font-bold">Moto-Taxi Dashboard</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Gérez vos courses en temps réel et maximisez vos revenus
        </p>
        <div className="flex justify-center items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <MapPin className="text-blue-600" size={16} />
            <span>{currentLocation}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Battery className="text-green-600" size={16} />
            <span>92%</span>
          </div>
          <div className="flex items-center space-x-2">
            <Signal className="text-blue-600" size={16} />
            <span>5G</span>
          </div>
        </div>
      </div>

      {/* Statistiques du jour */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses aujourd'hui</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedRides}</div>
            <p className="text-xs text-muted-foreground">
              sur {stats.todayRides} demandes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du jour</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()} CFA</div>
            <p className="text-xs text-green-600">+22% vs hier</p>
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
              Moyenne: {(stats.totalDistance / stats.completedRides).toFixed(1)} km/course
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}/5</div>
            <p className="text-xs text-green-600">Service excellent</p>
          </CardContent>
        </Card>
      </div>

      {/* Demandes de courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation size={20} />
            <span>Courses en cours ({rides.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rides.map((ride) => (
              <div key={ride.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{ride.rideNumber}</span>
                      {getStatusBadge(ride.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{ride.distance}</span>
                      <span>~{ride.estimatedTime}</span>
                      <span className="font-medium text-green-600">{ride.fare.toLocaleString()} CFA</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Navigation size={14} className="mr-1" />
                    Itinéraire
                  </Button>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-muted-foreground" />
                      <span className="font-medium">{ride.passengerName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={16} className="text-muted-foreground" />
                      <span className="text-sm">{ride.phone}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">📍 Départ: {ride.pickupAddress}</p>
                      <p className="text-xs text-muted-foreground">🎯 Arrivée: {ride.destinationAddress}</p>
                    </div>
                  </div>

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
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => updateRideStatus(ride.id, 'completed')}
                    >
                      Marquer comme terminée
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}