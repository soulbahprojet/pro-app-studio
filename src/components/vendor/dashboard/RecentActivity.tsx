import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { Clock } from "lucide-react";

export const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: "order",
      message: "Nouvelle commande #1234",
      time: "Il y a 5 min",
      status: "new",
    },
    {
      id: 2,
      type: "payment",
      message: "Paiement reçu - 500 000 GNF",
      time: "Il y a 15 min",
      status: "success",
    },
    {
      id: 3,
      type: "stock",
      message: "Stock faible: iPhone 15",
      time: "Il y a 30 min",
      status: "warning",
    },
    {
      id: 4,
      type: "customer",
      message: "Nouveau client: Marie Diallo",
      time: "Il y a 1h",
      status: "new",
    },
    {
      id: 5,
      type: "product",
      message: "Produit ajouté: Samsung Galaxy S24",
      time: "Il y a 2h",
      status: "success",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
              <Badge className={getStatusColor(activity.status)}>
                {activity.status === "new" && "Nouveau"}
                {activity.status === "success" && "Succès"}
                {activity.status === "warning" && "Attention"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
