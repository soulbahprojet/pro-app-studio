import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  ShoppingCart,
  DollarSign,
  Download,
  Users,
  Calendar,
  Package
} from 'lucide-react';

interface ShopAnalyticsProps {
  shopId: string;
}

interface AnalyticsData {
  totalProducts: number;
  totalRevenue: number;
  totalSales: number;
  analytics: any[];
  products: any[];
}

export function ShopAnalytics({ shopId }: ShopAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  useEffect(() => {
    loadAnalytics();
  }, [shopId, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('digital-store-management', {
        body: { 
          operation: 'get-shop-analytics',
          shop_id: shopId,
          period: selectedPeriod
        }
      });

      if (error) throw error;
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockMetrics = {
    views: 1247,
    conversionRate: 3.2,
    avgOrderValue: 35000,
    totalDownloads: 89,
    returnCustomers: 23,
    refundRate: 1.8,
    topProducts: [
      { name: 'Formation React Avancée', sales: 15, revenue: 750000 },
      { name: 'Guide Marketing Digital', sales: 12, revenue: 480000 },
      { name: 'Template Design Pro', sales: 8, revenue: 320000 }
    ],
    salesByDay: [
      { day: 'Lun', sales: 5, revenue: 175000 },
      { day: 'Mar', sales: 8, revenue: 280000 },
      { day: 'Mer', sales: 3, revenue: 105000 },
      { day: 'Jeu', sales: 12, revenue: 420000 },
      { day: 'Ven', sales: 15, revenue: 525000 },
      { day: 'Sam', sales: 7, revenue: 245000 },
      { day: 'Dim', sales: 4, revenue: 140000 }
    ]
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} GNF`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return <div className="animate-pulse">Chargement des analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analytics & Performance
          </h2>
          <p className="text-muted-foreground">
            Analysez les performances de votre boutique numérique
          </p>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
            <SelectItem value="365">1 an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vues totales</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +12% vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(mockMetrics.conversionRate)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +0.5% vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Panier moyen</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(mockMetrics.avgOrderValue)}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-500" />
              -2% vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Téléchargements</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.totalDownloads}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +8 cette semaine
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients récurrents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMetrics.returnCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage((mockMetrics.returnCustomers / (analyticsData?.totalSales || 1)) * 100)} du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de remboursement</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(mockMetrics.refundRate)}</div>
            <p className="text-xs text-muted-foreground">
              Très bon (objectif &lt; 5%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits actifs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 ce mois
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Ventes par jour</CardTitle>
            <CardDescription>
              Performance des 7 derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockMetrics.salesByDay.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">{day.day}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{day.sales} ventes</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(day.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produits les plus vendus</CardTitle>
            <CardDescription>
              Top 3 des meilleures performances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMetrics.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {product.sales} ventes
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatCurrency(product.revenue)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(product.revenue / product.sales)}/vente
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Insights et recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2">📈 Performance positive</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Taux de conversion en hausse de 12%</li>
                <li>• Nombre de vues en progression constante</li>
                <li>• Taux de remboursement très faible (1.8%)</li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">⚠️ Points d'amélioration</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Panier moyen en légère baisse (-2%)</li>
                <li>• Créer plus de codes promotionnels</li>
                <li>• Optimiser les descriptions de produits</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">💡 Suggestions d'actions</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Créer des bundles pour augmenter le panier moyen</li>
              <li>• Lancer une campagne email pour les clients inactifs</li>
              <li>• Ajouter des témoignages clients sur vos pages produits</li>
              <li>• Optimiser vos images avec l'IA pour plus d'engagement</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
