import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Badge } from '../../ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Upload,
  X
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  is_active: boolean;
  stock_quantity: number;
  type: 'physical' | 'digital';
  created_at: string;
  updated_at: string;
}

export default function VendorProducts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'GNF',
    category: '',
    stock_quantity: 0,
    type: 'physical' as 'physical' | 'digital',
    is_active: true
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  useEffect(() => {
    if (user) {
      loadProducts();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (files: File[]) => {
    const imageUrls: string[] = [];
    
    for (const file of files) {
      try {
        const fileName = `${user?.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        imageUrls.push(urlData.publicUrl);
      } catch (error) {
        console.error('Erreur upload image:', error);
        toast({
          title: "Erreur",
          description: `Impossible d'uploader l'image ${file.name}`,
          variant: "destructive"
        });
      }
    }

    return imageUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrls: string[] = [];
      
      if (selectedImages.length > 0) {
        imageUrls = await handleImageUpload(selectedImages);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        currency: formData.currency as 'GNF' | 'USD' | 'EUR' | 'XOF' | 'CNY',
        category: formData.category,
        stock_quantity: formData.stock_quantity,
        type: formData.type,
        is_active: formData.is_active,
        seller_id: user?.id,
        images: editingProduct ? 
          [...(editingProduct.images || []), ...imageUrls, ...generatedImages] : 
          [...imageUrls, ...generatedImages]
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Produit modifié",
          description: "Le produit a été modifié avec succès"
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;

        toast({
          title: "Produit créé",
          description: "Le produit a été créé avec succès"
        });
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Erreur sauvegarde produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le produit",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      currency: 'GNF',
      category: '',
      stock_quantity: 0,
      type: 'physical',
      is_active: true
    });
    setSelectedImages([]);
    setGeneratedImages([]);
    setShowForm(false);
    setEditingProduct(null);
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      currency: product.currency,
      category: product.category || '',
      stock_quantity: product.stock_quantity || 0,
      type: product.type,
      is_active: product.is_active
    });
    setShowForm(true);
  };

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Statut modifié",
        description: `Produit ${!isActive ? 'activé' : 'désactivé'}`
      });

      loadProducts();
    } catch (error) {
      console.error('Erreur changement statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de changer le statut du produit",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès"
      });

      loadProducts();
    } catch (error) {
      console.error('Erreur suppression produit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive"
      });
    }
  };

  const handleAIOptimization = async (action: 'generateDescription' | 'optimizeAll') => {
    if (!formData.name) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord saisir le nom du produit",
        variant: "destructive"
      });
      return;
    }

    setAiOptimizing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-product-optimization', {
        body: {
          action: action === 'generateDescription' ? 'generate_description' : 'optimize_title',
          productData: {
            name: formData.name,
            description: formData.description,
            price: formData.price,
            category: formData.category,
            currency: formData.currency
          }
        }
      });

      if (error) throw error;

      if (action === 'generateDescription' && data.result) {
        setFormData({ ...formData, description: data.result });
        toast({
          title: "Description générée",
          description: "Une description optimisée a été générée par l'IA"
        });
      } else if (action === 'optimizeAll' && data.result) {
        // Parse the AI response to extract the optimized title
        const optimizedTitle = data.result.split('\n').find((line: string) => 
          line.includes('1.') || line.includes('-')
        )?.replace(/^\d+\.\s*|-\s*/, '').trim();
        
        if (optimizedTitle) {
          setFormData({ ...formData, name: optimizedTitle });
          toast({
            title: "Titre optimisé", 
            description: "Le titre a été optimisé par l'IA"
          });
        }
      }
    } catch (error) {
      console.error('Erreur optimisation AI:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'optimiser le produit avec l'IA",
        variant: "destructive"
      });
    } finally {
      setAiOptimizing(false);
    }
  };

  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleImageGeneration = async () => {
    if (!formData.name) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord saisir le nom du produit",
        variant: "destructive"
      });
      return;
    }

    setGeneratingImage(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          title: formData.name,
          description: formData.description || ''
        }
      });

      if (error) {
        console.error('Error generating image:', error);
        // Show more specific error message from the function
        const errorMsg = error.message || 'Impossible de générer l\'image automatiquement';
        throw new Error(errorMsg);
      }

      if (data.imageUrl) {
        // Add the generated image URL to the generated images array
        setGeneratedImages(prev => [...prev, data.imageUrl]);
        
        toast({
          title: "Image générée",
          description: "Une image a été générée automatiquement pour votre produit"
        });
      }
    } catch (error: any) {
      console.error('Erreur génération image:', error);
      
      // Show more specific error message
      let errorMessage = "Impossible de générer l'image automatiquement";
      
      if (error.message && error.message.includes('Hugging Face')) {
        errorMessage = "Problème avec l'API Hugging Face. Vérifiez votre token d'accès.";
      } else if (error.message && error.message.includes('rate limit')) {
        errorMessage = "Trop de requêtes. Veuillez patienter et réessayer.";
      } else if (error.message && error.message.includes('token')) {
        errorMessage = "Token Hugging Face invalide. Vérifiez votre configuration.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setGeneratingImage(false);
    }
  };

  const removeGeneratedImage = (index: number) => {
    setGeneratedImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mes Produits</h2>
          <p className="text-muted-foreground">{products.length} produit(s)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} data-add-product-button>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Annuler' : 'Ajouter un produit'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du produit *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Prix *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GNF">GNF</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Type de produit</Label>
                  <Select value={formData.type} onValueChange={(value: 'physical' | 'digital') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Physique</SelectItem>
                      <SelectItem value="digital">Numérique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="description">Description</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAIOptimization('generateDescription')}
                    disabled={!formData.name}
                  >
                    🤖 AI générateur de descriptions
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Bouton AI pour optimiser titre et prix */}
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIOptimization('optimizeAll')}
                  disabled={!formData.name}
                >
                  ✨ Optimisation de prix et titre
                </Button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="images">Images du produit</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleImageGeneration}
                    disabled={!formData.name || generatingImage}
                  >
                    {generatingImage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    ) : (
                      <>🖼️ Générer image automatique</>
                    )}
                  </Button>
                </div>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedImages(Array.from(e.target.files || []))}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedImages.length} image(s) sélectionnée(s)
                  {editingProduct && editingProduct.images && editingProduct.images.length > 0 && (
                    <> • {editingProduct.images.length} image(s) existante(s)</>
                  )}
                  {generatedImages.length > 0 && (
                    <> • {generatedImages.length} image(s) générée(s)</>
                  )}
                </p>
              </div>

              {/* Tableau des images générées */}
              {generatedImages.length > 0 && (
                <div>
                  <Label>Images générées par IA</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b">
                      <h4 className="font-medium text-sm">Aperçu des images générées</h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {generatedImages.map((imageUrl, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                              <img 
                                src={imageUrl} 
                                alt={`Image générée ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeGeneratedImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={uploading || aiOptimizing || generatingImage}>
                  {uploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : aiOptimizing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : generatingImage ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {generatingImage ? 'Génération image...' : aiOptimizing ? 'Optimisation...' : editingProduct ? 'Modifier' : 'Créer'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square bg-muted relative">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge variant={product.is_active ? 'default' : 'secondary'}>
                  {product.is_active ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-2 truncate">
                {product.description}
              </p>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">
                  {product.price.toLocaleString()} {product.currency}
                </span>
                <Badge variant="outline">
                  Stock: {product.stock_quantity}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => editProduct(product)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => toggleProductStatus(product.id, product.is_active)}
                >
                  {product.is_active ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteProduct(product.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && !showForm && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun produit</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par ajouter votre premier produit
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
