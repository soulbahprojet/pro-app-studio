import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  ShoppingCart,
  Star,
  Edit,
  Eye,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VendorClientsProps {
  userProfile: any;
}

export const VendorClients: React.FC<VendorClientsProps> = ({ userProfile }) => {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [prospects, setProspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'prospect',
    segment: 'regular',
    notes: ''
  });

  useEffect(() => {
    loadClientsData();
  }, [userProfile]);

  const loadClientsData = async () => {
    try {
      setLoading(true);
      
      // Charger les clients existants (ceux qui ont commandé)
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:customer_id (*)
        `)
        .eq('seller_id', userProfile.user_id);

      // Extraire les clients uniques
      const uniqueClients = orders?.reduce((acc: any[], order: any) => {
        if (order.profiles && !acc.find(c => c.user_id === order.profiles.user_id)) {
          acc.push({
            ...order.profiles,
            orders_count: orders.filter(o => o.customer_id === order.profiles.user_id).length,
            total_spent: orders
              .filter(o => o.customer_id === order.profiles.user_id)
              .reduce((sum, o) => sum + (o.total_amount || 0), 0),
            last_order: new Date(Math.max(...orders
              .filter(o => o.customer_id === order.profiles.user_id)
              .map(o => new Date(o.created_at).getTime())
            )),
            segment: 'regular', // À calculer selon le montant
            type: 'client'
          });
        }
        return acc;
      }, []) || [];

      setClients(uniqueClients);

      // Prospects fictifs pour la démo
      setProspects([
        {
          id: 1,
          name: 'Jean Dupont',
          email: 'jean.dupont@email.com',
          phone: '+224 123 456 789',
          address: 'Conakry, Guinée',
          segment: 'premium',
          type: 'prospect',
          created_at: new Date(),
          notes: 'Intéressé par nos produits premium'
        },
        {
          id: 2,
          name: 'Marie Camara',
          email: 'marie.camara@email.com',
          phone: '+224 987 654 321',
          address: 'Kankan, Guinée',
          segment: 'regular',
          type: 'prospect',
          created_at: new Date(),
          notes: 'Contact via réseaux sociaux'
        }
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données clients",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async () => {
    try {
      // Ici vous pourriez créer une table prospects ou utiliser une table existante
      // Pour la démo, on ajoute juste localement
      const newProspect = {
        ...newClient,
        id: Date.now(),
        created_at: new Date()
      };

      if (newClient.type === 'prospect') {
        setProspects([newProspect, ...prospects]);
      }

      toast({
        title: "Succès",
        description: `${newClient.type === 'prospect' ? 'Prospect' : 'Client'} ajouté avec succès`,
      });

      setIsAddingClient(false);
      setNewClient({
        name: '',
        email: '',
        phone: '',
        address: '',
        type: 'prospect',
        segment: 'regular',
        notes: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le prospect",
        variant: "destructive"
      });
    }
  };

  const getSegmentBadge = (segment: string) => {
    const variants: any = {
      premium: 'default',
      regular: 'secondary',
      vip: 'destructive'
    };
    
    const labels: any = {
      premium: 'Premium',
      regular: 'Régulier',
      vip: 'VIP'
    };

    return <Badge variant={variants[segment]}>{labels[segment]}</Badge>;
  };

  const filteredClients = clients.filter(client => 
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProspects = prospects.filter(prospect => 
    prospect.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prospect.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Clients actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prospects</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prospects.length}</div>
            <p className="text-xs text-muted-foreground">
              En cours de conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur moyenne</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.length > 0 ? 
                Math.round(clients.reduce((sum, c) => sum + c.total_spent, 0) / clients.length).toLocaleString() 
                : 0
              } GNF
            </div>
            <p className="text-xs text-muted-foreground">
              Par client
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {prospects.length > 0 ? 
                Math.round((clients.length / (clients.length + prospects.length)) * 100) 
                : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              Prospects → Clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barre d'outils */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestion Clients & Prospects</CardTitle>
              <CardDescription>
                Gérez vos relations clients et prospects
              </CardDescription>
            </div>
            <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter un prospect
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau prospect</DialogTitle>
                  <DialogDescription>
                    Créez une fiche pour un nouveau prospect ou client
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nom</Label>
                    <Input
                      id="name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Téléphone</Label>
                    <Input
                      id="phone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="segment" className="text-right">Segment</Label>
                    <Select value={newClient.segment} onValueChange={(value) => setNewClient({...newClient, segment: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Régulier</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newClient.notes}
                      onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddingClient(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddClient}>
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par segment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les segments</SelectItem>
                <SelectItem value="regular">Régulier</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Clients / Prospects */}
      <Tabs defaultValue="clients" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clients">Clients ({clients.length})</TabsTrigger>
          <TabsTrigger value="prospects">Prospects ({prospects.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.user_id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{client.full_name}</h3>
                        {getSegmentBadge(client.segment)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {client.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          {client.orders_count} commandes
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          {client.total_spent?.toLocaleString()} GNF dépensés
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredClients.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun client trouvé</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Aucun client ne correspond à votre recherche.' : 'Vous n\'avez pas encore de clients.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="prospects" className="space-y-4">
          <div className="grid gap-4">
            {filteredProspects.map((prospect) => (
              <Card key={prospect.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{prospect.name}</h3>
                        {getSegmentBadge(prospect.segment)}
                        <Badge variant="outline">Prospect</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {prospect.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {prospect.phone}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {prospect.address}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Ajouté le {new Date(prospect.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {prospect.notes && (
                        <p className="text-sm text-muted-foreground italic">
                          Notes: {prospect.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button size="sm">
                        Convertir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProspects.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun prospect trouvé</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Aucun prospect ne correspond à votre recherche.' : 'Commencez par ajouter vos premiers prospects.'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
