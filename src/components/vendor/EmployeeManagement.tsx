import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, User, Mail, Phone, Shield, Clock, 
  Eye, EyeOff, Calendar, Settings, UserCheck,
  Activity, Lock, Unlock, Home, LogOut
} from 'lucide-react';

interface Employee {
  id: string;
  vendor_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'caissier' | 'vendeur' | 'gestionnaire_stock' | 'manager' | 'comptable';
  permissions: string[];
  is_active: boolean;
  last_login: string;
  created_at: string;
  salary?: number;
  work_schedule?: string;
}

const roles = [
  { id: 'caissier', label: 'Caissier', permissions: ['pos_access', 'sales_view'] },
  { id: 'vendeur', label: 'Vendeur', permissions: ['pos_access', 'sales_view', 'customers_manage'] },
  { id: 'gestionnaire_stock', label: 'Gestionnaire Stock', permissions: ['inventory_manage', 'products_manage'] },
  { id: 'manager', label: 'Manager', permissions: ['all_access', 'reports_view', 'employees_view'] },
  { id: 'comptable', label: 'Comptable', permissions: ['finances_manage', 'reports_view'] }
];

const permissions = [
  { id: 'pos_access', label: 'Accès caisse' },
  { id: 'sales_view', label: 'Voir les ventes' },
  { id: 'customers_manage', label: 'Gérer les clients' },
  { id: 'inventory_manage', label: 'Gérer le stock' },
  { id: 'products_manage', label: 'Gérer les produits' },
  { id: 'reports_view', label: 'Voir les rapports' },
  { id: 'employees_view', label: 'Voir les employés' },
  { id: 'finances_manage', label: 'Gérer les finances' },
  { id: 'all_access', label: 'Accès complet' }
];

export default function EmployeeManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'caissier' as const,
    permissions: [] as string[],
    salary: 0,
    work_schedule: '9h-17h'
  });

  // Simulation de données pour la démonstration
  useEffect(() => {
    const mockEmployees: Employee[] = [
      {
        id: '1',
        vendor_id: user?.id || '',
        name: 'Marie Camara',
        email: 'marie@exemple.com',
        phone: '+224 123 456 789',
        role: 'manager',
        permissions: ['all_access', 'reports_view', 'employees_view'],
        is_active: true,
        last_login: '2024-01-10',
        created_at: '2024-01-01',
        salary: 2500000,
        work_schedule: '8h-18h'
      },
      {
        id: '2',
        vendor_id: user?.id || '',
        name: 'Ibrahima Diallo',
        email: 'ibrahima@exemple.com',
        phone: '+224 987 654 321',
        role: 'caissier',
        permissions: ['pos_access', 'sales_view'],
        is_active: true,
        last_login: '2024-01-09',
        created_at: '2024-01-05',
        salary: 1500000,
        work_schedule: '9h-17h'
      }
    ];
    
    setEmployees(mockEmployees);
    setLoading(false);
  }, [user?.id]);

  const createEmployee = async () => {
    try {
      const selectedRole = roles.find(r => r.id === newEmployee.role);
      const employeeData = {
        ...newEmployee,
        id: Date.now().toString(),
        vendor_id: user?.id || '',
        permissions: selectedRole?.permissions || [],
        is_active: true,
        last_login: '',
        created_at: new Date().toISOString()
      };

      setEmployees([employeeData, ...employees]);
      toast.success('Employé créé avec succès');
      setShowCreateModal(false);
      setNewEmployee({
        name: '',
        email: '',
        phone: '',
        role: 'caissier',
        permissions: [],
        salary: 0,
        work_schedule: '9h-17h'
      });
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de l\'employé');
    }
  };

  const toggleEmployeeStatus = async (employeeId: string, isActive: boolean) => {
    try {
      setEmployees(prevEmployees =>
        prevEmployees.map(emp =>
          emp.id === employeeId ? { ...emp, is_active: isActive } : emp
        )
      );
      toast.success(`Employé ${isActive ? 'activé' : 'désactivé'}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getRoleLabel = (roleId: string) => {
    return roles.find(r => r.id === roleId)?.label || roleId;
  };

  const getPermissionLabel = (permId: string) => {
    return permissions.find(p => p.id === permId)?.label || permId;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion des employés</h2>
          <p className="text-muted-foreground">
            {employees.length} employé(s) • {employees.filter(e => e.is_active).length} actif(s)
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel employé
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouvel employé</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nom complet</label>
                    <Input
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      placeholder="Nom complet"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      placeholder="email@example.com"
                      type="email"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Téléphone</label>
                    <Input
                      value={newEmployee.phone}
                      onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                      placeholder="+224..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rôle</label>
                    <Select
                      value={newEmployee.role}
                      onValueChange={(role: any) => setNewEmployee({...newEmployee, role})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Salaire mensuel (GNF)</label>
                    <Input
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({...newEmployee, salary: parseFloat(e.target.value) || 0})}
                      placeholder="0"
                      type="number"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Horaires de travail</label>
                    <Input
                      value={newEmployee.work_schedule}
                      onChange={(e) => setNewEmployee({...newEmployee, work_schedule: e.target.value})}
                      placeholder="9h-17h"
                    />
                  </div>
                </div>
                <Button onClick={createEmployee} className="w-full">
                  Créer l'employé
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showPermissionsModal} onOpenChange={setShowPermissionsModal}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Gestion des permissions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Gestion des permissions globales</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Rôles et permissions</h3>
                  <div className="space-y-4">
                    {roles.map((role) => (
                      <Card key={role.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{role.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.map((perm) => (
                              <Badge key={perm} variant="secondary">
                                {getPermissionLabel(perm)}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <Card key={employee.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{employee.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {getRoleLabel(employee.role)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={employee.is_active}
                    onCheckedChange={(checked) => toggleEmployeeStatus(employee.id, checked)}
                  />
                  {employee.is_active ? (
                    <Unlock className="h-4 w-4 text-green-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {employee.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {employee.phone}
                </div>
                {employee.salary && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="font-medium">Salaire:</span>
                    {employee.salary.toLocaleString()} GNF/mois
                  </div>
                )}
                {employee.work_schedule && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {employee.work_schedule}
                  </div>
                )}
                {employee.last_login && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    Dernière connexion: {new Date(employee.last_login).toLocaleDateString()}
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Permissions:</p>
                <div className="flex flex-wrap gap-1">
                  {employee.permissions.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-xs">
                      {getPermissionLabel(perm)}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-1" />
                  Détails
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {employees.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun employé</h3>
            <p className="text-muted-foreground mb-4">
              Commencez par ajouter votre premier employé
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un employé
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
