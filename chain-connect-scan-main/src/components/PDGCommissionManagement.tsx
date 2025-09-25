import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DollarSign, TrendingUp, Users, Search, Edit, Settings, Star, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Commission {
  id: string;
  affiliate_id: string;
  referral_id: string;
  commission_amount: number;
  commission_rate: number;
  currency: string;
  status: string;
  commission_type: string;
  created_at: string;
  paid_at: string | null;
  affiliate?: {
    email: string;
    full_name: string;
    subscription_plan?: string;
  };
  referral?: {
    email: string;
    full_name: string;
  };
}

interface CommissionSettings {
  standard_rate: number;
  vip_rate: number;
  top_rate: number;
}

const PDGCommissionManagement = () => {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings>({
    standard_rate: 0.05, // 5% par défaut
    vip_rate: 0.08, // 8% pour VIP
    top_rate: 0.12 // 12% pour TOP
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('affiliate_commissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const commissionsWithUsers = await Promise.all(
          data.map(async (commission: any) => {
            const [affiliateData, referralData] = await Promise.all([
              supabase
                .from('profiles')
                .select('email, full_name, subscription_plan')
                .eq('user_id', commission.affiliate_id)
                .single(),
              supabase
                .from('profiles')
                .select('email, full_name')
                .eq('user_id', commission.referral_id)
                .single()
            ]);

            return {
              ...commission,
              affiliate: affiliateData.data,
              referral: referralData.data
            };
          })
        );
        
        setCommissions(commissionsWithUsers);
      }
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCommissionStatus = async (commissionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('affiliate_commissions')
        .update({ status: newStatus, paid_at: newStatus === 'paid' ? new Date().toISOString() : null })
        .eq('id', commissionId);

      if (error) throw error;

      toast({
        title: "Commission mise à jour",
        description: `Le statut a été modifié avec succès.`,
      });

      loadCommissions(); // Recharger les données
    } catch (error) {
      console.error('Error updating commission:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commission.",
        variant: "destructive",
      });
    }
  };

  const updateCommissionRate = async (commissionId: string, newRate: number) => {
    try {
      const { error } = await supabase
        .from('affiliate_commissions')
        .update({ commission_rate: newRate })
        .eq('id', commissionId);

      if (error) throw error;

      toast({
        title: "Taux de commission mis à jour",
        description: `Le nouveau taux est de ${(newRate * 100).toFixed(1)}%.`,
      });

      loadCommissions();
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating commission rate:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le taux de commission.",
        variant: "destructive",
      });
    }
  };

  const getPartnerTypeIcon = (subscriptionPlan?: string) => {
    switch (subscriptionPlan) {
      case 'premium':
        return <Star className="h-4 w-4 text-yellow-500" />;
      case 'top':
        return <Crown className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getPartnerTypeLabel = (subscriptionPlan?: string) => {
    switch (subscriptionPlan) {
      case 'premium':
        return 'VIP';
      case 'top':
        return 'TOP';
      default:
        return 'Standard';
    }
  };

  const getRecommendedRate = (subscriptionPlan?: string) => {
    switch (subscriptionPlan) {
      case 'premium':
        return commissionSettings.vip_rate;
      case 'top':
        return commissionSettings.top_rate;
      default:
        return commissionSettings.standard_rate;
    }
  };

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.affiliate?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.affiliate?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || commission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCommissions = commissions.length;
  const totalAmount = commissions.reduce((sum, c) => sum + Number(c.commission_amount), 0);
  const pendingCommissions = commissions.filter(c => c.status === 'pending').length;
  const paidCommissions = commissions.filter(c => c.status === 'paid').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <DollarSign className="h-8 w-8 animate-pulse text-primary" />
        <span className="ml-2">Chargement des commissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Gestion des Commissions
          </CardTitle>
          <CardDescription>
            Gérez les commissions d'affiliation et les paiements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Commissions</p>
                  <p className="text-2xl font-bold text-blue-600">{totalCommissions}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Montant Total</p>
                  <p className="text-2xl font-bold text-green-600">{totalAmount.toLocaleString()} GNF</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCommissions}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Payées</p>
                  <p className="text-2xl font-bold text-purple-600">{paidCommissions}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres et Configuration */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="paid">Payées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Taux de Commission
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configuration des Taux de Commission</DialogTitle>
                  <DialogDescription>
                    Définissez les taux de commission pour chaque type de partenaire.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="standard-rate">Partenaire Standard (%)</Label>
                    <Input
                      id="standard-rate"
                      type="number"
                      step="0.1"
                      value={(commissionSettings.standard_rate * 100).toFixed(1)}
                      onChange={(e) => setCommissionSettings(prev => ({
                        ...prev,
                        standard_rate: parseFloat(e.target.value) / 100
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vip-rate" className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-2" />
                      Partenaire VIP (%)
                    </Label>
                    <Input
                      id="vip-rate"
                      type="number"
                      step="0.1"
                      value={(commissionSettings.vip_rate * 100).toFixed(1)}
                      onChange={(e) => setCommissionSettings(prev => ({
                        ...prev,
                        vip_rate: parseFloat(e.target.value) / 100
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="top-rate" className="flex items-center">
                      <Crown className="h-4 w-4 text-purple-500 mr-2" />
                      Partenaire TOP (%)
                    </Label>
                    <Input
                      id="top-rate"
                      type="number"
                      step="0.1"
                      value={(commissionSettings.top_rate * 100).toFixed(1)}
                      onChange={(e) => setCommissionSettings(prev => ({
                        ...prev,
                        top_rate: parseFloat(e.target.value) / 100
                      }))}
                    />
                  </div>
                  <Button onClick={() => setSettingsDialogOpen(false)} className="w-full">
                    Enregistrer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table des commissions */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affilié</TableHead>
                <TableHead>Référé</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Taux</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{commission.affiliate?.full_name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{commission.affiliate?.email || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{commission.referral?.full_name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{commission.referral?.email || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {Number(commission.commission_amount).toLocaleString()} {commission.currency}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(commission.commission_rate * 100).toFixed(1)}%
                      {commission.commission_rate !== getRecommendedRate(commission.affiliate?.subscription_plan) && (
                        <Badge variant="outline" className="text-xs">
                          Recommandé: {(getRecommendedRate(commission.affiliate?.subscription_plan) * 100).toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPartnerTypeIcon(commission.affiliate?.subscription_plan)}
                      <span className="text-sm font-medium">
                        {getPartnerTypeLabel(commission.affiliate?.subscription_plan)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        commission.status === 'paid' ? 'default' :
                        commission.status === 'pending' ? 'secondary' : 'destructive'
                      }
                    >
                      {commission.status === 'paid' ? 'Payée' :
                       commission.status === 'pending' ? 'En attente' : 'Annulée'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(commission.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={editDialogOpen && selectedCommission?.id === commission.id} 
                              onOpenChange={(open) => {
                                setEditDialogOpen(open);
                                if (open) setSelectedCommission(commission);
                              }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier la Commission</DialogTitle>
                            <DialogDescription>
                              Ajustez le taux de commission pour cet affilié.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="commission-rate">Nouveau taux de commission (%)</Label>
                              <Input
                                id="commission-rate"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                defaultValue={(commission.commission_rate * 100).toFixed(1)}
                                onChange={(e) => {
                                  if (selectedCommission) {
                                    setSelectedCommission({
                                      ...selectedCommission,
                                      commission_rate: parseFloat(e.target.value) / 100
                                    });
                                  }
                                }}
                              />
                              <p className="text-sm text-muted-foreground">
                                Taux recommandé pour {getPartnerTypeLabel(commission.affiliate?.subscription_plan)}: 
                                {' '}{(getRecommendedRate(commission.affiliate?.subscription_plan) * 100).toFixed(1)}%
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => selectedCommission && updateCommissionRate(selectedCommission.id, selectedCommission.commission_rate)}
                                className="flex-1"
                              >
                                Enregistrer
                              </Button>
                              <Button 
                                variant="outline" 
                                onClick={() => selectedCommission && updateCommissionRate(selectedCommission.id, getRecommendedRate(commission.affiliate?.subscription_plan))}
                              >
                                Appliquer le taux recommandé
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {commission.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateCommissionStatus(commission.id, 'paid')}
                        >
                          Marquer comme payée
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCommissions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune commission trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDGCommissionManagement;