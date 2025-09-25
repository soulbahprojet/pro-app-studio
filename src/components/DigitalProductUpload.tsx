import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Image, Music, Video, Archive, AlertCircle, CheckCircle } from 'lucide-react';
import { Product, Currency } from '@/types';

interface DigitalProductUploadProps {
  sellerId: string;
  onProductCreated: (product: Product) => void;
}

const DigitalProductUpload: React.FC<DigitalProductUploadProps> = ({ sellerId, onProductCreated }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'GNF' as Currency,
    downloadLimit: 3,
    requiresWatermark: false
  });

  // Types de fichiers autorisés
  const allowedTypes = {
    'application/pdf': { icon: FileText, label: 'PDF', color: 'text-red-600' },
    'application/epub+zip': { icon: FileText, label: 'EPUB', color: 'text-blue-600' },
    'application/zip': { icon: Archive, label: 'ZIP', color: 'text-gray-600' },
    'audio/mpeg': { icon: Music, label: 'MP3', color: 'text-green-600' },
    'audio/mp3': { icon: Music, label: 'MP3', color: 'text-green-600' },
    'video/mp4': { icon: Video, label: 'MP4', color: 'text-purple-600' },
    'image/png': { icon: Image, label: 'PNG', color: 'text-blue-500' },
    'image/jpeg': { icon: Image, label: 'JPG', color: 'text-blue-500' },
  };

  const maxFileSize = 200 * 1024 * 1024; // 200MB

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille
    if (file.size > maxFileSize) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 200MB.",
        variant: "destructive",
      });
      return;
    }

    // Vérifier le type
    const isAllowed = Object.keys(allowedTypes).includes(file.type) || 
                     file.name.match(/\.(pdf|epub|mp3|mp4|zip|png|jpg|jpeg|apk|exe)$/i);
    
    if (!isAllowed) {
      toast({
        title: "Type de fichier non autorisé",
        description: "Types autorisés : PDF, EPUB, MP3, MP4, ZIP, PNG, JPG",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const simulateUploadToSupabase = async (file: File): Promise<string> => {
    // Simulation d'upload vers Supabase Storage
    // En production, utiliser supabase.storage.from('digital-products').upload()
    
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        setUploadProgress(Math.min(progress, 90));
        
        if (progress >= 90) {
          clearInterval(interval);
          setUploadProgress(100);
          
          // Générer une clé de fichier simulée
          const fileKey = `digital/${Date.now()}-${file.name}`;
          setTimeout(() => resolve(fileKey), 500);
        }
      }, 200);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Fichier requis",
        description: "Veuillez sélectionner un fichier à uploader.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload du fichier vers Supabase Storage
      const fileKey = await simulateUploadToSupabase(selectedFile);
      
      // 2. Créer le produit numérique
      const product: Product = {
        id: `prod_${Date.now()}`,
        sellerId,
        name: formData.name,
        description: formData.description,
        price: {
          amount: Number(formData.price),
          currency: formData.currency,
        },
        stock: 99999, // Illimité pour les produits numériques
        images: [], // Pas d'images pour les produits numériques
        attributes: {},
        status: 'active',
        type: 'digital',
        digital: {
          fileKey,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          downloadLimit: formData.downloadLimit,
          downloadsCount: 0,
          requiresWatermark: formData.requiresWatermark && selectedFile.type === 'application/pdf'
        },
        createdAt: new Date().toISOString(),
      };

      // 3. Sauvegarder en base de données (simulation)
      // En production : insertion dans Supabase
      setTimeout(() => {
        onProductCreated(product);
        
        toast({
          title: "Produit numérique créé !",
          description: `${product.name} a été uploadé avec succès.`,
        });

        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          currency: 'GNF',
          downloadLimit: 3,
          requiresWatermark: false
        });
        setSelectedFile(null);
        setUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Une erreur est survenue lors de l'upload du fichier.",
        variant: "destructive",
      });
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileIcon = (file: File) => {
    const typeInfo = allowedTypes[file.type as keyof typeof allowedTypes];
    if (typeInfo) {
      const Icon = typeInfo.icon;
      return <Icon className={`w-8 h-8 ${typeInfo.color}`} />;
    }
    return <FileText className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Upload Produit Numérique
        </CardTitle>
        <CardDescription>
          Uploadez vos fichiers numériques (PDF, EPUB, MP3, MP4, ZIP, etc.) pour les vendre sur la plateforme
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations produit */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du produit</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Guide PDF Marketing Digital"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Décrivez votre produit numérique..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="currency">Devise</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
                  className="w-full border border-input rounded-md px-3 py-2 bg-background"
                >
                  <option value="GNF">GNF</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="XOF">XOF</option>
                  <option value="CNY">CNY</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="downloadLimit">Limite de téléchargements par achat</Label>
              <Input
                id="downloadLimit"
                type="number"
                value={formData.downloadLimit}
                onChange={(e) => setFormData({ ...formData, downloadLimit: Number(e.target.value) })}
                min="1"
                max="10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="watermark"
                checked={formData.requiresWatermark}
                onChange={(e) => setFormData({ ...formData, requiresWatermark: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="watermark">Ajouter un watermark (PDFs uniquement)</Label>
            </div>
          </div>

          {/* Zone d'upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            <div className="text-center">
              {!selectedFile ? (
                <div>
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Choisissez votre fichier</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Types supportés : PDF, EPUB, MP3, MP4, ZIP, PNG, JPG (max 200MB)
                  </p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.epub,.mp3,.mp4,.zip,.png,.jpg,.jpeg,.apk,.exe"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" asChild>
                      <span>Parcourir les fichiers</span>
                    </Button>
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-4">
                  {getFileIcon(selectedFile)}
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                    <Badge variant="outline" className="mt-1">
                      {allowedTypes[selectedFile.type as keyof typeof allowedTypes]?.label || 'Fichier'}
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Changer
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar pendant upload */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Upload en cours...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Bouton submit */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={uploading || !selectedFile}
            variant="hero"
          >
            {uploading ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Créer le produit numérique
              </>
            )}
          </Button>
        </form>

        {/* Informations de sécurité */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 mb-1">Sécurité & Protection</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Fichiers stockés de manière sécurisée</li>
                <li>• Liens de téléchargement expirables</li>
                <li>• Limitation du nombre de téléchargements</li>
                <li>• Watermark automatique pour les PDFs (si activé)</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DigitalProductUpload;
