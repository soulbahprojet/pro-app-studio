import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  MapPin, 
  Phone, 
  Mail,
  Search,
  Filter,
  Bike,
  Truck,
  Store,
  Map,
  Package,
  Utensils,
  Scissors,
  Briefcase,
  Calendar,
  GraduationCap,
  Heart,
  Hammer,
  Car,
  Home
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  type: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  description?: string;
  distance?: number;
  business_address?: string;
  contact_phone?: string;
  contact_email?: string;
  shop_category?: string;
  business_type?: string;
  image_url?: string;
}

const navigateToService = (service: Service) => {
  // Navigation vers les services selon le type
  switch (service.type) {
    case 'motard':
    case 'livreur':
      window.location.href = '/taxi-moto';
      break;
    case 'restaurant':
      window.location.href = '/marketplace?category=restaurant';
      break;
    case 'boutique':
    case 'physical-products':
      window.location.href = '/marketplace';
      break;
    case 'digital-services':
      window.location.href = '/digital-store';
      break;
    case 'beauty-salon':
      window.location.href = '/marketplace?category=beauty-salon';
      break;
    case 'professional-services':
      window.location.href = '/services';
      break;
    case 'real-estate':
      window.location.href = '/marketplace?category=real-estate';
      break;
    case 'automotive':
      window.location.href = '/marketplace?category=automotive';
      break;
    case 'health-wellness':
      window.location.href = '/marketplace?category=health-wellness';
      break;
    case 'events':
      window.location.href = '/marketplace?category=events';
      break;
    case 'education':
      window.location.href = '/marketplace?category=education';
      break;
    case 'artisanal':
      window.location.href = '/marketplace?category=artisanal';
      break;
    case 'home-services':
      window.location.href = '/marketplace?category=home-services';
      break;
    default:
      window.location.href = '/marketplace';
  }
};

const getServiceIcon = (type: string) => {
  switch (type) {
    case 'motard': return Bike;
    case 'livreur': return Truck;
    case 'boutique': return Store;
    case 'physical-products': return Store;
    case 'digital-services': return Package;
    case 'restaurant': return Utensils;
    case 'beauty-salon': return Scissors;
    case 'professional-services': return Briefcase;
    case 'events': return Calendar;
    case 'education': return GraduationCap;
    case 'health-wellness': return Heart;
    case 'artisanal': return Hammer;
    case 'automotive': return Car;
    case 'real-estate': return Home;
    case 'home-services': return Home;
    default: return Map;
  }
};

const getServiceColor = (type: string) => {
  switch (type) {
    case 'motard': return 'bg-blue-500';
    case 'livreur': return 'bg-green-500';
    case 'boutique': return 'bg-purple-500';
    case 'physical-products': return 'bg-blue-500';
    case 'digital-services': return 'bg-purple-500';
    case 'restaurant': return 'bg-orange-500';
    case 'beauty-salon': return 'bg-pink-500';
    case 'professional-services': return 'bg-indigo-500';
    case 'events': return 'bg-teal-500';
    case 'education': return 'bg-green-500';
    case 'health-wellness': return 'bg-red-500';
    case 'artisanal': return 'bg-amber-500';
    case 'automotive': return 'bg-gray-500';
    case 'real-estate': return 'bg-slate-500';
    case 'home-services': return 'bg-emerald-500';
    default: return 'bg-gray-500';
  }
};

const NearbyServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  // Types de services prédéfinis + dynamiques basés sur les données
  const predefinedTypes = [
    { value: "all", label: "Tous", icon: Map },
    { value: "motard", label: "Motard", icon: Bike },
    { value: "livreur", label: "Livreur", icon: Truck },
    { value: "boutique", label: "Boutique", icon: Store },
    { value: "physical-products", label: "Produits", icon: Store },
    { value: "digital-services", label: "Services", icon: Package },
    { value: "restaurant", label: "Restaurant", icon: Utensils },
    { value: "beauty-salon", label: "Salon", icon: Scissors },
    { value: "professional-services", label: "Pro", icon: Briefcase }
  ];

  const dynamicTypes = Array.from(new Set(services.map(s => s.type)))
    .filter(type => type && type !== 'all' && !predefinedTypes.find(p => p.value === type))
    .map(type => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
      icon: getServiceIcon(type)
    }));

  const serviceTypes = [...predefinedTypes, ...dynamicTypes];

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Impossible d'obtenir votre position");
        }
      );
    }
  };

  const fetchServices = async () => {
    try {
      // Récupérer les services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*, image_url')
        .eq('is_active', true)
        .eq('country', profile?.country || 'GN');

      if (servicesError) throw servicesError;

      // Récupérer les boutiques
      const { data: shopsData, error: shopsError } = await supabase
        .from('seller_shops')
        .select(`
          id,
          seller_id,
          shop_name,
          description,
          business_address,
          contact_phone,
          contact_email,
          shop_category,
          business_type,
          is_active
        `)
        .eq('is_active', true);

      if (shopsError) throw shopsError;

      // Récupérer les profils des vendeurs pour filtrer par pays
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, country')
        .eq('country', profile?.country || 'Guinea');

      if (profilesError) throw profilesError;

      // Créer un set des IDs des vendeurs du même pays
      const sellerIds = new Set(profilesData?.map(p => p.user_id) || []);

      // Combiner les services et boutiques
      let allServices: Service[] = [];

      // Ajouter les services
      if (servicesData) {
        allServices = allServices.concat(
          servicesData.map(service => ({
            id: service.id,
            name: service.name,
            type: service.type,
            country: service.country,
            latitude: service.latitude,
            longitude: service.longitude,
            phone: service.phone,
            email: service.email,
            description: service.description,
            image_url: service.image_url,
            distance: userLocation && service.latitude && service.longitude 
              ? calculateDistance(userLocation.lat, userLocation.lng, service.latitude, service.longitude)
              : undefined
          }))
        );
      }

      // Ajouter les boutiques du même pays
      if (shopsData) {
        const filteredShops = shopsData.filter(shop => sellerIds.has(shop.seller_id));
        
        allServices = allServices.concat(
          filteredShops.map(shop => ({
            id: shop.id,
            name: shop.shop_name,
            type: shop.business_type || shop.shop_category || 'boutique',
            country: profile?.country || 'Guinea',
            phone: shop.contact_phone,
            email: shop.contact_email,
            description: shop.description,
            business_address: shop.business_address,
            shop_category: shop.shop_category,
            business_type: shop.business_type,
            distance: undefined // On ne peut pas calculer sans coordonnées GPS
          }))
        );
      }
      
      // Trier par distance si disponible
      if (userLocation) {
        allServices.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      }

      setServices(allServices);
      setFilteredServices(allServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error("Erreur lors du chargement des services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (profile?.country) {
      fetchServices();
    }
  }, [profile?.country, userLocation]);

  useEffect(() => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(service => service.type === selectedType);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, selectedType]);

  const contactService = (service: Service) => {
    const phone = service.phone || service.contact_phone;
    const email = service.email || service.contact_email;
    
    if (phone) {
      window.open(`tel:${phone}`, '_blank');
    } else if (email) {
      window.open(`mailto:${email}`, '_blank');
    } else {
      toast.info("Aucun contact disponible pour ce service");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link to="/marketplace">
              <Button size="icon" variant="outline">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Services à proximité</h1>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Types de services */}
          <div className="grid grid-cols-3 gap-3">
            {serviceTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                size="lg"
                onClick={() => setSelectedType(type.value)}
                className={`
                  relative h-20 px-3 py-2 flex flex-col items-center justify-center gap-2 
                  transition-all duration-300 ease-out group overflow-hidden
                  ${selectedType === type.value 
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg scale-105 border-primary' 
                    : 'hover:shadow-md hover:scale-105 hover:bg-accent/50 hover:border-primary/30'
                  }
                `}
              >
                <div className={`
                  relative p-2 rounded-full transition-all duration-300
                  ${selectedType === type.value 
                    ? 'bg-white/20 shadow-inner' 
                    : 'group-hover:bg-primary/10 group-hover:scale-110'
                  }
                `}>
                  <type.icon className={`
                    w-6 h-6 transition-all duration-300
                    ${selectedType === type.value 
                      ? 'text-white drop-shadow-sm animate-pulse' 
                      : 'text-muted-foreground group-hover:text-primary group-hover:scale-110'
                    }
                  `} />
                </div>
                <span className={`
                  text-xs font-medium leading-tight text-center transition-all duration-300
                  ${selectedType === type.value 
                    ? 'text-white' 
                    : 'group-hover:text-foreground group-hover:font-semibold'
                  }
                `}>
                  {type.label}
                </span>
                
                {/* Effet de brillance pour les boutons actifs */}
                {selectedType === type.value && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[slide-in-right_2s_ease-in-out_infinite] pointer-events-none" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {filteredServices.length} service{filteredServices.length > 1 ? 's' : ''} trouvé{filteredServices.length > 1 ? 's' : ''}
          </h2>
          <Badge variant="outline" className="text-xs">
            {profile?.country || 'Guinea'}
          </Badge>
        </div>

        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Aucun service trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos filtres ou votre recherche
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {filteredServices.map((service, index) => {
              const ServiceIcon = getServiceIcon(service.type);
              
              return (
                <Card 
                  key={service.id} 
                  className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:scale-[1.02] border-border hover:border-primary/30 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigateToService(service)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Image du service */}
                      <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl">
                        {service.image_url ? (
                          <img 
                            src={service.image_url} 
                            alt={service.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              // Fallback vers l'icône si l'image ne se charge pas
                              const target = e.target as HTMLImageElement;
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `
                                  <div class="w-full h-full bg-gradient-to-br ${getServiceColor(service.type)} flex items-center justify-center rounded-2xl">
                                    <div class="text-white text-2xl">🎯</div>
                                  </div>
                                `;
                              }
                            }}
                          />
                        ) : (
                          <div className={`
                            w-full h-full bg-gradient-to-br ${getServiceColor(service.type)} 
                            flex items-center justify-center rounded-2xl relative
                          `}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                            <ServiceIcon className="h-10 w-10 text-white drop-shadow-md relative z-10" />
                          </div>
                        )}
                        
                        {/* Badge du type de service */}
                        <div className="absolute top-1 right-1 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          <ServiceIcon className="h-3 w-3" />
                        </div>
                        
                        {/* Effet de brillance au hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 group-hover:animate-[slide-in-right_1s_ease-out]" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                              {service.name}
                            </h3>
                            <Badge 
                              variant="secondary" 
                              className="text-xs capitalize mt-1 bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20 transition-colors duration-300"
                            >
                              {service.type.replace('-', ' ')}
                            </Badge>
                          </div>
                          {service.distance && (
                            <div className="text-right bg-primary/5 px-3 py-2 rounded-full border border-primary/20">
                              <p className="text-sm font-bold text-primary">
                                {service.distance.toFixed(1)} km
                              </p>
                              <p className="text-xs text-muted-foreground">distance</p>
                            </div>
                          )}
                        </div>
                        
                        {service.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                            {service.description}
                          </p>
                        )}
                        
                        {service.business_address && (
                          <div className="flex items-center gap-2 mb-3 p-2 bg-accent/50 rounded-lg">
                            <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                            <p className="text-sm text-foreground font-medium">
                              {service.business_address}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            {service.country === 'GN' ? 'Guinée' : service.country}
                          </div>
                          
                          <div className="flex gap-2">
                            {(service.phone || service.contact_phone) && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  contactService(service);
                                }}
                                className="text-xs hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105 group/btn"
                              >
                                <Phone className="h-3 w-3 mr-2 group-hover/btn:animate-pulse" />
                                Appeler
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToService(service);
                              }}
                              className="text-xs bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                            >
                              Voir plus
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyServices;