import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShopCreationModal } from '@/components/ShopCreationModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Store, Plus, Eye, Settings, Globe, Users, 
  TrendingUp, Package, Calendar, Star, ExternalLink
} from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  settings?: any;
}

const VendorShopsOverview: React.FC = () => {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadShops();
  }, [user?.id]);

  const loadShops = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('digital_shops')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement boutiques:', error);
        toast.error('Impossible de charger les boutiques');
        return;
      }

      setShops(data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const toggleShopStatus = async (shopId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('digital_shops')
        .update({ is_active: !currentStatus })
        .eq('id', shopId);

      if (error) throw error;

      setShops(shops.map(shop => 
        shop.id === shopId 
          ? { ...shop, is_active: !currentStatus }
          : shop
      ));

      toast.success(`Boutique ${!currentStatus ? 'activée' : 'désactivée'}`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de modifier le statut');
    }
  };

  const getShopUrl = (slug: string) => {
    return `${window.location.origin}/shop/${slug}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Mes Boutiques</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-full h-32 bg-muted rounded mb-4"></div>
                <div className="w-3/4 h-4 bg-muted rounded mb-2"></div>
                <div className="w-1/2 h-3 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mes Boutiques</h2>
          <p className="text-muted-foreground">
            Gérez toutes vos boutiques numériques depuis cette interface
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Boutique
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total boutiques</p>
                <p className="text-2xl font-bold">{shops.length}</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Actives</p>
                <p className="text-2xl font-bold text-green-600">
                  {shops.filter(s => s.is_active).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactives</p>
                <p className="text-2xl font-bold text-orange-600">
                  {shops.filter(s => !s.is_active).length}
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cette semaine</p>
                <p className="text-2xl font-bold text-purple-600">
                  {shops.filter(s => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(s.created_at) >= weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des boutiques */}
      {shops.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Store className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucune boutique créée</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première boutique digitale pour commencer à vendre en ligne
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer ma première boutique
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {/* Header avec logo */}
                <div className="relative h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  {shop.logo_url ? (
                    <img 
                      src={shop.logo_url} 
                      alt={shop.name}
                      className="h-16 w-16 object-cover rounded-full"
                    />
                  ) : (
                    <Store className="h-16 w-16 text-primary/50" />
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={shop.is_active ? "default" : "secondary"}>
                      {shop.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                
                {/* Contenu */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{shop.name}</h3>
                    {shop.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {shop.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    Créée le {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  
                  {/* URL de la boutique */}
                  <div className="flex items-center text-xs text-muted-foreground bg-muted p-2 rounded">
                    <Globe className="h-3 w-3 mr-2" />
                    <span className="flex-1 truncate">{getShopUrl(shop.slug)}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigator.clipboard.writeText(getShopUrl(shop.slug));
                        toast.success('URL copiée !');
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.open(getShopUrl(shop.slug), '_blank')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Voir
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast.info("Paramètres à venir")}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant={shop.is_active ? "destructive" : "default"}
                      onClick={() => toggleShopStatus(shop.id, shop.is_active)}
                    >
                      {shop.is_active ? "Désactiver" : "Activer"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de création */}
      <ShopCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadShops();
          toast.success("Boutique créée avec succès !");
        }}
      />
    </div>
  );
};

export default VendorShopsOverview;