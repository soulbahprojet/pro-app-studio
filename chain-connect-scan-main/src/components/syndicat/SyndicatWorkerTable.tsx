import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Plus,
  Phone,
  Settings,
  Shield,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Travailleur {
  id: string;
  nom: string;
  email: string;
  telephone: string;
  access_level: 'complet' | 'limite' | 'lecture_seule';
  is_active: boolean;
  date_created: string;
}

interface SyndicatWorkerTableProps {
  bureauToken: string;
}

const SyndicatWorkerTable: React.FC<SyndicatWorkerTableProps> = ({ bureauToken }) => {
  const { toast } = useToast();
  const [travailleurs, setTravailleurs] = useState<Travailleur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTravailleur, setShowAddTravailleur] = useState(false);

  const [travailleurForm, setTravailleurForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    access_level: 'limite' as 'complet' | 'limite' | 'lecture_seule'
  });

  useEffect(() => {
    loadTravailleursData();
  }, []);

  const loadTravailleursData = async () => {
    try {
      setLoading(true);
      
      const { data: bureau } = await supabase
        .from('bureaux_syndicaux')
        .select('id, nom')
        .eq('token', bureauToken)
        .single();

      if (bureau) {
        const { data: travailleursData } = await supabase.functions.invoke('syndicat-management/get-travailleurs', {
          body: { bureau_id: bureau.id }
        });
        
        if (travailleursData) setTravailleurs(travailleursData);
      }

    } catch (error) {
      console.error('Erreur chargement travailleurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTravailleur = async () => {
    try {
      if (!travailleurForm.nom || !travailleurForm.email) {
        toast({
          title: "Champs requis",
          description: "Le nom et l'email sont obligatoires",
          variant: "destructive"
        });
        return;
      }

      const { data: bureau } = await supabase
        .from('bureaux_syndicaux')
        .select('id')
        .eq('token', bureauToken)
        .single();

      if (!bureau) {
        throw new Error('Bureau non trouvé');
      }

      const { data, error } = await supabase.functions.invoke('syndicat-management/add-travailleur', {
        body: {
          bureau_id: bureau.id,
          ...travailleurForm
        }
      });

      if (error) throw error;

      toast({
        title: "Travailleur ajouté",
        description: `${travailleurForm.nom} a été ajouté et l'email d'activation envoyé`,
      });

      setTravailleurForm({
        nom: '',
        email: '',
        telephone: '',
        access_level: 'limite'
      });
      setShowAddTravailleur(false);
      loadTravailleursData();

    } catch (error) {
      console.error('Erreur ajout travailleur:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le travailleur",
        variant: "destructive"
      });
    }
  };

  const getAccessLevelBadge = (level: string) => {
    const config = {
      complet: { variant: 'default', label: 'Accès Complet', icon: CheckCircle },
      limite: { variant: 'secondary', label: 'Accès Limité', icon: Shield },
      lecture_seule: { variant: 'outline', label: 'Lecture Seule', icon: Clock }
    };
    
    const { variant, label, icon: Icon } = config[level] || config.limite;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestion des Travailleurs ({travailleurs.length})
            </CardTitle>
            <CardDescription>
              Liste et gestion de vos travailleurs enregistrés
            </CardDescription>
          </div>
          
          <Dialog open={showAddTravailleur} onOpenChange={setShowAddTravailleur}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter Travailleur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau travailleur</DialogTitle>
                <DialogDescription>
                  Le travailleur recevra automatiquement un email avec son lien d'accès permanent
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nom">Nom complet *</Label>
                  <Input
                    id="nom"
                    value={travailleurForm.nom}
                    onChange={(e) => setTravailleurForm({...travailleurForm, nom: e.target.value})}
                    placeholder="ex: Amadou Diallo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={travailleurForm.email}
                    onChange={(e) => setTravailleurForm({...travailleurForm, email: e.target.value})}
                    placeholder="amadou@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    value={travailleurForm.telephone}
                    onChange={(e) => setTravailleurForm({...travailleurForm, telephone: e.target.value})}
                    placeholder="+224 xx xx xx xx"
                  />
                </div>
                <div>
                  <Label htmlFor="access_level">Niveau d'accès</Label>
                  <Select value={travailleurForm.access_level} onValueChange={(value) => setTravailleurForm({...travailleurForm, access_level: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lecture_seule">Lecture seule</SelectItem>
                      <SelectItem value="limite">Accès limité</SelectItem>
                      <SelectItem value="complet">Accès complet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddTravailleur(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddTravailleur}>
                  Ajouter et Envoyer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
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
                  <span>{travailleur.email}</span>
                  {travailleur.telephone && <span>{travailleur.telephone}</span>}
                  <span>Ajouté le {new Date(travailleur.date_created).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Permissions
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-1" />
                  Contacter
                </Button>
              </div>
            </div>
          ))}
          {travailleurs.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Aucun travailleur enregistré pour le moment
              </p>
              <Button onClick={() => setShowAddTravailleur(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter votre premier travailleur
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyndicatWorkerTable;