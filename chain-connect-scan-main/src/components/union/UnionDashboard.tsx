import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Users, 
  MapPin, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Star,
  Bike,
  Car,
  Phone,
  Mail,
  DollarSign
} from 'lucide-react';

interface UnionMember {
  id: string;
  courier_id: string;
  joined_at: string;
  is_active: boolean;
  profiles: {
    full_name: string;
    phone: string;
    email: string;
    vehicle_type: 'moto' | 'voiture';
    country: string;
  };
}

interface UnionData {
  id: string;
  name: string;
  union_type: 'syndicat_moto' | 'syndicat_voiture';
  country: string;
  member_count: number;
  created_at: string;
  is_active: boolean;
}

export default function UnionDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [unionData, setUnionData] = useState<UnionData | null>(null);
  const [members, setMembers] = useState<UnionMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    totalMissions: 0,
    totalEarnings: 0
  });

  // Déterminer l'icône du syndicat
  const getUnionIcon = () => {
    if (profile?.union_type === 'syndicat_moto') return Bike;
    if (profile?.union_type === 'syndicat_voiture') return Car;
    return Shield;
  };

  const UnionIcon = getUnionIcon();

  // Charger les données du syndicat
  useEffect(() => {
    if (profile?.union_type) {
      loadUnionData();
    }
  }, [profile]);

  const loadUnionData = async () => {
    try {
      setLoading(true);

      // Charger les informations du syndicat
      const { data: unionInfo, error: unionError } = await supabase
        .from('unions')
        .select('*')
        .eq('leader_id', profile?.user_id)
        .eq('is_active', true)
        .single();

      if (unionError || !unionInfo) {
        // Pas de syndicat trouvé, permettre la création
        setUnionData(null);
        setLoading(false);
        return;
      }

      setUnionData(unionInfo);

      // Charger les membres du syndicat
      const { data: membersData, error: membersError } = await supabase
        .from('union_members')
        .select(`
          *,
          profiles!union_members_courier_id_fkey (
            full_name,
            phone,
            email,
            vehicle_type,
            country
          )
        `)
        .eq('union_id', unionInfo.id)
        .eq('is_active', true);

      if (membersError) {
        throw membersError;
      }

      setMembers(membersData || []);

      // Calculer les statistiques
      setStats({
        totalMembers: membersData?.length || 0,
        activeMembers: membersData?.filter(m => m.is_active)?.length || 0,
        totalMissions: 156, // Simulé
        totalEarnings: 2450000 // Simulé
      });

    } catch (error) {
      console.error('Erreur lors du chargement du syndicat:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du syndicat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createUnion = async (unionName: string) => {
    try {
      const { data, error } = await supabase
        .from('unions')
        .insert({
          leader_id: profile?.user_id,
          union_type: profile?.union_type,
          name: unionName,
          country: profile?.country,
          gps_verified: profile?.gps_verified || false
        })
        .select()
        .single();

      if (error) throw error;

      setUnionData(data);
      toast({
        title: "✅ Syndicat créé",
        description: `Le syndicat "${unionName}" a été créé avec succès!`,
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le syndicat",
        variant: "destructive"
      });
    }
  };

  const handleCreateUnion = () => {
    const unionName = prompt('Nom du syndicat:');
    if (unionName && unionName.trim()) {
      createUnion(unionName.trim());
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Si aucun syndicat n'existe
  if (!unionData) {
    return (
      <div className="p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <UnionIcon className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Créer un Bureau Syndicat</CardTitle>
            <CardDescription>
              Créez votre syndicat {profile?.union_type === 'syndicat_moto' ? 'moto' : 'voiture'} 
              pour gérer vos membres et missions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Fonctionnalités incluses:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Gestion des membres livreurs</li>
                <li>• Suivi GPS en temps réel</li>
                <li>• Système d'alerte SOS</li>
                <li>• Statistiques et rapports</li>
                <li>• Chat de groupe</li>
              </ul>
            </div>
            
            <Button onClick={handleCreateUnion} className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Créer mon syndicat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* En-tête du syndicat */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <UnionIcon className="w-8 h-8 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {unionData.name}
                  <Badge variant="outline">
                    {unionData.union_type === 'syndicat_moto' ? '🏍️ Syndicat Moto' : '🚗 Syndicat Voiture'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Chef de syndicat • {unionData.country}
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Alertes SOS
              </Button>
              <Button size="sm">
                <Users className="w-4 h-4 mr-2" />
                Inviter des membres
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Membres</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold">{stats.activeMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
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
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Gains total</p>
                <p className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()} GNF</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des membres */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Membres du syndicat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun membre pour le moment
              </p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-muted">
                        {member.profiles.vehicle_type === 'moto' ? 
                          <Bike className="w-4 h-4" /> : 
                          <Car className="w-4 h-4" />
                        }
                      </div>
                      <div>
                        <h4 className="font-medium">{member.profiles.full_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {member.profiles.vehicle_type === 'moto' ? 'Livreur Moto' : 'Livreur Voiture'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={member.is_active ? 'default' : 'secondary'}>
                      {member.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {member.profiles.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {member.profiles.email}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Voir profil
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Contacter
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Alertes et incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes récentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <span className="font-medium text-orange-800">Alerte SOS</span>
                  <Badge variant="secondary">Il y a 2h</Badge>
                </div>
                <p className="text-sm text-orange-700">
                  Mamadou Diallo a signalé un problème sur la route de Kaloum
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Voir détails
                </Button>
              </div>

              <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Position partagée</span>
                  <Badge variant="secondary">Il y a 5min</Badge>
                </div>
                <p className="text-sm text-blue-700">
                  3 membres actifs dans la zone de Matam
                </p>
              </div>

              <div className="text-center py-4">
                <Button variant="outline" size="sm">
                  Voir toutes les alertes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}