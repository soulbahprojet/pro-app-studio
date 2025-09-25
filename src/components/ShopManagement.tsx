import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProfessionalShopCreation } from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import {
  Store,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Eye,
  EyeOff,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface ShopInfo {
  id: string;
  shop_name: string;
  description: string | null;
  business_address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  business_hours: any;
  business_type: string | null;
  shop_category: string | null;
  is_active: boolean;
  subscription_plan: string;
  product_count: number;
  created_at: string;
}

interface ShopManagementProps {
  onEditShop: () => void;
}

export function ShopManagement({ onEditShop }: ShopManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shop, setShop] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showCreateShop, setShowCreateShop] = useState(false);
  
  const [editForm, setEditForm] = useState({
    shop_name: '',
    description: '',
    business_address: '',
    contact_phone: '',
    contact_email: '',
    business_hours: {}
  });

  useEffect(() => {
    if (user) {
      loadShopData();
    }
  }, [user]);

  const loadShopData = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_shops')
        .select('*')
        .eq('seller_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const shopData: ShopInfo = {
          id: data.id,
          shop_name: data.shop_name,
          description: data.description,
          business_address: data.business_address,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
          business_hours: data.business_hours,
          business_type: data.business_type,
          shop_category: data.shop_category,
          is_active: data.is_active,
          subscription_plan: data.subscription_plan,
          product_count: data.product_count,
          created_at: data.created_at
        };
        setShop(shopData);
        setEditForm({
          shop_name: data.shop_name,
          description: data.description || '',
          business_address: data.business_address || '',
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          business_hours: data.business_hours || {}
        });
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la boutique",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!shop) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('seller_shops')
        .update(editForm)
        .eq('id', shop.id);

      if (error) throw error;

      toast({
        title: "Boutique mise à jour",
        description: "Les modifications ont été sauvegardées avec succès"
      });

      await loadShopData();
      setEditing(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder les modifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleShopStatus = async () => {
    if (!shop) return;
    
    try {
      const { error } = await supabase
        .from('seller_shops')
        .update({ is_active: !shop.is_active })
        .eq('id', shop.id);

      if (error) throw error;

      toast({
        title: shop.is_active ? "Boutique désactivée" : "Boutique activée",
        description: shop.is_active 
          ? "Votre boutique n'est plus visible sur le marketplace" 
          : "Votre boutique est maintenant visible sur le marketplace"
      });

      await loadShopData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  const handleDeleteShop = async () => {
    if (!shop) return;
    
    setDeleting(true);
    try {
      // Supprimer d'abord les produits associés
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .eq('seller_id', user?.id);

      if (productsError) throw productsError;

      // Supprimer la boutique
      const { error: shopError } = await supabase
        .from('seller_shops')
        .delete()
        .eq('id', shop.id);

      if (shopError) throw shopError;

      toast({
        title: "Boutique supprimée",
        description: "Votre boutique et tous ses produits ont été supprimés définitivement"
      });

      setShop(null);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la boutique",
        variant: "destructive"
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatBusinessHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') return 'Non renseigné';
    
    const days = {
      monday: 'Lun',
      tuesday: 'Mar',
      wednesday: 'Mer',
      thursday: 'Jeu',
      friday: 'Ven',
      saturday: 'Sam',
      sunday: 'Dim'
    };
    
    const openDays = Object.entries(hours)
      .filter(([_, data]: [string, any]) => !data.closed)
      .map(([day, data]: [string, any]) => `${days[day as keyof typeof days]}: ${data.open}-${data.close}`)
      .join(', ');
    
    return openDays || 'Fermé';
  };

  const getShopTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'physical-products': 'Produits physiques',
      'digital-services': 'Services numériques',
      'restaurant': 'Restaurant/Livraison',
      'beauty-salon': 'Salon de beauté',
      'professional-services': 'Services professionnels',
      'events': 'Événementiel',
      'education': 'Éducation/Formation',
      'health-wellness': 'Santé/Bien-être',
      'artisanal': 'Artisanat',
      'transport': 'Transport',
      'agriculture': 'Agriculture',
      'entertainment': 'Divertissement',
      'fashion-specialized': 'Mode spécialisée',
      'home-services': 'Services à domicile',
      'mixed': 'Boutique mixte'
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <Card>
        <CardHeader className="text-center">
          <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <CardTitle>Aucune boutique trouvée</CardTitle>
          <p className="text-muted-foreground">
            Vous n'avez pas encore créé de boutique professionnelle
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => {
            console.log('Bouton cliqué - Ouverture de la création de boutique');
            setShowCreateShop(true);
          }}>
            <Store className="mr-2 h-4 w-4" />
            Créer une boutique
          </Button>
        </CardContent>
      </Card>
    );
  }

  console.log('showCreateShop state:', showCreateShop);
  
  return (
    <>
      {showCreateShop && (
        <ProfessionalShopCreation 
          isOpen={showCreateShop}
          onClose={() => {
            console.log('Fermeture de la modal de création');
            setShowCreateShop(false);
          }}
          onSuccess={() => {
            console.log('Boutique créée avec succès');
            setShowCreateShop(false);
            loadShopData();
          }}
        />
      )}
      
      <div className="space-y-6">
        {/* En-tête avec statut et actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{shop.shop_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={shop.is_active ? "default" : "secondary"}>
                      {shop.is_active ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Boutique active
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3 w-3 mr-1" />
                          Boutique inactive
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline">
                      {getShopTypeDisplayName(shop.business_type)}
                    </Badge>
                    <Badge variant="outline">
                      Plan {shop.subscription_plan}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleToggleShopStatus}
                  className={shop.is_active ? "text-orange-600 border-orange-600" : "text-green-600 border-green-600"}
                >
                  {shop.is_active ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Activer
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setEditing(!editing)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {editing ? 'Annuler' : 'Modifier'}
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Supprimer la boutique
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Votre boutique "{shop.shop_name}" et tous ses produits ({shop.product_count} produits) seront définitivement supprimés du marketplace.
                        <br /><br />
                        Êtes-vous sûr de vouloir continuer ?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteShop}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? 'Suppression...' : 'Supprimer définitivement'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informations de la boutique */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div>
                    <Label htmlFor="edit_shop_name">Nom de la boutique</Label>
                    <Input
                      id="edit_shop_name"
                      value={editForm.shop_name}
                      onChange={(e) => setEditForm({...editForm, shop_name: e.target.value})}
                      placeholder="Nom de votre boutique"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit_description">Description</Label>
                    <Textarea
                      id="edit_description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      placeholder="Description de votre activité..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit_address">Adresse</Label>
                    <Textarea
                      id="edit_address"
                      value={editForm.business_address}
                      onChange={(e) => setEditForm({...editForm, business_address: e.target.value})}
                      placeholder="Adresse complète..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit_phone">Téléphone</Label>
                      <Input
                        id="edit_phone"
                        value={editForm.contact_phone}
                        onChange={(e) => setEditForm({...editForm, contact_phone: e.target.value})}
                        placeholder="+224 XXX XXX XXX"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit_email">Email</Label>
                      <Input
                        id="edit_email"
                        type="email"
                        value={editForm.contact_email}
                        onChange={(e) => setEditForm({...editForm, contact_email: e.target.value})}
                        placeholder="contact@boutique.com"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleSaveChanges} disabled={loading}>
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {shop.description || 'Aucune description'}
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Adresse</p>
                        <p className="text-sm text-muted-foreground">
                          {shop.business_address || 'Non renseignée'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Téléphone</p>
                        <p className="text-sm text-muted-foreground">
                          {shop.contact_phone || 'Non renseigné'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">
                          {shop.contact_email || 'Non renseigné'}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horaires et statistiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Horaires d'ouverture</h4>
                <p className="text-sm text-muted-foreground">
                  {formatBusinessHours(shop.business_hours)}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Produits</span>
                  <span className="text-sm text-muted-foreground">{shop.product_count}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Plan d'abonnement</span>
                  <Badge variant="outline" className="text-xs">
                    {shop.subscription_plan}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Créée le</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

export default ShopManagement;
