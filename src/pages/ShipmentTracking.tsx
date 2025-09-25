import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Search, Package, MapPin, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrackingEntry {
  date: string;
  location: string;
  status: string;
  notes?: string;
}

interface ShipmentData {
  tracking_code: string;
  status: string;
  origin: string;
  destination: string;
  weight: number;
  dimensions: any;
  service_type: string;
  price: number;
  currency: string;
  created_at: string;
  updated_at: string;
  history: TrackingEntry[];
}

const ShipmentTracking = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [shipmentData, setShipmentData] = useState<ShipmentData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchShipment = async () => {
    if (!trackingCode.trim()) {
      toast({
        title: "Code requis",
        description: "Veuillez saisir un code de suivi",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('track-shipment', {
        body: { tracking_code: trackingCode.trim() }
      });

      if (error) throw error;
      
      setShipmentData(data);
      toast({
        title: "Expédition trouvée",
        description: `Statut: ${data.status}`
      });
    } catch (error) {
      console.error('Error tracking shipment:', error);
      toast({
        title: "Expédition non trouvée",
        description: "Aucune expédition correspondant à ce code de suivi",
        variant: "destructive"
      });
      setShipmentData(null);
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Créé':
        return <Package className="h-4 w-4" />;
      case 'En transit':
        return <Truck className="h-4 w-4" />;
      case 'Livré':
        return <CheckCircle className="h-4 w-4" />;
      case 'Annulé':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
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
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Suivi d'Expédition</h1>
        <p className="text-muted-foreground">Suivez votre colis en temps réel</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Rechercher une Expédition
          </CardTitle>
          <CardDescription>
            Entrez votre code de suivi pour obtenir les informations de votre colis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="tracking-code">Code de Suivi</Label>
              <Input
                id="tracking-code"
                placeholder="Ex: TRK-0012345"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchShipment()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchShipment} disabled={isSearching}>
                {isSearching ? "Recherche..." : "Rechercher"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {shipmentData && (
        <div className="space-y-6">
          {/* Résumé de l'expédition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Expédition {shipmentData.tracking_code}
                </div>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(shipmentData.status)} text-white`}
                >
                  {getStatusIcon(shipmentData.status)}
                  <span className="ml-1">{shipmentData.status}</span>
                </Badge>
              </CardTitle>
              <CardDescription>
                Créée le {formatDate(shipmentData.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Origine</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span>{shipmentData.origin}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Destination</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span>{shipmentData.destination}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Service</Label>
                    <div>{shipmentData.service_type}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-muted-foreground">Poids</Label>
                    <div>{shipmentData.weight} kg</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Dimensions</Label>
                    <div>
                      {shipmentData.dimensions.length} x {shipmentData.dimensions.height} x {shipmentData.dimensions.width} cm
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Prix</Label>
                    <div className="font-semibold">{shipmentData.price} {shipmentData.currency}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historique de suivi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historique de Suivi
              </CardTitle>
              <CardDescription>
                Suivez le parcours de votre colis étape par étape
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shipmentData.history.map((entry, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(entry.status)}`}></div>
                      {index < shipmentData.history.length - 1 && (
                        <div className="w-px h-16 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{entry.status}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(entry.date)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{entry.location}</span>
                      </div>
                      
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informations supplémentaires */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Utiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Délais de livraison</h4>
                <p className="text-sm text-blue-700">
                  Les délais peuvent varier selon les conditions météorologiques, 
                  les procédures douanières et les jours fériés.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Support Client</h4>
                <p className="text-sm text-green-700">
                  Pour toute question concernant votre expédition, contactez notre service client 
                  avec votre code de suivi {shipmentData.tracking_code}.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ShipmentTracking;
