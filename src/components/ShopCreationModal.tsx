import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Store, Crown, Zap, Lock, Check, Upload, Eye, ArrowRight, Sparkles, Info, AlertTriangle, Package, X, Images, Plus, Trash2, Move } from 'lucide-react';

interface ShopCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Product {
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
}

interface ShopData {
  name: string;
  description: string;
  logo_url: string;
  banner_url: string;
  slug: string;
  subscription_plan: 'basic' | 'standard' | 'premium';
  shop_images: string[];
}

const SUBSCRIPTION_PLANS = {
  basic: {
    name: 'Basic',
    price: 0,
    currency: 'EUR',
    maxProducts: 10,
    features: [
      'Mini boutique',
      'Jusqu\'à 10 produits',
      'Gestion commandes basique',
      'Support par email'
    ],
    lockedFeatures: [
      'Promotions et codes promo',
      'Analytics avancées', 
      'SEO avancé',
      'Newsletter',
      'Domaine personnalisé',
      'Intégrations paiement avancées'
    ],
    icon: Store,
    color: 'from-slate-500 to-slate-600',
    popular: false
  },
  standard: {
    name: 'Standard',
    price: 29,
    currency: 'EUR',
    maxProducts: 'Illimité',
    features: [
      'Boutique complète',
      'Produits illimités',
      'Promotions et codes promo',
      'Analytics basiques',
      'Gestion stock avancée',
      'Support prioritaire'
    ],
    lockedFeatures: [
      'Analytics avancées détaillées',
      'Newsletter avancée',
      'SEO premium',
      'Rapports export CSV/PDF',
      'Intégrations API avancées'
    ],
    icon: Crown,
    color: 'from-blue-500 to-blue-600',
    popular: true
  },
  premium: {
    name: 'Premium',
    price: 79,
    currency: 'EUR',
    maxProducts: 'Illimité',
    features: [
      'Tout Standard +',
      'Analytics avancées complètes',
      'Newsletter professionnelle',
      'SEO premium',
      'Domaine personnalisé',
      'Intégrations API complètes',
      'Rapports détaillés',
      'Support dédié 24/7'
    ],
    lockedFeatures: [],
    icon: Zap,
    color: 'from-primary to-accent',
    popular: false
  }
};

export function ShopCreationModal({ isOpen, onClose, onSuccess }: ShopCreationModalProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [slugLoading, setSlugLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState('shop');
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [selectedLockedFeature, setSelectedLockedFeature] = useState('');
  
  // Utiliser le vrai plan depuis le profil utilisateur
  const currentPlan = profile?.subscription_plan || 'premium'; // Premium par défaut maintenant
  const currentPlanData = SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS];
  
  const [shopData, setShopData] = useState<ShopData>({
    name: '',
    description: '',
    logo_url: '',
    banner_url: '',
    slug: '',
    subscription_plan: currentPlan as 'basic' | 'standard' | 'premium',
    shop_images: []
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    currency: 'GNF',
    images: []
  });

  // États pour la gestion de collection d'images
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Limitations d'images selon le plan
  const getImageLimits = () => {
    switch (currentPlan) {
      case 'basic':
        return { max: 5, description: 'Jusqu\'à 5 images pour motion design' };
      case 'standard':
        return { max: 15, description: 'Collection complète d\'images' };
      case 'premium':
        return { max: 30, description: 'Collection complète + motion design avancé' };
      default:
        return { max: 5, description: 'Jusqu\'à 5 images' };
    }
  };

  const imageLimit = getImageLimits();

  // Fonction d'upload d'image vers Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    setUploadingImage(true);
    try {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner un fichier image valide",
          variant: "destructive"
        });
        return null;
      }

      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "L'image est trop volumineuse (5MB maximum)",
          variant: "destructive"
        });
        return null;
      }

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('shop-images')
        .upload(fileName, file);

      if (error) throw error;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('shop-images')
        .getPublicUrl(fileName);

      toast({
        title: "Image uploadée",
        description: "L'image a été téléchargée avec succès"
      });

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Erreur d'upload",
        description: error.message || "Impossible d'uploader l'image",
        variant: "destructive"
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Gérer l'upload par sélection de fichier
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (shopData.shop_images.length >= imageLimit.max) {
      setSelectedLockedFeature(`Limite de ${imageLimit.max} images atteinte`);
      setShowUpgradePrompt(true);
      return;
    }

    const imageUrl = await uploadImage(file);
    if (imageUrl) {
      setShopData(prev => ({
        ...prev,
        shop_images: [...prev.shop_images, imageUrl]
      }));
      // Reset le input
      event.target.value = '';
    }
  };

  // Gérer le drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez déposer des fichiers images valides",
        variant: "destructive"
      });
      return;
    }

    for (const file of imageFiles) {
      if (shopData.shop_images.length >= imageLimit.max) {
        setSelectedLockedFeature(`Limite de ${imageLimit.max} images atteinte`);
        setShowUpgradePrompt(true);
        break;
      }

      const imageUrl = await uploadImage(file);
      if (imageUrl) {
        setShopData(prev => ({
          ...prev,
          shop_images: [...prev.shop_images, imageUrl]
        }));
      }
    }
  };

  // Fonctions de gestion des images de la boutique
  const addShopImage = () => {
    if (!currentImageUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une URL d'image valide",
        variant: "destructive"
      });
      return;
    }

    if (shopData.shop_images.length >= imageLimit.max) {
      setSelectedLockedFeature(`Limite de ${imageLimit.max} images atteinte`);
      setShowUpgradePrompt(true);
      return;
    }

    if (shopData.shop_images.includes(currentImageUrl)) {
      toast({
        title: "Erreur",
        description: "Cette image existe déjà dans votre collection",
        variant: "destructive"
      });
      return;
    }

    setShopData(prev => ({
      ...prev,
      shop_images: [...prev.shop_images, currentImageUrl]
    }));
    setCurrentImageUrl('');
    
    toast({
      title: "Image ajoutée",
      description: "L'image a été ajoutée à votre collection"
    });
  };

  const removeShopImage = (index: number) => {
    setShopData(prev => ({
      ...prev,
      shop_images: prev.shop_images.filter((_, i) => i !== index)
    }));
    
    toast({
      title: "Image supprimée",
      description: "L'image a été retirée de votre collection"
    });
  };

  const moveShopImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...shopData.shop_images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    
    setShopData(prev => ({
      ...prev,
      shop_images: newImages
    }));
  };

  // Calculer le pourcentage de progression
  const getProgress = () => {
    let completed = 0;
    let total = 5;
    
    if (shopData.name && shopData.description) completed++;
    if (shopData.subscription_plan) completed++;
    if (products.length > 0) completed++;
    if (shopData.shop_images.length > 0) completed++;
    completed++; // Preview toujours disponible
    
    return (completed / total) * 100;
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const generateUniqueSlug = async (baseName: string) => {
    const baseSlug = generateSlug(baseName);
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      // Vérifier si le slug existe déjà
      const { data, error } = await supabase
        .from('seller_shops')
        .select('id')
        .eq('slug', slug)
        .single();
        
      if (error && error.code === 'PGRST116') {
        // Slug n'existe pas, on peut l'utiliser
        return slug;
      }
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la vérification du slug:', error);
        return `${baseSlug}-${Date.now()}`;
      }
      
      // Slug existe, essayer avec un suffixe
      slug = `${baseSlug}-${counter}`;
      counter++;
      
      // Éviter une boucle infinie
      if (counter > 100) {
        return `${baseSlug}-${Date.now()}`;
      }
    }
  };

  const handleShopNameChange = async (name: string) => {
    setShopData(prev => ({
      ...prev,
      name
    }));

    if (!name.trim()) {
      setShopData(prev => ({
        ...prev,
        slug: ''
      }));
      return;
    }

    setSlugLoading(true);
    try {
      const uniqueSlug = await generateUniqueSlug(name);
      setShopData(prev => ({
        ...prev,
        slug: uniqueSlug
      }));
    } catch (error) {
      console.error('Erreur lors de la génération du slug:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération de l'URL personnalisée",
        variant: "destructive"
      });
    } finally {
      setSlugLoading(false);
    }
  };

  const addProduct = () => {
    if (!currentProduct.name || !currentProduct.price) {
      toast({
        title: "Erreur",
        description: "Nom et prix du produit sont requis",
        variant: "destructive"
      });
      return;
    }

    const maxProducts = currentPlanData.maxProducts;
    // TEMPORAIREMENT DÉSACTIVÉ POUR TESTS
    /*if (typeof maxProducts === 'number' && products.length >= maxProducts) {
      setSelectedLockedFeature(`Limite de ${maxProducts} produits atteinte`);
      setShowUpgradePrompt(true);
      return;
    }*/

    setProducts(prev => [...prev, currentProduct]);
    setCurrentProduct({
      name: '',
      description: '',
      price: 0,
      currency: 'GNF',
      images: []
    });
    
    toast({
      title: "Produit ajouté",
      description: `${currentProduct.name} a été ajouté à votre boutique`
    });
  };

  const handleLockedFeatureClick = (feature: string) => {
    setSelectedLockedFeature(feature);
    setShowUpgradePrompt(true);
  };

  const handleUpgrade = async () => {
    try {
      // Appel à l'edge function pour upgrade
      const { data, error } = await supabase.functions.invoke('plan-payment', {
        body: {
          plan: 'standard',
          paymentMethod: 'stripe',
          amount: SUBSCRIPTION_PLANS.standard.price,
          currency: 'EUR'
        }
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Redirection vers le paiement",
          description: "Vous allez être redirigé vers Stripe pour finaliser votre upgrade"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de traiter l'upgrade",
        variant: "destructive"
      });
    }
    setShowUpgradePrompt(false);
  };

  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const createShop = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Vérification finale du slug pour éviter les duplications
      if (shopData.slug) {
        const { data: existingShop } = await supabase
          .from('seller_shops')
          .select('id')
          .eq('slug', shopData.slug)
          .single();
          
        if (existingShop) {
          // Générer un nouveau slug unique
          const newSlug = await generateUniqueSlug(shopData.name);
          setShopData(prev => ({
            ...prev,
            slug: newSlug
          }));
        }
      }

      // Create shop
      const { data: shop, error: shopError } = await supabase
        .from('seller_shops')
        .insert({
          seller_id: user.id,
          shop_name: shopData.name,
          description: shopData.description,
          logo_url: shopData.logo_url,
          banner_url: shopData.banner_url,
          slug: shopData.slug || generateSlug(shopData.name),
          subscription_plan: shopData.subscription_plan,
          shop_images: shopData.shop_images,
          product_count: products.length,
          is_active: true
        })
        .select()
        .single();

      if (shopError) throw shopError;

      // Create products
      if (products.length > 0) {
        const productsToInsert = products.map(product => ({
          seller_id: user.id,
          name: product.name,
          description: product.description,
          price: product.price,
          currency: product.currency as 'GNF' | 'USD' | 'EUR' | 'XOF' | 'CNY',
          images: product.images,
          is_active: true,
          type: 'physical' as const
        }));

        const { error: productsError } = await supabase
          .from('products')
          .insert(productsToInsert);

        if (productsError) throw productsError;
      }

      toast({
        title: "Boutique créée avec succès !",
        description: `Votre boutique "${shopData.name}" est maintenant en ligne`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const PlanCard = ({ planKey, plan, isSelected, isCurrent }: any) => {
    const Icon = plan.icon;
    
    return (
      <Card 
        className={`relative transition-all duration-300 ${
          isSelected ? 'ring-2 ring-primary shadow-xl' : 'hover:shadow-lg'
        } ${isCurrent ? 'border-2 border-primary' : ''} ${
          plan.popular ? 'border-2 border-primary' : ''
        }`}
      >
        {plan.popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-primary to-accent text-white px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" />
              Plus populaire
            </Badge>
          </div>
        )}
        
        {isCurrent && (
          <div className="absolute -top-3 right-4">
            <Badge variant="outline" className="bg-background">
              Plan actuel
            </Badge>
          </div>
        )}

        <CardHeader className="text-center pb-4">
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-gradient-to-br ${plan.color} shadow-lg mb-4`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          
          <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
          
          <div className="space-y-1">
            <div className="text-3xl font-bold">
              {plan.price === 0 ? 'Gratuit' : `${plan.price}€`}
            </div>
            {plan.price > 0 && (
              <CardDescription className="text-sm">/mois</CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Produits autorisés
            </p>
            <p className="text-lg font-bold">
              {typeof plan.maxProducts === 'number' ? `${plan.maxProducts} max` : plan.maxProducts}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-emerald-600 flex items-center">
              <Check className="h-4 w-4 mr-1" />
              Fonctionnalités incluses
            </h4>
            <ul className="space-y-2">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start text-sm">
                  <Check className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {plan.lockedFeatures.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-amber-600 flex items-center">
                <Lock className="h-4 w-4 mr-1" />
                Nécessite un upgrade
              </h4>
              <ul className="space-y-2">
                {plan.lockedFeatures.slice(0, 3).map((feature: string, index: number) => (
                  <li key={index} className="flex items-start text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.lockedFeatures.length > 3 && (
                  <li className="text-xs text-muted-foreground ml-6">
                    +{plan.lockedFeatures.length - 3} autres fonctionnalités...
                  </li>
                )}
              </ul>
            </div>
          )}

          {!isCurrent && (
            <Button 
              className="w-full"
              variant={planKey === 'basic' ? 'outline' : 'default'}
              onClick={() => planKey !== 'basic' ? handleUpgrade() : null}
            >
              {planKey === 'basic' ? (
                'Plan gratuit'
              ) : (
                <>
                  Passer à {plan.name}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Créer votre boutique professionnelle
                </DialogTitle>
                <p className="text-muted-foreground mt-2">
                  Configuration complète avec plan {currentPlanData.name}
                </p>
                <Badge variant="outline" className="ml-2">{products.length}/{currentPlanData.maxProducts} produits</Badge>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Progression</div>
                <div className="flex items-center space-x-2">
                  <Progress value={getProgress()} className="w-24" />
                  <span className="text-sm font-medium">{Math.round(getProgress())}%</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Alerte pour les fonctionnalités verrouillées */}
          {currentPlan === 'basic' && (
            <Alert className="border-amber-200 bg-amber-50">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Avec le plan Basic, certaines fonctionnalités sont limitées. 
                <Button variant="link" className="h-auto p-0 ml-1 text-amber-600" onClick={() => setShowUpgradePrompt(true)}>
                  Découvrir les plans supérieurs
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-12">
              <TabsTrigger value="shop" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
                <Store className="h-4 w-4 mr-2" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="plan" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
                <Crown className="h-4 w-4 mr-2" />
                Plan & Fonctionnalités
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
                <Package className="h-4 w-4 mr-2" />
                Produits ({products.length})
              </TabsTrigger>
              <TabsTrigger value="images" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
                <Images className="h-4 w-4 mr-2" />
                Images ({shopData.shop_images.length})
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-white">
                <Eye className="h-4 w-4 mr-2" />
                Aperçu final
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shop" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shopName">Nom de la boutique *</Label>
                    <Input
                      id="shopName"
                      value={shopData.name}
                      onChange={(e) => handleShopNameChange(e.target.value)}
                      placeholder="Ma Super Boutique"
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="slug">URL personnalisée</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md">
                        boutique.com/
                      </span>
                      <Input
                        id="slug"
                        value={shopData.slug}
                        onChange={(e) => setShopData(prev => ({ ...prev, slug: e.target.value }))}
                        className="rounded-l-none"
                        placeholder="ma-boutique"
                        disabled={loading || slugLoading}
                      />
                      {slugLoading && (
                        <div className="inline-flex items-center px-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={shopData.description}
                      onChange={(e) => setShopData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Décrivez votre boutique..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Logo de la boutique</Label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const imageUrl = await uploadImage(file);
                            if (imageUrl) {
                              setShopData(prev => ({ ...prev, logo_url: imageUrl }));
                            }
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                        id="logoUpload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="logoUpload"
                        className={`inline-flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors text-sm ${
                          uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Upload...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Uploader logo
                          </>
                        )}
                      </label>
                      <div className="text-sm text-muted-foreground">ou</div>
                      <Input
                        value={shopData.logo_url}
                        onChange={(e) => setShopData(prev => ({ ...prev, logo_url: e.target.value }))}
                        placeholder="URL du logo"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="banner">Bannière (optionnel)</Label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const imageUrl = await uploadImage(file);
                            if (imageUrl) {
                              setShopData(prev => ({ ...prev, banner_url: imageUrl }));
                            }
                            e.target.value = '';
                          }
                        }}
                        className="hidden"
                        id="bannerUpload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="bannerUpload"
                        className={`inline-flex items-center px-3 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors text-sm ${
                          uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Upload...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Uploader bannière
                          </>
                        )}
                      </label>
                      <div className="text-sm text-muted-foreground">ou</div>
                      <Input
                        value={shopData.banner_url}
                        onChange={(e) => setShopData(prev => ({ ...prev, banner_url: e.target.value }))}
                        placeholder="URL de la bannière"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="space-y-6">
              <div className="text-center space-y-4 mb-8">
                <h3 className="text-2xl font-bold">Choisissez votre plan d'abonnement</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Votre plan détermine les fonctionnalités disponibles pour votre boutique. 
                  Vous pouvez changer de plan à tout moment.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                  <PlanCard
                    key={key}
                    planKey={key}
                    plan={plan}
                    isSelected={shopData.subscription_plan === key}
                    isCurrent={currentPlan === key}
                  />
                ))}
              </div>

              {/* Comparaison des fonctionnalités */}
              <div className="mt-12 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border">
                <h4 className="text-lg font-semibold mb-4 text-center">Comparaison détaillée des plans</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <h5 className="font-medium text-slate-600">Basic (Gratuit)</h5>
                    <ul className="space-y-1 text-slate-500">
                      <li>• 10 produits maximum</li>
                      <li>• Boutique basique</li>
                      <li>• Commandes simples</li>
                      <li>• Support email</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium text-blue-600">Standard (29€/mois)</h5>
                    <ul className="space-y-1 text-blue-500">
                      <li>• Produits illimités</li>
                      <li>• Promotions & codes promo</li>
                      <li>• Analytics basiques</li>
                      <li>• Gestion stock avancée</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium text-purple-600">Premium (79€/mois)</h5>
                    <ul className="space-y-1 text-purple-500">
                      <li>• Tout Standard +</li>
                      <li>• Analytics complètes</li>
                      <li>• Newsletter professionnelle</li>
                      <li>• SEO premium & domaine</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Ajouter un produit</h3>
                  
                  <div>
                    <Label htmlFor="productName">Nom du produit *</Label>
                    <Input
                      id="productName"
                      value={currentProduct.name}
                      onChange={(e) => setCurrentProduct(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nom du produit"
                    />
                  </div>

                  <div>
                    <Label htmlFor="productDesc">Description</Label>
                    <Textarea
                      id="productDesc"
                      value={currentProduct.description}
                      onChange={(e) => setCurrentProduct(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du produit"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="productPrice">Prix *</Label>
                      <Input
                        id="productPrice"
                        type="number"
                        value={currentProduct.price}
                        onChange={(e) => setCurrentProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Devise</Label>
                      <select
                        id="currency"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={currentProduct.currency}
                        onChange={(e) => setCurrentProduct(prev => ({ ...prev, currency: e.target.value }))}
                      >
                        <option value="GNF">GNF</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  <Button onClick={addProduct} className="w-full">
                    <>
                      Ajouter le produit ({products.length}/{currentPlanData.maxProducts})
                    </>
                  </Button>
                  
                  {/* TEMPORAIREMENT DÉSACTIVÉ - ALERTE LIMITE PRODUITS */}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Produits ajoutés</h3>
                  
                  {products.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Aucun produit ajouté
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {products.map((product, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold">{product.name}</h4>
                              <p className="text-sm text-muted-foreground">{product.description}</p>
                              <p className="text-sm font-medium mt-1">
                                {product.price} {product.currency}
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeProduct(index)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-6">
              <div className="text-center space-y-4 mb-8">
                <h3 className="text-2xl font-bold flex items-center justify-center">
                  <Images className="h-6 w-6 mr-2" />
                  Galerie d'images de la boutique
                </h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Ajoutez des images pour améliorer l'apparence de votre boutique et créer une expérience visuelle attrayante. 
                  Ces images seront utilisées pour la motion design et la présentation générale.
                </p>
                <div className="inline-flex items-center px-3 py-1 bg-muted rounded-full text-sm">
                  <Badge variant="outline" className="mr-2">
                    Plan {currentPlanData.name}
                  </Badge>
                  {imageLimit.description}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ajouter une image */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Ajouter une image</h4>
                  
                  <div className="space-y-4">
                    {/* Zone de drag & drop */}
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-primary/50'
                      } ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Images className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2">
                        {uploadingImage ? 'Upload en cours...' : 'Glissez vos images ici'}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        ou
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="imageUpload"
                        disabled={uploadingImage || shopData.shop_images.length >= imageLimit.max}
                      />
                      <label
                        htmlFor="imageUpload"
                        className={`inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90 transition-colors ${
                          uploadingImage || shopData.shop_images.length >= imageLimit.max 
                            ? 'opacity-50 cursor-not-allowed' 
                            : ''
                        }`}
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Upload en cours...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Choisir des images
                          </>
                        )}
                      </label>
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG, GIF, WEBP jusqu'à 5MB
                      </p>
                    </div>

                    {/* Ou saisir une URL */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          ou saisir une URL
                        </span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="imageUrl">URL de l'image</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="imageUrl"
                          value={currentImageUrl}
                          onChange={(e) => setCurrentImageUrl(e.target.value)}
                          placeholder="https://exemple.com/image.jpg"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={addShopImage} 
                      className="w-full" 
                      disabled={shopData.shop_images.length >= imageLimit.max || !currentImageUrl.trim()}
                    >
                      {shopData.shop_images.length >= imageLimit.max ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Limite atteinte ({shopData.shop_images.length}/{imageLimit.max})
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter depuis URL ({shopData.shop_images.length}/{imageLimit.max})
                        </>
                      )}
                    </Button>

                    {shopData.shop_images.length >= imageLimit.max && (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 text-sm">
                          Vous avez atteint la limite de {imageLimit.max} images pour le plan {currentPlanData.name}.
                          <Button variant="link" className="h-auto p-0 ml-1 text-amber-600" onClick={() => handleLockedFeatureClick('Plus d\'images')}>
                            Passer au plan supérieur
                          </Button>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Preview de l'image actuelle */}
                  {currentImageUrl && (
                    <div className="mt-4">
                      <Label>Aperçu</Label>
                      <div className="mt-2 border-2 border-dashed border-muted rounded-lg p-4">
                        <img 
                          src={currentImageUrl} 
                          alt="Aperçu" 
                          className="w-full h-32 object-cover rounded-md"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Galerie des images ajoutées */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Collection d'images</h4>
                  
                  {shopData.shop_images.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
                      <Images className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Aucune image ajoutée</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ajoutez des images pour améliorer l'apparence de votre boutique
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {shopData.shop_images.map((imageUrl, index) => (
                        <Card key={index} className="overflow-hidden group hover:shadow-lg transition-all">
                          <div className="relative">
                            <img 
                              src={imageUrl} 
                              alt={`Image ${index + 1}`} 
                              className="w-full h-24 object-cover"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => removeShopImage(index)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Supprimer</p>
                                </TooltipContent>
                              </Tooltip>
                              
                              {index > 0 && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => moveShopImage(index, index - 1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Move className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Déplacer vers le haut</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </div>
                          <CardContent className="p-2">
                            <p className="text-xs text-muted-foreground truncate">
                              Image {index + 1}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bénéfices selon le plan */}
              <div className="mt-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border">
                <h4 className="text-lg font-semibold mb-4 text-center">Améliorez votre boutique avec plus d'images</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <h5 className="font-medium text-slate-600">Basic (Gratuit)</h5>
                    <ul className="space-y-1 text-slate-500">
                      <li>• 5 images maximum</li>
                      <li>• Motion design basique</li>
                      <li>• Présentation simple</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium text-blue-600">Standard (29€/mois)</h5>
                    <ul className="space-y-1 text-blue-500">
                      <li>• 15 images maximum</li>
                      <li>• Collection complète</li>
                      <li>• Motion design avancé</li>
                      <li>• Galerie professionnelle</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium text-purple-600">Premium (79€/mois)</h5>
                    <ul className="space-y-1 text-purple-500">
                      <li>• 30 images maximum</li>
                      <li>• Collection complète</li>
                      <li>• Motion design premium</li>
                      <li>• Présentation haut de gamme</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="preview" className="space-y-6">
              <div className="text-center space-y-4 mb-8">
                <h3 className="text-2xl font-bold">Aperçu de votre boutique</h3>
                <p className="text-muted-foreground">
                  Voici comment votre boutique apparaîtra à vos clients
                </p>
              </div>

              <div className="border-2 border-dashed border-primary/20 rounded-xl p-8 bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  {/* En-tête boutique */}
                  <div className="text-center space-y-6">
                    <div className="flex items-center justify-center space-x-6">
                      {shopData.logo_url ? (
                        <img src={shopData.logo_url} alt="Logo" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                          <Store className="h-10 w-10 text-white" />
                        </div>
                      )}
                      <div>
                        <h2 className="text-3xl font-bold text-slate-800">{shopData.name || 'Nom de la boutique'}</h2>
                        <p className="text-slate-600 text-lg">{shopData.description || 'Description de votre boutique professionnelle'}</p>
                        <div className="flex items-center justify-center space-x-2 mt-2">
                          <Badge className={`bg-gradient-to-r ${currentPlanData.color} text-white`}>
                            Plan {currentPlanData.name}
                          </Badge>
                          <Badge variant="outline">
                            boutique.com/{shopData.slug || 'ma-boutique'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {shopData.banner_url && (
                      <img src={shopData.banner_url} alt="Bannière" className="w-full h-40 object-cover rounded-lg shadow-md" />
                    )}

                    {/* Galerie d'images de la boutique */}
                    {shopData.shop_images.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Galerie de la boutique</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {shopData.shop_images.slice(0, 8).map((imageUrl, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-md">
                              <img 
                                src={imageUrl} 
                                alt={`Image boutique ${index + 1}`} 
                                className="w-full h-full object-cover hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                          ))}
                        </div>
                        {shopData.shop_images.length > 8 && (
                          <p className="text-center text-muted-foreground mt-2 text-sm">
                            +{shopData.shop_images.length - 8} autres images...
                          </p>
                        )}
                      </div>
                    )}

                    {/* Statistiques boutique */}
                    <div className="grid grid-cols-3 gap-4 py-6 border-y">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{products.length}</div>
                        <div className="text-sm text-muted-foreground">Produits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">4.8★</div>
                        <div className="text-sm text-muted-foreground">Note client</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{shopData.shop_images.length}</div>
                        <div className="text-sm text-muted-foreground">Images</div>
                      </div>
                    </div>
                  </div>

                  {/* Grille produits */}
                  {products.length > 0 ? (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4 text-center">Nos produits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.slice(0, 6).map((product, index) => (
                          <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden">
                            <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-sm">{product.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-lg font-bold text-primary">{product.price} {product.currency}</p>
                                <Button size="sm" variant="outline">Acheter</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {products.length > 6 && (
                        <p className="text-center text-muted-foreground mt-4">
                          +{products.length - 6} autres produits...
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Ajoutez des produits pour voir l'aperçu complet</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center pt-8 border-t bg-gradient-to-r from-slate-50 to-blue-50 -mx-6 px-6 -mb-6 pb-6 mt-8">
            <Button variant="outline" onClick={onClose} className="px-6">
              <X className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            
            <div className="flex items-center space-x-4">
              {currentStep !== 'shop' && (
                <Button variant="outline" onClick={() => {
                  const steps = ['shop', 'plan', 'products', 'images', 'preview'];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex > 0) {
                    setCurrentStep(steps[currentIndex - 1]);
                  }
                }} className="px-6">
                  Précédent
                </Button>
              )}
              
              {currentStep !== 'preview' ? (
                <Button onClick={() => {
                  const steps = ['shop', 'plan', 'products', 'images', 'preview'];
                  const currentIndex = steps.indexOf(currentStep);
                  if (currentIndex < steps.length - 1) {
                    setCurrentStep(steps[currentIndex + 1]);
                  }
                }} className="px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                  Suivant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={createShop} 
                  disabled={loading || !shopData.name}
                  className="px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Créer ma boutique
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Modal d'upgrade */}
          <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-amber-500" />
                  Fonctionnalité verrouillée
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  <strong>{selectedLockedFeature}</strong> nécessite un plan supérieur.
                </p>
                
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
                  <h4 className="font-semibold text-blue-900 mb-2">Plan Standard recommandé</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Produits illimités</li>
                    <li>• Promotions et codes promo</li>
                    <li>• Analytics basiques</li>
                    <li>• Support prioritaire</li>
                  </ul>
                  <div className="mt-3 text-lg font-bold text-blue-900">29€/mois</div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowUpgradePrompt(false)} className="flex-1">
                    Plus tard
                  </Button>
                  <Button onClick={handleUpgrade} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600">
                    Upgrader maintenant
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
