import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, UserPlus, Settings, DollarSign, BarChart3 } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  can_create_sub_agent: boolean;
  is_active: boolean;
  created_at: string;
  sub_agents: SubAgent[];
}

interface SubAgent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  parent_agent_id: string;
}

interface AgentUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  creator_type: string;
  created_at: string;
}

interface Commission {
  id: string;
  amount: number;
  recipient_type: string;
  source_type: string;
  created_at: string;
}

export default function PDGAgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [users, setUsers] = useState<AgentUser[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [createAgentOpen, setCreateAgentOpen] = useState(false);
  const [commissionSettings, setCommissionSettings] = useState({
    baseCommission: 0.20,
    parentShare: 0.50,
  });

  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    phone: '',
    agentType: '',
    canCreateSubAgent: false,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load agents
      const { data, error } = await supabase.functions.invoke('agent-management', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      // Load users
      const usersResponse = await supabase.functions.invoke('agent-management', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Load commissions  
      const commissionsResponse = await supabase.functions.invoke('agent-management', {
        body: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setAgents(data?.agents || []);
      setUsers(usersResponse?.data?.users || []);
      setCommissions(commissionsResponse?.data?.commissions || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('agent-management?action=create-agent', {
        body: newAgent,
      });

      if (error) throw error;

      toast.success('Agent créé avec succès');
      setCreateAgentOpen(false);
      setNewAgent({ name: '', email: '', phone: '', agentType: '', canCreateSubAgent: false });
      loadDashboardData();
    } catch (error) {
      console.error('Error creating agent:', error);
      toast.error('Erreur lors de la création de l\'agent');
    }
  };

  const updateCommissionSettings = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('agent-management', {
        body: {
          action: 'update-commission-settings',
          base_commission: commissionSettings.baseCommission,
          parent_share: commissionSettings.parentShare,
        },
      });

      if (error) throw error;

      toast.success('Paramètres de commission mis à jour');
    } catch (error) {
      console.error('Error updating commission settings:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);
  const totalUsers = users.length;
  const activeAgents = agents.filter(a => a.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Agents</h1>
        <Dialog open={createAgentOpen} onOpenChange={setCreateAgentOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Créer un Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un Nouvel Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agentType">Type d'Agent</Label>
                <Input
                  id="agentType"
                  value={newAgent.agentType}
                  onChange={(e) => setNewAgent({ ...newAgent, agentType: e.target.value })}
                  placeholder="Ex: Standard, Premium, Régional..."
                />
              </div>
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="Nom de l'agent"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={newAgent.phone}
                  onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })}
                  placeholder="+224 xxx xxx xxx"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="canCreateSubAgent"
                  checked={newAgent.canCreateSubAgent}
                  onCheckedChange={(checked) => 
                    setNewAgent({ ...newAgent, canCreateSubAgent: checked })
                  }
                />
                <Label htmlFor="canCreateSubAgent">
                  Peut créer des sous-agents
                </Label>
              </div>
              <Button onClick={createAgent} className="w-full" disabled={!newAgent.name || !newAgent.email}>
                Créer l'Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Agents Actifs</p>
              <p className="text-2xl font-bold">{activeAgents}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <UserPlus className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Commissions Totales</p>
              <p className="text-2xl font-bold">{totalCommissions.toFixed(2)} GNF</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Settings className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Commission Base</p>
              <p className="text-2xl font-bold">{(commissionSettings.baseCommission * 100).toFixed(0)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4">
            {agents.map((agent) => (
              <Card key={agent.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.email}</p>
                      {agent.phone && (
                        <p className="text-sm text-gray-600">{agent.phone}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={agent.is_active ? "default" : "secondary"}>
                        {agent.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      {agent.can_create_sub_agent && (
                        <Badge variant="outline">Peut créer des sous-agents</Badge>
                      )}
                      <Badge variant="secondary">
                        {agent.sub_agents?.length || 0} sous-agents
                      </Badge>
                    </div>
                  </div>
                  
                  {agent.sub_agents && agent.sub_agents.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Sous-agents:</h4>
                      <div className="grid gap-2">
                        {agent.sub_agents.map((subAgent) => (
                          <div
                            key={subAgent.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="text-sm font-medium">{subAgent.name}</p>
                              <p className="text-xs text-gray-600">{subAgent.email}</p>
                            </div>
                            <Badge 
                              variant={subAgent.is_active ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {subAgent.is_active ? "Actif" : "Inactif"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tous les Utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nom</th>
                      <th className="text-left p-2">Contact</th>
                      <th className="text-left p-2">Créé par</th>
                      <th className="text-left p-2">Statut</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b">
                        <td className="p-2 font-medium">{user.name}</td>
                        <td className="p-2">
                          {user.email && <div className="text-xs">{user.email}</div>}
                          {user.phone && <div className="text-xs">{user.phone}</div>}
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">
                            {user.creator_type === 'agent' ? 'Agent' : 'Sous-agent'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge 
                            variant={user.status === 'active' ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Montant</th>
                      <th className="text-left p-2">Type de Bénéficiaire</th>
                      <th className="text-left p-2">Source</th>
                      <th className="text-left p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((commission) => (
                      <tr key={commission.id} className="border-b">
                        <td className="p-2 font-medium">
                          {commission.amount.toFixed(2)} GNF
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-xs">
                            {commission.recipient_type === 'agent' ? 'Agent' : 'Sous-agent'}
                          </Badge>
                        </td>
                        <td className="p-2 text-xs">{commission.source_type}</td>
                        <td className="p-2 text-xs">
                          {new Date(commission.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Commission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Commission de Base (%)</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={(commissionSettings.baseCommission * 100).toFixed(2)}
                    onChange={(e) =>
                      setCommissionSettings({
                        ...commissionSettings,
                        baseCommission: parseFloat(e.target.value) / 100,
                      })
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pourcentage de commission sur le revenu net de l'application
                </p>
              </div>

              <div>
                <Label>Part du Parent (%)</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={(commissionSettings.parentShare * 100).toFixed(2)}
                    onChange={(e) =>
                      setCommissionSettings({
                        ...commissionSettings,
                        parentShare: parseFloat(e.target.value) / 100,
                      })
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pourcentage de la commission totale attribuée à l'agent parent
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Exemple de Répartition</h4>
                <div className="text-xs space-y-1">
                  <p>
                    Pour une transaction de 1000 GNF avec commission base de{' '}
                    {(commissionSettings.baseCommission * 100).toFixed(1)}%:
                  </p>
                  <p>• Commission totale: {(1000 * commissionSettings.baseCommission).toFixed(0)} GNF</p>
                  <p>
                    • Part agent parent: {(1000 * commissionSettings.baseCommission * commissionSettings.parentShare).toFixed(0)} GNF
                  </p>
                  <p>
                    • Part sous-agent: {(1000 * commissionSettings.baseCommission * (1 - commissionSettings.parentShare)).toFixed(0)} GNF
                  </p>
                </div>
              </div>

              <Button onClick={updateCommissionSettings} className="w-full">
                Sauvegarder les Paramètres
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
