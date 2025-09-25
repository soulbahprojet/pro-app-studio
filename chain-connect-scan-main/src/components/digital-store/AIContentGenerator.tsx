import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Sparkles,
  Image,
  FileText,
  Copy,
  Download,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AIContentGeneratorProps {
  shopId: string;
}

export function AIContentGenerator({ shopId }: AIContentGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('image');
  
  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Description Generation State
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  
  // Content Analysis State
  const [analysisTitle, setAnalysisTitle] = useState('');
  const [analysisDescription, setAnalysisDescription] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const generateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error('Veuillez entrer une description pour l\'image');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          type: 'generate-image',
          prompt: imagePrompt
        }
      });

      if (error) throw error;

      setGeneratedImage(data.imageUrl);
      toast.success('Image générée avec succès !');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Erreur lors de la génération de l\'image');
    } finally {
      setGenerating(false);
    }
  };

  const generateDescription = async () => {
    if (!productName.trim()) {
      toast.error('Veuillez entrer le nom du produit');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          type: 'generate-description',
          prompt: productName,
          productData: {
            name: productName,
            type: productType,
            price: productPrice
          }
        }
      });

      if (error) throw error;

      setGeneratedContent(data.content);
      toast.success('Description générée avec succès !');
    } catch (error) {
      console.error('Error generating description:', error);
      toast.error('Erreur lors de la génération de la description');
    } finally {
      setGenerating(false);
    }
  };

  const analyzeContent = async () => {
    if (!analysisTitle.trim() || !analysisDescription.trim()) {
      toast.error('Veuillez remplir le titre et la description');
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          type: 'analyze-content',
          productData: {
            title: analysisTitle,
            description: analysisDescription
          }
        }
      });

      if (error) throw error;

      setAnalysisResult(data.analysis);
      toast.success('Analyse terminée !');
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast.error('Erreur lors de l\'analyse du contenu');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers !');
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Générateur de contenu IA
        </h2>
        <p className="text-muted-foreground">
          Utilisez l'intelligence artificielle pour créer du contenu marketing professionnel
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images Marketing
          </TabsTrigger>
          <TabsTrigger value="description" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Descriptions Produits
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Analyse de Contenu
          </TabsTrigger>
        </TabsList>

        {/* Image Generation */}
        <TabsContent value="image">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Générer une image marketing</CardTitle>
                <CardDescription>
                  Créez des visuels professionnels pour vos produits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image-prompt">Description de l'image</Label>
                  <Textarea
                    id="image-prompt"
                    placeholder="Ex: Une image moderne pour une formation en ligne sur le marketing digital, style professionnel avec des couleurs bleues et blanches..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Suggestions de prompts :</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Formation moderne et professionnelle',
                      'E-book élégant avec design minimaliste',
                      'Logiciel innovant interface moderne',
                      'Template créatif coloré'
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setImagePrompt(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={generateImage} 
                  disabled={generating || !imagePrompt.trim()}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Générer l'image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Résultat</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={generatedImage}
                        alt="Image générée"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={downloadImage} className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                      <Button variant="outline" onClick={generateImage} className="flex-1">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Régénérer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Image className="h-12 w-12 mx-auto mb-2" />
                      <p>L'image générée apparaîtra ici</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Description Generation */}
        <TabsContent value="description">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Générer une description produit</CardTitle>
                <CardDescription>
                  Créez des descriptions optimisées pour le SEO et les ventes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Nom du produit</Label>
                  <Input
                    id="product-name"
                    placeholder="Ex: Formation Marketing Digital Avancée"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-type">Type de produit</Label>
                    <Input
                      id="product-type"
                      placeholder="Ex: Formation en ligne"
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-price">Prix (GNF)</Label>
                    <Input
                      id="product-price"
                      placeholder="Ex: 50000"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  onClick={generateDescription} 
                  disabled={generating || !productName.trim()}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Générer la description
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contenu généré</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedContent ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-medium">Titre optimisé</Label>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(generatedContent.title)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm bg-muted p-3 rounded">{generatedContent.title}</p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-medium">Description</Label>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => copyToClipboard(generatedContent.description)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm bg-muted p-3 rounded">{generatedContent.description}</p>
                      </div>

                      {generatedContent.benefits && generatedContent.benefits.length > 0 && (
                        <div>
                          <Label className="font-medium">Points clés</Label>
                          <ul className="text-sm bg-muted p-3 rounded mt-2 space-y-1">
                            {generatedContent.benefits.map((benefit: string, index: number) => (
                              <li key={index}>• {benefit}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {generatedContent.keywords && generatedContent.keywords.length > 0 && (
                        <div>
                          <Label className="font-medium">Mots-clés SEO</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {generatedContent.keywords.map((keyword: string, index: number) => (
                              <Badge key={index} variant="secondary">{keyword}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                        <div>
                          <Label className="font-medium">Hashtags</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {generatedContent.hashtags.map((hashtag: string, index: number) => (
                              <Badge key={index} variant="outline">#{hashtag}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2" />
                      <p>Le contenu généré apparaîtra ici</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Analysis */}
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analyser du contenu existant</CardTitle>
                <CardDescription>
                  Obtenez des suggestions d'amélioration pour vos contenus
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="analysis-title">Titre actuel</Label>
                  <Input
                    id="analysis-title"
                    placeholder="Entrez le titre de votre produit"
                    value={analysisTitle}
                    onChange={(e) => setAnalysisTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="analysis-description">Description actuelle</Label>
                  <Textarea
                    id="analysis-description"
                    placeholder="Entrez la description de votre produit..."
                    value={analysisDescription}
                    onChange={(e) => setAnalysisDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={analyzeContent} 
                  disabled={generating || !analysisTitle.trim() || !analysisDescription.trim()}
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Analyser le contenu
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suggestions d'amélioration</CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResult ? (
                  <div className="space-y-4">
                    {analysisResult.titleSuggestions && (
                      <div>
                        <Label className="font-medium text-green-600">Suggestions pour le titre</Label>
                        <ul className="text-sm bg-muted p-3 rounded mt-2 space-y-1">
                          {analysisResult.titleSuggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResult.descriptionImprovements && (
                      <div>
                        <Label className="font-medium text-blue-600">Améliorations de la description</Label>
                        <ul className="text-sm bg-muted p-3 rounded mt-2 space-y-1">
                          {analysisResult.descriptionImprovements.map((improvement: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResult.inconsistencies && analysisResult.inconsistencies.length > 0 && (
                      <div>
                        <Label className="font-medium text-orange-600">Incohérences détectées</Label>
                        <ul className="text-sm bg-muted p-3 rounded mt-2 space-y-1">
                          {analysisResult.inconsistencies.map((issue: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResult.missingKeywords && analysisResult.missingKeywords.length > 0 && (
                      <div>
                        <Label className="font-medium text-purple-600">Mots-clés suggérés</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {analysisResult.missingKeywords.map((keyword: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-purple-200">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-2" />
                      <p>L'analyse apparaîtra ici</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}