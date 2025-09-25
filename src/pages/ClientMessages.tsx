import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { 
  ArrowLeft,
  Send,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Search,
  MessageCircle,
  Headphones
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Conversation {
  id: string;
  seller_id?: string;
  support_id?: string;
  subject?: string;
  status: 'active' | 'closed' | 'pending';
  created_at: string;
  updated_at: string;
  other_party_name: string;
  other_party_avatar?: string;
  last_message?: string;
  unread_count: number;
  is_support: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  message: string;
  attachments: any[];
  is_read: boolean;
  created_at: string;
  is_own: boolean;
}

const ClientMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('client_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Mock data for now since we don't have seller/support info
      const mockConversations: Conversation[] = [
        {
          id: '1',
          seller_id: '482GN',
          subject: 'Question sur Samsung Galaxy A54',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          other_party_name: 'TechStore Conakry (VDR-0021)',
          other_party_avatar: '/placeholder.svg',
          last_message: 'Le produit est-il encore disponible?',
          unread_count: 2,
          is_support: false
        },
        {
          id: '2',
          support_id: '224SUP',
          subject: 'Problème de livraison',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          other_party_name: 'Support 224SOLUTIONS',
          other_party_avatar: '/placeholder.svg',
          last_message: 'Nous allons vérifier le statut de votre commande',
          unread_count: 0,
          is_support: true
        }
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error("Erreur lors du chargement des conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Mock messages for now
      const mockMessages: Message[] = [
        {
          id: '1',
          sender_id: '482GN',
          message: 'Bonjour! Comment puis-je vous aider?',
          attachments: [],
          is_read: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          is_own: false
        },
        {
          id: '2',
          sender_id: user!.id,
          message: 'Le produit est-il encore disponible?',
          attachments: [],
          is_read: true,
          created_at: new Date(Date.now() - 1800000).toISOString(),
          is_own: true
        },
        {
          id: '3',
          sender_id: '482GN',
          message: 'Oui, nous avons encore quelques unités en stock. Souhaitez-vous passer commande?',
          attachments: [],
          is_read: true,
          created_at: new Date(Date.now() - 900000).toISOString(),
          is_own: false
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error("Erreur lors du chargement des messages");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const messageData = {
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        message: newMessage.trim(),
        attachments: []
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      // Add message to local state
      const newMsg: Message = {
        id: Date.now().toString(),
        sender_id: user.id,
        message: newMessage.trim(),
        attachments: [],
        is_read: false,
        created_at: new Date().toISOString(),
        is_own: true
      };

      setMessages(prev => [...prev, newMsg]);
      setNewMessage("");
      toast.success("Message envoyé");

    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const startSupportConversation = async () => {
    try {
      const conversationData = {
        client_id: user!.id,
        support_id: 'support1',
        subject: 'Demande de support',
        status: 'active'
      };

      const { data, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select()
        .single();

      if (error) throw error;

      await fetchConversations();
      toast.success("Conversation avec le support créée");
    } catch (error) {
      console.error('Error creating support conversation:', error);
      toast.error("Erreur lors de la création de la conversation");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  // Conversation list view
  if (!selectedConversation) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 mb-4">
              <Link to="/profile">
                <Button size="icon" variant="outline">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-foreground">Messages</h1>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Rechercher une conversation..."
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Support button */}
        <div className="px-4 py-4">
            <Button 
              onClick={startSupportConversation}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-primary-foreground shadow-lg hover:shadow-glow transition-all duration-300"
            >
            <Headphones className="h-5 w-5 mr-2" />
            Contacter le support
          </Button>
        </div>

        {/* Conversations */}
        <div className="px-4">
          {conversations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">Aucune conversation</h3>
                <p className="text-muted-foreground">
                  Vos conversations avec les marchands et le support apparaîtront ici
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id} 
                  className="hover:shadow-md transition-smooth cursor-pointer"
                  onClick={() => {
                    setSelectedConversation(conversation);
                    fetchMessages(conversation.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conversation.other_party_avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {conversation.is_support ? 'S' : conversation.other_party_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {conversation.other_party_name}
                          </h3>
                          <div className="flex items-center gap-2">
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(conversation.updated_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.subject}
                        </p>
                        
                        {conversation.last_message && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.last_message}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Chat Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                size="icon" 
                variant="outline"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.other_party_avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedConversation.is_support ? 'S' : selectedConversation.other_party_name[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-foreground">
                  {selectedConversation.other_party_name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.is_support ? 'Support client' : 'Marchand'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button size="icon" variant="outline">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Video className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gradient-to-br from-background to-muted/10">
            {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.is_own
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="text-sm">{message.message}</p>
              <p className={`text-xs mt-1 ${
                message.is_own ? 'text-primary-foreground/70' : 'text-muted-foreground'
              }`}>
                {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t bg-background p-4">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Tapez votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={sending}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientMessages;
