import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Store, Globe, Palette, Settings, Shield, CreditCard, 
  Upload, Edit, Save, Eye, Share2, Facebook, Instagram,
  Twitter, Mail, Phone, MapPin, Clock, Star, Zap
} from "lucide-react";
import { toast } from "sonner";

const VendorShopSettings = () => {
  const [shopData, setShopData] = useState({
    name: "TechStore Guinea",
    description: "Votre boutique électronique de confiance en Guinée. Nous proposons les derniers smartphones, ordinateurs et accessoires tech aux meilleurs prix.",
    logo: "",
    banner: "",
    address: "Kaloum, Conakry, Guinée",
    phone: "+224 622 123 456",
    email: "contact@techstore.gn",
    website: "https://techstore.gn",
    workingHours: {
      monday: { open: "08:00", close: "18:00", closed: false },
      tuesday: { open: "08:00", close: "18:00", closed: false },
      wednesday: { open: "08:00", close: "18:00", closed: false },
      thursday: { open: "08:00", close: "18:00", closed: false },
      friday: { open: "08:00", close: "18:00", closed: false },
      saturday: { open: "09:00", close: "17:00", closed: false },
      sunday: { open: "10:00", close: "16:00", closed: false }
    },
    socialLinks: {
      facebook: "https://facebook.com/techstoreguinea",
      instagram: "https://instagram.com/techstoreguinea", 
      twitter: "",
      whatsapp: "+224622123456"
    },
    isActive: true,
    verified: true
  });

  const [seoSettings, setSeoSettings] = useState({
    metaTitle: "TechStore Guinea - Électronique et Smartphones",
    metaDescription: "Découvrez les derniers smartphones, ordinateurs et accessoires tech aux meilleurs prix en Guinée. Livraison rapide à Conakry.",
    keywords: "smartphone, ordinateur, tech, guinée, conakry, électronique",
    ogTitle: "TechStore Guinea - Votre boutique tech",
    ogDescription: "Les meilleurs produits tech en Guinée"
  });

  const [subscriptionPlan, setSubscriptionPlan] = useState("premium");
  
  const plans = {
    basic: {
      name: "Basic",
      price: "49,000 GNF/mois",
      features: ["50 produits max", "Photos basiques", "Support email"],
      current: false
    },
    standard: {
      name: "Standard", 
      price: "99,000 GNF/mois",
      features: ["200 produits max", "Galerie avancée", "Analytics basiques", "Support prioritaire"],
      current: false
    },
    premium: {
      name: "Premium",
      price: "199,000 GNF/mois", 
      features: ["Produits illimités", "Analytics avancées", "API access", "Support dédié", "Boost produits", "Multi-entrepôts"],
      current: true
    }
  };

  const handleSave = () => {
    toast.success("Paramètres sauvegardés avec succès");
  };

  const handleImageUpload = (type: 'logo' | 'banner') => {
    toast.info(`Upload ${type} - Fonctionnalité à venir`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Paramètres de la Boutique</h2>
          <p className="text-muted-foreground">Configurez votre boutique et personnalisez votre présence</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => toast.info("Prévisualisation à venir")}>
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Statut boutique */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${shopData.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">
                  Boutique {shopData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {shopData.verified && (
                <Badge variant="outline" className="border-green-500 text-green-700">
                  <Shield className="h-3 w-3 mr-1" />
                  Vérifiée
                </Badge>
              )}
              <Badge variant="outline" className="border-purple-500 text-purple-700">
                <Star className="h-3 w-3 mr-1" />
                Plan {plans[subscriptionPlan as keyof typeof plans].name}
              </Badge>
            </div>
            <Switch 
              checked={shopData.isActive}
              onCheckedChange={(checked) => setShopData({...shopData, isActive: checked})}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Store className="h-4 w-4 mr-2" />
            Général
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Apparence
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Globe className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="subscription">
            <CreditCard className="h-4 w-4 mr-2" />
            Abonnement
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings className="h-4 w-4 mr-2" />
            Avancé
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shopName">Nom de la boutique *</Label>
                  <Input
                    id="shopName"
                    value={shopData.name}
                    onChange={(e) => setShopData({...shopData, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email de contact *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={shopData.email}
                    onChange={(e) => setShopData({...shopData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description de la boutique</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={shopData.description}
                  onChange={(e) => setShopData({...shopData, description: e.target.value})}
                  placeholder="Décrivez votre boutique et vos produits..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={shopData.phone}
                    onChange={(e) => setShopData({...shopData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    value={shopData.website}
                    onChange={(e) => setShopData({...shopData, website: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adresse complète</Label>
                <Input
                  id="address"
                  value={shopData.address}
                  onChange={(e) => setShopData({...shopData, address: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Horaires d'ouverture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Horaires d'ouverture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(shopData.workingHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Switch 
                        checked={!hours.closed}
                        onCheckedChange={(checked) => {
                          const newHours = {...shopData.workingHours};
                          newHours[day as keyof typeof newHours].closed = !checked;
                          setShopData({...shopData, workingHours: newHours});
                        }}
                      />
                      <span className="font-medium capitalize min-w-[100px]">
                        {day === 'monday' ? 'Lundi' : 
                         day === 'tuesday' ? 'Mardi' :
                         day === 'wednesday' ? 'Mercredi' :
                         day === 'thursday' ? 'Jeudi' :
                         day === 'friday' ? 'Vendredi' :
                         day === 'saturday' ? 'Samedi' : 'Dimanche'}
                      </span>
                    </div>
                    {!hours.closed && (
                      <div className="flex items-center space-x-2">
                        <Input 
                          type="time" 
                          value={hours.open}
                          className="w-24"
                          onChange={(e) => {
                            const newHours = {...shopData.workingHours};
                            newHours[day as keyof typeof newHours].open = e.target.value;
                            setShopData({...shopData, workingHours: newHours});
                          }}
                        />
                        <span>à</span>
                        <Input 
                          type="time" 
                          value={hours.close}
                          className="w-24"
                          onChange={(e) => {
                            const newHours = {...shopData.workingHours};
                            newHours[day as keyof typeof newHours].close = e.target.value;
                            setShopData({...shopData, workingHours: newHours});
                          }}
                        />
                      </div>
                    )}
                    {hours.closed && (
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        Fermé
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Réseaux sociaux */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Réseaux sociaux
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook" className="flex items-center">
                    <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    value={shopData.socialLinks.facebook}
                    onChange={(e) => setShopData({
                      ...shopData, 
                      socialLinks: {...shopData.socialLinks, facebook: e.target.value}
                    })}
                    placeholder="https://facebook.com/votreboutique"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram" className="flex items-center">
                    <Instagram className="h-4 w-4 mr-2 text-pink-600" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={shopData.socialLinks.instagram}
                    onChange={(e) => setShopData({
                      ...shopData,
                      socialLinks: {...shopData.socialLinks, instagram: e.target.value}
                    })}
                    placeholder="https://instagram.com/votreboutique"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter" className="flex items-center">
                    <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                    Twitter
                  </Label>
                  <Input
                    id="twitter"
                    value={shopData.socialLinks.twitter}
                    onChange={(e) => setShopData({
                      ...shopData,
                      socialLinks: {...shopData.socialLinks, twitter: e.target.value}
                    })}
                    placeholder="https://twitter.com/votreboutique"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Business</Label>
                  <Input
                    id="whatsapp"
                    value={shopData.socialLinks.whatsapp}
                    onChange={(e) => setShopData({
                      ...shopData,
                      socialLinks: {...shopData.socialLinks, whatsapp: e.target.value}
                    })}
                    placeholder="+224 6XX XXX XXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Images de la boutique</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Logo de la boutique</Label>
                  <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Store className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Téléchargez votre logo</p>
                    <Button variant="outline" onClick={() => handleImageUpload('logo')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Bannière de la boutique</Label>
                  <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <Globe className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Téléchargez votre bannière</p>
                    <Button variant="outline" onClick={() => handleImageUpload('banner')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Choisir un fichier
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personnalisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="themeColor">Couleur principale</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <Input type="color" value="#3B82F6" className="w-16 h-10" />
                  <Input value="#3B82F6" placeholder="#3B82F6" />
                </div>
              </div>
              <div>
                <Label htmlFor="layout">Style de layout</Label>
                <Select defaultValue="modern">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Moderne</SelectItem>
                    <SelectItem value="classic">Classique</SelectItem>
                    <SelectItem value="minimal">Minimaliste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Référencement SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Titre de la page (Meta Title)</Label>
                <Input
                  id="metaTitle"
                  value={seoSettings.metaTitle}
                  onChange={(e) => setSeoSettings({...seoSettings, metaTitle: e.target.value})}
                  placeholder="TechStore Guinea - Électronique et Smartphones"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {seoSettings.metaTitle.length}/60 caractères
                </p>
              </div>
              
              <div>
                <Label htmlFor="metaDescription">Description (Meta Description)</Label>
                <Textarea
                  id="metaDescription"
                  value={seoSettings.metaDescription}
                  onChange={(e) => setSeoSettings({...seoSettings, metaDescription: e.target.value})}
                  placeholder="Découvrez les derniers smartphones et accessoires..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {seoSettings.metaDescription.length}/160 caractères
                </p>
              </div>

              <div>
                <Label htmlFor="keywords">Mots-clés</Label>
                <Input
                  id="keywords"
                  value={seoSettings.keywords}
                  onChange={(e) => setSeoSettings({...seoSettings, keywords: e.target.value})}
                  placeholder="smartphone, ordinateur, tech, guinée"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Open Graph (Réseaux sociaux)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ogTitle">Titre pour partage social</Label>
                <Input
                  id="ogTitle"
                  value={seoSettings.ogTitle}
                  onChange={(e) => setSeoSettings({...seoSettings, ogTitle: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="ogDescription">Description pour partage social</Label>
                <Textarea
                  id="ogDescription"
                  value={seoSettings.ogDescription}
                  onChange={(e) => setSeoSettings({...seoSettings, ogDescription: e.target.value})}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abonnement actuel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(plans).map(([key, plan]) => (
                  <Card key={key} className={`border-2 ${plan.current ? 'border-primary bg-primary/5' : 'border-muted'}`}>
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div>
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                          <p className="text-2xl font-bold text-primary">{plan.price}</p>
                        </div>
                        <div className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              ✓ {feature}
                            </p>
                          ))}
                        </div>
                        {plan.current ? (
                          <Badge variant="default" className="w-full">
                            Plan actuel
                          </Badge>
                        ) : (
                          <Button variant="outline" className="w-full">
                            Changer de plan
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres avancés</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir les notifications de commandes par email</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Boutique publique</Label>
                  <p className="text-sm text-muted-foreground">Rendre votre boutique visible sur le marketplace</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Mode maintenance</Label>
                  <p className="text-sm text-muted-foreground">Désactiver temporairement votre boutique</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Zone de danger</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Supprimer la boutique</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                  </p>
                  <Button variant="destructive">
                    Supprimer définitivement
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorShopSettings;