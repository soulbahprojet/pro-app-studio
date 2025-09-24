import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, AlertTriangle } from "lucide-react";

export const VendorDashboardStats = () => {
  const stats = [
    {
      title: "Chiffre d'affaires",
      value: "125 000 000 GNF",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Commandes",
      value: "1,234",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Clients",
      value: "856",
      change: "+15.3%",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Produits",
      value: "342",
      change: "+3.1%",
      icon: Package,
      color: "text-indigo-600",
    },
    {
      title: "Stock faible",
      value: "23",
      change: "-5.2%",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
    {
      title: "Bénéfices",
      value: "45 000 000 GNF",
      change: "+18.7%",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <p className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change} depuis le mois dernier
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};