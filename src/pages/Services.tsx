import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Package, Clock, MapPin } from 'lucide-react';

export default function Services() {
  const services = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Transport & Livraison",
      description: "Services de transport rapide et fiable",
      features: ["Livraison express", "Suivi en temps réel", "Assurance incluse"]
    },
    {
      icon: <Package className="h-8 w-8" />,
      title: "Logistique",
      description: "Solutions logistiques complètes",
      features: ["Entreposage", "Distribution", "Gestion des stocks"]
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Express",
      description: "Livraison en moins de 2h",
      features: ["Service 24/7", "Livraison urgente", "Confirmation instantanée"]
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Géolocalisation",
      description: "Suivi GPS en temps réel",
      features: ["Tracking live", "Notifications", "Historique des trajets"]
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Nos Services - 224Solutions</h1>
        <p className="text-lg text-gray-600">
          Découvrez notre gamme complète de services de transport et logistique
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="text-blue-600">{service.icon}</div>
                <CardTitle>{service.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <ul className="space-y-2 mb-4">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full">Commander ce service</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}