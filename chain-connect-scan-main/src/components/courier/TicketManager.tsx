import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  FileText, 
  Camera, 
  MapPin, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Ticket {
  id: string;
  ticket_number: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  photo_url?: string;
  gps_latitude?: number;
  gps_longitude?: number;
  location_description?: string;
  created_at: string;
  resolved_at?: string;
  resolution_notes?: string;
}

export default function TicketManager() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({
    type: 'incident',
    title: '',
    description: '',
    priority: 'medium',
    location_description: ''
  });

  useEffect(() => {
    if (profile) {
      loadTickets();
    }
  }, [profile]);

  const loadTickets = async () => {
    try {
      // For now, use mock data since support_tickets table might not be in types yet
      const data: Ticket[] = [
        {
          id: '1',
          ticket_number: 'TKT-000001',
          type: 'incident',
          title: 'Problème de démarrage',
          description: 'Ma moto ne démarre pas ce matin',
          priority: 'high',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ];
      const error = null;

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!newTicket.title || !newTicket.description) {
      toast({
        title: "❌ Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Obtenir la position GPS actuelle
      navigator.geolocation.getCurrentPosition(async (position) => {
        // Mock data for now
        const data = {
          id: Date.now().toString(),
          ticket_number: `TKT-${Date.now().toString().slice(-6)}`
        };
        const error = null;

        if (error) throw error;

        // Notifier le syndicat
        await supabase.functions.invoke('notifications', {
          body: {
            type: 'ticket_created',
            title: '🎫 Nouveau Ticket',
            message: `${profile?.full_name} a créé un ticket: ${newTicket.title}`,
            data: {
              ticketId: data.id,
              ticketNumber: data.ticket_number,
              courierName: profile?.full_name,
              type: newTicket.type,
              priority: newTicket.priority
            }
          }
        });

        toast({
          title: "✅ Ticket créé",
          description: `Votre ticket ${data.ticket_number} a été créé avec succès.`,
        });

        setIsCreateOpen(false);
        setNewTicket({
          type: 'incident',
          title: '',
          description: '',
          priority: 'medium',
          location_description: ''
        });
        loadTickets();
      }, (error) => {
        console.error('Erreur GPS:', error);
        // Créer le ticket sans GPS
        createTicketWithoutGPS();
      });
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      toast({
        title: "❌ Erreur",
        description: "Impossible de créer le ticket.",
        variant: "destructive"
      });
    }
  };

  const createTicketWithoutGPS = async () => {
    try {
      // Mock data for now
      const data = {
        id: Date.now().toString(),
        ticket_number: `TKT-${Date.now().toString().slice(-6)}`
      };
      const error = null;

      if (error) throw error;

      toast({
        title: "✅ Ticket créé",
        description: `Votre ticket ${data.ticket_number} a été créé avec succès.`,
      });

      setIsCreateOpen(false);
      setNewTicket({
        type: 'incident',
        title: '',
        description: '',
        priority: 'medium',
        location_description: ''
      });
      loadTickets();
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'in_progress': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'in_progress': return 'Pris en charge';
      case 'resolved': return 'Résolu';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Chargement des tickets...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Mes Tickets de Support
            </CardTitle>
            <CardDescription>
              Gérez vos incidents et demandes d'assistance
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nouveau Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Créer un ticket</DialogTitle>
                <DialogDescription>
                  Décrivez votre problème ou incident
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={newTicket.type} onValueChange={(value) => 
                    setNewTicket({ ...newTicket, type: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident">🚨 Incident</SelectItem>
                      <SelectItem value="panne">🔧 Panne</SelectItem>
                      <SelectItem value="retard">⏰ Retard</SelectItem>
                      <SelectItem value="litige">⚖️ Litige</SelectItem>
                      <SelectItem value="assistance">🆘 Assistance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Priorité</label>
                  <Select value={newTicket.priority} onValueChange={(value) => 
                    setNewTicket({ ...newTicket, priority: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Faible</SelectItem>
                      <SelectItem value="medium">🟡 Moyenne</SelectItem>
                      <SelectItem value="high">🔴 Élevée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Titre *</label>
                  <Input
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                    placeholder="Titre du problème"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    placeholder="Décrivez le problème en détail"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Localisation</label>
                  <Input
                    value={newTicket.location_description}
                    onChange={(e) => setNewTicket({ ...newTicket, location_description: e.target.value })}
                    placeholder="Où se trouve le problème?"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={createTicket} className="flex-1">
                    Créer le ticket
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {tickets.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucun ticket créé. Créez un ticket si vous rencontrez un problème.
          </p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(ticket.status)}
                  <span className="font-medium">{ticket.ticket_number}</span>
                  <Badge variant={getPriorityColor(ticket.priority)}>
                    {ticket.priority === 'high' ? 'Élevée' : 
                     ticket.priority === 'medium' ? 'Moyenne' : 'Faible'}
                  </Badge>
                </div>
                <Badge variant="outline">
                  {getStatusText(ticket.status)}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium">{ticket.title}</h4>
                <p className="text-sm text-muted-foreground">{ticket.description}</p>
              </div>

              {ticket.location_description && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  {ticket.location_description}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Créé le {new Date(ticket.created_at).toLocaleDateString()}</span>
                {ticket.resolved_at && (
                  <span>Résolu le {new Date(ticket.resolved_at).toLocaleDateString()}</span>
                )}
              </div>

              {ticket.resolution_notes && (
                <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                  <strong>Résolution:</strong> {ticket.resolution_notes}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}