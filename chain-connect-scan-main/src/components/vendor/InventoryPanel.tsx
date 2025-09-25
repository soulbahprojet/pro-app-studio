import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, Minus, History, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type InventoryPanelProps = {
  productId: string;
  onClose?: () => void;
};

type Product = {
  id: string;
  name: string;
  stock_quantity: number;
};

type StockLog = {
  id: string;
  quantity_change: number;
  reason?: string;
  created_at: string;
  user_id?: string;
};

export default function InventoryPanel({ productId, onClose }: InventoryPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [change, setChange] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadStockHistory();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity')
        .eq('id', productId)
        .eq('seller_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger le produit",
          variant: "destructive"
        });
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    }
  };

  const loadStockHistory = async () => {
    try {
      // Skip loading stock history for now since stock_logs table doesn't exist yet
      setStockLogs([]);
    } catch (error) {
      console.error('Error loading stock history:', error);
    }
  };

  const adjustStock = async () => {
    if (!product || change === 0) return;

    try {
      setLoading(true);

      // Call the adjust-inventory edge function
      const response = await supabase.functions.invoke('adjust-inventory', {
        body: {
          product_id: productId,
          location: "default",
          change: Number(change),
          reason: reason || "Ajustement manuel",
          actor_id: user?.id
        }
      });

      if (response.error) {
        console.error('Error adjusting inventory:', response.error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajuster le stock",
          variant: "destructive"
        });
        return;
      }

      const result = response.data;
      if (!result.ok) {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de l'ajustement",
          variant: "destructive"
        });
        return;
      }

      // Update local product state
      setProduct(prev => prev ? {
        ...prev,
        stock_quantity: result.data.newQuantity
      } : null);

      // Reset form
      setChange(0);
      setReason("");

      // Reload history
      loadStockHistory();

      toast({
        title: "Succès",
        description: `Stock mis à jour: ${change > 0 ? '+' : ''}${change} unités`,
      });

    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: "Rupture", variant: "destructive" as const };
    if (quantity < 10) return { label: "Stock faible", variant: "secondary" as const };
    return { label: "En stock", variant: "default" as const };
  };

  if (!product) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock_quantity);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight">Gestion du Stock</h3>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        )}
      </div>

      {/* Product Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stock actuel</p>
              <p className="text-3xl font-bold">{product.stock_quantity}</p>
            </div>
            <Badge variant={stockStatus.variant} className="gap-1">
              {product.stock_quantity === 0 && <AlertTriangle className="h-3 w-3" />}
              {stockStatus.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stock Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle>Ajuster le Stock</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="change">Quantité à ajouter/retirer</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChange(prev => prev - 1)}
                  disabled={loading}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  id="change"
                  type="number"
                  value={change}
                  onChange={(e) => setChange(Number(e.target.value))}
                  className="text-center"
                  disabled={loading}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChange(prev => prev + 1)}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Nouveau stock: {product.stock_quantity + change}
              </p>
            </div>

            <div>
              <Label htmlFor="reason">Raison (optionnel)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Réapprovisionnement, vente en magasin..."
                className="mt-1"
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            onClick={adjustStock} 
            disabled={loading || change === 0}
            className="w-full gap-2"
          >
            <Package className="h-4 w-4" />
            {loading ? "Ajustement en cours..." : "Appliquer l'ajustement"}
          </Button>
        </CardContent>
      </Card>

      {/* Stock History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Historique des mouvements
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Masquer" : "Afficher"}
            </Button>
          </div>
        </CardHeader>
        {showHistory && (
          <CardContent>
            {stockLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                Aucun mouvement de stock enregistré
              </p>
            ) : (
              <div className="space-y-3">
                {stockLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={log.quantity_change > 0 ? "default" : "secondary"}>
                          {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                        </Badge>
                        <span className="text-sm font-medium">
                          {log.reason || "Ajustement"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}