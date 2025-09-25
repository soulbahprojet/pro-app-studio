import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Plus, 
  Eye, 
  Send, 
  Link as LinkIcon, 
  Copy,
  Calendar,
  DollarSign,
  Package,
  Trash2,
  RefreshCw,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface DraftOrderItem {
  sku: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax?: number;
}

interface DraftOrder {
  id: string;
  pi_number: string;
  buyer_email: string;
  items: DraftOrderItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  status: 'draft' | 'awaiting_payment' | 'paid' | 'in_escrow' | 'released' | 'refunded' | 'dispute' | 'expired';
  payment_link_url?: string;
  expires_at?: string;
  paid_at?: string;
  notes?: string;
  payment_terms?: string;
  delivery_terms?: string;
  created_at: string;
  updated_at: string;
}

const ProformaInvoiceManager: React.FC = () => {
  const { toast } = useToast();
  const [draftOrders, setDraftOrders] = useState<DraftOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    buyer_email: '',
    currency: 'GNF',
    shipping_amount: 0,
    notes: '',
    payment_terms: 'Paiement à la commande, livraison après confirmation',
    delivery_terms: '',
    expires_in_days: 30
  });

  const [items, setItems] = useState<DraftOrderItem[]>([
    { sku: '', description: '', quantity: 1, unit_price: 0, tax: 0 }
  ]);

  useEffect(() => {
    loadDraftOrders();
  }, []);

  const loadDraftOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('proforma-invoice', {
        body: { action: 'get_draft_orders' }
      });

      if (error) throw error;

      if (data.success) {
        setDraftOrders(data.draft_orders);
      }
    } catch (error: any) {
      console.error('Error loading draft orders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les proforma invoices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDraftOrder = async () => {
    try {
      // Validation
      if (!formData.buyer_email || items.some(item => !item.description || item.quantity <= 0 || item.unit_price <= 0)) {
        toast({
          title: "Erreur de validation",
          description: "Veuillez remplir tous les champs requis",
          variant: "destructive"
        });
        return;
      }

      setProcessingId('creating');

      const { data, error } = await supabase.functions.invoke('proforma-invoice', {
        body: {
          action: 'create_draft_order',
          buyer_email: formData.buyer_email,
          items,
          currency: formData.currency,
          shipping_amount: formData.shipping_amount,
          notes: formData.notes,
          payment_terms: formData.payment_terms,
          delivery_terms: formData.delivery_terms,
          expires_in_days: formData.expires_in_days
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Proforma Invoice créée",
          description: `PI ${data.draft_order.pi_number} créée avec succès`,
        });

        setDraftOrders([data.draft_order, ...draftOrders]);
        setShowCreateDialog(false);
        
        // Reset form
        setFormData({
          buyer_email: '',
          currency: 'GNF',
          shipping_amount: 0,
          notes: '',
          payment_terms: 'Paiement à la commande, livraison après confirmation',
          delivery_terms: '',
          expires_in_days: 30
        });
        setItems([{ sku: '', description: '', quantity: 1, unit_price: 0, tax: 0 }]);
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la proforma invoice",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleGeneratePaymentLink = async (draftOrderId: string) => {
    try {
      setProcessingId(draftOrderId);

      const { data, error } = await supabase.functions.invoke('proforma-invoice', {
        body: {
          action: 'generate_payment_link',
          draft_order_id: draftOrderId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Payment Link généré",
          description: "Le lien de paiement a été créé avec succès",
        });

        // Recharger les données
        loadDraftOrders();
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de générer le payment link",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const copyPaymentLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié",
        description: "Le lien de paiement a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  const addItem = () => {
    setItems([...items, { sku: '', description: '', quantity: 1, unit_price: 0, tax: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof DraftOrderItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const tax_total = items.reduce((sum, item) => sum + (item.tax || 0), 0);
    const total = subtotal + tax_total + formData.shipping_amount;
    return { subtotal, tax_total, total };
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string; icon: React.ReactNode }> = {
      draft: { variant: "outline", label: "Brouillon", icon: <FileText className="w-3 h-3" /> },
      awaiting_payment: { variant: "secondary", label: "En attente de paiement", icon: <Clock className="w-3 h-3" /> },
      paid: { variant: "default", label: "Payé", icon: <CheckCircle className="w-3 h-3" /> },
      in_escrow: { variant: "default", label: "En séquestre", icon: <Package className="w-3 h-3" /> },
      released: { variant: "default", label: "Libéré", icon: <CheckCircle className="w-3 h-3" /> },
      refunded: { variant: "outline", label: "Remboursé", icon: <RefreshCw className="w-3 h-3" /> },
      dispute: { variant: "destructive", label: "Litige", icon: <AlertTriangle className="w-3 h-3" /> },
      expired: { variant: "destructive", label: "Expiré", icon: <AlertTriangle className="w-3 h-3" /> }
    };
    
    const statusInfo = variants[status] || variants.draft;
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

  const { subtotal, tax_total, total } = calculateTotals();

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
          <h2 className="text-2xl font-bold">Proforma Invoices</h2>
          <p className="text-muted-foreground">
            Créez des devis et générez des liens de paiement sécurisés
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDraftOrders}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer une PI
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Créer une Proforma Invoice</DialogTitle>
                <DialogDescription>
                  Créez un devis détaillé pour votre client
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Informations du client */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buyer_email">Email du client *</Label>
                    <Input
                      id="buyer_email"
                      type="email"
                      value={formData.buyer_email}
                      onChange={(e) => setFormData({...formData, buyer_email: e.target.value})}
                      placeholder="client@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GNF">GNF - Franc Guinéen</SelectItem>
                        <SelectItem value="USD">USD - Dollar US</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="XOF">XOF - Franc CFA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Articles */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Articles *</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un article
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                            <div>
                              <Label>SKU</Label>
                              <Input
                                value={item.sku}
                                onChange={(e) => updateItem(index, 'sku', e.target.value)}
                                placeholder="SKU123"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <Label>Description *</Label>
                              <Input
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                placeholder="Description du produit"
                              />
                            </div>
                            <div>
                              <Label>Quantité *</Label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            <div>
                              <Label>Prix unitaire *</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Totaux */}
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé financier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Sous-total:</span>
                        <span>{formatAmount(subtotal, formData.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes:</span>
                        <span>{formatAmount(tax_total, formData.currency)}</span>
                      </div>
                      <div>
                        <Label htmlFor="shipping">Frais de livraison</Label>
                        <Input
                          id="shipping"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.shipping_amount}
                          onChange={(e) => setFormData({...formData, shipping_amount: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatAmount(total, formData.currency)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_terms">Conditions de paiement</Label>
                    <Textarea
                      id="payment_terms"
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery_terms">Conditions de livraison</Label>
                    <Textarea
                      id="delivery_terms"
                      value={formData.delivery_terms}
                      onChange={(e) => setFormData({...formData, delivery_terms: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expires_in_days">Validité (en jours)</Label>
                    <Input
                      id="expires_in_days"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.expires_in_days}
                      onChange={(e) => setFormData({...formData, expires_in_days: parseInt(e.target.value) || 30})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Notes additionnelles..."
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateDraftOrder} disabled={processingId === 'creating'}>
                  {processingId === 'creating' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Créer la PI
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Liste des Proforma Invoices */}
      <div className="space-y-4">
        {draftOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {order.pi_number}
                  </CardTitle>
                  <CardDescription>
                    Client: {order.buyer_email} • Créée le {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </CardDescription>
                </div>
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{formatAmount(order.total_amount, order.currency)}</p>
                    <p className="text-sm text-muted-foreground">{order.items.length} articles</p>
                  </div>
                </div>
                
                {order.expires_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Expire le</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.expires_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}

                {order.paid_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="font-semibold">Payé le</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.paid_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {order.status === 'draft' && (
                  <Button
                    onClick={() => handleGeneratePaymentLink(order.id)}
                    disabled={processingId === order.id}
                  >
                    {processingId === order.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Génération...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-4 h-4 mr-2" />
                        Générer Payment Link
                      </>
                    )}
                  </Button>
                )}

                {order.payment_link_url && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => copyPaymentLink(order.payment_link_url!)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copier le lien
                    </Button>
                    <Button
                      variant="outline"
                      asChild
                    >
                      <a href={order.payment_link_url} target="_blank" rel="noopener noreferrer">
                        <Eye className="w-4 h-4 mr-2" />
                        Voir le paiement
                      </a>
                    </Button>
                  </>
                )}

                <Button variant="outline" size="sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer par email
                </Button>
              </div>

              {order.notes && (
                <Alert>
                  <AlertDescription>
                    <strong>Notes:</strong> {order.notes}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}

        {draftOrders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune Proforma Invoice</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre première PI pour commencer à vendre
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer une PI
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProformaInvoiceManager;