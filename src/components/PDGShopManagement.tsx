import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Store, Search, Eye, Settings, BarChart3 } from "lucide-react";

interface Shop {
  id: string;
  seller_id: string;
  shop_name: string;
  description: string;
  is_active: boolean;
  product_count: number;
  subscription_plan: string;
  created_at: string;
  updated_at: string;
  seller?: {
    email: string;
    full_name: string;
    readable_id: string;
  };
}

const PDGShopManagement = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seller_shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const shopsWithSellers = await Promise.all(
          data.map(async (shop: any) => {
            const { data: seller } = await supabase
              .from('profiles')
              .select('email, full_name, readable_id')
              .eq('user_id', shop.seller_id)
              .single();

            return {
              ...shop,
              seller
            };
          })
        );
        
        setShops(shopsWithSellers);
      }
    } catch (error) {
      console.error('Error loading shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.shop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.seller?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.seller?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && shop.is_active) ||
                         (statusFilter === "inactive" && !shop.is_active);
    const matchesPlan = planFilter === "all" || shop.subscription_plan === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalShops = shops.length;
  const activeShops = shops.filter(s => s.is_active).length;
  const premiumShops = shops.filter(s => s.subscription_plan === 'premium').length;
  const totalProducts = shops.reduce((sum, s) => sum + (s.product_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Store className="h-8 w-8 animate-pulse text-primary" />
        <span className="ml-2">Chargement des boutiques...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2" />
            Gestion des Boutiques
          </CardTitle>
          <CardDescription>
            Gérez toutes les boutiques de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Store className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Boutiques</p>
                  <p className="text-2xl font-bold text-blue-600">{totalShops}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Actives</p>
                  <p className="text-2xl font-bold text-green-600">{activeShops}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Store className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Premium</p>
                  <p className="text-2xl font-bold text-yellow-600">{premiumShops}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Produits</p>
                  <p className="text-2xl font-bold text-purple-600">{totalProducts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom de boutique, vendeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="inactive">Inactives</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table des boutiques */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Boutique</TableHead>
                <TableHead>Vendeur</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShops.map((shop) => (
                <TableRow key={shop.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{shop.shop_name}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{shop.description || 'Aucune description'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{shop.seller?.full_name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{shop.seller?.email || 'N/A'}</p>
                      <p className="text-xs text-gray-400">ID: {shop.seller?.readable_id || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {shop.product_count || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        shop.subscription_plan === 'premium' ? 'default' :
                        shop.subscription_plan === 'enterprise' ? 'secondary' : 'outline'
                      }
                    >
                      {shop.subscription_plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={shop.is_active ? 'default' : 'destructive'}
                    >
                      {shop.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredShops.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune boutique trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDGShopManagement;
