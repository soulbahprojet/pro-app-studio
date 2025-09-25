import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Car, Bike, Truck, Upload, MapPin, Shield, CheckCircle, FileText } from "lucide-react";
import { useToast } from "../ui/use-toast";

interface DriverOnboardingProps {
  onComplete: (driverData: any) => void;
}

const DriverOnboarding: React.FC<DriverOnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1: Informations personnelles
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    
    // Étape 2: Type de véhicule
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    vehicleColor: '',
    
    // Étape 3: Documents
    driverLicense: null,
    vehicleInsurance: null,
    identityDocument: null,
    vehicleRegistration: null,
    
    // Étape 4: Vérifications
    emergencyContact: '',
    emergencyPhone: '',
    hasExperience: false,
    experienceYears: 0
  });

  const { toast } = useToast();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const vehicleTypes = [
    { id: 'moto', label: 'Moto', icon: Bike, color: 'bg-blue-500' },
    { id: 'scooter', label: 'Scooter', icon: Bike, color: 'bg-green-500' },
    { id: 'tricycle', label: 'Tricycle', icon: Truck, color: 'bg-yellow-500' },
    { id: 'taxi', label: 'Taxi', icon: Car, color: 'bg-purple-500' },
    { id: 'pickup', label: 'Pick-up', icon: Truck, color: 'bg-red-500' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: string, file: File) => {
    handleInputChange(field, file);
    toast({
      title: "Document uploadé",
      description: `${file.name} a été uploadé avec succès.`,
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone && formData.city);
      case 2:
        return !!(formData.vehicleType && formData.vehicleBrand && formData.vehicleModel && formData.licensePlate);
      case 3:
        return !!(formData.driverLicense && formData.vehicleInsurance && formData.identityDocument);
      case 4:
        return !!(formData.emergencyContact && formData.emergencyPhone);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(4)) {
      toast({
        title: "Inscription réussie!",
        description: "Bienvenue dans notre plateforme de livraison.",
      });
      onComplete(formData);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Informations personnelles</h3>
              <p className="text-muted-foreground">Renseignez vos informations de base</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+224 123 456 789"
                />
              </div>
              <div>
                <Label htmlFor="city">Ville d'activité *</Label>
                <Select onValueChange={(value) => handleInputChange('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre ville" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50 max-h-[300px] overflow-y-auto">
                    {/* Région de Conakry */}
                    <SelectItem value="conakry">Conakry (Capitale)</SelectItem>
                    <SelectItem value="kaloum">Kaloum</SelectItem>
                    <SelectItem value="dixinn">Dixinn</SelectItem>
                    <SelectItem value="matam">Matam</SelectItem>
                    <SelectItem value="ratoma">Ratoma</SelectItem>
                    <SelectItem value="matoto">Matoto</SelectItem>
                    
                    {/* Région de Kindia */}
                    <SelectItem value="kindia">Kindia</SelectItem>
                    <SelectItem value="coyah">Coyah</SelectItem>
                    <SelectItem value="forecariah">Forécariah</SelectItem>
                    <SelectItem value="fria">Fria</SelectItem>
                    <SelectItem value="telimele">Télimélé</SelectItem>
                    <SelectItem value="dubreka">Dubréka</SelectItem>
                    <SelectItem value="boffa">Boffa</SelectItem>
                    
                    {/* Région de Boké */}
                    <SelectItem value="boke">Boké</SelectItem>
                    <SelectItem value="fria-boke">Fria (Boké)</SelectItem>
                    <SelectItem value="gaoual">Gaoual</SelectItem>
                    <SelectItem value="koundara">Koundara</SelectItem>
                    <SelectItem value="kamsar">Kamsar</SelectItem>
                    <SelectItem value="sangaredi">Sangarédi</SelectItem>
                    
                    {/* Région de Labé */}
                    <SelectItem value="labe">Labé</SelectItem>
                    <SelectItem value="koubia">Koubia</SelectItem>
                    <SelectItem value="lelouma">Lélouma</SelectItem>
                    <SelectItem value="mali">Mali</SelectItem>
                    <SelectItem value="tougue">Tougué</SelectItem>
                    <SelectItem value="dalaba">Dalaba</SelectItem>
                    <SelectItem value="pita">Pita</SelectItem>
                    <SelectItem value="mamou">Mamou</SelectItem>
                    
                    {/* Région de Faranah */}
                    <SelectItem value="faranah">Faranah</SelectItem>
                    <SelectItem value="dabola">Dabola</SelectItem>
                    <SelectItem value="dinguiraye">Dinguiraye</SelectItem>
                    <SelectItem value="kissidougou">Kissidougou</SelectItem>
                    
                    {/* Région de Kankan */}
                    <SelectItem value="kankan">Kankan</SelectItem>
                    <SelectItem value="kerouane">Kérouané</SelectItem>
                    <SelectItem value="kouroussa">Kouroussa</SelectItem>
                    <SelectItem value="mandiana">Mandiana</SelectItem>
                    <SelectItem value="siguiri">Siguiri</SelectItem>
                    <SelectItem value="bamako">Bamako</SelectItem>
                    
                    {/* Région de Nzérékoré */}
                    <SelectItem value="nzerekore">Nzérékoré</SelectItem>
                    <SelectItem value="beyla">Beyla</SelectItem>
                    <SelectItem value="gueckedou">Gueckédou</SelectItem>
                    <SelectItem value="lola">Lola</SelectItem>
                    <SelectItem value="macenta">Macenta</SelectItem>
                    <SelectItem value="yomou">Yomou</SelectItem>
                    
                    {/* Région de Boké (suite) */}
                    <SelectItem value="bofa">Boffa</SelectItem>
                    
                    {/* Autres villes importantes */}
                    <SelectItem value="kambia">Kambia</SelectItem>
                    <SelectItem value="pamelap">Pamelap</SelectItem>
                    <SelectItem value="wonkifong">Wonkifong</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="address">Adresse complète</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Votre adresse complète"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Car className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Type de véhicule</h3>
              <p className="text-muted-foreground">Choisissez votre moyen de transport</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {vehicleTypes.map((vehicle) => {
                const Icon = vehicle.icon;
                const isSelected = formData.vehicleType === vehicle.id;
                return (
                  <Button
                    key={vehicle.id}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-24 flex flex-col gap-2 ${isSelected ? vehicle.color : ''}`}
                    onClick={() => handleInputChange('vehicleType', vehicle.id)}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm">{vehicle.label}</span>
                  </Button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleBrand">Marque *</Label>
                <Input
                  id="vehicleBrand"
                  value={formData.vehicleBrand}
                  onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                  placeholder="Ex: Honda, Yamaha, Toyota..."
                />
              </div>
              <div>
                <Label htmlFor="vehicleModel">Modèle *</Label>
                <Input
                  id="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                  placeholder="Ex: CG 125, Corolla..."
                />
              </div>
              <div>
                <Label htmlFor="vehicleYear">Année</Label>
                <Input
                  id="vehicleYear"
                  type="number"
                  value={formData.vehicleYear}
                  onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                  placeholder="2020"
                />
              </div>
              <div>
                <Label htmlFor="licensePlate">Plaque d'immatriculation *</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  placeholder="Ex: GN-123-AB (format guinéen)"
                />
              </div>
              <div>
                <Label htmlFor="vehicleColor">Couleur</Label>
                <Input
                  id="vehicleColor"
                  value={formData.vehicleColor}
                  onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
                  placeholder="Ex: Rouge, Bleu..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Documents obligatoires</h3>
              <p className="text-muted-foreground">Uploadez vos documents officiels</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { key: 'identityDocument', label: 'Pièce d\'identité', required: true },
                { key: 'driverLicense', label: 'Permis de conduire', required: true },
                { key: 'vehicleInsurance', label: 'Assurance véhicule', required: true },
                { key: 'vehicleRegistration', label: 'Carte grise', required: false }
              ].map((doc) => (
                <Card key={doc.key} className="border-2 border-dashed">
                  <CardContent className="p-6 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                    <Label htmlFor={doc.key} className="cursor-pointer">
                      <div className="space-y-2">
                        <p className="font-medium">{doc.label}</p>
                        {doc.required && <Badge variant="destructive" className="text-xs">Obligatoire</Badge>}
                        <p className="text-sm text-muted-foreground">
                          Cliquez pour uploader
                        </p>
                      </div>
                    </Label>
                    <Input
                      id={doc.key}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(doc.key, file);
                      }}
                    />
                    {formData[doc.key as keyof typeof formData] && (
                      <div className="mt-2 flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Document uploadé</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold">Contact d'urgence</h3>
              <p className="text-muted-foreground">Sécurité et contact d'urgence</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Contact d'urgence *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Nom du contact"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Téléphone d'urgence *</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="+224 123 456 789"
                />
              </div>
              <div>
                <Label htmlFor="experienceYears">Années d'expérience</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Prêt à commencer !</p>
                    <p className="text-sm text-green-600">
                      Une fois inscrit, vous aurez accès à toutes les fonctionnalités de la plateforme et pourrez commencer à recevoir des missions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Inscription Conducteur</CardTitle>
            <Badge variant="outline">{currentStep}/{totalSteps}</Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent className="p-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Précédent
            </Button>
            
            {currentStep === totalSteps ? (
              <Button 
                onClick={handleSubmit} 
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                disabled={!validateStep(4)}
              >
                Terminer l'inscription
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                className="bg-primary hover:bg-primary/90 text-white px-8"
                disabled={!validateStep(currentStep)}
              >
                Suivant
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverOnboarding;
