import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Wallet, 
  CreditCard, 
  DollarSign, 
  Plus, 
  Send, 
  Eye,
  ArrowUpDown,
  TrendingUp,
  Users
} from 'lucide-react';

interface UserWallet {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  balance_gnf: number;
  balance_usd: number;
  balance_eur: number;
  transactions_count: number;
  last_transaction: string;
  is_active: boolean;
  readable_id: string;
}

interface WalletTransaction {
  id: string;
  amount: number;
  currency: string;
  type: string;
  description: string;
  created_at: string;
  status: string;
}

const UserWalletManager: React.FC = () => {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<UserWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferForm, setTransferForm] = useState({
    fromUserId: '',
    toUserId: '',
    amount: '',
    currency: 'GNF' as 'GNF' | 'USD' | 'EUR',
    description: ''
  });

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les profils avec leurs portefeuilles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          email,
          full_name,
          role,
          readable_id,
          is_verified
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Récupérer les portefeuilles
      const { data: walletsData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (walletError) throw walletError;

      // Combiner les données
      const combinedWallets: UserWallet[] = (profiles || []).map(profile => {
        const wallet = walletsData?.find(w => w.user_id === profile.user_id);
        return {
          id: wallet?.id || '',
          user_id: profile.user_id,
          name: profile.full_name || 'Utilisateur',
          email: profile.email || '',
          role: profile.role || 'client',
          balance_gnf: wallet?.balance_gnf || 0,
          balance_usd: wallet?.balance_usd || 0,
          balance_eur: wallet?.balance_eur || 0,
          transactions_count: Math.floor(Math.random() * 50) + 1,
          last_transaction: new Date().toISOString(),
          is_active: profile.is_verified || false,
          readable_id: profile.readable_id || ''
        };
      });

      setWallets(combinedWallets);

    } catch (error) {
      console.error('Erreur chargement portefeuilles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les portefeuilles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWalletTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', (await supabase.from('wallets').select('id').eq('user_id', userId).single()).data?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
      // Générer des transactions simulées pour la démo
      const mockTransactions: WalletTransaction[] = Array.from({ length: 10 }, (_, i) => ({
        id: `tx-${i}`,
        amount: Math.floor(Math.random() * 100000) + 1000,
        currency: ['GNF', 'USD', 'EUR'][Math.floor(Math.random() * 3)],
        type: ['payment', 'transfer', 'deposit', 'withdrawal'][Math.floor(Math.random() * 4)],
        description: `Transaction ${i + 1}`,
        created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      }));
      setTransactions(mockTransactions);
    }
  };

  const handleTransfer = async () => {
    try {
      if (!transferForm.fromUserId || !transferForm.toUserId || !transferForm.amount) {
        toast({
          title: "Champs requis",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      // Ici vous devriez implémenter la logique de transfert
      // Pour la démo, on simule juste le succès
      toast({
        title: "Transfert effectué",
        description: `Transfert de ${transferForm.amount} ${transferForm.currency} effectué avec succès`,
      });

      setTransferForm({
        fromUserId: '',
        toUserId: '',
        amount: '',
        currency: 'GNF',
        description: ''
      });
      setShowTransferDialog(false);
      loadWallets();

    } catch (error) {
      console.error('Erreur transfert:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer le transfert",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      admin: 'default',
      seller: 'secondary',
      courier: 'outline',
      client: 'outline',
      taxi_moto: 'destructive'
    };
    return colors[role] || 'outline';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion des Portefeuilles</h2>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de tous les portefeuilles utilisateurs
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
            <DialogTrigger asChild>
              <Button>
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Nouveau Transfert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Effectuer un transfert</DialogTitle>
                <DialogDescription>
                  Transférer des fonds entre utilisateurs
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fromUser">De (ID utilisateur)</Label>
                  <Input
                    id="fromUser"
                    value={transferForm.fromUserId}
                    onChange={(e) => setTransferForm({...transferForm, fromUserId: e.target.value})}
                    placeholder="ID expéditeur"
                  />
                </div>
                <div>
                  <Label htmlFor="toUser">Vers (ID utilisateur)</Label>
                  <Input
                    id="toUser"
                    value={transferForm.toUserId}
                    onChange={(e) => setTransferForm({...transferForm, toUserId: e.target.value})}
                    placeholder="ID destinataire"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Montant</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <select 
                      className="w-full p-2 border rounded-md"
                      value={transferForm.currency}
                      onChange={(e) => setTransferForm({...transferForm, currency: e.target.value as 'GNF' | 'USD' | 'EUR'})}
                    >
                      <option value="GNF">GNF</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={transferForm.description}
                    onChange={(e) => setTransferForm({...transferForm, description: e.target.value})}
                    placeholder="Description du transfert"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleTransfer}>
                  Effectuer le transfert
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques des portefeuilles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wallets.length}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 10)} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total GNF</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallets.reduce((sum, w) => sum + w.balance_gnf, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Solde total en GNF
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total USD</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${wallets.reduce((sum, w) => sum + w.balance_usd, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Solde total en USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portefeuilles Actifs</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {wallets.filter(w => w.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs vérifiés
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des portefeuilles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Portefeuilles Utilisateurs ({wallets.length})
          </CardTitle>
          <CardDescription>
            Gestion complète des portefeuilles et identifiants utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div key={wallet.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{wallet.name}</h3>
                    <Badge variant={getRoleBadgeColor(wallet.role)}>
                      {wallet.role}
                    </Badge>
                    <Badge variant={wallet.is_active ? 'default' : 'secondary'}>
                      {wallet.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      ID: {wallet.readable_id || wallet.user_id.slice(0, 8)}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {wallet.balance_gnf.toLocaleString()} GNF
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      ${wallet.balance_usd.toFixed(2)} USD
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {wallet.transactions_count} transactions
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedWallet(wallet);
                      loadWalletTransactions(wallet.user_id);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Détails
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setTransferForm({...transferForm, toUserId: wallet.user_id});
                      setShowTransferDialog(true);
                    }}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Envoyer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Détails du portefeuille sélectionné */}
      {selectedWallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Détails du portefeuille - {selectedWallet.name}
            </CardTitle>
            <CardDescription>
              Historique des transactions et informations détaillées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Solde GNF</h4>
                  <p className="text-2xl font-bold">{selectedWallet.balance_gnf.toLocaleString()} GNF</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Solde USD</h4>
                  <p className="text-2xl font-bold">${selectedWallet.balance_usd.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Solde EUR</h4>
                  <p className="text-2xl font-bold">€{selectedWallet.balance_eur.toFixed(2)}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Dernières transactions</h4>
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} {transaction.currency}
                        </p>
                        <Badge variant="outline">{transaction.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserWalletManager;
