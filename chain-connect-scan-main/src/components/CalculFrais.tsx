import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { calculClient, calculRetrait, type CalculationType } from "@/utils/feesCalculator";

export default function CalculFrais() {
  const [montant, setMontant] = useState("");
  const [resultat, setResultat] = useState<number | null>(null);
  const [type, setType] = useState<CalculationType>("client");

  const handleCalcul = () => {
    const montantNumber = Number(montant);
    if (!montantNumber || montantNumber <= 0) return;

    let res: number;
    if (type === "client") {
      res = calculClient(montantNumber);
    } else {
      res = calculRetrait(montantNumber);
    }
    setResultat(res);
  };

  const getTypeLabel = (type: CalculationType): string => {
    const labels = {
      client: "Achat (Client)",
      livreur: "Retrait (Livreur)",
      vendeur: "Retrait (Vendeur)",
      affilie: "Retrait (Partenaire affilié)",
      client_retrait: "Retrait (Client)"
    };
    return labels[type];
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          💰 Calculateur de Frais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type-select">Type d'opération</Label>
          <Select value={type} onValueChange={(value) => setType(value as CalculationType)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="client">Achat (Client)</SelectItem>
              <SelectItem value="livreur">Retrait (Livreur)</SelectItem>
              <SelectItem value="vendeur">Retrait (Vendeur)</SelectItem>
              <SelectItem value="affilie">Retrait (Partenaire affilié)</SelectItem>
              <SelectItem value="client_retrait">Retrait (Client)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="montant-input">Montant en GNF</Label>
          <Input
            id="montant-input"
            type="number"
            placeholder="Entrez le montant en GNF"
            value={montant}
            onChange={(e) => setMontant(e.target.value)}
          />
        </div>

        <Button onClick={handleCalcul} className="w-full">
          Calculer
        </Button>

        {resultat !== null && (
          <div className="p-4 bg-muted rounded-lg text-center space-y-2">
            <p className="font-semibold text-sm text-muted-foreground">Résultat :</p>
            <p className="text-2xl font-bold text-primary">
              {resultat.toLocaleString()} GNF
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}