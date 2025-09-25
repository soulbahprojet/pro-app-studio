import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WalletTransfer, Currency, ExpirableId } from '@/types';
import { 
  Send, 
  Wallet, 
  ArrowRightLeft, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Eye,
  QrCode,
  Copy,
  History,
  Truck
} from 'lucide-react';

interface WalletTransferSystemProps {
  currentUserId: string;
  userWallets: {
    id: string;
    currency: Currency;
    balance: number;
  }[];
  onTransfer: (transfer: Omit<WalletTransfer, 'id' | 'createdAt'>) => void;
}

const WalletTransferSystem: React.FC<WalletTransferSystemProps> = ({
  currentUserId,
  userWallets,
  onTransfer
}) => {
  const { toast } = useToast();
  const [transferForm, setTransferForm] = useState({
    toUserId: '',
    amount: '',
    currency: 'GNF' as Currency,
    purpose: 'payment' as WalletTransfer['purpose'],
    reference: '',
    enableEscrow: false,
    escrowCondition: 'delivery_confirmed' as 'delivery_confirmed' | 'auto_release' | 'manual'
  });
  
  const [generating, setGenerating] = useState(false);
  const [generatedId, setGeneratedId] = useState<ExpirableId | null>(null);
  const [recentTransfers, setRecentTransfers] = useState<WalletTransfer[]>([]);

  // Données simulées pour les transferts récents
  React.useEffect(() => {
    const mockTransfers: WalletTransfer[] = [
      {
        id: 'transfer_1',
        fromWalletId: `wallet_${currentUserId}_GNF`,
        toWalletId: 'wallet_seller_1_GNF',
        amount: 25000,
        currency: 'GNF',
        fee: 250,
        purpose: 'payment',
        reference: 'order_123',
        status: 'completed',
        escrow: {
          enabled: true,
          releaseCondition: 'delivery_confirmed'
        },
        expirationId: 'exp_del_001',
        createdAt: '2024-01-20T09:30:00Z',
        completedAt: '2024-01-20T15:45:00Z'
      },
      {
        id: 'transfer_2',
        fromWalletId: `wallet_${currentUserId}_GNF`,
        toWalletId: 'wallet_courier_1_GNF',
        amount: 5000,
        currency: 'GNF',
        fee: 50,
        purpose: 'tip',
        reference: 'order_123',
        status: 'completed',
        createdAt: '2024-01-20T16:00:00Z',
        completedAt: '2024-01-20T16:01:00Z'
      },
      {
        id: 'transfer_3',
        fromWalletId: 'wallet_seller_2_GNF',
        toWalletId: `wallet_${currentUserId}_GNF`,
        amount: 15000,
        currency: 'GNF',
        fee: 150,
        purpose: 'refund',
        reference: 'order_124',
        status: 'pending',
        escrow: {
          enabled: true,
          releaseCondition: 'auto_release',
          releaseDate: '2024-01-21T12:00:00Z'
        },
        expirationId: 'exp_pay_002',
        createdAt: '2024-01-20T14:20:00Z'
      }
    ];
    setRecentTransfers(mockTransfers);
  }, [currentUserId]);

  const generateExpirableId = (type: ExpirableId['type'], duration: number = 24) => {
    setGenerating(true);
    
    setTimeout(() => {
      const expirableId: ExpirableId = {
        id: `exp_${type}_${Date.now()}`,
        type,
        associatedEntityId: transferForm.reference || `transfer_${Date.now()}`,
        expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      setGeneratedId(expirableId);
      setGenerating(false);
      
      toast({
        title: "ID unique généré",
        description: `ID expirant dans ${duration}h: ${expirableId.id}`,
      });
    }, 1500);
  };

  const handleTransfer = async () => {
    if (!transferForm.toUserId || !transferForm.amount) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive",
      });
      return;
    }

    const amount = Number(transferForm.amount);
    const selectedWallet = Array.isArray(userWallets) 
      ? userWallets.find(w => w && w.currency === transferForm.currency)
      : null;
    
    if (!selectedWallet || (selectedWallet.balance != null && selectedWallet.balance < amount)) {
      toast({
        title: "Solde insuffisant",
        description: "Votre solde est insuffisant pour cette transaction.",
        variant: "destructive",
      });
      return;
    }

    const fee = Math.max(Math.round(amount * 0.01), 10); // 1% min 10 unités
    const total = amount + fee;

    if (selectedWallet.balance != null && selectedWallet.balance < total) {
      toast({
        title: "Solde insuffisant",
        description: `Solde nécessaire: ${total.toLocaleString()} ${transferForm.currency} (incluant frais)`,
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting real transfer with Supabase API:', {
        action: 'transfer',
        recipient_id: transferForm.toUserId,
        amount: amount,
        currency: transferForm.currency,
        purpose: transferForm.reference || transferForm.purpose
      });

      // Appel API réel à Supabase
      const { data, error } = await supabase.functions.invoke('wallet', {
        body: {
          action: 'transfer',
          recipient_id: transferForm.toUserId,
          amount: amount,
          currency: transferForm.currency,
          purpose: transferForm.reference || transferForm.purpose
        }
      });

      console.log('Transfer response:', { data, error });

      // Vérifier les erreurs
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message || 'Erreur de connexion');
      }

      if (data?.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      // Vérifier le succès - même logique que WalletManagement
      if (!data?.success) {
        console.error('Transfer failed:', data);
        
        // Si pas de succès mais pas d'erreur explicite, vérifier si le transfert s'est fait quand même
        if (data?.reference) {
          toast({
            title: "Transfert effectué ✅",
            description: `Référence: ${data.reference}`,
          });
          
          // Reset form
          setTransferForm({
            toUserId: '',
            amount: '',
            currency: 'GNF',
            purpose: 'payment',
            reference: '',
            enableEscrow: false,
            escrowCondition: 'delivery_confirmed'
          });
          setGeneratedId(null);
          
          // Appeler onTransfer pour mettre à jour l'UI si nécessaire
          onTransfer({
            fromWalletId: `wallet_${currentUserId}_${transferForm.currency}`,
            toWalletId: `wallet_${transferForm.toUserId}_${transferForm.currency}`,
            amount,
            currency: transferForm.currency,
            fee,
            purpose: transferForm.purpose,
            reference: transferForm.reference,
            status: 'completed',
            escrow: transferForm.enableEscrow ? {
              enabled: true,
              releaseCondition: transferForm.escrowCondition
            } : undefined,
            expirationId: generatedId?.id
          });
          
          return;
        }
        
        throw new Error(data?.message || 'Transfert échoué');
      }

      toast({
        title: "Transfert effectué ✅",
        description: `Référence: ${data.reference}`,
      });

      // Reset form
      setTransferForm({
        toUserId: '',
        amount: '',
        currency: 'GNF',
        purpose: 'payment',
        reference: '',
        enableEscrow: false,
        escrowCondition: 'delivery_confirmed'
      });
      setGeneratedId(null);

      // Appeler onTransfer pour mettre à jour l'UI
      onTransfer({
        fromWalletId: `wallet_${currentUserId}_${transferForm.currency}`,
        toWalletId: `wallet_${transferForm.toUserId}_${transferForm.currency}`,
        amount,
        currency: transferForm.currency,
        fee,
        purpose: transferForm.purpose,
        reference: transferForm.reference,
        status: 'completed',
        escrow: transferForm.enableEscrow ? {
          enabled: true,
          releaseCondition: transferForm.escrowCondition
        } : undefined,
        expirationId: generatedId?.id
      });

    } catch (error: any) {
      console.error('Transfer error:', error);
      
      let errorMessage = "Erreur lors du transfert";
      
      // Gestion spécifique des erreurs courantes
      if (error.message?.includes('Solde insuffisant')) {
        errorMessage = error.message;
      } else if (error.message?.includes('Destinataire introuvable')) {
        errorMessage = "Destinataire introuvable - Vérifiez l'ID destinataire";
      } else if (error.message?.includes('Edge Function returned a non-2xx status code')) {
        errorMessage = "Erreur du serveur - Le transfert n'a pas pu être traité. Votre solde n'a pas été débité.";
      } else if (error.message?.includes('portefeuille est bloqué')) {
        errorMessage = error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Transfert échoué ❌",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié",
      description: "ID copié dans le presse-papiers",
    });
  };

  const formatAmount = (amount: number, currency: Currency) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getStatusColor = (status: WalletTransfer['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPurposeIcon = (purpose: WalletTransfer['purpose']) => {
    switch (purpose) {
      case 'payment': return <Send className="w-4 h-4" />;
      case 'refund': return <ArrowRightLeft className="w-4 h-4" />;
      case 'commission': return <Wallet className="w-4 h-4" />;
      case 'tip': return <CheckCircle className="w-4 h-4" />;
      case 'withdrawal': return <ArrowRightLeft className="w-4 h-4" />;
      default: return <Send className="w-4 h-4" />;
    }
  };

  const getPurposeLabel = (purpose: WalletTransfer['purpose']) => {
    switch (purpose) {
      case 'payment': return 'Paiement';
      case 'refund': return 'Remboursement';
      case 'commission': return 'Commission';
      case 'tip': return 'Pourboire';
      case 'withdrawal': return 'Retrait';
      default: return purpose;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transferts Inter-Wallets</h2>
          <p className="text-muted-foreground">
            Envoyez de l'argent de manière sécurisée avec escrow et IDs expirables
          </p>
        </div>
      </div>

      <Tabs defaultValue="transfer" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transfer">Nouveau Transfert</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="ids">IDs Expirables</TabsTrigger>
        </TabsList>

        {/* Nouveau Transfert */}
        <TabsContent value="transfer">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer de l'argent
                </CardTitle>
                <CardDescription>
                  Transférez des fonds vers un autre utilisateur avec protection escrow
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="toUserId">ID Destinataire</Label>
                  <Input
                    id="toUserId"
                    value={transferForm.toUserId}
                    onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}
                    placeholder="Ex: 482GN, 731L"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Montant</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <select
                      id="currency"
                      value={transferForm.currency}
                      onChange={(e) => setTransferForm({ ...transferForm, currency: e.target.value as Currency })}
                      className="w-full border border-input rounded-md px-3 py-2 bg-background"
                    >
                      {Array.isArray(userWallets) && userWallets.length > 0 ? userWallets.map(wallet => (
                        <option key={wallet?.currency || 'unknown'} value={wallet?.currency || ''}>
                          {wallet?.currency || 'N/A'} (Solde: {wallet?.balance != null ? wallet.balance.toLocaleString() : '0'})
                        </option>
                      )) : (
                        <option value="">Aucun wallet disponible</option>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="purpose">Motif</Label>
                  <select
                    id="purpose"
                    value={transferForm.purpose}
                    onChange={(e) => setTransferForm({ ...transferForm, purpose: e.target.value as WalletTransfer['purpose'] })}
                    className="w-full border border-input rounded-md px-3 py-2 bg-background"
                  >
                    <option value="payment">Paiement</option>
                    <option value="refund">Remboursement</option>
                    <option value="commission">Commission</option>
                    <option value="tip">Pourboire</option>
                    <option value="withdrawal">Retrait</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="reference">Référence (optionnel)</Label>
                  <Input
                    id="reference"
                    value={transferForm.reference}
                    onChange={(e) => setTransferForm({ ...transferForm, reference: e.target.value })}
                    placeholder="Ex: order_123, commission_janvier"
                  />
                </div>

                {/* Options escrow */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enableEscrow"
                      checked={transferForm.enableEscrow}
                      onChange={(e) => setTransferForm({ ...transferForm, enableEscrow: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="enableEscrow" className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Activer la protection escrow
                    </Label>
                  </div>

                  {transferForm.enableEscrow && (
                    <div>
                      <Label>Condition de libération</Label>
                      <select
                        value={transferForm.escrowCondition}
                        onChange={(e) => setTransferForm({ ...transferForm, escrowCondition: e.target.value as any })}
                        className="w-full border border-input rounded-md px-3 py-2 bg-background mt-1"
                      >
                        <option value="delivery_confirmed">Livraison confirmée</option>
                        <option value="auto_release">Libération automatique (7 jours)</option>
                        <option value="manual">Libération manuelle</option>
                      </select>
                    </div>
                  )}
                </div>

                <Button onClick={handleTransfer} className="w-full" variant="hero">
                  Effectuer le transfert
                </Button>

                {/* Résumé des frais */}
                {transferForm.amount && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Montant:</span>
                      <span>{formatAmount(Number(transferForm.amount), transferForm.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Frais (1%):</span>
                      <span>{formatAmount(Math.max(Math.round(Number(transferForm.amount) * 0.01), 10), transferForm.currency)}</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-2">
                      <span>Total:</span>
                      <span>{formatAmount(Number(transferForm.amount) + Math.max(Math.round(Number(transferForm.amount) * 0.01), 10), transferForm.currency)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Générateur d'ID expirable */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  IDs Expirables
                </CardTitle>
                <CardDescription>
                  Générez des identifiants uniques qui expirent après livraison
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => generateExpirableId('delivery', 24)}
                    disabled={generating}
                    variant="outline"
                  >
                    {generating ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" />}
                    ID Livraison (24h)
                  </Button>
                  
                  <Button
                    onClick={() => generateExpirableId('payment', 72)}
                    disabled={generating}
                    variant="outline"
                  >
                    {generating ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
                    ID Paiement (72h)
                  </Button>
                </div>

                {generatedId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-green-800">ID Généré</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-green-700">ID:</span>
                            <div className="flex items-center space-x-2">
                              <code className="bg-green-100 px-2 py-1 rounded text-green-800">
                                {generatedId.id}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(generatedId.id)}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-green-700">Type:</span>
                            <span className="text-green-800 capitalize">{generatedId.type}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-green-700">Expire:</span>
                            <span className="text-green-800">
                              {new Date(generatedId.expiresAt).toLocaleString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Sécurité des IDs</p>
                      <ul className="space-y-1 text-xs">
                        <li>• IDs uniques et non réutilisables</li>
                        <li>• Expiration automatique selon le contexte</li>
                        <li>• Liés aux transactions et livraisons</li>
                        <li>• Audit trail complet disponible</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                Historique des Transferts
              </CardTitle>
              <CardDescription>
                Consultez tous vos transferts entrants et sortants
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {recentTransfers.map((transfer) => (
                  <div key={transfer.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-full bg-muted">
                          {getPurposeIcon(transfer.purpose)}
                        </div>
                        <div>
                          <h4 className="font-medium">{getPurposeLabel(transfer.purpose)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {transfer.reference && `Réf: ${transfer.reference}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {transfer.fromWalletId.includes(currentUserId) ? '-' : '+'}
                          {formatAmount(transfer.amount, transfer.currency)}
                        </div>
                        <Badge className={getStatusColor(transfer.status)} variant="outline">
                          {transfer.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Frais: </span>
                        {formatAmount(transfer.fee, transfer.currency)}
                      </div>
                      <div>
                        <span className="font-medium">Date: </span>
                        {new Date(transfer.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    
                    {transfer.escrow?.enabled && (
                      <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-amber-600" />
                          <span className="text-sm text-amber-800">
                            Escrow actif - {transfer.escrow.releaseCondition}
                          </span>
                        </div>
                      </div>
                    )}

                    {transfer.expirationId && (
                      <div className="mt-2 flex items-center space-x-2 text-xs text-muted-foreground">
                        <QrCode className="w-3 h-3" />
                        <span>ID expirant: {transfer.expirationId}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IDs Management */}
        <TabsContent value="ids">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="w-5 h-5 mr-2" />
                Gestion des IDs Expirables
              </CardTitle>
              <CardDescription>
                Suivez et gérez vos identifiants uniques actifs
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="text-center py-12">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucun ID actif</h3>
                <p className="text-muted-foreground">
                  Générez des IDs expirables depuis l'onglet transfert
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletTransferSystem;
