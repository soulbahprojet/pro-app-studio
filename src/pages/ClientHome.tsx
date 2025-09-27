import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ClientHome() {
  const { user } = useAuth();

  return (
    <div className="w-full space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Bienvenue sur 224Solutions
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Votre écosystème digital complet : Marketplace, Transport, Livraison et Services professionnels
        </p>
        <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Plus de 10 000 produits</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Livraison 24h</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Support 24/7</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>🛒 Marketplace</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Découvrez nos produits et services</p>
            <Link to="/marketplace">
              <Button className="w-full">Accéder au Marketplace</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>🚚 Services de Livraison</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Services de transport et livraison</p>
            <Link to="/services">
              <Button className="w-full">Voir les Services</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>👤 Mon Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Gérez votre compte et préférences</p>
            <Link to="/profile">
              <Button className="w-full">Mon Profil</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {user && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Bienvenue, {user.email}!</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Vous êtes connecté avec succès à 224Solutions.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}