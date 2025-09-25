import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Package, 
  MapPin, 
  Calculator, 
  CreditCard, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Loader2,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ShipmentForm {
  // Sender
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderCountry: string;
  senderPostalCode: string;
  senderPhone: string;
  senderEmail: string;
  
  // Recipient
  recipientName: string;
  recipientAddress: string;
  recipientCity: string;
  recipientCountry: string;
  recipientPostalCode: string;
  recipientPhone: string;
  recipientEmail: string;
  
  // Package details
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  
  // Commodity
  commodityType: string;
  commodityDescription: string;
  commodityValue: number;
  commodityCurrency: string;
  isDangerousGoods: boolean;
  isFragile: boolean;
  
  // Service
  serviceType: string;
  transportMode: string;
  
  // Insurance
  insuranceRequired: boolean;
  insuranceValue: number;
  
  // Special instructions
  specialInstructions: string;
}

const initialForm: ShipmentForm = {
  senderName: '',
  senderAddress: '',
  senderCity: '',
  senderCountry: '',
  senderPostalCode: '',
  senderPhone: '',
  senderEmail: '',
  recipientName: '',
  recipientAddress: '',
  recipientCity: '',
  recipientCountry: '',
  recipientPostalCode: '',
  recipientPhone: '',
  recipientEmail: '',
  weightKg: 0,
  lengthCm: 0,
  widthCm: 0,
  heightCm: 0,
  commodityType: '',
  commodityDescription: '',
  commodityValue: 0,
  commodityCurrency: 'USD',
  isDangerousGoods: false,
  isFragile: false,
  serviceType: 'standard',
  transportMode: 'air',
  insuranceRequired: false,
  insuranceValue: 0,
  specialInstructions: ''
};

const countries = [
  'USA', 'Canada', 'UK', 'Germany', 'France', 'Guinea', 'Senegal', 'Mali', 'Burkina Faso',
  'Ghana', 'Nigeria', 'Ivory Coast', 'Morocco', 'Algeria', 'Tunisia', 'Egypt', 'China'
];

const commodityTypes = [
  'Documents', 'Electronics', 'Textiles', 'Food Products', 'Machinery', 
  'Automotive Parts', 'Pharmaceuticals', 'Chemicals', 'General Merchandise'
];

