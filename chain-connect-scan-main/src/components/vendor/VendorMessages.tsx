import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MessageSquare, 
  Send, 
  User, 
  Clock,
  Search,
  Filter
} from 'lucide-react';

interface Message {
  id: string;
  customer_name: string;
  customer_id: string;
  last_message: string;
  timestamp: string;
  unread_count: number;
  status: 'active' | 'resolved';
}

export default function VendorMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Données simulées pour la démonstration
  useEffect(() => {
    const mockConversations: Message[] = [
      {
        id: '1',
        customer_name: 'Marie Konaté',
        customer_id: 'CLT-0001',
        last_message: 'Bonjour, j\'aimerais connaître le délai de livraison pour ma commande',
        timestamp: new Date().toISOString(),
        unread_count: 2,
        status: 'active'
      },
      {
        id: '2',
        customer_name: 'Ibrahim Diallo',
        customer_id: 'CLT-0002',
        last_message: 'Le produit correspond parfaitement à la description, merci !',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        unread_count: 0,
        status: 'resolved'
      }
    ];
    setConversations(mockConversations);
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    toast({
      title: "Message envoyé",
      description: "Votre message a été envoyé avec succès"
    });
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.customer_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Messagerie Client</h2>
          <p className="text-muted-foreground">
            {conversations.filter(c => c.unread_count > 0).length} conversation(s) non lue(s)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des conversations */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <Card 
                key={conversation.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedConversation === conversation.id ? 'bg-accent' : ''
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium truncate">{conversation.customer_name}</h4>
                        {conversation.unread_count > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conversation.timestamp).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {conversations.find(c => c.id === selectedConversation)?.customer_name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 bg-muted/30 rounded-lg p-4 mb-4 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
                        <p className="text-sm">Bonjour, j'aimerais connaître le délai de livraison pour ma commande</p>
                        <span className="text-xs text-muted-foreground">Il y a 2h</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                        <p className="text-sm">Bonjour ! Le délai de livraison est généralement de 2-3 jours ouvrés.</p>
                        <span className="text-xs opacity-75">Il y a 1h</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Tapez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 min-h-[60px]"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez une conversation</h3>
                <p className="text-muted-foreground">
                  Choisissez une conversation dans la liste pour commencer à échanger
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}