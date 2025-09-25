import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bike, 
  Plus,
  Settings
} from 'lucide-react';

interface Moto {
  id: string;
  numero_serie: string;
  marque: string;
  modele: string;
  annee: number;
  statut: string;
  date_enregistrement: string;
  travailleur?: {
    nom: string;
    email: string;
  };
}

interface SyndicatMotoRegistrationProps {
  bureauToken: string;
  travailleurId?: string;
  readOnly?: boolean;
}

const SyndicatMotoRegistration: React.FC<SyndicatMotoRegistrationProps> = ({ 
  bureauToken, 
  travailleurId,
  readOnly = false 
}) => {
  const { toast } = useToast();
  const [motos, setMotos] = useState<Moto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMoto, setShowAddMoto] = useState(false);

  const [motoForm, setMotoForm] = useState({
    numero_serie: '',
    marque: '',
    modele: '',
    annee: new Date().getFullYear()
  });

  useEffect(() => {
    loadMotosData();
  }, []);

  const loadMotosData = async () => {
    try {
      setLoading(true);
      
      // Si travailleurId spécifique, charger ses motos seulement
      if (travailleurId) {
        const { data: motosData } = await supabase
          .from('motos')
          .select(`
            *,
            travailleurs(nom, email)
          `)
          .eq('travailleur_id', travailleurId)
          .order('date_enregistrement', { ascending: false });
        
        if (motosData) setMotos(motosData);
      } else {
        // Sinon, charger toutes les motos du bureau
        const { data: bureau } = await supabase
          .from('bureaux_syndicaux')
          .select('id')
          .eq('token', bureauToken)
          .single();

        if (bureau) {
          const { data: motosData } = await supabase
            .from('motos')
            .select(`
              *,
              travailleurs!inner(nom, email, bureau_id)
            `)
            .eq('travailleurs.bureau_id', bureau.id)
            .order('date_enregistrement', { ascending: false });
          
          if (motosData) setMotos(motosData);
        }
      }

    } catch (error) {
      console.error('Erreur chargement motos:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
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
          travailleur_id: travailleurId,
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
      loadMotosData();

    } catch (error) {
      console.error('Erreur ajout moto:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la moto",
        variant: "destructive"
      });
    }
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bike className="w-5 h-5" />
              {travailleurId ? 'Mes Motos' : 'Enregistrement des Motos'} ({motos.length})
            </CardTitle>
            <CardDescription>
              {travailleurId 
                ? 'Liste de vos motos enregistrées auprès du bureau syndical'
                : 'Gestion des motos enregistrées dans le syndicat'
              }
            </CardDescription>
          </div>
          
          {!readOnly && travailleurId && (
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
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {motos.map((moto) => (
            <div key={moto.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{moto.marque} {moto.modele}</h3>
                  {getStatutBadge(moto.statut)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span><strong>N° Série:</strong> {moto.numero_serie}</span>
                  <span><strong>Année:</strong> {moto.annee}</span>
                  {moto.travailleur && <span><strong>Propriétaire:</strong> {moto.travailleur.nom}</span>}
                  <span><strong>Enregistrée le:</strong> {new Date(moto.date_enregistrement).toLocaleDateString()}</span>
                </div>
              </div>
              {!readOnly && (
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
              )}
            </div>
          ))}
          
          {motos.length === 0 && (
            <div className="text-center py-8">
              <Bike className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {travailleurId 
                  ? 'Aucune moto enregistrée pour le moment'
                  : 'Aucune moto enregistrée dans ce bureau syndical'
                }
              </p>
              {!readOnly && travailleurId && (
                <Button onClick={() => setShowAddMoto(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Enregistrer ma première moto
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SyndicatMotoRegistration;