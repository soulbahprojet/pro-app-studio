import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SyndicatWorkerTable from './SyndicatWorkerTable';
import SyndicatCriticalAlerts from './SyndicatCriticalAlerts';
import { 
  Users, 
  MessageSquare,
  Bell,
  Shield,
  AlertTriangle
} from 'lucide-react';

interface BureauSyndicatDashboardProps {
  bureauToken: string;
}

const BureauSyndicatDashboard: React.FC<BureauSyndicatDashboardProps> = ({ bureauToken }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [showTechSupport, setShowTechSupport] = useState(false);
  const [bureauStats, setBureauStats] = useState({
    totalTravailleurs: 0,
    travailleursActifs: 0,
    alertesCritiques: 0
  });

  const [supportForm, setSupportForm] = useState({
    message: '',
    contact_method: 'email' as 'sms' | 'call' | 'email'
  });

  useEffect(() => {
    loadBureauStats();
  }, []);

  const loadBureauStats = async () => {
    try {
      setLoading(true);
      
      const { data: bureau } = await supabase
        .from('bureaux_syndicaux')
        .select('id, nom')
        .eq('token', bureauToken)
        .single();

      if (bureau) {
        const { data: statsData } = await supabase.functions.invoke('syndicat-management/get-statistics', {
          body: { bureau_id: bureau.id }
        });
        
        if (statsData) {
          setBureauStats({
            totalTravailleurs: statsData.total_travailleurs || 0,
            travailleursActifs: statsData.travailleurs_actifs || 0,
            alertesCritiques: statsData.alertes_critiques || 0
          });
        }
      }

    } catch (error) {
      console.error('Erreur chargement stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactTechnique = async () => {
    try {
      if (!supportForm.message) {
        toast({
          title: "Message requis",
          description: "Veuillez saisir votre message",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('communications_technique')
        .insert({
          sender_type: 'bureau_syndical',
          sender_id: bureauToken,
          message: supportForm.message,
          contact_method: supportForm.contact_method
        });

      if (error) throw error;

      toast({
        title: "Message envoyé",
        description: "Votre demande a été transmise à l'équipe technique",
      });

      setSupportForm({ message: '', contact_method: 'email' });
      setShowTechSupport(false);

    } catch (error) {
      console.error('Erreur contact technique:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
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
          <h1 className="text-3xl font-bold text-foreground">Bureau Syndical - Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Gestion de vos travailleurs et communications
          </p>
        </div>
        
        <Dialog open={showTechSupport} onOpenChange={setShowTechSupport}>
          <Button variant="outline" onClick={() => setShowTechSupport(true)}>
            <MessageSquare className="w-4 h-4 mr-2" />
            Support Technique
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contacter l'équipe technique</DialogTitle>
              <DialogDescription>
                Décrivez votre problème ou votre demande d'assistance
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">Message *</Label>
                <textarea
                  id="message"
                  className="w-full min-h-[100px] p-3 border border-input rounded-md"
                  value={supportForm.message}
                  onChange={(e) => setSupportForm({...supportForm, message: e.target.value})}
                  placeholder="Décrivez votre problème ou question..."
                />
              </div>
              <div>
                <Label htmlFor="contact_method">Méthode de contact préférée</Label>
                <Select value={supportForm.contact_method} onValueChange={(value) => setSupportForm({...supportForm, contact_method: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="call">Appel téléphonique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTechSupport(false)}>
                Annuler
              </Button>
              <Button onClick={handleContactTechnique}>
                Envoyer Demande
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Travailleurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{bureauStats.travailleursActifs}</div>
            <p className="text-xs text-blue-600">
              sur {bureauStats.totalTravailleurs} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Alertes Critiques</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">{bureauStats.alertesCritiques}</div>
            <p className="text-xs text-orange-600">
              nécessitent attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Système</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-700">Opérationnel</div>
            <p className="text-xs text-green-600">
              toutes fonctions actives
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu principal */}
      <Tabs defaultValue="travailleurs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="travailleurs" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Travailleurs
          </TabsTrigger>
          <TabsTrigger value="alertes" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alertes Critiques
          </TabsTrigger>
          <TabsTrigger value="support" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="travailleurs" className="space-y-4">
          <SyndicatWorkerTable bureauToken={bureauToken} />
        </TabsContent>

        <TabsContent value="alertes" className="space-y-4">
          <SyndicatCriticalAlerts 
            bureauToken={bureauToken} 
            destinataireType="bureau_syndical" 
          />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Support Technique
              </CardTitle>
              <CardDescription>
                Contactez l'équipe technique pour assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowTechSupport(true)}
                className="w-full"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contacter le Support
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BureauSyndicatDashboard;
