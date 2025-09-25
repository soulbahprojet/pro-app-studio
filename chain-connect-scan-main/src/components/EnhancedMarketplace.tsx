import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ShoppingCart,
  MapPin,
  Eye,
  Clock,
  ChevronRight,
  Camera,
  ScanLine,
  Store,
  ShoppingBag,
  Utensils,
  Scissors,
  Briefcase,
  Calendar,
  GraduationCap,
  Hammer,
  Car,
  Sprout,
  Gamepad2,
  Shirt,
  Wrench,
  Package
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  images: string[];
  seller_id: string;
  shop_id?: string;  // Ajout du shop_id
  category: string;
  type: 'physical' | 'digital';
  is_active: boolean;
  is_featured: boolean;
  description: string;
  created_at: string;
  seller?: {
    shop_name: string;
    business_address: string;
    business_type: string;
    contact_phone: string;
    rating?: number;
    slug?: string;
  };
}

interface ShopCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  count: number;
}

const shopCategories: ShopCategory[] = [
  {
    id: 'physical-products',
    title: 'Produits physiques',
    icon: ShoppingBag,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    count: 0
  },
  {
    id: 'digital-services',
    title: 'Services numériques',
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    count: 0
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    icon: Utensils,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    count: 0
  },
  {
    id: 'beauty-salon',
    title: 'Beauté',
    icon: Scissors,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    count: 0
  },
  {
    id: 'professional-services',
    title: 'Services pro',
    icon: Briefcase,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    count: 0
  },
  {
    id: 'events',
    title: 'Événementiel',
    icon: Calendar,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    count: 0
  },
  {
    id: 'education',
    title: 'Éducation',
    icon: GraduationCap,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    count: 0
  },
  {
    id: 'artisanal',
    title: 'Artisanat',
    icon: Hammer,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    count: 0
  },
  {
    id: 'transport',
    title: 'Transport',
    icon: Car,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    count: 0
  },
  {
    id: 'agriculture',
    title: 'Agriculture',
    icon: Sprout,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    count: 0
  },
  {
    id: 'entertainment',
    title: 'Divertissement',
    icon: Gamepad2,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    count: 0
  },
  {
    id: 'fashion-specialized',
    title: 'Mode',
    icon: Shirt,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    count: 0
  },
  {
    id: 'home-services',
    title: 'Services domicile',
    icon: Wrench,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    count: 0
  }
];

const traditionalCategories = [
  "Tous", "Électronique", "Mode", "Alimentation", "Bijoux", "Sport", "Maison", "Beauté", "Services"
];

export default function EnhancedMarketplace() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedShopType, setSelectedShopType] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'categories' | 'shops'>('categories');
  const [categoriesWithCount, setCategoriesWithCount] = useState(shopCategories);

  useEffect(() => {
    loadProducts();
    loadShopCategoriesCount();
    
    // Configuration de la synchronisation temps réel
    const channel = supabase
      .channel('marketplace-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change detected:', payload);
          loadProducts(); // Recharger les produits
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'seller_shops'
        },
        (payload) => {
          console.log('Shop change detected:', payload);
          loadShopCategoriesCount(); // Recharger les catégories
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadProducts = async () => {
    try {
      const { data: productsData, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          currency,
          images,
          seller_id,
          shop_id,
          category,
          type,
          is_active,
          is_featured,
          description,
          created_at,
          stock_quantity
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrichir avec les données des boutiques en utilisant shop_id
      const enrichedProducts = await Promise.all(
        (productsData || []).map(async (product) => {
          const { data: shopData } = await supabase
            .from('seller_shops')
            .select('shop_name, business_address, business_type, contact_phone, slug')
            .eq('id', product.shop_id)
            .maybeSingle();

          return {
            ...product,
            seller: shopData
          };
        })
      );

      setProducts(enrichedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadShopCategoriesCount = async () => {
    try {
      const { data: shopsData, error } = await supabase
        .from('seller_shops')
        .select('business_type, product_count')
        .eq('is_active', true);

      if (error) throw error;

      const typeCounts = shopsData?.reduce((acc: { [key: string]: number }, shop) => {
        const businessType = shop.business_type || 'mixed';
        acc[businessType] = (acc[businessType] || 0) + 1;
        return acc;
      }, {}) || {};

      const updatedCategories = shopCategories.map(category => ({
        ...category,
        count: typeCounts[category.id] || 0
      }));

      setCategoriesWithCount(updatedCategories);
    } catch (error) {
      console.error('Error loading shop categories:', error);
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleImageScan = async () => {
    setIsScanning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const detectedProducts = ["Samsung Galaxy", "iPhone", "Smartphone", "Ordinateur", "Tablette"];
      const randomProduct = detectedProducts[Math.floor(Math.random() * detectedProducts.length)];
      
      setSearchTerm(randomProduct);
      setShowScanDialog(false);
      toast({
        title: "Produit détecté",
        description: `Recherche pour: ${randomProduct}`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la reconnaissance du produit",
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.seller?.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "Tous" || product.category === selectedCategory;
    
    // Filtrage intelligent par type de boutique
    const matchesShopType = !selectedShopType || 
      product.seller?.business_type === selectedShopType ||
      (selectedShopType === 'physical-products' && product.type === 'physical') ||
      (selectedShopType === 'digital-services' && product.type === 'digital');
    
    return matchesSearch && matchesCategory && matchesShopType;
  });

  const featuredProducts = filteredProducts.filter(p => p.is_featured);

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  const getImageUrl = (images: string[]) => {
    return images && images.length > 0 ? images[0] : "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop";
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section avec recherche */}
      <div className="bg-gradient-to-r from-white to-amber-100 px-4 py-6">
        <div className="container mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Marketplace Mondial</h1>
            <p className="text-amber-700">Découvrez des boutiques locales par catégorie d'activité</p>
          </div>
          
          {/* Barre de recherche avec scan */}
          <div className="relative mb-4">
            <div className="flex bg-white rounded-lg shadow-lg overflow-hidden">
              <Input
                placeholder="Rechercher des produits, services, boutiques..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-0 focus:ring-0 text-base px-4 py-3"
              />
              <Button 
                onClick={() => setShowScanDialog(true)}
                className="bg-amber-400 hover:bg-amber-500 text-white px-4"
                title="Scanner un produit"
              >
                <Camera className="w-5 h-5" />
              </Button>
              <Button className="bg-amber-400 hover:bg-amber-500 text-white px-6">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de scan */}
      <Dialog open={showScanDialog} onOpenChange={setShowScanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Scanner un produit
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              {!isScanning ? (
                <div className="space-y-4">
                  <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <ScanLine className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Prêt à scanner</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Identifiez automatiquement un produit avec l'IA
                    </p>
                    <Button onClick={handleImageScan} className="bg-blue-600 hover:bg-blue-700">
                      <Camera className="w-4 h-4 mr-2" />
                      Commencer le scan
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                    <ScanLine className="w-10 h-10 text-blue-600 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Reconnaissance en cours...</h3>
                    <p className="text-sm text-gray-600">
                      Analyse de l'image en cours...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation par onglets */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'categories' | 'shops')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="categories">Par catégories produits</TabsTrigger>
            <TabsTrigger value="shops">Par types de boutiques</TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            {/* Filtres par catégories traditionnelles */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Catégories de produits</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {traditionalCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="default"
                    onClick={() => {
                      setSelectedCategory(category);
                      setSelectedShopType(null);
                    }}
                    className={`whitespace-nowrap px-4 py-2 ${
                      selectedCategory === category 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'hover:bg-orange-50 hover:border-orange-200'
                    }`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shops">
            {/* Filtres par types de boutiques */}
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Types de boutiques professionnelles</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {categoriesWithCount.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedShopType === category.id;
                  
                  return (
                    <Button
                      key={category.id}
                      variant="outline"
                      onClick={() => {
                        setSelectedShopType(isSelected ? null : category.id);
                        setSelectedCategory("Tous");
                      }}
                      className={`h-auto p-3 flex flex-col items-center gap-2 ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50 text-orange-700' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${isSelected ? 'bg-orange-100' : category.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`h-4 w-4 ${isSelected ? 'text-orange-600' : category.color}`} />
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium">{category.title}</div>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {category.count}
                        </Badge>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Chargement des produits...</p>
          </div>
        ) : (
          <>
            {/* Produits mis en avant */}
            {featuredProducts.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">⭐ Meilleures offres</h2>
                  <Button variant="ghost" size="sm">
                    Voir tout <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featuredProducts.slice(0, 8).map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img 
                          src={getImageUrl(product.images)} 
                          alt={product.name}
                          className="w-full h-40 object-cover"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm"
                          onClick={() => toggleFavorite(product.id)}
                        >
                          <Heart 
                            className={`w-4 h-4 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                          />
                        </Button>
                        <Badge className="absolute bottom-2 left-2 bg-red-500 text-white text-xs">
                          Spécial
                        </Badge>
                      </div>
                      
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-lg font-bold text-red-600">
                            {formatPrice(product.price, product.currency)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mb-2">
                          <div className="flex items-center gap-1 mb-1">
                            <Store className="h-3 w-3" />
                            {product.seller?.shop_name}
                          </div>
                          {product.seller?.business_address && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {product.seller.business_address.slice(0, 30)}...
                            </div>
                          )}
                        </div>
                        
                        <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                          Voir détails
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tous les produits */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedShopType ? 
                    `${categoriesWithCount.find(c => c.id === selectedShopType)?.title} (${filteredProducts.length})` :
                    selectedCategory === "Tous" ? 
                      `Tous les produits (${filteredProducts.length})` : 
                      `${selectedCategory} (${filteredProducts.length})`
                  }
                </h2>
                <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                  <option>Pertinence</option>
                  <option>Prix croissant</option>
                  <option>Prix décroissant</option>
                  <option>Plus récents</option>
                </select>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  {activeView === 'shops' && selectedShopType ? (
                    // Message spécifique pour les boutiques sans produits
                    categoriesWithCount.find(c => c.id === selectedShopType)?.count > 0 ? (
                      <div>
                        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Boutiques disponibles</h3>
                        <p className="text-muted-foreground mb-4">
                          Il y a {categoriesWithCount.find(c => c.id === selectedShopType)?.count} boutiques de ce type,<br />
                          mais elles n'ont pas encore ajouté de produits.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Les vendeurs ajouteront bientôt leurs produits. Revenez plus tard !
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Aucune boutique de ce type</h3>
                        <p className="text-muted-foreground">
                          Aucune boutique ne correspond à ce type pour le moment
                        </p>
                      </div>
                    )
                  ) : (
                    // Message général pour les autres cas
                    <div>
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
                      <p className="text-muted-foreground">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img 
                          src={getImageUrl(product.images)} 
                          alt={product.name}
                          className="w-full h-32 object-cover"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-1 right-1 w-6 h-6 bg-white/80 backdrop-blur-sm"
                          onClick={() => toggleFavorite(product.id)}
                        >
                          <Heart 
                            className={`w-3 h-3 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
                          />
                        </Button>
                        {product.type === 'digital' && (
                          <Badge className="absolute top-1 left-1 bg-purple-500 text-white text-xs">
                            Digital
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-2">
                        <h3 className="font-medium text-xs text-gray-900 line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        
                        <div className="mb-1">
                          <span className="text-sm font-bold text-gray-900">
                            {formatPrice(product.price, product.currency)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1 mb-1">
                            <Store className="h-2 w-2" />
                            <span className="truncate">{product.seller?.shop_name}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}