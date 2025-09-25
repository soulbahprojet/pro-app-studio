import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, TrendingUp, TrendingDown, DollarSign, CreditCard, 
  Download, Upload, Clock, CheckCircle, AlertTriangle, 
  ArrowUpRight, ArrowDownLeft, Calendar, Filter, Smartphone
} from "lucide-react";
import { toast } from "sonner";

const VendorFinanceManager = () => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("");

  // Données financières fictives
  const walletData = {
    totalBalance: "2,847,650 GNF",
    availableBalance: "2,247,650 GNF", 
    pendingAmount: "600,000 GNF",
    totalEarnings: "8,450,230 GNF",
    thisMonthEarnings: "1,245,680 GNF",
    commission: {
      rate: "15%",
      thisMonth: "187,420 GNF"
    }
  };

  const transactions = [
    {
      id: "TXN-001",
      type: "sale",
      description: "Vente - Commande #ORD-2024-001",
      amount: "+125,000 GNF",
      status: "completed",
      date: "2024-01-15T14:30:00Z",
      orderId: "ORD-2024-001"
    },
    {
      id: "TXN-002",
      type: "withdrawal",
      description: "Retrait Mobile Money",
      amount: "-500,000 GNF",
      status: "completed",
      date: "2024-01-14T10:15:00Z",
      method: "Orange Money"
    },
    {
      id: "TXN-003",
      type: "sale",
      description: "Vente - Commande #ORD-2024-002",
      amount: "+89,500 GNF",
      status: "pending",
      date: "2024-01-13T16:45:00Z",
      orderId: "ORD-2024-002"
    },
    {
      id: "TXN-004",
      type: "commission",
      description: "Commission plateforme",
      amount: "-18,750 GNF",
      status: "completed",
      date: "2024-01-13T16:45:00Z",
      orderId: "ORD-2024-002"
    },
    {
      id: "TXN-005",
      type: "refund",
      description: "Remboursement - Commande #ORD-2024-000",
      amount: "-75,000 GNF",
      status: "completed",
      date: "2024-01-12T09:20:00Z",
      orderId: "ORD-2024-000"
    }
  ];

  const payoutRequests = [
    {
      id: "PAY-001",
      amount: "500,000 GNF",
      method: "Orange Money",
      status: "processing",
      requestDate: "2024-01-14T10:00:00Z",
      processedDate: null,
      bankDetails: "+224 622 123 456"
    },
    {
      id: "PAY-002", 
      amount: "1,000,000 GNF",
      method: "Virement bancaire",
      status: "completed",
      requestDate: "2024-01-10T14:30:00Z",
      processedDate: "2024-01-11T09:15:00Z",
      bankDetails: "BCA - **** 1234"
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'withdrawal': return <ArrowDownLeft className="h-4 w-4 text-blue-500" />;
      case 'refund': return <ArrowDownLeft className="h-4 w-4 text-red-500" />;
      case 'commission': return <ArrowDownLeft className="h-4 w-4 text-orange-500" />;
      default: return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-700">Terminé</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-orange-500 text-orange-700">En attente</Badge>;
      case 'processing':
        return <Badge variant="outline" className="border-blue-500 text-blue-700">Traitement</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || !withdrawMethod) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    toast.success(`Demande de retrait de ${withdrawAmount} GNF créée`);
    setIsWithdrawModalOpen(false);
    setWithdrawAmount("");
    setWithdrawMethod("");
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestion Financière</h2>
          <p className="text-muted-foreground">Suivez vos revenus et gérez vos retraits</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Demander un retrait
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Demande de retrait</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="amount">Montant à retirer (GNF)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Ex: 500000"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Solde disponible: {walletData.availableBalance}
                  </p>
                </div>
                <div>
                  <Label htmlFor="method">Méthode de retrait</Label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="orange_money">Orange Money</SelectItem>
                      <SelectItem value="mtn_money">MTN Money</SelectItem>
                      <SelectItem value="moov_money">Moov Money</SelectItem>
                      <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {withdrawMethod === "bank_transfer" && (
                  <div className="space-y-3">
                    <Input placeholder="Nom de la banque" />
                    <Input placeholder="Numéro de compte" />
                    <Input placeholder="Nom du titulaire" />
                  </div>
                )}
                {withdrawMethod && withdrawMethod !== "bank_transfer" && (
                  <div>
                    <Label htmlFor="phone">Numéro de téléphone</Label>
                    <Input
                      id="phone"
                      placeholder="+224 6XX XXX XXX"
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsWithdrawModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleWithdraw}>
                    Confirmer la demande
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Cartes résumé financier */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Solde Total</span>
              <Wallet className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{walletData.totalBalance}</div>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Disponible</span>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{walletData.availableBalance}</div>
            <p className="text-xs text-blue-600 mt-1">Prêt pour retrait</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>En attente</span>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{walletData.pendingAmount}</div>
            <p className="text-xs text-orange-600 mt-1">En cours de traitement</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>Ce mois</span>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{walletData.thisMonthEarnings}</div>
            <p className="text-xs text-purple-600 mt-1">Revenus janvier</p>
          </CardContent>
        </Card>
      </div>

      {/* Commission et résumé */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Commission Plateforme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Taux commission</span>
                <Badge variant="outline">{walletData.commission.rate}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ce mois</span>
                <span className="font-bold text-red-600">{walletData.commission.thisMonth}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground p-3 bg-accent/50 rounded-lg">
              Les commissions sont automatiquement déduites de chaque vente
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Résumé des revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Revenus totaux</span>
                </div>
                <span className="font-bold text-green-600">{walletData.totalEarnings}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Aujourd'hui</p>
                  <p className="font-bold text-lg">45,000 GNF</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cette semaine</p>
                  <p className="font-bold text-lg">315,000 GNF</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ce mois</p>
                  <p className="font-bold text-lg">{walletData.thisMonthEarnings}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demandes de retrait */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Demandes de retrait</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payoutRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {request.method.includes('Money') ? (
                      <Smartphone className="h-5 w-5 text-blue-500" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-medium">{request.amount}</p>
                      <p className="text-sm text-muted-foreground">{request.method} • {request.bankDetails}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.requestDate).toLocaleDateString('fr-FR')}
                    </p>
                    {request.processedDate && (
                      <p className="text-xs text-green-600">
                        Traité le {new Date(request.processedDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Historique des transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-accent/50 rounded-lg transition-colors">
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleString('fr-FR')}
                      {transaction.orderId && ` • ${transaction.orderId}`}
                      {transaction.method && ` • ${transaction.method}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-bold ${
                    transaction.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount}
                  </span>
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorFinanceManager;