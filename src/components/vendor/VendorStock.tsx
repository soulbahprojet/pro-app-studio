import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Alert, AlertDescription } from '../../ui/alert';
import { 
  Warehouse, 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Plus,
  Edit,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VendorStockProps {
  userProfile: any;
}

const VendorStock: React.FC<VendorStockProps> = ({ userProfile }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStockData();
  }, [userProfile]);

  const loadStockData = async () => {
    try {
      setLoading(true);
      
      // Charger les produits avec leur stock
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userProfile.user_id)
        .order('stock_quantity', { ascending: true });

      setProducts(productsData || []);

      // Créer des alertes pour les stocks faibles (simulation)
      const lowStockProducts = (productsData || []).filter(p => p.stock_quantity <= 5);
      setStockAlerts(lowStockProducts.map(product => ({
        id: product.id,
        product_name: product.name,
        current_stock: product.stock_quantity,
        threshold: 5,
        severity: product.stock_quantity === 0 ? 'critical' : 'warning'
      })));

    } catch (error) {
      console.error('Erreur lors du chargement du stock:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de stock",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId: string, newQuantity: number) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newQuantity })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(product => 
        product.id === productId 
          ? { ...product, stock_quantity: newQuantity }
          : product
      ));

      toast({
        title: "Succès",
        description: "Stock mis à jour avec succès",
      });

      // Recharger pour mettre à jour les alertes
      loadStockData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le stock",
        variant: "destructive"
      });
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { label: 'Rupture', variant: 'destructive', color: 'bg-red-500' };
    if (quantity <= 5) return { label: 'Stock faible', variant: 'secondary', color: 'bg-orange-500' };
    if (quantity <= 20) return { label: 'Stock normal', variant: 'outline', color: 'bg-yellow-500' };
    return { label: 'Stock élevé', variant: 'default', color: 'bg-green-500' };
  };

  const getStockPercentage = (current: number, max: number = 100) => {
    return Math.min((current / max) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalProducts = products.length;
  const lowStockCount = products.filter(p => p.stock_quantity <= 5).length;
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.stock_quantity * p.price), 0);

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble du stock */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Dans votre inventaire
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock faible</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent réapprovisionnement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ruptures</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Produits indisponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur stock</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toLocaleString()} GNF</div>
            <p className="text-xs text-muted-foreground">
              Valeur totale inventaire
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes de stock */}
      {stockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertes de Stock
            </CardTitle>
            <CardDescription>
              Produits nécessitant votre attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stockAlerts.map((alert) => (
                <Alert key={alert.id} className={alert.severity === 'critical' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}>
                  <AlertTriangle className={`h-4 w-4 ${alert.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`} />
                  <AlertDescription>
                    <div className="flex justify-between items-center">
                      <div>
                        <strong>{alert.product_name}</strong>
                        <span className="ml-2">
                          {alert.severity === 'critical' 
                            ? 'En rupture de stock' 
                            : `Stock faible: ${alert.current_stock} unités restantes`
                          }
                        </span>
                      </div>
                      <Button size="sm" variant="outline">
                        Réapprovisionner
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gestion du stock par produit */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire des Produits</CardTitle>
          <CardDescription>
            Gérez le stock de chaque produit individuellement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => {
              const status = getStockStatus(product.stock_quantity);
              const stockPercentage = getStockPercentage(product.stock_quantity);
              
              return (
                <div key={product.id} className="p-4 border rounded-lg">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold">{product.name}</h3>
                        <Badge variant={status.variant as any}>{status.label}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Stock actuel</p>
                          <p className="font-medium">{product.stock_quantity} unités</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Prix unitaire</p>
                          <p className="font-medium">{product.price?.toLocaleString()} GNF</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Valeur stock</p>
                          <p className="font-medium">{(product.stock_quantity * product.price).toLocaleString()} GNF</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Niveau de stock</span>
                          <span>{product.stock_quantity}/100</span>
                        </div>
                        <Progress value={stockPercentage} className="h-2" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px]">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={product.stock_quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 0;
                            updateStock(product.id, newQuantity);
                          }}
                          className="w-20"
                        />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Plus className="h-4 w-4 mr-1" />
                          +10
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Plus className="h-4 w-4 mr-1" />
                          +50
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {products.length === 0 && (
              <div className="text-center p-8">
                <Warehouse className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun produit en stock</h3>
                <p className="text-muted-foreground">
                  Ajoutez des produits pour commencer à gérer votre inventaire.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions de gestion en lot */}
      <Card>
        <CardHeader>
          <CardTitle>Actions de Gestion</CardTitle>
          <CardDescription>
            Outils pour gérer votre stock efficacement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Package className="h-6 w-6" />
              <span>Import CSV</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Rapport de stock</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <AlertTriangle className="h-6 w-6" />
              <span>Alertes automatiques</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorStock;
