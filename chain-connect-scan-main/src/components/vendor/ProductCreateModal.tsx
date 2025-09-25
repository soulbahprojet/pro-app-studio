import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Wand2, Image, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProductCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

interface ProductForm {
  name: string;
  category: string;
  description: string;
  stock: number;
  price: number;
  image: File | null;
}

const ProductCreateModal: React.FC<ProductCreateModalProps> = ({
  isOpen,
  onClose,
  onProductCreated
}) => {
  const [form, setForm] = useState<ProductForm>({
    name: '',
    category: '',
    description: '',
    stock: 0,
    price: 0,
    image: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = [
    'Électronique',
    'Vêtements',
    'Alimentation',
    'Beauté & Santé',
    'Maison & Jardin',
    'Sport & Loisirs',
    'Livres & Média',
    'Automobile',
    'Autres'
  ];

  const handleInputChange = (field: keyof ProductForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const generateAIDescription = async () => {
    if (!form.name) {
      toast.error('Veuillez entrer un nom de produit d\'abord');
      return;
    }

    setIsAILoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-product-optimization', {
        body: {
          action: 'generate_description',
          productData: {
            name: form.name,
            category: form.category,
            description: form.description,
            price: form.price
          }
        }
      });

      if (error) throw error;
      
      setForm(prev => ({ ...prev, description: data.result }));
      toast.success('Description générée avec succès');
    } catch (error) {
      console.error('Erreur génération description:', error);
      toast.error('Erreur lors de la génération de la description');
    } finally {
      setIsAILoading(false);
    }
  };

  const generateAIImage = async () => {
    if (!form.name) {
      toast.error('Veuillez entrer un nom de produit d\'abord');
      return;
    }

    setIsAILoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-generator', {
        body: {
          title: form.name,
          description: form.description || form.category
        }
      });

      if (error) throw error;
      
      setImagePreview(data.imageUrl);
      toast.success('Image générée avec succès');
    } catch (error) {
      console.error('Erreur génération image:', error);
      toast.error('Erreur lors de la génération de l\'image');
    } finally {
      setIsAILoading(false);
    }
  };

  const optimizeTitle = async () => {
    if (!form.name) {
      toast.error('Veuillez entrer un nom de produit d\'abord');
      return;
    }

    setIsAILoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-product-optimization', {
        body: {
          action: 'optimize_title',
          productData: {
            name: form.name,
            category: form.category,
            description: form.description,
            price: form.price
          }
        }
      });

      if (error) throw error;
      
      setForm(prev => ({ ...prev, name: data.result }));
      toast.success('Titre optimisé avec succès');
    } catch (error) {
      console.error('Erreur optimisation titre:', error);
      toast.error('Erreur lors de l\'optimisation du titre');
    } finally {
      setIsAILoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      let imageUrl = null;
      if (form.image) {
        const fileExt = form.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, form.image);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      } else if (imagePreview && imagePreview.startsWith('http')) {
        imageUrl = imagePreview;
      }

      const { error } = await supabase
        .from('products')
        .insert({
          name: form.name,
          description: form.description,
          price: form.price,
          stock_quantity: form.stock,
          category: form.category,
          images: imageUrl ? [imageUrl] : [],
          seller_id: user.id,
          is_active: true
        });

      if (error) throw error;

      toast.success('Produit créé avec succès');
      onProductCreated();
      onClose();
      
      // Reset form
      setForm({
        name: '',
        category: '',
        description: '',
        stock: 0,
        price: 0,
        image: null
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Erreur création produit:', error);
      toast.error('Erreur lors de la création du produit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un nouveau produit</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Nom et optimisation titre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <div className="flex space-x-2">
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Entrez le nom du produit"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={optimizeTitle}
                disabled={isAILoading || !form.name}
              >
                <Wand2 className="w-4 h-4 mr-1" />
                Optimiser
              </Button>
            </div>
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={form.category} onValueChange={(value) => handleInputChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description avec IA */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <div className="space-y-2">
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Description du produit"
                rows={4}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateAIDescription}
                disabled={isAILoading || !form.name}
                className="w-full"
              >
                <FileText className="w-4 h-4 mr-2" />
                Générer description avec IA
              </Button>
            </div>
          </div>

          {/* Prix et Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Prix (GNF)</Label>
              <Input
                id="price"
                type="number"
                value={form.price}
                onChange={(e) => handleInputChange('price', Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                value={form.stock}
                onChange={(e) => handleInputChange('stock', Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          {/* Image */}
          <div className="space-y-2">
            <Label>Image du produit</Label>
            <Card>
              <CardContent className="p-4">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Aperçu"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="flex space-x-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAIImage}
                        disabled={isAILoading || !form.name}
                      >
                        <Image className="w-4 h-4 mr-1" />
                        IA
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <div className="space-y-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <p className="text-sm text-muted-foreground">ou</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateAIImage}
                        disabled={isAILoading || !form.name}
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Générer avec IA
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || isAILoading}
            >
              {isLoading ? 'Création...' : 'Créer le produit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductCreateModal;