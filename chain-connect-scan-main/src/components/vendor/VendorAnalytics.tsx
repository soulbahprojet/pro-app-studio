import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, TrendingUp, TrendingDown, Eye, Users, ShoppingCart, 
  DollarSign, Package, Star, Download, Calendar, Globe, Smartphone
} from "lucide-react";
import { toast } from "sonner";

const VendorAnalytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [currency, setCurrency] = useState("GNF");

  // Données analytics fictives
  const analyticsData = {
    overview: {
      totalSales: "3,247,890 GNF",
      salesChange: "+23.5%",
      totalOrders: 456,
      ordersChange: "+18.2%",
      avgOrderValue: "71,226 GNF",
      avgChange: "+5.1%",
      conversionRate: "4.8%",
      conversionChange: "+0.3%"
    },
    topProducts: [
      { name: "iPhone 15 Pro Max", sales: 89, revenue: "106,800,000 GNF", views: 2340, rating: 4.8 },
      { name: "MacBook Air M2", sales: 45, revenue: "83,250,000 GNF", views: 1890, rating: 4.9 },
      { name: "Samsung Galaxy S24", sales: 67, revenue: "73,700,000 GNF", views: 2120, rating: 4.7 },
      { name: "iPad Air 10.9", sales: 34, revenue: "30,600,000 GNF", views: 1560, rating: 4.6 },
      { name: "AirPods Pro 2", sales: 156, revenue: "31,200,000 GNF", views: 3450, rating: 4.8 }
    ],
    salesByCategory: [
      { category: "Électronique", sales: "1,850,000 GNF", percentage: 57, orders: 234 },
      { category: "Accessoires", sales: "890,000 GNF", percentage: 27, orders: 189 },
      { category: "Audio", sales: "345,000 GNF", percentage: 11, orders: 98 },
      { category: "Gaming", sales: "162,890 GNF", percentage: 5, orders: 45 }
    ],
    trafficSources: [
      { source: "Recherche directe", visitors: 3240, percentage: 45, conversions: 156 },
      { source: "Marketplace", visitors: 2890, percentage: 40, conversions: 145 },
      { source: "Réseaux sociaux", visitors: 780, percentage: 11, conversions: 23 },
      { source: "Email", visitors: 290, percentage: 4, conversions: 18 }
    ],
    customerInsights: {
      newCustomers: 89,
      returningCustomers: 167,
      averageSessionTime: "4m 32s",
      bounceRate: "32.1%",
      topRegions: [
        { region: "Conakry", customers: 234, percentage: 62 },
        { region: "Kankan", customers: 89, percentage: 24 },
        { region: "Labé", customers: 34, percentage: 9 },
        { region: "Boké", customers: 19, percentage: 5 }
      ]
    },
    performance: {
      pageViews: 12450,
      uniqueVisitors: 3890,
      sessionDuration: "4m 32s",
      pagesPerSession: 2.8,
      mobileTraffic: 78,
      desktopTraffic: 22
    }
  };

  const exportData = (format: string) => {
    toast.success(`Export ${format} en cours...`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics & Rapports</h2>
          <p className="text-muted-foreground">Analysez les performances de votre boutique</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportData('PDF')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportData('CSV')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Ventes Totales</span>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.totalSales}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analyticsData.overview.salesChange} vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Commandes</span>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.totalOrders}</div>
            <p className="text-xs text-blue-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analyticsData.overview.ordersChange} vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Panier Moyen</span>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.avgOrderValue}</div>
            <p className="text-xs text-purple-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analyticsData.overview.avgChange} vs période précédente
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Taux Conversion</span>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{analyticsData.overview.conversionRate}</div>
            <p className="text-xs text-orange-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {analyticsData.overview.conversionChange} vs période précédente
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Produits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Produits les plus vendus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <span>{product.sales} ventes</span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {product.views}
                        </span>
                        <span className="flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {product.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ventes par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ventes par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.salesByCategory.map((cat, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{cat.category}</span>
                    <div className="text-right">
                      <p className="font-bold text-sm">{cat.sales}</p>
                      <p className="text-xs text-muted-foreground">{cat.orders} commandes</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={cat.percentage} className="flex-1" />
                    <span className="text-xs text-muted-foreground min-w-[40px]">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sources de trafic */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Sources de trafic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{source.source}</p>
                    <p className="text-xs text-muted-foreground">{source.conversions} conversions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{source.visitors.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{source.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights clients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Insights clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{analyticsData.customerInsights.newCustomers}</p>
                <p className="text-sm text-muted-foreground">Nouveaux clients</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{analyticsData.customerInsights.returningCustomers}</p>
                <p className="text-sm text-muted-foreground">Clients fidèles</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Répartition géographique</h4>
              {analyticsData.customerInsights.topRegions.map((region, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{region.region}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{region.customers}</span>
                    <Badge variant="outline" className="text-xs">{region.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance technique */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance & Audience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pages vues</p>
                <p className="text-xl font-bold">{analyticsData.performance.pageViews.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visiteurs uniques</p>
                <p className="text-xl font-bold">{analyticsData.performance.uniqueVisitors.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durée session</p>
                <p className="text-xl font-bold">{analyticsData.performance.sessionDuration}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pages/session</p>
                <p className="text-xl font-bold">{analyticsData.performance.pagesPerSession}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-3">Répartition du trafic</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Mobile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={analyticsData.performance.mobileTraffic} className="w-20" />
                    <span className="text-sm font-medium">{analyticsData.performance.mobileTraffic}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Desktop</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={analyticsData.performance.desktopTraffic} className="w-20" />
                    <span className="text-sm font-medium">{analyticsData.performance.desktopTraffic}%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommandations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recommandations d'amélioration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900">Optimiser les conversions</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Votre taux de conversion peut être amélioré en optimisant les descriptions produits et images.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Package className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900">Diversifier l'offre</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Ajoutez plus de produits dans les catégories performantes pour augmenter les ventes.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900">Fidéliser les clients</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Mettez en place un programme de fidélité pour augmenter les achats répétés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorAnalytics;