import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Bike, 
  MapPin, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  Users, 
  Star,
  Shield,
  Navigation,
  Phone,
  AlertCircle,
  DollarSign,
  Calendar,
  CheckCircle,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface MotoBikeProfile {
  id: string;
  user_id: string;
  readable_id: string;
  vest_number: number;
  full_name: string;
  phone: string;
  email: string;
  role: string;
  vehicle_type: string;
  union_type: string;
  gps_verified: boolean;
  is_verified: boolean;
  total_missions: number;
  completed_missions: number;
  success_rate: number;
  average_rating: number;
  // These fields might not exist in database yet, so make them optional
  is_active?: boolean;
  balance_gnf?: number;
}

interface MotoStats {
  todayMissions: number;
  weekMissions: number;
  monthRevenue: number;
  pendingPayments: number;
}

export default function MotoDashboard() {
  const { user, profile } = useAuth();
  const [bikeProfile, setBikeProfile] = useState<MotoBikeProfile | null>(null);
  const [stats, setStats] = useState<MotoStats>({
    todayMissions: 0,
    weekMissions: 0,
    monthRevenue: 0,
    pendingPayments: 0
  });
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (user && profile) {
      fetchBikeProfile();
      fetchStats();
      getCurrentLocation();
    }
  }, [user, profile]);

  const fetchBikeProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .eq('role', 'taxi_moto')
        .single();

      if (error) throw error;
      setBikeProfile(data);
    } catch (error) {
      console.error('Error fetching bike profile:', error);
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Mock data for now - in real implementation, fetch from orders/delivery_tracking tables
    setStats({
      todayMissions: 3,
      weekMissions: 18,
      monthRevenue: 450000, // GNF
      pendingPayments: 2
    });
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus);
      
      // Update GPS tracking if going online
      if (newStatus && currentLocation) {
        await supabase.from('gps_tracking').insert({
          user_id: user?.id,
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          is_active: true
        });
      }
      
      toast.success(newStatus ? 'Vous êtes maintenant en ligne' : 'Vous êtes maintenant hors ligne');
    } catch (error) {
      console.error('Error updating online status:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!bikeProfile) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Profil de moto taxi non trouvé. Veuillez contacter le support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Moto Taxi</h1>
          <p className="text-muted-foreground">
            Bienvenue {bikeProfile.full_name} - ID: {bikeProfile.readable_id}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={isOnline ? "default" : "secondary"} className="px-3 py-1">
            {isOnline ? "🟢 En ligne" : "🔴 Hors ligne"}
          </Badge>
          <Button 
            onClick={toggleOnlineStatus}
            variant={isOnline ? "destructive" : "default"}
          >
            {isOnline ? "Se déconnecter" : "Se connecter"}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missions Aujourd'hui</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayMissions}</div>
            <p className="text-xs text-muted-foreground">Courses effectuées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette Semaine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weekMissions}</div>
            <p className="text-xs text-muted-foreground">Missions complétées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du Mois</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthRevenue.toLocaleString()} GNF</div>
            <p className="text-xs text-muted-foreground">Gains ce mois</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bikeProfile.average_rating?.toFixed(1) || '5.0'}</div>
            <p className="text-xs text-muted-foreground">Sur 5 étoiles</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="wallet">Portefeuille</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Driver Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bike className="h-5 w-5" />
                  <span>Informations Motard</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Numéro de Veste:</span>
                  <Badge variant="outline">{bikeProfile.vest_number}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Type de Véhicule:</span>
                  <span className="font-medium">{bikeProfile.vehicle_type || 'Moto'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Type de Syndicat:</span>
                  <span className="font-medium">{bikeProfile.union_type || 'Individuel'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Statut de Vérification:</span>
                  <Badge variant={bikeProfile.is_verified ? "default" : "secondary"}>
                    {bikeProfile.is_verified ? "Vérifié" : "En attente"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>GPS Vérifié:</span>
                  <Badge variant={bikeProfile.gps_verified ? "default" : "secondary"}>
                    {bikeProfile.gps_verified ? "✓ Vérifié" : "En attente"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Performances</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Missions Totales:</span>
                  <span className="font-medium">{bikeProfile.total_missions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Missions Complétées:</span>
                  <span className="font-medium">{bikeProfile.completed_missions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taux de Réussite:</span>
                  <Badge variant={bikeProfile.success_rate >= 90 ? "default" : "secondary"}>
                    {bikeProfile.success_rate?.toFixed(1) || '100'}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Note Moyenne:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{bikeProfile.average_rating?.toFixed(1) || '5.0'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Navigation className="h-6 w-6" />
                  <span className="text-sm">Navigation</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Phone className="h-6 w-6" />
                  <span className="text-sm">Urgence</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Syndicat</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col space-y-2">
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Support</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Missions</CardTitle>
              <CardDescription>Vos courses récentes et à venir</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune mission disponible pour le moment</p>
                <Button className="mt-4">Rechercher des Missions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Portefeuille</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground">Solde Actuel</div>
                <div className="text-2xl font-bold">{bikeProfile.balance_gnf?.toLocaleString() || '0'} GNF</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Button>Retirer</Button>
                <Button variant="outline">Historique</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Motard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nom Complet</label>
                  <p className="text-sm text-muted-foreground">{bikeProfile.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Téléphone</label>
                  <p className="text-sm text-muted-foreground">{bikeProfile.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">ID Lisible</label>
                  <p className="text-sm text-muted-foreground">{bikeProfile.readable_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Numéro de Veste</label>
                  <p className="text-sm text-muted-foreground">{bikeProfile.vest_number}</p>
                </div>
              </div>
              <Button>Modifier le Profil</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Paramètres</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifications Push</h4>
                    <p className="text-sm text-muted-foreground">Recevoir des notifications pour les nouvelles missions</p>
                  </div>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Localisation GPS</h4>
                    <p className="text-sm text-muted-foreground">Partager votre position en temps réel</p>
                  </div>
                  <Button variant="outline" size="sm">Gérer</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Mode Hors ligne</h4>
                    <p className="text-sm text-muted-foreground">Fonctionnement sans connexion internet</p>
                  </div>
                  <Button variant="outline" size="sm">Activer</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
