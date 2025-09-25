import React, { useState, useEffect } from 'react';
import SyndicatMotoRegistration from './SyndicatMotoRegistration';
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
import { 
  Bike, 
  Plus,
  Bell,
  MessageSquare,
  Building2,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  Users
} from 'lucide-react';

interface Moto {
  id: string;
  numero_serie: string;
  marque: string;
  modele: string;
  annee: number;
  statut: string;
  date_enregistrement: string;
}

interface TravailleurDashboardProps {
  travailleurToken: string;
}

const TravailleurDashboard: React.FC<TravailleurDashboardProps> = ({ travailleurToken }) => {
  const { toast } = useToast();
  const [motos, setMotos] = useState<Moto[]>([]);
  const [travailleurInfo, setTravailleurInfo] = useState<any>(null);
  const [bureauInfo, setBureauInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMoto, setShowAddMoto] = useState(false);

  // Formulaire moto
  const [motoForm, setMotoForm] = useState({
    numero_serie: '',
    marque: '',
    modele: '',
    annee: new Date().getFullYear()
  });

  useEffect(() => {
    loadTravailleurData();
  }, []);

  const loadTravailleurData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les informations du travailleur via le token
      const { data: travailleur } = await supabase
        .from('travailleurs')
        .select(`
          *,
          bureaux_syndicaux(*)
        `)
        .eq('token', travailleurToken)
        .single();

      if (travailleur) {
        setTravailleurInfo(travailleur);
        setBureauInfo(travailleur.bureaux_syndicaux);

        // Charger les motos du travailleur
        const { data: motosData } = await supabase
          .from('motos')
          .select('*')
          .eq('travailleur_id', travailleur.id)
          .order('date_enregistrement', { ascending: false });
        
        if (motosData) setMotos(motosData);
      }

    } catch (error) {
      console.error('Erreur chargement travailleur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoto = async () => {
    try {
      if (!motoForm.numero_serie || !motoForm.marque) {
        toast({
          title: "Champs requis",
          description: "Le numéro de série et la marque sont obligatoires",
          variant: "destructive"
        });
        return;
      }

      // Vérifier si le numéro de série existe déjà
      const { data: existingMoto } = await supabase
        .from('motos')
        .select('id')
        .eq('numero_serie', motoForm.numero_serie)
        .maybeSingle();

      if (existingMoto) {
        toast({
          title: "Numéro déjà utilisé",
          description: "Ce numéro de série est déjà enregistré",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('motos')
        .insert({
          travailleur_id: travailleurInfo.id,
          ...motoForm
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Moto enregistrée",
        description: `La moto ${motoForm.marque} ${motoForm.modele} a été enregistrée avec succès`,
      });

      setMotoForm({
        numero_serie: '',
        marque: '',
        modele: '',
        annee: new Date().getFullYear()
      });
      setShowAddMoto(false);
      loadTravailleurData();

    } catch (error) {
      console.error('Erreur ajout moto:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la moto",
        variant: "destructive"
      });
    }
  };

  const getAccessLevelInfo = (level: string) => {
    const config = {
      complet: {
        label: 'Accès Complet',
        description: 'Vous avez accès à toutes les fonctionnalités',
        color: 'text-green-600',
        icon: CheckCircle
      },
      limite: {
        label: 'Accès Limité',
        description: 'Accès aux fonctionnalités essentielles',
        color: 'text-blue-600',
        icon: Info
      },
      lecture_seule: {
        label: 'Lecture Seule',
        description: 'Consultation uniquement',
        color: 'text-gray-600',
        icon: AlertTriangle
      }
    };
    return config[level] || config.limite;
  };

  const getStatutBadge = (statut: string) => {
    const variants = {
      active: { variant: 'default', label: 'Active' },
      maintenance: { variant: 'secondary', label: 'En maintenance' },
      inactive: { variant: 'outline', label: 'Inactive' }
    };
    const config = variants[statut] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!travailleurInfo) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Token invalide ou compte non trouvé
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const accessInfo = getAccessLevelInfo(travailleurInfo.access_level);

  return (
    <div className="space-y-6">
      {/* En-tête avec informations personnelles */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bonjour {travailleurInfo.nom}
          </h1>
          <p className="text-muted-foreground mt-2">
            Interface Travailleur - {bureauInfo?.nom}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">{bureauInfo?.nom} - {bureauInfo?.ville}</span>
            </div>
            <div className="flex items-center gap-2">
              <accessInfo.icon className={`w-4 h-4 ${accessInfo.color}`} />
              <span className="text-sm">{accessInfo.label}</span>
            </div>
          </div>
        </div>
        
        {travailleurInfo.access_level !== 'lecture_seule' && (
          <Dialog open={showAddMoto} onOpenChange={setShowAddMoto}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Enregistrer Moto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enregistrer une nouvelle moto</DialogTitle>
                <DialogDescription>
                  Ajoutez les informations de votre moto pour l'enregistrement officiel
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="numero_serie">Numéro de série *</Label>
                  <Input
                    id="numero_serie"
                    value={motoForm.numero_serie}
                    onChange={(e) => setMotoForm({...motoForm, numero_serie: e.target.value})}
                    placeholder="ex: AB123456789"
                  />
                </div>
                <div>
                  <Label htmlFor="marque">Marque *</Label>
                  <Input
                    id="marque"
                    value={motoForm.marque}
                    onChange={(e) => setMotoForm({...motoForm, marque: e.target.value})}
                    placeholder="ex: Honda, Yamaha, Suzuki"
                  />
                </div>
                <div>
                  <Label htmlFor="modele">Modèle</Label>
                  <Input
                    id="modele"
                    value={motoForm.modele}
                    onChange={(e) => setMotoForm({...motoForm, modele: e.target.value})}
                    placeholder="ex: CB 125, XTZ 125"
                  />
                </div>
                <div>
                  <Label htmlFor="annee">Année</Label>
                  <Input
                    id="annee"
                    type="number"
                    min="1990"
                    max={new Date().getFullYear()}
                    value={motoForm.annee}
                    onChange={(e) => setMotoForm({...motoForm, annee: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddMoto(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddMoto}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Information sur le niveau d'accès */}
      <Alert>
        <accessInfo.icon className={`h-4 w-4 ${accessInfo.color}`} />
        <AlertDescription>
          <strong>{accessInfo.label}:</strong> {accessInfo.description}
        </AlertDescription>
      </Alert>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mes Motos</CardTitle>
            <Bike className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{motos.length}</div>
            <p className="text-xs text-muted-foreground">
              enregistrées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut Compte</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">Actif</div>
            <p className="text-xs text-muted-foreground">
              depuis {new Date(travailleurInfo.date_created).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              non lues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="motos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="motos">Mes Motos</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="profil">Mon Profil</TabsTrigger>
        </TabsList>

        <TabsContent value="motos" className="space-y-4">
          <SyndicatMotoRegistration 
            bureauToken={travailleurToken} 
            travailleurId={travailleurInfo?.id}
            readOnly={travailleurInfo?.access_level === 'lecture_seule'}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Centre de Notifications
              </CardTitle>
              <CardDescription>
                Messages et alertes importantes de votre bureau syndical
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Bienvenue!</strong> Votre compte a été activé avec succès. Vous pouvez maintenant enregistrer vos motos.
                  </AlertDescription>
                </Alert>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Rappel important:</strong> N'oubliez pas d'enregistrer toutes vos motos pour être en conformité avec le règlement syndical.
                  </AlertDescription>
                </Alert>

                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Vous êtes à jour avec toutes les notifications</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Mon Profil
              </CardTitle>
              <CardDescription>
                Informations personnelles et paramètres de compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nom complet</Label>
                    <p className="text-sm text-muted-foreground">{travailleurInfo.nom}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm text-muted-foreground">{travailleurInfo.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Téléphone</Label>
                    <p className="text-sm text-muted-foreground">{travailleurInfo.telephone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Niveau d'accès</Label>
                    <p className="text-sm text-muted-foreground">{accessInfo.label}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Bureau syndical</Label>
                    <p className="text-sm text-muted-foreground">{bureauInfo?.nom}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Membre depuis</Label>
                    <p className="text-sm text-muted-foreground">{new Date(travailleurInfo.date_created).toLocaleDateString()}</p>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Pour modifier vos informations personnelles, contactez votre bureau syndical ou utilisez le support technique.
                  </AlertDescription>
                </Alert>

                {travailleurInfo.access_level === 'complet' && (
                  <div className="pt-4">
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contacter le Bureau
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TravailleurDashboard;
