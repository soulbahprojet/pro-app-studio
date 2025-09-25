import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Plus, Package, ShoppingCart, Users, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Ajouter un produit",
      icon: Plus,
      action: () => navigate("/vendor/products"),
      variant: "default" as const,
    },
    {
      title: "Gérer le stock",
      icon: Package,
      action: () => navigate("/vendor/inventory"),
      variant: "outline" as const,
    },
    {
      title: "Voir les commandes",
      icon: ShoppingCart,
      action: () => navigate("/vendor/orders"),
      variant: "outline" as const,
    },
    {
      title: "Clients",
      icon: Users,
      action: () => navigate("/vendor/customers"),
      variant: "outline" as const,
    },
    {
      title: "Créer une facture",
      icon: FileText,
      action: () => navigate("/vendor/invoices"),
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className="w-full justify-start gap-2"
            onClick={action.action}
          >
            <action.icon className="h-4 w-4" />
            {action.title}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};
