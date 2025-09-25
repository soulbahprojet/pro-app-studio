import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Truck, 
  Car, 
  Bike, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Star,
  Package,
  Navigation,
  Phone,
  FileText,
  Wifi,
  WifiOff,
  Bell,
  User,
  Settings,
  Camera,
  Shield,
  MessageSquare,
  Route,
  Target,
  LogOut
} from 'lucide-react';

interface DeliveryMission {
  id: string;
  type: 'delivery' | 'pickup';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'problem';
  pickup_location: string;
  delivery_location: string;
  amount: number;
  customer_name: string;
  customer_phone: string;
  products: Array<{
    name: string;
    quantity: number;
    description: string;
  }>;
  special_instructions: string;
  priority: 'normal' | 'urgent';
  estimated_time: string;
  created_at: string;
  assigned_at: string;
}

export default function CourierInterface() {
  const { profile, logout } = useAuth();
  const { toast } = useToast();
  const [missions, setMissions] = useState<DeliveryMission[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    completedDeliveries: 0,
    earnings: 0,
    rating: 4.8,
    onTimeDeliveries: 0
  });

  const getVehicleIcon = () => {
    if (profile?.vehicle_type === 'moto') return Bike;
    if (profile?.vehicle_type === 'voiture') return Car;
    return Truck;
  };

  const VehicleIcon = getVehicleIcon();

  useEffect(() => {
    if (profile) {
      loadDeliveryMissions();
      loadDeliveryStats();
    }
  }, [profile]);

  const loadDeliveryMissions = async () => {
    try {
      // Simuler le chargement des missions de livraison
      const mockMissions: DeliveryMission[] = [
        {
          id: '1',
          type: 'delivery',
          status: 'in_progress',
          pickup_location: 'Restaurant Le Palmier, Kaloum',
          delivery_location: 'Bureau SOTELGUI, Hamdallaye',
          amount: 25000,
          customer_name: 'Alpha Diallo',
          customer_phone: '+224 622 123 456',
          products: [
            { name: 'Menu Complet', quantity: 2, description: 'Riz gras + boisson' }
          ],
          special_instructions: 'Appeler avant livraison. Bureau au 3ème étage.',
          priority: 'normal',
          estimated_time: '25 min',
          created_at: new Date().toISOString(),
          assigned_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'pickup',
          status: 'pending',
          pickup_location: 'Pharmacie Centrale, Kaloum',
          delivery_location: 'Résidence Diplomatique, Kipé',
          amount: 15000,
          customer_name: 'Mme Camara',
          customer_phone: '+224 664 789 012',
          products: [
            { name: 'Médicaments', quantity: 1, description: 'Ordonnance urgente' }
          ],
          special_instructions: 'Médicaments urgents - Appeler avant collecte.',
          priority: 'urgent',
          estimated_time: '20 min',
          created_at: new Date().toISOString(),
          assigned_at: new Date().toISOString()
        }
      ];

      setMissions(mockMissions);
      
      // Synchroniser les données si hors ligne
      if (isOfflineMode && navigator.onLine) {
        await syncOfflineData();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
      if (navigator.onLine) {
        toast({
          title: "Erreur de connexion",
          description: "Passage en mode hors ligne",
          variant: "destructive"
        });
        setIsOfflineMode(true);
      }
    }
  };


  const loadDeliveryStats = async () => {
    setStats({
      todayDeliveries: 8,
      completedDeliveries: 342,
      earnings: 185000,
      rating: 4.8,
      onTimeDeliveries: 96
    });
  };

  // Fonction de synchronisation hors ligne
  const syncOfflineData = async () => {
    try {
      // Simuler la synchronisation des données hors ligne
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPendingSync(0);
      setIsOfflineMode(false);
      toast({
        title: "✅ Synchronisation terminée",
        description: "Toutes les données ont été synchronisées",
      });
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
    }
  };

  // Détecter la connexion internet
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineMode(false);
      if (pendingSync > 0) {
        syncOfflineData();
      }
    };
    
    const handleOffline = () => {
      setIsOfflineMode(true);
      toast({
        title: "⚠️ Mode hors ligne",
        description: "Vos actions seront synchronisées à la reconnexion",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [pendingSync]);

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    if (newStatus && notificationsEnabled) {
      // Demander la permission pour les notifications
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
    
    toast({
      title: newStatus ? "En ligne" : "Hors ligne",
      description: newStatus ? "Vous pouvez maintenant recevoir des missions" : "Vous ne recevrez plus de nouvelles missions",
    });
  };

  const acceptMission = (missionId: string) => {
    setMissions(missions.map(m => 
      m.id === missionId ? { ...m, status: 'in_progress' } : m
    ));
    
    // Incrémenter le compteur de synchronisation en mode hors ligne
    if (isOfflineMode) {
      setPendingSync(prev => prev + 1);
    }
    
    // Notification push
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Mission acceptée', {
        body: `Mission ${missionId} acceptée. Rendez-vous au point de collecte.`,
        icon: '/icon-192x192.png'
      });
    }
    
    toast({
      title: "📦 Mission acceptée",
      description: "Rendez-vous au point de collecte",
    });
  };

  const completeMission = (missionId: string) => {
    setMissions(missions.map(m => 
      m.id === missionId ? { ...m, status: 'completed' } : m
    ));
    
    if (isOfflineMode) {
      setPendingSync(prev => prev + 1);
    }
    
    toast({
      title: "🎉 Mission terminée",
      description: "Paiement ajouté à votre portefeuille",
    });
  };

  const reportProblem = (missionId: string) => {
    setMissions(missions.map(m => 
      m.id === missionId ? { ...m, status: 'problem' } : m
    ));
    
    if (isOfflineMode) {
      setPendingSync(prev => prev + 1);
    }
    
    toast({
      title: "⚠️ Problème signalé",
      description: "Le dispatching a été notifié",
      variant: "destructive"
    });
  };

  const handleLogout = async () => {
    await logout();
    // Redirection vers la page d'accueil ou de connexion
    window.location.href = '/';
  };

  const handleEmergency = () => {
    // Envoyer signal SOS avec localisation et notifier le syndicat
    const emergencyData = {
      driverId: profile?.user_id,
      driverName: profile?.full_name,
      vestNumber: (profile as any)?.vest_number,
      location: currentLocation,
      timestamp: new Date().toISOString(),
      type: 'emergency',
      unionType: profile?.union_type
    };
    
    // En mode hors ligne, stocker localement
    if (isOfflineMode) {
      localStorage.setItem('emergency_pending', JSON.stringify(emergencyData));
      setPendingSync(prev => prev + 1);
    }
    
    toast({
      title: "🚨 Alerte d'urgence SOS",
      description: "Signal envoyé au syndicat, dispatching et autorités",
      variant: "destructive"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'accepted': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'picked_up': return <Navigation className="w-4 h-4 text-purple-600" />;
      case 'in_transit': return <Route className="w-4 h-4 text-orange-600" />;
      case 'cancelled': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return '✅ Terminée';
      case 'accepted': return '🏍️ Acceptée';
      case 'picked_up': return '🚶 Client à bord';
      case 'in_transit': return '🛣️ En transit';
      case 'cancelled': return '❌ Annulée';
      default: return '📍 En attente';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header avec mode hors ligne */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <VehicleIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Interface Livreur</h1>
              <p className="text-muted-foreground">
                {profile?.full_name} • {profile?.vehicle_type}
                {isOfflineMode && (
                  <span className="ml-2 flex items-center gap-1 text-orange-600">
                    <WifiOff className="w-4 h-4" />
                    Mode hors ligne
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
            {/* Indicateur de synchronisation */}
            {pendingSync > 0 && (
              <Badge variant="outline" className="text-orange-600">
                <WifiOff className="w-3 h-3 mr-1" />
                {pendingSync} en attente
              </Badge>
            )}
            
            {/* Statut en ligne */}
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "🟢 En ligne" : "🔴 Hors ligne"}
            </Badge>
            
            {/* Commutateur en ligne/hors ligne */}
            <div className="flex items-center gap-2">
              <span className="text-sm">Disponible</span>
              <Switch 
                checked={isOnline} 
                onCheckedChange={toggleOnlineStatus}
              />
            </div>
            
            {/* Notifications */}
            <Button
              variant={notificationsEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              <Bell className="w-4 h-4" />
            </Button>
            
            {/* Bouton de déconnexion */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
            
            {/* Bouton SOS */}
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

      {/* Stats Cards - Conditionnelles selon le mode */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Livraisons Aujourd'hui</p>
                <p className="text-2xl font-bold">{stats.todayDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Livraisons</p>
                <p className="text-2xl font-bold">{stats.completedDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Gains Aujourd'hui</p>
                <p className="text-2xl font-bold">{stats.earnings.toLocaleString()} GNF</p>
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
                <p className="text-2xl font-bold">{stats.rating}⭐</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Synchronisation en cours */}
      {isOfflineMode && pendingSync > 0 && (
        <Card className="mb-6 border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <WifiOff className="w-5 h-5" />
              Mode hors ligne actif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {pendingSync} action(s) en attente de synchronisation
                </p>
                <p className="text-xs text-muted-foreground">
                  Les données seront synchronisées automatiquement à la reconnexion
                </p>
              </div>
              {navigator.onLine && (
                <Button onClick={syncOfflineData} size="sm">
                  <Wifi className="w-4 h-4 mr-2" />
                  Synchroniser maintenant
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="missions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="missions">Courses</TabsTrigger>
          <TabsTrigger value="syndicat">Bureau Syndicat</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="missions">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Courses Disponibles</h2>
              <Button variant="outline" onClick={loadDeliveryMissions}>
                Actualiser
              </Button>
            </div>

            {missions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune mission disponible</p>
                  <p className="text-sm text-muted-foreground">Activez votre statut en ligne pour recevoir des missions</p>
                </CardContent>
              </Card>
            ) : (
              missions.map((mission) => (
                <Card key={mission.id} className={mission.priority === 'urgent' ? 'border-red-500' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Mission #{mission.id}
                        {mission.priority === 'urgent' && (
                          <Badge variant="destructive" className="text-xs">URGENT</Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(mission.status)}
                        <Badge variant={mission.status === 'pending' ? 'secondary' : 
                                      mission.status === 'cancelled' ? 'destructive' : 'default'}>
                          {getStatusLabel(mission.status)}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      {mission.type === 'delivery' ? 'Livraison' : 'Collecte'} • {mission.estimated_time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Collecte:</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">{mission.pickup_location}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium">Destination:</span>
                        </div>
                        <p className="text-sm text-muted-foreground ml-6">{mission.delivery_location}</p>
                      </div>
                    </div>

                    {mission.special_instructions && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Instructions spéciales:</h4>
                        <p className="text-sm text-muted-foreground">{mission.special_instructions}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{mission.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{mission.customer_phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{mission.amount.toLocaleString()} GNF</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open(`tel:${mission.customer_phone}`)}
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Appeler
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {mission.status === 'pending' && (
                        <Button 
                          onClick={() => acceptMission(mission.id)}
                          className="flex-1"
                        >
                          Accepter la mission
                        </Button>
                      )}
                      {mission.status === 'in_progress' && (
                        <>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              toast({
                                title: "🧭 Navigation GPS",
                                description: "Ouverture de la navigation GPS vers la destination",
                              });
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mission.delivery_location)}`);
                            }}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Navigation GPS
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              toast({
                                title: "📷 Photo preuve",
                                description: "Ouverture de l'appareil photo pour preuve",
                              });
                              if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                                navigator.mediaDevices.getUserMedia({ video: true })
                                  .then(() => {
                                    toast({
                                      title: "✅ Appareil photo activé",
                                      description: "Prenez une photo de preuve"
                                    });
                                  })
                                  .catch(() => {
                                    toast({
                                      title: "❌ Erreur appareil photo",
                                      description: "Impossible d'accéder à l'appareil photo",
                                      variant: "destructive"
                                    });
                                  });
                              }
                            }}
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            Photo preuve
                          </Button>
                          <Button 
                            onClick={() => completeMission(mission.id)}
                            className="flex-1"
                          >
                            Terminer
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => reportProblem(mission.id)}
                          >
                            ⚠️ Problème
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="syndicat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Support & Assistance
              </CardTitle>
              <CardDescription>Support technique et assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col"
                  onClick={() => {
                    toast({
                      title: "📞 Support Technique",
                      description: "Connexion avec le support technique"
                    });
                    window.open('tel:+224123456789');
                  }}
                >
                  <Phone className="w-6 h-6 mb-1" />
                  <span className="text-sm">Support Technique</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex flex-col"
                  onClick={handleEmergency}
                >
                  <AlertTriangle className="w-6 h-6 mb-1" />
                  <span className="text-sm">Urgence</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Navigation GPS Intégrée
              </CardTitle>
              <CardDescription>Guidage optimisé pour livraisons avec mode hors ligne</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    className="h-20 flex flex-col"
                    onClick={() => {
                      toast({
                        title: "🧭 Navigation activée",
                        description: "Démarrage de la navigation pour la mission en cours"
                      });
                      // Obtenir la position actuelle et naviguer
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const { latitude, longitude } = position.coords;
                          setCurrentLocation({ lat: latitude, lng: longitude });
                        });
                      }
                    }}
                  >
                    <Navigation className="w-8 h-8 mb-2" />
                    <span>Navigation Active</span>
                    <span className="text-xs text-muted-foreground">Mission en cours</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const { latitude, longitude } = position.coords;
                          setCurrentLocation({ lat: latitude, lng: longitude });
                          toast({
                            title: "📍 Position obtenue",
                            description: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
                          });
                        }, (error) => {
                          toast({
                            title: "❌ Erreur GPS",
                            description: "Impossible d'obtenir votre position",
                            variant: "destructive"
                          });
                        });
                      }
                    }}
                  >
                    <MapPin className="w-8 h-8 mb-2" />
                    <span>Ma Position</span>
                    <span className="text-xs text-muted-foreground">Localisation GPS</span>
                  </Button>
                </div>
                
                {/* Carte GPS simulée */}
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Carte GPS interactive</p>
                    <p className="text-sm text-muted-foreground">
                      {isOfflineMode ? "Mode hors ligne - cartes locales" : "Mode en ligne - trafic temps réel"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages & Communication
              </CardTitle>
              <CardDescription>Communication avec clients et dispatching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col"
                    onClick={() => {
                      toast({
                        title: "💬 Chat Client",
                        description: "Ouverture du chat avec le client"
                      });
                      // Simuler l'ouverture du chat
                    }}
                  >
                    <MessageSquare className="w-6 h-6 mb-1" />
                    <span className="text-sm">Chat Client</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col"
                    onClick={() => {
                      toast({
                        title: "📞 Appel Support",
                        description: "Connexion avec le support technique"
                      });
                      window.open('tel:+224000000000');
                    }}
                  >
                    <Phone className="w-6 h-6 mb-1" />
                    <span className="text-sm">Appel Support</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col"
                    onClick={handleEmergency}
                  >
                    <Shield className="w-6 h-6 mb-1" />
                    <span className="text-sm">Urgence</span>
                  </Button>
                </div>
                
                {/* Messages récents */}
                <div className="space-y-2">
                  <h4 className="font-medium">Messages récents</h4>
                  <div className="space-y-2">
                    {['Mamadou Diallo: "Je suis en bas"', 'Support: "Mission mise à jour"', 'Système: "Nouveau bonus disponible"'].map((msg, i) => (
                      <div key={i} className="p-3 bg-muted/50 rounded text-sm">
                        {msg}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique & Statistiques</CardTitle>
              <CardDescription>Vos performances et missions passées</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Statistiques détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <h4 className="font-medium">Cette Semaine</h4>
                    <p className="text-2xl font-bold text-primary">28</p>
                    <p className="text-sm text-muted-foreground">livraisons</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <h4 className="font-medium">Temps Moyen</h4>
                    <p className="text-2xl font-bold text-green-600">24min</p>
                    <p className="text-sm text-muted-foreground">par livraison</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <h4 className="font-medium">Satisfaction</h4>
                    <p className="text-2xl font-bold text-yellow-600">4.8⭐</p>
                    <p className="text-sm text-muted-foreground">moyenne clients</p>
                  </div>
                </div>
                
                {/* Historique récent */}
                <div>
                  <h4 className="font-medium mb-3">Missions Récentes</h4>
                  <div className="space-y-2">
                    {[
                      { date: "Aujourd'hui 14h30", client: "M. Diallo", status: "✅ Livré", amount: "25,000 GNF" },
                      { date: "Aujourd'hui 12h15", client: "Mme Camara", status: "✅ Livré", amount: "15,000 GNF" },
                      { date: "Hier 16h45", client: "M. Bah", status: "✅ Livré", amount: "30,000 GNF" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{item.client}</p>
                          <p className="text-sm text-muted-foreground">{item.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.amount}</p>
                          <p className="text-sm">{item.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profil Livreur Complet
              </CardTitle>
              <CardDescription>Véhicule, documents et paramètres</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informations personnelles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom Complet</label>
                  <p className="text-muted-foreground">{profile?.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Type de Véhicule</label>
                  <p className="text-muted-foreground flex items-center gap-2">
                    {profile?.vehicle_type}
                    <Badge variant="outline">Vérifié ✓</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <p className="text-muted-foreground">{profile?.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              {/* Documents et vérifications */}
              <div>
                <h4 className="font-medium mb-3">Documents & Vérifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Permis de Conduire</span>
                      <Badge variant="default">✓ Vérifié</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Expiration: 15/12/2025</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Assurance Véhicule</span>
                      <Badge variant="default">✓ Valide</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Tous risques - Active</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Carte Grise</span>
                      <Badge variant="default">✓ Vérifié</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Véhicule immatriculé</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Vérification GPS</span>
                      <Badge variant="default">✓ Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Localisation autorisée</p>
                  </div>
                </div>
              </div>

              {/* Paramètres */}
              <div>
                <h4 className="font-medium mb-3">Paramètres</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Notifications Push</h5>
                      <p className="text-sm text-muted-foreground">Recevoir les nouvelles missions</p>
                    </div>
                    <Switch 
                      checked={notificationsEnabled} 
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Mode Hors Ligne</h5>
                      <p className="text-sm text-muted-foreground">Synchronisation automatique</p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium">Partage de Position</h5>
                      <p className="text-sm text-muted-foreground">GPS temps réel</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "⚙️ Modification Profil",
                      description: "Ouverture des paramètres du profil"
                    });
                    // Redirection vers la page de modification du profil
                    window.location.href = '/profile';
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Modifier Profil
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    toast({
                      title: "📄 Mes Documents",
                      description: "Ouverture de la gestion des documents"
                    });
                    // Simuler l'ouverture des documents
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Mes Documents
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}