import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Truck, Car, Bike, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

const UNION_COUNTRIES = ['Guinée', 'Sierra Leone', 'Guinée-Bissau', 'Libéria', 'Mali'];

interface CourierRegistrationProps {
  registerForm: any;
  setRegisterForm: (form: any) => void;
  onNext: () => void;
}

export default function CourierRegistration({ registerForm, setRegisterForm, onNext }: CourierRegistrationProps) {
  const { toast } = useToast();
  const { checkLocation, loading, error, country, isInUnionCountry } = useGeolocation();
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'checking' | 'verified' | 'failed'>('idle');
  const [showUnionOptions, setShowUnionOptions] = useState(false);

  // Options de véhicules avec émojis
  const vehicleOptions = [
    { value: 'moto', label: 'Livreur Moto 🏍️', icon: Bike, color: 'text-orange-600' },
    { value: 'voiture', label: 'Livreur Voiture 🚗', icon: Car, color: 'text-blue-600' }
  ];

  // Options de syndicat
  const unionOptions = [
    { value: 'syndicat_moto', label: 'Bureau Syndicat Moto 🏍️', icon: Bike },
    { value: 'syndicat_voiture', label: 'Bureau Syndicat Voiture 🚗', icon: Car }
  ];

  // Vérifier la géolocalisation GPS
  const checkGPSLocation = async () => {
    setGpsStatus('checking');
    toast({
      title: "Vérification GPS",
      description: "Vérification de votre localisation...",
    });

    try {
      const { country: detectedCountry, isInUnionCountry: isAllowed } = await checkLocation();
      
      setGpsStatus(isAllowed ? 'verified' : 'failed');
      
      setRegisterForm({
        ...registerForm,
        gpsVerified: isAllowed,
        gpsCountry: detectedCountry
      });

      if (isAllowed) {
        toast({
          title: "✅ GPS Vérifié",
          description: `Localisation confirmée : ${detectedCountry}`,
        });
      } else {
        toast({
          title: "❌ Localisation Non Autorisée",
          description: `Syndicat non disponible dans votre pays : ${detectedCountry}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      setGpsStatus('failed');
      toast({
        title: "Erreur GPS",
        description: "Impossible de vérifier votre localisation",
        variant: "destructive"
      });
    }
  };

  const handleVehicleTypeChange = (vehicleType: string) => {
    setRegisterForm({
      ...registerForm,
      vehicleType,
      unionType: null // Reset union type when vehicle changes
    });
    setShowUnionOptions(false);
  };

  const handleShowUnionOptions = () => {
    if (!registerForm.vehicleType) {
      toast({
        title: "Type de véhicule requis",
        description: "Veuillez d'abord choisir votre type de véhicule",
        variant: "destructive"
      });
      return;
    }

    // Démarrer la vérification GPS
    checkGPSLocation();
    setShowUnionOptions(true);
  };

  const canContinue = registerForm.vehicleType && 
    (!showUnionOptions || (registerForm.unionType && gpsStatus === 'verified') || gpsStatus === 'failed');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Inscription Livreur/Motard
          </CardTitle>
          <CardDescription>
            Choisissez votre type de véhicule et options disponibles
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Sélection du type de véhicule (OBLIGATOIRE) */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Type de véhicule (obligatoire)</Label>
            <div className="grid grid-cols-1 gap-3">
              {vehicleOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={registerForm.vehicleType === option.value ? "default" : "outline"}
                    className={`p-4 h-auto justify-start ${
                      registerForm.vehicleType === option.value ? 'border-primary bg-primary/10' : ''
                    }`}
                    onClick={() => handleVehicleTypeChange(option.value)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 ${option.color}`} />
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
            <p className="text-sm text-muted-foreground">
              ⚠️ Ce choix détermine le type de missions qui vous seront attribuées
            </p>
          </div>

          {/* Option Bureau Syndicat */}
          {registerForm.vehicleType && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Bureau Syndicat (optionnel)</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Disponible dans : {UNION_COUNTRIES.join(', ')}
                  </span>
                </div>
              </div>

              {!showUnionOptions ? (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleShowUnionOptions}
                    className="w-full p-4"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Créer un Bureau Syndicat {registerForm.vehicleType === 'moto' ? '🏍️' : '🚗'}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Cliquez pour voir les options de syndicat disponibles
                  </p>
                </div>
              ) : (
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-4 space-y-4">
                    {/* Statut GPS */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                      {gpsStatus === 'checking' && (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                          <span className="text-sm">Vérification GPS en cours...</span>
                        </>
                      )}
                      {gpsStatus === 'verified' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">GPS vérifié ✅</span>
                        </>
                      )}
                      {gpsStatus === 'failed' && (
                        <>
                          <AlertCircle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm text-yellow-600">GPS non disponible - Continuer sans vérification ⚠️</span>
                        </>
                      )}
                    </div>

                    {/* Options de syndicat */}
                    {(gpsStatus === 'verified' || gpsStatus === 'checking' || gpsStatus === 'failed') && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Type de syndicat</Label>
                        {unionOptions.map((option) => {
                          const Icon = option.icon;
                          const isCompatible = 
                            (option.value === 'syndicat_moto' && registerForm.vehicleType === 'moto') ||
                            (option.value === 'syndicat_voiture' && registerForm.vehicleType === 'voiture');
                          
                          return (
                            <Button
                              key={option.value}
                              type="button"
                              variant={registerForm.unionType === option.value ? "default" : "outline"}
                              className={`w-full p-3 justify-start ${
                                !isCompatible ? 'opacity-50 cursor-not-allowed' : ''
                              } ${
                                registerForm.unionType === option.value ? 'border-primary bg-primary/10' : ''
                              }`}
                              onClick={() => isCompatible && setRegisterForm({
                                ...registerForm,
                                unionType: option.value
                              })}
                              disabled={!isCompatible}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="w-4 h-4" />
                                <span>{option.label}</span>
                                {!isCompatible && (
                                  <span className="text-xs text-muted-foreground ml-auto">
                                    Non compatible
                                  </span>
                                )}
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      🔒 Double sécurité : Pays déclaré + Vérification GPS temps réel
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Informations sur les fonctionnalités */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Fonctionnalités disponibles :</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Missions adaptées à votre véhicule</li>
                <li>• Tableau de bord personnalisé</li>
                <li>• Bouton SOS et support</li>
                <li>• Badges et récompenses</li>
                {registerForm.unionType && (
                  <li>• Gestion de syndicat et membres</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Button 
            onClick={onNext} 
            className="w-full" 
            disabled={!canContinue}
          >
            Continuer l'inscription
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}