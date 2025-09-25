import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Gift, 
  Star, 
  CreditCard, 
  Percent, 
  Plus,
  Edit,
  Trash2,
  Users,
  TrendingUp
} from 'lucide-react';

interface LoyaltyCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  total_spent: number;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  joined_at: string;
}

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed' | 'points';
  value: number;
  min_purchase: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface GiftCard {
  id: string;
  code: string;
  value: number;
  status: 'active' | 'used' | 'expired';
  issued_to?: string;
  expires_at: string;
  created_at: string;
}

export function LoyaltyManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [activeTab, setActiveTab] = useState('customers');
  const [loading, setLoading] = useState(true);

  // État pour nouvelle promotion
  const [newPromotion, setNewPromotion] = useState({
    name: '',
    type: 'percentage' as const,
    value: 0,
    min_purchase: 0,
    start_date: '',
    end_date: ''
  });

  // État pour nouvelle carte cadeau
  const [newGiftCard, setNewGiftCard] = useState({
    value: 0,
    recipient_email: '',
    expires_at: ''
  });

  useEffect(() => {
    loadLoyaltyData();
  }, [user]);

  const loadLoyaltyData = async () => {
    if (!user) return;
    
    try {
      // Utiliser des données simulées pour l'instant
      const mockCustomers: LoyaltyCustomer[] = [
        {
          id: '1',
          name: 'Marie Dubois',
          email: 'marie@example.com',
          phone: '+224 620 00 00 01',
          points: 1250,
          total_spent: 125000,
          level: 'gold',
          joined_at: '2024-01-15'
        },
        {
          id: '2',
          name: 'Ibrahim Camara',
          email: 'ibrahim@example.com',
          phone: '+224 620 00 00 02',
          points: 750,
          total_spent: 75000,
          level: 'silver',
          joined_at: '2024-02-20'
        },
        {
          id: '3',
          name: 'Aissatou Diallo',
          email: 'aissatou@example.com',
          phone: '+224 620 00 00 03',
          points: 2100,
          total_spent: 350000,
          level: 'platinum',
          joined_at: '2024-01-10'
        }
      ];
      
      setCustomers(mockCustomers);
      
      const mockPromotions: Promotion[] = [
        {
          id: '1',
          name: 'Remise fidélité 10%',
          type: 'percentage',
          value: 10,
          min_purchase: 50000,
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          is_active: true
        },
        {
          id: '2',
          name: 'Bonus points client VIP',
          type: 'points',
          value: 500,
          min_purchase: 100000,
          start_date: '2024-03-01',
          end_date: '2024-06-30',
          is_active: true
        }
      ];
      
      setPromotions(mockPromotions);

      const mockGiftCards: GiftCard[] = [
        {
          id: '1',
          code: 'GIFT2024001',
          value: 25000,
          status: 'active',
          issued_to: 'marie@example.com',
          expires_at: '2024-12-31',
          created_at: '2024-03-15'
        }
      ];

      setGiftCards(mockGiftCards);
      
    } catch (error) {
      console.error('Erreur chargement données fidélité:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de fidélité",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async () => {
    if (!newPromotion.name || !newPromotion.value || !user) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const promotion: Promotion = {
        id: Math.random().toString(36).substr(2, 9),
        ...newPromotion,
        is_active: true
      };

      setPromotions(prev => [...prev, promotion]);
      
      // Réinitialiser le formulaire
      setNewPromotion({
        name: '',
        type: 'percentage',
        value: 0,
        min_purchase: 0,
        start_date: '',
        end_date: ''
      });

      toast({
        title: "Promotion créée",
        description: "La promotion a été créée avec succès"
      });

    } catch (error) {
      console.error('Erreur création promotion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la promotion",
        variant: "destructive"
      });
    }
  };

  const togglePromotion = async (id: string) => {
    try {
      const promo = promotions.find(p => p.id === id);
      if (!promo) return;

      // Mise à jour locale
      setPromotions(prev =>
        prev.map(p =>
          p.id === id ? { ...p, is_active: !p.is_active } : p
        )
      );

      toast({
        title: promo.is_active ? "Promotion désactivée" : "Promotion activée",
        description: `La promotion "${promo.name}" a été ${promo.is_active ? 'désactivée' : 'activée'}`
      });

    } catch (error) {
      console.error('Erreur toggle promotion:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la promotion",
        variant: "destructive"
      });
    }
  };

  const createGiftCard = async () => {
    if (!newGiftCard.value || !user) {
      toast({
        title: "Champs requis",
        description: "Veuillez saisir la valeur de la carte cadeau",
        variant: "destructive"
      });
      return;
    }

    try {
      const giftCard: GiftCard = {
        id: Math.random().toString(36).substr(2, 9),
        code: 'GIFT' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        value: newGiftCard.value,
        status: 'active',
        issued_to: newGiftCard.recipient_email || undefined,
        expires_at: newGiftCard.expires_at || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      };

      setGiftCards(prev => [...prev, giftCard]);
      
      // Réinitialiser le formulaire
      setNewGiftCard({
        value: 0,
        recipient_email: '',
        expires_at: ''
      });

      toast({
        title: "Carte cadeau créée",
        description: `Code: ${giftCard.code}`,
      });

    } catch (error) {
      console.error('Erreur création carte cadeau:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la carte cadeau",
        variant: "destructive"
      });
    }
  };

  const addPointsToCustomer = async (customerId: string, points: number) => {
    try {
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === customerId 
            ? { ...customer, points: customer.points + points }
            : customer
        )
      );

      const customer = customers.find(c => c.id === customerId);
      toast({
        title: "Points ajoutés",
        description: `${points} points ajoutés à ${customer?.name}`,
      });

    } catch (error) {
      console.error('Erreur ajout points:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les points",
        variant: "destructive"
      });
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-orange-100 text-orange-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats fidélité */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{customers.length}</p>
                <p className="text-sm text-muted-foreground">Clients fidèles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {customers.reduce((sum, c) => sum + c.points, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Points total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {customers.reduce((sum, c) => sum + c.total_spent, 0).toLocaleString()} GNF
                </p>
                <p className="text-sm text-muted-foreground">CA fidélité</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{promotions.filter(p => p.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Promotions actives</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="customers">Clients fidèles</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="giftcards">Cartes cadeaux</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestion des clients fidèles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {customers.map(customer => (
                    <Card key={customer.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{customer.name}</h3>
                              <Badge className={getLevelColor(customer.level)}>
                                {customer.level.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{customer.email}</p>
                            <p className="text-xs text-muted-foreground">{customer.phone}</p>
                          </div>
                          
                          <div className="text-right space-y-1">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="font-bold">{customer.points} pts</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              CA: {customer.total_spent.toLocaleString()} GNF
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Depuis: {new Date(customer.joined_at).toLocaleDateString()}
                            </div>
                            <div className="flex gap-1 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addPointsToCustomer(customer.id, 100)}
                              >
                                +100 pts
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Créer une promotion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Créer une promotion
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="promo-name">Nom de la promotion</Label>
                  <Input
                    id="promo-name"
                    value={newPromotion.name}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Remise de printemps"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="promo-type">Type</Label>
                    <select
                      id="promo-type"
                      value={newPromotion.type}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="percentage">Pourcentage</option>
                      <option value="fixed">Montant fixe</option>
                      <option value="points">Points</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="promo-value">Valeur</Label>
                    <Input
                      id="promo-value"
                      type="number"
                      value={newPromotion.value}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, value: Number(e.target.value) }))}
                      placeholder={newPromotion.type === 'percentage' ? '10' : '5000'}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="min-purchase">Achat minimum (GNF)</Label>
                  <Input
                    id="min-purchase"
                    type="number"
                    value={newPromotion.min_purchase}
                    onChange={(e) => setNewPromotion(prev => ({ ...prev, min_purchase: Number(e.target.value) }))}
                    placeholder="50000"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Date de début</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newPromotion.start_date}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, start_date: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end-date">Date de fin</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newPromotion.end_date}
                      onChange={(e) => setNewPromotion(prev => ({ ...prev, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                
                <Button onClick={createPromotion} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer la promotion
                </Button>
              </CardContent>
            </Card>

            {/* Liste des promotions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Promotions actives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {promotions.map(promo => (
                      <Card key={promo.id} className={`border-l-4 ${promo.is_active ? 'border-l-green-500' : 'border-l-gray-500'}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{promo.name}</h3>
                            <Badge variant={promo.is_active ? "default" : "secondary"}>
                              {promo.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              Remise: {promo.value}
                              {promo.type === 'percentage' ? '%' : promo.type === 'fixed' ? ' GNF' : ' points'}
                            </p>
                            <p>Achat minimum: {promo.min_purchase.toLocaleString()} GNF</p>
                            <p>
                              Du {new Date(promo.start_date).toLocaleDateString()} 
                              au {new Date(promo.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant={promo.is_active ? "destructive" : "default"}
                              onClick={() => togglePromotion(promo.id)}
                            >
                              {promo.is_active ? "Désactiver" : "Activer"}
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="giftcards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Créer une carte cadeau */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Créer une carte cadeau
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="gift-value">Valeur (GNF)</Label>
                  <Input
                    id="gift-value"
                    type="number"
                    value={newGiftCard.value}
                    onChange={(e) => setNewGiftCard(prev => ({ ...prev, value: Number(e.target.value) }))}
                    placeholder="50000"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gift-recipient">Email du bénéficiaire (optionnel)</Label>
                  <Input
                    id="gift-recipient"
                    type="email"
                    value={newGiftCard.recipient_email}
                    onChange={(e) => setNewGiftCard(prev => ({ ...prev, recipient_email: e.target.value }))}
                    placeholder="client@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="gift-expires">Date d'expiration</Label>
                  <Input
                    id="gift-expires"
                    type="date"
                    value={newGiftCard.expires_at}
                    onChange={(e) => setNewGiftCard(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
                
                <Button onClick={createGiftCard} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Générer la carte cadeau
                </Button>
              </CardContent>
            </Card>

            {/* Liste des cartes cadeaux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Cartes émises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {giftCards.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Aucune carte cadeau créée pour le moment
                        </p>
                      </div>
                    ) : (
                      giftCards.map(card => (
                        <Card key={card.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold font-mono">{card.code}</h3>
                              <Badge variant={card.status === 'active' ? "default" : "secondary"}>
                                {card.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>Valeur: {card.value.toLocaleString()} GNF</p>
                              {card.issued_to && (
                                <p>Émise pour: {card.issued_to}</p>
                              )}
                              <p>Expire le: {new Date(card.expires_at).toLocaleDateString()}</p>
                              <p>Créée le: {new Date(card.created_at).toLocaleDateString()}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
