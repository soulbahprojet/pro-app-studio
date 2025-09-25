import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Package, DollarSign, ShoppingCart, TrendingUp, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type KPI = {
  key: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  color: string;
};

type Product = {
  id: string;
  name: string;
  stock_quantity: number;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
};

export default function SellerDashboard() {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }

      // Fetch orders for KPIs
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, currency, status')
        .eq('seller_id', user?.id);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      // Calculate KPIs
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(p => p.is_active)?.length || 0;
      const totalOrders = ordersData?.length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => 
        order.status === 'delivered' ? sum + (order.total_amount || 0) : sum, 0) || 0;

      setKpis([
        {
          key: "Produits Total",
          value: totalProducts.toString(),
          change: `${activeProducts} actifs`,
          icon: <Package className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          key: "Commandes",
          value: totalOrders.toString(),
          change: "Total",
          icon: <ShoppingCart className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          key: "Chiffre d'Affaires",
          value: `${totalRevenue.toLocaleString()} GNF`,
          change: "Total",
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-purple-600"
        },
        {
          key: "Performance",
          value: `${((activeProducts / Math.max(totalProducts, 1)) * 100).toFixed(1)}%`,
          change: "Produits actifs",
          icon: <TrendingUp className="h-4 w-4" />,
          color: "text-orange-600"
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Vendeur</h1>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Produit
        </Button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.key} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.key}
              </CardTitle>
              <div className={kpi.color}>
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.change && (
                <p className="text-xs text-muted-foreground mt-1">
                  {kpi.change}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produits Récents
          </CardTitle>
          <CardDescription>
            Vos derniers produits ajoutés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun produit trouvé</p>
              <p className="text-sm">Commencez par ajouter votre premier produit</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{product.name}</h3>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {product.price.toLocaleString()} {product.currency} • {product.stock_quantity} en stock
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Éditer
                    </Button>
                    <Button variant="outline" size="sm">
                      Stock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
