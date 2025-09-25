import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Warehouse, 
  MapPin, 
  Package, 
  Plus,
  Edit2,
  Trash2,
  BarChart3,
  Users,
  Settings,
  Zap
} from 'lucide-react';

interface WarehouseData {
  id?: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  contact_person: string;
  contact_phone: string;
  capacity_m3: number;
  current_occupancy_m3: number;
  description: string;
  is_active: boolean;
}

const MultiWarehouseManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseData | null>(null);
  const [formData, setFormData] = useState<WarehouseData>({
    name: '',
    address: '',
    city: '',
    country: 'GN',
    postal_code: '',
    contact_person: '',
    contact_phone: '',
    capacity_m3: 1000,
    current_occupancy_m3: 0,
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transformer les données pour correspondre à l'interface WarehouseData
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name || '',
        address: item.address || '',
        city: item.city || '',
        country: item.country || 'GN',
        postal_code: item.postal_code || '',
        contact_person: item.contact_person || '',
        contact_phone: item.contact_phone || item.phone || '',
        capacity_m3: item.capacity_m3 || 1000,
        current_occupancy_m3: item.current_occupancy_m3 || 0,
        description: item.description || '',
        is_active: item.is_active ?? true
      }));
      
      setWarehouses(transformedData);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les entrepôts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarehouse = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('warehouses')
        .insert({
          ...formData,
          seller_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Entrepôt créé",
        description: "Nouvel entrepôt ajouté avec succès"
      });

      setShowCreateDialog(false);
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error('Error creating warehouse:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'entrepôt",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWarehouse = async () => {
    if (!editingWarehouse?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('warehouses')
        .update(formData)
        .eq('id', editingWarehouse.id);

      if (error) throw error;

      toast({
        title: "Entrepôt mis à jour",
        description: "Modifications enregistrées avec succès"
      });

      setEditingWarehouse(null);
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error('Error updating warehouse:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'entrepôt",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt ?')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Entrepôt supprimé",
        description: "L'entrepôt a été supprimé avec succès"
      });

      fetchWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'entrepôt",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      country: 'GN',
      postal_code: '',
      contact_person: '',
      contact_phone: '',
      capacity_m3: 1000,
      current_occupancy_m3: 0,
      description: '',
      is_active: true
    });
  };

  const openEditDialog = (warehouse: WarehouseData) => {
    setEditingWarehouse(warehouse);
    setFormData(warehouse);
    setShowCreateDialog(true);
  };

  const calculateOccupancyRate = (current: number, capacity: number) => {
    return capacity > 0 ? Math.round((current / capacity) * 100) : 0;
  };

  const getTotalCapacity = () => {
    return warehouses.reduce((total, w) => total + w.capacity_m3, 0);
  };

  const getTotalOccupancy = () => {
    return warehouses.reduce((total, w) => total + w.current_occupancy_m3, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Warehouse className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Entrepôts actifs</p>
                <p className="text-2xl font-bold">{warehouses.filter(w => w.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Capacité totale</p>
                <p className="text-2xl font-bold">{getTotalCapacity().toLocaleString()} m³</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Occupation totale</p>
                <p className="text-2xl font-bold">{getTotalOccupancy().toLocaleString()} m³</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taux d'occupation</p>
                <p className="text-2xl font-bold">
                  {calculateOccupancyRate(getTotalOccupancy(), getTotalCapacity())}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des entrepôts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Gestion Multi-Entrepôts Premium
            </CardTitle>
            <CardDescription>
              Gérez plusieurs entrepôts, suivez l'occupation et optimisez votre logistique
            </CardDescription>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un entrepôt
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : warehouses.length === 0 ? (
            <div className="text-center py-8">
              <Warehouse className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun entrepôt configuré</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre premier entrepôt pour commencer la gestion multi-sites
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Créer mon premier entrepôt
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {warehouses.map((warehouse) => (
                <Card key={warehouse.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{warehouse.name}</h3>
                          <Badge variant={warehouse.is_active ? "default" : "secondary"}>
                            {warehouse.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                              <MapPin className="h-3 w-3" />
                              {warehouse.address}, {warehouse.city}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                              <Users className="h-3 w-3" />
                              {warehouse.contact_person} - {warehouse.contact_phone}
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                              <Package className="h-3 w-3" />
                              Capacité: {warehouse.capacity_m3} m³
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <BarChart3 className="h-3 w-3" />
                              Occupation: {warehouse.current_occupancy_m3} m³ 
                              ({calculateOccupancyRate(warehouse.current_occupancy_m3, warehouse.capacity_m3)}%)
                            </div>
                          </div>
                        </div>

                        {warehouse.description && (
                          <p className="text-sm text-muted-foreground mt-2">{warehouse.description}</p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(warehouse)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWarehouse(warehouse.id!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création/édition */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) {
          setEditingWarehouse(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? 'Modifier l\'entrepôt' : 'Créer un nouvel entrepôt'}
            </DialogTitle>
            <DialogDescription>
              Configurez les détails de votre entrepôt pour une gestion optimale
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nom de l'entrepôt *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Entrepôt principal..."
              />
            </div>

            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                placeholder="Conakry"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Adresse complète *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Rue, quartier, commune..."
              />
            </div>

            <div>
              <Label htmlFor="contact_person">Responsable *</Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                placeholder="Nom du responsable"
              />
            </div>

            <div>
              <Label htmlFor="contact_phone">Téléphone *</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                placeholder="+224 xxx xxx xxx"
              />
            </div>

            <div>
              <Label htmlFor="capacity">Capacité (m³) *</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity_m3}
                onChange={(e) => setFormData({...formData, capacity_m3: Number(e.target.value)})}
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="occupancy">Occupation actuelle (m³)</Label>
              <Input
                id="occupancy"
                type="number"
                value={formData.current_occupancy_m3}
                onChange={(e) => setFormData({...formData, current_occupancy_m3: Number(e.target.value)})}
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Description de l'entrepôt, spécificités..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={editingWarehouse ? handleUpdateWarehouse : handleCreateWarehouse}
              disabled={loading || !formData.name || !formData.city || !formData.address}
            >
              {loading ? 'Sauvegarde...' : (editingWarehouse ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MultiWarehouseManager;
