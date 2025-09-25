import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  Package,
  RefreshCw,
  Eye,
  FileText,
  TrendingUp,
  Activity
} from 'lucide-react';

interface PaymentEscrow {
  id: string;
  draft_order_id: string;
  stripe_payment_intent_id: string;
  total_amount: number;
  seller_amount: number;
  commission_amount: number;
  commission_rate: number;
  currency: string;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  held_since: string;
  release_date?: string;
  auto_release_at?: string;
  auto_release_after_days: number;
  resolution?: string;
  created_at: string;
  draft_orders: {
    id: string;
    pi_number: string;
    seller_id: string;
    buyer_id?: string;
    buyer_email: string;
    total_amount: number;
    currency: string;
    status: string;
  };
}

interface PaymentEvent {
  id: string;
  event_type: string;
  title: string;
  message: string;
  severity: string;
  created_at: string;
  read_at?: string;
}

const PaymentEscrowDashboard: React.FC = () => {
  const { toast } = useToast();
  const [escrows, setEscrows] = useState<PaymentEscrow[]>([]);
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscrow, setSelectedEscrow] = useState<PaymentEscrow | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadEscrowData();
  }, []);

  const loadEscrowData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('payment-escrow', {
        body: { action: 'get_escrows' }
      });

      if (error) throw error;

      if (data && data.success) {
        setEscrows(Array.isArray(data.escrows) ? data.escrows : []);
      } else {
        setEscrows([]);
      }

      // Charger les événements de paiement avec vérification
      const { data: eventsData, error: eventsError } = await supabase
        .from('payment_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!eventsError && Array.isArray(eventsData)) {
        setEvents(eventsData);
      } else {
        setEvents([]);
      }

    } catch (error: any) {
      console.error('Error loading escrow data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'escrow",
        variant: "destructive"
      });
      // Définir des valeurs par défaut en cas d'erreur
      setEscrows([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    try {
      setProcessing(escrowId);

      const { data, error } = await supabase.functions.invoke('payment-escrow', {
        body: {
          action: 'release_escrow',
          escrow_id: escrowId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Fonds libérés",
          description: "Les fonds ont été libérés au marchand avec succès",
        });

        loadEscrowData();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de libérer les fonds",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleRefundEscrow = async (escrowId: string, reason: string) => {
    try {
      setProcessing(escrowId);

      const { data, error } = await supabase.functions.invoke('payment-escrow', {
        body: {
          action: 'refund_escrow',
          escrow_id: escrowId,
          reason
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Remboursement effectué",
          description: "Le remboursement a été traité avec succès",
        });

        setSelectedEscrow(null);
        setDisputeReason('');
        loadEscrowData();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'effectuer le remboursement",
        variant: "destructive"
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: React.ReactNode; color: string }> = {
      held: { variant: "secondary", label: "En séquestre", icon: <Shield className="w-3 h-3" />, color: "text-blue-600" },
      released: { variant: "default", label: "Libéré", icon: <CheckCircle className="w-3 h-3" />, color: "text-green-600" },
      refunded: { variant: "outline", label: "Remboursé", icon: <RefreshCw className="w-3 h-3" />, color: "text-gray-600" },
      disputed: { variant: "destructive", label: "Litige", icon: <AlertTriangle className="w-3 h-3" />, color: "text-red-600" }
    };
    
    const statusInfo = variants[status] || variants.held;
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const getEventIcon = (eventType: string, severity: string) => {
    const icons: Record<string, React.ReactNode> = {
      pi_created: <FileText className="w-4 h-4" />,
      payment_link_generated: <FileText className="w-4 h-4" />,
      payment_received: <DollarSign className="w-4 h-4" />,
      escrow_created: <Shield className="w-4 h-4" />,
      escrow_released: <CheckCircle className="w-4 h-4" />,
      escrow_refunded: <RefreshCw className="w-4 h-4" />,
      dispute_opened: <AlertTriangle className="w-4 h-4" />,
      dispute_resolved: <CheckCircle className="w-4 h-4" />
    };

    return icons[eventType] || <Activity className="w-4 h-4" />;
  };

  const getEventColor = (severity: string) => {
    const colors = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600'
    };
    return colors[severity as keyof typeof colors] || 'text-gray-600';
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbols = { GNF: 'GNF', USD: '$', EUR: '€', XOF: 'XOF', CNY: '¥' };
    return `${amount.toLocaleString()} ${symbols[currency as keyof typeof symbols] || currency}`;
  };

  const getDaysUntilAutoRelease = (autoReleaseAt: string) => {
    const now = new Date();
    const releaseDate = new Date(autoReleaseAt);
    const diffTime = releaseDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getAutoReleaseProgress = (heldSince: string, autoReleaseAfterDays: number) => {
    const now = new Date();
    const heldDate = new Date(heldSince);
    const totalMs = autoReleaseAfterDays * 24 * 60 * 60 * 1000;
    const elapsedMs = now.getTime() - heldDate.getTime();
    return Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
  };

  const stats = {
    totalEscrows: Array.isArray(escrows) ? escrows.length : 0,
    activeEscrows: Array.isArray(escrows) ? escrows.filter(e => e && e.status === 'held').length : 0,
    totalAmount: Array.isArray(escrows) ? escrows.reduce((sum, e) => sum + (e?.total_amount || 0), 0) : 0,
    totalCommissions: Array.isArray(escrows) ? escrows.reduce((sum, e) => sum + (e?.commission_amount || 0), 0) : 0,
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
          <h2 className="text-2xl font-bold">Gestion des Paiements & Escrow</h2>
          <p className="text-muted-foreground">
            Suivez les paiements sécurisés et gérez les litiges
          </p>
        </div>
        <Button variant="outline" onClick={loadEscrowData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Escrows</p>
                <p className="font-bold">{stats.totalEscrows}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="font-bold">{stats.activeEscrows}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Volume Total</p>
                <p className="font-bold">{formatAmount(stats.totalAmount, 'GNF')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Commissions</p>
                <p className="font-bold">{formatAmount(stats.totalCommissions, 'GNF')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="escrows" className="space-y-6">
        <TabsList>
          <TabsTrigger value="escrows">Escrows Actifs</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
        </TabsList>

        <TabsContent value="escrows">
          <div className="space-y-4">
            {Array.isArray(escrows) && escrows.length > 0 ? (
              escrows
                .filter(e => e && e.status === 'held')
                .map((escrow) => (
                <Card key={escrow.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Escrow #{escrow.id.slice(-8)}
                        </CardTitle>
                        <CardDescription>
                          PI: {escrow.draft_orders.pi_number} • Client: {escrow.draft_orders.buyer_email}
                        </CardDescription>
                      </div>
                      {getStatusBadge(escrow.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <p className="text-sm text-muted-foreground">Commission ({(escrow.commission_rate * 100).toFixed(1)}%)</p>
                        <p className="font-semibold text-blue-600">
                          {formatAmount(escrow.commission_amount, escrow.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">En séquestre depuis</p>
                        <p className="font-semibold">
                          {new Date(escrow.held_since).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    {escrow.auto_release_at && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            Libération automatique dans {getDaysUntilAutoRelease(escrow.auto_release_at)} jours
                          </span>
                          <span className="text-sm font-medium">
                            {getAutoReleaseProgress(escrow.held_since, escrow.auto_release_after_days).toFixed(0)}%
                          </span>
                        </div>
                        <Progress 
                          value={getAutoReleaseProgress(escrow.held_since, escrow.auto_release_after_days)} 
                          className="h-2"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleReleaseEscrow(escrow.id)}
                        disabled={processing === escrow.id}
                      >
                        {processing === escrow.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Libération...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Libérer les Fonds
                          </>
                        )}
                      </Button>
                      
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
                            <DialogTitle>Gérer le Litige - Escrow #{escrow.id.slice(-8)}</DialogTitle>
                            <DialogDescription>
                              PI: {escrow.draft_orders.pi_number} • {formatAmount(escrow.total_amount, escrow.currency)}
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="reason">Raison du litige / Résolution</Label>
                              <Textarea
                                id="reason"
                                placeholder="Décrivez la raison du litige et la résolution..."
                                value={disputeReason}
                                onChange={(e) => setDisputeReason(e.target.value)}
                                rows={4}
                              />
                            </div>

                            <Alert>
                              <AlertTriangle className="h-4 w-4" />
                              <AlertDescription>
                                Cette action est irréversible. Assurez-vous d'avoir bien analysé la situation avant de procéder.
                              </AlertDescription>
                            </Alert>
                          </div>

                          <DialogFooter>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                if (!disputeReason.trim()) {
                                  toast({
                                    title: "Raison requise",
                                    description: "Veuillez saisir une raison pour le remboursement",
                                    variant: "destructive"
                                  });
                                  return;
                                }
                                handleRefundEscrow(escrow.id, disputeReason);
                              }}
                              disabled={processing === escrow.id}
                            >
                              Rembourser le Client
                            </Button>
                            <Button 
                              onClick={() => handleReleaseEscrow(escrow.id)}
                              disabled={processing === escrow.id}
                            >
                              Libérer au Marchand
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun escrow actif</p>
                <p className="text-sm">Les nouveaux paiements apparaîtront ici</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {Array.isArray(escrows) && escrows.length > 0 ? (
              escrows
                .filter(e => e && ['released', 'refunded', 'disputed'].includes(e.status))
                .map((escrow) => (
                <Card key={escrow.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${escrow.status === 'released' ? 'bg-green-100' : escrow.status === 'refunded' ? 'bg-gray-100' : 'bg-red-100'}`}>
                          {escrow.status === 'released' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : escrow.status === 'refunded' ? (
                            <RefreshCw className="w-6 h-6 text-gray-600" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">
                            Escrow #{escrow.id.slice(-8)} • PI: {escrow.draft_orders.pi_number}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {escrow.status === 'released' && escrow.release_date
                              ? `Libéré le ${new Date(escrow.release_date).toLocaleDateString('fr-FR')}`
                              : `Traité le ${new Date(escrow.created_at).toLocaleDateString('fr-FR')}`}
                          </p>
                          {escrow.resolution && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>Résolution:</strong> {escrow.resolution}
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
                ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun historique d'escrow</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="events">
          <div className="space-y-4">
            {Array.isArray(events) && events.length > 0 ? (
              events.map((event) => (
              <Card key={event.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full bg-gray-100 ${getEventColor(event.severity)}`}>
                      {getEventIcon(event.event_type, event.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {event.event_type}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{event.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun événement</h3>
                  <p className="text-muted-foreground">
                    Les événements de paiement apparaîtront ici
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentEscrowDashboard;