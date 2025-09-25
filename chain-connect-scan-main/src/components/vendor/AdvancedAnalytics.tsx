import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart,
  Package,
  DollarSign,
  Eye,
  Calendar,
  Filter,
  Download,
  Zap,
  Target,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  sales: {
    today: number;
    week: number;
    month: number;
    year: number;
  };
  orders: {
    pending: number;
    completed: number;
    cancelled: number;
    total: number;
  };
  products: {
    topSelling: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
    }>;
    lowStock: number;
    outOfStock: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    retention: number;
  };
}

const AdvancedAnalytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    sales: { today: 0, week: 0, month: 0, year: 0 },
    orders: { pending: 0, completed: 0, cancelled: 0, total: 0 },
    products: { topSelling: [], lowStock: 0, outOfStock: 0 },
    customers: { total: 0, new: 0, returning: 0, retention: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    // Simulation de données analytics premium
    setTimeout(() => {
      setAnalytics({
        sales: {
          today: 125000,
          week: 850000,
          month: 3200000,
          year: 25600000
        },
        orders: {
          pending: 12,
          completed: 156,
          cancelled: 8,
          total: 176
        },
        products: {
          topSelling: [
            { id: '1', name: 'Produit A', sales: 45, revenue: 1250000 },
            { id: '2', name: 'Produit B', sales: 32, revenue: 980000 },
            { id: '3', name: 'Produit C', sales: 28, revenue: 750000 },
            { id: '4', name: 'Produit D', sales: 22, revenue: 680000 },
            { id: '5', name: 'Produit E', sales: 18, revenue: 540000 }
          ],
          lowStock: 8,
          outOfStock: 3
        },
        customers: {
          total: 342,
          new: 28,
          returning: 89,
          retention: 78.5
        }
      });
      setLoading(false);
    }, 1000);
  };

  const getOrderCompletionRate = () => {
    const { completed, total } = analytics.orders;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getSalesForTimeRange = () => {
    const timeRangeMap: { [key: string]: keyof typeof analytics.sales } = {
      'day': 'today',
      'week': 'week', 
      'month': 'month',
      'year': 'year'
    };
    const salesKey = timeRangeMap[timeRange] || 'month';
    return analytics.sales[salesKey] || 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground animate-pulse mb-4" />
            <p>Chargement des analytics avancées...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics Avancées Premium
          </h2>
          <p className="text-muted-foreground">
            Analysez en détail les performances de votre boutique
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Période */}
      <Tabs value={timeRange} onValueChange={setTimeRange}>
        <TabsList>
          <TabsTrigger value="day">Aujourd'hui</TabsTrigger>
          <TabsTrigger value="week">Cette semaine</TabsTrigger>
          <TabsTrigger value="month">Ce mois</TabsTrigger>
          <TabsTrigger value="year">Cette année</TabsTrigger>
        </TabsList>

        <TabsContent value={timeRange} className="space-y-6">
          {/* KPIs principaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Ventes {timeRange === 'day' ? 'aujourd\'hui' : 'période'}</p>
                    <p className="text-2xl font-bold">
                      {getSalesForTimeRange().toLocaleString()} GNF
                    </p>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +12.5%
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Commandes</p>
                    <p className="text-2xl font-bold">{analytics.orders.total}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{getOrderCompletionRate()}% complétées</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Clients</p>
                    <p className="text-2xl font-bold">{analytics.customers.total}</p>
                    <div className="flex items-center text-sm text-green-600">
                      <span>+{analytics.customers.new} nouveaux</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Taux de rétention</p>
                    <p className="text-2xl font-bold">{analytics.customers.retention}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-orange-600 h-1 rounded-full" 
                        style={{ width: `${analytics.customers.retention}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques et analyses détaillées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top produits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produits les plus vendus
                </CardTitle>
                <CardDescription>
                  Analysez vos meilleures ventes par période
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.products.topSelling.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.sales} ventes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {product.revenue.toLocaleString()} GNF
                        </p>
                        <Progress 
                          value={(product.sales / analytics.products.topSelling[0].sales) * 100} 
                          className="w-20 h-2 mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* État des commandes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  État des commandes
                </CardTitle>
                <CardDescription>
                  Répartition de vos commandes par statut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span>Complétées</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{analytics.orders.completed}</span>
                      <Progress value={getOrderCompletionRate()} className="w-20 h-2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span>En attente</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{analytics.orders.pending}</span>
                      <Progress 
                        value={(analytics.orders.pending / analytics.orders.total) * 100} 
                        className="w-20 h-2" 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <span>Annulées</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{analytics.orders.cancelled}</span>
                      <Progress 
                        value={(analytics.orders.cancelled / analytics.orders.total) * 100} 
                        className="w-20 h-2" 
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span>Taux de conversion</span>
                    <span className="font-medium">{getOrderCompletionRate()}%</span>
                  </div>
                  <Progress value={getOrderCompletionRate()} className="mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertes stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Alertes de stock
              </CardTitle>
              <CardDescription>
                Surveillez vos niveaux de stock en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="font-medium">Rupture de stock</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{analytics.products.outOfStock}</p>
                  <p className="text-sm text-muted-foreground">produits épuisés</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="font-medium">Stock faible</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{analytics.products.lowStock}</p>
                  <p className="text-sm text-muted-foreground">produits en stock faible</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="font-medium">Stock normal</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.products.topSelling.length - analytics.products.lowStock - analytics.products.outOfStock}
                  </p>
                  <p className="text-sm text-muted-foreground">produits en stock normal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;