import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Store,
  ShoppingBag,
  Utensils,
  Scissors,
  Briefcase,
  Calendar,
  GraduationCap,
  Heart,
  Hammer,
  Car,
  Sprout,
  Gamepad2,
  Shirt,
  Wrench,
  Package,
  MapPin,
  Clock,
  Globe,
  ArrowRight,
  CheckCircle,
  X,
  Navigation
} from 'lucide-react';

interface ShopType {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  features: string[];
  examples: string[];
}

const shopTypes: ShopType[] = [
  {
    id: 'physical-products',
    title: 'Produits physiques',
    subtitle: 'Vêtements, accessoires, électronique',
    description: 'Vendez des produits tangibles avec gestion complète du stock',
    icon: ShoppingBag,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    features: ['Gestion du stock', 'Photos produits', 'Variantes', 'Livraison'],
    examples: ['Vêtements', 'Électronique', 'Bijoux', 'Accessoires']
  },
  {
    id: 'digital-services',
    title: 'Boutique numérique',
    subtitle: 'E-books, logiciels, formations',
    description: 'Services et produits numériques téléchargeables',
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    features: ['Téléchargements', 'Licences', 'Accès limité', 'Streaming'],
    examples: ['E-books', 'Logiciels', 'Cours en ligne', 'Templates']
  },
  {
    id: 'restaurant',
    title: 'Restaurant / Livraison',
    subtitle: 'Plats, livraison, menu en ligne',
    description: 'Service de restauration avec commande et livraison',
    icon: Utensils,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    features: ['Menu digital', 'Commandes', 'Livraison', 'Réservations'],
    examples: ['Restaurant', 'Fast-food', 'Traiteur', 'Pâtisserie']
  },
  {
    id: 'beauty-salon',
    title: 'Salon beauté / esthétique',
    subtitle: 'Coiffure, manucure, soins',
    description: 'Services de beauté avec système de réservation',
    icon: Scissors,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    features: ['Réservations', 'Calendrier', 'Services', 'Produits beauté'],
    examples: ['Coiffure', 'Manucure', 'Maquillage', 'Massage']
  },
  {
    id: 'professional-services',
    title: 'Services professionnels',
    subtitle: 'Freelance, consultance, coaching',
    description: 'Services professionnels et consultation',
    icon: Briefcase,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    features: ['Consultation', 'Rendez-vous', 'Projets', 'Facturation'],
    examples: ['Consulting', 'Design', 'Marketing', 'Développement']
  },
  {
    id: 'events',
    title: 'Événementiel / Location',
    subtitle: 'Organisation, location de matériel',
    description: 'Organisation d\'événements et location d\'équipements',
    icon: Calendar,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    features: ['Calendrier', 'Réservations', 'Matériel', 'Devis'],
    examples: ['Mariages', 'Anniversaires', 'Matériel sono', 'Décoration']
  },
  {
    id: 'education',
    title: 'Éducation / Formations',
    subtitle: 'Cours, ateliers, coaching',
    description: 'Services éducatifs et formation professionnelle',
    icon: GraduationCap,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    features: ['Cours', 'Calendrier', 'Certifications', 'Ressources'],
    examples: ['Cours particuliers', 'Formations', 'Ateliers', 'Coaching']
  },
  {
    id: 'health-wellness',
    title: 'Santé / Bien-être',
    subtitle: 'Fitness, yoga, nutrition',
    description: 'Services de santé et de bien-être',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    features: ['Planning', 'Suivi', 'Programmes', 'Consultations'],
    examples: ['Fitness', 'Yoga', 'Nutrition', 'Physiothérapie']
  },
  {
    id: 'artisanal',
    title: 'Artisanat / Création',
    subtitle: 'Bijoux, décoration, fait main',
    description: 'Créations artisanales et produits uniques',
    icon: Hammer,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    features: ['Créations uniques', 'Sur mesure', 'Galerie', 'Commandes'],
    examples: ['Bijoux', 'Poterie', 'Décoration', 'Sculpture']
  },
  {
    id: 'transport',
    title: 'Transport / Mobilité',
    subtitle: 'Taxi, location, livraison',
    description: 'Services de transport et mobilité',
    icon: Car,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    features: ['Réservations', 'Géolocalisation', 'Tarifs', 'Suivi'],
    examples: ['Taxi', 'VTC', 'Location auto', 'Livraison']
  },
  {
    id: 'agriculture',
    title: 'Agriculture / Produits frais',
    subtitle: 'Ferme, fruits, légumes locaux',
    description: 'Produits agricoles et alimentation locale',
    icon: Sprout,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    features: ['Produits frais', 'Saisonnalité', 'Local', 'Livraison'],
    examples: ['Fruits', 'Légumes', 'Produits fermier', 'Bio']
  },
  {
    id: 'entertainment',
    title: 'Divertissement / Loisirs',
    subtitle: 'Cinéma, jeux, animation',
    description: 'Services de divertissement et loisirs',
    icon: Gamepad2,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    features: ['Réservations', 'Événements', 'Billeterie', 'Activités'],
    examples: ['Cinéma', 'Escape game', 'Animation', 'Spectacles']
  },
  {
    id: 'fashion-specialized',
    title: 'Mode spécialisée',
    subtitle: 'Chaussures, sacs, créateurs',
    description: 'Mode et accessoires spécialisés',
    icon: Shirt,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    features: ['Collections', 'Tailles', 'Couleurs', 'Tendances'],
    examples: ['Chaussures', 'Sacs', 'Lunettes', 'Montres']
  },
  {
    id: 'home-services',
    title: 'Services à domicile',
    subtitle: 'Plomberie, électricité, ménage',
    description: 'Services techniques et domestiques à domicile',
    icon: Wrench,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    features: ['Interventions', 'Devis', 'Urgences', 'Maintenance'],
    examples: ['Plomberie', 'Électricité', 'Ménage', 'Jardinage']
  },
  {
    id: 'mixed',
    title: 'Boutique mixte',
    subtitle: 'Combinaison d\'activités',
    description: 'Plusieurs types d\'activités combinées',
    icon: Store,
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    features: ['Multi-activités', 'Flexibilité', 'Diversification', 'Adaptation'],
    examples: ['Commerce général', 'Multi-services', 'Concept store', 'Hybride']
  }
];

