import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Progress } from '../../ui/progress';
import { 
  Wallet, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VendorPaymentsProps {
  userProfile: any;
}

const VendorPayments: React.FC<VendorPaymentsProps> = ({ userProfile }) => {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentData();
  }, [userProfile]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Charger le portefeuille
      const { data: walletData } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userProfile.user_id)
        .single();

      setWallet(walletData);

      // Charger les transactions
      const { data: transactionData } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', walletData?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setTransactions(transactionData || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données de paiement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de paiement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'payment' || type === 'escrow_release') {
      return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    }
    return <ArrowDownRight className="h-4 w-4 text-red-600" />;
  };

  const getTransactionBadge = (type: string) => {
    const types: any = {
      'payment': { label: 'Paiement reçu', variant: 'default' },
      'escrow_release': { label: 'Libération dépôt', variant: 'default' },
      'transfer': { label: 'Transfert', variant: 'secondary' },
      'commission': { label: 'Commission', variant: 'destructive' },
      'withdrawal': { label: 'Retrait', variant: 'secondary' }
    };
    
    const config = types[type] || { label: type, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalReceived = transactions
    .filter(t => ['payment', 'escrow_release'].includes(t.type))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.created_at);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });

  const thisMonthReceived = thisMonthTransactions
    .filter(t => ['payment', 'escrow_release'].includes(t.type))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble financière */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(wallet?.balance_gnf || 0).toLocaleString()} GNF
            </div>
            <p className="text-xs text-muted-foreground">
              Disponible pour retrait
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total reçu</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReceived.toLocaleString()} GNF
            </div>
            <p className="text-xs text-muted-foreground">
              Depuis le début
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {thisMonthReceived.toLocaleString()} GNF
            </div>
            <p className="text-xs text-muted-foreground">
              Revenus du mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Total des opérations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Rapides</CardTitle>
          <CardDescription>
            Gérez vos paiements et retraits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col gap-2">
              <Wallet className="h-6 w-6" />
              <span>Demander un retrait</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              <span>Télécharger relevé</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <CreditCard className="h-6 w-6" />
              <span>Configurer paiements</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historique des transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Transactions</CardTitle>
          <CardDescription>
            Consultez toutes vos transactions récentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="received">Reçues</TabsTrigger>
              <TabsTrigger value="sent">Envoyées</TabsTrigger>
              <TabsTrigger value="commission">Commissions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{transaction.description || 'Transaction'}</p>
                          {getTransactionBadge(transaction.type)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} GNF
                      </p>
                      <p className="text-sm text-muted-foreground">{transaction.currency}</p>
                    </div>
                  </div>
                ))}
                
                {transactions.length === 0 && (
                  <div className="text-center p-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune transaction</h3>
                    <p className="text-muted-foreground">
                      Vos transactions apparaîtront ici une fois que vous commencerez à vendre.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Méthodes de paiement */}
      <Card>
        <CardHeader>
          <CardTitle>Méthodes de Paiement Acceptées</CardTitle>
          <CardDescription>
            Configurez vos options de paiement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Mobile Money</h4>
                <Badge variant="default">Activé</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Orange Money, Moov Money, MTN Mobile Money
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Carte bancaire</h4>
                <Badge variant="secondary">Non configuré</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Visa, Mastercard (via Stripe)
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Virement bancaire</h4>
                <Badge variant="secondary">Non configuré</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Transfert direct sur compte bancaire
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Crypto-monnaies</h4>
                <Badge variant="outline">Bientôt</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Bitcoin, USDT, autres cryptos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorPayments;
