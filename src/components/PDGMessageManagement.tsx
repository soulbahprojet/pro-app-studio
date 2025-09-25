import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { MessageSquare, Search, Eye, Reply, Archive } from "lucide-react";

interface Conversation {
  id: string;
  client_id: string;
  seller_id: string | null;
  support_id: string | null;
  subject: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  client?: {
    email: string;
    full_name: string;
    readable_id: string;
  };
  seller?: {
    email: string;
    full_name: string;
    readable_id: string;
  };
  message_count?: number;
  last_message?: string;
}

const PDGMessageManagement = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        const conversationsWithUsers = await Promise.all(
          data.map(async (conv: any) => {
            const [clientData, sellerData, messageData] = await Promise.all([
              supabase
                .from('profiles')
                .select('email, full_name, readable_id')
                .eq('user_id', conv.client_id)
                .single(),
              conv.seller_id ? supabase
                .from('profiles')
                .select('email, full_name, readable_id')
                .eq('user_id', conv.seller_id)
                .single() : { data: null },
              supabase
                .from('messages')
                .select('message')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single()
            ]);

            return {
              ...conv,
              client: clientData.data,
              seller: sellerData.data,
              last_message: messageData.data?.message || 'Aucun message',
              message_count: await getMessageCount(conv.id)
            };
          })
        );
        
        setConversations(conversationsWithUsers);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMessageCount = async (conversationId: string) => {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);
    return count || 0;
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.seller?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    const matchesType = typeFilter === "all" || 
                       (typeFilter === "support" && !conv.seller_id) ||
                       (typeFilter === "business" && conv.seller_id);
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalConversations = conversations.length;
  const activeConversations = conversations.filter(c => c.status === 'active').length;
  const supportConversations = conversations.filter(c => !c.seller_id).length;
  const businessConversations = conversations.filter(c => c.seller_id).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <MessageSquare className="h-8 w-8 animate-pulse text-primary" />
        <span className="ml-2">Chargement des conversations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Gestion des Messages
          </CardTitle>
          <CardDescription>
            Gérez toutes les conversations et messages de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                  <p className="text-2xl font-bold text-blue-600">{totalConversations}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Actives</p>
                  <p className="text-2xl font-bold text-green-600">{activeConversations}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Support</p>
                  <p className="text-2xl font-bold text-yellow-600">{supportConversations}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Business</p>
                  <p className="text-2xl font-bold text-purple-600">{businessConversations}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par sujet ou participant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actives</SelectItem>
                <SelectItem value="closed">Fermées</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table des conversations */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sujet</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConversations.map((conversation) => (
                <TableRow key={conversation.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{conversation.subject || 'Sans sujet'}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{conversation.last_message}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>
                        <span className="text-xs text-gray-500">Client:</span>
                        <p className="text-sm font-medium">{conversation.client?.full_name || 'N/A'}</p>
                      </div>
                      {conversation.seller && (
                        <div>
                          <span className="text-xs text-gray-500">Vendeur:</span>
                          <p className="text-sm font-medium">{conversation.seller.full_name}</p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline">
                      {conversation.message_count}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={conversation.seller_id ? 'default' : 'secondary'}
                    >
                      {conversation.seller_id ? 'Business' : 'Support'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        conversation.status === 'active' ? 'default' :
                        conversation.status === 'closed' ? 'destructive' : 'secondary'
                      }
                    >
                      {conversation.status === 'active' ? 'Active' :
                       conversation.status === 'closed' ? 'Fermée' : 'En attente'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(conversation.updated_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Reply className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredConversations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune conversation trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDGMessageManagement;
