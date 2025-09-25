import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFeesConfig, updateFeesConfig, type FeesConfig } from "@/utils/feesConfig";
import { Settings, Percent, CreditCard } from "lucide-react";

export default function PDGFeesConfiguration() {
  const [config, setConfig] = useState<FeesConfig>({
    FRAIS_APP: 0,
    FRAIS_RETRAIT: 0,
    COMMISSION_API: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Charger les frais actuels
  useEffect(() => {
    try {
      const currentConfig = getFeesConfig();
      setConfig(currentConfig);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la configuration",
        variant: "destructive"
      });
      setLoading(false);
    }
  }, [toast]);

  const handleChange = (field: keyof FeesConfig, value: string) => {
    const numValue = field === "FRAIS_RETRAIT" ? parseInt(value) || 0 : parseFloat(value) || 0;
    setConfig(prev => ({ ...prev, [field]: numValue }));
  };

  const handleSave = async () => {
    try {
      const updatedConfig = updateFeesConfig(config);
      setConfig(updatedConfig);
      toast({
        title: "Succès",
        description: "Paramètres mis à jour avec succès !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration des Frais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Frais Application
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="frais-app">Pourcentage (%)</Label>
                  <Input
                    id="frais-app"
                    type="number"
                    value={config.FRAIS_APP}
                    onChange={(e) => handleChange("FRAIS_APP", e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Actuellement: {(config.FRAIS_APP * 100).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Frais de Retrait
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="frais-retrait">Montant fixe (GNF)</Label>
                  <Input
                    id="frais-retrait"
                    type="number"
                    value={config.FRAIS_RETRAIT}
                    onChange={(e) => handleChange("FRAIS_RETRAIT", e.target.value)}
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Actuellement: {config.FRAIS_RETRAIT.toLocaleString()} GNF
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Commission API
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="commission-api">Pourcentage (%)</Label>
                  <Input
                    id="commission-api"
                    type="number"
                    value={config.COMMISSION_API}
                    onChange={(e) => handleChange("COMMISSION_API", e.target.value)}
                    step="0.01"
                    min="0"
                    max="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Actuellement: {(config.COMMISSION_API * 100).toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="w-full md:w-auto">
              Sauvegarder les modifications
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aperçu des Calculs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">Calcul Client (Achat)</h4>
              <p className="text-muted-foreground">
                Montant final = Montant × (1 + {(config.FRAIS_APP * 100).toFixed(2)}% + {(config.COMMISSION_API * 100).toFixed(2)}%)
              </p>
              <p className="text-muted-foreground">
                Exemple: 10,000 GNF → {Math.round(10000 * (1 + config.FRAIS_APP + config.COMMISSION_API)).toLocaleString()} GNF
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Calcul Retrait</h4>
              <p className="text-muted-foreground">
                Montant net = Montant - {config.FRAIS_RETRAIT.toLocaleString()} GNF - {(config.COMMISSION_API * 100).toFixed(2)}%
              </p>
              <p className="text-muted-foreground">
                Exemple: 10,000 GNF → {Math.round(10000 - config.FRAIS_RETRAIT - (10000 * config.COMMISSION_API)).toLocaleString()} GNF
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
