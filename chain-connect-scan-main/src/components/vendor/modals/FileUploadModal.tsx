import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Upload, 
  FileText, 
  X, 
  Check,
  AlertCircle,
  Download,
  Eye
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shopId: string;
}

export function FileUploadModal({ isOpen, onClose, onSuccess, shopId }: FileUploadModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    download_limit: '5',
    category: 'ebook'
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadDigitalProduct = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('digital-products')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('digital-products')
        .getPublicUrl(filePath);

      setUploadProgress(75);

      // Create product record - FIXED: removed shop_id field that doesn't exist
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          name: productData.name.trim(),
          description: productData.description.trim(),
          price: parseFloat(productData.price),
          type: 'digital',
          category: productData.category,
          digital_file_url: publicUrl,
          download_limit: parseInt(productData.download_limit),
          is_active: true,
          currency: 'GNF',
          stock_quantity: 0 // For digital products
        })
        .select()
        .single();

      if (productError) {
        console.error('Product insertion error:', productError);
        throw productError;
      }

      console.log('Product created successfully:', newProduct);

      setUploadProgress(100);

      toast({
        title: "Produit numérique créé !",
        description: `${productData.name} a été ajouté avec succès`,
      });

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Error uploading digital product:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'uploader le fichier",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setProductData({
      name: '',
      description: '',
      price: '',
      download_limit: '5',
      category: 'ebook'
    });
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-purple-600" />
            Téléverser un produit numérique
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Sélectionner le fichier</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-purple-400 bg-purple-50'
                    : selectedFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.epub,.mp3,.mp4,.zip,.rar"
                />
                
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-green-700">{selectedFile.name}</p>
                      <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                      className="ml-auto"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      Glissez votre fichier ici ou cliquez pour sélectionner
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF, DOC, EPUB, MP3, MP4, ZIP, RAR (Max 100MB)
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Informations du produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={productData.name}
                  onChange={(e) => setProductData({...productData, name: e.target.value})}
                  placeholder="Mon super e-book"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={productData.description}
                  onChange={(e) => setProductData({...productData, description: e.target.value})}
                  placeholder="Décrivez votre produit numérique..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Prix (GNF) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={productData.price}
                    onChange={(e) => setProductData({...productData, price: e.target.value})}
                    placeholder="50000"
                  />
                </div>
                <div>
                  <Label htmlFor="download_limit">Limite de téléchargement</Label>
                  <Input
                    id="download_limit"
                    type="number"
                    value={productData.download_limit}
                    onChange={(e) => setProductData({...productData, download_limit: e.target.value})}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={productData.category}
                  onChange={(e) => setProductData({...productData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ebook">E-book</option>
                  <option value="software">Logiciel</option>
                  <option value="course">Cours en ligne</option>
                  <option value="template">Template</option>
                  <option value="music">Musique</option>
                  <option value="video">Vidéo</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Upload Progress */}
          {loading && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Upload en cours...</span>
                    <span className="text-sm text-gray-500">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={uploadDigitalProduct}
              disabled={!selectedFile || !productData.name || !productData.price || loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Créer le produit
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}