interface ProfessionalShopCreationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProfessionalShopCreation({ isOpen, onClose, onSuccess }: ProfessionalShopCreationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState('type-selection');
  const [selectedType, setSelectedType] = useState<ShopType | null>(null);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [shopData, setShopData] = useState({
    shop_name: '',
    description: '',
    address: '',
    phone: '',
    email: user?.email || '',
    business_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true }
    }
  });

  const handleTypeSelect = (type: ShopType) => {
    setSelectedType(type);
    setCurrentStep('shop-details');
  };

  const handleBackToTypes = () => {
    setCurrentStep('type-selection');
    setSelectedType(null);
  };

  // Fonction pour obtenir la position géographique
  const getCurrentLocation = async () => {
    setGettingLocation(true);
    
    try {
      // Vérifier si la géolocalisation est supportée
      if (!navigator.geolocation) {
        throw new Error('La géolocalisation n\'est pas supportée par ce navigateur');
      }

      // Demander l'autorisation et obtenir la position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Utiliser l'API de géocodage inversé pour obtenir l'adresse
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoidGVzdCIsImEiOiJjbDkxc3V6dTIwMWVqM3ZxbzVzN2d0NjBuIn0.dummy_token&types=address&limit=1&language=fr`
      );

      if (!response.ok) {
        // Fallback vers une API gratuite si Mapbox échoue
        const osmResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=fr`
        );
        
        if (osmResponse.ok) {
          const osmData = await osmResponse.json();
          const address = osmData.display_name || `${latitude}, ${longitude}`;
          setShopData(prev => ({ ...prev, address }));
          
          toast({
            title: "Position détectée",
            description: "Votre adresse a été remplie automatiquement"
          });
        } else {
          throw new Error('Impossible d\'obtenir l\'adresse');
        }
      } else {
        const data = await response.json();
        const feature = data.features?.[0];
        
        if (feature) {
          const address = feature.place_name || `${latitude}, ${longitude}`;
          setShopData(prev => ({ ...prev, address }));
          
          toast({
            title: "Position détectée",
            description: "Votre adresse a été remplie automatiquement"
          });
        } else {
          // Utiliser les coordonnées comme fallback
          setShopData(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
          
          toast({
            title: "Position détectée",
            description: "Coordonnées ajoutées, vous pouvez préciser l'adresse"
          });
        }
      }
      
    } catch (error: any) {
      let errorMessage = 'Impossible d\'obtenir votre position';
      
      if (error.code === 1) {
        errorMessage = 'Autorisation de géolocalisation refusée';
      } else if (error.code === 2) {
        errorMessage = 'Position non disponible';
      } else if (error.code === 3) {
        errorMessage = 'Délai d\'attente dépassé';
      }
      
      toast({
        title: "Erreur de géolocalisation",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setGettingLocation(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const createProfessionalShop = async () => {
    if (!user || !selectedType) return;
    
    if (!shopData.shop_name.trim() || !shopData.address.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom et l'adresse de la boutique sont requis",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Créer la boutique avec le type sélectionné
      const { data: shop, error: shopError } = await supabase
        .from('seller_shops')
        .insert({
          seller_id: user.id,
          shop_name: shopData.shop_name,
          description: shopData.description,
          slug: generateSlug(shopData.shop_name),
          subscription_plan: 'basic',
          is_active: true,
          business_hours: shopData.business_hours,
          business_type: selectedType.id,
          contact_email: shopData.email,
          contact_phone: shopData.phone,
          business_address: shopData.address,
          shop_category: selectedType.title
        })
        .select()
        .single();

      if (shopError) throw shopError;

      // Mettre à jour le profil utilisateur pour refléter le type d'activité
      await supabase
        .from('profiles')
        .update({
          role: 'seller',
          business_type: selectedType.id,
          address: shopData.address,
          phone: shopData.phone
        })
        .eq('user_id', user.id);

      toast({
        title: "Boutique professionnelle créée !",
        description: `Votre ${selectedType.title.toLowerCase()} "${shopData.shop_name}" est maintenant en ligne`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur création boutique:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la boutique",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Store className="h-6 w-6 text-primary" />
            Créer une boutique professionnelle
          </DialogTitle>
        </DialogHeader>

        {currentStep === 'type-selection' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Choisissez le type d'activité qui correspond le mieux à votre entreprise
              </p>
              <Badge variant="outline" className="text-xs">
                Vous pourrez modifier ces paramètres plus tard
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shopTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <Card 
                    key={type.id}
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => handleTypeSelect(type)}
                  >
                    <CardHeader className="pb-3">
                      <div className={`w-12 h-12 rounded-lg ${type.bgColor} flex items-center justify-center mb-3`}>
                        <IconComponent className={`h-6 w-6 ${type.color}`} />
                      </div>
                      <CardTitle className="text-lg">{type.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{type.subtitle}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">{type.description}</p>
                      
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Fonctionnalités :</p>
                        <div className="flex flex-wrap gap-1">
                          {type.features.slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-gray-700 mb-1">Exemples :</p>
                        <p className="text-xs text-muted-foreground">
                          {type.examples.join(', ')}
                        </p>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full mt-3 text-primary hover:bg-primary/10"
                      >
                        Sélectionner <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {currentStep === 'shop-details' && selectedType && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToTypes}
              >
                ← Retour aux types
              </Button>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${selectedType.bgColor} flex items-center justify-center`}>
                  <selectedType.icon className={`h-4 w-4 ${selectedType.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedType.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedType.subtitle}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Informations de base</h4>
                
                <div>
                  <Label htmlFor="shop_name">Nom de la boutique *</Label>
                  <Input
                    id="shop_name"
                    value={shopData.shop_name}
                    onChange={(e) => setShopData({...shopData, shop_name: e.target.value})}
                    placeholder="Ma Super Boutique"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={shopData.description}
                    onChange={(e) => setShopData({...shopData, description: e.target.value})}
                    placeholder="Décrivez votre activité..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Adresse complète *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="address"
                      value={shopData.address}
                      onChange={(e) => setShopData({...shopData, address: e.target.value})}
                      placeholder="Adresse complète avec ville et pays..."
                      className="pl-10"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">
                      Cette adresse sera visible par vos clients pour vous localiser
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="text-xs"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      {gettingLocation ? 'Localisation...' : 'Ma position'}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={shopData.phone}
                      onChange={(e) => setShopData({...shopData, phone: e.target.value})}
                      placeholder="+224 XXX XXX XXX"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shopData.email}
                      onChange={(e) => setShopData({...shopData, email: e.target.value})}
                      placeholder="contact@maboutique.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horaires d'ouverture
                </h4>
                
                <div className="space-y-3">
                  {Object.entries(shopData.business_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-3">
                      <div className="w-20 text-sm font-medium capitalize">
                        {day === 'monday' ? 'Lundi' : 
                         day === 'tuesday' ? 'Mardi' : 
                         day === 'wednesday' ? 'Mercredi' : 
                         day === 'thursday' ? 'Jeudi' : 
                         day === 'friday' ? 'Vendredi' : 
                         day === 'saturday' ? 'Samedi' : 'Dimanche'}
                      </div>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => setShopData({
                            ...shopData,
                            business_hours: {
                              ...shopData.business_hours,
                              [day]: { ...hours, closed: !e.target.checked }
                            }
                          })}
                        />
                        <span className="text-sm">Ouvert</span>
                      </label>
                      
                      {!hours.closed && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => setShopData({
                              ...shopData,
                              business_hours: {
                                ...shopData.business_hours,
                                [day]: { ...hours, open: e.target.value }
                              }
                            })}
                            className="w-20 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">à</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => setShopData({
                              ...shopData,
                              business_hours: {
                                ...shopData.business_hours,
                                [day]: { ...hours, close: e.target.value }
                              }
                            })}
                            className="w-20 text-sm"
                          />
                        </div>
                      )}
                      
                      {hours.closed && (
                        <span className="text-sm text-muted-foreground">Fermé</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                Fonctionnalités incluses avec {selectedType.title}
              </h5>
              <div className="grid grid-cols-2 gap-2">
                {selectedType.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                onClick={createProfessionalShop} 
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? 'Création...' : 'Créer ma boutique'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ProfessionalShopCreation;
