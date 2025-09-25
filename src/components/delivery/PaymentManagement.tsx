import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  CreditCard, 
  DollarSign, 
  Download, 
  TrendingUp, 
  Wallet,
  Smartphone,
  Banknote,
  FileText,
  Eye,
  Calendar
} from "lucide-react";

const PaymentManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const paymentMethods = [
    {
      id: 'orange_money',
      name: 'Orange Money',
      icon: Smartphone,
      enabled: true,
      percentage: 45
    },
    {
      id: 'mtn_money',
      name: 'MTN Mobile Money',
      icon: Smartphone,
      enabled: true,
      percentage: 30
    },
    {
      id: 'cash',
      name: 'Espèces (GNF)',
      icon: Banknote,
      enabled: true,
      percentage: 20
    },
    {
      id: 'card',
      name: 'Carte bancaire',
      icon: CreditCard,
      enabled: false,
      percentage: 5
    }
  ];

  const earnings = {
    today: {
      total: '385,000 GNF',
      rides: '295,000 GNF',
      tips: '35,000 GNF',
      bonuses: '55,000 GNF',
      count: 12
    },
    week: {
      total: '2,185,000 GNF',
      rides: '1,685,000 GNF',
      tips: '225,000 GNF',
      bonuses: '275,000 GNF',
      count: 78
    },
    month: {
      total: '8,850,000 GNF',
      rides: '6,850,000 GNF',
      tips: '885,000 GNF',
      bonuses: '1,115,000 GNF',
      count: 285
    }
  };

  const transactions = [
    {
      id: 1,
      type: 'ride',
      client: 'Mamadou Diallo',
      amount: '25,000',
      method: 'orange_money',
      status: 'completed',
      timestamp: '14:32',
      tip: '2,000'
    },
    {
      id: 2,
      type: 'ride',
      client: 'Fatoumata Camara',
      amount: '35,000',
      method: 'mtn_money',
      status: 'completed',
      timestamp: '13:45',
      tip: '0'
    },
    {
      id: 3,
      type: 'delivery',
      client: 'Alpha Barry',
      amount: '15,000',
      method: 'cash',
      status: 'completed',
      timestamp: '12:30',
      tip: '3,000'
    },
    {
      id: 4,
      type: 'bonus',
      client: 'Bonus performance',
      amount: '10,000',
      method: 'wallet',
      status: 'completed',
      timestamp: '12:00',
      tip: '0'
    }
  ];

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'orange_money': return Smartphone;
      case 'mtn_money': return Smartphone;
      case 'mobile_money': return Smartphone;
      case 'card': return CreditCard;
      case 'cash': return Banknote;
      case 'wallet': return Wallet;
      default: return DollarSign;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'orange_money': return 'Orange Money';
      case 'mtn_money': return 'MTN Mobile Money';
      case 'mobile_money': return 'Mobile Money';
      case 'card': return 'Carte bancaire';
      case 'cash': return 'Espèces (GNF)';
      case 'wallet': return 'Portefeuille';
      default: return method;
    }
  };

  const currentEarnings = earnings[selectedPeriod as keyof typeof earnings];

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Revenus totaux</p>
                <p className="text-3xl font-bold">{currentEarnings.total}</p>
                <p className="text-sm text-green-100">GNF</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-100" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Courses</p>
                <p className="text-2xl font-bold">{currentEarnings.rides}</p>
                <p className="text-xs text-muted-foreground">GNF</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pourboires</p>
                <p className="text-2xl font-bold">{currentEarnings.tips}</p>
                <p className="text-xs text-muted-foreground">GNF</p>
              </div>
              <Wallet className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bonus</p>
                <p className="text-2xl font-bold">{currentEarnings.bonuses}</p>
                <p className="text-xs text-muted-foreground">GNF</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Analyse des revenus</span>
            <div className="flex gap-2">
              {[
                { key: 'today', label: 'Aujourd\'hui' },
                { key: 'week', label: 'Cette semaine' },
                { key: 'month', label: 'Ce mois' }
              ].map((period) => (
                <Button
                  key={period.key}
                  variant={selectedPeriod === period.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period.key)}
                >
                  {period.label}
                </Button>
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-3xl font-bold text-green-600">{currentEarnings.total} GNF</p>
            <p className="text-muted-foreground">{currentEarnings.count} courses</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="methods">Moyens de paiement</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Historique des transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => {
                  const MethodIcon = getMethodIcon(transaction.method);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <MethodIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{transaction.client}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{getMethodName(transaction.method)}</span>
                            <span>•</span>
                            <span>{transaction.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-green-600">{transaction.amount} GNF</p>
                            {transaction.tip !== '0' && (
                              <p className="text-sm text-muted-foreground">
                                +{transaction.tip} GNF pourboire
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {transaction.status === 'completed' ? 'Terminé' : 'En cours'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Moyens de paiement acceptés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.percentage}% des transactions
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant={method.enabled ? "default" : "secondary"}>
                        {method.enabled ? 'Activé' : 'Désactivé'}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Factures générées
                </span>
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exporter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    id: 'INV-2024-001',
                    date: 'Aujourd\'hui',
                    amount: '185,000',
                    status: 'Envoyée'
                  },
                  {
                    id: 'INV-2024-002',
                    date: 'Hier',
                    amount: '165,000',
                    status: 'Envoyée'
                  },
                  {
                    id: 'INV-2024-003',
                    date: '2 jours',
                    amount: '195,000',
                    status: 'Envoyée'
                  }
                ].map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">{invoice.amount} GNF</p>
                        <Badge variant="outline" className="text-xs">
                          {invoice.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
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

export default PaymentManagement;
