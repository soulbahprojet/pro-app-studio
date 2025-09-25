import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Search,
  Star,
  MapPin,
  Package,
  ShoppingCart,
  Heart,
  Eye,
  Store
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  images: string[];
  seller_id: string;
  category: string;
  description: string;
  seller_shops: {
    shop_name: string;
    business_address: string;
    avg_rating: number;
    total_reviews: number;
  };
}

interface ClientProductCatalogProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onBuyNow: (productId: string) => void;
}

const ClientProductCatalog: React.FC<ClientProductCatalogProps> = ({
  searchTerm,
  onSearchChange,
  onAddToCart,
  onBuyNow
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Données simulées pour le catalogue
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Smartphone Samsung Galaxy A54',
          price: 2500000,
          currency: 'GNF',
          images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop'],
          seller_id: '1',
          category: 'electronics',
          description: 'Smartphone dernière génération avec écran AMOLED 6.4"',
          seller_shops: { shop_name: 'Tech Store Guinea', business_address: 'Kaloum, Conakry', avg_rating: 4.8, total_reviews: 125 }
        },
        {
          id: '2',
          name: 'Robe Traditionnelle Guinéenne',
          price: 850000,
          currency: 'GNF',
          images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=300&fit=crop'],
          seller_id: '2',
          category: 'fashion',
          description: 'Robe traditionnelle en tissus africains authentiques',
          seller_shops: { shop_name: 'Mode Africaine', business_address: 'Matam, Conakry', avg_rating: 4.6, total_reviews: 89 }
        },
        {
          id: '3',
          name: 'Ordinateur Portable HP',
          price: 4200000,
          currency: 'GNF',
          images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop'],
          seller_id: '1',
          category: 'electronics',
          description: 'Ordinateur portable HP 15.6" Intel Core i5, 8GB RAM, 256GB SSD',
          seller_shops: { shop_name: 'Tech Store Guinea', business_address: 'Kaloum, Conakry', avg_rating: 4.8, total_reviews: 125 }
        },
        {
          id: '4',
          name: 'Sac à main en cuir',
          price: 650000,
          currency: 'GNF',
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'],
          seller_id: '2',
          category: 'fashion',
          description: 'Sac à main élégant en cuir véritable',
          seller_shops: { shop_name: 'Mode Africaine', business_address: 'Matam, Conakry', avg_rating: 4.6, total_reviews: 89 }
        },
        {
          id: '5',
          name: 'Riz Local de Kindia (25kg)',
          price: 450000,
          currency: 'GNF',
          images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop'],
          seller_id: '3',
          category: 'food',
          description: 'Riz local de qualité supérieure, récolte récente',
          seller_shops: { shop_name: 'Ferme Bio Kindia', business_address: 'Kindia', avg_rating: 4.9, total_reviews: 67 }
        }
      ];

      let filteredProducts = mockProducts;

      // Appliquer les filtres
      if (selectedCategory && selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
      }

      if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Tri
      switch (sortBy) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.seller_shops.avg_rating - a.seller_shops.avg_rating);
          break;
        default:
          // Garder l'ordre par défaut (plus récent)
          break;
      }

      setProducts(filteredProducts);
      
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
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
      {/* En-tête avec recherche et filtres */}
      <Card>
        <CardHeader>
          <CardTitle>Catalogue Produits & Services</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Barre de recherche */}
          <div className="flex space-x-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                <SelectItem value="electronics">Électronique</SelectItem>
                <SelectItem value="fashion">Mode</SelectItem>
                <SelectItem value="food">Alimentation</SelectItem>
                <SelectItem value="services">Services</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Plus récent</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="rating">Mieux noté</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            {products.length} produit(s) trouvé(s)
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Chargement des produits...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow group">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={getImageUrl(product.images)}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    
                    {/* Actions */}
                    <div className="absolute top-2 right-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(product.price, product.currency)}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{product.seller_shops.avg_rating}</span>
                        <span className="text-xs text-muted-foreground">({product.seller_shops.total_reviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{product.seller_shops.shop_name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Disponible
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-1 mb-4 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{product.seller_shops.business_address || 'Conakry'}</span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product.id, 1);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Panier
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBuyNow(product.id);
                        }}
                      >
                        Acheter
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClientProductCatalog;
