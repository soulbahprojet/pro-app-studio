import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { ScrollArea } from '../../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  Calendar,
  Download,
  Eye,
  Clock
} from 'lucide-react';

interface SalesReport {
  period: string;
  revenue: number;
  orders: number;
  items_sold: number;
  average_order: number;
  growth: number;
}

interface ProductReport {
  id: string;
  name: string;
  category: string;
  quantity_sold: number;
  revenue: number;
  profit_margin: number;
}

interface PaymentReport {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

export function POSReports() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [salesData, setSalesData] = useState<SalesReport[]>([]);
  const [productData, setProductData] = useState<ProductReport[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day');

  useEffect(() => {
    loadReportsData();
  }, [user, selectedPeriod]);

  const loadReportsData = async () => {
    try {
      // Simulation de données de rapport
      const mockSalesData: SalesReport[] = [
        {
          period: 'Aujourd\'hui',
          revenue: 2450000,
          orders: 18,
          items_sold: 35,
          average_order: 136111,
          growth: 12.5
        },
        {
          period: 'Cette semaine',
          revenue: 15750000,
          orders: 125,
          items_sold: 248,
          average_order: 126000,
          growth: 8.3
        },
        {
          period: 'Ce mois',
          revenue: 58900000,
          orders: 467,
          items_sold: 892,
          average_order: 126124,
          growth: 15.7
        }
      ];

      const mockProductData: ProductReport[] = [
        {
          id: '1',
          name: 'Samsung Galaxy A54',
          category: 'Téléphones',
          quantity_sold: 12,
          revenue: 18000000,
          profit_margin: 25.5
        },
        {
          id: '2',
          name: 'Chaussures Nike Air Max',
          category: 'Chaussures',
          quantity_sold: 8,
          revenue: 2800000,
          profit_margin: 35.2
        },
        {
          id: '3',
          name: 'Robe traditionnelle',
          category: 'Vêtements',
          quantity_sold: 15,
          revenue: 2700000,
          profit_margin: 45.8
        }
      ];

      const mockPaymentData: PaymentReport[] = [
        {
          method: 'Espèces',
          count: 85,
          amount: 32450000,
          percentage: 55.1
        },
        {
          method: 'Orange Money',
          count: 45,
          amount: 18750000,
          percentage: 31.8
        },
        {
          method: 'Moov Money',
          count: 20,
          amount: 6200000,
          percentage: 10.5
        },
        {
          method: 'Carte bancaire',
          count: 5,
          amount: 1500000,
          percentage: 2.6
        }
      ];

      setSalesData(mockSalesData);
      setProductData(mockProductData);
      setPaymentData(mockPaymentData);

    } catch (error) {
      console.error('Erreur chargement rapports:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rapports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type: string) => {
    toast({
      title: "Export en cours",
      description: `Génération du rapport ${type} en cours...`
    });
    
    // Simulation d'export
    setTimeout(() => {
      toast({
        title: "Rapport exporté",
        description: `Le rapport ${type} a été téléchargé`
      });
    }, 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des rapports...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres de période */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Rapports POS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedPeriod === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('day')}
            >
              Aujourd'hui
            </Button>
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('week')}
            >
              Cette semaine
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('month')}
            >
              Ce mois
            </Button>
            <Button
              variant={selectedPeriod === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('year')}
            >
              Cette année
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="export">Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {salesData.map((data, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        {data.period}
                      </h3>
                      <Badge variant={data.growth >= 0 ? "default" : "destructive"}>
                        {data.growth >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(data.growth)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-bold text-lg">
                          {data.revenue.toLocaleString()} GNF
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ShoppingCart className="w-3 h-3" />
                          {data.orders} commandes
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          {data.items_sold} articles
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Panier moyen: {data.average_order.toLocaleString()} GNF
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Graphique des ventes (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution des ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                  <p>Graphique des ventes</p>
                  <p className="text-sm">Fonctionnalité en développement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Performance des produits</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {productData.map(product => (
                    <Card key={product.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                          </div>
                          <Badge variant="secondary">
                            {product.profit_margin}% marge
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Package className="w-3 h-3" />
                              Vendus
                            </div>
                            <div className="font-bold">{product.quantity_sold}</div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="w-3 h-3" />
                              Revenus
                            </div>
                            <div className="font-bold">
                              {product.revenue.toLocaleString()} GNF
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <TrendingUp className="w-3 h-3" />
                              Prix moyen
                            </div>
                            <div className="font-bold">
                              {(product.revenue / product.quantity_sold).toLocaleString()} GNF
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des paiements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentData.map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-primary" />
                        <div>
                          <div className="font-medium">{payment.method}</div>
                          <div className="text-sm text-muted-foreground">
                            {payment.count} transactions
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-bold">
                          {payment.amount.toLocaleString()} GNF
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {payment.percentage}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heures de pointe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-2" />
                    <p>Analyse des heures de pointe</p>
                    <p className="text-sm">Fonctionnalité en développement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rapport des ventes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export détaillé de toutes les ventes avec produits et paiements
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => exportReport('ventes PDF')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportReport('ventes Excel')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Inventaire</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  État actuel du stock avec valorisation et mouvements
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => exportReport('inventaire PDF')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportReport('inventaire Excel')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Analyse financière</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Bilan comptable avec CA, marges et rentabilité
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => exportReport('financier PDF')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportReport('financier Excel')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
