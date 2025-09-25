import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wallet, 
  CreditCard, 
  Smartphone, 
  QrCode, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Download,
  Lock,
  Unlock,
  Send,
  Users
} from 'lucide-react';

interface WalletData {
  id: string;
  balance_gnf: number;
  balance_usd: number;
  balance_eur: number;
  balance_xof: number;
  balance_cny: number;
  is_frozen: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  created_at: string;
  reference_id: string;
  wallet?: {
    user_id: string;
    user: {
      readable_id: string;
      full_name: string;
      email: string;
    };
  };
  other_party?: {
    readable_id: string;
    full_name: string;
    email: string;
  };
}

const WalletManagement: React.FC = () => {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<'gnf' | 'usd' | 'eur' | 'xof' | 'cny'>('gnf');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('gnf');
  const [bankDetails, setBankDetails] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  
  // Transfer states
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCurrency, setTransferCurrency] = useState('gnf');
  const [recipientId, setRecipientId] = useState('');
  const [transferPurpose, setTransferPurpose] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      console.log('Loading wallet data...');
      // Utiliser GET au lieu de POST pour récupérer les données
      const { data, error } = await supabase.functions.invoke('wallet', {
        method: 'GET'
      });
      
      console.log('Wallet response:', { data, error });
      
      if (error) throw error;
      
      // Vérifications robustes avec valeurs par défaut
      if (data && data.wallet) {
        console.log('Setting wallet data:', data.wallet);
        setWallet({
          id: data.wallet.id || '',
          balance_gnf: data.wallet.balance_gnf || 0,
          balance_usd: data.wallet.balance_usd || 0,
          balance_eur: data.wallet.balance_eur || 0,
          balance_xof: data.wallet.balance_xof || 0,
          balance_cny: data.wallet.balance_cny || 0,
          is_frozen: data.wallet.is_frozen || false
        });
      } else {
        console.log('No wallet data received, setting to null');
        setWallet(null);
      }
      
      setTransactions(Array.isArray(data?.transactions) ? data.transactions : []);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du portefeuille",
        variant: "destructive"
      });
      // Définir des valeurs par défaut en cas d'erreur
      setWallet(null);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const addTestCredit = async () => {
    try {
      setLoading(true);
      console.log('Adding test credit...');
      
      const { data, error } = await supabase.functions.invoke('wallet', {
        body: {
          action: 'deposit',
          amount: 100000,
          currency: 'GNF',
          payment_method: 'Test Credit'
        }
      });
      
      console.log('Add credit response:', data, error);
      
      if (error) {
        console.error('Add credit error:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le crédit",
          variant: "destructive"
        });
        return;
      }

      if (data?.success) {
        toast({
          title: "Crédit ajouté",
          description: `100,000 GNF ont été ajoutés à votre compte`,
        });
        
        // Recharger les données du wallet
        await loadWalletData();
      } else {
        throw new Error(data?.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('Error adding credit:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'ajout du crédit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !bankDetails) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsWithdrawing(true);
      const { data, error } = await supabase.functions.invoke('wallet', {
        body: {
          action: 'withdraw',
          amount: parseFloat(withdrawAmount),
          currency: withdrawCurrency.toUpperCase(),
          bank_details: bankDetails
        }
      });

      if (error) throw error;

      toast({
        title: "Demande de retrait soumise",
        description: `Référence: ${data.reference}`,
      });

      setWithdrawAmount('');
      setBankDetails('');
      loadWalletData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du retrait",
        variant: "destructive"
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || !recipientId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsTransferring(true);
      console.log('Starting transfer with data:', {
        action: 'transfer',
        recipient_id: recipientId,
        amount: parseFloat(transferAmount),
        currency: transferCurrency.toUpperCase(),
        purpose: transferPurpose
      });

      const { data, error } = await supabase.functions.invoke('wallet', {
        body: {
          action: 'transfer',
          recipient_id: recipientId,
          amount: parseFloat(transferAmount),
          currency: transferCurrency.toUpperCase(),
          purpose: transferPurpose
        }
      });

      console.log('Transfer response:', { data, error });

      // Vérifier si l'erreur est dans data ou error
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Erreur de connexion');
      }

      if (data?.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.success) {
        console.error('Transfer failed:', data);
        
        // Si pas de succès mais pas d'erreur explicite, vérifier si le transfert s'est fait quand même
        if (data?.reference) {
          toast({
            title: "Transfert effectué ✅",
            description: `Référence: ${data.reference}`,
          });
          
          setTransferAmount('');
          setRecipientId('');
          setTransferPurpose('');
          await loadWalletData();
          return;
        }
        
        throw new Error(data?.message || 'Transfert échoué');
      }

      toast({
        title: "Transfert effectué",
        description: `Référence: ${data.reference}`,
      });

      setTransferAmount('');
      setRecipientId('');
      setTransferPurpose('');
      await loadWalletData();
    } catch (error: any) {
      console.error('Transfer error:', error);
      toast({
        title: "Erreur de transfert",
        description: error.message || "Erreur lors du transfert",
        variant: "destructive"
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbols = { gnf: 'GNF', usd: '$', eur: '€', xof: 'XOF', cny: '¥' };
    return `${amount.toLocaleString()} ${symbols[currency as keyof typeof symbols]}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale':
      case 'transfer_in':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
      case 'transfer_out':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Wallet className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      completed: { variant: "default", label: "Complétée" },
      pending: { variant: "secondary", label: "En attente" },
      failed: { variant: "destructive", label: "Échouée" },
      cancelled: { variant: "outline", label: "Annulée" }
    };
    
    const statusInfo = variants[status] || { variant: "outline", label: status };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentBalance = wallet && wallet[`balance_${selectedCurrency}` as keyof WalletData] != null 
    ? wallet[`balance_${selectedCurrency}` as keyof WalletData] as number 
    : 0;

  // Debug log
  console.log('Current wallet state:', wallet);
  console.log('Selected currency:', selectedCurrency);
  console.log('Current balance:', currentBalance);

  return (
    <div className="space-y-6">
      {/* Header avec soldes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde Principal</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalance ? formatAmount(currentBalance, selectedCurrency) : "•••••"}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Select value={selectedCurrency} onValueChange={(value) => setSelectedCurrency(value as any)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gnf">GNF</SelectItem>
                  <SelectItem value="usd">USD</SelectItem>
                  <SelectItem value="eur">EUR</SelectItem>
                  <SelectItem value="xof">XOF</SelectItem>
                  <SelectItem value="cny">CNY</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={() => {
                  console.log('Button clicked - adding test credit');
                  addTestCredit();
                }}
                variant="outline" 
                size="sm"
                disabled={loading}
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                💰 + 100K GNF (Test)
              </Button>
              {wallet?.is_frozen && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Bloqué
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Méthodes de Paiement</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CreditCard className="w-3 h-3" />
                Carte
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                Mobile Money
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <QrCode className="w-3 h-3" />
                QR Code
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions du Mois</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(transactions) ? transactions.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 depuis la semaine dernière
            </p>
          </CardContent>
        </Card>
      </div>

      {wallet?.is_frozen && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Votre portefeuille est temporairement bloqué par l'administration. 
            Contactez le support pour plus d'informations.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="transfer">Transfert</TabsTrigger>
          <TabsTrigger value="withdraw">Retrait</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Transactions</CardTitle>
              <CardDescription>
                Consultez toutes vos transactions récentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!Array.isArray(transactions) || transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {!Array.isArray(transactions) ? "Chargement des transactions..." : "Aucune transaction trouvée"}
                  </p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-start space-x-4 flex-1">
                        {getTransactionIcon(transaction.type)}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-muted-foreground">ID: {transaction.id.slice(0, 8)}...</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                            <div>
                              <p>📅 {new Date(transaction.created_at).toLocaleDateString('fr-FR')}</p>
                              <p>🕐 {new Date(transaction.created_at).toLocaleTimeString('fr-FR')}</p>
                            </div>
                            <div>
                              <p>📋 Réf: {transaction.reference_id}</p>
                              <p>💳 {transaction.currency.toUpperCase()}</p>
                            </div>
                          </div>
                          {(transaction.other_party || transaction.wallet?.user) && (
                            <div className="bg-muted/30 p-2 rounded text-xs">
                              {transaction.type === 'transfer' && transaction.other_party ? (
                                <>
                                  <p className="font-medium">👤 Destinataire:</p>
                                  <p>📧 {transaction.other_party.email}</p>
                                  <p>🆔 ID: {transaction.other_party.readable_id}</p>
                                  <p>👤 {transaction.other_party.full_name || "Nom non disponible"}</p>
                                </>
                              ) : transaction.type === 'payment' && transaction.other_party ? (
                                <>
                                  <p className="font-medium">👤 Expéditeur:</p>
                                  <p>📧 {transaction.other_party.email}</p>
                                  <p>🆔 ID: {transaction.other_party.readable_id}</p>
                                  <p>👤 {transaction.other_party.full_name || "Nom non disponible"}</p>
                                </>
                              ) : transaction.wallet?.user ? (
                                <>
                                  <p className="font-medium">👤 Utilisateur:</p>
                                  <p>📧 {transaction.wallet.user.email}</p>
                                  <p>🆔 ID: {transaction.wallet.user.readable_id}</p>
                                  <p>👤 {transaction.wallet.user.full_name || "Nom non disponible"}</p>
                                </>
                              ) : null}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2 ml-4">
                        <p className={`text-lg font-bold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}
                          {formatAmount(Math.abs(transaction.amount), transaction.currency.toLowerCase())}
                        </p>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Transférer des Fonds
              </CardTitle>
              <CardDescription>
                Transférez de l'argent vers un autre portefeuille
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wallet?.is_frozen ? (
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Les transferts sont suspendus car votre compte est bloqué.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="transfer-amount">Montant</Label>
                      <Input
                        id="transfer-amount"
                        type="number"
                        placeholder="0.00"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transfer-currency">Devise</Label>
                      <Select value={transferCurrency} onValueChange={setTransferCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gnf">GNF</SelectItem>
                          <SelectItem value="usd">USD</SelectItem>
                          <SelectItem value="eur">EUR</SelectItem>
                          <SelectItem value="xof">XOF</SelectItem>
                          <SelectItem value="cny">CNY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipient-id">ID Destinataire *</Label>
                    <Input
                      id="recipient-id"
                      placeholder="ID ou email du destinataire..."
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transfer-purpose">Motif (optionnel)</Label>
                    <Input
                      id="transfer-purpose"
                      placeholder="Raison du transfert..."
                      value={transferPurpose}
                      onChange={(e) => setTransferPurpose(e.target.value)}
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Résumé du transfert</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Montant à envoyer:</p>
                          <p className="font-medium">{transferAmount ? formatAmount(parseFloat(transferAmount), transferCurrency) : "0.00"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Frais de commission (1%):</p>
                          <p className="font-medium text-orange-600">
                            {transferAmount ? formatAmount(parseFloat(transferAmount) * 0.01, transferCurrency) : "0.00"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground">Total prélevé:</p>
                          <p className="font-semibold text-red-600">
                            {transferAmount ? formatAmount(parseFloat(transferAmount) * 1.01, transferCurrency) : "0.00"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Solde disponible:</p>
                          <p className="font-medium">{formatAmount(currentBalance, selectedCurrency)}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-muted-foreground">Destinataire:</p>
                        <p className="font-medium">{recipientId || "Non spécifié"}</p>
                        <p className="text-muted-foreground">Motif:</p>
                        <p className="font-medium">{transferPurpose || "Transfert entre utilisateurs"}</p>
                        <p className="text-muted-foreground">Date/Heure:</p>
                        <p className="font-medium">{new Date().toLocaleString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleTransfer} 
                    disabled={isTransferring || !transferAmount || !recipientId}
                    className="w-full"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isTransferring ? "Transfert en cours..." : "Effectuer le Transfert"}
                  </Button>

                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Demande de Retrait</CardTitle>
              <CardDescription>
                Les retraits sont traités après validation administrative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wallet?.is_frozen ? (
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    Les retraits sont suspendus car votre compte est bloqué.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Montant</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Devise</Label>
                      <Select value={withdrawCurrency} onValueChange={setWithdrawCurrency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gnf">GNF</SelectItem>
                          <SelectItem value="usd">USD</SelectItem>
                          <SelectItem value="eur">EUR</SelectItem>
                          <SelectItem value="xof">XOF</SelectItem>
                          <SelectItem value="cny">CNY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bank-details">Détails Bancaires / Mobile Money</Label>
                    <Textarea
                      id="bank-details"
                      placeholder="Numéro de compte, nom de la banque, ou numéro Mobile Money..."
                      value={bankDetails}
                      onChange={(e) => setBankDetails(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleWithdraw} 
                    disabled={isWithdrawing || !withdrawAmount || !bankDetails}
                    className="w-full"
                  >
                    {isWithdrawing ? "Traitement..." : "Demander le Retrait"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du Portefeuille</CardTitle>
              <CardDescription>
                Gérez vos préférences de paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Affichage du solde</p>
                  <p className="text-sm text-muted-foreground">
                    Masquer le solde par défaut
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>

              <Separator />

              <div>
                <p className="font-medium mb-2">Méthodes de Paiement Acceptées</p>
                <div className="space-y-2">
                  {[
                    { icon: <CreditCard className="w-4 h-4" />, name: "Cartes Bancaires", desc: "Visa, Mastercard" },
                    { icon: <Smartphone className="w-4 h-4" />, name: "Mobile Money", desc: "Orange Money, MTN Money" },
                    { icon: <QrCode className="w-4 h-4" />, name: "Code Marchand", desc: "QR Code pour paiements" }
                  ].map((method, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                      {method.icon}
                      <div className="flex-1">
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.desc}</p>
                      </div>
                      <Badge variant="default">Actif</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletManagement;