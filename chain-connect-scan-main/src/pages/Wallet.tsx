import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  TrendingUp,
  DollarSign,
  Euro,
  Plus,
  Eye,
  EyeOff,
  Home,
  ChevronRight,
  ArrowRightLeft,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import FloatingHomeButton from "@/components/FloatingHomeButton";
import WalletTransferSystem from "@/components/WalletTransferSystem";
import WalletManagement from "@/components/WalletManagement";
import VirtualCardsManager from "@/components/VirtualCardsManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Wallet = () => {
  const [showBalance, setShowBalance] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("GNF");
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isCardsOpen, setIsCardsOpen] = useState(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Récupérer les données du portefeuille depuis Supabase
  const fetchWalletData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('wallet');
      
      if (error) {
        console.error('Erreur lors de la récupération des données du portefeuille:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du portefeuille",
          variant: "destructive",
        });
        return;
      }
      
      setWalletData(data);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [user]);

  // Générer les données de balance à partir des données Supabase
  const balances = walletData ? [
    { 
      currency: "GNF", 
      amount: walletData.wallet?.balance_gnf || 0, 
      symbol: "GNF",
      active: (walletData.wallet?.balance_gnf || 0) > 0
    },
    { 
      currency: "USD", 
      amount: walletData.wallet?.balance_usd || 0, 
      symbol: "$",
      active: (walletData.wallet?.balance_usd || 0) > 0
    },
    { 
      currency: "EUR", 
      amount: walletData.wallet?.balance_eur || 0, 
      symbol: "€",
      active: (walletData.wallet?.balance_eur || 0) > 0
    },
    { 
      currency: "XOF", 
      amount: walletData.wallet?.balance_xof || 0, 
      symbol: "₣",
      active: (walletData.wallet?.balance_xof || 0) > 0
    },
    { 
      currency: "CNY", 
      amount: walletData.wallet?.balance_cny || 0, 
      symbol: "¥",
      active: (walletData.wallet?.balance_cny || 0) > 0
    }
  ].filter(balance => balance.active || balance.currency === 'GNF') : [];

  // Données pour le système de transfert
  const userWallets = balances.map(balance => ({
    id: `wallet_${user?.id}_${balance.currency}`,
    currency: balance.currency as 'GNF' | 'USD' | 'EUR' | 'XOF' | 'CNY',
    balance: balance.amount
  }));

  const handleTransfer = (transfer: any) => {
    // Actualiser les données après transfert
    fetchWalletData();
    setIsTransferOpen(false);
  };

  // Les transactions viennent déjà de l'état via setTransactions

  const cards = [
    {
      id: 1,
      type: "Orange Money",
      number: "****7856",
      expiry: "12/26",
      default: true
    },
    {
      id: 2,
      type: "Wave",
      number: "****3421",
      expiry: "08/25",
      default: false
    }
  ];

  const formatAmount = (amount: number, currency: string) => {
    const currencyData = balances.find(b => b.currency === currency);
    return `${currencyData?.symbol}${amount.toLocaleString()}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "payment":
      case "deposit":
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case "transfer":
      case "withdrawal":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement du portefeuille...</span>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="flex items-center hover:text-primary transition-smooth">
            <Home className="w-4 h-4 mr-1" />
            Accueil
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Portefeuille</span>
        </nav>
      </div>
      
      <main className="container mx-auto px-4 py-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mon Portefeuille</h1>
            <p className="text-muted-foreground mt-2">Gérez vos finances en toute sécurité</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Retour Accueil
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter des fonds
          </Button>
          <Button size="sm" className="bg-gradient-primary text-white">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Retirer
          </Button>
          <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                Transférer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Système de Portefeuille</DialogTitle>
              </DialogHeader>
              <WalletManagement />
            </DialogContent>
          </Dialog>
          
          {/* Carte Virtuelle Button */}
          <Dialog open={isCardsOpen} onOpenChange={setIsCardsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none hover:from-purple-600 hover:to-pink-600">
                <CreditCard className="h-4 w-4 mr-2" />
                Carte Virtuelle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Gestion des Cartes Virtuelles</DialogTitle>
              </DialogHeader>
              <VirtualCardsManager />
            </DialogContent>
          </Dialog>

          {/* Transaction Button */}
          <Dialog open={isTransactionOpen} onOpenChange={setIsTransactionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none hover:from-green-600 hover:to-emerald-600">
                <DollarSign className="h-4 w-4 mr-2" />
                Effectuer Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvelle Transaction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 p-4">
                <div>
                  <label className="text-sm font-medium">Type de transaction</label>
                  <select className="w-full mt-1 p-2 border border-border rounded-md bg-background">
                    <option value="payment">Paiement</option>
                    <option value="transfer">Transfert</option>
                    <option value="withdrawal">Retrait</option>
                    <option value="deposit">Dépôt</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Montant</label>
                  <input 
                    type="number" 
                    placeholder="Entrez le montant"
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Devise</label>
                  <select className="w-full mt-1 p-2 border border-border rounded-md bg-background">
                    {balances.map(balance => (
                      <option key={balance.currency} value={balance.currency}>
                        {balance.currency} - Solde: {formatAmount(balance.amount, balance.currency)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <input 
                    type="text" 
                    placeholder="Description de la transaction"
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1 bg-gradient-primary text-white"
                    onClick={() => {
                      toast({
                        title: "Transaction initiée",
                        description: "Votre transaction est en cours de traitement"
                      });
                      setIsTransactionOpen(false);
                    }}
                  >
                    Confirmer Transaction
                  </Button>
                  <Button variant="outline" onClick={() => setIsTransactionOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {balances.map((balance) => (
            <Card key={balance.currency} className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-primary opacity-5" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {balance.currency}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="h-6 w-6 p-0"
                  >
                    {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {showBalance ? formatAmount(balance.amount, balance.currency) : "••••••"}
                </div>
                {balance.currency === "XOF" && (
                  <p className="text-sm text-muted-foreground mt-1">Solde principal</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="cards">Cartes & Comptes</TabsTrigger>
            <TabsTrigger value="virtual-cards">Cartes Virtuelles</TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Historique des transactions</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Devise:</span>
                <select 
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="px-3 py-1 border border-border rounded-md text-sm bg-background"
                >
                  {balances.map(balance => (
                    <option key={balance.currency} value={balance.currency}>
                      {balance.currency}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {transactions
                .filter(transaction => selectedCurrency === 'GNF' || transaction.currency === selectedCurrency)
                .map((transaction) => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <p className="font-medium text-foreground">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}
                        {Math.abs(transaction.amount).toLocaleString()} {transaction.currency}
                      </p>
                      <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status === 'completed' && 'Terminé'}
                        {transaction.status === 'pending' && 'En attente'}
                        {transaction.status === 'failed' && 'Échec'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
              {transactions.filter(transaction => selectedCurrency === 'GNF' || transaction.currency === selectedCurrency).length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">Aucune transaction trouvée pour {selectedCurrency}</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Cartes et comptes liés</h3>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une carte
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {cards.map((card) => (
                <Card key={card.id} className="relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        <CardTitle className="text-lg">{card.type}</CardTitle>
                      </div>
                      {card.default && (
                        <Badge variant="secondary">Par défaut</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="relative">
                    <p className="text-xl font-mono font-bold mb-2">{card.number}</p>
                    <p className="text-sm text-muted-foreground">Expire: {card.expiry}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Virtual Cards Tab */}
          <TabsContent value="virtual-cards" className="space-y-4">
            <div className="bg-card rounded-lg border">
              <VirtualCardsManager />
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h3 className="text-lg font-semibold">Statistiques financières</h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Revenus ce mois
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₣325,000</div>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Dépenses ce mois
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">₣185,000</div>
                  <div className="flex items-center text-sm text-red-600 mt-1">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +3.2%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Transactions totales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">147</div>
                  <p className="text-sm text-muted-foreground mt-1">Ce mois</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Épargne
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">₣140,000</div>
                  <p className="text-sm text-muted-foreground mt-1">Objectif: ₣200,000</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des dépenses</CardTitle>
                <CardDescription>Analyse de vos dépenses par catégorie</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Produits alimentaires</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-3/4 h-full bg-primary rounded-full" />
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Textiles</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-1/2 h-full bg-secondary rounded-full" />
                      </div>
                      <span className="text-sm font-medium">50%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Artisanat</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-accent rounded-full" />
                      </div>
                      <span className="text-sm font-medium">33%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <FloatingHomeButton />
      <Footer />
    </div>
  );
};

export default Wallet;