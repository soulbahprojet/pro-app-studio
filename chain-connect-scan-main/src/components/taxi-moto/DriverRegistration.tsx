import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, User, Bike, FileText, MapPin, Building, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DriverRegistration: React.FC = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    vehicleType: '',
    vehicleBrand: '',
    vehicleModel: '',
    licensePlate: '',
    licenseNumber: '',
    insuranceNumber: '',
    unionOffice: '',
    emergencyContact: '',
    emergencyPhone: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Inscription soumise",
      description: "Votre demande d'inscription sera examinée sous 24h",
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </h3>
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
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+224 XXX XXX XXX"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="photo">Photo de profil *</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <Button variant="outline">
                      Choisir une photo
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    PNG, JPG jusqu'à 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Bike className="h-5 w-5" />
              Informations du véhicule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleType">Type de véhicule *</Label>
                <Select value={formData.vehicleType} onValueChange={(value) => handleInputChange('vehicleType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moto">Moto</SelectItem>
                    <SelectItem value="voiture">Voiture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicleBrand">Marque *</Label>
                <Input
                  id="vehicleBrand"
                  value={formData.vehicleBrand}
                  onChange={(e) => handleInputChange('vehicleBrand', e.target.value)}
                  placeholder="Ex: Yamaha, Toyota"
                />
              </div>
              <div>
                <Label htmlFor="vehicleModel">Modèle *</Label>
                <Input
                  id="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                  placeholder="Ex: FZ, Corolla"
                />
              </div>
              <div>
                <Label htmlFor="licensePlate">Immatriculation *</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                  placeholder="Ex: AB-123-CD"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents officiels
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="licenseNumber">Numéro de permis *</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  placeholder="Numéro de permis de conduire"
                />
              </div>
              <div>
                <Label htmlFor="insuranceNumber">Numéro d'assurance *</Label>
                <Input
                  id="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
                  placeholder="Numéro de police d'assurance"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Permis de conduire *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <Button variant="outline" className="mt-2">
                      Télécharger le permis
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Label>Assurance véhicule *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <Button variant="outline" className="mt-2">
                      Télécharger l'assurance
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Building className="h-5 w-5" />
              Affiliation et contacts d'urgence
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="unionOffice">Bureau syndicat (optionnel)</Label>
                <Select value={formData.unionOffice} onValueChange={(value) => handleInputChange('unionOffice', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un bureau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conakry-centre">Bureau Conakry Centre</SelectItem>
                    <SelectItem value="kaloum">Bureau Kaloum</SelectItem>
                    <SelectItem value="ratoma">Bureau Ratoma</SelectItem>
                    <SelectItem value="matoto">Bureau Matoto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="emergencyContact">Contact d'urgence *</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Nom du contact d'urgence"
                />
              </div>
              <div>
                <Label htmlFor="emergencyPhone">Téléphone d'urgence *</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="+224 XXX XXX XXX"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6" />
          Inscription Conducteur Taxi-Moto
        </CardTitle>
        <div className="flex items-center justify-between mt-4">
          {[1, 2, 3, 4].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex items-center ${stepNumber < 4 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 4 && (
                <div className={`flex-1 h-1 ml-2 ${
                  step > stepNumber ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[400px]">
          {renderStep()}
        </div>
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            Précédent
          </Button>
          {step < 4 ? (
            <Button onClick={nextStep} className="flex items-center gap-2">
              Suivant
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Soumettre l'inscription
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverRegistration;