import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Gift, Target, Users, TrendingUp, Plus, Edit, Eye, Copy, 
  DollarSign, Mail, MessageCircle, Share2
} from 'lucide-react';
import { toast } from 'sonner';

interface VendorMarketingProps {
  userProfile: any;
}

const VendorMarketing: React.FC<VendorMarketingProps> = ({ userProfile }) => {
  const [campaigns, setCampaigns] = useState([
    {
      id: "1",
      name: "Promo Smartphone Janvier",
      type: "discount",
      status: "active",
      discount: 15,
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      products: ["iPhone 15 Pro", "Samsung Galaxy S24"],
      views: 1250,
      clicks: 89,
      conversions: 12,
      revenue: 850000
    },
    {
      id: "2", 
      name: "Cashback Fidélité",
      type: "cashback",
      status: "scheduled",
      discount: 10,
      startDate: "2024-02-01",
      endDate: "2024-02-29",
      products: ["Tous les produits"],
      views: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0
    }
  ]);

  const [codes, setCodes] = useState([
    {
      id: "1",
      code: "JANVIER15",
      type: "percentage",
      value: 15,
      uses: 45,
      maxUses: 100,
      validUntil: "2024-01-31",
      status: "active"
    },
    {
      id: "2",
      code: "NEWCLIENT50",
      type: "fixed",
      value: 50000,
      uses: 12,
      maxUses: 50,
      validUntil: "2024-03-31",
      status: "active"
    }
  ]);

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: "Actif", variant: "default" as const },
      scheduled: { label: "Programmé", variant: "outline" as const },
      ended: { label: "Terminé", variant: "secondary" as const },
      paused: { label: "En pause", variant: "destructive" as const }
    };
    const statusConfig = config[status as keyof typeof config] || config.active;
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Statistiques marketing */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Campagnes Actives</p>
                <p className="text-2xl font-bold">{campaigns.filter(c => c.status === 'active').length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenus Promos</p>
                <p className="text-2xl font-bold text-green-600">
                  {campaigns.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()} GNF
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux Conversion</p>
                <p className="text-2xl font-bold text-purple-600">
                  {campaigns.length > 0 ? 
                    Math.round((campaigns.reduce((sum, c) => sum + c.conversions, 0) / campaigns.reduce((sum, c) => sum + c.clicks, 1)) * 100) 
                    : 0
                  }%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Codes Promo</p>
                <p className="text-2xl font-bold text-orange-600">{codes.length}</p>
              </div>
              <Gift className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campagnes marketing */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campagnes Marketing
              </CardTitle>
              <CardDescription>
                Gérez vos campagnes promotionnelles
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Campagne
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle campagne</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Nom de la campagne</Label>
                    <Input placeholder="Ex: Promo Smartphone Février" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type de promotion</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">Remise pourcentage</SelectItem>
                          <SelectItem value="fixed">Montant fixe</SelectItem>
                          <SelectItem value="cashback">Cashback</SelectItem>
                          <SelectItem value="bogo">Achetez 1, obtenez 1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valeur</Label>
                      <Input type="number" placeholder="15" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date de début</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Date de fin</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div>
                    <Label>Produits concernés</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner produits" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les produits</SelectItem>
                        <SelectItem value="category">Par catégorie</SelectItem>
                        <SelectItem value="specific">Produits spécifiques</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Annuler</Button>
                    <Button onClick={() => toast.success("Campagne créée")}>
                      Créer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {campaign.type === 'discount' ? `${campaign.discount}% de remise` : 
                             campaign.type === 'cashback' ? `${campaign.discount}% cashback` : 'Promotion spéciale'}
                          </p>
                        </div>
                        {getStatusBadge(campaign.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-muted-foreground">Période</p>
                          <p>{new Date(campaign.startDate).toLocaleDateString('fr-FR')} - {new Date(campaign.endDate).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Vues</p>
                          <p className="font-bold">{campaign.views.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Conversions</p>
                          <p className="font-bold text-green-600">{campaign.conversions}</p>
                        </div>
                        <div>
                          <p className="font-medium text-muted-foreground">Revenus</p>
                          <p className="font-bold text-purple-600">{campaign.revenue.toLocaleString()} GNF</p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <p><strong>Produits:</strong> {campaign.products.join(', ')}</p>
                        <p><strong>Taux de conversion:</strong> {campaign.clicks > 0 ? Math.round((campaign.conversions / campaign.clicks) * 100) : 0}%</p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 min-w-[150px]">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        Statistiques
                      </Button>
                      {campaign.status === 'active' ? (
                        <Button size="sm" variant="outline">
                          Mettre en pause
                        </Button>
                      ) : (
                        <Button size="sm">
                          Activer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Codes promo */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Codes Promotionnels
              </CardTitle>
              <CardDescription>
                Créez et gérez vos codes de réduction
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un code promotionnel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Code promotionnel</Label>
                    <Input placeholder="Ex: FEVRIER20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type de remise</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Pourcentage</SelectItem>
                          <SelectItem value="fixed">Montant fixe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valeur</Label>
                      <Input type="number" placeholder="20" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Utilisations max</Label>
                      <Input type="number" placeholder="100" />
                    </div>
                    <div>
                      <Label>Valide jusqu'au</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Annuler</Button>
                    <Button onClick={() => toast.success("Code créé")}>
                      Créer le code
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {codes.map((code) => (
              <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold font-mono">{code.code}</h3>
                    {getStatusBadge(code.status)}
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-2 text-sm text-muted-foreground">
                    <p>
                      <strong>Type:</strong> {code.type === 'percentage' ? `${code.value}%` : `${code.value.toLocaleString()} GNF`}
                    </p>
                    <p>
                      <strong>Utilisations:</strong> {code.uses}/{code.maxUses}
                    </p>
                    <p>
                      <strong>Valide jusqu'au:</strong> {new Date(code.validUntil).toLocaleDateString('fr-FR')}
                    </p>
                    <p>
                      <strong>Taux utilisation:</strong> {Math.round((code.uses / code.maxUses) * 100)}%
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Copy className="h-3 w-3 mr-1" />
                    Copier
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Outils marketing */}
      <Card>
        <CardHeader>
          <CardTitle>Outils Marketing</CardTitle>
          <CardDescription>
            Boostez vos ventes avec nos outils intégrés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Mail className="h-6 w-6" />
              <span>Email Marketing</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <MessageCircle className="h-6 w-6" />
              <span>SMS Marketing</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Share2 className="h-6 w-6" />
              <span>Réseaux Sociaux</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorMarketing;