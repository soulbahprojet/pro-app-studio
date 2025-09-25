import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TicketManager from './TicketManager';
import BadgeDisplay from './BadgeDisplay';
import IDTransferManager from './IDTransferManager';
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
  Shield,
  Users,
  Package,
  FileText,
  Award,
  ArrowRightLeft,
  Building2
} from 'lucide-react';

interface Mission {
  id: string;
  type: string;
  status: string;
  pickup_location: string;
  delivery_location: string;
  amount: number;
  created_at: string;
}

interface UnionInfo {
  id: string;
  name: string;
  union_type: 'syndicat_moto' | 'syndicat_voiture';
  member_count: number;
  leader_name: string;
}

export default function CourierDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [unionInfo, setUnionInfo] = useState<UnionInfo | null>(null);
  const [stats, setStats] = useState({
    totalMissions: 0,
    completedMissions: 0,
    earnings: 0,
    rating: 4.8
  });

  // Déterminer l'icône du véhicule
  const getVehicleIcon = () => {
    if (profile?.vehicle_type === 'moto') return Bike;
    if (profile?.vehicle_type === 'voiture') return Car;
    return Truck;
  };

  const VehicleIcon = getVehicleIcon();

  // Charger les données du livreur
  useEffect(() => {
    if (profile) {
      loadCourierData();
      loadUnionInfo();
    }
  }, [profile]);

  const loadCourierData = async () => {
    try {
      // Charger les missions (simulation)
      const mockMissions: Mission[] = [
        {
          id: '1',
          type: 'delivery',
          status: 'in_progress',
          pickup_location: 'Kaloum, Conakry',
          delivery_location: 'Matam, Conakry',
          amount: 25000,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'delivery',
          status: 'completed',
          pickup_location: 'Ratoma, Conakry',
          delivery_location: 'Dixinn, Conakry',
          amount: 15000,
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ];

      setMissions(mockMissions);
      setStats({
        totalMissions: 24,
        completedMissions: 22,
        earnings: 450000,
        rating: 4.8
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const loadUnionInfo = async () => {
    try {
      const { data: membershipData } = await supabase
        .from('union_members')
        .select(`
          unions (
            id,
            name,
            union_type,
            member_count,
            profiles!unions_leader_id_fkey (
              full_name
            )
          )
        `)
        .eq('courier_id', profile?.user_id)
        .eq('is_active', true)
        .single();

      if (membershipData?.unions) {
        const unionData = membershipData.unions;
        setUnionInfo({
          id: unionData.id,
          name: unionData.name,
          union_type: unionData.union_type,
          member_count: unionData.member_count,
          leader_name: unionData.profiles?.full_name || 'Non défini'
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement du syndicat:', error);
    }
  };

  const handleSOSAlert = async () => {
    try {
      // Créer une notification d'urgence
      const { error } = await supabase.functions.invoke('notifications', {
        body: {
          userId: profile?.user_id,
          type: 'emergency',
          title: '🚨 ALERTE SOS',
          message: `Alerte SOS déclenchée par ${profile?.full_name}`,
          data: {
            courierName: profile?.full_name,
            vehicleType: profile?.vehicle_type,
            location: 'Position GPS en cours...',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (!error) {
        toast({
          title: "🚨 Alerte SOS envoyée",
          description: "Votre signal de détresse a été transmis au syndicat et aux autorités.",
          variant: "destructive"
        });
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Erreur SOS:', error);
      toast({
        title: "❌ Erreur SOS",
        description: "Impossible d'envoyer l'alerte. Contactez directement les secours.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête du profil */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <VehicleIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {profile?.full_name}
                  <Badge variant="outline">
                    {profile?.vehicle_type === 'moto' ? '🏍️ Moto' : '🚗 Voiture'}
                  </Badge>
                  {(profile as any)?.vest_number && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Gilet #{(profile as any).vest_number}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {profile?.vehicle_type === 'moto' ? 'Livreur Moto' : 'Livreur Voiture'} • {(profile as any)?.city}, {profile?.country}
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleSOSAlert}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              SOS
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Missions</p>
                <p className="text-2xl font-bold">{stats.totalMissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Complétées</p>
                <p className="text-2xl font-bold">{stats.completedMissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Gains</p>
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
                <p className="text-sm text-muted-foreground">Note</p>
                <p className="text-2xl font-bold">{stats.rating}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets pour les fonctionnalités avancées */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Aperçu
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Transfert ID
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Missions en cours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Missions en cours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {missions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Aucune mission en cours
                  </p>
                ) : (
                  missions.map((mission) => (
                    <div key={mission.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={mission.status === 'in_progress' ? 'default' : 'secondary'}>
                          {mission.status === 'in_progress' ? 'En cours' : 'Terminée'}
                        </Badge>
                        <span className="font-medium">{mission.amount.toLocaleString()} GNF</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-green-600" />
                          <span>Collecte: {mission.pickup_location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-red-600" />
                          <span>Livraison: {mission.delivery_location}</span>
                        </div>
                      </div>
                      {mission.status === 'in_progress' && (
                        <Button size="sm" className="w-full">
                          Voir les détails
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Syndicat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Mon Syndicat
                </CardTitle>
              </CardHeader>
              <CardContent>
                {unionInfo ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium">{unionInfo.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {unionInfo.union_type === 'syndicat_moto' ? '🏍️ Syndicat Moto' : '🚗 Syndicat Voiture'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Chef de syndicat:</span>
                        <span className="text-sm font-medium">{unionInfo.leader_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Membres:</span>
                        <span className="text-sm font-medium flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {unionInfo.member_count}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          console.log('Navigating to messages...');
                          window.location.href = '/messages';
                        }}
                      >
                        Chat Syndicat
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toast({
                          title: "Membres du syndicat",
                          description: `${unionInfo.member_count} membres actifs dans ${unionInfo.name}`,
                        })}
                      >
                        Voir Membres
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-4">
                    <p className="text-muted-foreground">
                      Vous n'êtes membre d'aucun syndicat
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast({
                        title: "Rejoindre un syndicat",
                        description: "Contactez l'administration pour rejoindre un syndicat.",
                      })}
                    >
                      Rejoindre un syndicat
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets">
          <TicketManager />
        </TabsContent>

        <TabsContent value="badges">
          <BadgeDisplay />
        </TabsContent>

        <TabsContent value="transfer">
          <IDTransferManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}