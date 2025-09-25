import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Upload, Download, Package, TrendingUp } from 'lucide-react';
import DigitalProductUpload from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import ClientDigitalDownloads from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import FloatingHomeButton from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import Header from '
            param($matches)
            $componentPath = $matches[1].Replace('/', '\')
            $absolutePath = Join-Path -Path $PWD -ChildPath "src\components\$componentPath"
            $relativePath = [IO.Path]::GetRelativePath($dir, $absolutePath) -replace '\\','/'
            return $relativePath
        
import { Product } from '@/types';

const DigitalStore = () => {
  const { user } = useAuth();
  const [createdProducts, setCreatedProducts] = useState<Product[]>([]);

  const handleProductCreated = (product: Product) => {
    setCreatedProducts(prev => [product, ...prev]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Boutique Numérique</h1>
          <p className="text-muted-foreground mb-6">
            Connectez-vous pour accéder à vos produits numériques
          </p>
          <Link to="/auth">
            <Button variant="hero">Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="flex items-center hover:text-primary transition-smooth">
            <Home className="w-4 h-4 mr-1" />
            Accueil
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Boutique Numérique</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Boutique Numérique
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Vendez et achetez des produits numériques en toute sécurité
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Retour Accueil
            </Button>
          </Link>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Mes Produits</p>
                  <p className="text-2xl font-bold">{createdProducts.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Download className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléchargements</p>
                  <p className="text-2xl font-bold">247</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Revenus</p>
                  <p className="text-2xl font-bold">1.2M GNF</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Upload className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-muted-foreground">Stockage</p>
                  <p className="text-2xl font-bold">2.1 GB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu principal avec onglets */}
        <Tabs defaultValue="downloads" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="downloads">Mes Téléchargements</TabsTrigger>
            <TabsTrigger value="upload">Uploader Produit</TabsTrigger>
            <TabsTrigger value="manage">Gérer Produits</TabsTrigger>
          </TabsList>

          {/* Onglet Téléchargements */}
          <TabsContent value="downloads">
            <ClientDigitalDownloads userId={user.id} />
          </TabsContent>

          {/* Onglet Upload */}
          <TabsContent value="upload">
            <DigitalProductUpload 
              sellerId={user.id} 
              onProductCreated={handleProductCreated}
            />
          </TabsContent>

          {/* Onglet Gestion */}
          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Gérer mes Produits Numériques</CardTitle>
                <CardDescription>
                  Suivez les performances et gérez vos produits numériques
                </CardDescription>
              </CardHeader>
              <CardContent>
                {createdProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun produit créé</h3>
                    <p className="text-muted-foreground mb-4">
                      Commencez par uploader votre premier produit numérique
                    </p>
                    <Link to="?tab=upload">
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Uploader un produit
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {createdProducts.map((product) => (
                      <Card key={product.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{product.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {product.digital?.fileName} • {product.digital?.fileSize ? Math.round(product.digital.fileSize / 1024 / 1024) : 0} MB
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {product.digital?.downloadsCount || 0} téléchargements
                            </Badge>
                            <Badge variant="default">
                              {product.price.amount.toLocaleString()} {product.price.currency}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Guide d'utilisation */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">🚀 Comment utiliser la Boutique Numérique</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">👤 Pour les Acheteurs :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Achetez des produits numériques via la marketplace</li>
                  <li>• Téléchargez vos achats depuis "Mes Téléchargements"</li>
                  <li>• Respectez les limites de téléchargement</li>
                  <li>• Liens sécurisés avec expiration automatique</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🏪 Pour les Marchands :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Uploadez vos créations (PDF, audio, vidéo, etc.)</li>
                  <li>• Définissez prix et limites de téléchargement</li>
                  <li>• Activez le watermark pour les PDFs</li>
                  <li>• Suivez vos ventes et téléchargements</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <FloatingHomeButton />
      </div>
    </div>
  );
};

export default DigitalStore;
