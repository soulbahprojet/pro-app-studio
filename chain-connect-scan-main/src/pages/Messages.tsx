import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Shield,
  AlertTriangle,
  Phone,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UberStyleInterface from '@/components/delivery/UberStyleInterface';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Conversation {
  id: string;
  subject: string;
  lastMessage: string;
  participant: string;
  timestamp: string;
  unread: number;
  type: 'direct' | 'group' | 'emergency';
}

export default function Messages() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messagesDeliveryOpen, setMessagesDeliveryOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    loadConversations();
  }, [profile]);

  const loadConversations = async () => {
    try {
      // Conversations simulées pour le coursier
      const mockConversations: Conversation[] = [
        {
          id: '1',
          subject: 'Chat Syndicat Moto',
          lastMessage: 'Nouvelle mission disponible dans Kaloum',
          participant: 'Syndicat',
          timestamp: new Date().toISOString(),
          unread: 2,
          type: 'group'
        },
        {
          id: '2',
          subject: 'Support Client',
          lastMessage: 'Votre demande d\'assistance a été reçue',
          participant: 'Support',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          unread: 0,
          type: 'direct'
        },
        {
          id: '3',
          subject: 'Urgences',
          lastMessage: 'Canal d\'urgence - SOS et alertes',
          participant: 'Système',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          unread: 0,
          type: 'emergency'
        }
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Simulation d'envoi de message
      const newMsg = {
        id: Date.now().toString(),
        content: newMessage,
        sender: profile?.full_name || 'Vous',
        timestamp: new Date().toISOString(),
        isOwn: true
      };

      setMessages([...messages, newMsg]);
      setNewMessage('');

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès.",
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive"
      });
    }
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'group':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <MessageCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const selectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    // Messages simulés
    const mockMessages = [
      {
        id: '1',
        content: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
        sender: 'Support',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        isOwn: false
      },
      {
        id: '2',
        content: 'J\'ai un problème avec ma dernière livraison',
        sender: profile?.full_name || 'Vous',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isOwn: true
      }
    ];
    
    setMessages(mockMessages);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Messages</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des conversations */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Conversations
                </CardTitle>
                <CardDescription>
                  Vos discussions et groupes
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => selectConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getConversationIcon(conversation.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{conversation.subject}</h4>
                            {conversation.unread > 0 && (
                              <Badge variant="destructive" className="ml-2">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(conversation.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => toast({
                    title: "SOS",
                    description: "Fonction d'urgence activée",
                    variant: "destructive"
                  })}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Urgence SOS
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => toast({
                    title: "Support",
                    description: "Contacter le support technique",
                  })}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Support
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Zone de chat */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {conversations.find(c => c.id === selectedConversation)?.subject}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {message.sender} • {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Zone de saisie */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Tapez votre message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-[600px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-medium">Sélectionnez une conversation</h3>
                    <p className="text-muted-foreground">
                      Choisissez une conversation pour commencer à discuter
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bouton Livreur Unique des Messages - Style Communication */}
      <Dialog open={messagesDeliveryOpen} onOpenChange={setMessagesDeliveryOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-24 left-4 z-50 w-16 h-16 rounded-full bg-gradient-to-bl from-pink-500 via-red-500 to-orange-500 hover:from-pink-600 hover:via-red-600 hover:to-orange-600 text-white shadow-2xl border-3 border-white hover:scale-110 transition-all duration-400"
            title="💬 Livraison avec Chat"
          >
            <div className="flex flex-col items-center">
              <MessageSquare className="h-5 w-5 mb-1" />
              <span className="text-xs font-bold">CHAT</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-7xl h-[90vh] p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Service Livraison avec Communication</DialogTitle>
          </DialogHeader>
          <UberStyleInterface />
        </DialogContent>
      </Dialog>
    </div>
  );
}