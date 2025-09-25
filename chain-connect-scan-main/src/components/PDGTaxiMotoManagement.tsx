import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Car, Plus, Edit, Trash2, MapPin, Users, Globe } from "lucide-react";

interface TaxiMotoInterface {
  id: string;
  country: string;
  interfaceUrl: string;
  isActive: boolean;
  driverCount: number;
  totalRides: number;
  revenue: number;
  currency: string;
  createdAt: string;
}

const PDGTaxiMotoManagement = () => {
  const [interfaces, setInterfaces] = useState<TaxiMotoInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInterface, setEditingInterface] = useState<TaxiMotoInterface | null>(null);
  const [formData, setFormData] = useState({
    country: "",
    interfaceUrl: "",
    isActive: true
  });

  const countries = [
    { code: "GN", name: "Guinée", currency: "GNF" },
    { code: "ML", name: "Mali", currency: "XOF" },
    { code: "SN", name: "Sénégal", currency: "XOF" },
    { code: "CI", name: "Côte d'Ivoire", currency: "XOF" },
    { code: "BF", name: "Burkina Faso", currency: "XOF" },
    { code: "NE", name: "Niger", currency: "XOF" },
    { code: "TG", name: "Togo", currency: "XOF" },
    { code: "BJ", name: "Bénin", currency: "XOF" }
  ];

  useEffect(() => {
    loadInterfaces();
  }, []);

  const loadInterfaces = async () => {
    try {
      setLoading(true);
      
      // Simulation des données - à remplacer par les vraies données de la base
      const mockData: TaxiMotoInterface[] = [
        {
          id: "1",
          country: "Guinée",
          interfaceUrl: "https://taxi-moto-guinee.224solutions.com",
          isActive: true,
          driverCount: 152,
          totalRides: 3420,
          revenue: 85600000,
          currency: "GNF",
          createdAt: "2024-01-15"
        },
        {
          id: "2",
          country: "Mali",
          interfaceUrl: "https://taxi-moto-mali.224solutions.com",
          isActive: true,
          driverCount: 89,
          totalRides: 2150,
          revenue: 1250000,
          currency: "XOF",
          createdAt: "2024-02-10"
        }
      ];

      setInterfaces(mockData);
    } catch (error) {
      console.error('Error loading interfaces:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les interfaces taxi-moto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.country || !formData.interfaceUrl) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive",
        });
        return;
      }

      const selectedCountry = countries.find(c => c.name === formData.country);
      
      if (editingInterface) {
        // Mise à jour
        const updatedInterfaces = interfaces.map(iface => 
          iface.id === editingInterface.id 
            ? { ...iface, ...formData }
            : iface
        );
        setInterfaces(updatedInterfaces);
        
        toast({
          title: "Succès",
          description: "Interface taxi-moto mise à jour avec succès.",
        });
      } else {
        // Création
        const newInterface: TaxiMotoInterface = {
          id: Date.now().toString(),
          country: formData.country,
          interfaceUrl: formData.interfaceUrl,
          isActive: formData.isActive,
          driverCount: 0,
          totalRides: 0,
          revenue: 0,
          currency: selectedCountry?.currency || "GNF",
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        setInterfaces([...interfaces, newInterface]);
        
        toast({
          title: "Succès",
          description: "Interface taxi-moto créée avec succès.",
        });
      }

      // Reset form
      setFormData({ country: "", interfaceUrl: "", isActive: true });
      setEditingInterface(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving interface:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (iface: TaxiMotoInterface) => {
    setEditingInterface(iface);
    setFormData({
      country: iface.country,
      interfaceUrl: iface.interfaceUrl,
      isActive: iface.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setInterfaces(interfaces.filter(iface => iface.id !== id));
      toast({
        title: "Succès",
        description: "Interface supprimée avec succès.",
      });
    } catch (error) {
      console.error('Error deleting interface:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const updatedInterfaces = interfaces.map(iface => 
        iface.id === id 
          ? { ...iface, isActive: !iface.isActive }
          : iface
      );
      setInterfaces(updatedInterfaces);
      
      toast({
        title: "Succès",
        description: "Statut mis à jour avec succès.",
      });
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour du statut.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Car className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestion Taxi-Moto par Pays</h2>
          <p className="text-muted-foreground">
            Gérez les interfaces taxi-moto déployées dans chaque pays
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingInterface(null);
              setFormData({ country: "", interfaceUrl: "", isActive: true });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Interface Pays
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingInterface ? "Modifier" : "Ajouter"} Interface Taxi-Moto
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="country">Pays</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.name}>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2" />
                          {country.name} ({country.currency})
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="interfaceUrl">URL de l'Interface</Label>
                <Input
                  id="interfaceUrl"
                  value={formData.interfaceUrl}
                  onChange={(e) => setFormData({...formData, interfaceUrl: e.target.value})}
                  placeholder="https://taxi-moto-pays.224solutions.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                <Label htmlFor="isActive">Interface active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  {editingInterface ? "Mettre à jour" : "Créer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pays Actifs</p>
                <p className="text-2xl font-bold">{interfaces.filter(i => i.isActive).length}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Chauffeurs</p>
                <p className="text-2xl font-bold">{interfaces.reduce((sum, i) => sum + i.driverCount, 0)}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{interfaces.reduce((sum, i) => sum + i.totalRides, 0)}</p>
              </div>
              <Car className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenus Totaux</p>
                <p className="text-lg font-bold">Multi-devises</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des interfaces */}
      <Card>
        <CardHeader>
          <CardTitle>Interfaces Taxi-Moto par Pays</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pays</TableHead>
                <TableHead>URL Interface</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Chauffeurs</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Revenus</TableHead>
                <TableHead>Date Création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interfaces.map((iface) => (
                <TableRow key={iface.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      {iface.country}
                    </div>
                  </TableCell>
                  <TableCell>
                    <a href={iface.interfaceUrl} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      {iface.interfaceUrl}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={iface.isActive ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => toggleStatus(iface.id)}
                    >
                      {iface.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>{iface.driverCount}</TableCell>
                  <TableCell>{iface.totalRides}</TableCell>
                  <TableCell>
                    {iface.revenue.toLocaleString()} {iface.currency}
                  </TableCell>
                  <TableCell>{iface.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEdit(iface)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(iface.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDGTaxiMotoManagement;