import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Package, 
  AlertTriangle, CheckCircle, Upload, Download, Star, Copy
} from "lucide-react";
import { toast } from "sonner";

const VendorProductManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Produits fictifs - à remplacer par des vraies données
  const products = [
    {
      id: "1",
      name: "iPhone 15 Pro Max 256GB",
      sku: "IPH15PM256",
      price: "1,200,000 GNF",
      stock: 15,
      status: "active",
      category: "Électronique",
      image: "/placeholder.svg",
      sales: 24,
      views: 156,
      rating: 4.8,
      lastUpdated: "2024-01-15"
    },
    {
      id: "2", 
      name: "MacBook Air 13 M2",
      sku: "MBA13M2",
      price: "1,850,000 GNF",
      stock: 3,
      status: "low_stock",
      category: "Électronique",
      image: "/placeholder.svg",
      sales: 12,
      views: 89,
      rating: 4.9,
      lastUpdated: "2024-01-10"
    },
    {
      id: "3",
      name: "Samsung Galaxy S24 Ultra",
      sku: "SGS24U",
      price: "1,100,000 GNF",
      stock: 0,
      status: "out_of_stock",
      category: "Électronique", 
      image: "/placeholder.svg",
      sales: 18,
      views: 234,
      rating: 4.7,
      lastUpdated: "2024-01-12"
    }
  ];

  const getStatusBadge = (status: string, stock: number) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge variant="destructive">Rupture</Badge>;
    }
    if (status === "low_stock" || stock <= 5) {
      return <Badge variant="outline" className="border-orange-500 text-orange-700">Stock faible</Badge>;
    }
    return <Badge variant="outline" className="border-green-500 text-green-700">En stock</Badge>;
  };

  const handleCreateProduct = () => {
    toast.success("Produit créé avec succès");
    setIsCreateModalOpen(false);
  };

  const handleEditProduct = (productId: string) => {
    toast.info(`Modification du produit ${productId}`);
  };

  const handleDeleteProduct = (productId: string) => {
    toast.error(`Produit ${productId} supprimé`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* En-tête avec actions principales */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Catalogue Produits</h2>
          <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importer CSV
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Produit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer un nouveau produit</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du produit *</Label>
                    <Input id="name" placeholder="Ex: iPhone 15 Pro Max" />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU *</Label>
                    <Input id="sku" placeholder="Ex: IPH15PM256" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Description détaillée du produit..." rows={3} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Prix (GNF) *</Label>
                    <Input id="price" type="number" placeholder="1200000" />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock initial *</Label>
                    <Input id="stock" type="number" placeholder="50" />
                  </div>
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Électronique</SelectItem>
                        <SelectItem value="fashion">Mode</SelectItem>
                        <SelectItem value="home">Maison</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Poids (kg)</Label>
                    <Input id="weight" type="number" step="0.1" placeholder="0.5" />
                  </div>
                  <div>
                    <Label htmlFor="dimensions">Dimensions (L×l×H cm)</Label>
                    <Input id="dimensions" placeholder="15×8×1" />
                  </div>
                </div>
                <div>
                  <Label>Images produit</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Glissez vos images ici ou cliquez pour parcourir</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateProduct}>
                    Créer le produit
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total produits</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En stock</p>
                <p className="text-2xl font-bold text-green-600">89</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold text-orange-600">23</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rupture</p>
                <p className="text-2xl font-bold text-red-600">15</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">En stock</SelectItem>
                <SelectItem value="low_stock">Stock faible</SelectItem>
                <SelectItem value="out_of_stock">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  {getStatusBadge(product.status, product.stock)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-primary">{product.price}</span>
                  <span className="text-sm text-muted-foreground">Stock: {product.stock}</span>
                </div>

                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                    {product.rating}
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {product.views}
                  </div>
                  <span>{product.sales} ventes</span>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditProduct(product.id)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Duplication du produit")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterStatus !== "all" 
                ? "Essayez d'ajuster vos filtres de recherche"
                : "Commencez par créer votre premier produit"
              }
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un produit
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorProductManager;