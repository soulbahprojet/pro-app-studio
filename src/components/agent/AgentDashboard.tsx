import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, UserPlus, DollarSign, Copy, Smartphone, Monitor } from 'lucide-react';

interface AgentUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  creator_type: string;
  invite_token?: string;
  created_at: string;
}

interface SubAgent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
}

interface Commission {
  id: string;
  amount: number;
  source_type: string;
  created_at: string;
}

interface AgentDashboardProps {
  agentId: string;
  canCreateSubAgent: boolean;
}

export default function AgentDashboard({ agentId, canCreateSubAgent }: AgentDashboardProps) {
  const [users, setUsers] = useState<AgentUser[]>([]);
  const [subAgents, setSubAgents] = useState<SubAgent[]>([]);  
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createSubAgentOpen, setCreateSubAgentOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'client',
  });

  const [newSubAgent, setNewSubAgent] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadDashboardData();
  }, [agentId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load users created by this agent
      const usersResponse = await supabase.functions.invoke('agent-management', {
        body: {
          action: 'get-users',
          creatorId: agentId,
          creatorType: 'agent',
        },
      });

      // Load sub-agents created by this agent
      const subAgentsResponse = await supabase.functions.invoke('agent-management', {
        body: {
          action: 'get-sub-agents',
          parentAgentId: agentId,
        },
      });

      // Load commissions for this agent
      const commissionsResponse = await supabase.functions.invoke('agent-management', {
        body: {
          action: 'get-commissions',
          recipientId: agentId,
          recipientType: 'agent',
        },
      });

      setUsers(usersResponse.data?.users || []);
      setSubAgents(subAgentsResponse.data?.subAgents || []);
      setCommissions(commissionsResponse.data?.commissions || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('agent-management', {
        body: {
          action: 'create-user',
          ...newUser,
          creatorId: agentId,
          creatorType: 'agent',
        },
      });

      if (error) throw error;

      toast.success('Utilisateur créé avec succès');
      if (data.inviteLink) {
        navigator.clipboard.writeText(data.inviteLink);
        toast.success('Lien d\'invitation copié dans le presse-papiers');
      }
      
      setCreateUserOpen(false);
      setNewUser({ name: '', email: '', phone: '', userType: 'client' });
      loadDashboardData();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Erreur lors de la création de l\'utilisateur');
    }
  };

  const createSubAgent = async () => {
    if (!canCreateSubAgent) {
      toast.error('Vous n\'avez pas la permission de créer des sous-agents');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('agent-management', {
        body: {
          action: 'create-sub-agent',
          ...newSubAgent,
          parentAgentId: agentId,
        },
      });

      if (error) throw error;

      toast.success('Sous-agent créé avec succès');
      setCreateSubAgentOpen(false);
      setNewSubAgent({ name: '', email: '', phone: '' });
      loadDashboardData();
    } catch (error) {
      console.error('Error creating sub-agent:', error);
      toast.error('Erreur lors de la création du sous-agent');
    }
  };

  const copyInviteLink = (token: string) => {
    const inviteLink = `https://10e539c2-bff3-4915-8cfd-e4213339deb6.lovableproject.com/invite/${token}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Lien d\'invitation copié');
  };

  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);
  const activeUsers = users.filter(u => u.status === 'active').length;
  const pendingUsers = users.filter(u => u.status === 'invited').length;

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
        <h1 className="text-3xl font-bold">Tableau de Bord Agent</h1>
        <div className="flex space-x-2">
          <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Créer Utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un Nouvel Utilisateur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Nom de l'utilisateur"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone (optionnel)</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="+224 xxx xxx xxx"
                  />
                </div>
                <div>
                  <Label htmlFor="userType">Type d'utilisateur</Label>
                  <Select
                    value={newUser.userType}
                    onValueChange={(value) => setNewUser({ ...newUser, userType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="seller">Vendeur</SelectItem>
                      <SelectItem value="courier">Livreur</SelectItem>
                      <SelectItem value="taxi_moto">Moto Taxi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createUser} className="w-full">
                  Créer l'Utilisateur
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {canCreateSubAgent && (
            <Dialog open={createSubAgentOpen} onOpenChange={setCreateSubAgentOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Créer Sous-agent
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un Sous-agent</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="subAgentName">Nom</Label>
                    <Input
                      id="subAgentName"
                      value={newSubAgent.name}
                      onChange={(e) => setNewSubAgent({ ...newSubAgent, name: e.target.value })}
                      placeholder="Nom du sous-agent"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subAgentEmail">Email</Label>
                    <Input
                      id="subAgentEmail"
                      type="email"
                      value={newSubAgent.email}
                      onChange={(e) => setNewSubAgent({ ...newSubAgent, email: e.target.value })}
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subAgentPhone">Téléphone</Label>
                    <Input
                      id="subAgentPhone"
                      value={newSubAgent.phone}
                      onChange={(e) => setNewSubAgent({ ...newSubAgent, phone: e.target.value })}
                      placeholder="+224 xxx xxx xxx"
                    />
                  </div>
                  <Button onClick={createSubAgent} className="w-full">
                    Créer le Sous-agent
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs Actifs</p>
              <p className="text-2xl font-bold">{activeUsers}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <UserPlus className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En Attente</p>
              <p className="text-2xl font-bold">{pendingUsers}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Commissions Gagnées</p>
              <p className="text-2xl font-bold">{totalCommissions.toFixed(2)} GNF</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sous-agents</p>
              <p className="text-2xl font-bold">{subAgents.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Mes Utilisateurs</TabsTrigger>
          <TabsTrigger value="subagents">Mes Sous-agents</TabsTrigger>
          <TabsTrigger value="commissions">Mes Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs Créés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      {user.email && <p className="text-sm text-gray-600">{user.email}</p>}
                      {user.phone && <p className="text-sm text-gray-600">{user.phone}</p>}
                      <p className="text-xs text-gray-500">
                        Créé le {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={user.status === 'active' ? "default" : "secondary"}
                      >
                        {user.status === 'active' ? 'Actif' : 'En attente'}
                      </Badge>
                      {user.status === 'invited' && user.invite_token && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyInviteLink(user.invite_token!)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copier lien
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Aucun utilisateur créé pour le moment
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subagents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mes Sous-agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subAgents.map((subAgent) => (
                  <div
                    key={subAgent.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{subAgent.name}</h3>
                      <p className="text-sm text-gray-600">{subAgent.email}</p>
                      {subAgent.phone && (
                        <p className="text-sm text-gray-600">{subAgent.phone}</p>
                      )}
                    </div>
                    <Badge variant={subAgent.is_active ? "default" : "secondary"}>
                      {subAgent.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                ))}
                {subAgents.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    {canCreateSubAgent 
                      ? "Aucun sous-agent créé pour le moment"
                      : "Vous n'avez pas la permission de créer des sous-agents"
                    }
                  </p>
                )}
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
              <div className="space-y-4">
                {commissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{commission.amount.toFixed(2)} GNF</p>
                      <p className="text-sm text-gray-600">Source: {commission.source_type}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(commission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">Commission</Badge>
                  </div>
                ))}
                {commissions.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Aucune commission reçue pour le moment
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
