import React, { useState } from "react";
import { VendorLayout } from "../vendor/VendorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye,
  Users,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

const VendorCustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Données d'exemple
  const customers = [
    {
      id: 1,
      name: "Marie Diallo",
      email: "marie.diallo@email.com",
      phone: "+224 123 456 789",
      address: "Conakry, Kaloum",
      totalOrders: 15,
      totalSpent: 2500000,
      status: "active",
      lastOrder: "2024-01-15"
    },
    {
      id: 2,
      name: "Amadou Bah",
      email: "amadou.bah@email.com",
      phone: "+224 987 654 321",
      address: "Conakry, Ratoma",
      totalOrders: 8,
      totalSpent: 1200000,
      status: "active",
      lastOrder: "2024-01-10"
    },
    {
      id: 3,
      name: "Fatoumata Camara",
      email: "fatoumata.camara@email.com",
      phone: "+224 555 123 456",
      address: "Conakry, Matam",
      totalOrders: 3,
      totalSpent: 450000,
      status: "inactive",
      lastOrder: "2023-12-20"
    }
  ];

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Actif</Badge>;
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inactif</Badge>;
  };

  return (
    <VendorLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestion des clients</h1>
            <p className="text-muted-foreground">Gérez votre base de clients</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un client
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{customers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clients actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {customers.filter(c => c.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                CA total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {customers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString()} GNF
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mes clients ({filteredCustomers.length})
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrer
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{customer.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {customer.address}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {getStatusBadge(customer.status)}
                        <span className="text-xs text-muted-foreground">
                          Dernière commande: {new Date(customer.lastOrder).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {customer.totalOrders} commandes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.totalSpent.toLocaleString()} GNF
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </VendorLayout>
  );
};

export default VendorCustomersPage;
