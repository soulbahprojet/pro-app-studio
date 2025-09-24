import React, { useState } from "react";
import { VendorLayout } from "@/components/vendor/VendorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  AlertTriangle 
} from "lucide-react";

const VendorProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Données d'exemple
  const products = [
    {
      id: 1,
      name: "iPhone 15 Pro",
      sku: "IPH15P-256",
      category: "Électronique",
      price: 1000000,
      stock: 25,
      status: "active",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      sku: "SGS24-128",
      category: "Électronique", 
      price: 900000,
      stock: 5,
      status: "active",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "MacBook Air M3",
      sku: "MBA-M3-512",
      category: "Électronique",
      price: 1500000,
      stock: 0,
      status: "out_of_stock",
      image: "/placeholder.svg"
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string, stock: number) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge variant="destructive">Rupture de stock</Badge>;
    }
    if (stock <= 5) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Stock faible</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-800">En stock</Badge>;
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des produits</h1>
            <p className="text-muted-foreground">Gérez votre catalogue de produits</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un produit
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Mes produits ({filteredProducts.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{product.category}</Badge>
                        {getStatusBadge(product.status, product.stock)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {product.price.toLocaleString()} GNF
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {product.stock}
                        {product.stock <= 5 && product.stock > 0 && (
                          <AlertTriangle className="inline h-3 w-3 ml-1 text-orange-500" />
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
};

export default VendorProductsPage;