import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DollarSign, TrendingUp, TrendingDown, ShoppingCart, Package, 
  AlertTriangle, Clock, CheckCircle, Eye, Users, Zap, Store 
} from "lucide-react";
import { toast } from "sonner";

const VendorDashboardKPI = () => {
  const { profile } = useAuth();
  const [timeRange, setTimeRange] = useState("today");

  // KPI fictifs - à remplacer par des vraies données de l'API
  const kpiData = {
    today: {
      revenue: "125,430 GNF",
      revenueChange: "+12.3%",
      orders: 18,
      ordersChange: "+5",
      pendingOrders: 7,
      processingOrders: 4,
      shippedOrders: 12,
      lowStockItems: 3,
      walletBalance: "2,847,650 GNF",
      conversionRate: "3.4%"
    },
    week: {
      revenue: "890,250 GNF",
      revenueChange: "+18.7%",
      orders: 124,
      ordersChange: "+23",
      pendingOrders: 7,
      processingOrders: 15,
      shippedOrders: 89,
      lowStockItems: 8,
      walletBalance: "2,847,650 GNF",
      conversionRate: "4.1%"
    },
    month: {
      revenue: "3,247,890 GNF",
      revenueChange: "+25.4%",
      orders: 456,
      ordersChange: "+92",
      pendingOrders: 7,
      processingOrders: 15,
      shippedOrders: 389,
      lowStockItems: 12,
      walletBalance: "2,847,650 GNF",
      conversionRate: "4.8%"
    }
  };

  const currentData = kpiData[timeRange as keyof typeof kpiData];

  // Fil d'activités récentes
  const recentActivities = [
    { type: "order", message: "Nouvelle commande #ORD-2024-001", amount: "+45,000 GNF", time: "Il y a 5 min", icon: ShoppingCart, color: "text-green-600" },
    { type: "payment", message: "Paiement reçu", amount: "+125,000 GNF", time: "Il y a 12 min", icon: DollarSign, color: "text-green-600" },
    { type: "stock", message: "Stock faible: iPhone 15 Pro", amount: "3 restants", time: "Il y a 20 min", icon: AlertTriangle, color: "text-orange-600" },
    { type: "shipped", message: "Commande #ORD-2024-000 expédiée", amount: "", time: "Il y a 30 min", icon: CheckCircle, color: "text-blue-600" },
    { type: "withdrawal", message: "Retrait effectué", amount: "-500,000 GNF", time: "Il y a 1h", icon: TrendingDown, color: "text-red-600" }
  ];

  const alerts = [
    { type: "warning", message: "3 produits en stock faible", action: "Gérer le stock", urgent: true },
    { type: "info", message: "Nouveau message client", action: "Répondre", urgent: false },
    { type: "success", message: "KYC vérifié avec succès", action: "Voir détails", urgent: false }
  ];

  return (
    <div className="space-y-6">
      {/* Sélecteur de période */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Dashboard Vendeur</h2>
        <div className="flex space-x-2">
          {[
            { key: "today", label: "Aujourd'hui" },
            { key: "week", label: "7 jours" },
            { key: "month", label: "30 jours" }
          ].map((range) => (
            <Button
              key={range.key}
              variant={timeRange === range.key ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range.key)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre d'affaires */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Chiffre d'affaires</span>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{currentData.revenue}</div>
            <p className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {currentData.revenueChange} vs période précédente
            </p>
          </CardContent>
        </Card>

        {/* Commandes */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Commandes</span>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{currentData.orders}</div>
            <p className="text-xs text-blue-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              {currentData.ordersChange} nouvelles commandes
            </p>
          </CardContent>
        </Card>

        {/* Solde Wallet */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Solde disponible</span>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{currentData.walletBalance}</div>
            <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
              Retirer
            </Button>
          </CardContent>
        </Card>

        {/* Taux de conversion */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Taux conversion</span>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{currentData.conversionRate}</div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{width: currentData.conversionRate}}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes importantes */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Alertes importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${alert.urgent ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
                <Button size="sm" variant="outline">
                  {alert.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Statuts des commandes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statuts des commandes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">En attente</span>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {currentData.pendingOrders}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">En préparation</span>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {currentData.processingOrders}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Expédiées</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {currentData.shippedOrders}
              </Badge>
            </div>
            {currentData.lowStockItems > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Stock faible</span>
                </div>
                <Badge variant="destructive">
                  {currentData.lowStockItems}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fil d'activités */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activités récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 hover:bg-accent/50 rounded-lg transition-colors">
                  <activity.icon className={`h-4 w-4 mt-0.5 ${activity.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <span className={`text-sm font-semibold ${activity.color}`}>
                      {activity.amount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboardKPI;