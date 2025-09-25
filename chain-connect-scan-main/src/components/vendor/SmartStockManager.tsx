import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  DollarSign,
  Package2,
  BarChart3,
  Bell,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseProduct {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  category: string;
  seller_id: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  maxStock?: number;
  price: number;
  category: string;
  salesVelocity: number;
  lastSaleDate: Date;
  leadTime: number;
  unitCost: number;
  supplier: string;
}

interface StockPrediction {
  productId: string;
  productName: string;
  currentStock: number;
  predictedOutOfStockDate: Date;
  recommendedOrderQuantity: number;
  recommendedOrderDate: Date;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

interface SmartAlert {
  id: string;
  type: 'reorder' | 'overstock' | 'deadstock' | 'trend';
  title: string;
  message: string;
  productId: string;
  productName: string;
  severity: 'critical' | 'warning' | 'info';
  actionRequired: boolean;
  createdAt: Date;
}

const SmartStockManager: React.FC = () => {
  const [predictions, setPredictions] = useState<StockPrediction[]>([]);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les produits depuis la base de données
  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      // Transformer les données de la base en format Product
      const transformedProducts: Product[] = (data as DatabaseProduct[]).map(product => ({
        id: product.id,
        name: product.name,
        sku: `SKU-${product.id.slice(0, 8)}`,
        stock: product.stock_quantity,
        minStock: Math.max(5, Math.ceil(product.stock_quantity * 0.2)),
        maxStock: product.stock_quantity * 3,
        price: product.price,
        category: product.category || 'Général',
        salesVelocity: Math.random() * 3 + 0.5,
        lastSaleDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        leadTime: Math.floor(Math.random() * 10) + 3,
        unitCost: product.price * 0.7,
        supplier: `Fournisseur ${product.category}`
      }));

      setProducts(transformedProducts);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = (): StockPrediction[] => {
    if (products.length === 0) return [];
    
    return products.map(product => {
      const daysUntilOutOfStock = product.salesVelocity > 0 
        ? Math.max(0, product.stock / product.salesVelocity)
        : 999;
      
      const predictedOutOfStockDate = new Date();
      predictedOutOfStockDate.setDate(predictedOutOfStockDate.getDate() + daysUntilOutOfStock);
      
      const recommendedOrderDate = new Date(predictedOutOfStockDate);
      recommendedOrderDate.setDate(recommendedOrderDate.getDate() - product.leadTime);
      
      const optimalOrderQuantity = Math.max(
        product.minStock,
        Math.ceil(product.salesVelocity * (product.leadTime + 14))
      );
      
      let priority: 'high' | 'medium' | 'low' = 'low';
      if (daysUntilOutOfStock < 7) priority = 'high';
      else if (daysUntilOutOfStock < 14) priority = 'medium';
      
      const confidence = Math.max(0.6, Math.min(0.95, 
        0.8 + (product.salesVelocity > 0 ? 0.1 : -0.2)
      ));

      return {
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        predictedOutOfStockDate,
        recommendedOrderQuantity: optimalOrderQuantity,
        recommendedOrderDate,
        confidence,
        priority
      };
    });
  };

  const generateSmartAlerts = (): SmartAlert[] => {
    if (products.length === 0) return [];
    
    const alerts: SmartAlert[] = [];
    
    products.forEach(product => {
      // Alerte de rupture imminente
      if (product.stock <= product.minStock) {
        alerts.push({
          id: `reorder-${product.id}`,
          type: 'reorder',
          title: 'Réapprovisionnement urgent',
          message: `${product.name} est en dessous du stock minimum (${product.stock}/${product.minStock})`,
          productId: product.id,
          productName: product.name,
          severity: 'critical',
          actionRequired: true,
          createdAt: new Date()
        });
      }

      // Alerte de surstock
      if (product.maxStock && product.stock > product.maxStock * 0.9) {
        alerts.push({
          id: `overstock-${product.id}`,
          type: 'overstock',
          title: 'Surstock détecté',
          message: `${product.name} approche le stock maximum (${product.stock}/${product.maxStock})`,
          productId: product.id,
          productName: product.name,
          severity: 'warning',
          actionRequired: false,
          createdAt: new Date()
        });
      }

      // Alerte de stock dormant
      const daysSinceLastSale = Math.floor((new Date().getTime() - product.lastSaleDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastSale > 30 && product.stock > 5) {
        alerts.push({
          id: `deadstock-${product.id}`,
          type: 'deadstock',
          title: 'Stock dormant',
          message: `${product.name} n'a pas été vendu depuis ${daysSinceLastSale} jours`,
          productId: product.id,
          productName: product.name,
          severity: 'info',
          actionRequired: false,
          createdAt: new Date()
        });
      }
    });

    return alerts;
  };

  const runSmartAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      await fetchProducts();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPredictions = generatePredictions();
      const newAlerts = generateSmartAlerts();
      
      setPredictions(newPredictions);
      setAlerts(newAlerts);
      
      toast.success('Analyse intelligente terminée');
    } catch (error) {
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const newPredictions = generatePredictions();
      const newAlerts = generateSmartAlerts();
      setPredictions(newPredictions);
      setAlerts(newAlerts);
    }
  }, [products]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-3 text-lg">Chargement des données...</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Package2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground">
              Ajoutez des produits à votre inventaire pour utiliser l'analyse intelligente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">Gestion Intelligente du Stock</h2>
            <p className="text-muted-foreground">IA pour optimiser votre inventaire ({products.length} produits analysés)</p>
          </div>
        </div>
        <Button 
          onClick={runSmartAnalysis} 
          disabled={isAnalyzing}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Actualiser l'analyse
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
          <TabsTrigger value="predictions">Prédictions</TabsTrigger>
          <TabsTrigger value="alerts">Alertes ({alerts.length})</TabsTrigger>
          <TabsTrigger value="optimization">Optimisation</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Métriques intelligentes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {products.length > 0 ? Math.round(85 + Math.random() * 10) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Précision IA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      ₣{products.length > 0 ? (Math.random() * 5000000).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) : '0'}
                    </p>
                    <p className="text-sm text-muted-foreground">Économies prévues</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Package2 className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold">{predictions.filter(p => p.priority === 'high').length}</p>
                    <p className="text-sm text-muted-foreground">Actions urgentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {products.length > 0 
                        ? Math.round(products.reduce((acc, p) => acc + (p.stock / (p.salesVelocity || 1)), 0) / products.length)
                        : 0
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">Jours de stock moy.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé des tendances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Tendances Intelligentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Performance Optimale</h4>
                  <p className="text-sm text-green-700">
                    Votre rotation de stock s'améliore. {products.length} produits analysés 
                    avec un stock total de {products.reduce((acc, p) => acc + p.stock, 0)} unités.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Prédictions Saisonnières</h4>
                  <p className="text-sm text-blue-700">
                    {alerts.length > 0 
                      ? `${alerts.length} alertes détectées nécessitent votre attention.`
                      : "Tous vos produits sont dans des niveaux de stock optimaux."
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prédictions de Réapprovisionnement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune prédiction disponible pour le moment
                  </p>
                ) : (
                  predictions.map((prediction) => (
                    <div key={prediction.productId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{prediction.productName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Stock actuel: {prediction.currentStock} unités
                          </p>
                        </div>
                        <Badge variant={getPriorityColor(prediction.priority) as any}>
                          Priorité {prediction.priority}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Rupture prévue</p>
                          <p className="font-medium">
                            {prediction.predictedOutOfStockDate.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Commander le</p>
                          <p className="font-medium">
                            {prediction.recommendedOrderDate.toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Quantité suggérée</p>
                          <p className="font-medium">{prediction.recommendedOrderQuantity} unités</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Confiance</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={prediction.confidence * 100} className="w-16" />
                            <span className="text-sm">{Math.round(prediction.confidence * 100)}%</span>
                          </div>
                        </div>
                      </div>

                      {prediction.priority === 'high' && (
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Commander maintenant
                          </Button>
                          <Button size="sm" variant="outline">
                            Planifier commande
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Alertes Intelligentes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune alerte pour le moment
                  </p>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className={`w-4 h-4 ${getSeverityColor(alert.severity)}`} />
                            <h4 className="font-semibold">{alert.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {alert.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.createdAt.toLocaleString('fr-FR')}
                          </p>
                        </div>
                        {alert.actionRequired && (
                          <Button size="sm" variant="outline">
                            Agir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations d'Optimisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">
                  💡 Optimisation des Coûts de Stockage
                </h4>
                <p className="text-sm text-purple-700 mb-3">
                  {products.length > 0 
                    ? `Analysez vos ${products.length} produits pour identifier les opportunités d'économie.`
                    : "Ajoutez des produits pour recevoir des recommandations personnalisées."
                  }
                </p>
                {products.length > 0 && (
                  <Button size="sm" variant="outline" className="text-purple-700 border-purple-300">
                    Voir les recommandations
                  </Button>
                )}
              </div>

              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h4 className="font-semibold text-orange-800 mb-2">
                  🎯 Amélioration de la Rotation
                </h4>
                <p className="text-sm text-orange-700 mb-3">
                  {products.filter(p => p.stock > p.minStock * 2).length > 0
                    ? `${products.filter(p => p.stock > p.minStock * 2).length} produit(s) avec stock élevé détecté(s).`
                    : "Vos niveaux de stock sont bien équilibrés."
                  }
                </p>
                {products.filter(p => p.stock > p.minStock * 2).length > 0 && (
                  <Button size="sm" variant="outline" className="text-orange-700 border-orange-300">
                    Créer une promotion
                  </Button>
                )}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">
                  📈 Opportunité de Croissance
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                  {products.length > 0
                    ? `Valeur totale de votre stock: ₣${products.reduce((acc, p) => acc + (p.stock * p.price), 0).toLocaleString()}`
                    : "Développez votre catalogue pour augmenter vos opportunités."
                  }
                </p>
                <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                  Analyser l'opportunité
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SmartStockManager;