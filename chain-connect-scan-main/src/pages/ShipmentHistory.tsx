import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Eye, Search, Filter, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Shipment {
  id: string;
  tracking_code: string;
  origin: string;
  destination: string;
  weight: number;
  service_type: string;
  status: string;
  price: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

const ShipmentHistory = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadShipments();
    }
  }, [user]);

  useEffect(() => {
    filterShipments();
  }, [searchTerm, statusFilter, shipments]);

  const loadShipments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setShipments(data || []);
    } catch (error) {
      console.error('Error loading shipments:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des expéditions",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterShipments = () => {
    let filtered = shipments;

    if (searchTerm) {
      filtered = filtered.filter(shipment =>
        shipment.tracking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(shipment => shipment.status === statusFilter);
    }

    setFilteredShipments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Créé':
        return 'bg-blue-500';
      case 'En transit':
        return 'bg-yellow-500';
      case 'Livré':
        return 'bg-green-500';
      case 'Annulé':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewTracking = (trackingCode: string) => {
    // Navigate to tracking page with prefilled tracking code
    window.location.href = `/shipping-tracking?code=${trackingCode}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Historique des Expéditions</h1>
        <p className="text-muted-foreground">Consultez toutes vos expéditions passées et actuelles</p>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par code de suivi, origine ou destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="Créé">Créé</SelectItem>
                <SelectItem value="En transit">En transit</SelectItem>
                <SelectItem value="Livré">Livré</SelectItem>
                <SelectItem value="Annulé">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des expéditions */}
      {filteredShipments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune expédition trouvée</h3>
            <p className="text-muted-foreground mb-4">
              {shipments.length === 0 
                ? "Vous n'avez pas encore créé d'expédition" 
                : "Aucune expédition ne correspond à vos critères de recherche"}
            </p>
            <Button onClick={() => window.location.href = '/new-shipment'}>
              Créer une nouvelle expédition
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredShipments.map((shipment) => (
            <Card key={shipment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{shipment.tracking_code}</h3>
                        <p className="text-sm text-muted-foreground">
                          Créé le {formatDate(shipment.created_at)}
                        </p>
                      </div>
                      
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(shipment.status)} text-white`}
                      >
                        {shipment.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">De:</span>
                        <div className="font-medium">{shipment.origin}</div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Vers:</span>
                        <div className="font-medium">{shipment.destination}</div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Service:</span>
                        <div className="font-medium">{shipment.service_type}</div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Prix:</span>
                        <div className="font-medium">{shipment.price} {shipment.currency}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <Button
                      size="sm"
                      onClick={() => handleViewTracking(shipment.tracking_code)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Suivre
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistiques */}
      {shipments.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{shipments.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {shipments.filter(s => s.status === 'En transit').length}
              </div>
              <div className="text-sm text-muted-foreground">En transit</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {shipments.filter(s => s.status === 'Livré').length}
              </div>
              <div className="text-sm text-muted-foreground">Livrées</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {shipments.filter(s => s.status === 'Annulé').length}
              </div>
              <div className="text-sm text-muted-foreground">Annulées</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ShipmentHistory;