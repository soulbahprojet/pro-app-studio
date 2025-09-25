import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Utensils, 
  ShoppingCart, 
  Clock,
  Plus,
  Settings,
  ChefHat,
  TrendingUp
} from 'lucide-react';

interface RestaurantInterfaceProps {
  shopId: string;
  onAddProduct?: () => void;
  onManageOrders?: () => void;
}

export default function RestaurantInterface({ 
  shopId, 
  onAddProduct, 
  onManageOrders 
}: RestaurantInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    todayOrders: 0,
    revenue: 0
  });

  useEffect(() => {
    loadMenuItems();
  }, [user]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      
      const { data: itemsData, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMenuItems(itemsData || []);
      
      const totalItems = itemsData?.length || 0;
      const availableItems = itemsData?.filter(item => item.is_active).length || 0;
      
      setStats({
        totalItems,
        availableItems,
        todayOrders: 0,
        revenue: 0
      });

    } catch (error) {
      console.error('Error loading menu items:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le menu",
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
            <Utensils className="h-5 w-5 text-orange-600" />
            Restaurant - Interface en développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Interface complète pour la gestion de restaurant avec menu, commandes, livraisons et temps de préparation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ChefHat className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Plats disponibles</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">{stats.availableItems}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Commandes</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.todayOrders}</div>
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
              Ajouter un plat
            </Button>
            <Button variant="outline" onClick={onManageOrders}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Gérer les commandes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
