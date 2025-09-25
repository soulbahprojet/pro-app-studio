import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Badge } from "../../ui/badge";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Facebook, Zap, Users, Calendar, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Vendor = {
  vendor_id: string;
  plan_tier: string;
  end_date: string | null;
};

type BoostResult = {
  vendor_id: string;
  product_id?: string;
  status: string;
  fb_post_id?: string;
  error?: string;
  message?: string;
};

export default function PDGBoostPanel() {
  const { toast } = useToast();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [plan, setPlan] = useState<string>("");
  const [limitPerVendor, setLimitPerVendor] = useState(1);
  const [dryRun, setDryRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BoostResult[]>([]);

  useEffect(() => {
    loadEligibleVendors();
  }, [plan]);

  const loadEligibleVendors = async () => {
    try {
      const response = await supabase.functions.invoke('fetch-eligible-vendors', {
        body: { plan: plan === 'all' ? undefined : plan }
      });

      if (response.error) {
        console.error('Error fetching vendors:', response.error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les vendeurs éligibles",
          variant: "destructive"
        });
        return;
      }

      const result = response.data;
      if (!result.ok) {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors du chargement",
          variant: "destructive"
        });
        return;
      }

      setVendors(result.data || []);
    } catch (error) {
      console.error('Error loading vendors:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  const toggleVendor = (vendorId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(vendorId)) {
      newSelected.delete(vendorId);
    } else {
      newSelected.add(vendorId);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    if (selected.size === vendors.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(vendors.map(v => v.vendor_id)));
    }
  };

  const publishBoosts = async () => {
    try {
      setLoading(true);
      setResults([]);

      const body = {
        plan: plan === 'all' ? undefined : plan,
        vendor_ids: Array.from(selected),
        limitPerVendor,
        dryRun
      };

      const response = await supabase.functions.invoke('boost-facebook', {
        body
      });

      if (response.error) {
        console.error('Error publishing boosts:', response.error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la publication",
          variant: "destructive"
        });
        return;
      }

      const result = response.data;
      if (!result.ok) {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la publication",
          variant: "destructive"
        });
        return;
      }

      setResults(result.results || []);
      
      const successCount = result.results?.filter((r: BoostResult) => r.status === 'success').length || 0;
      const totalCount = result.count || 0;

      if (dryRun) {
        toast({
          title: "Test réussi",
          description: `${totalCount} publications simulées avec succès`,
        });
      } else {
        toast({
          title: "Publication terminée",
          description: `${successCount}/${totalCount} publications réussies`,
        });
      }

    } catch (error) {
      console.error('Error publishing boosts:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadgeColor = (planTier: string) => {
    switch (planTier.toLowerCase()) {
      case 'premium': return 'default';
      case 'pro': return 'secondary';
      case 'basic': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <Facebook className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">PDG — Boost Facebook</h2>
          <p className="text-muted-foreground">
            Publier automatiquement les produits des vendeurs sur Facebook
          </p>
        </div>
      </div>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="plan">Filtrer par forfait</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Tous les forfaits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="limit">Produits par vendeur</Label>
              <Input
                id="limit"
                type="number"
                min={1}
                max={10}
                value={limitPerVendor}
                onChange={(e) => setLimitPerVendor(Number(e.target.value))}
              />
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="dry-run"
                checked={dryRun}
                onCheckedChange={setDryRun}
              />
              <Label htmlFor="dry-run">Mode test (pas de publication réelle)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vendor Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Vendeurs Éligibles ({vendors.length})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selected.size === vendors.length ? "Désélectionner tout" : "Sélectionner tout"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vendors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun vendeur éligible trouvé</p>
              <p className="text-sm">Vérifiez les abonnements actifs</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-auto border rounded-lg">
              <div className="space-y-2 p-2">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.vendor_id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selected.has(vendor.vendor_id)}
                      onCheckedChange={() => toggleVendor(vendor.vendor_id)}
                    />
                    <div className="flex-1 flex items-center gap-2">
                      <span className="font-medium">{vendor.vendor_id}</span>
                      <Badge variant={getPlanBadgeColor(vendor.plan_tier)}>
                        {vendor.plan_tier.toUpperCase()}
                      </Badge>
                    </div>
                    {vendor.end_date && (
                      <div className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Expire: {new Date(vendor.end_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {selected.size} vendeur(s) sélectionné(s)
              </p>
              <p className="text-sm text-muted-foreground">
                {dryRun ? "Mode test activé" : "Publication réelle"}
              </p>
            </div>
            <Button
              onClick={publishBoosts}
              disabled={loading || selected.size === 0}
              size="lg"
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              {loading ? "Publication en cours..." : dryRun ? "Tester maintenant" : "Publier maintenant"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de la publication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={`${result.vendor_id}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <span className="font-medium">{result.vendor_id}</span>
                    {result.product_id && (
                      <span className="text-sm text-muted-foreground ml-2">
                        • Produit: {result.product_id.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        result.status === 'success' ? 'default' :
                        result.status === 'dry_run' ? 'secondary' : 'destructive'
                      }
                    >
                      {result.status === 'success' ? 'Publié' :
                       result.status === 'dry_run' ? 'Test OK' :
                       result.status === 'error' ? 'Erreur' : result.status}
                    </Badge>
                    {result.fb_post_id && (
                      <span className="text-xs text-muted-foreground">
                        ID: {result.fb_post_id}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
