import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, AlertTriangle, TrendingUp, Search, Brain } from 'lucide-react';
import { toast } from 'sonner';
import ProductCreateModal from './ProductCreateModal';
import SmartStockManager from './SmartStockManager';

interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minStock: number;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const VendorInventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Données d'exemple - seront remplacées par les vraies données
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Produit Test 1',
      sku: 'PRD001',
      stock: 0,
      minStock: 5,
      price: 0,
      status: 'out_of_stock'
    },
    {
      id: '2', 
      name: 'Produit Test 2',
      sku: 'PRD002',
      stock: 0,
      minStock: 10,
      price: 0,
      status: 'out_of_stock'
    }
  ]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-100 text-green-800">En stock</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-100 text-yellow-800">Stock faible</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-100 text-red-800">Rupture</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const stockStats = {
    totalProducts: products.length,
    lowStockProducts: products.filter(p => p.status === 'low_stock').length,
    outOfStockProducts: products.filter(p => p.status === 'out_of_stock').length,
    totalValue: products.reduce((sum, p) => sum + (p.stock * p.price), 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion de Stock</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau produit
        </Button>
      </div>

      <Tabs defaultValue="classic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="classic">Gestion Classique</TabsTrigger>
          <TabsTrigger value="smart" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Gestion Intelligente</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="classic" className="space-y-6">

      {/* Statistiques du stock */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stockStats.totalProducts}</p>
                <p className="text-sm text-muted-foreground">Total produits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stockStats.lowStockProducts}</p>
                <p className="text-sm text-muted-foreground">Stock faible</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stockStats.outOfStockProducts}</p>
                <p className="text-sm text-muted-foreground">En rupture</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-lg font-bold">{stockStats.totalValue.toLocaleString()} GNF</p>
                <p className="text-sm text-muted-foreground">Valeur stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Rechercher un produit par nom ou SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des produits */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire des produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Aucun produit trouvé pour cette recherche' : 'Aucun produit en stock'}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      {getStatusBadge(product.status)}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">{product.stock} unités</p>
                      <p className="text-sm text-muted-foreground">Min: {product.minStock}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium">{product.price.toLocaleString()} GNF</p>
                      <p className="text-sm text-muted-foreground">Prix unitaire</p>
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Ajuster
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

        </TabsContent>

        <TabsContent value="smart">
          <SmartStockManager />
        </TabsContent>
      </Tabs>

      <ProductCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProductCreated={() => {
          toast.success('Produit créé avec succès');
          // Ici on pourrait recharger la liste des produits
        }}
      />
    </div>
  );
};

export default VendorInventory;