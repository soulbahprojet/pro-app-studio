import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge, Ticket, User, Download, Printer, Plus, Search, FileText, Car } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateUserId, generateCourierId } from '@/utils/idGenerator';

interface BadgeData {
  id: string;
  courier_id: string;
  badge_number: string;
  vest_number: string;
  first_name: string;
  last_name: string;
  photo_url?: string;
  bureau_name: string;
  created_at: string;
  is_active: boolean;
}

interface TicketData {
  id: string;
  courier_id: string;
  ticket_number: string;
  vehicle_number: string;
  price: number;
  currency: string;
  bureau_name: string;
  created_at: string;
  status: string;
}

const BadgeManagement = () => {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    vehicleNumber: '',
    taxPrice: '',
    bureauName: 'Bureau Syndicat Guinée'
  });
  const { toast } = useToast();

  const generateBadge = async () => {
    if (!newMember.firstName || !newMember.lastName) {
      toast({
        title: "Erreur",
        description: "Le prénom et nom sont obligatoires",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Générer les numéros automatiquement
      const courierId = generateCourierId();
      const vestNumber = Math.floor(1000 + Math.random() * 9000).toString();
      const badgeNumber = `BDG-${vestNumber}`;

      // Simuler la création du badge
      const newBadge: BadgeData = {
        id: `badge-${Date.now()}`,
        courier_id: courierId,
        badge_number: badgeNumber,
        vest_number: vestNumber,
        first_name: newMember.firstName,
        last_name: newMember.lastName,
        bureau_name: newMember.bureauName,
        is_active: true,
        created_at: new Date().toISOString()
      };

      setBadges(prev => [newBadge, ...prev]);

      // Créer le ticket de taxe routière si spécifié
      if (newMember.vehicleNumber && newMember.taxPrice) {
        const newTicket: TicketData = {
          id: `ticket-${Date.now()}`,
          courier_id: courierId,
          ticket_number: `TKT-${Date.now()}`,
          vehicle_number: newMember.vehicleNumber,
          price: parseFloat(newMember.taxPrice),
          currency: 'GNF',
          bureau_name: newMember.bureauName,
          status: 'active',
          created_at: new Date().toISOString()
        };

        setTickets(prev => [newTicket, ...prev]);
      }

      toast({
        title: "Succès",
        description: `Badge ${badgeNumber} créé avec le gilet n°${vestNumber}`
      });

      // Reset form
      setNewMember({
        firstName: '',
        lastName: '',
        phone: '',
        vehicleNumber: '',
        taxPrice: '',
        bureauName: 'Bureau Syndicat Guinée'
      });

    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du badge",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadBadge = (badge: BadgeData) => {
    toast({
      title: "Téléchargement",
      description: `Badge ${badge.badge_number} téléchargé`
    });
  };

  const printBadge = (badge: BadgeData) => {
    toast({
      title: "Impression",
      description: `Badge ${badge.badge_number} envoyé à l'imprimante`
    });
  };

  const filteredBadges = badges.filter(badge => 
    badge.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.badge_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    badge.vest_number.includes(searchTerm)
  );

  const filteredTickets = tickets.filter(ticket =>
    ticket.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Nouveau Membre */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nouveau Membre
          </CardTitle>
          <CardDescription>
            Enregistrer un nouveau motard/livreur avec génération automatique du badge et numéro de gilet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={newMember.firstName}
                onChange={(e) => setNewMember({ ...newMember, firstName: e.target.value })}
                placeholder="Prénom du motard"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={newMember.lastName}
                onChange={(e) => setNewMember({ ...newMember, lastName: e.target.value })}
                placeholder="Nom du motard"
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                placeholder="+224 XXX XXX XXX"
              />
            </div>
            <div>
              <Label htmlFor="bureauName">Bureau Syndicat</Label>
              <Input
                id="bureauName"
                value={newMember.bureauName}
                onChange={(e) => setNewMember({ ...newMember, bureauName: e.target.value })}
                placeholder="Nom du bureau"
              />
            </div>
            <div>
              <Label htmlFor="vehicleNumber">Numéro de Véhicule (Optionnel)</Label>
              <Input
                id="vehicleNumber"
                value={newMember.vehicleNumber}
                onChange={(e) => setNewMember({ ...newMember, vehicleNumber: e.target.value })}
                placeholder="Ex: GN-123-ABC"
              />
            </div>
            <div>
              <Label htmlFor="taxPrice">Prix Taxe Routière (GNF)</Label>
              <Input
                id="taxPrice"
                type="number"
                value={newMember.taxPrice}
                onChange={(e) => setNewMember({ ...newMember, taxPrice: e.target.value })}
                placeholder="Montant en GNF"
              />
            </div>
          </div>
          <Button onClick={generateBadge} disabled={loading} className="w-full">
            {loading ? "Création en cours..." : "Créer Badge & Ticket"}
          </Button>
        </CardContent>
      </Card>

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Rechercher par nom, numéro de badge, gilet ou véhicule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Liste des Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="h-5 w-5" />
            Badges Générés ({filteredBadges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredBadges.map((badge) => (
              <div key={badge.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{badge.first_name} {badge.last_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Badge: {badge.badge_number} | Gilet: {badge.vest_number}
                    </p>
                    <p className="text-xs text-muted-foreground">{badge.bureau_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadBadge(badge)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printBadge(badge)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredBadges.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun badge trouvé
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Tickets Taxe Routière ({filteredTickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Car className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Ticket {ticket.ticket_number}</h4>
                    <p className="text-sm text-muted-foreground">
                      Véhicule: {ticket.vehicle_number} | Prix: {ticket.price.toLocaleString()} {ticket.currency}
                    </p>
                    <p className="text-xs text-muted-foreground">{ticket.bureau_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredTickets.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun ticket trouvé
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgeManagement;