import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Heart,
  Store,
  Package,
  MapPin,
  Star,
  ShoppingCart,
  Trash2,
  Grid3X3,
  List
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FavoriteItem {
  id: string;
  item_type: 'product' | 'shop' | 'service';
  item_id: string;
  created_at: string;
  // Item details (populated from respective tables)
  name: string;
  image?: string;
  price?: number;
  currency?: string;
  description?: string;
  rating?: number;
  seller_name?: string;
  location?: string;
}

const ClientFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const filterTypes = [
    { value: "all", label: "Tous", icon: Heart },
    { value: "product", label: "Produits", icon: Package },
    { value: "shop", label: "Boutiques", icon: Store },
    { value: "service", label: "Services", icon: MapPin }
  ];

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Mock data for now since we don't have full item details
      const mockFavorites: FavoriteItem[] = [
        {
          id: '1',
          item_type: 'product',
          item_id: 'prod1',
          created_at: new Date().toISOString(),
          name: 'Samsung Galaxy A54',
          image: '/placeholder.svg',
          price: 850000,
          currency: 'GNF',
          description: 'Smartphone Android avec triple caméra',
          rating: 4.5,
          seller_name: 'TechStore Conakry',
          location: 'Conakry, Guinea'
        },
        {
          id: '2',
          item_type: 'shop',
          item_id: 'shop1',
          created_at: new Date().toISOString(),
          name: 'Mode Africaine',
          image: '/placeholder.svg',
          description: 'Vêtements traditionnels et modernes',
          rating: 4.8,
          location: 'Kankan, Guinea'
        },
        {
          id: '3',
          item_type: 'product',
          item_id: 'prod2',
          created_at: new Date().toISOString(),
          name: 'Robe Africaine Traditionnelle',
          image: '/placeholder.svg',
          price: 120000,
          currency: 'GNF',
          description: 'Robe en wax authentique',
          rating: 4.9,
          seller_name: 'Mode Africaine',
          location: 'Kankan, Guinea'
        },
        {
          id: '4',
          item_type: 'service',
          item_id: 'serv1',
          created_at: new Date().toISOString(),
          name: 'Livraison Express Conakry',
          description: 'Service de livraison rapide en ville',
          rating: 4.7,
          location: 'Conakry, Guinea'
        }
      ];

      setFavorites(mockFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error("Erreur lors du chargement des favoris");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user!.id);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      toast.success("Retiré des favoris");
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const filteredFavorites = selectedType === "all" 
    ? favorites 
    : favorites.filter(fav => fav.item_type === selectedType);

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'product': return Package;
      case 'shop': return Store;
      case 'service': return MapPin;
      default: return Heart;
    }
  };

  const getItemColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-blue-500';
      case 'shop': return 'bg-purple-500';
      case 'service': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des favoris...</p>
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
            <Link to="/profile">
              <Button size="icon" variant="outline">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Mes favoris</h1>
            <div className="ml-auto flex gap-2">
              <Button
                size="icon"
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterTypes.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedType === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(filter.value)}
                className="whitespace-nowrap"
              >
                <filter.icon className="h-4 w-4 mr-1" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Favorites */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            {filteredFavorites.length} favori{filteredFavorites.length > 1 ? 's' : ''}
          </h2>
          <Badge variant="outline" className="text-xs">
            {selectedType === "all" ? "Tous types" : filterTypes.find(f => f.value === selectedType)?.label}
          </Badge>
        </div>

        {filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                {favorites.length === 0 ? "Aucun favori" : "Aucun résultat"}
              </h3>
              <p className="text-muted-foreground">
                {favorites.length === 0 
                  ? "Ajoutez des produits, boutiques ou services à vos favoris"
                  : "Aucun favori ne correspond à ce filtre"
                }
              </p>
              {favorites.length === 0 && (
                <Link to="/marketplace">
                  <Button className="mt-4">
                    Explorer le marketplace
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
            {filteredFavorites.map((favorite) => {
              const ItemIcon = getItemIcon(favorite.item_type);
              
              if (viewMode === 'list') {
                return (
                  <Card key={favorite.id} className="hover:shadow-md transition-smooth">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 ${getItemColor(favorite.item_type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <ItemIcon className="h-8 w-8 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {favorite.name}
                            </h3>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeFavorite(favorite.id)}
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Badge variant="secondary" className="text-xs capitalize mb-2">
                            {favorite.item_type === 'product' ? 'Produit' : 
                             favorite.item_type === 'shop' ? 'Boutique' : 'Service'}
                          </Badge>
                          
                          {favorite.description && (
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {favorite.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              {favorite.price && (
                                <p className="text-lg font-bold text-primary">
                                  {favorite.price.toLocaleString()} {favorite.currency}
                                </p>
                              )}
                              
                              {favorite.rating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-accent text-accent" />
                                  <span className="text-xs text-muted-foreground">{favorite.rating}</span>
                                </div>
                              )}
                              
                              {favorite.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">{favorite.location}</span>
                                </div>
                              )}
                            </div>
                            
                            {favorite.item_type === 'product' && (
                              <Button size="sm" variant="default">
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Acheter
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              }

              // Grid view
              return (
                <Card key={favorite.id} className="hover:shadow-md transition-smooth">
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <div className={`aspect-square ${getItemColor(favorite.item_type)} rounded-lg flex items-center justify-center`}>
                        <ItemIcon className="h-8 w-8 text-white" />
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => removeFavorite(favorite.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-background/80 backdrop-blur-sm text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <Badge variant="secondary" className="text-xs capitalize mb-2">
                      {favorite.item_type === 'product' ? 'Produit' : 
                       favorite.item_type === 'shop' ? 'Boutique' : 'Service'}
                    </Badge>
                    
                    <h3 className="font-semibold text-sm mb-1 text-foreground line-clamp-2">
                      {favorite.name}
                    </h3>
                    
                    {favorite.rating && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="h-3 w-3 fill-accent text-accent" />
                        <span className="text-xs text-muted-foreground">{favorite.rating}</span>
                      </div>
                    )}
                    
                    {favorite.price && (
                      <p className="text-sm font-bold text-primary mb-2">
                        {favorite.price.toLocaleString()} {favorite.currency}
                      </p>
                    )}
                    
                    {favorite.item_type === 'product' && (
                      <Button size="sm" variant="default" className="w-full text-xs">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Acheter
                      </Button>
                    )}
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

export default ClientFavorites;