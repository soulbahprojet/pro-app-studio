import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  Smartphone,
  Building,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bell,
  FileText,
  Download,
  Star,
  MessageSquare
} from 'lucide-react';

interface ClientInvoice {
  id: string;
  invoice_number: string;
  vendor_name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue';
  due_date?: string;
  created_at: string;
}

interface ClientTransaction {
  id: string;
  type: 'payment' | 'refund';
  amount: number;
  currency: string;
  vendor_name: string;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

interface ClientPaymentModuleProps {
  clientId: string;
}

const ClientPaymentModule: React.FC<ClientPaymentModuleProps> = ({ clientId }) => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    loadClientData();
    
    // Notifications en temps réel
    const channel = supabase
      .channel('client_notifications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'client_invoices',
        filter: `client_id=eq.${clientId}`
      }, (payload) => {
        toast({
          title: "Nouvelle notification",
          description: "Une mise à jour de votre commande est disponible",
        });
        loadClientData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clientId]);

  const loadClientData = async () => {
    try {
      setLoading(true);
      
      // Charger les factures depuis les commandes existantes
      const { data: invoicesData } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', clientId)
        .order('created_at', { ascending: false });

      // Charger les transactions depuis les transactions existantes
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Adapter les données
      const adaptedInvoices = (invoicesData || []).map(o => ({
        id: o.id,
        invoice_number: o.readable_id || `INV-${o.id.slice(-8)}`,
        vendor_name: 'Vendeur',
        amount: o.total_amount,
        currency: o.currency,
        status: (o.status === 'delivered' ? 'paid' : 'pending') as 'pending' | 'paid' | 'overdue',
        created_at: o.created_at
      }));

      const adaptedTransactions = (transactionsData || []).map(t => ({
        id: t.id,
        type: (t.type === 'payment' ? 'payment' : 'refund') as 'payment' | 'refund',
        amount: Math.abs(t.amount),
        currency: t.currency,
        vendor_name: 'Vendeur',
        status: (t.status || 'completed') as 'completed' | 'pending' | 'failed',
        created_at: t.created_at
      }));

      setInvoices(adaptedInvoices);
      setTransactions(adaptedTransactions);
      
    } catch (error) {
      console.error('Erreur de chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (invoice: ClientInvoice) => {
    try {
      // Créer paiement sécurisé
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          invoice_id: invoice.id,
          payment_method: paymentMethod,
          amount: invoice.amount,
          currency: invoice.currency,
          escrow: true // Paiement retenu jusqu'à confirmation
        }
      });

      if (error) throw error;

      toast({
        title: "Paiement sécurisé",
        description: "Votre paiement est retenu en sécurité jusqu'à réception des produits",
      });

      setShowPaymentDialog(false);
      loadClientData();

    } catch (error) {
      console.error('Erreur paiement:', error);
      toast({
        title: "Erreur de paiement",
        description: "Le paiement a échoué. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleDispute = async () => {
    try {
      if (!selectedInvoice || !disputeReason.trim()) {
        toast({
          title: "Information manquante",
          description: "Veuillez décrire le problème",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.functions.invoke('create-dispute', {
        body: {
          invoice_id: selectedInvoice.id,
          reason: disputeReason,
          client_id: clientId
        }
      });

      if (error) throw error;

      toast({
        title: "Signalement envoyé",
        description: "Un ticket de résolution a été ouvert. Nous examinerons votre cas.",
      });

      setShowDisputeDialog(false);
      setDisputeReason('');
      setSelectedInvoice(null);

    } catch (error) {
      console.error('Erreur signalement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le signalement",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary", label: "En attente", icon: <Clock className="w-3 h-3" /> },
      paid: { variant: "default", label: "Payé", icon: <CheckCircle className="w-3 h-3" /> },
      overdue: { variant: "destructive", label: "En retard", icon: <AlertTriangle className="w-3 h-3" /> },
      completed: { variant: "default", label: "Terminé", icon: <CheckCircle className="w-3 h-3" /> },
      failed: { variant: "destructive", label: "Échoué", icon: <AlertTriangle className="w-3 h-3" /> }
    };
    
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getPaymentMethodIcon = (method: string) => {
    const icons = {
      mobile_money: <Smartphone className="w-4 h-4" />,
      card: <CreditCard className="w-4 h-4" />,
      bank_transfer: <Building className="w-4 h-4" />
    };
    return icons[method] || <CreditCard className="w-4 h-4" />;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      mobile_money: "Mobile Money",
      card: "Carte bancaire",
      bank_transfer: "Virement bancaire"
    };
    return labels[method] || method;
  };

  // Statistiques
  const stats = {
    totalInvoices: invoices.length,
    pendingPayments: invoices.filter(i => i.status === 'pending').length,
    totalPaid: transactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0),
    overduePayments: invoices.filter(i => i.status === 'overdue').length
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
          <h2 className="text-2xl font-bold">Mes Paiements & Factures</h2>
          <p className="text-muted-foreground">
            Interface client - Visualisation claire et paiements sécurisés
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Télécharger Historique
          </Button>
          <Button variant="outline">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Alertes */}
      {stats.overduePayments > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous avez {stats.overduePayments} facture(s) en retard. Réglez-les rapidement pour éviter les frais.
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Factures</p>
                <p className="font-bold">{stats.totalInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">En Attente</p>
                <p className="font-bold">{stats.pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Payé</p>
                <p className="font-bold">{formatAmount(stats.totalPaid, 'GNF')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Protection</p>
                <p className="font-bold">100%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="transactions">Historique</TabsTrigger>
          <TabsTrigger value="payment-methods">Moyens de Paiement</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mes Factures</CardTitle>
              <CardDescription>
                Visualisation claire de toutes vos factures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">#{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.vendor_name}
                        </p>
                        {invoice.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Échéance: {new Date(invoice.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold">{formatAmount(invoice.amount, invoice.currency)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {invoice.status === 'pending' && (
                        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm"
                              onClick={() => setSelectedInvoice(invoice)}
                            >
                              Payer
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Paiement Sécurisé</DialogTitle>
                              <DialogDescription>
                                Votre paiement sera retenu en sécurité jusqu'à confirmation de réception
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="p-4 bg-muted rounded-lg">
                                <div className="flex justify-between mb-2">
                                  <span>Facture:</span>
                                  <span className="font-medium">#{selectedInvoice?.invoice_number}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                  <span>Vendeur:</span>
                                  <span>{selectedInvoice?.vendor_name}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                  <span>Montant:</span>
                                  <span>{selectedInvoice && formatAmount(selectedInvoice.amount, selectedInvoice.currency)}</span>
                                </div>
                              </div>

                              <div>
                                <Label>Moyen de paiement</Label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="mobile_money">
                                      <div className="flex items-center gap-2">
                                        <Smartphone className="w-4 h-4" />
                                        Mobile Money (Orange, Moov, MTN)
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="card">
                                      <div className="flex items-center gap-2">
                                        <CreditCard className="w-4 h-4" />
                                        Carte bancaire (Visa, Mastercard)
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="bank_transfer">
                                      <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        Virement bancaire local
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <Alert>
                                <Shield className="h-4 w-4" />
                                <AlertDescription>
                                  <strong>Protection garantie:</strong> Votre paiement sera retenu jusqu'à confirmation de réception des produits. 
                                  Vous pouvez signaler un problème à tout moment.
                                </AlertDescription>
                              </Alert>
                            </div>

                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                                Annuler
                              </Button>
                              <Button onClick={() => selectedInvoice && handlePayment(selectedInvoice)}>
                                <Shield className="w-4 h-4 mr-2" />
                                Payer en Sécurité
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowDisputeDialog(true);
                        }}
                      >
                        Signaler
                      </Button>
                    </div>
                  </div>
                ))}
                
                {invoices.length === 0 && (
                  <div className="text-center p-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune facture</h3>
                    <p className="text-muted-foreground">
                      Vos factures apparaîtront ici après vos achats.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Transactions</CardTitle>
              <CardDescription>
                Toutes vos transactions avec notifications en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'payment' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {transaction.type === 'payment' ? 
                          <CreditCard className="w-4 h-4 text-green-600" /> :
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">
                          {transaction.type === 'payment' ? 'Paiement' : 'Remboursement'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.vendor_name}
                        </p>
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'refund' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'refund' ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {transactions.length === 0 && (
                  <div className="text-center p-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune transaction</h3>
                    <p className="text-muted-foreground">
                      Votre historique de transactions apparaîtra ici.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Mobile Money
                </CardTitle>
                <CardDescription>
                  Orange Money, Moov Money, MTN
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Disponibilité</span>
                    <Badge variant="default">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Frais</span>
                    <span className="text-sm">1.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Délai</span>
                    <span className="text-sm">Instantané</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Carte Bancaire
                </CardTitle>
                <CardDescription>
                  Visa, Mastercard via Stripe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Disponibilité</span>
                    <Badge variant="default">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Frais</span>
                    <span className="text-sm">2.9%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Délai</span>
                    <span className="text-sm">Instantané</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Virement Bancaire
                </CardTitle>
                <CardDescription>
                  Banques locales guinéennes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Disponibilité</span>
                    <Badge variant="default">Actif</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Frais</span>
                    <span className="text-sm">0.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Délai</span>
                    <span className="text-sm">1-2 jours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog pour signaler un problème */}
      <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler un Problème</DialogTitle>
            <DialogDescription>
              Décrivez le problème pour ouvrir un ticket de résolution
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedInvoice && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">Facture: #{selectedInvoice.invoice_number}</p>
                <p className="text-sm text-muted-foreground">
                  Vendeur: {selectedInvoice.vendor_name}
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="dispute_reason">Description du problème</Label>
              <Input
                id="dispute_reason"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="Décrivez le problème rencontré..."
              />
            </div>

            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                Un ticket sera ouvert et notre équipe examinera votre cas dans les 24h.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleDispute}>
              Envoyer le Signalement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientPaymentModule;