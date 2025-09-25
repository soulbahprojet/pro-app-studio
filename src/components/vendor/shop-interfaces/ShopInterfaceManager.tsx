import React from 'react';
import PhysicalProductsInterface from './PhysicalProductsInterface';
import DigitalServicesInterface from './DigitalServicesInterface';
import RestaurantInterface from './RestaurantInterface';
import BeautySalonInterface from './BeautySalonInterface';
import SupermarketPOS from '../SupermarketPOS';
import DigitalBoutiqueInterface from './DigitalBoutiqueInterface';
import MixedBoutiqueInterface from './MixedBoutiqueInterface';
import FashionAccessoriesInterface from './FashionAccessoriesInterface';
import BeautyCosmeticsInterface from './BeautyCosmeticsInterface';
import FoodSupemarketInterface from './FoodSupemarketInterface';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Store, Settings, Plus, Monitor } from 'lucide-react';

interface ShopInterfaceManagerProps {
  shopType: string;
  shopId: string;
  shopName: string;
  onNavigateToProducts?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToSettings?: () => void;
}

export default function ShopInterfaceManager({ 
  shopType, 
  shopId, 
  shopName,
  onNavigateToProducts,
  onNavigateToOrders,
  onNavigateToSettings
}: ShopInterfaceManagerProps) {
  
  const renderShopInterface = () => {
    const commonProps = {
      shopId,
      onAddProduct: onNavigateToProducts || (() => {}),
      onManageOrders: onNavigateToOrders || (() => {}),
      onManageInventory: onNavigateToProducts || (() => {}),
    };

    switch (shopType) {
      case 'digital-boutique':
        return <DigitalBoutiqueInterface {...commonProps} />;
      
      case 'mixed-boutique':
      case 'mixed-shop':
        return <MixedBoutiqueInterface {...commonProps} />;
      
      case 'fashion-accessories':
        return <FashionAccessoriesInterface {...commonProps} />;
        
      case 'beauty-cosmetics':
        return <BeautyCosmeticsInterface {...commonProps} />;
        
      case 'food-supermarket':
        return <FoodSupemarketInterface {...commonProps} />;
      
      case 'physical-products':
        return (
          <PhysicalProductsInterface 
            {...commonProps}
            onManageInventory={() => onNavigateToProducts?.()}
          />
        );
      
      case 'supermarket-pos':
        return <SupermarketPOS />;
      
      case 'digital-services':
        return (
          <DigitalServicesInterface 
            {...commonProps}
          />
        );
      
      case 'restaurant':
        return (
          <RestaurantInterface 
            {...commonProps}
          />
        );
      
      case 'beauty-salon':
        return (
          <BeautySalonInterface 
            {...commonProps}
          />
        );
      
      case 'professional-services':
        return <ProfessionalServicesInterface {...commonProps} />;
      
      case 'events':
        return <EventsInterface {...commonProps} />;
      
      case 'education':
        return <EducationInterface {...commonProps} />;
      
      case 'health-wellness':
        return <HealthWellnessInterface {...commonProps} />;
      
      case 'artisanal':
        return <ArtisanalInterface {...commonProps} />;
      
      case 'transport':
        return <TransportInterface {...commonProps} />;
      
      case 'agriculture':
        return <AgricultureInterface {...commonProps} />;
      
      case 'entertainment':
        return <EntertainmentInterface {...commonProps} />;
      
      case 'fashion-specialized':
        return <FashionInterface {...commonProps} />;
      
      case 'home-services':
        return <HomeServicesInterface {...commonProps} />;
      
      case 'mixed':
        return <MixedShopInterface {...commonProps} />;
      
      default:
        return <DefaultShopInterface {...commonProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête de la boutique spécialisée */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{shopName}</h2>
                <Badge variant="outline" className="mt-1">
                  {getShopTypeDisplayName(shopType)}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={onNavigateToSettings}>
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Interface spécialisée */}
      {renderShopInterface()}
    </div>
  );
}

// Composants temporaires pour les autres types de boutiques
const ProfessionalServicesInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Services professionnels - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface spécialisée pour les services professionnels avec consultation, 
        rendez-vous, projets et facturation.
      </p>
    </CardContent>
  </Card>
);

const EventsInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Événementiel - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface pour l'organisation d'événements avec billetterie QR code, 
        calendrier et gestion de disponibilité.
      </p>
    </CardContent>
  </Card>
);

const EducationInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Éducation - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface pour l'éducation avec cours vidéo, progression et certificats automatiques.
      </p>
    </CardContent>
  </Card>
);

const HealthWellnessInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Santé/Bien-être - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface pour la santé avec réservation créneaux, paiement et consultation visio.
      </p>
    </CardContent>
  </Card>
);

const ArtisanalInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Artisanat - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface pour l'artisanat avec commandes personnalisées, badge "fait main" et livraison.
      </p>
    </CardContent>
  </Card>
);

const TransportInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Transport - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface pour le transport avec GPS temps réel, paiement au km et suivi course.
      </p>
    </CardContent>
  </Card>
);

const AgricultureInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Agriculture - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface pour l'agriculture avec origine producteur, stock quotidien et abonnement paniers.
      </p>
    </CardContent>
  </Card>
);

const EntertainmentInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Divertissement - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface pour le divertissement avec tickets numériques QR code et calendrier.
      </p>
    </CardContent>
  </Card>
);

const FashionInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Mode spécialisée - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface pour la mode avec filtres tailles/couleurs, gestion stock et livraison.
      </p>
    </CardContent>
  </Card>
);

const HomeServicesInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Services à domicile - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface pour services à domicile avec géolocalisation, agenda et paiement.
      </p>
    </CardContent>
  </Card>
);

const MixedShopInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Boutique mixte - Interface en développement</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface mixte avec gestion multi-catégorie, paiement unifié et listing auto marketplace.
      </p>
    </CardContent>
  </Card>
);

const DefaultShopInterface = ({ shopId }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Interface générique</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">
        Interface de base pour la gestion de boutique.
      </p>
    </CardContent>
  </Card>
);

function getShopTypeDisplayName(type: string) {
  const typeMap: { [key: string]: string } = {
    'physical-products': 'Produits physiques',
    'supermarket-pos': 'POS Supermarché',
    'digital-services': 'Services numériques',
    'restaurant': 'Restaurant/Livraison',
    'beauty-salon': 'Salon de beauté',
    'professional-services': 'Services professionnels',
    'events': 'Événementiel',
    'education': 'Éducation/Formation',
    'health-wellness': 'Santé/Bien-être',
    'artisanal': 'Artisanat',
    'transport': 'Transport',
    'agriculture': 'Agriculture',
    'entertainment': 'Divertissement',
    'fashion-specialized': 'Mode spécialisée',
    'home-services': 'Services à domicile',
    'mixed': 'Boutique mixte'
  };
  return typeMap[type] || type;
}
