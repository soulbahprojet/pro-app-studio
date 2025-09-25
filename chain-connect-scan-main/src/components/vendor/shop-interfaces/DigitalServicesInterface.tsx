import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Download, 
  Plus,
  Settings,
  Cloud,
  TrendingUp
} from 'lucide-react';

interface DigitalServicesInterfaceProps {
  shopId: string;
  onAddProduct?: () => void;
  onManageInventory?: () => void;
}

export default function DigitalServicesInterface({ 
  shopId, 
  onAddProduct, 
  onManageInventory 
}: DigitalServicesInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalDownloads: 0,
    revenue: 0
  });

  useEffect(() => {
    loadDigitalProducts();
  }, [user]);

  const loadDigitalProducts = async () => {
    try {
      setLoading(true);
      
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .eq('type', 'digital')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setProducts(productsData || []);
      
      const totalProducts = productsData?.length || 0;
      const activeProducts = productsData?.filter(p => p.is_active).length || 0;
      
      setStats({
        totalProducts,
        activeProducts,
        totalDownloads: 0,
        revenue: 0
      });

    } catch (error) {
      console.error('Error loading digital products:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits numériques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-purple-600" />
            Services numériques - Interface en développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Interface complète pour la gestion des services numériques, téléchargements, licences et accès contrôlé.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Services actifs</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.activeProducts}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Téléchargements</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.totalDownloads}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Revenus</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{stats.revenue} GNF</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un service numérique
            </Button>
            <Button variant="outline" onClick={onManageInventory}>
              <Settings className="h-4 w-4 mr-2" />
              Gérer les téléchargements
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}