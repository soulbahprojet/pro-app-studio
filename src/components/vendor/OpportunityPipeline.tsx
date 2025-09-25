import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Target, DollarSign, Calendar, Phone, Mail, User } from 'lucide-react';

interface Opportunity {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  value: number;
  probability: number;
  stage: 'prospect' | 'contact' | 'proposition' | 'negociation' | 'closing' | 'won' | 'lost';
  next_action: string;
  next_action_date: string;
  created_at: string;
  updated_at: string;
}

const stages = [
  { id: 'prospect', label: 'Prospect', color: 'bg-gray-500' },
  { id: 'contact', label: 'Contact initial', color: 'bg-blue-500' },
  { id: 'proposition', label: 'Proposition', color: 'bg-yellow-500' },
  { id: 'negociation', label: 'Négociation', color: 'bg-orange-500' },
  { id: 'closing', label: 'Finalisation', color: 'bg-purple-500' },
  { id: 'won', label: 'Gagné', color: 'bg-green-500' },
  { id: 'lost', label: 'Perdu', color: 'bg-red-500' }
];

export default function OpportunityPipeline() {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    value: 0,
    probability: 50,
    stage: 'prospect' as const,
    next_action: '',
    next_action_date: ''
  });

  // Simulation de données pour la démonstration
  useEffect(() => {
    const mockOpportunities: Opportunity[] = [
      {
        id: '1',
        client_name: 'Société ABC',
        client_email: 'contact@abc.com',
        client_phone: '+224 123 456 789',
        value: 2500000,
        probability: 75,
        stage: 'negociation',
        next_action: 'Présentation finale',
        next_action_date: '2024-01-15',
        created_at: '2024-01-01',
        updated_at: '2024-01-10'
      },
      {
        id: '2',
        client_name: 'Client XYZ',
        client_email: 'info@xyz.com',
        client_phone: '+224 987 654 321',
        value: 1800000,
        probability: 50,
        stage: 'proposition',
        next_action: 'Envoi devis détaillé',
        next_action_date: '2024-01-12',
        created_at: '2024-01-05',
        updated_at: '2024-01-08'
      }
    ];
    
    setOpportunities(mockOpportunities);
    setLoading(false);
  }, []);

  const createOpportunity = async () => {
    try {
      const newId = Date.now().toString();
      const opportunity = {
        ...newOpportunity,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setOpportunities([opportunity, ...opportunities]);
      toast.success('Opportunité créée avec succès');
      setShowCreateModal(false);
      setNewOpportunity({
        client_name: '',
        client_email: '',
        client_phone: '',
        value: 0,
        probability: 50,
        stage: 'prospect',
        next_action: '',
        next_action_date: ''
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de l\'opportunité');
    }
  };

  const updateStage = async (opportunityId: string, newStage: string) => {
    try {
      setOpportunities(prevOpportunities =>
        prevOpportunities.map(opp =>
          opp.id === opportunityId
            ? { ...opp, stage: newStage as any, updated_at: new Date().toISOString() }
            : opp
        )
      );
      toast.success('Étape mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getOpportunitiesByStage = (stage: string) => {
    return opportunities.filter(opp => opp.stage === stage);
  };

  const getTotalValue = () => {
    return opportunities.reduce((total, opp) => total + (opp.value * opp.probability / 100), 0);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Pipeline des opportunités</h2>
          <p className="text-muted-foreground">
            Valeur totale pondérée: {getTotalValue().toLocaleString()} GNF
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle opportunité
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle opportunité</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nom du client</label>
                <Input
                  value={newOpportunity.client_name}
                  onChange={(e) => setNewOpportunity({...newOpportunity, client_name: e.target.value})}
                  placeholder="Nom du client"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={newOpportunity.client_email}
                  onChange={(e) => setNewOpportunity({...newOpportunity, client_email: e.target.value})}
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Téléphone</label>
                <Input
                  value={newOpportunity.client_phone}
                  onChange={(e) => setNewOpportunity({...newOpportunity, client_phone: e.target.value})}
                  placeholder="+224..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Valeur estimée (GNF)</label>
                <Input
                  value={newOpportunity.value}
                  onChange={(e) => setNewOpportunity({...newOpportunity, value: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                  type="number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Probabilité (%)</label>
                <Input
                  value={newOpportunity.probability}
                  onChange={(e) => setNewOpportunity({...newOpportunity, probability: parseInt(e.target.value) || 0})}
                  placeholder="50"
                  type="number"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prochaine action</label>
                <Textarea
                  value={newOpportunity.next_action}
                  onChange={(e) => setNewOpportunity({...newOpportunity, next_action: e.target.value})}
                  placeholder="Appeler le client..."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date de la prochaine action</label>
                <Input
                  value={newOpportunity.next_action_date}
                  onChange={(e) => setNewOpportunity({...newOpportunity, next_action_date: e.target.value})}
                  type="date"
                />
              </div>
              <Button onClick={createOpportunity} className="w-full">
                Créer l'opportunité
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {stages.map((stage) => {
          const stageOpportunities = getOpportunitiesByStage(stage.id);
          const stageValue = stageOpportunities.reduce((total, opp) => total + opp.value, 0);
          
          return (
            <Card key={stage.id} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className={`inline-block w-3 h-3 rounded-full ${stage.color} mr-2`}></span>
                  {stage.label}
                  <Badge variant="outline">{stageOpportunities.length}</Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {stageValue.toLocaleString()} GNF
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageOpportunities.map((opportunity) => (
                  <Card key={opportunity.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{opportunity.client_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {opportunity.probability}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        {opportunity.value.toLocaleString()} GNF
                      </div>
                      {opportunity.client_email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {opportunity.client_email}
                        </div>
                      )}
                      {opportunity.next_action && (
                        <div className="text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {opportunity.next_action}
                        </div>
                      )}
                      <Select
                        value={opportunity.stage}
                        onValueChange={(newStage) => updateStage(opportunity.id, newStage)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stages.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
