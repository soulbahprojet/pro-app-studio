import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Plus, Snowflake, Play, Trash2, Edit, Eye, EyeOff, RefreshCw, Settings, History, Shield, AlertTriangle } from 'lucide-react';

interface VirtualCard {
  id: string;
  card_name: string;
  card_number?: string;
  expiry_date?: string;
  card_type: string;
  card_type_stripe?: 'virtual' | 'physical';
  status: 'active' | 'frozen' | 'deleted' | 'canceled' | 'inactive';
  balance: number;
  daily_limit: number;
  monthly_limit: number;
  transaction_limit: number;
  currency?: string;
  created_at: string;
  is_employee_card?: boolean;
  last_four?: string;
  stripe_card_id?: string;
  stripe_cardholder_id?: string;
  has_stripe_issuing?: boolean;
  spending_controls?: any;
  shipping_address?: any;
  stripe_details?: {
    id: string;
    brand: string;
    exp_month: number;
    exp_year: number;
    last4: string;
    type: string;
    status: string;
  };
}

interface CardTransaction {
  id: string;
  transaction_type: string;
  amount?: number;
  currency?: string;
  description: string;
  merchant_name?: string;
  location?: string;
  status: string;
  created_at: string;
  is_stripe_transaction?: boolean;
}

const VirtualCardsManager: React.FC = () => {
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [transactions, setTransactions] = useState<CardTransaction[]>([]);
  const [selectedCard, setSelectedCard] = useState<VirtualCard | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [createForm, setCreateForm] = useState({
    name: '',
    cardType: 'virtual' as 'virtual' | 'physical',
    dailyLimit: '100000',
    monthlyLimit: '500000',
    spendingControls: {
      spending_limits: [
        { amount: 100000, interval: 'daily' as const },
        { amount: 500000, interval: 'monthly' as const }
      ]
    },
    shippingAddress: {
      line1: '',
      city: 'Conakry',
      country: 'GN',
      postal_code: '00000',
      line2: '',
      state: ''
    }
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('virtual-cards', {
        body: { action: 'get_cards' }
      });

      if (error) throw error;
      setCards(data.cards);
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

  const fetchTransactions = async (cardId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('virtual-cards', {
        body: { action: 'get_transactions', cardId }
      });

      if (error) throw error;
      setTransactions(data.transactions);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const createCard = async () => {
    if (!createForm.name) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le nom de la carte",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const requestBody: any = {
        action: 'create',
        name: createForm.name,
        cardType: createForm.cardType,
        spendingControls: createForm.spendingControls
      };

      // Add shipping address for physical cards
      if (createForm.cardType === 'physical') {
        if (!createForm.shippingAddress.line1) {
          toast({
            title: "Erreur", 
            description: "L'adresse de livraison est requise pour les cartes physiques",
            variant: "destructive"
          });
          return;
        }
        requestBody.shippingAddress = createForm.shippingAddress;
      }

      const { data, error } = await supabase.functions.invoke('virtual-cards', {
        body: requestBody
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Carte Stripe Issuing créée avec succès"
      });

      setShowCreateDialog(false);
      setCreateForm({
        name: '',
        cardType: 'virtual',
        dailyLimit: '100000',
        monthlyLimit: '500000',
        spendingControls: {
          spending_limits: [
            { amount: 100000, interval: 'daily' as const },
            { amount: 500000, interval: 'monthly' as const }
          ]
        },
        shippingAddress: {
          line1: '',
          city: 'Conakry',
          country: 'GN',
          postal_code: '00000',
          line2: '',
          state: ''
        }
      });
      fetchCards();
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

  const handleCardAction = async (action: string, cardId: string, additionalData?: any) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('virtual-cards', {
        body: {
          action,
          cardId,
          ...additionalData
        }
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: data.message
      });

      fetchCards();
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

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  };

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'premium': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'standard': return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 'basic': return 'bg-gradient-to-r from-gray-400 to-gray-600';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'frozen': return 'text-blue-600';
      case 'deleted': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cartes Virtuelles</h1>
          <p className="text-muted-foreground">Gérez vos cartes virtuelles en toute sécurité</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Carte
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle carte</DialogTitle>
              <DialogDescription>
                Créez une carte virtuelle sécurisée (limite: 3 cartes/jour)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom de la carte *</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Ex: Carte Shopping"
                />
              </div>
              
              <div>
                <Label htmlFor="cardType">Type de carte *</Label>
                <Select value={createForm.cardType} onValueChange={(value) => setCreateForm({ ...createForm, cardType: value as 'virtual' | 'physical' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtuelle</SelectItem>
                    <SelectItem value="physical">Physique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {createForm.cardType === 'physical' && (
                <div className="space-y-2">
                  <Label>Adresse de livraison *</Label>
                  <Input
                    placeholder="Adresse ligne 1"
                    value={createForm.shippingAddress.line1}
                    onChange={(e) => setCreateForm({
                      ...createForm,
                      shippingAddress: { ...createForm.shippingAddress, line1: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Ville"
                    value={createForm.shippingAddress.city}
                    onChange={(e) => setCreateForm({
                      ...createForm,
                      shippingAddress: { ...createForm.shippingAddress, city: e.target.value }
                    })}
                  />
                  <Input
                    placeholder="Code postal"
                    value={createForm.shippingAddress.postal_code}
                    onChange={(e) => setCreateForm({
                      ...createForm,
                      shippingAddress: { ...createForm.shippingAddress, postal_code: e.target.value }
                    })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Limites de dépenses</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="dailyLimit" className="text-sm">Limite journalière</Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      value={createForm.dailyLimit}
                      onChange={(e) => setCreateForm({ ...createForm, dailyLimit: e.target.value })}
                      placeholder="100000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="monthlyLimit" className="text-sm">Limite mensuelle</Label>
                    <Input
                      id="monthlyLimit"
                      type="number"
                      value={createForm.monthlyLimit}
                      onChange={(e) => setCreateForm({ ...createForm, monthlyLimit: e.target.value })}
                      placeholder="500000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={createCard} disabled={loading} className="flex-1">
                  {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Créer la carte Stripe
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-800 dark:text-orange-200">Sécurité Renforcée</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Votre compte ne peut être actif que sur un seul réseau à la fois. Connexion détectée: Sécurisée
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Card key={card.id} className="relative overflow-hidden">
            <div className={`h-48 p-6 text-white ${getCardTypeColor(card.card_type_stripe || card.card_type)}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {card.has_stripe_issuing ? 'STRIPE ISSUING' : 'VIRTUEL'}
                  </Badge>
                  <Badge className={getStatusColor(card.status)}>
                    {card.status}
                  </Badge>
                  {card.card_type_stripe && (
                    <Badge className="bg-white/10 text-white text-xs">
                      {card.card_type_stripe.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <CreditCard className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm opacity-90">{card.card_name}</p>
                {card.has_stripe_issuing ? (
                  <>
                    <p className="text-lg font-mono tracking-wide">
                      •••• •••• •••• {card.last_four || card.stripe_details?.last4 || '****'}
                    </p>
                    <div className="flex justify-between text-sm">
                      {card.stripe_details ? (
                        <span>Expire: {card.stripe_details.exp_month.toString().padStart(2, '0')}/{card.stripe_details.exp_year}</span>
                      ) : (
                        <span>Carte Stripe Issuing</span>
                      )}
                      <span className="text-xs">{card.stripe_details?.brand?.toUpperCase()}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-mono tracking-wide">
                      {showCardDetails === card.id && card.card_number
                        ? formatCardNumber(card.card_number)
                        : '•••• •••• •••• ' + (card.card_number?.slice(-4) || '****')
                      }
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>Expire: {card.expiry_date ? new Date(card.expiry_date).toLocaleDateString() : 'N/A'}</span>
                      <span>{card.balance ? card.balance.toLocaleString() : '0'} {card.currency || 'GNF'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCardDetails(showCardDetails === card.id ? null : card.id)}
                >
                  {showCardDetails === card.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>

                {card.status === 'active' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCardAction('freeze', card.id)}
                    disabled={loading}
                  >
                    <Snowflake className="w-4 h-4" />
                  </Button>
                )}

                {card.status === 'frozen' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCardAction('unfreeze', card.id)}
                    disabled={loading}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCard(card);
                    fetchTransactions(card.id);
                  }}
                >
                  <History className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCardAction('delete', card.id)}
                  disabled={loading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="mt-3 text-xs text-muted-foreground">
                <p>Limite journalière: {card.daily_limit.toLocaleString()} {card.currency}</p>
                <p>Limite transaction: {card.transaction_limit.toLocaleString()} {card.currency}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {cards.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <CreditCard className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucune carte créée</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première carte virtuelle pour commencer
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Créer ma première carte
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Transaction History Dialog */}
      {selectedCard && (
        <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Historique - {selectedCard.card_name}</DialogTitle>
              <DialogDescription>
                Transactions et activités de la carte
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Solde actuel</p>
                  <p className="text-lg font-semibold">{selectedCard.balance.toLocaleString()} {selectedCard.currency}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <p className={`text-lg font-semibold ${getStatusColor(selectedCard.status)}`}>
                    {selectedCard.status}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="text-lg font-semibold">{selectedCard.card_type}</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-lg font-semibold">{transactions.length}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Historique des transactions</h4>
                {transactions.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                          {transaction.merchant_name && (
                            <p className="text-sm text-muted-foreground">
                              Marchand: {transaction.merchant_name}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {transaction.amount && (
                            <p className={`font-semibold ${
                              transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.transaction_type === 'credit' ? '+' : '-'}
                              {Math.abs(transaction.amount).toLocaleString()} {transaction.currency}
                            </p>
                          )}
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune transaction enregistrée
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Chargement...</span>
        </div>
      )}
    </div>
  );
};

export default VirtualCardsManager;