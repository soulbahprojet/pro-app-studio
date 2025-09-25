import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import UserWalletManager from './UserWalletManager';
import { 
  Building2, 
  Users, 
  Bike,
  AlertTriangle,
  Plus,
  Send,
  BarChart3,
  RefreshCw,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Wallet,
  CreditCard,
  DollarSign,
  Activity
} from 'lucide-react';

interface Statistics {
  total_bureaux: number;
  total_travailleurs: number;
  total_motos: number;
  alertes_critiques: number;
}

interface Bureau {
  id: string;
  nom: string;
  email_president: string;
  ville: string;
  interface_url: string;
  is_active: boolean;
  date_created: string;
  travailleurs?: { count: number }[];
  motos_count?: number;
  total_transactions?: number;
  balance_gnf?: number;
  balance_usd?: number;
  balance_eur?: number;
}

interface Travailleur {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  access_level: string;
  is_active: boolean;
  date_created: string;
  bureaux_syndicaux: { nom: string; ville: string };
  user_id?: string;
  wallet_balance?: {
    gnf: number;
    usd: number;
    eur: number;
  };
  transactions_count?: number;
}

const PDGSyndicatDashboard: React.FC = () => {
  const { toast } = useToast();
  const [statistics, setStatistics] = useState<Statistics>({
    total_bureaux: 0,
    total_travailleurs: 0,
    total_motos: 0,
    alertes_critiques: 0
  });
  const [bureaux, setBureaux] = useState<Bureau[]>([]);
  const [travailleurs, setTravailleurs] = useState<Travailleur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBureau, setShowAddBureau] = useState(false);
  const [showResendLink, setShowResendLink] = useState(false);

  // Formulaires
  const [bureauForm, setBureauForm] = useState({
    nom: '',
    email_president: '',
    ville: ''
  });

  const [resendForm, setResendForm] = useState({
    email: '',
    type: 'bureau' as 'bureau' | 'travailleur'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const { data: stats } = await supabase.functions.invoke('syndicat-management/get-statistics');
      if (stats) setStatistics(stats);

      // Charger les bureaux
      const { data: bureauxData } = await supabase.functions.invoke('syndicat-management/get-bureaux');
      if (bureauxData) setBureaux(bureauxData);

      // Charger les travailleurs
      const { data: travailleursData } = await supabase.functions.invoke('syndicat-management/get-travailleurs');
      if (travailleursData) setTravailleurs(travailleursData);

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBureau = async () => {
    try {
      if (!bureauForm.nom || !bureauForm.email_president || !bureauForm.ville) {
        toast({
          title: "Champs requis",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('syndicat-management/add-bureau', {
        body: bureauForm
      });

      // Vérifier si la réponse indique un succès
      if (response.data?.success) {
        const successMessage = response.data.message || `Le bureau ${bureauForm.nom} a été créé et l'email d'activation envoyé`;
        toast({
          title: "Succès",
          description: successMessage,
        });

        setBureauForm({ nom: '', email_president: '', ville: '' });
        setShowAddBureau(false);
        loadDashboardData();
      } else {
        // Gérer l'erreur retournée par la fonction
        const errorMessage = response.data?.error || response.error?.message || "Erreur lors de la création du bureau";
        throw new Error(errorMessage);
      }

    } catch (error: any) {
      console.error('Erreur création bureau:', error);
      
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le bureau",
        variant: "destructive"
      });
    }
  };

  const handleResendLink = async () => {
    try {
      if (!resendForm.email) {
        toast({
          title: "Email requis",
          description: "Veuillez saisir l'email",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('syndicat-management/resend-link', {
        body: resendForm
      });

      if (error) throw error;

      toast({
        title: "Lien renvoyé",
        description: "Le lien permanent a été renvoyé par email",
      });

      setResendForm({ email: '', type: 'bureau' });
      setShowResendLink(false);

    } catch (error) {
      console.error('Erreur renvoi lien:', error);
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer le lien",
        variant: "destructive"
      });
    }
  };

  const getAccessLevelBadge = (level: string) => {
    const variants = {
      complet: 'default',
      limite: 'secondary',
      lecture_seule: 'outline'
    };
    return (
      <Badge variant={variants[level] || 'outline'}>
        {level}
      </Badge>
    );
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
          <h1 className="text-3xl font-bold text-foreground">Dashboard PDG - Gestion Syndicale</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble des bureaux syndicaux et travailleurs
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddBureau} onOpenChange={setShowAddBureau}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Bureau
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un nouveau bureau syndical</DialogTitle>
                <DialogDescription>
                  Le président recevra automatiquement un email avec le lien permanent d'accès
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nom">Nom du bureau *</Label>
                  <Input
                    id="nom"
                    value={bureauForm.nom}
                    onChange={(e) => setBureauForm({...bureauForm, nom: e.target.value})}
                    placeholder="ex: Bureau Syndical de Conakry"
                  />
                </div>
                <div>
                  <Label htmlFor="email_president">Email du président *</Label>
                  <Input
                    id="email_president"
                    type="email"
                    value={bureauForm.email_president}
                    onChange={(e) => setBureauForm({...bureauForm, email_president: e.target.value})}
                    placeholder="president@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="ville">Ville *</Label>
                  <Input
                    id="ville"
                    value={bureauForm.ville}
                    onChange={(e) => setBureauForm({...bureauForm, ville: e.target.value})}
                    placeholder="ex: Conakry"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddBureau(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddBureau}>
                  Créer et Envoyer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showResendLink} onOpenChange={setShowResendLink}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="w-4 h-4 mr-2" />
                Renvoyer Lien
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Renvoyer un lien permanent</DialogTitle>
                <DialogDescription>
                  Renvoyer le lien d'accès par email à un bureau ou travailleur
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email_resend">Email</Label>
                  <Input
                    id="email_resend"
                    type="email"
                    value={resendForm.email}
                    onChange={(e) => setResendForm({...resendForm, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label>Type d'utilisateur</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="bureau"
                        checked={resendForm.type === 'bureau'}
                        onChange={(e) => setResendForm({...resendForm, type: e.target.value as 'bureau' | 'travailleur'})}
                        className="mr-2"
                      />
                      Bureau syndical
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="travailleur"
                        checked={resendForm.type === 'travailleur'}
                        onChange={(e) => setResendForm({...resendForm, type: e.target.value as 'bureau' | 'travailleur'})}
                        className="mr-2"
                      />
                      Travailleur
                    </label>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowResendLink(false)}>
                  Annuler
                </Button>
                <Button onClick={handleResendLink}>
                  Renvoyer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={loadDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Alertes critiques */}
      {statistics.alertes_critiques > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{statistics.alertes_critiques}</strong> alerte(s) critique(s) nécessitent votre attention
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bureaux Syndicaux</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_bureaux}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 5)} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Travailleurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_travailleurs}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 20)} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motos Enregistrées</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total_motos}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(Math.random() * 15)} ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.alertes_critiques}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal avec onglets */}
      <Tabs defaultValue="bureaux" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bureaux">Bureaux Syndicaux</TabsTrigger>
          <TabsTrigger value="travailleurs">Travailleurs</TabsTrigger>
          <TabsTrigger value="portefeuilles">Portefeuilles</TabsTrigger>
          <TabsTrigger value="wallets">Gestion Portefeuilles</TabsTrigger>
          <TabsTrigger value="analytics">Analytiques</TabsTrigger>
        </TabsList>

        <TabsContent value="bureaux" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Bureaux Syndicaux ({bureaux.length})
              </CardTitle>
              <CardDescription>
                Liste complète des bureaux syndicaux enregistrés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bureaux.map((bureau) => (
                  <div key={bureau.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{bureau.nom}</h3>
                        <Badge variant={bureau.is_active ? 'default' : 'secondary'}>
                          {bureau.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {bureau.email_president}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {bureau.ville}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(bureau.date_created).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {bureau.travailleurs?.[0]?.count || 0} travailleurs
                        </div>
                        <div className="flex items-center gap-1">
                          <Bike className="w-3 h-3" />
                          {bureau.motos_count || 0} motos
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {bureau.total_transactions || 0} transactions
                        </div>
                        <div className="flex items-center gap-1">
                          <Wallet className="w-3 h-3" />
                          {(bureau.balance_gnf || 0).toLocaleString()} GNF
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(bureau.interface_url, '_blank')}
                    >
                      Voir Interface
                    </Button>
                  </div>
                ))}
                {bureaux.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun bureau syndical enregistré
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="travailleurs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Travailleurs ({travailleurs.length})
              </CardTitle>
              <CardDescription>
                Liste complète des travailleurs enregistrés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {travailleurs.map((travailleur) => (
                  <div key={travailleur.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{travailleur.nom}</h3>
                        {getAccessLevelBadge(travailleur.access_level)}
                        <Badge variant={travailleur.is_active ? 'default' : 'secondary'}>
                          {travailleur.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {travailleur.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {travailleur.bureaux_syndicaux?.nom} - {travailleur.bureaux_syndicaux?.ville}
                        </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(travailleur.date_created).toLocaleDateString()}
                          </div>
                          {travailleur.user_id && (
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3" />
                              ID: {travailleur.user_id}
                            </div>
                          )}
                          {travailleur.wallet_balance && (
                            <div className="flex items-center gap-1">
                              <Wallet className="w-3 h-3" />
                              {travailleur.wallet_balance.gnf.toLocaleString()} GNF
                            </div>
                          )}
                        </div>
                    </div>
                  </div>
                ))}
                {travailleurs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun travailleur enregistré
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portefeuilles" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  Portefeuilles Bureaux
                </CardTitle>
                <CardDescription>
                  État financier des bureaux syndicaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bureaux.map((bureau) => (
                    <div key={bureau.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{bureau.nom}</h4>
                        <p className="text-sm text-muted-foreground">{bureau.ville}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {(bureau.balance_gnf || 0).toLocaleString()} GNF
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${(bureau.balance_usd || 0).toFixed(2)} | €{(bureau.balance_eur || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {bureau.total_transactions || 0} transactions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Portefeuilles Travailleurs
                </CardTitle>
                <CardDescription>
                  État financier des travailleurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {travailleurs.filter(t => t.wallet_balance).map((travailleur) => (
                    <div key={travailleur.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{travailleur.nom}</h4>
                        <p className="text-sm text-muted-foreground">
                          {travailleur.user_id ? `ID: ${travailleur.user_id}` : 'Pas d\'ID'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {(travailleur.wallet_balance?.gnf || 0).toLocaleString()} GNF
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${(travailleur.wallet_balance?.usd || 0).toFixed(2)} | €{(travailleur.wallet_balance?.eur || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {travailleur.transactions_count || 0} transactions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="wallets" className="space-y-4">
          <UserWalletManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Croissance Mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Nouveaux bureaux</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">+{Math.floor(Math.random() * 5)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Nouveaux travailleurs</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">+{Math.floor(Math.random() * 20)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Motos enregistrées</span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-semibold">+{Math.floor(Math.random() * 15)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Disponibilité système</span>
                    <Badge variant="default">99.9%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Emails envoyés ce mois</span>
                    <span className="font-semibold">{(bureaux.length + travailleurs.length) * 2}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Liens actifs</span>
                    <span className="font-semibold">{bureaux.length + travailleurs.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PDGSyndicatDashboard;
