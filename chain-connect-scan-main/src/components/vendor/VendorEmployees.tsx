import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  UserCheck, Users, Shield, Settings, Plus, Mail, Phone, 
  Calendar, MapPin, Edit, Trash2, Eye, UserX, CheckCircle,
  AlertCircle, Clock, Search, Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Employee {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive' | 'pending';
  hire_date: string;
  department?: string;
  position?: string;
  salary?: number;
  avatar_url?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface VendorEmployeesProps {
  userProfile: any;
}

const employeeRoles = [
  { value: 'manager', label: 'Manager', permissions: ['read', 'write', 'manage_inventory', 'manage_orders', 'view_analytics'] },
  { value: 'cashier', label: 'Caissier', permissions: ['read', 'process_orders', 'manage_pos'] },
  { value: 'stock_manager', label: 'Gestionnaire Stock', permissions: ['read', 'manage_inventory', 'view_reports'] },
  { value: 'sales_rep', label: 'Commercial', permissions: ['read', 'manage_customers', 'create_orders'] },
  { value: 'accountant', label: 'Comptable', permissions: ['read', 'view_analytics', 'manage_finances'] },
  { value: 'support', label: 'Support Client', permissions: ['read', 'manage_customers', 'handle_complaints'] }
];

const allPermissions = [
  { id: 'read', label: 'Lecture', description: 'Consulter les données' },
  { id: 'write', label: 'Écriture', description: 'Modifier les données' },
  { id: 'manage_inventory', label: 'Gestion Stock', description: 'Gérer l\'inventaire' },
  { id: 'manage_orders', label: 'Gestion Commandes', description: 'Gérer les commandes' },
  { id: 'manage_customers', label: 'Gestion Clients', description: 'Gérer les clients' },
  { id: 'view_analytics', label: 'Analytics', description: 'Voir les statistiques' },
  { id: 'manage_finances', label: 'Finances', description: 'Gérer les finances' },
  { id: 'process_orders', label: 'Traiter Commandes', description: 'Traiter les commandes' },
  { id: 'manage_pos', label: 'Point de Vente', description: 'Gérer le POS' },
  { id: 'view_reports', label: 'Rapports', description: 'Consulter les rapports' },
  { id: 'handle_complaints', label: 'Réclamations', description: 'Gérer les réclamations' }
];

const VendorEmployees: React.FC<VendorEmployeesProps> = ({ userProfile }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    role: '',
    department: '',
    position: '',
    salary: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      
      // Simuler des données d'employés pour le vendeur
      const mockEmployees: Employee[] = [
        {
          id: '1',
          email: 'manager@example.com',
          full_name: 'Marie Dubois',
          phone: '+224 621 234 567',
          role: 'manager',
          permissions: ['read', 'write', 'manage_inventory', 'manage_orders', 'view_analytics'],
          status: 'active',
          hire_date: '2024-01-15',
          department: 'Gestion',
          position: 'Manager Principal',
          salary: 2500000,
          avatar_url: null,
          last_login: '2024-01-18T10:30:00Z',
          created_at: '2024-01-15T09:00:00Z',
          updated_at: '2024-01-18T10:30:00Z'
        },
        {
          id: '2',
          email: 'caissier@example.com', 
          full_name: 'Ibrahima Bah',
          phone: '+224 622 345 678',
          role: 'cashier',
          permissions: ['read', 'process_orders', 'manage_pos'],
          status: 'active',
          hire_date: '2024-02-01',
          department: 'Ventes',
          position: 'Caissier Principal',
          salary: 1200000,
          avatar_url: null,
          last_login: '2024-01-18T14:15:00Z',
          created_at: '2024-02-01T08:00:00Z',
          updated_at: '2024-01-18T14:15:00Z'
        }
      ];
      
      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  const createEmployee = async () => {
    try {
      if (!formData.email || !formData.full_name || !formData.role) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const newEmployee: Employee = {
        id: Date.now().toString(),
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
        permissions: formData.permissions,
        status: 'pending',
        hire_date: new Date().toISOString().split('T')[0],
        department: formData.department,
        position: formData.position,
        salary: parseFloat(formData.salary) || 0,
        avatar_url: null,
        last_login: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setEmployees(prev => [...prev, newEmployee]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Employé créé avec succès. Une invitation a été envoyée.');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de l\'employé');
    }
  };

  const updateEmployee = async () => {
    try {
      if (!selectedEmployee) return;

      const updatedEmployee: Employee = {
        ...selectedEmployee,
        email: formData.email,
        full_name: formData.full_name,
        phone: formData.phone,
        role: formData.role,
        permissions: formData.permissions,
        department: formData.department,
        position: formData.position,
        salary: parseFloat(formData.salary) || 0,
        updated_at: new Date().toISOString()
      };

      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id ? updatedEmployee : emp
      ));
      
      setShowEditModal(false);
      setSelectedEmployee(null);
      resetForm();
      toast.success('Employé mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const toggleEmployeeStatus = async (employeeId: string) => {
    try {
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId 
          ? { 
              ...emp, 
              status: emp.status === 'active' ? 'inactive' : 'active',
              updated_at: new Date().toISOString()
            }
          : emp
      ));
      toast.success('Statut mis à jour');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du changement de statut');
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    try {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      toast.success('Employé supprimé');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      role: '',
      department: '',
      position: '',
      salary: '',
      permissions: []
    });
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      email: employee.email,
      full_name: employee.full_name,
      phone: employee.phone || '',
      role: employee.role,
      department: employee.department || '',
      position: employee.position || '',
      salary: employee.salary?.toString() || '',
      permissions: employee.permissions
    });
    setShowEditModal(true);
  };

  const handleRoleChange = (role: string) => {
    const selectedRole = employeeRoles.find(r => r.value === role);
    setFormData(prev => ({
      ...prev,
      role,
      permissions: selectedRole ? selectedRole.permissions : []
    }));
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || filterRole === 'all' || employee.role === filterRole;
    const matchesStatus = !filterStatus || filterStatus === 'all' || employee.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground"><CheckCircle className="w-3 h-3 mr-1" />Actif</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><UserX className="w-3 h-3 mr-1" />Inactif</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-sm text-muted-foreground">Total Employés</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold text-success">
                  {employees.filter(emp => emp.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-bold text-warning">
                  {employees.filter(emp => emp.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {employees.filter(emp => emp.role === 'manager').length}
                </p>
                <p className="text-sm text-muted-foreground">Managers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions et filtres */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Gestion des Employés
              </CardTitle>
              <CardDescription>
                Gérez vos employés, leurs rôles et permissions
              </CardDescription>
            </div>
            
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter Employé
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouvel employé</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="full_name">Nom complet *</Label>
                    <Input
                      id="full_name"
                      placeholder="Nom complet"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      placeholder="+224 621 234 567"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rôle *</Label>
                    <Select value={formData.role} onValueChange={handleRoleChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {employeeRoles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Département</Label>
                    <Input
                      id="department"
                      placeholder="Ex: Ventes, Marketing..."
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Poste</Label>
                    <Input
                      id="position"
                      placeholder="Ex: Caissier Principal..."
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="salary">Salaire (GNF)</Label>
                    <Input
                      id="salary"
                      type="number"
                      placeholder="2500000"
                      value={formData.salary}
                      onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                    />
                  </div>
                </div>
                
                {formData.permissions.length > 0 && (
                  <div>
                    <Label>Permissions accordées</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.permissions.map(perm => {
                        const permission = allPermissions.find(p => p.id === perm);
                        return permission ? (
                          <Badge key={perm} variant="secondary">
                            {permission.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Annuler
                  </Button>
                  <Button onClick={createEmployee}>
                    Créer l'employé
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                {employeeRoles.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="inactive">Inactif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste des employés */}
          <div className="space-y-4">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(employee => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarImage src={employee.avatar_url || ''} />
                          <AvatarFallback>
                            {employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{employee.full_name}</h3>
                            {getStatusBadge(employee.status)}
                          </div>
                          
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {employee.email}
                              </span>
                              {employee.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {employee.phone}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <span>Rôle: <Badge variant="outline">{employeeRoles.find(r => r.value === employee.role)?.label || employee.role}</Badge></span>
                              {employee.department && <span>Département: {employee.department}</span>}
                              {employee.position && <span>Poste: {employee.position}</span>}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Embauché le {new Date(employee.hire_date).toLocaleDateString('fr-FR')}
                              {employee.last_login && (
                                <span className="ml-4">
                                  Dernière connexion: {new Date(employee.last_login).toLocaleDateString('fr-FR')}
                                </span>
                              )}
                            </div>
                            
                            {employee.permissions.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {employee.permissions.slice(0, 3).map(perm => {
                                  const permission = allPermissions.find(p => p.id === perm);
                                  return permission ? (
                                    <Badge key={perm} variant="secondary" className="text-xs">
                                      {permission.label}
                                    </Badge>
                                  ) : null;
                                })}
                                {employee.permissions.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{employee.permissions.length - 3} autres
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant={employee.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => toggleEmployeeStatus(employee.id)}
                        >
                          {employee.status === 'active' ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun employé trouvé</h3>
                <p className="text-muted-foreground mb-4">
                  {employees.length === 0 
                    ? "Commencez par ajouter votre premier employé" 
                    : "Aucun employé ne correspond aux critères de recherche"}
                </p>
                {employees.length === 0 && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un employé
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de modification */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'employé</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-full_name">Nom complet</Label>
              <Input
                id="edit-full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Téléphone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Rôle</Label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employeeRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-department">Département</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-position">Poste</Label>
              <Input
                id="edit-position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-salary">Salaire (GNF)</Label>
              <Input
                id="edit-salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Annuler
            </Button>
            <Button onClick={updateEmployee}>
              Mettre à jour
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorEmployees;