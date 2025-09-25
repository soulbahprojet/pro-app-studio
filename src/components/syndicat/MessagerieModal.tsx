import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { MessageSquare, Send, Users, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '../ui/use-toast';

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  urgent: boolean;
}

interface MessagerieModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessagerieModal: React.FC<MessagerieModalProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // Form state for composing messages
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [urgent, setUrgent] = useState(false);

  const syndicats = [
    { id: 'conakry', name: 'Bureau Syndicat Conakry' },
    { id: 'kankan', name: 'Bureau Syndicat Kankan' },
    { id: 'labe', name: 'Bureau Syndicat Labé' },
    { id: 'nzerekore', name: 'Bureau Syndicat Nzérékoré' },
    { id: 'kindia', name: 'Bureau Syndicat Kindia' }
  ];

  useEffect(() => {
    if (open) {
      // Simuler le chargement des messages
      const mockMessages: Message[] = [
        {
          id: '1',
          from: 'Bureau Syndicat Kankan',
          to: 'Bureau Syndicat Conakry',
          subject: 'Coordination pour événement régional',
          content: 'Bonjour collègues, nous organisons un événement régional le mois prochain. Pouvez-vous confirmer la participation de vos membres ?',
          timestamp: '2024-01-15 10:30',
          status: 'read',
          urgent: false
        },
        {
          id: '2',
          from: 'Bureau Syndicat Labé',
          to: 'Bureau Syndicat Conakry',
          subject: 'URGENT: Problème technique badges',
          content: 'Nous rencontrons des difficultés avec le système de génération de badges. Avez-vous eu des problèmes similaires ?',
          timestamp: '2024-01-15 14:15',
          status: 'delivered',
          urgent: true
        },
        {
          id: '3',
          from: 'Bureau Syndicat Nzérékoré',
          to: 'Bureau Syndicat Conakry',
          subject: 'Rapport mensuel des activités',
          content: 'Voici notre rapport mensuel des activités. 245 nouveaux membres inscrits ce mois.',
          timestamp: '2024-01-14 16:45',
          status: 'sent',
          urgent: false
        }
      ];
      setMessages(mockMessages);
    }
  }, [open]);

  const handleSendMessage = () => {
    if (!recipient || !subject || !content) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      from: 'Bureau Syndicat Conakry',
      to: recipient,
      subject,
      content,
      timestamp: new Date().toLocaleString('fr-FR'),
      status: 'sent',
      urgent
    };

    setMessages(prev => [newMessage, ...prev]);
    
    // Reset form
    setRecipient('');
    setSubject('');
    setContent('');
    setUrgent(false);
    setActiveTab('inbox');

    toast({
      title: "Message envoyé",
      description: `Votre message a été envoyé à ${recipient}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="h-3 w-3 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-blue-500" />;
      case 'read':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messagerie Inter-Syndicats
          </DialogTitle>
          <DialogDescription>
            Communication sécurisée entre bureaux syndicaux
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 h-[60vh]">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            <Button
              variant={activeTab === 'inbox' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setActiveTab('inbox')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Messages reçus ({messages.length})
            </Button>
            <Button
              variant={activeTab === 'compose' ? 'default' : 'outline'}
              className="w-full justify-start"
              onClick={() => setActiveTab('compose')}
            >
              <Send className="h-4 w-4 mr-2" />
              Nouveau message
            </Button>
            
            <div className="pt-4">
              <h4 className="text-sm font-medium mb-2">Syndicats connectés</h4>
              <div className="space-y-1">
                {syndicats.map(syndicat => (
                  <div key={syndicat.id} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">{syndicat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'inbox' ? (
              <div className="h-full flex">
                {/* Messages List */}
                <div className="w-1/2 border-r pr-4 overflow-y-auto">
                  <h3 className="font-medium mb-4">Messages reçus</h3>
                  <div className="space-y-2">
                    {messages.map(message => (
                      <Card
                        key={message.id}
                        className={`cursor-pointer transition-colors hover:bg-accent ${
                          selectedMessage?.id === message.id ? 'border-primary' : ''
                        }`}
                        onClick={() => setSelectedMessage(message)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{message.from}</span>
                                {message.urgent && (
                                  <Badge variant="destructive" className="text-xs">URGENT</Badge>
                                )}
                                {getStatusIcon(message.status)}
                              </div>
                              <p className="text-sm font-medium text-foreground mb-1">
                                {message.subject}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {message.content}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Message Detail */}
                <div className="w-1/2 pl-4 overflow-y-auto">
                  {selectedMessage ? (
                    <div>
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{selectedMessage.subject}</h3>
                          {selectedMessage.urgent && (
                            <Badge variant="destructive">URGENT</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                          <p><strong>De:</strong> {selectedMessage.from}</p>
                          <p><strong>Reçu le:</strong> {selectedMessage.timestamp}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <strong>Statut:</strong> {getStatusIcon(selectedMessage.status)}
                            <span className="capitalize">{selectedMessage.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-accent/10 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{selectedMessage.content}</p>
                      </div>
                      <div className="mt-4 space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          Répondre
                        </Button>
                        <Button variant="outline" size="sm" className="w-full">
                          Transférer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Sélectionnez un message pour le lire</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Compose Message */
              <div className="h-full overflow-y-auto">
                <h3 className="font-medium mb-4">Nouveau message</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Destinataire *</label>
                    <Select value={recipient} onValueChange={setRecipient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un bureau syndicat" />
                      </SelectTrigger>
                      <SelectContent>
                        {syndicats.map(syndicat => (
                          <SelectItem key={syndicat.id} value={syndicat.name}>
                            {syndicat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Objet *</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Objet du message"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="urgent"
                      checked={urgent}
                      onChange={(e) => setUrgent(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="urgent" className="text-sm">
                      Message urgent
                    </label>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Message *</label>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Rédigez votre message..."
                      rows={8}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSendMessage} className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </Button>
                    <Button variant="outline" onClick={() => setActiveTab('inbox')}>
                      Annuler
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessagerieModal;
