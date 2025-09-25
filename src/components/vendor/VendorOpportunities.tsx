import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  TrendingUp, 
  Plus, 
  Calendar, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  Clock,
  Target,
  Edit,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VendorOpportunitiesProps {
  userProfile: any;
}

interface Opportunity {
  id: string;
  title: string;
  client: string;
  email: string;
  phone: string;
  value: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close: string;
  description: string;
  created_at: string;
  last_activity: string;
}

export const VendorOpportunities: React.FC<VendorOpportunitiesProps> = ({ userProfile }) => {
  const { toast } = useToast();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isAddingOpportunity, setIsAddingOpportunity] = useState(false);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [newOpportunity, setNewOpportunity] = useState({
    title: '',
    client: '',
    email: '',
    phone: '',
    value: 0,
    stage: 'lead',
    probability: 10,
    expected_close: '',
    description: ''
  });

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = () => {
    // Données d'exemple pour la démo
    const mockOpportunities: Opportunity[] = [
      {
        id: '1',
        title: 'Contrat équipement bureau',
        client: 'Entreprise Alpha',
        email: 'contact@alpha.com',
        phone: '+224 123 456 789',
        value: 2500000,
        stage: 'proposal',
        probability: 70,
        expected_close: '2024-01-15',
        description: 'Fourniture complète d\'équipement de bureau pour leur nouvelle succursale',
        created_at: '2023-12-01',
        last_activity: '2023-12-15'
      },
      {
        id: '2',
        title: 'Formation logiciel',
        client: 'Société Beta',
        email: 'rh@beta.com',
        phone: '+224 987 654 321',
        value: 800000,
        stage: 'negotiation',
        probability: 85,
        expected_close: '2024-01-10',
        description: 'Formation de 20 employés sur notre solution logicielle',
        created_at: '2023-11-20',
        last_activity: '2023-12-14'
      },
      {
        id: '3',
        title: 'Maintenance annuelle',
        client: 'Gamma Industries',
        email: 'maintenance@gamma.com',
        phone: '+224 555 777 888',
        value: 1200000,
        stage: 'qualified',
        probability: 50,
        expected_close: '2024-02-01',
        description: 'Contrat de maintenance pour tous leurs équipements',
        created_at: '2023-12-10',
        last_activity: '2023-12-13'
      }
    ];
    
    setOpportunities(mockOpportunities);
  };

  const handleAddOpportunity = () => {
    const opportunity: Opportunity = {
      id: Date.now().toString(),
      ...newOpportunity,
      stage: newOpportunity.stage as any,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString()
    };

    setOpportunities([opportunity, ...opportunities]);
    
    toast({
      title: "Succès",
      description: "Opportunité ajoutée avec succès",
    });

    setIsAddingOpportunity(false);
    setNewOpportunity({
      title: '',
      client: '',
      email: '',
      phone: '',
      value: 0,
      stage: 'lead',
      probability: 10,
      expected_close: '',
      description: ''
    });
  };

  const updateOpportunityStage = (id: string, newStage: string) => {
    setOpportunities(opportunities.map(opp => 
      opp.id === id 
        ? { 
            ...opp, 
            stage: newStage as any,
            last_activity: new Date().toISOString(),
            probability: getDefaultProbability(newStage)
          }
        : opp
    ));
    
    toast({
      title: "Mise à jour",
      description: "Étape de l'opportunité mise à jour",
    });
  };

  const getDefaultProbability = (stage: string): number => {
    const probabilities: any = {
      'lead': 10,
      'qualified': 25,
      'proposal': 50,
      'negotiation': 75,
      'closed_won': 100,
      'closed_lost': 0
    };
    return probabilities[stage] || 10;
  };

  const getStageInfo = (stage: string) => {
    const stages: any = {
      'lead': { label: 'Lead', color: 'bg-gray-500', variant: 'secondary' },
      'qualified': { label: 'Qualifié', color: 'bg-blue-500', variant: 'default' },
      'proposal': { label: 'Proposition', color: 'bg-yellow-500', variant: 'secondary' },
      'negotiation': { label: 'Négociation', color: 'bg-orange-500', variant: 'secondary' },
      'closed_won': { label: 'Gagné', color: 'bg-green-500', variant: 'default' },
      'closed_lost': { label: 'Perdu', color: 'bg-red-500', variant: 'destructive' }
    };
    return stages[stage] || stages.lead;
  };

  const filteredOpportunities = selectedStage === 'all' 
    ? opportunities 
    : opportunities.filter(opp => opp.stage === selectedStage);

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);
  const wonDeals = opportunities.filter(opp => opp.stage === 'closed_won').length;

  return (
    <div className="space-y-6">
      {/* Statistiques du pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur totale</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toLocaleString()} GNF</div>
            <p className="text-xs text-muted-foreground">
              Pipeline complet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur pondérée</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(weightedValue).toLocaleString()} GNF</div>
            <p className="text-xs text-muted-foreground">
              Basé sur la probabilité
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunités</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{opportunities.length}</div>
            <p className="text-xs text-muted-foreground">
              En cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {opportunities.length > 0 ? Math.round((wonDeals / opportunities.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Affaires gagnées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header avec actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Pipeline des Opportunités</CardTitle>
              <CardDescription>
                Gérez vos opportunités de vente et suivez leur progression
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={selectedStage} onValueChange={setSelectedStage}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par étape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les étapes</SelectItem>
                  <SelectItem value="lead">Leads</SelectItem>
                  <SelectItem value="qualified">Qualifiés</SelectItem>
                  <SelectItem value="proposal">Propositions</SelectItem>
                  <SelectItem value="negotiation">Négociations</SelectItem>
                  <SelectItem value="closed_won">Gagnés</SelectItem>
                  <SelectItem value="closed_lost">Perdus</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isAddingOpportunity} onOpenChange={setIsAddingOpportunity}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle opportunité
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Ajouter une opportunité</DialogTitle>
                    <DialogDescription>
                      Créez une nouvelle opportunité de vente
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="title" className="text-right">Titre</Label>
                      <Input
                        id="title"
                        value={newOpportunity.title}
                        onChange={(e) => setNewOpportunity({...newOpportunity, title: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="client" className="text-right">Client</Label>
                      <Input
                        id="client"
                        value={newOpportunity.client}
                        onChange={(e) => setNewOpportunity({...newOpportunity, client: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newOpportunity.email}
                        onChange={(e) => setNewOpportunity({...newOpportunity, email: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="value" className="text-right">Valeur (GNF)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={newOpportunity.value}
                        onChange={(e) => setNewOpportunity({...newOpportunity, value: parseInt(e.target.value) || 0})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stage" className="text-right">Étape</Label>
                      <Select value={newOpportunity.stage} onValueChange={(value) => setNewOpportunity({...newOpportunity, stage: value, probability: getDefaultProbability(value)})}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="qualified">Qualifié</SelectItem>
                          <SelectItem value="proposal">Proposition</SelectItem>
                          <SelectItem value="negotiation">Négociation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="expected_close" className="text-right">Clôture prévue</Label>
                      <Input
                        id="expected_close"
                        type="date"
                        value={newOpportunity.expected_close}
                        onChange={(e) => setNewOpportunity({...newOpportunity, expected_close: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Textarea
                        id="description"
                        value={newOpportunity.description}
                        onChange={(e) => setNewOpportunity({...newOpportunity, description: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddingOpportunity(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddOpportunity}>
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Liste des opportunités */}
      <div className="space-y-4">
        {filteredOpportunities.map((opportunity) => {
          const stageInfo = getStageInfo(opportunity.stage);
          
          return (
            <Card key={opportunity.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{opportunity.title}</h3>
                      <Badge variant={stageInfo.variant as any}>{stageInfo.label}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {opportunity.client}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {opportunity.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {opportunity.value.toLocaleString()} GNF
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Clôture: {new Date(opportunity.expected_close).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Probabilité de réussite</span>
                        <span>{opportunity.probability}%</span>
                      </div>
                      <Progress value={opportunity.probability} className="h-2" />
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {opportunity.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Créé le {new Date(opportunity.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Dernière activité: {new Date(opportunity.last_activity).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <Select 
                      value={opportunity.stage} 
                      onValueChange={(value) => updateOpportunityStage(opportunity.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="qualified">Qualifié</SelectItem>
                        <SelectItem value="proposal">Proposition</SelectItem>
                        <SelectItem value="negotiation">Négociation</SelectItem>
                        <SelectItem value="closed_won">Gagné</SelectItem>
                        <SelectItem value="closed_lost">Perdu</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredOpportunities.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune opportunité trouvée</h3>
              <p className="text-muted-foreground mb-4">
                {selectedStage === 'all' 
                  ? 'Commencez par ajouter vos premières opportunités de vente.'
                  : `Aucune opportunité dans l'étape sélectionnée.`
                }
              </p>
              <Button onClick={() => setIsAddingOpportunity(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une opportunité
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
