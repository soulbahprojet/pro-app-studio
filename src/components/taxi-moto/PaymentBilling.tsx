import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { CreditCard, DollarSign, Download, Eye, Calendar, TrendingUp, Wallet, Receipt } from "lucide-react";

const PaymentBilling: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const paymentMethods = [
    {
      id: 1,
      type: 'mobile_money',
      name: 'Orange Money',
      number: '*144*123#',
      isDefault: true,
      balance: '125,000 GNF'
    },
    {
      id: 2,
      type: 'card',
      name: 'Carte Bancaire',
      number: '**** **** **** 1234',
      isDefault: false,
      balance: '0 GNF'
    },
    {
      id: 3,
      type: 'wallet',
      name: 'Portefeuille Interne',
      number: 'Solde disponible',
      isDefault: false,
      balance: '45,000 GNF'
    }
  ];

  const transactions = [
    {
      id: 1,
      type: 'earning',
      description: 'Course - Mamadou Diallo',
      amount: '+25,000 GNF',
      tip: '+2,000 GNF',
      commission: '-5,000 GNF',
      net: '+22,000 GNF',
      date: '2024-01-15',
      time: '14:30',
      status: 'completed',
      invoiceId: 'INV-001234'
    },
    {
      id: 2,
      type: 'earning',
      description: 'Course - Fatoumata Camara',
      amount: '+35,000 GNF',
      tip: '+0 GNF',
      commission: '-7,000 GNF',
      net: '+28,000 GNF',
      date: '2024-01-15',
      time: '13:45',
      status: 'completed',
      invoiceId: 'INV-001233'
    },
    {
      id: 3,
      type: 'withdrawal',
      description: 'Retrait vers Orange Money',
      amount: '-50,000 GNF',
      fee: '-2,000 GNF',
      net: '-52,000 GNF',
      date: '2024-01-15',
      time: '12:00',
      status: 'completed'
    }
  ];

  const dailyStats = {
    totalEarnings: '285,000',
    totalTips: '8,000',
    totalCommissions: '57,000',
    netEarnings: '236,000',
    ridesCompleted: 12
  };

  const weeklyStats = {
    totalEarnings: '1,850,000',
    totalTips: '45,000',
    totalCommissions: '370,000',
    netEarnings: '1,525,000',
    ridesCompleted: 78
  };

  const generateInvoice = (invoiceId: string) => {
    console.log('Génération facture:', invoiceId);
  };

  const downloadStatement = () => {
    console.log('Téléchargement relevé');
  };

  const requestWithdrawal = () => {
    console.log('Demande de retrait');
  };

  return (
    <div className="space-y-6">
      {/* Payment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenus du jour</p>
                <p className="text-2xl font-bold text-green-600">{dailyStats.totalEarnings} GNF</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pourboires</p>
                <p className="text-2xl font-bold text-blue-600">{dailyStats.totalTips} GNF</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commissions</p>
                <p className="text-2xl font-bold text-red-600">-{dailyStats.totalCommissions} GNF</p>
              </div>
              <Receipt className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net</p>
                <p className="text-2xl font-bold">{dailyStats.netEarnings} GNF</p>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payments">Moyens de paiement</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Historique des transactions
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                      <SelectItem value="year">Cette année</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={downloadStatement}>
                    <Download className="h-4 w-4 mr-2" />
                    Relevé
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'earning' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'earning' ? (
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <DollarSign className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {transaction.date} à {transaction.time}
                          </p>
                        </div>
                      </div>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status === 'completed' ? 'Terminé' : 'En attente'}
                      </Badge>
                    </div>

                    {transaction.type === 'earning' && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Montant:</span>
                          <span className="ml-2 font-medium text-green-600">{transaction.amount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pourboire:</span>
                          <span className="ml-2 font-medium text-blue-600">{transaction.tip}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Commission:</span>
                          <span className="ml-2 font-medium text-red-600">{transaction.commission}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net:</span>
                          <span className="ml-2 font-bold">{transaction.net}</span>
                        </div>
                      </div>
                    )}

                    {transaction.type === 'withdrawal' && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Montant retiré:</span>
                          <span className="ml-2 font-medium text-red-600">{transaction.amount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frais:</span>
                          <span className="ml-2 font-medium text-red-600">{transaction.fee}</span>
                        </div>
                      </div>
                    )}

                    {transaction.invoiceId && (
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateInvoice(transaction.invoiceId)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir facture
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Moyens de paiement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          {method.type === 'mobile_money' && '📱'}
                          {method.type === 'card' && '💳'}
                          {method.type === 'wallet' && '👛'}
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.number}</p>
                          <p className="text-sm font-medium text-green-600">{method.balance}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <Badge variant="default">Par défaut</Badge>
                        )}
                        <Button variant="outline" size="sm">
                          Gérer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full" onClick={requestWithdrawal}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Demander un retrait
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Factures générées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.filter(t => t.invoiceId).map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Facture {transaction.invoiceId}</p>
                        <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.date} à {transaction.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{transaction.net}</span>
                        <Button variant="outline" size="sm" onClick={() => generateInvoice(transaction.invoiceId!)}>
                          <Download className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentBilling;
