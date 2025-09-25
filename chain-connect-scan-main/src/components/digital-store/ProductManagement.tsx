import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Upload,
  FileText,
  Video,
  Image,
  Download,
  DollarSign,
  Settings,
  Sparkles
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  images: string[];
  digital?: {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    downloadLimit: number;
    requiresWatermark: boolean;
  };
  auto_delivery_enabled: boolean;
  promotion_active: boolean;
  promotion_discount?: number;
  created_at: string;
}

interface ProductManagementProps {
  shopId: string;
}

export function ProductManagement({ shopId }: ProductManagementProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    type: 'digital',
    category_id: '',
    auto_delivery_enabled: true,
    digital: {
      downloadLimit: 5,
      requiresWatermark: false
    }
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [shopId]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const { data, error } = await supabase.functions.invoke('products', {
        method: 'POST',
        body: {
          ...formData,
          shop_id: shopId,
          seller_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;

      setProducts(prev => [data.product, ...prev]);
      setFormData({
        name: '',
        description: '',
        price: 0,
        type: 'digital',
        category_id: '',
        auto_delivery_enabled: true,
        digital: {
          downloadLimit: 5,
          requiresWatermark: false
        }
      });
      setShowCreateForm(false);
      toast.success('Produit créé avec succès !');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Erreur lors de la création du produit');
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('digital-products')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('digital-products')
        .getPublicUrl(fileName);

      // Update form data with file info
      setFormData(prev => ({
        ...prev,
        digital: {
          ...prev.digital,
          fileUrl: publicUrl,
          fileName: file.name,
          fileSize: file.size
        }
      }));

      toast.success('Fichier uploadé avec succès !');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  };

  const getProductIcon = (type: string) => {
    switch (type) {
      case 'ebook':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'image':
        return <Image className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="animate-pulse">Chargement des produits...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des produits</h2>
          <p className="text-muted-foreground">
            Gérez vos produits numériques avec livraison automatique
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      {/* Create Product Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouveau produit numérique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Nom du produit</Label>
                  <Input
                    id="product-name"
                    placeholder="Ex: Formation React Avancée"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-price">Prix (GNF)</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  placeholder="Décrivez votre produit en détail..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-type">Type de produit</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ebook">E-book</SelectItem>
                      <SelectItem value="video">Vidéo</SelectItem>
                      <SelectItem value="course">Formation</SelectItem>
                      <SelectItem value="software">Logiciel</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="download-limit">Limite de téléchargements</Label>
                  <Input
                    id="download-limit"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.digital.downloadLimit}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      digital: { ...prev.digital, downloadLimit: Number(e.target.value) }
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Switch
                      checked={formData.auto_delivery_enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_delivery_enabled: checked }))}
                    />
                    Livraison automatique
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Le produit sera délivré automatiquement après paiement
                  </p>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Fichier du produit</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.mp4,.zip,.epub,.mp3,.wav"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Cliquez pour uploader</p>
                    <p className="text-xs text-muted-foreground">
                      PDF, MP4, ZIP, EPUB, MP3, WAV (max 100MB)
                    </p>
                  </label>
                  {uploading && (
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button type="submit" className="flex-1">
                  Créer le produit
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getProductIcon(product.type)}
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setEditingProduct(product)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{product.price.toLocaleString()} GNF</span>
                </div>
                {product.promotion_active && (
                  <Badge variant="secondary" className="text-xs">
                    -{product.promotion_discount}%
                  </Badge>
                )}
              </div>

              {product.digital && (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Taille :</span>
                    <span>{formatFileSize(product.digital.fileSize)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Téléchargements :</span>
                    <span>{product.digital.downloadLimit} max</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {product.auto_delivery_enabled ? (
                    <Badge variant="secondary" className="text-xs">
                      Auto-livraison
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Manuel
                    </Badge>
                  )}
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !showCreateForm && (
        <Card className="text-center py-12">
          <CardHeader>
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Aucun produit</CardTitle>
            <CardDescription>
              Créez votre premier produit numérique pour commencer à vendre
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowCreateForm(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Créer mon premier produit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}