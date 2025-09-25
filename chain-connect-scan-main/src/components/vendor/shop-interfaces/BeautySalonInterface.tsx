import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Scissors, 
  Calendar, 
  Star,
  Plus,
  Settings,
  Sparkles,
  TrendingUp
} from 'lucide-react';

interface BeautySalonInterfaceProps {
  shopId: string;
  onAddProduct?: () => void;
  onManageOrders?: () => void;
}

export default function BeautySalonInterface({ 
  shopId, 
  onAddProduct, 
  onManageOrders 
}: BeautySalonInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalServices: 0,
    availableServices: 0,
    todayAppointments: 0,
    revenue: 0
  });

  useEffect(() => {
    loadServices();
  }, [user]);

  const loadServices = async () => {
    try {
      setLoading(true);
      
      const { data: servicesData, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setServices(servicesData || []);
      
      const totalServices = servicesData?.length || 0;
      const availableServices = servicesData?.filter(service => service.is_active).length || 0;
      
      setStats({
        totalServices,
        availableServices,
        todayAppointments: 0,
        revenue: 0
      });

    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les services",
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
            <Scissors className="h-5 w-5 text-pink-600" />
            Salon de beauté - Interface en développement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Interface complète pour salon de beauté avec réservations, services, gestion des clients et rendez-vous.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-pink-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-pink-600" />
                <span className="text-sm font-medium">Services disponibles</span>
              </div>
              <div className="text-2xl font-bold text-pink-600">{stats.availableServices}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Rendez-vous</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">{stats.todayAppointments}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Revenus</span>
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.revenue} GNF</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un service
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Gérer les rendez-vous
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}