import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Upload,
  CreditCard,
  Banknote,
  History,
  Eye,
  EyeOff
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletBalance {
  gnf: number;
  usd: number;
  eur: number;
}

export default function VendorWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<WalletBalance>({ gnf: 0, usd: 0, eur: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('GNF');

  // Données simulées pour la démonstration
  useEffect(() => {
    const mockBalance: WalletBalance = {
      gnf: 0,
      usd: 0,
      eur: 0
    };

    const mockTransactions: Transaction[] = [];

    setBalance(mockBalance);
    setTransactions(mockTransactions);
  }, []);

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    const currency = selectedCurrency.toLowerCase() as keyof WalletBalance;
    
    if (amount > balance[currency]) {
      toast({
        title: "Solde insuffisant",
        description: "Le montant demandé dépasse votre solde disponible",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Demande de retrait envoyée",
      description: "Votre demande de retrait sera traitée sous 24-48h"
    });
    setWithdrawAmount('');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'GNF' ? 0 : 2
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'credit' ? 
      <TrendingUp className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portefeuille Vendeur</h2>
          <p className="text-muted-foreground">Gérez vos revenus et retraits</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBalance(!showBalance)}
        >
          {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {/* Soldes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Banknote className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Solde GNF</p>
                <p className="text-2xl font-bold">
                  {showBalance ? formatCurrency(balance.gnf, 'GNF') : '***'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Solde USD</p>
                <p className="text-2xl font-bold">
                  {showBalance ? formatCurrency(balance.usd, 'USD') : '***'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Wallet className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Solde EUR</p>
                <p className="text-2xl font-bold">
                  {showBalance ? formatCurrency(balance.eur, 'EUR') : '***'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Retrait */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Demander un retrait
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currency">Devise</Label>
              <select 
                id="currency"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="GNF">GNF - Franc Guinéen</option>
                <option value="USD">USD - Dollar Américain</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <div>
              <Label htmlFor="amount">Montant</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Entrez le montant"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Solde disponible: {formatCurrency(balance[selectedCurrency.toLowerCase() as keyof WalletBalance], selectedCurrency)}
              </p>
            </div>

            <Button onClick={handleWithdraw} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Demander le retrait
            </Button>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenus ce mois
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ventes totales</span>
                <span className="font-medium">0 GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Commission plateforme</span>
                <span className="font-medium text-red-500">0 GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Revenus nets</span>
                <span className="font-bold">0 GNF</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Prochaine cession de fonds: Aucune vente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historique des transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historique des transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Aucune transaction</h3>
              <p className="text-muted-foreground">
                Vos transactions apparaîtront ici une fois que vous commencerez à vendre
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'credit' ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                      {transaction.status === 'completed' ? 'Terminé' : 'En attente'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}