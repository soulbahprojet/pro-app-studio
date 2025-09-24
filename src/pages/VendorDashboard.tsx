import React from "react";
import { VendorLayout } from "@/components/vendor/VendorLayout";
import { VendorDashboardStats } from "@/components/vendor/dashboard/VendorDashboardStats";
import { QuickActions } from "@/components/vendor/dashboard/QuickActions";
import { RecentActivity } from "@/components/vendor/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Package } from "lucide-react";

const VendorDashboard = () => {
  return (
    <VendorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
          <div className="text-sm text-muted-foreground">
            Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>

        <VendorDashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Évolution des ventes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Graphique des ventes (à intégrer avec recharts)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Produits les plus vendus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "iPhone 15 Pro", sales: 45, revenue: "45 000 000 GNF" },
                    { name: "Samsung Galaxy S24", sales: 32, revenue: "28 800 000 GNF" },
                    { name: "MacBook Air M3", sales: 18, revenue: "27 000 000 GNF" },
                  ].map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} ventes</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{product.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </VendorLayout>
  );
};

export default VendorDashboard;