export default function CreateShipmentScreen() {
  const { toast } = useToast();
  const [form, setForm] = useState<ShipmentForm>(initialForm);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [costEstimate, setCostEstimate] = useState<any>(null);
  const [forwarders, setForwarders] = useState<any[]>([]);
  const [selectedForwarder, setSelectedForwarder] = useState<string>('');

  useEffect(() => {
    fetchForwarders();
  }, []);

  const fetchForwarders = async () => {
    try {
      const { data, error } = await supabase
        .from('freight_forwarder_profiles')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true);

      if (error) throw error;
      setForwarders(data || []);
    } catch (error) {
      console.error('Error fetching forwarders:', error);
    }
  };

  const calculateCost = async () => {
    if (!form.weightKg || !form.lengthCm || !form.widthCm || !form.heightCm) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir les dimensions et le poids",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-shipping-price', {
        body: {
          originCountry: form.senderCountry,
          destinationCountry: form.recipientCountry,
          weight: form.weightKg,
          length: form.lengthCm,
          width: form.widthCm,
          height: form.heightCm,
          serviceType: form.serviceType,
          transportMode: form.transportMode,
          commodityValue: form.commodityValue,
          insuranceRequired: form.insuranceRequired
        }
      });

      if (error) throw error;
      setCostEstimate(data);
      setStep(3);
    } catch (error) {
      console.error('Error calculating cost:', error);
      toast({
        title: "Erreur de calcul",
        description: "Impossible de calculer le coût d'expédition",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async () => {
    if (!selectedForwarder) {
      toast({
        title: "Transitaire requis",
        description: "Veuillez sélectionner un transitaire",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-shipment', {
        body: {
          ...form,
          forwarderId: selectedForwarder,
          estimatedCost: costEstimate
        }
      });

      if (error) throw error;

      toast({
        title: "Expédition créée",
        description: `Votre expédition a été créée avec le code de suivi: ${data.trackingCode}`,
        variant: "default"
      });

      // Reset form
      setForm(initialForm);
      setStep(1);
      setCostEstimate(null);
      setSelectedForwarder('');
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Erreur de création",
        description: "Impossible de créer l'expédition",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field: keyof ShipmentForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sender Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Expéditeur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom complet</Label>
              <Input 
                value={form.senderName}
                onChange={(e) => updateForm('senderName', e.target.value)}
                placeholder="Nom de l'expéditeur"
              />
            </div>
            <div>
              <Label>Adresse</Label>
              <Textarea 
                value={form.senderAddress}
                onChange={(e) => updateForm('senderAddress', e.target.value)}
                placeholder="Adresse complète"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Ville</Label>
                <Input 
                  value={form.senderCity}
                  onChange={(e) => updateForm('senderCity', e.target.value)}
                />
              </div>
              <div>
                <Label>Code postal</Label>
                <Input 
                  value={form.senderPostalCode}
                  onChange={(e) => updateForm('senderPostalCode', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Pays</Label>
              <Select onValueChange={(value) => updateForm('senderCountry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le pays" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Téléphone</Label>
                <Input 
                  value={form.senderPhone}
                  onChange={(e) => updateForm('senderPhone', e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={form.senderEmail}
                  onChange={(e) => updateForm('senderEmail', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Destinataire
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom complet</Label>
              <Input 
                value={form.recipientName}
                onChange={(e) => updateForm('recipientName', e.target.value)}
                placeholder="Nom du destinataire"
              />
            </div>
            <div>
              <Label>Adresse</Label>
              <Textarea 
                value={form.recipientAddress}
                onChange={(e) => updateForm('recipientAddress', e.target.value)}
                placeholder="Adresse complète"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Ville</Label>
                <Input 
                  value={form.recipientCity}
                  onChange={(e) => updateForm('recipientCity', e.target.value)}
                />
              </div>
              <div>
                <Label>Code postal</Label>
                <Input 
                  value={form.recipientPostalCode}
                  onChange={(e) => updateForm('recipientPostalCode', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Pays</Label>
              <Select onValueChange={(value) => updateForm('recipientCountry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le pays" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Téléphone</Label>
                <Input 
                  value={form.recipientPhone}
                  onChange={(e) => updateForm('recipientPhone', e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={form.recipientEmail}
                  onChange={(e) => updateForm('recipientEmail', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Button onClick={() => setStep(2)} className="w-full">
        Suivant: Détails du colis
      </Button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Package Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Dimensions et Poids
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Poids (kg)</Label>
              <Input 
                type="number"
                value={form.weightKg}
                onChange={(e) => updateForm('weightKg', parseFloat(e.target.value))}
                placeholder="0.0"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Longueur (cm)</Label>
                <Input 
                  type="number"
                  value={form.lengthCm}
                  onChange={(e) => updateForm('lengthCm', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Largeur (cm)</Label>
                <Input 
                  type="number"
                  value={form.widthCm}
                  onChange={(e) => updateForm('widthCm', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Hauteur (cm)</Label>
                <Input 
                  type="number"
                  value={form.heightCm}
                  onChange={(e) => updateForm('heightCm', parseFloat(e.target.value))}
                />
              </div>
            </div>
            {form.lengthCm && form.widthCm && form.heightCm && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  Volume: {((form.lengthCm * form.widthCm * form.heightCm) / 1000000).toFixed(4)} m³
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commodity Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Marchandise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Type de marchandise</Label>
              <Select onValueChange={(value) => updateForm('commodityType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  {commodityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description détaillée</Label>
              <Textarea 
                value={form.commodityDescription}
                onChange={(e) => updateForm('commodityDescription', e.target.value)}
                placeholder="Description précise du contenu"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Valeur</Label>
                <Input 
                  type="number"
                  value={form.commodityValue}
                  onChange={(e) => updateForm('commodityValue', parseFloat(e.target.value))}
                />
              </div>
              <div>
                <Label>Devise</Label>
                <Select onValueChange={(value) => updateForm('commodityCurrency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="USD" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GNF">GNF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Marchandises dangereuses</Label>
                <Switch 
                  checked={form.isDangerousGoods}
                  onCheckedChange={(checked) => updateForm('isDangerousGoods', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Fragile</Label>
                <Switch 
                  checked={form.isFragile}
                  onCheckedChange={(checked) => updateForm('isFragile', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service et Transport</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Type de service</Label>
              <Select onValueChange={(value) => updateForm('serviceType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Économique</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="express">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mode de transport</Label>
              <Select onValueChange={(value) => updateForm('transportMode', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Aérien" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="air">Aérien</SelectItem>
                  <SelectItem value="sea">Maritime</SelectItem>
                  <SelectItem value="road">Routier</SelectItem>
                  <SelectItem value="multimodal">Multimodal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Assurance requise</Label>
              <Switch 
                checked={form.insuranceRequired}
                onCheckedChange={(checked) => updateForm('insuranceRequired', checked)}
              />
            </div>
            {form.insuranceRequired && (
              <div>
                <Label>Valeur assurée</Label>
                <Input 
                  type="number"
                  value={form.insuranceValue}
                  onChange={(e) => updateForm('insuranceValue', parseFloat(e.target.value))}
                  placeholder="Valeur à assurer"
                />
              </div>
            )}
          </div>

          <div>
            <Label>Instructions spéciales</Label>
            <Textarea 
              value={form.specialInstructions}
              onChange={(e) => updateForm('specialInstructions', e.target.value)}
              placeholder="Instructions particulières pour la livraison"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setStep(1)}>
          Précédent
        </Button>
        <Button onClick={calculateCost} disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calcul en cours...
            </>
          ) : (
            <>
              <Calculator className="w-4 h-4 mr-2" />
              Calculer le coût
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* Cost Estimate */}
      {costEstimate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Estimation des coûts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">Frais de transport</div>
                <div className="text-2xl font-bold">${costEstimate.shippingCost}</div>
              </div>
              {costEstimate.insuranceCost > 0 && (
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Assurance</div>
                  <div className="text-2xl font-bold">${costEstimate.insuranceCost}</div>
                </div>
              )}
              <div className="p-4 border rounded-lg bg-primary text-primary-foreground">
                <div className="text-sm opacity-90">Total estimé</div>
                <div className="text-2xl font-bold">${costEstimate.totalCost}</div>
              </div>
            </div>
            
            {costEstimate.availableCarriers && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Transporteurs disponibles</h4>
                <div className="space-y-2">
                  {costEstimate.availableCarriers.map((carrier: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{carrier.name}</div>
                        <div className="text-sm text-muted-foreground">{carrier.service}</div>
                      </div>
                      <Badge variant="outline">{carrier.estimatedDays} jours</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Forwarder Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Sélection du transitaire
          </CardTitle>
          <CardDescription>
            Choisissez un transitaire pour gérer votre expédition
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {forwarders.map((forwarder) => (
              <div 
                key={forwarder.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedForwarder === forwarder.id 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedForwarder(forwarder.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{forwarder.company_name}</h4>
                    <p className="text-sm text-muted-foreground">{forwarder.city}, {forwarder.country}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {forwarder.transport_types.map((type: string) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedForwarder === forwarder.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setStep(2)}>
          Précédent
        </Button>
        <Button 
          onClick={createShipment} 
          disabled={loading || !selectedForwarder}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Création en cours...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Créer l'expédition
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Créer une expédition internationale</h1>
        <p className="text-muted-foreground">
          Expédiez vos colis à travers le monde en toute sécurité
        </p>
        
        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                1
              </div>
              <span className="text-sm">Adresses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                2
              </div>
              <span className="text-sm">Colis</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                3
              </div>
              <span className="text-sm">Confirmation</span>
            </div>
          </div>
          <Progress value={(step / 3) * 100} className="h-2" />
        </div>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}
