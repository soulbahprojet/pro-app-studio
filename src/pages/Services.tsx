import React from 'react';
import LogisticsServiceButtons from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowLeft, MapPin, Truck, Navigation, Users, Search, MessageCircle, Wallet, ShoppingBag } from 'lucide-react';

const Services = () => {
  const navigate = useNavigate();
  
  const services = [
    {
      id: 'delivery-tracking',
      title: 'Suivi de Livraison',
      description: 'Suivez vos commandes en temps réel avec géolocalisation GPS',
      icon: Truck,
      link: '/tracking',
      color: 'bg-blue-500',
      features: ['GPS en temps réel', 'Notifications push', 'Historique complet']
    },
    {
      id: 'geolocation',
      title: 'Géolocalisation & Proximité',
      description: 'Trouvez les services et commerces près de vous',
      icon: MapPin,
      link: '/nearby-services',
      color: 'bg-green-500',
      features: ['Services locaux', 'Calcul de distance', 'Filtrage par type']
    },
    {
      id: 'realtime-tracking',
      title: 'Tracking GPS Avancé',
      description: 'Système de tracking professionnel pour livreurs',
      icon: Navigation,
      link: '/gps-tracker',
      color: 'bg-purple-500',
      features: ['Mode livreur', 'Précision GPS', 'Partage position']
    },
    {
      id: 'marketplace',
      title: 'Place de Marché',
      description: 'Achetez et vendez des produits en ligne',
      icon: ShoppingBag,
      link: '/marketplace',
      color: 'bg-orange-500',
      features: ['Catalogue produits', 'Paiement sécurisé', 'Avis clients']
    },
    {
      id: 'messaging',
      title: 'Messagerie Unifiée',
      description: 'Communiquez avec marchands et livreurs',
      icon: MessageCircle,
      link: '/messages',
      color: 'bg-pink-500',
      features: ['Chat temps réel', 'Historique messages', 'Notifications']
    },
    {
      id: 'wallet',
      title: 'Portefeuille Digital',
      description: 'Gérez vos paiements et transactions',
      icon: Wallet,
      link: '/wallet',
      color: 'bg-indigo-500',
      features: ['Paiements sécurisés', 'Historique transactions', 'Rechargement']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary-foreground hover:bg-white/20"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Nos Services</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Découvrez tous les services disponibles sur 224SOLUTIONS - 
              De la livraison à la géolocalisation, tout pour simplifier votre quotidien
            </p>
          </div>
        </div>

        {/* Services Logistiques */}
        <div className="bg-accent/5 py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">Services Logistiques Disponibles</h2>
            <p className="text-muted-foreground">Accédez rapidement aux services de transport et livraison</p>
          </div>
          <LogisticsServiceButtons />
        </div>
      </header>

      {/* Services Grid */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <Card key={service.id} className="hover:shadow-elegant transition-all duration-300 border-border/60 hover:border-primary/30">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 ${service.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center">
                  <div className="mb-6">
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      {service.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Link to={service.link}>
                    <Button className="w-full" size="lg">
                      Accéder au Service
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-8">Pourquoi Choisir 224SOLUTIONS ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <p className="text-muted-foreground">Service disponible</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100%</div>
              <p className="text-muted-foreground">Sécurisé</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1000+</div>
              <p className="text-muted-foreground">Utilisateurs satisfaits</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Services;
