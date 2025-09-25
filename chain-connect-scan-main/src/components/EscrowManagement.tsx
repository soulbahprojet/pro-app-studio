import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  User,
  Package,
  RefreshCw
} from 'lucide-react';

interface EscrowTransaction {
  id: string;
  order_id: string;
  customer_id: string;
  seller_id: string;
  total_amount: number;
  seller_amount: number;
  commission_amount: number;
  commission_rate: number;
  currency: string;
  status: 'pending' | 'delivered' | 'released' | 'disputed' | 'refunded';
  delivery_confirmed_at?: string;
  released_at?: string;
  disputed_at?: string;
  resolution?: string;
  created_at: string;
}

const EscrowManagement: React.FC = () => {
  const { toast } = useToast();
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowTransaction | null>(null);
  const [disputeResolution, setDisputeResolution] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadEscrowData();
  }, []);

  const loadEscrowData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('wallet');
      
      if (error) throw error;
      
      // Vérification robuste des données d'escrow
      if (data && Array.isArray(data.escrow_transactions)) {
        setEscrowTransactions(data.escrow_transactions);
      } else {
        setEscrowTransactions([]);
      }
    } catch (error) {
      console.error('Error loading escrow data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'escrow",
        variant: "destructive"
      });
      // Définir une valeur par défaut en cas d'erreur
      setEscrowTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    try {
      setProcessing(true);
      const { error } = await supabase.functions.invoke('wallet', {
        body: {
          action: 'confirm_delivery',
          order_id: orderId
        }
      });

      if (error) throw error;

      toast({
        title: "Livraison confirmée",
        description: "Les fonds ont été libérés au marchand",
      });

      loadEscrowData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la confirmation",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDispute = async (escrowId: string, action: 'refund' | 'release') => {
    try {
      setProcessing(true);
      const { error } = await supabase.functions.invoke('wallet', {
        body: {
          action: 'handle_dispute',
          escrow_id: escrowId,
          dispute_action: action,
          resolution: disputeResolution
        }
      });

      if (error) throw error;

      toast({
        title: "Litige résolu",
        description: `${action === 'refund' ? 'Remboursement' : 'Libération'} effectué(e)`,
      });

      setSelectedEscrow(null);
      setDisputeResolution('');
      loadEscrowData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du traitement",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: React.ReactNode }> = {
      pending: { variant: "secondary", label: "En attente", icon: <Clock className="w-3 h-3" /> },
      delivered: { variant: "default", label: "Livré", icon: <Package className="w-3 h-3" /> },
      released: { variant: "default", label: "Libéré", icon: <CheckCircle className="w-3 h-3" /> },
      disputed: { variant: "destructive", label: "Litige", icon: <AlertTriangle className="w-3 h-3" /> },
      refunded: { variant: "outline", label: "Remboursé", icon: <RefreshCw className="w-3 h-3" /> }
    };
    
    const statusInfo = variants[status] || { variant: "outline", label: status, icon: null };
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbols = { GNF: 'GNF', USD: '$', EUR: '€', XOF: 'XOF', CNY: '¥' };
    return `${amount.toLocaleString()} ${symbols[currency as keyof typeof symbols] || currency}`;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion Escrow</h2>
          <p className="text-muted-foreground">
            Gérez les paiements sécurisés et les litiges
          </p>
        </div>
        <Button variant="outline" onClick={loadEscrowData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Actifs</TabsTrigger>
          <TabsTrigger value="completed">Terminés</TabsTrigger>
          <TabsTrigger value="disputed">Litiges</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-4">
            {Array.isArray(escrowTransactions) && escrowTransactions.length > 0 ? (
              escrowTransactions
                .filter(t => t && ['pending', 'delivered'].includes(t.status))
                .map((escrow) => (
                <Card key={escrow.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Escrow #{escrow.id.slice(-8)}
                      </CardTitle>
                      {getStatusBadge(escrow.status)}
                    </div>
                    <CardDescription>
                      Commande: {escrow.order_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Montant Total</p>
                        <p className="font-semibold">{formatAmount(escrow.total_amount, escrow.currency)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pour le Marchand</p>
                        <p className="font-semibold text-green-600">
                          {formatAmount(escrow.seller_amount, escrow.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Commission</p>
                        <p className="font-semibold text-blue-600">
                          {formatAmount(escrow.commission_amount, escrow.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Taux Commission</p>
                        <p className="font-semibold">{(escrow.commission_rate * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {escrow.status === 'delivered' && (
                        <Button 
                          onClick={() => handleConfirmDelivery(escrow.order_id)}
                          disabled={processing}
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Libérer les Fonds
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline"
                            onClick={() => setSelectedEscrow(escrow)}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Gérer Litige
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Gérer le Litige</DialogTitle>
                            <DialogDescription>
                              Choisissez l'action à effectuer pour résoudre ce litige
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="resolution">Résolution / Notes</Label>
                              <Textarea
                                id="resolution"
                                placeholder="Décrivez la résolution du litige..."
                                value={disputeResolution}
                                onChange={(e) => setDisputeResolution(e.target.value)}
                              />
                            </div>

                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Cette action est irréversible. Assurez-vous d'avoir bien analysé la situation.
                              </AlertDescription>
                            </Alert>
                          </div>

                          <DialogFooter>
                            <Button 
                              variant="outline"
                              onClick={() => selectedEscrow && handleDispute(selectedEscrow.id, 'refund')}
                              disabled={processing}
                            >
                              Rembourser le Client
                            </Button>
                            <Button 
                              onClick={() => selectedEscrow && handleDispute(selectedEscrow.id, 'release')}
                              disabled={processing}
                            >
                              Libérer au Marchand
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
                ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>Aucune transaction d'escrow active</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-4">
            {escrowTransactions
              .filter(t => t.status === 'released')
              .map((escrow) => (
                <Card key={escrow.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-semibold">Escrow #{escrow.id.slice(-8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Libéré le {new Date(escrow.released_at!).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatAmount(escrow.total_amount, escrow.currency)}</p>
                        <p className="text-sm text-green-600">
                          Marchand: {formatAmount(escrow.seller_amount, escrow.currency)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="disputed">
          <div className="space-y-4">
            {escrowTransactions
              .filter(t => ['disputed', 'refunded'].includes(t.status))
              .map((escrow) => (
                <Card key={escrow.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="font-semibold">Escrow #{escrow.id.slice(-8)}</p>
                          {escrow.resolution && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Résolution: {escrow.resolution}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(escrow.status)}
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatAmount(escrow.total_amount, escrow.currency)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EscrowManagement;