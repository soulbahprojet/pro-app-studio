import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Search,
  Filter,
  Download,
  Eye,
  User,
  Package
} from "lucide-react";

const RideHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const rides = [
    {
      id: 'R001',
      type: 'ride',
      client: 'Mamadou Diallo',
      clientRating: 4.8,
      pickup: 'Sandervalia',
      destination: 'Kaloum Center',
      distance: '5.2 km',
      duration: '18 min',
      amount: '25,000',
      tip: '2,000',
      paymentMethod: 'mobile_money',
      status: 'completed',
      rating: 5,
      date: '2024-01-20',
      time: '14:30',
      clientComment: 'Excellent service, très professionnel!'
    },
    {
      id: 'D002',
      type: 'delivery',
      client: 'Fatoumata Camara',
      clientRating: 4.9,
      pickup: 'Restaurant Délice, Ratoma',
      destination: 'Université de Conakry',
      distance: '8.1 km',
      duration: '25 min',
      amount: '35,000',
      tip: '0',
      paymentMethod: 'card',
      status: 'completed',
      rating: 4,
      date: '2024-01-20',
      time: '13:45',
      packageType: 'Nourriture',
      clientComment: 'Livraison rapide, merci!'
    },
    {
      id: 'R003',
      type: 'ride',
      client: 'Alpha Barry',
      clientRating: 4.6,
      pickup: 'Aéroport de Conakry',
      destination: 'Hôtel Novotel',
      distance: '12.3 km',
      duration: '35 min',
      amount: '65,000',
      tip: '5,000',
      paymentMethod: 'cash',
      status: 'completed',
      rating: 5,
      date: '2024-01-20',
      time: '12:30',
      clientComment: 'Parfait, très ponctuel!'
    },
    {
      id: 'R004',
      type: 'ride',
      client: 'Mariama Bah',
      clientRating: 4.7,
      pickup: 'Kipé',
      destination: 'Almamya',
      distance: '6.8 km',
      duration: '22 min',
      amount: '30,000',
      tip: '3,000',
      paymentMethod: 'mobile_money',
      status: 'cancelled',
      rating: 0,
      date: '2024-01-20',
      time: '11:15',
      cancelReason: 'Client introuvable'
    },
    {
      id: 'D005',
      type: 'delivery',
      client: 'Ibrahima Sow',
      clientRating: 4.5,
      pickup: 'Pharmacie Centrale',
      destination: 'Camayenne',
      distance: '4.5 km',
      duration: '15 min',
      amount: '20,000',
      tip: '1,000',
      paymentMethod: 'cash',
      status: 'completed',
      rating: 4,
      date: '2024-01-19',
      time: '16:45',
      packageType: 'Médicaments',
      clientComment: 'Service correct'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-600">Terminée</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulée</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'ride' ? User : Package;
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'mobile_money': return 'Mobile Money';
      case 'card': return 'Carte bancaire';
      case 'cash': return 'Espèces';
      default: return method;
    }
  };

  const filteredRides = rides.filter(ride => {
    const matchesSearch = 
      ride.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ride.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ride.status === filterStatus;
    const matchesType = filterType === 'all' || ride.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalAmount = filteredRides
    .filter(ride => ride.status === 'completed')
    .reduce((sum, ride) => sum + parseInt(ride.amount) + parseInt(ride.tip), 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Courses totales</p>
              <p className="text-2xl font-bold text-primary">{filteredRides.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Terminées</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredRides.filter(r => r.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Revenus totaux</p>
              <p className="text-2xl font-bold text-green-600">{totalAmount.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">GNF</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Note moyenne</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(filteredRides
                  .filter(r => r.rating > 0)
                  .reduce((sum, r) => sum + r.rating, 0) / 
                  filteredRides.filter(r => r.rating > 0).length
                ).toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par client, destination ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                Tous
              </Button>
              <Button
                variant={filterType === 'ride' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('ride')}
              >
                Courses
              </Button>
              <Button
                variant={filterType === 'delivery' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('delivery')}
              >
                Livraisons
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Tous statuts
              </Button>
              <Button
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('completed')}
              >
                Terminées
              </Button>
              <Button
                variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('cancelled')}
              >
                Annulées
              </Button>
            </div>
            
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rides List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des courses ({filteredRides.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRides.map((ride) => {
              const TypeIcon = getTypeIcon(ride.type);
              return (
                <Card key={ride.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <TypeIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{ride.client}</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="text-sm">{ride.clientRating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {ride.type === 'ride' ? 'Course' : 'Livraison'} #{ride.id} • {ride.date} à {ride.time}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ride.status)}
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="text-sm font-medium">Départ:</span>
                          <span className="text-sm">{ride.pickup}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="text-sm font-medium">Arrivée:</span>
                          <span className="text-sm">{ride.destination}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Distance</p>
                          <p className="font-medium">{ride.distance}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Durée</p>
                          <p className="font-medium">{ride.duration}</p>
                        </div>
                      </div>
                    </div>

                    {ride.packageType && (
                      <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                        <span className="font-medium">Type de colis:</span> {ride.packageType}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-sm text-muted-foreground">Montant</p>
                          <p className="font-bold text-green-600">{ride.amount} GNF</p>
                        </div>
                        
                        {ride.tip !== '0' && (
                          <div>
                            <p className="text-sm text-muted-foreground">Pourboire</p>
                            <p className="font-medium text-green-600">+{ride.tip} GNF</p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm text-muted-foreground">Paiement</p>
                          <p className="font-medium">{getPaymentMethodName(ride.paymentMethod)}</p>
                        </div>
                        
                        {ride.status === 'completed' && (
                          <div>
                            <p className="text-sm text-muted-foreground">Évaluation</p>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < ride.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {ride.clientComment && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm italic">"{ride.clientComment}"</p>
                      </div>
                    )}

                    {ride.status === 'cancelled' && ride.cancelReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
                        <p className="text-sm text-red-800">
                          <span className="font-medium">Raison d'annulation:</span> {ride.cancelReason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            
            {filteredRides.length === 0 && (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  Aucune course trouvée
                </p>
                <p className="text-muted-foreground">
                  Modifiez vos critères de recherche pour voir plus de résultats
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideHistory;