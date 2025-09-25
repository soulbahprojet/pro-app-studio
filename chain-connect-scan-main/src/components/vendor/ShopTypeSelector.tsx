import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Code, 
  UtensilsCrossed, 
  Scissors,
  Monitor,
  Store,
  Sparkles,
  Zap,
  ShoppingCart,
  Calculator,
  Star
} from 'lucide-react';

interface ShopType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
  recommended?: boolean;
  new?: boolean;
}

interface ShopTypeSelectorProps {
  onSelectShopType: (shopType: string) => void;
  selectedType?: string;
}

const SHOP_TYPES: ShopType[] = [
  {
    id: 'digital-boutique',
    name: 'Boutique numérique',
    description: 'E-commerce complet avec dropshipping et fonctionnalités Shopify',
    icon: <Code className="h-6 w-6" />,
    color: 'from-purple-500 to-purple-600',
    features: [
      'E-commerce complet type Shopify',
      'Système de dropshipping intégré',
      'Paiements sécurisés multi-devises',
      'Analytics avancées et reporting',
      'Marketing automation intégré'
    ],
    recommended: true,
    new: true
  },
  {
    id: 'mixed-boutique',
    name: 'Boutique mix',
    description: 'Combinaison produits physiques et numériques',
    icon: <Store className="h-6 w-6" />,
    color: 'from-indigo-500 to-indigo-600',
    features: [
      'Gestion produits physiques et numériques',
      'Multi-transporteurs intégrés',
      'Checkout unifié mixte',
      'Catégories multiples'
    ]
  },
  {
    id: 'fashion-accessories',
    name: 'Mode & accessoires',
    description: 'Boutique spécialisée mode avec variantes et tailles',
    icon: <Scissors className="h-6 w-6" />,
    color: 'from-pink-500 to-pink-600',
    features: [
      'Gestion tailles, couleurs, variantes',
      'Galerie images avec zoom',
      'Promotions et soldes',
      'Système d\'avis clients'
    ]
  },
  {
    id: 'beauty-cosmetics',
    name: 'Cosmétiques & beauté',
    description: 'Produits de beauté avec dates d\'expiration et lots',
    icon: <Sparkles className="h-6 w-6" />,
    color: 'from-rose-500 to-rose-600',
    features: [
      'Gestion dates expiration/lots',
      'Packs et bundles produits',
      'Conseils beauté personnalisés',
      'Notifications nouveautés'
    ]
  },
  {
    id: 'food-supermarket',
    name: 'Alimentation & supermarché',
    description: 'Supermarché avec POS et livraison programmée',
    icon: <ShoppingCart className="h-6 w-6" />,
    color: 'from-green-500 to-green-600',
    features: [
      'POS tactile moderne',
      'Gestion poids, volume, péremption',
      'Livraison programmable',
      'Coupons et promotions'
    ],
    recommended: true
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Solution complète restaurant avec réservations',
    icon: <UtensilsCrossed className="h-6 w-6" />,
    color: 'from-orange-500 to-orange-600',
    features: [
      'Menu CRUD avec modifiers',
      'Réservations en ligne',
      'Suivi commandes temps réel',
      'Statuts de préparation'
    ]
  },
  {
    id: 'artisan-handmade',
    name: 'Artisanat & fait-main',
    description: 'Créations artisanales avec séries limitées',
    icon: <Package className="h-6 w-6" />,
    color: 'from-amber-500 to-amber-600',
    features: [
      'Badge "fait main" authentique',
      'Séries limitées et variantes',
      'Images multiples et vidéos',
      'Événements spéciaux'
    ]
  },
  {
    id: 'professional-services',
    name: 'Services professionnels',
    description: 'Consultations et prestations professionnelles',
    icon: <Calculator className="h-6 w-6" />,
    color: 'from-blue-500 to-blue-600',
    features: [
      'Calendrier de réservation',
      'Paiement avant/après prestation',
      'Gestion missions et forfaits',
      'Facturation automatisée'
    ]
  },
  {
    id: 'health-wellness',
    name: 'Santé & bien-être',
    description: 'Services de santé avec rendez-vous sécurisés',
    icon: <Star className="h-6 w-6" />,
    color: 'from-emerald-500 to-emerald-600',
    features: [
      'Calendrier médical sécurisé',
      'Paiement sécurisé santé',
      'Notifications SMS/email',
      'Dossiers clients confidentiels'
    ]
  },
  {
    id: 'electronics-tech',
    name: 'Électronique & téléphonie',
    description: 'Produits tech avec garanties et SAV',
    icon: <Monitor className="h-6 w-6" />,
    color: 'from-slate-500 to-slate-600',
    features: [
      'Variantes techniques complexes',
      'Gestion garanties et SAV',
      'Bundles et accessoires',
      'Comparatifs produits'
    ]
  },
  {
    id: 'plumbing-electrical',
    name: 'Plomberie & électricité',
    description: 'Services techniques avec interventions',
    icon: <Zap className="h-6 w-6" />,
    color: 'from-yellow-500 to-yellow-600',
    features: [
      'Planning interventions',
      'Facturation forfait/heure',
      'Devis automatisés',
      'Suivi sécurité chantier'
    ]
  },
  {
    id: 'transport-logistics',
    name: 'Transport & logistique',
    description: 'Services transport avec suivi GPS',
    icon: <Package className="h-6 w-6" />,
    color: 'from-violet-500 to-violet-600',
    features: [
      'Réservation courses/livraisons',
      'Suivi GPS temps réel',
      'Facturation automatique',
      'Interface transporteur/client'
    ]
  },
  {
    id: 'education-online',
    name: 'Formation & cours en ligne',
    description: 'Plateforme e-learning complète',
    icon: <Star className="h-6 w-6" />,
    color: 'from-cyan-500 to-cyan-600',
    features: [
      'Cours vidéo et documents',
      'Suivi progression élèves',
      'Quiz et certifications',
      'Paiement cours/abonnement'
    ]
  },
  {
    id: 'real-estate',
    name: 'Immobilier',
    description: 'Annonces immobilières avec visites',
    icon: <Store className="h-6 w-6" />,
    color: 'from-stone-500 to-stone-600',
    features: [
      'CRUD annonces immobilières',
      'Galerie photos/vidéos/plans',
      'Réservation visites',
      'Paiement acomptes'
    ]
  },
  {
    id: 'events-entertainment',
    name: 'Événements & divertissements',
    description: 'Billetterie et organisation d\'événements',
    icon: <Star className="h-6 w-6" />,
    color: 'from-fuchsia-500 to-fuchsia-600',
    features: [
      'Billetterie en ligne',
      'Gestion places et quotas',
      'Tickets électroniques QR',
      'Dashboard organisateur'
    ]
  },
  {
    id: 'mixed-shop',
    name: 'Boutique mix (complète)',
    description: 'Solution hybride produits/services numériques et physiques',
    icon: <Package className="h-6 w-6" />,
    color: 'from-gradient-primary',
    features: [
      'Gestion multi-catégorie avancée',
      'Paiement unifié intelligent',
      'Listing automatique marketplace',
      'Analytics cross-channel'
    ]
  }
];

export default function ShopTypeSelector({ onSelectShopType, selectedType }: ShopTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Choisissez le type de votre boutique</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Sélectionnez le type qui correspond le mieux à votre activité. 
          Chaque type propose des fonctionnalités spécialement adaptées à vos besoins.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOP_TYPES.map((shopType) => (
          <Card
            key={shopType.id}
            className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${
              selectedType === shopType.id
                ? 'ring-2 ring-primary shadow-lg scale-105'
                : hoveredType === shopType.id
                ? 'shadow-lg scale-102'
                : 'hover:shadow-md'
            }`}
            onMouseEnter={() => setHoveredType(shopType.id)}
            onMouseLeave={() => setHoveredType(null)}
            onClick={() => onSelectShopType(shopType.id)}
          >
            {/* Gradient de fond */}
            <div className={`absolute inset-0 bg-gradient-to-br ${shopType.color} opacity-5`} />
            
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${shopType.color} text-white shadow-lg`}>
                  {shopType.icon}
                </div>
                <div className="flex gap-1">
                  {shopType.recommended && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      <Star className="h-3 w-3 mr-1" />
                      Recommandé
                    </Badge>
                  )}
                  {shopType.new && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Zap className="h-3 w-3 mr-1" />
                      Nouveau
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardTitle className="text-xl">{shopType.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{shopType.description}</p>
            </CardHeader>

            <CardContent className="relative">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Fonctionnalités incluses
                </h4>
                <ul className="space-y-2">
                  {shopType.features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className={`w-full mt-4 ${
                  selectedType === shopType.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectShopType(shopType.id);
                }}
              >
                {selectedType === shopType.id ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Sélectionné
                  </>
                ) : (
                  <>
                    <Store className="h-4 w-4 mr-2" />
                    Sélectionner
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Section spéciale pour le POS Supermarché */}
      {selectedType === 'supermarket-pos' && (
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Monitor className="h-5 w-5" />
              POS Supermarché - Interface moderne
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-green-600">
              Vous avez choisi notre système POS le plus avancé ! Cette interface reproduit 
              l'expérience des caisses de supermarché modernes comme celles d'Odoo.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">Interface de caisse</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Écran tactile optimisé</li>
                  <li>• Affichage temps réel des totaux</li>
                  <li>• Gestion des remises et promotions</li>
                  <li>• Interface vendeur intuitive</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-green-700">Fonctionnalités avancées</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Scanner codes-barres intégré</li>
                  <li>• Paiements multiples simultanés</li>
                  <li>• Impression tickets automatique</li>
                  <li>• Synchronisation stock temps réel</li>
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
              <Calculator className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                Parfait pour : supermarchés, magasins, boutiques physiques, points de vente
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}