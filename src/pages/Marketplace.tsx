import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart, 
  Star, 
  Eye,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category?: string;
  image_url?: string;
  rating?: number;
  in_stock?: boolean;
  vendor_name?: string;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'rating'>('name');
  const navigate = useNavigate();

  const categories = ["all", "électronique", "vêtements", "maison", "sport", "livres"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;
      
      // Données de démonstration si la table est vide
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Smartphone Samsung Galaxy',
          price: 599,
          description: 'Smartphone dernière génération avec caméra 64MP',
          category: 'électronique',
          image_url: '/api/placeholder/300/200',
          rating: 4.5,
          in_stock: true,
          vendor_name: 'TechStore'
        },
        {
          id: '2', 
          name: 'Chemise Business Premium',
          price: 89,
          description: 'Chemise élégante pour homme, 100% coton',
          category: 'vêtements',
          image_url: '/api/placeholder/300/200',
          rating: 4.2,
          in_stock: true,
          vendor_name: 'Fashion Plus'
        },
        {
          id: '3',
          name: 'Casque Audio Bluetooth',
          price: 149,
          description: 'Casque sans fil avec réduction de bruit active',
          category: 'électronique',
          image_url: '/api/placeholder/300/200',
          rating: 4.7,
          in_stock: false,
          vendor_name: 'AudioWorld'
        }
      ];
      
      setProducts(data?.length ? data : mockProducts);
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price': return a.price - b.price;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        default: return a.name.localeCompare(b.name);
      }
    });

  const addToCart = (product: Product) => {
    // Logique d'ajout au panier
    console.log('Produit ajouté au panier:', product);
  };

  const toggleFavorite = (productId: string) => {
    // Logique de favoris
    console.log('Produit ajouté aux favoris:', productId);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des produits...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header avec titre et statistiques */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Marketplace 224Solutions</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez des milliers de produits de qualité sélectionnés par nos vendeurs partenaires
        </p>
        <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
          <span>{products.length} produits disponibles</span>
          <span>Livraison 24h</span>
          <span>Paiement sécurisé</span>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder="Rechercher des produits, marques, catégories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres */}
            <div className="flex items-center space-x-4">
              {/* Catégories */}
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Toutes catégories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>

              {/* Tri */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'rating')}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="name">Nom A-Z</option>
                <option value="price">Prix croissant</option>
                <option value="rating">Mieux notés</option>
              </select>

              {/* Mode d'affichage */}
              <div className="flex items-center space-x-1 border rounded-md">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 size={16} />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Résultats */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="text-xl font-semibold">Aucun produit trouvé</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Aucun produit disponible pour le moment.'}
              </p>
              {searchTerm && (
                <Button onClick={() => setSearchTerm('')}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Nombre de résultats */}
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Grille de produits */}
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                <div onClick={() => navigate(`/product/${product.id}`)}>
                  <CardHeader className="p-0">
                    {/* Image du produit */}
                    <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                      <img 
                        src={product.image_url || '/api/placeholder/300/300'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {!product.in_stock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">Rupture de stock</Badge>
                        </div>
                      )}
                      {/* Boutons d'action */}
                      <div className="absolute top-2 right-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/product/${product.id}`);
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(product.id);
                          }}
                        >
                          <Heart size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 space-y-3">
                    {/* Vendor */}
                    {product.vendor_name && (
                      <p className="text-xs text-muted-foreground">{product.vendor_name}</p>
                    )}
                    
                    {/* Nom et catégorie */}
                    <div className="space-y-1">
                      <CardTitle className="text-base line-clamp-2">{product.name}</CardTitle>
                      {product.category && (
                        <Badge variant="outline" className="text-xs">
                          {product.category}
                        </Badge>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>

                    {/* Note */}
                    {product.rating && (
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              className={i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">({product.rating})</span>
                      </div>
                    )}

                    <Separator />

                    {/* Prix et action */}
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-primary">
                        {product.price}€
                      </span>
                      <Button 
                        size="sm"
                        disabled={!product.in_stock}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        {product.in_stock ? 'Ajouter' : 'Indisponible'}
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}