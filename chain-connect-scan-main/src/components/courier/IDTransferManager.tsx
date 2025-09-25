import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowRightLeft, 
  MapPin, 
  Building2,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface IDTransfer {
  id: string;
  from_city: string;
  to_city: string;
  reason: string;
  status: string;
  requested_at: string;
  approved_at?: string;
  completed_at?: string;
  notes?: string;
  from_union?: {
    id: string;
    name: string;
    city: string;
  };
  to_union?: {
    id: string;
    name: string;
    city: string;
  };
}

interface Union {
  id: string;
  name: string;
  city: string;
  union_type: string;
}

export default function IDTransferManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<IDTransfer[]>([]);
  const [unions, setUnions] = useState<Union[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTransfer, setNewTransfer] = useState({
    to_city: '',
    to_union_id: '',
    reason: ''
  });

  useEffect(() => {
    if (profile) {
      loadTransfers();
      loadAvailableUnions();
    }
  }, [profile]);

  const loadTransfers = async () => {
    try {
      // Mock data for now since tables might not be in types yet
      const data: IDTransfer[] = [];
      const error = null;

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des transferts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUnions = async () => {
    try {
      // Mock data for now
      const data: Union[] = [
        {
          id: '1',
          name: 'Syndicat Moto Kankan',
          city: 'Kankan',
          union_type: 'syndicat_moto'
        }
      ];
      const error = null;

      if (error) throw error;
      setUnions(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des syndicats:', error);
    }
  };

  const requestTransfer = async () => {
    if (!newTransfer.to_city || !newTransfer.reason) {
      toast({
        title: "❌ Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('id_transfers')
        .insert([{
          courier_id: profile?.user_id,
          from_city: (profile as any)?.city || '',
          to_city: newTransfer.to_city,
          to_union_id: newTransfer.to_union_id || null,
          reason: newTransfer.reason
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "✅ Demande de transfert envoyée",
        description: "Votre demande de transfert d'ID a été soumise pour approbation.",
      });

      setIsCreateOpen(false);
      setNewTransfer({
        to_city: '',
        to_union_id: '',
        reason: ''
      });
      loadTransfers();
    } catch (error) {
      console.error('Erreur lors de la demande de transfert:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de soumettre la demande de transfert.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvé';
      case 'completed': return 'Terminé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default';
      case 'approved': return 'secondary';
      case 'completed': return 'default';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  const canRequestTransfer = () => {
    // Vérifier s'il n'y a pas de transfert en cours
    return !transfers.some(t => t.status === 'pending' || t.status === 'approved');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Chargement des transferts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5" />
              Transfert d'ID
            </CardTitle>
            <CardDescription>
              Transférez votre ID vers un autre syndicat en cas de déménagement
            </CardDescription>
          </div>
          {canRequestTransfer() && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Demander un transfert
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Demande de transfert d'ID</DialogTitle>
                  <DialogDescription>
                    Transférez votre ID vers un autre syndicat
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span><strong>Ville actuelle:</strong> {(profile as any)?.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Building2 className="w-4 h-4" />
                      <span><strong>Numéro de gilet:</strong> {(profile as any)?.vest_number}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Nouvelle ville *</label>
                    <Input
                      value={newTransfer.to_city}
                      onChange={(e) => setNewTransfer({ ...newTransfer, to_city: e.target.value })}
                      placeholder="Ville de destination"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Syndicat de destination (optionnel)</label>
                    <Select value={newTransfer.to_union_id} onValueChange={(value) => 
                      setNewTransfer({ ...newTransfer, to_union_id: value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un syndicat..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unions.map((union) => (
                          <SelectItem key={union.id} value={union.id}>
                            {union.name} - {union.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Raison du transfert *</label>
                    <Textarea
                      value={newTransfer.reason}
                      onChange={(e) => setNewTransfer({ ...newTransfer, reason: e.target.value })}
                      placeholder="Expliquez la raison de votre déménagement"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={requestTransfer} className="flex-1">
                      Soumettre la demande
                    </Button>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canRequestTransfer() && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Vous avez déjà une demande de transfert en cours. Attendez qu'elle soit traitée avant d'en soumettre une nouvelle.
            </p>
          </div>
        )}

        {transfers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune demande de transfert. Votre ID est attaché à votre ville actuelle.
          </p>
        ) : (
          transfers.map((transfer) => (
            <div key={transfer.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(transfer.status)}
                  <span className="font-medium">
                    {transfer.from_city} → {transfer.to_city}
                  </span>
                </div>
                <Badge variant={getStatusVariant(transfer.status)}>
                  {getStatusText(transfer.status)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div>
                  <strong className="text-sm">Raison:</strong>
                  <p className="text-sm text-muted-foreground">{transfer.reason}</p>
                </div>

                {transfer.to_union && (
                  <div>
                    <strong className="text-sm">Syndicat de destination:</strong>
                    <p className="text-sm text-muted-foreground">
                      {transfer.to_union.name} - {transfer.to_union.city}
                    </p>
                  </div>
                )}

                {transfer.notes && (
                  <div>
                    <strong className="text-sm">Notes administratives:</strong>
                    <p className="text-sm text-muted-foreground">{transfer.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Demandé le {new Date(transfer.requested_at).toLocaleDateString()}</span>
                {transfer.completed_at && (
                  <span>Terminé le {new Date(transfer.completed_at).toLocaleDateString()}</span>
                )}
              </div>

              {transfer.status === 'completed' && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
                  ✅ Transfert terminé ! Votre ID est maintenant attaché à {transfer.to_city}.
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}