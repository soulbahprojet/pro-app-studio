import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Plus,
  Send,
  Wallet,
  Calendar,
  MessageSquare,
  BarChart3
} from 'lucide-react';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'partial' | 'completed' | 'overdue';
  order_id: string;
  customer_id: string;
  payment_schedule?: Array<{
    amount: number;
    due_date: string;
    status: 'pending' | 'paid';
  }>;
  created_at: string;
  due_date?: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  due_date?: string;
}

interface VendorPaymentModuleProps {
  vendorId: string;
}

const VendorPaymentModule: React.FC<VendorPaymentModuleProps> = ({ vendorId }) => {
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  // Formulaire de saisie paiement
  const [paymentForm, setPaymentForm] = useState({
    customer_email: '',
    amount: '',
    currency: 'GNF',
    payment_type: 'full', // full, partial
    partial_percentage: 70,
    description: '',
    due_date: ''
  });

  // Formulaire de facture
  const [invoiceForm, setInvoiceForm] = useState({
    customer_name: '',
    customer_email: '',
    items: [{ description: '', quantity: 1, unit_price: 0 }],
    currency: 'GNF',
    payment_terms: 'Paiement immédiat',
    notes: ''
  });

  useEffect(() => {
    loadPaymentData();
  }, [vendorId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Charger les paiements depuis les transactions existantes
      const { data: paymentsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', vendorId)
        .eq('type', 'payment')
        .order('created_at', { ascending: false });

      // Charger les factures depuis les commandes existantes
      const { data: invoicesData } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', vendorId)
        .order('created_at', { ascending: false });

      // Adapter les données
      const adaptedPayments = (paymentsData || []).map(t => ({
        id: t.id,
        amount: Math.abs(t.amount),
        currency: t.currency,
        status: (t.status === 'completed' ? 'completed' : 'pending') as 'pending' | 'partial' | 'completed' | 'overdue',
        order_id: t.reference_id || '',
        customer_id: t.wallet_id,
        created_at: t.created_at
      }));

      const adaptedInvoices = (invoicesData || []).map(o => ({
        id: o.id,
        invoice_number: o.readable_id || `INV-${o.id.slice(-8)}`,
        customer_name: 'Client',
        customer_email: 'client@example.com',
        amount: o.total_amount,
        currency: o.currency,
        status: (o.status === 'delivered' ? 'paid' : 'draft') as 'draft' | 'sent' | 'paid' | 'overdue',
        created_at: o.created_at
      }));

      setPayments(adaptedPayments);
      setInvoices(adaptedInvoices);
      
    } catch (error) {
      console.error('Erreur de chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de paiement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    try {
      const amount = parseFloat(paymentForm.amount);
      if (!amount || amount <= 0) {
        toast({
          title: "Montant invalide",
          description: "Veuillez saisir un montant valide",
          variant: "destructive"
        });
        return;
      }

      // Créer le paiement
      const paymentData = {
        vendor_id: vendorId,
        customer_email: paymentForm.customer_email,
        amount: amount,
        currency: paymentForm.currency,
        status: 'pending',
        description: paymentForm.description,
        due_date: paymentForm.due_date || null
      };

      // Créer une transaction pour représenter le paiement
      const { error } = await supabase
        .from('transactions')
        .insert({
          wallet_id: vendorId,
          type: 'payment' as const,
          amount: amount,
          currency: paymentForm.currency as 'GNF' | 'USD' | 'EUR' | 'XOF' | 'CNY',
          status: 'completed',
          description: paymentForm.description || 'Paiement reçu',
          reference_id: `PAY-${Date.now()}`
        });

      if (error) throw error;

      toast({
        title: "Paiement enregistré",
        description: "Le paiement a été ajouté avec succès",
      });

      setShowPaymentDialog(false);
      setPaymentForm({
        customer_email: '',
        amount: '',
        currency: 'GNF',
        payment_type: 'full',
        partial_percentage: 70,
        description: '',
        due_date: ''
      });
      
      loadPaymentData();

    } catch (error) {
      console.error('Erreur ajout paiement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le paiement",
        variant: "destructive"
      });
    }
  };

  const handleGenerateInvoice = async () => {
    try {
      const subtotal = invoiceForm.items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price), 0
      );

      const invoiceData = {
        vendor_id: vendorId,
        customer_name: invoiceForm.customer_name,
        customer_email: invoiceForm.customer_email,
        items: invoiceForm.items,
        amount: subtotal,
        currency: invoiceForm.currency,
        payment_terms: invoiceForm.payment_terms,
        notes: invoiceForm.notes,
        status: 'draft'
      };

      // Créer une commande pour représenter la facture
      const { error } = await supabase
        .from('orders')
        .insert({
          seller_id: vendorId,
          customer_id: vendorId, // Placeholder
          total_amount: subtotal,
          currency: invoiceForm.currency as 'GNF' | 'USD' | 'EUR' | 'XOF' | 'CNY',
          status: 'pending',
          readable_id: `INV-${Date.now()}`,
          notes: invoiceForm.notes
        });

      if (error) throw error;

      toast({
        title: "Facture générée",
        description: "La facture a été créée avec succès",
      });

      setShowInvoiceDialog(false);
      setInvoiceForm({
        customer_name: '',
        customer_email: '',
        items: [{ description: '', quantity: 1, unit_price: 0 }],
        currency: 'GNF',
        payment_terms: 'Paiement immédiat',
        notes: ''
      });
      
      loadPaymentData();

    } catch (error) {
      console.error('Erreur génération facture:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la facture",
        variant: "destructive"
      });
    }
  };

  const addInvoiceItem = () => {
    setInvoiceForm({
      ...invoiceForm,
      items: [...invoiceForm.items, { description: '', quantity: 1, unit_price: 0 }]
    });
  };

  const removeInvoiceItem = (index: number) => {
    const newItems = invoiceForm.items.filter((_, i) => i !== index);
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    const newItems = [...invoiceForm.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceForm({ ...invoiceForm, items: newItems });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: "secondary", label: "En attente", icon: <Clock className="w-3 h-3" /> },
      partial: { variant: "outline", label: "Partiel", icon: <Clock className="w-3 h-3" /> },
      completed: { variant: "default", label: "Payé", icon: <CheckCircle className="w-3 h-3" /> },
      overdue: { variant: "destructive", label: "En retard", icon: <AlertTriangle className="w-3 h-3" /> },
      draft: { variant: "outline", label: "Brouillon", icon: <FileText className="w-3 h-3" /> },
      sent: { variant: "secondary", label: "Envoyée", icon: <Send className="w-3 h-3" /> },
      paid: { variant: "default", label: "Payée", icon: <CheckCircle className="w-3 h-3" /> }
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

  // Statistiques
  const stats = {
    totalPayments: payments.length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    overduePayments: payments.filter(p => p.status === 'overdue').length,
    totalRevenue: payments.reduce((sum, p) => p.status === 'completed' ? sum + p.amount : sum, 0)
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
          <h2 className="text-2xl font-bold">Gestion Paiements & Factures</h2>
          <p className="text-muted-foreground">
            Interface vendeur - Suivi professionnel des paiements
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Saisir Paiement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Saisir un Paiement Reçu</DialogTitle>
                <DialogDescription>
                  Enregistrez un paiement client avec validation automatique
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer_email">Email du client</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    value={paymentForm.customer_email}
                    onChange={(e) => setPaymentForm({...paymentForm, customer_email: e.target.value})}
                    placeholder="client@example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="amount">Montant</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <Select value={paymentForm.currency} onValueChange={(value) => setPaymentForm({...paymentForm, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GNF">GNF</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Type de paiement</Label>
                  <Select value={paymentForm.payment_type} onValueChange={(value) => setPaymentForm({...paymentForm, payment_type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Paiement complet</SelectItem>
                      <SelectItem value="partial">Paiement échelonné</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentForm.payment_type === 'partial' && (
                  <div>
                    <Label htmlFor="partial_percentage">Premier versement (%)</Label>
                    <Input
                      id="partial_percentage"
                      type="number"
                      min="10"
                      max="90"
                      value={paymentForm.partial_percentage}
                      onChange={(e) => setPaymentForm({...paymentForm, partial_percentage: parseInt(e.target.value)})}
                    />
                    <p className="text-sm text-muted-foreground">
                      Premier versement: {formatAmount((parseFloat(paymentForm.amount) || 0) * paymentForm.partial_percentage / 100, paymentForm.currency)}
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                    placeholder="Description du paiement..."
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddPayment}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Générer Facture
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Générer une Facture</DialogTitle>
                <DialogDescription>
                  Création automatique avec tous les détails
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Nom du client</Label>
                    <Input
                      id="customer_name"
                      value={invoiceForm.customer_name}
                      onChange={(e) => setInvoiceForm({...invoiceForm, customer_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_email_invoice">Email</Label>
                    <Input
                      id="customer_email_invoice"
                      type="email"
                      value={invoiceForm.customer_email}
                      onChange={(e) => setInvoiceForm({...invoiceForm, customer_email: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Articles</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  
                  {invoiceForm.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-6 gap-2 mb-2">
                      <div className="col-span-3">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Qté"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Prix"
                          value={item.unit_price}
                          onChange={(e) => updateInvoiceItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeInvoiceItem(index)}
                          disabled={invoiceForm.items.length === 1}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency_invoice">Devise</Label>
                    <Select value={invoiceForm.currency} onValueChange={(value) => setInvoiceForm({...invoiceForm, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GNF">GNF</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Total</Label>
                    <div className="text-lg font-bold p-2 bg-muted rounded">
                      {formatAmount(
                        invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
                        invoiceForm.currency
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="payment_terms">Conditions de paiement</Label>
                  <Textarea
                    id="payment_terms"
                    value={invoiceForm.payment_terms}
                    onChange={(e) => setInvoiceForm({...invoiceForm, payment_terms: e.target.value})}
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInvoiceDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleGenerateInvoice}>
                  Générer Facture
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={() => setShowMessageDialog(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Messagerie
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Revenus Total</p>
                <p className="font-bold">{formatAmount(stats.totalRevenue, 'GNF')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Paiements Total</p>
                <p className="font-bold">{stats.totalPayments}</p>
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
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">En Retard</p>
                <p className="font-bold">{stats.overduePayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertes */}
      {stats.overduePayments > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous avez {stats.overduePayments} paiement(s) en retard nécessitant votre attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Tableaux de données */}
      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suivi des Paiements</CardTitle>
              <CardDescription>
                Tableau clair pour suivre toutes les commandes et paiements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{payment.customer_id}</p>
                        <p className="text-sm text-muted-foreground">
                          Commande #{payment.order_id}
                        </p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatAmount(payment.amount, payment.currency)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {payments.length === 0 && (
                  <div className="text-center p-8">
                    <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun paiement</h3>
                    <p className="text-muted-foreground">
                      Les paiements apparaîtront ici une fois enregistrés.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Factures</CardTitle>
              <CardDescription>
                Génération automatique avec tous les détails de commande
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
                          {invoice.customer_name} - {invoice.customer_email}
                        </p>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatAmount(invoice.amount, invoice.currency)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {invoices.length === 0 && (
                  <div className="text-center p-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucune facture</h3>
                    <p className="text-muted-foreground">
                      Créez votre première facture pour commencer.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Outils d'Analyse des Ventes</CardTitle>
              <CardDescription>
                Optimisez vos offres avec des données précises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Performance du mois</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Taux de paiement</span>
                      <span className="font-medium">
                        {stats.totalPayments > 0 ? 
                          Math.round((payments.filter(p => p.status === 'completed').length / stats.totalPayments) * 100) 
                          : 0
                        }%
                      </span>
                    </div>
                    <Progress value={stats.totalPayments > 0 ? 
                      (payments.filter(p => p.status === 'completed').length / stats.totalPayments) * 100 
                      : 0
                    } />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Revenus par devise</h4>
                  <div className="space-y-1">
                    {['GNF', 'USD', 'EUR'].map(currency => {
                      const amount = payments
                        .filter(p => p.currency === currency && p.status === 'completed')
                        .reduce((sum, p) => sum + p.amount, 0);
                      return (
                        <div key={currency} className="flex justify-between text-sm">
                          <span>{currency}</span>
                          <span>{formatAmount(amount, currency)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorPaymentModule;