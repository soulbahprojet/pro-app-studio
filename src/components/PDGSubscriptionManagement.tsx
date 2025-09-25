import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Crown, Plus, Calendar, Clock, Search, Store } from "lucide-react";

interface Subscription {
  id: string;
  user_id: string;
  subscription_type: string;
  duration_days?: number;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  notes?: string;
  user_email?: string;
  user_name?: string;
  user_readable_id?: string;
}

const PDGSubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Formulaire pour nouveau abonnement
  const [selectedUserId, setSelectedUserId] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("permanent");
  const [durationDays, setDurationDays] = useState("");
  const [notes, setNotes] = useState("");
  const [isShopDialogOpen, setIsShopDialogOpen] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");
  const [selectedUserForShop, setSelectedUserForShop] = useState("");

  useEffect(() => {
    loadSubscriptions();
    loadUsers();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, statusFilter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Charger les abonnements avec les informations utilisateur
      const { data, error } = await supabase
        .from('pdg_subscriptions')
        .select('*')
        .order('granted_at', { ascending: false });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les abonnements.",
          variant: "destructive",
        });
        return;
      }

      // Charger les informations des utilisateurs pour chaque abonnement
      const subscriptionsWithUsers = await Promise.all(
        (data || []).map(async (sub: any) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, full_name, readable_id')
            .eq('user_id', sub.user_id)
            .single();
          
          return {
            ...sub,
            user_email: profile?.email,
            user_name: profile?.full_name,
            user_readable_id: profile?.readable_id,
          };
        })
      );

      setSubscriptions(subscriptionsWithUsers);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, full_name, readable_id')
        .order('full_name');

      if (!error) {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const filterSubscriptions = () => {
    let filtered = subscriptions;

    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.user_readable_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        filtered = filtered.filter(sub => sub.is_active);
      } else if (statusFilter === "expired") {
        filtered = filtered.filter(sub => !sub.is_active);
      } else if (statusFilter === "permanent") {
        filtered = filtered.filter(sub => sub.subscription_type === "permanent");
      } else if (statusFilter === "temporary") {
        filtered = filtered.filter(sub => sub.subscription_type === "temporary");
      }
    }

    setFilteredSubscriptions(filtered);
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur.",
        variant: "destructive",
      });
      return;
    }

    try {
      const currentUser = await supabase.auth.getUser();
      
      const subscriptionData: any = {
        user_id: selectedUserId,
        subscription_type: subscriptionType,
        granted_by: currentUser.data.user?.id,
        notes: notes || null,
        is_active: true,
      };

      // Calcul de la date d'expiration pour les abonnements temporaires
      if (subscriptionType === "temporary" && durationDays) {
        const days = parseInt(durationDays);
        if (days > 0) {
          subscriptionData.duration_days = days;
          const expirationDate = new Date();
          expirationDate.setDate(expirationDate.getDate() + days);
          subscriptionData.expires_at = expirationDate.toISOString();
        }
      }

      const { error } = await supabase
        .from('pdg_subscriptions')
        .insert([subscriptionData]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'abonnement.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Abonnement créé avec succès.",
      });

      // Réinitialiser le formulaire
      setSelectedUserId("");
      setSubscriptionType("permanent");
      setDurationDays("");
      setNotes("");
      setIsDialogOpen(false);
      
      // Recharger les données
      loadSubscriptions();
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }
  };

  const toggleSubscriptionStatus = async (subscriptionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pdg_subscriptions')
        .update({ is_active: !currentStatus })
        .eq('id', subscriptionId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier le statut de l'abonnement.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: `Abonnement ${!currentStatus ? 'activé' : 'désactivé'} avec succès.`,
      });

      loadSubscriptions();
    } catch (error) {
      console.error('Error updating subscription status:', error);
    }
  };

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserForShop || !shopName) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Générer un slug unique pour la boutique
      const slug = shopName.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .replace(/^-+|-+$/g, "");

      const { error } = await supabase
        .from('seller_shops')
        .insert([{
          seller_id: selectedUserForShop,
          shop_name: shopName,
          description: shopDescription || null,
          slug: slug,
          is_active: true,
          theme_color: '#3B82F6',
          subscription_plan: 'basic',
          product_count: 0
        }]);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer la boutique.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Boutique créée avec succès.",
      });

      // Réinitialiser le formulaire
      setSelectedUserForShop("");
      setShopName("");
      setShopDescription("");
      setIsShopDialogOpen(false);
      
    } catch (error) {
      console.error('Error creating shop:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (subscription: Subscription) => {
    if (!subscription.is_active) {
      return <Badge variant="secondary">Inactif</Badge>;
    }

    if (subscription.subscription_type === "permanent") {
      return <Badge variant="default">Permanent</Badge>;
    }

    if (subscription.expires_at) {
      const expirationDate = new Date(subscription.expires_at);
      const now = new Date();
      
      if (expirationDate > now) {
        return <Badge variant="default">Actif</Badge>;
      } else {
        return <Badge variant="destructive">Expiré</Badge>;
      }
    }

    return <Badge variant="outline">Temporaire</Badge>;
  };

  const formatDuration = (subscription: Subscription) => {
    if (subscription.subscription_type === "permanent") {
      return "Illimité";
    }

    if (subscription.duration_days) {
      return `${subscription.duration_days} jours`;
    }

    return "-";
  };

  const formatExpirationDate = (subscription: Subscription) => {
    if (subscription.subscription_type === "permanent") {
      return "Jamais";
    }

    if (subscription.expires_at) {
      return new Date(subscription.expires_at).toLocaleDateString('fr-FR');
    }

    return "-";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Crown className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Gestion des Abonnements
            </CardTitle>
            <CardDescription>
              Attribution d'abonnements permanents et temporaires
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel Abonnement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel abonnement</DialogTitle>
                  <DialogDescription>
                    Attribuer un abonnement permanent ou temporaire à un utilisateur
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubscription} className="space-y-4">
                  <div>
                    <Label htmlFor="user">Utilisateur</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.readable_id} - {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="type">Type d'abonnement</Label>
                    <Select value={subscriptionType} onValueChange={setSubscriptionType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permanent">Permanent</SelectItem>
                        <SelectItem value="temporary">Temporaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {subscriptionType === "temporary" && (
                    <div>
                      <Label htmlFor="duration">Durée (en jours)</Label>
                      <Input
                        id="duration"
                        type="number"
                        placeholder="Ex: 30, 90, 365"
                        value={durationDays}
                        onChange={(e) => setDurationDays(e.target.value)}
                        min="1"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notes (optionnel)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Raison de l'attribution, conditions spéciales..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      Créer l'abonnement
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isShopDialogOpen} onOpenChange={setIsShopDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Store className="h-4 w-4 mr-2" />
                  Créer Boutique
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle boutique</DialogTitle>
                  <DialogDescription>
                    Créer une boutique pour un utilisateur même s'il n'est pas en ligne
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateShop} className="space-y-4">
                  <div>
                    <Label htmlFor="userForShop">Utilisateur</Label>
                    <Select value={selectedUserForShop} onValueChange={setSelectedUserForShop}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.readable_id} - {user.full_name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="shopName">Nom de la boutique *</Label>
                    <Input
                      id="shopName"
                      placeholder="Ex: Ma Boutique"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="shopDescription">Description (optionnel)</Label>
                    <Textarea
                      id="shopDescription"
                      placeholder="Description de la boutique..."
                      value={shopDescription}
                      onChange={(e) => setShopDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsShopDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      <Store className="h-4 w-4 mr-2" />
                      Créer la boutique
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtres */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par ID utilisateur, email ou nom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="expired">Expirés</SelectItem>
              <SelectItem value="permanent">Permanents</SelectItem>
              <SelectItem value="temporary">Temporaires</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {subscriptions.filter(s => s.is_active).length}
            </p>
            <p className="text-sm text-muted-foreground">Actifs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {subscriptions.filter(s => s.subscription_type === 'permanent').length}
            </p>
            <p className="text-sm text-muted-foreground">Permanents</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {subscriptions.filter(s => s.subscription_type === 'temporary').length}
            </p>
            <p className="text-sm text-muted-foreground">Temporaires</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {subscriptions.filter(s => 
                s.expires_at && new Date(s.expires_at) < new Date()
              ).length}
            </p>
            <p className="text-sm text-muted-foreground">Expirés</p>
          </div>
        </div>

        {/* Table des abonnements */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead>Expire le</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Attribué le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-mono font-semibold">
                    {subscription.user_readable_id}
                  </TableCell>
                  <TableCell>{subscription.user_email}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {subscription.subscription_type === "permanent" ? (
                        <Crown className="h-4 w-4 mr-1 text-yellow-500" />
                      ) : (
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                      )}
                      {subscription.subscription_type === "permanent" ? "Permanent" : "Temporaire"}
                    </div>
                  </TableCell>
                  <TableCell>{formatDuration(subscription)}</TableCell>
                  <TableCell>{formatExpirationDate(subscription)}</TableCell>
                  <TableCell>{getStatusBadge(subscription)}</TableCell>
                  <TableCell>
                    {new Date(subscription.granted_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSubscriptionStatus(subscription.id, subscription.is_active)}
                    >
                      {subscription.is_active ? "Désactiver" : "Activer"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className="text-center py-8">
            <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun abonnement trouvé</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDGSubscriptionManagement;
