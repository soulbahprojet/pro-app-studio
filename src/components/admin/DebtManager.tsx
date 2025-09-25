import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CreditCard, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Edit,
  History,
  Send,
  DollarSign
} from 'lucide-react';

interface Debt {
  id: string;
  debtor_id: string;
  creditor_id: string;
  amount: number;
  currency: string;
  description: string;
  status: 'unpaid' | 'partially_paid' | 'paid';
  due_date: string;
  created_at: string;
  updated_at: string;
  debtor_name?: string;
  creditor_name?: string;
}

interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_date: string;
  notes: string;
  recorded_by: string;
}

export default function DebtManager() {
  const [debts, setDebts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [showPayments, setShowPayments] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);

  const [newDebt, setNewDebt] = useState({
    debtor_id: '',
    creditor_id: '',
    amount: '',
    currency: 'GNF',
    description: '',
    due_date: ''
  });

  const [newPayment, setNewPayment] = useState({
    amount: '',
    currency: 'GNF',
    payment_method: '',
    notes: ''
  });

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_debts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDebts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des dettes:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des dettes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (debtId: string) => {
    try {
      const { data, error } = await supabase
        .from('debt_payments')
        .select('*')
        .eq('debt_id', debtId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des paiements",
        variant: "destructive"
      });
    }
  };

  const addDebt = async () => {
    try {
      const { error } = await supabase
        .from('user_debts')
        .insert({
          debtor_id: newDebt.debtor_id,
          creditor_id: newDebt.creditor_id,
          amount: parseFloat(newDebt.amount),
          currency: newDebt.currency as any,
          description: newDebt.description,
          due_date: newDebt.due_date || null
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Dette ajoutée avec succès"
      });
      setShowAddDebt(false);
      setNewDebt({
        debtor_id: '',
        creditor_id: '',
        amount: '',
        currency: 'GNF',
        description: '',
        due_date: ''
      });
      fetchDebts();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la dette:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout de la dette",
        variant: "destructive"
      });
    }
  };

  const updateDebtStatus = async (debtId: string, status: 'unpaid' | 'partially_paid' | 'paid') => {
    try {
      const { error } = await supabase
        .from('user_debts')
        .update({ status })
        .eq('id', debtId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès"
      });
      fetchDebts();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du statut",
        variant: "destructive"
      });
    }
  };

  const addPayment = async () => {
    if (!selectedDebt) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('debt_payments')
        .insert({
          debt_id: selectedDebt.id,
          amount: parseFloat(newPayment.amount),
          currency: newPayment.currency as any,
          payment_method: newPayment.payment_method,
          notes: newPayment.notes,
          recorded_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Paiement enregistré avec succès"
      });
      setShowAddPayment(false);
      setNewPayment({
        amount: '',
        currency: 'GNF',
        payment_method: '',
        notes: ''
      });
      fetchPayments(selectedDebt.id);
      fetchDebts();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'enregistrement du paiement",
        variant: "destructive"
      });
    }
  };

  const sendReminder = async (debtId: string) => {
    try {
      const { error } = await supabase
        .from('debt_reminders')
        .insert({
          debt_id: debtId,
          reminder_type: 'notification'
        });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Rappel envoyé avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du rappel:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'envoi du rappel",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="secondary" className="bg-success/10 text-success border-success/20"><CheckCircle className="w-3 h-3 mr-1" />Payé</Badge>;
      case 'partially_paid':
        return <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20"><Clock className="w-3 h-3 mr-1" />Partiellement payé</Badge>;
      default:
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Non payé</Badge>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement des dettes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des Dettes</h3>
        <Dialog open={showAddDebt} onOpenChange={setShowAddDebt}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une dette
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle dette</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Débiteur ID</label>
                <Input
                  value={newDebt.debtor_id}
                  onChange={(e) => setNewDebt({...newDebt, debtor_id: e.target.value})}
                  placeholder="ID de l'utilisateur débiteur"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Créancier ID</label>
                <Input
                  value={newDebt.creditor_id}
                  onChange={(e) => setNewDebt({...newDebt, creditor_id: e.target.value})}
                  placeholder="ID du créancier"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Montant</label>
                <Input
                  type="number"
                  value={newDebt.amount}
                  onChange={(e) => setNewDebt({...newDebt, amount: e.target.value})}
                  placeholder="Montant de la dette"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Devise</label>
                <Select value={newDebt.currency} onValueChange={(value) => setNewDebt({...newDebt, currency: value})}>
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
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newDebt.description}
                  onChange={(e) => setNewDebt({...newDebt, description: e.target.value})}
                  placeholder="Description de la dette"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date d'échéance</label>
                <Input
                  type="date"
                  value={newDebt.due_date}
                  onChange={(e) => setNewDebt({...newDebt, due_date: e.target.value})}
                />
              </div>
              <Button onClick={addDebt} className="w-full">
                Ajouter la dette
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Dettes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Débiteur ID</TableHead>
                <TableHead>Créancier ID</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'échéance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map((debt) => (
                <TableRow key={debt.id}>
                  <TableCell>{debt.debtor_id}</TableCell>
                  <TableCell>{debt.creditor_id}</TableCell>
                  <TableCell>{debt.amount?.toLocaleString()} {debt.currency}</TableCell>
                  <TableCell>{debt.description}</TableCell>
                  <TableCell>{getStatusBadge(debt.status)}</TableCell>
                  <TableCell>{debt.due_date ? new Date(debt.due_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Select onValueChange={(value) => updateDebtStatus(debt.id, value as any)}>
                        <SelectTrigger className="w-[140px]">
                          <Edit className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unpaid">Non payé</SelectItem>
                          <SelectItem value="partially_paid">Partiellement payé</SelectItem>
                          <SelectItem value="paid">Payé</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDebt(debt);
                          fetchPayments(debt.id);
                          setShowPayments(true);
                        }}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendReminder(debt.id)}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog pour l'historique des paiements */}
      <Dialog open={showPayments} onOpenChange={setShowPayments}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Historique des paiements - {selectedDebt?.description}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Dette totale: {selectedDebt?.amount?.toLocaleString()} {selectedDebt?.currency}
              </p>
              <Button onClick={() => setShowAddPayment(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un paiement
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>{payment.amount?.toLocaleString()} {payment.currency}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell>{payment.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog pour ajouter un paiement */}
      <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Montant</label>
              <Input
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                placeholder="Montant du paiement"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Devise</label>
              <Select value={newPayment.currency} onValueChange={(value) => setNewPayment({...newPayment, currency: value})}>
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
              <label className="text-sm font-medium">Méthode de paiement</label>
              <Input
                value={newPayment.payment_method}
                onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}
                placeholder="Ex: Espèces, Virement, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newPayment.notes}
                onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                placeholder="Notes sur le paiement"
              />
            </div>
            <Button onClick={addPayment} className="w-full">
              <DollarSign className="w-4 h-4 mr-2" />
              Enregistrer le paiement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
