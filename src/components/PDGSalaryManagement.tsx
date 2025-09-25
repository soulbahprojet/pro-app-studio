import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FileText, Plus, Search, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  seller_id: string;
  employee_id: string;
  role: string;
  is_active: boolean;
  hired_at: string;
  employee?: {
    email: string;
    full_name: string;
    readable_id: string;
  };
  seller?: {
    email: string;
    full_name: string;
  };
}

const PDGSalaryManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('hired_at', { ascending: false });

      if (!error && data) {
        const employeesWithUsers = await Promise.all(
          data.map(async (emp: any) => {
            const [employeeData, sellerData] = await Promise.all([
              supabase
                .from('profiles')
                .select('email, full_name, readable_id')
                .eq('user_id', emp.employee_id)
                .single(),
              supabase
                .from('profiles')
                .select('email, full_name')
                .eq('user_id', emp.seller_id)
                .single()
            ]);

            return {
              ...emp,
              employee: employeeData.data,
              seller: sellerData.data
            };
          })
        );
        
        setEmployees(employeesWithUsers);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employee?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.seller?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || emp.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.is_active).length;
  const managers = employees.filter(e => e.role === 'manager').length;
  const staff = employees.filter(e => e.role === 'staff').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FileText className="h-8 w-8 animate-pulse text-primary" />
        <span className="ml-2">Chargement des employés...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Gestion des Salaires
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau Salaire
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un Salaire</DialogTitle>
                  <DialogDescription>
                    Enregistrer un nouveau paiement de salaire
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="employee">Employé</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un employé" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.employee?.full_name} ({emp.employee?.readable_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Montant</Label>
                    <Input id="amount" type="number" placeholder="Montant du salaire" />
                  </div>
                  <div>
                    <Label htmlFor="period">Période</Label>
                    <Input id="period" type="month" />
                  </div>
                  <Button className="w-full">Enregistrer le Salaire</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            Gérez les salaires et les paiements des employés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Employés</p>
                  <p className="text-2xl font-bold text-blue-600">{totalEmployees}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Actifs</p>
                  <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Managers</p>
                  <p className="text-2xl font-bold text-yellow-600">{managers}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Staff</p>
                  <p className="text-2xl font-bold text-purple-600">{staff}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, email ou entreprise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table des employés */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employé</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Date d'embauche</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.employee?.full_name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{employee.employee?.email || 'N/A'}</p>
                      <p className="text-xs text-gray-400">ID: {employee.employee?.readable_id || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.seller?.full_name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{employee.seller?.email || 'N/A'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(employee.hired_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={employee.is_active ? 'default' : 'secondary'}
                    >
                      {employee.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Payer Salaire
                      </Button>
                      <Button variant="outline" size="sm">
                        Historique
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun employé trouvé</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDGSalaryManagement;
