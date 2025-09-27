import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function ClientHome() {
  const { user } = useAuth();

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Bienvenue sur 224Solutions</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Votre plateforme de services et marketplace en ligne
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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