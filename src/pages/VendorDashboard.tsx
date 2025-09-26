import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Package, Users, BarChart3, Settings } from 'lucide-react';

export default function VendorDashboard() {
  const dashboardCards = [
    {
      title: "Mes Produits",
      icon: <Package className="h-6 w-6" />,
      description: "Gérer mon inventaire",
      link: "/vendor/products",
      count: "24 produits"
    },
    {
      title: "Clients",
      icon: <Users className="h-6 w-6" />,
      description: "Gérer ma clientèle",
      link: "/vendor/customers",
      count: "156 clients"
    },
    {
      title: "Statistiques",
      icon: <BarChart3 className="h-6 w-6" />,
      description: "Voir mes performances",
      link: "/vendor/analytics",
      count: "€2,450 ce mois"
    },
    {
      title: "Paramètres",
      icon: <Settings className="h-6 w-6" />,
      description: "Configuration du compte",
      link: "/vendor/settings",
      count: "Configuration"
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard Vendeur - 224Solutions</h1>
        <p className="text-gray-600">Gérez votre boutique et suivez vos performances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className="text-blue-600">{card.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{card.count}</div>
              <p className="text-xs text-gray-600 mb-4">{card.description}</p>
              <Link to={card.link}>
                <Button variant="outline" size="sm" className="w-full">
                  Accéder
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span>Nouvelle commande #1234</span>
                <span className="text-green-600 font-medium">€45.99</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span>Produit ajouté: Smartphone</span>
                <span className="text-blue-600">Nouveau</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Client inscrit: Marie Dubois</span>
                <span className="text-gray-500">Il y a 2h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}