import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Mail, Phone } from 'lucide-react';

interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  orders_count: number;
  total_spent: number;
}

export default function VendorCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Données d'exemple en attendant la vraie base de données
  useEffect(() => {
    setTimeout(() => {
      setCustomers([
        {
          id: '1',
          email: 'marie.dubois@email.com',
          name: 'Marie Dubois',
          phone: '+33123456789',
          orders_count: 5,
          total_spent: 250.50
        },
        {
          id: '2',
          email: 'pierre.martin@email.com',
          name: 'Pierre Martin',
          phone: '+33987654321',
          orders_count: 3,
          total_spent: 180.00
        },
        {
          id: '3',
          email: 'sophie.bernard@email.com',
          name: 'Sophie Bernard',
          orders_count: 8,
          total_spent: 420.75
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-4">Chargement des clients...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mes Clients</h1>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          <span className="font-medium">{customers.length} clients</span>
        </div>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Rechercher un client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {customer.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{customer.email}</span>
                </div>

                {customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{customer.phone}</span>
                  </div>
                )}

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-sm">
                    <span>Commandes:</span>
                    <span className="font-medium">{customer.orders_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total dépensé:</span>
                    <span className="font-medium text-green-600">
                      {customer.total_spent.toFixed(2)}€
                    </span>
                  </div>
                </div>

                <Button className="w-full mt-4" variant="outline">
                  Voir détails
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'Aucun client trouvé pour cette recherche.' : 'Aucun client pour le moment.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}