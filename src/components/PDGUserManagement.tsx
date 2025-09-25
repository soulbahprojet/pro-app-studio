import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Users, Search, UserCheck, UserX, Shield, Mail } from "lucide-react";

interface User {
  id: string;
  readable_id: string;
  email: string;
  full_name: string;
  role: string;
  phone?: string;
  country?: string;
  kyc_status?: string;
  is_verified: boolean;
  created_at: string;
}

const PDGUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des utilisateurs.",
          variant: "destructive",
        });
        return;
      }

      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.readable_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier le statut de l'utilisateur.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Succès",
        description: `Utilisateur ${!currentStatus ? 'activé' : 'suspendu'} avec succès.`,
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const sendNotificationToUser = async (userId: string, userEmail: string) => {
    try {
      // Ici, vous pouvez implémenter l'envoi de notification
      toast({
        title: "Notification envoyée",
        description: `Notification envoyée à ${userEmail}`,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'seller': return 'default';
      case 'courier': return 'secondary';
      case 'client': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'seller': return 'Marchand';
      case 'courier': return 'Livreur';
      case 'client': return 'Client';
      default: return role;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Users className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Gestion des Utilisateurs
        </CardTitle>
        <CardDescription>
          Liste complète avec ID format 4 chiffres + 2 lettres
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtres */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher par ID, email, nom ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrer par rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
              <SelectItem value="seller">Marchands</SelectItem>
              <SelectItem value="courier">Livreurs</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'client').length}</p>
            <p className="text-sm text-muted-foreground">Clients</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{users.filter(u => u.role === 'seller').length}</p>
            <p className="text-sm text-muted-foreground">Marchands</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{users.filter(u => u.role === 'courier').length}</p>
            <p className="text-sm text-muted-foreground">Livreurs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{users.filter(u => u.is_verified).length}</p>
            <p className="text-sm text-muted-foreground">Vérifiés</p>
          </div>
        </div>

        {/* Table des utilisateurs */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>KYC</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono font-semibold">
                    {user.readable_id}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.full_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.phone || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={user.is_verified ? "default" : "secondary"}>
                      {user.is_verified ? "Actif" : "Suspendu"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.kyc_status === 'approved' ? "default" : "outline"}>
                      {user.kyc_status || 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleUserStatus(user.id, user.is_verified)}
                      >
                        {user.is_verified ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendNotificationToUser(user.id, user.email)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Détails de l'utilisateur</DialogTitle>
                            <DialogDescription>
                              Informations complètes de {selectedUser?.email}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div>
                                <strong>ID:</strong> {selectedUser.readable_id}
                              </div>
                              <div>
                                <strong>Email:</strong> {selectedUser.email}
                              </div>
                              <div>
                                <strong>Nom:</strong> {selectedUser.full_name || 'Non renseigné'}
                              </div>
                              <div>
                                <strong>Téléphone:</strong> {selectedUser.phone || 'Non renseigné'}
                              </div>
                              <div>
                                <strong>Pays:</strong> {selectedUser.country || 'Non renseigné'}
                              </div>
                              <div>
                                <strong>Inscrit le:</strong> {new Date(selectedUser.created_at).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PDGUserManagement;
