import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Phone, MapPin, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SOSButton: React.FC = () => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(0);
  const { toast } = useToast();

  const handleSOSActivation = () => {
    if (confirmationStep === 0) {
      setConfirmationStep(1);
      setTimeout(() => setConfirmationStep(0), 5000); // Reset after 5 seconds
    } else if (confirmationStep === 1) {
      // Activate SOS
      setIsSOSActive(true);
      setConfirmationStep(0);
      
      toast({
        title: "🚨 ALERTE SOS ACTIVÉE",
        description: "Votre position a été transmise aux autorités compétentes",
        variant: "destructive",
      });

      // Simulate GPS transmission and emergency contacts notification
      setTimeout(() => {
        toast({
          title: "📍 Position GPS transmise",
          description: "Coordonnées envoyées au Bureau Syndicat et contacts d'urgence",
        });
      }, 2000);
    }
  };

  const handleSOSDeactivation = () => {
    setIsSOSActive(false);
    toast({
      title: "✅ Alerte SOS désactivée",
      description: "Situation résolue. Merci de confirmer votre sécurité.",
    });
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={isSOSActive ? "destructive" : "outline"}
            size="sm"
            className={`relative ${
              isSOSActive 
                ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                : "border-red-500 text-red-600 hover:bg-red-50"
            }`}
          >
            <AlertTriangle className="h-4 w-4 mr-1" />
            {isSOSActive ? "SOS ACTIF" : "SOS"}
            {isSOSActive && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              Bouton SOS d'urgence
            </DialogTitle>
          </DialogHeader>
          
          {!isSOSActive ? (
            <div className="space-y-4">
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-red-800 mb-2">
                        Utiliser uniquement en cas d'urgence réelle
                      </p>
                      <ul className="text-red-700 space-y-1">
                        <li>• Agression ou menace</li>
                        <li>• Accident grave</li>
                        <li>• Situation de danger imminent</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h4 className="font-medium">Que se passe-t-il quand vous activez le SOS ?</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Transmission immédiate de votre position GPS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>Notification aux contacts d'urgence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Alerte au Bureau Syndicat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Suivi en temps réel jusqu'à résolution</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                {confirmationStep === 0 ? (
                  <Button
                    onClick={handleSOSActivation}
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    ACTIVER LE SOS
                  </Button>
                ) : (
                  <Button
                    onClick={handleSOSActivation}
                    variant="destructive"
                    className="w-full bg-red-700 hover:bg-red-800 animate-pulse"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    CONFIRMER L'URGENCE
                  </Button>
                )}
                
                {confirmationStep === 1 && (
                  <p className="text-xs text-center text-red-600 mt-2">
                    Appuyez à nouveau pour confirmer l'activation
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="border-red-500 bg-red-100">
                <CardContent className="p-4">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-3 animate-pulse" />
                    <h3 className="font-bold text-red-800 text-lg mb-2">
                      🚨 ALERTE SOS ACTIVE 🚨
                    </h3>
                    <p className="text-red-700 text-sm">
                      Votre position est transmise en temps réel
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm text-green-800">📍 Position GPS transmise</span>
                  <span className="text-xs text-green-600">✓ Envoyé</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm text-blue-800">📞 Contacts d'urgence notifiés</span>
                  <span className="text-xs text-blue-600">✓ Envoyé</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-sm text-orange-800">🏢 Bureau Syndicat alerté</span>
                  <span className="text-xs text-orange-600">✓ Envoyé</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleSOSDeactivation}
                  variant="outline"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                >
                  ✅ Situation résolue - Désactiver SOS
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Désactivez uniquement si la situation est sous contrôle
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SOSButton;