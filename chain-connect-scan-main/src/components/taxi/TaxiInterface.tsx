import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Bike, 
  MapPin, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Star,
  Navigation,
  Phone,
  AlertTriangle,
  DollarSign,
  Users,
  Timer,
  Route
} from 'lucide-react';

interface TaxiRide {
  id: string;
  passenger_name: string;
  passenger_phone: string;
  pickup_location: string;
  destination: string;
  estimated_fare: number;
  estimated_duration: string;
  distance: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  requested_at: string;
  payment_method: 'cash' | 'mobile_money' | 'card';
}

export default function TaxiInterface() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);
  const [currentRide, setCurrentRide] = useState<TaxiRide | null>(null);
  const [pendingRides, setPendingRides] = useState<TaxiRide[]>([]);
  const [stats, setStats] = useState({
    todayRides: 0,
    weekRides: 0,
    monthRevenue: 0,
    rating: 4.8,
    totalRides: 0
  });

  useEffect(() => {
    if (profile) {
      loadTaxiData();
    }
  }, [profile]);

  const loadTaxiData = async () => {
    // Simuler le chargement des courses
    const mockRides: TaxiRide[] = [
      {
        id: '1',
        passenger_name: 'Mamadou Diallo',
        passenger_phone: '+224 622 123 456',
        pickup_location: 'Aéroport de Conakry',
        destination: 'Kaloum Centre',
        estimated_fare: 45000,
        estimated_duration: '25 min',
        distance: '12 km',
        status: 'pending',
        requested_at: new Date().toISOString(),
        payment_method: 'cash'
      },
      {
        id: '2',
        passenger_name: 'Aissatou Bah',
        passenger_phone: '+224 664 789 012',
        pickup_location: 'Université de Conakry',
        destination: 'Matam',
        estimated_fare: 25000,
        estimated_duration: '15 min',
        distance: '8 km',
        status: 'pending',
        requested_at: new Date().toISOString(),
        payment_method: 'mobile_money'
      }
    ];

    setPendingRides(mockRides);
    setStats({
      todayRides: 7,
      weekRides: 34,
      monthRevenue: 850000,
      rating: 4.8,
      totalRides: 156
    });
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    toast({
      title: isOnline ? "Hors ligne" : "En ligne",
      description: isOnline ? "Vous ne recevrez plus de demandes de course" : "Vous pouvez maintenant recevoir des demandes",
    });
  };

  const acceptRide = (rideId: string) => {
    const ride = pendingRides.find(r => r.id === rideId);
    if (ride) {
      setCurrentRide({ ...ride, status: 'accepted' });
      setPendingRides(pendingRides.filter(r => r.id !== rideId));
      toast({
        title: "Course acceptée",
        description: "Rendez-vous au point de collecte du passager",
      });
    }
  };

  const rejectRide = (rideId: string) => {
    setPendingRides(pendingRides.filter(r => r.id !== rideId));
    toast({
      title: "Course refusée",
      description: "La course a été proposée à un autre chauffeur",
    });
  };

  const startRide = () => {
    if (currentRide) {
      setCurrentRide({ ...currentRide, status: 'in_progress' });
      toast({
        title: "Course démarrée",
        description: "Bon voyage ! N'oubliez pas la sécurité",
      });
    }
  };

  const completeRide = () => {
    if (currentRide) {
      setCurrentRide(null);
      toast({
        title: "Course terminée",
        description: "Paiement reçu. Vous pouvez accepter une nouvelle course",
      });
    }
  };

  const handleEmergency = () => {
    toast({
      title: "🚨 Alerte SOS",
      description: "Signal d'urgence envoyé aux autorités et au centre de contrôle",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Bike className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Taxi Moto</h1>
              <p className="text-muted-foreground">
                {profile?.full_name} • Transport de personnes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "🟢 En ligne" : "🔴 Hors ligne"}
            </Badge>
            <Button 
              onClick={toggleOnlineStatus}
              variant={isOnline ? "outline" : "default"}
            >
              {isOnline ? "Se déconnecter" : "Se connecter"}
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleEmergency}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              SOS
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Courses Aujourd'hui</p>
                <p className="text-2xl font-bold">{stats.todayRides}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Cette Semaine</p>
                <p className="text-2xl font-bold">{stats.weekRides}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Revenus Mois</p>
                <p className="text-2xl font-bold">{stats.monthRevenue.toLocaleString()} GNF</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Note Moyenne</p>
                <p className="text-2xl font-bold">{stats.rating}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{stats.totalRides}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Ride Alert */}
      {currentRide && (
        <Card className="mb-6 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Course en cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium">{currentRide.passenger_name}</p>
                <p className="text-sm text-muted-foreground">{currentRide.passenger_phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Trajet</p>
                <p className="text-sm text-muted-foreground">
                  {currentRide.pickup_location} → {currentRide.destination}
                </p>
              </div>
              <div className="flex gap-2">
                {currentRide.status === 'accepted' && (
                  <Button onClick={startRide} className="flex-1">
                    Démarrer la course
                  </Button>
                )}
                {currentRide.status === 'in_progress' && (
                  <Button onClick={completeRide} className="flex-1">
                    Terminer ({currentRide.estimated_fare.toLocaleString()} GNF)
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => window.open(`tel:${currentRide.passenger_phone}`)}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="rides" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="rides">Demandes de Course</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="rides">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Demandes en Attente</h2>
              <Button variant="outline" onClick={loadTaxiData}>
                Actualiser
              </Button>
            </div>

            {!isOnline && (
              <Card>
                <CardContent className="p-6 text-center">
                  <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Vous êtes hors ligne</p>
                  <p className="text-sm text-muted-foreground">Activez votre statut pour recevoir des demandes de course</p>
                </CardContent>
              </Card>
            )}

            {isOnline && pendingRides.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Timer className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">En attente de demandes</p>
                  <p className="text-sm text-muted-foreground">Les passagers peuvent vous voir et vous contacter</p>
                </CardContent>
              </Card>
            )}

            {pendingRides.map((ride) => (
              <Card key={ride.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      {ride.passenger_name}
                    </CardTitle>
                    <Badge variant="secondary">
                      {ride.payment_method === 'cash' ? '💵 Espèces' : 
                       ride.payment_method === 'mobile_money' ? '📱 Mobile Money' : '💳 Carte'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Demande reçue • {ride.estimated_duration} • {ride.distance}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Départ:</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{ride.pickup_location}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium">Destination:</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">{ride.destination}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-bold text-lg">{ride.estimated_fare.toLocaleString()} GNF</p>
                        <p className="text-sm text-muted-foreground">Tarif estimé</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => window.open(`tel:${ride.passenger_phone}`)}
                      >
                        <Phone className="w-4 h-4 mr-1" />
                        Appeler
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => rejectRide(ride.id)}
                      >
                        Refuser
                      </Button>
                      <Button 
                        onClick={() => acceptRide(ride.id)}
                      >
                        Accepter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle>Navigation GPS</CardTitle>
              <CardDescription>Itinéraires optimisés et trafic en temps réel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Navigation className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Module de navigation intégré</p>
                <Button className="mt-4" variant="outline">
                  Ouvrir Navigation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Paiements</CardTitle>
              <CardDescription>Portefeuille et historique des transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">Solde Disponible</div>
                  <div className="text-2xl font-bold">425,000 GNF</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Retirer
                  </Button>
                  <Button variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Historique
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Chauffeur Taxi Moto</CardTitle>
              <CardDescription>Informations personnelles et véhicule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom Complet</label>
                  <p className="text-muted-foreground">{profile?.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <p className="text-muted-foreground">{profile?.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Permis de Conduire</label>
                  <p className="text-muted-foreground">Catégorie A1 - Valide</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Assurance</label>
                  <p className="text-muted-foreground">Tous risques - Valide</p>
                </div>
              </div>
              <Button variant="outline">Modifier le Profil</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}