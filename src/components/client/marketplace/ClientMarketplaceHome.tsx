import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Search,
  Filter,
  Star,
  MapPin,
  TrendingUp,
  Package,
  Sparkles,
  Clock,
  Store,
  ShoppingBag,
  Utensils,
  Briefcase,
  Car,
  Heart
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  images: string[];
  seller_id: string;
  category: string;
  is_featured: boolean;
  seller?: {
    shop_name: string;
    business_address: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  count: number;
}

const categories: Category[] = [
  { id: 'electronics', name: 'Électronique', icon: Package, color: 'bg-blue-100 text-blue-600', count: 0 },
  { id: 'fashion', name: 'Mode & Style', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600', count: 0 },
  { id: 'food', name: 'Alimentation', icon: Utensils, color: 'bg-green-100 text-green-600', count: 0 },
  { id: 'services', name: 'Services', icon: Briefcase, color: 'bg-purple-100 text-purple-600', count: 0 },
  { id: 'transport', name: 'Transport', icon: Car, color: 'bg-orange-100 text-orange-600', count: 0 },
  { id: 'beauty', name: 'Beauté', icon: Sparkles, color: 'bg-yellow-100 text-yellow-600', count: 0 },
];

interface ClientMarketplaceHomeProps {
  onCategorySelect: (category: string) => void;
  onProductClick: (productId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const ClientMarketplaceHome: React.FC<ClientMarketplaceHomeProps> = ({
  onCategorySelect,
  onProductClick,
  searchTerm,
  onSearchChange
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketplaceData();
  }, []);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      
      // Données simulées pour l'exemple
      const mockProducts = [
        {
          id: '1',
          name: 'Smartphone Samsung Galaxy',
          price: 2500000,
          currency: 'GNF',
          images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop'],
          seller_id: '1',
          category: 'electronics',
          is_featured: true,
          seller: { shop_name: 'Tech Store Guinea', business_address: 'Kaloum, Conakry' }
        },
        {
          id: '2',
          name: 'Robe Traditionnelle Guinéenne',
          price: 850000,
          currency: 'GNF',
          images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop'],
          seller_id: '2',
          category: 'fashion',
          is_featured: true,
          seller: { shop_name: 'Mode Africaine', business_address: 'Matam, Conakry' }
        },
        {
          id: '3',
          name: 'Riz Local de Kindia',
          price: 45000,
          currency: 'GNF',
          images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop'],
          seller_id: '3',
          category: 'food',
          is_featured: false,
          seller: { shop_name: 'Ferme Bio Kindia', business_address: 'Kindia' }
        }
      ];

      setFeaturedProducts(mockProducts.filter(p => p.is_featured));
      setRecentProducts(mockProducts);
      setPromotions(mockProducts.slice(0, 2));

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const getImageUrl = (images: string[]) => {
    return images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
  };

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Bienvenue sur le Marketplace 224Solutions
          </h1>
          <p className="text-muted-foreground mb-4">
            Découvrez des milliers de produits et services locaux
          </p>
          
          {/* Barre de recherche principale */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Rechercher des produits, services, boutiques..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-12 pr-12 h-12 text-base"
            />
            <Button 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => onCategorySelect('search')}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Catégories principales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Catégories populaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  onClick={() => onCategorySelect(category.id)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">{category.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {Math.floor(Math.random() * 50) + 10}
                    </Badge>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Promotions */}
      {promotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Promotions du moment
              <Badge className="bg-orange-100 text-orange-600">-20%</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {promotions.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onProductClick(product.id)}
                >
                  <CardContent className="p-3">
                    <div className="relative mb-3">
                      <img
                        src={getImageUrl(product.images)}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-red-500">-20%</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.price, product.currency)}
                        </span>
                        <span className="font-bold text-primary">
                          {formatPrice(Math.floor(product.price * 0.8), product.currency)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{product.seller?.shop_name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Produits en vedette */}
      {featuredProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              Produits en vedette
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredProducts.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onProductClick(product.id)}
                >
                  <CardContent className="p-3">
                    <div className="relative mb-3">
                      <img
                        src={getImageUrl(product.images)}
                        alt={product.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 w-6 h-6 p-0 bg-white/80"
                      >
                        <Heart className="w-3 h-3" />
                      </Button>
                    </div>
                    <h4 className="font-medium text-xs mb-1 line-clamp-2">{product.name}</h4>
                    <p className="font-bold text-primary text-sm">
                      {formatPrice(product.price, product.currency)}
                    </p>
                    <div className="flex items-center mt-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-xs text-muted-foreground ml-1">4.8</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nouveautés */}
      {recentProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Nouveautés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentProducts.slice(0, 4).map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => onProductClick(product.id)}
                >
                  <CardContent className="p-3">
                    <div className="relative mb-3">
                      <img
                        src={getImageUrl(product.images)}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Badge className="absolute top-2 left-2 bg-green-500">Nouveau</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2 w-8 h-8 p-0 bg-white/80"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <h4 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h4>
                    <p className="font-bold text-primary">
                      {formatPrice(product.price, product.currency)}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground ml-1">
                          {product.seller?.business_address || 'Conakry'}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">Dispo</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Chargement...</p>
        </div>
      )}
    </div>
  );
};

export default ClientMarketplaceHome;
