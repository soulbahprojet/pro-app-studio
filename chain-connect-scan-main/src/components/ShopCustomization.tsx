import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShopCreationModal } from './ShopCreationModal';
import {
  Store,
  Upload,
  Palette,
  Globe,
  Image as ImageIcon,
  Video,
  Star,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Scissors,
  Facebook,
  Instagram,
  Twitter
} from 'lucide-react';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

interface SellerShop {
  id: string;
  seller_id: string;
  shop_name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  theme_color: string;
  is_active: boolean;
  custom_domain?: string;
  social_links: any;
  business_hours: any;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  video_url?: string;
  is_featured: boolean;
  featured_until?: string;
  sort_order: number;
  is_active: boolean;
  category: string;
  type: 'physical' | 'digital';
}

interface ShopCustomizationProps {
  userId: string;
  products: Product[];
  onProductUpdate: () => void;
}

const ShopCustomization: React.FC<ShopCustomizationProps> = ({ userId, products, onProductUpdate }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [shop, setShop] = useState<SellerShop | null>(null);
  const [showShopForm, setShowShopForm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProductMedia, setShowProductMedia] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);

  const [shopForm, setShopForm] = useState({
    shop_name: '',
    description: '',
    theme_color: '#3B82F6',
    custom_domain: '',
    social_links: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  const [mediaFiles, setMediaFiles] = useState<{
    images: File[];
    video: File | null;
  }>({
    images: [],
    video: null
  });

  useEffect(() => {
    loadShopData();
  }, [userId]);

  const loadShopData = async () => {
    try {
      const { data, error } = await supabase
        .from('seller_shops')
        .select('*')
        .eq('seller_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setShop(data);
        setShopForm({
          shop_name: data.shop_name,
          description: data.description || '',
          theme_color: data.theme_color,
          custom_domain: data.custom_domain || '',
          social_links: (data.social_links as any) || { facebook: '', instagram: '', twitter: '' }
        });
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de la boutique",
        variant: "destructive"
      });
    }
  };

  const handleShopSave = async () => {
    if (!shopForm.shop_name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la boutique est requis",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (shop) {
        // Mettre à jour
        const { error } = await supabase
          .from('seller_shops')
          .update({
            shop_name: shopForm.shop_name,
            description: shopForm.description,
            theme_color: shopForm.theme_color,
            custom_domain: shopForm.custom_domain,
            social_links: shopForm.social_links
          })
          .eq('id', shop.id);

        if (error) throw error;
      } else {
        // Créer nouvelle boutique
        const { data, error } = await supabase
          .from('seller_shops')
          .insert({
            seller_id: userId,
            shop_name: shopForm.shop_name,
            description: shopForm.description,
            theme_color: shopForm.theme_color,
            custom_domain: shopForm.custom_domain,
            social_links: shopForm.social_links
          })
          .select()
          .single();

        if (error) throw error;
        setShop(data);
      }

      await loadShopData();
      setShowShopForm(false);
      
      toast({
        title: "Succès",
        description: "Boutique sauvegardée avec succès"
      });
    } catch (error) {
      console.error('Error saving shop:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la boutique",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('digital-products')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('digital-products')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleLogoUpload = async (file: File) => {
    if (!shop) return;
    
    try {
      setUploading(true);
      const path = `shops/${shop.id}/logo_${Date.now()}.jpg`;
      const logoUrl = await uploadFile(file, path);

      const { error } = await supabase
        .from('seller_shops')
        .update({ logo_url: logoUrl })
        .eq('id', shop.id);

      if (error) throw error;

      await loadShopData();
      toast({
        title: "Succès",
        description: "Logo mis à jour avec succès"
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le logo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!shop) return;
    
    try {
      setUploading(true);
      const path = `shops/${shop.id}/banner_${Date.now()}.jpg`;
      const bannerUrl = await uploadFile(file, path);

      const { error } = await supabase
        .from('seller_shops')
        .update({ banner_url: bannerUrl })
        .eq('id', shop.id);

      if (error) throw error;

      await loadShopData();
      toast({
        title: "Succès",
        description: "Bannière mise à jour avec succès"
      });
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger la bannière",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveBackground = async (file: File): Promise<Blob> => {
    try {
      setRemovingBg(true);
      const image = await loadImage(file);
      const processedBlob = await removeBackground(image);
      
      toast({
        title: "Succès",
        description: "Arrière-plan supprimé avec succès"
      });
      
      return processedBlob;
    } catch (error) {
      console.error('Error removing background:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'arrière-plan",
        variant: "destructive"
      });
      throw error;
    } finally {
      setRemovingBg(false);
    }
  };

  const toggleProductFeature = async (productId: string, featured: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({
          is_featured: featured,
          featured_until: featured ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
        })
        .eq('id', productId);

      if (error) throw error;

      onProductUpdate();
      toast({
        title: "Succès",
        description: `Produit ${featured ? 'mis en avant' : 'retiré de la mise en avant'}`
      });
    } catch (error) {
      console.error('Error updating product feature:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la mise en avant",
        variant: "destructive"
      });
    }
  };

  const updateProductOrder = async (productId: string, direction: 'up' | 'down') => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const newOrder = direction === 'up' ? product.sort_order - 1 : product.sort_order + 1;

      const { error } = await supabase
        .from('products')
        .update({ sort_order: newOrder })
        .eq('id', productId);

      if (error) throw error;

      onProductUpdate();
    } catch (error) {
      console.error('Error updating product order:', error);
    }
  };

  return (
    <div className="space-y-6 mt-8">
      {!shop ? (
        <>
          <Card>
            <CardHeader className="text-center">
              <Store className="h-12 w-12 mx-auto text-muted-foreground" />
              <CardTitle>Créez votre boutique professionnelle</CardTitle>
              <CardDescription>
                Configurez votre boutique en ligne avec nos plans Basic, Standard ou Premium. 
                Tout ce dont vous avez besoin pour vendre vos produits en une seule interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                size="lg"
              >
                <Store className="mr-2 h-5 w-5" />
                Créer une boutique
              </Button>
            </CardContent>
          </Card>

          <ShopCreationModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              loadShopData();
            }}
          />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Personnalisation de la Boutique</h2>
            <Dialog open={showShopForm} onOpenChange={setShowShopForm}>
              <DialogTrigger asChild>
                <Button>
                  <Store className="h-4 w-4 mr-2" />
                  {shop ? 'Modifier Boutique' : 'Créer Boutique'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{shop ? 'Modifier' : 'Créer'} votre Boutique</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nom de la boutique</Label>
                    <Input
                      value={shopForm.shop_name}
                      onChange={(e) => setShopForm({...shopForm, shop_name: e.target.value})}
                      placeholder="Ma Super Boutique"
                    />
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={shopForm.description}
                      onChange={(e) => setShopForm({...shopForm, description: e.target.value})}
                      placeholder="Description de votre boutique..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Couleur du thème</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={shopForm.theme_color}
                          onChange={(e) => setShopForm({...shopForm, theme_color: e.target.value})}
                          className="w-20 h-10"
                        />
                        <Input
                          value={shopForm.theme_color}
                          onChange={(e) => setShopForm({...shopForm, theme_color: e.target.value})}
                          placeholder="#3B82F6"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Domaine personnalisé</Label>
                      <Input
                        value={shopForm.custom_domain}
                        onChange={(e) => setShopForm({...shopForm, custom_domain: e.target.value})}
                        placeholder="monsite.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Réseaux sociaux</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        <Input
                          value={shopForm.social_links.facebook}
                          onChange={(e) => setShopForm({
                            ...shopForm,
                            social_links: {...shopForm.social_links, facebook: e.target.value}
                          })}
                          placeholder="https://facebook.com/maboutique"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-pink-600" />
                        <Input
                          value={shopForm.social_links.instagram}
                          onChange={(e) => setShopForm({
                            ...shopForm,
                            social_links: {...shopForm.social_links, instagram: e.target.value}
                          })}
                          placeholder="https://instagram.com/maboutique"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-blue-400" />
                        <Input
                          value={shopForm.social_links.twitter}
                          onChange={(e) => setShopForm({
                            ...shopForm,
                            social_links: {...shopForm.social_links, twitter: e.target.value}
                          })}
                          placeholder="https://twitter.com/maboutique"
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleShopSave} className="w-full" disabled={loading}>
                    {loading ? 'Sauvegarde...' : 'Sauvegarder la Boutique'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aperçu de la boutique */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Aperçu de la Boutique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" style={{ borderColor: shop.theme_color }}>
                  {/* Bannière */}
                  <div className="relative h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden">
                    {shop.banner_url ? (
                      <img src={shop.banner_url} alt="Bannière" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        Bannière de la boutique
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-4">
                      <div className="flex items-center gap-3">
                        {shop.logo_url ? (
                          <img src={shop.logo_url} alt="Logo" className="w-16 h-16 rounded-full border-2 border-white" />
                        ) : (
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                            <Store className="h-8 w-8 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-white font-bold text-lg">{shop.shop_name}</h3>
                          <p className="text-white/80 text-sm">{shop.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge style={{ backgroundColor: shop.theme_color }}>
                      {shop.is_active ? 'Boutique Active' : 'Boutique Inactive'}
                    </Badge>
                    {shop.custom_domain && (
                      <Badge variant="outline">
                        <Globe className="h-3 w-3 mr-1" />
                        {shop.custom_domain}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload médias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Médias de la Boutique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Logo de la boutique</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoUpload(file);
                      }}
                      className="hidden"
                      id="logoUpload"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('logoUpload')?.click()}
                      disabled={uploading}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {uploading ? 'Upload...' : 'Choisir Logo'}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Bannière de la boutique</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBannerUpload(file);
                      }}
                      className="hidden"
                      id="bannerUpload"
                    />
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('bannerUpload')?.click()}
                      disabled={uploading}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {uploading ? 'Upload...' : 'Choisir Bannière'}
                    </Button>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={removingBg}
                  >
                    <Scissors className="h-4 w-4 mr-2" />
                    {removingBg ? 'Traitement...' : 'Supprimer Arrière-plan (AI)'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Suppression automatique d'arrière-plan avec IA
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gestion des produits mis en avant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Mise en Avant des Produits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProductOrder(product.id, 'up')}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateProductOrder(product.id, 'down')}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{product.name}</h4>
                          {product.is_featured && (
                            <Badge className="bg-yellow-500">
                              <Star className="h-3 w-3 mr-1" />
                              Mis en avant
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleProductFeature(product.id, !product.is_featured)}
                      >
                        {product.is_featured ? <EyeOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductMedia(true);
                        }}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ShopCustomization;