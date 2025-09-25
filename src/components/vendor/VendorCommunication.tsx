import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  MessageCircle, 
  Mail, 
  Bell, 
  Send, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VendorCommunicationProps {
  userProfile: any;
}

const VendorCommunication: React.FC<VendorCommunicationProps> = ({ userProfile }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadCommunicationData();
  }, []);

  const loadCommunicationData = () => {
    // Données d'exemple pour la démo
    const mockMessages = [
      {
        id: '1',
        client_name: 'Jean Dupont',
        client_email: 'jean.dupont@email.com',
        subject: 'Question sur la commande #1234',
        message: 'Bonjour, je voudrais savoir quand ma commande sera expédiée. Merci.',
        status: 'unread',
        created_at: '2023-12-20T10:30:00Z',
        order_id: '1234'
      },
      {
        id: '2',
        client_name: 'Marie Camara',
        client_email: 'marie.camara@email.com',
        subject: 'Demande de remboursement',
        message: 'Le produit reçu ne correspond pas à la description. Je souhaite un remboursement.',
        status: 'replied',
        created_at: '2023-12-19T14:15:00Z',
        order_id: '1235'
      },
      {
        id: '3',
        client_name: 'Amadou Barry',
        client_email: 'amadou.barry@email.com',
        subject: 'Très satisfait !',
        message: 'Excellent service, produit conforme et livraison rapide. Je recommande !',
        status: 'read',
        created_at: '2023-12-18T16:45:00Z',
        order_id: '1236'
      }
    ];

    const mockNotifications = [
      {
        id: '1',
        type: 'order',
        title: 'Nouvelle commande reçue',
        message: 'Commande #1237 de 150,000 GNF',
        status: 'unread',
        created_at: '2023-12-20T12:00:00Z'
      },
      {
        id: '2',
        type: 'stock',
        title: 'Stock faible',
        message: 'Le produit "Smartphone XYZ" a un stock inférieur à 5 unités',
        status: 'read',
        created_at: '2023-12-20T09:30:00Z'
      },
      {
        id: '3',
        type: 'payment',
        title: 'Paiement reçu',
        message: 'Paiement de 75,000 GNF crédité sur votre compte',
        status: 'read',
        created_at: '2023-12-19T18:20:00Z'
      }
    ];

    setMessages(mockMessages);
    setNotifications(mockNotifications);
    setLoading(false);
  };

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, status: 'read' } : msg
    ));
  };

  const sendReply = (messageId: string) => {
    if (!newMessage.trim()) return;

    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, status: 'replied' } : msg
    ));

    toast({
      title: "Message envoyé",
      description: "Votre réponse a été envoyée au client",
    });

    setNewMessage('');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      'unread': { label: 'Non lu', variant: 'destructive', icon: AlertCircle },
      'read': { label: 'Lu', variant: 'secondary', icon: CheckCircle },
      'replied': { label: 'Répondu', variant: 'default', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig.unread;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getNotificationIcon = (type: string) => {
    const icons: any = {
      'order': MessageCircle,
      'stock': AlertCircle,
      'payment': CheckCircle,
      'general': Bell
    };
    return icons[type] || Bell;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const unreadMessages = messages.filter(m => m.status === 'unread').length;
  const unreadNotifications = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages non lus</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une réponse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total messages</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages.length}</div>
            <p className="text-xs text-muted-foreground">
              Cette semaine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadNotifications}</div>
            <p className="text-xs text-muted-foreground">
              Non lues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de réponse</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h</div>
            <p className="text-xs text-muted-foreground">
              Temps moyen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Communication principale */}
      <Card>
        <CardHeader>
          <CardTitle>Centre de Communication</CardTitle>
          <CardDescription>
            Gérez vos messages clients et notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="messages" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="messages">Messages clients ({messages.length})</TabsTrigger>
              <TabsTrigger value="notifications">Notifications ({notifications.length})</TabsTrigger>
              <TabsTrigger value="templates">Modèles</TabsTrigger>
            </TabsList>
            
            <TabsContent value="messages" className="space-y-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <Card key={message.id} className={message.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">{message.client_name}</h3>
                            {getStatusBadge(message.status)}
                          </div>
                          
                          <h4 className="font-medium mb-2">{message.subject}</h4>
                          <p className="text-muted-foreground mb-3">{message.message}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{message.client_email}</span>
                            <span>•</span>
                            <span>Commande #{message.order_id}</span>
                            <span>•</span>
                            <span>{new Date(message.created_at).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 min-w-[200px]">
                          {message.status === 'unread' && (
                            <Button size="sm" onClick={() => markAsRead(message.id)}>
                              Marquer comme lu
                            </Button>
                          )}
                          
                          {message.status !== 'replied' && (
                            <div className="space-y-2">
                              <Textarea
                                placeholder="Tapez votre réponse..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="min-h-[80px]"
                              />
                              <Button size="sm" onClick={() => sendReply(message.id)} className="w-full">
                                <Send className="h-4 w-4 mr-2" />
                                Envoyer réponse
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {messages.length === 0 && (
                  <div className="text-center p-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun message</h3>
                    <p className="text-muted-foreground">
                      Les messages de vos clients apparaîtront ici.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="space-y-4">
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const IconComponent = getNotificationIcon(notification.type);
                  
                  return (
                    <div key={notification.id} className={`p-4 border rounded-lg ${notification.status === 'unread' ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            {notification.status === 'unread' && (
                              <Badge variant="destructive" className="text-xs">Nouveau</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Confirmation d'expédition</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Modèle pour informer le client que sa commande a été expédiée.
                    </p>
                    <Button variant="outline" size="sm">Utiliser ce modèle</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Demande d'avis</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Demander un avis client après livraison.
                    </p>
                    <Button variant="outline" size="sm">Utiliser ce modèle</Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Promotion personnalisée</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Offre spéciale pour clients fidèles.
                    </p>
                    <Button variant="outline" size="sm">Utiliser ce modèle</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorCommunication;
