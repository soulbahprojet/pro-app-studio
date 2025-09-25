import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Package, Calculator, CreditCard, Truck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Dimensions {
  length: number;
  height: number;
  width: number;
}

interface PriceCalculation {
  price: number;
  currency: string;
  breakdown: any;
  estimated_delivery: string;
}

const NewShipment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Check if user should access advanced freight features
  const isFreightUser = user?.role === 'admin' || user?.role === 'transitaire' || user?.role === 'courier';
  
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    weight: 0,
    dimensions: { length: 0, height: 0, width: 0 } as Dimensions,
    service_type: '',
    notes: ''
  });
  
  const [priceCalculation, setPriceCalculation] = useState<PriceCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const calculatePrice = async () => {
    if (!formData.weight || !formData.dimensions.length || !formData.dimensions.height || !formData.dimensions.width || !formData.service_type || !formData.destination) {
      toast({
        title: "Champs manquants",
        description: "Veuillez remplir tous les champs requis pour calculer le prix",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-shipping-price', {
        body: {
          weight: formData.weight,
          dimensions: formData.dimensions,
          service_type: formData.service_type,
          destination: formData.destination
        }
      });

      if (error) throw error;
      
      setPriceCalculation(data);
      toast({
        title: "Prix calculé",
        description: `Coût estimé: ${data.price} ${data.currency}`
      });
    } catch (error) {
      console.error('Error calculating price:', error);
      toast({
        title: "Erreur",
        description: "Impossible de calculer le prix. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const createShipment = async () => {
    if (!priceCalculation) {
      toast({
        title: "Prix non calculé",
        description: "Veuillez d'abord calculer le prix avant de créer l'expédition",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-shipment', {
        body: {
          origin: formData.origin,
          destination: formData.destination,
          weight: formData.weight,
          dimensions: formData.dimensions,
          service_type: formData.service_type
        }
      });

      if (error) throw error;

      toast({
        title: "Expédition créée!",
        description: `Code de suivi: ${data.tracking_code}`
      });

      // Reset form
      setFormData({
        origin: '',
        destination: '',
        weight: 0,
        dimensions: { length: 0, height: 0, width: 0 },
        service_type: '',
        notes: ''
      });
      setPriceCalculation(null);
      
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'expédition. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Advanced Module Notice for Freight Users */}
      {isFreightUser && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">Module Transitaire International Disponible</h2>
              <p className="text-blue-100">
                Accédez au tableau de bord complet avec gestion multi-entrepôts, équipes, scanner QR et bien plus.
              </p>
            </div>
            <div className="space-y-2">
              <Link to="/freight-dashboard">
                <Button variant="secondary" size="sm" className="w-full">
                  <Truck className="h-4 w-4 mr-2" />
                  Tableau de Bord Pro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Nouvelle Expédition</h1>
        <p className="text-muted-foreground">
          {isFreightUser ? 'Expédition rapide - Pour le module complet, utilisez le Tableau de Bord Pro' : 'Créez une nouvelle expédition internationale'}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Formulaire */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Détails du Colis
              </CardTitle>
              <CardDescription>
                Informations sur l'origine et la destination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="origin">Adresse de départ *</Label>
                <Input
                  id="origin"
                  placeholder="Ex: Conakry, Guinée"
                  value={formData.origin}
                  onChange={(e) => setFormData({...formData, origin: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  placeholder="Ex: New York, USA"
                  value={formData.destination}
                  onChange={(e) => setFormData({...formData, destination: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dimensions et Poids</CardTitle>
              <CardDescription>
                Spécifiez les dimensions en centimètres et le poids en kilogrammes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="weight">Poids (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1000"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="length">Longueur (cm) *</Label>
                  <Input
                    id="length"
                    type="number"
                    min="1"
                    value={formData.dimensions.length || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dimensions: {...formData.dimensions, length: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="height">Hauteur (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    min="1"
                    value={formData.dimensions.height || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dimensions: {...formData.dimensions, height: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="width">Largeur (cm) *</Label>
                  <Input
                    id="width"
                    type="number"
                    min="1"
                    value={formData.dimensions.width || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      dimensions: {...formData.dimensions, width: parseInt(e.target.value) || 0}
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Type de Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={formData.service_type} 
                onValueChange={(value) => setFormData({...formData, service_type: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard">Standard (7-14 jours)</SelectItem>
                  <SelectItem value="Express">Express (3-5 jours)</SelectItem>
                  <SelectItem value="Priority">Priority (1-3 jours)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button 
              onClick={calculatePrice} 
              disabled={isCalculating}
              variant="outline"
              className="flex-1"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isCalculating ? "Calcul..." : "Calculer le Prix"}
            </Button>
          </div>
        </div>

        {/* Résumé et Prix */}
        <div className="space-y-6">
          {priceCalculation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Estimation de Prix
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-3xl font-bold text-primary">
                    {priceCalculation.price} {priceCalculation.currency}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Livraison estimée: {priceCalculation.estimated_delivery}
                  </div>
                </div>
                
                {priceCalculation.breakdown && (
                  <div className="space-y-2 text-sm">
                    <Separator />
                    <div className="flex justify-between">
                      <span>Prix de base:</span>
                      <span>{priceCalculation.breakdown.base_price} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais de poids:</span>
                      <span>{priceCalculation.breakdown.weight_fee.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais volumétriques:</span>
                      <span>{priceCalculation.breakdown.volume_fee.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multiplicateur service:</span>
                      <span>x{priceCalculation.breakdown.service_multiplier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Multiplicateur pays:</span>
                      <span>x{priceCalculation.breakdown.country_multiplier}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Résumé de l'Expédition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">De:</span>
                <span>{formData.origin || "Non spécifié"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vers:</span>
                <span>{formData.destination || "Non spécifié"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Poids:</span>
                <span>{formData.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions:</span>
                <span>{formData.dimensions.length}x{formData.dimensions.height}x{formData.dimensions.width} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span>{formData.service_type || "Non sélectionné"}</span>
              </div>
            </CardContent>
          </Card>

          {priceCalculation && (
            <Button 
              onClick={createShipment} 
              disabled={isCreating}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isCreating ? "Création..." : `Créer l'Expédition - ${priceCalculation.price} ${priceCalculation.currency}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewShipment;