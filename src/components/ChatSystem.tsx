import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ChatMessage, Conversation, UserRole } from '@/types';
import { 
  Send, 
  MapPin, 
  Image, 
  Phone, 
  Video, 
  MoreVertical,
  Clock,
  CheckCheck,
  MessageCircle
} from 'lucide-react';

interface ChatSystemProps {
  currentUserId: string;
  currentUserRole: UserRole;
  conversations: Conversation[];
  onSendMessage: (conversationId: string, content: string, type: 'text' | 'location' | 'image') => void;
  onCreateConversation?: (orderId: string, participants: string[]) => void;
}

const ChatSystem: React.FC<ChatSystemProps> = ({
  currentUserId,
  currentUserRole,
  conversations,
  onSendMessage,
  onCreateConversation
}) => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Données simulées pour les messages
  useEffect(() => {
    const mockMessages: Record<string, ChatMessage[]> = {
      'conv_1': [
        {
          id: 'msg_1',
          conversationId: 'conv_1',
          senderId: '482GN',
          senderRole: 'seller',
          content: 'Bonjour ! Votre commande est prête pour la collecte.',
          type: 'text',
          timestamp: '2024-01-20T10:30:00Z',
          readBy: ['482GN', '371LK']
        },
        {
          id: 'msg_2',
          conversationId: 'conv_1',
          senderId: '371LK',
          senderRole: 'client',
          content: 'Parfait ! À quelle heure le livreur passera-t-il ?',
          type: 'text',
          timestamp: '2024-01-20T10:32:00Z',
          readBy: ['371LK']
        },
        {
          id: 'msg_3',
          conversationId: 'conv_1',
          senderId: '529M',
          senderRole: 'courier',
          content: 'Je passe récupérer dans 15 minutes !',
          type: 'text',
          timestamp: '2024-01-20T10:35:00Z',
          readBy: ['529M']
        },
        {
          id: 'msg_4',
          conversationId: 'conv_1',
          senderId: '529M',
          senderRole: 'courier',
          content: 'Position actuelle du livreur',
          type: 'location',
          timestamp: '2024-01-20T10:40:00Z',
          readBy: ['529M']
        }
      ],
      'conv_2': [
        {
          id: 'msg_5',
          conversationId: 'conv_2',
          senderId: 'system',
          senderRole: 'admin',
          content: 'Livraison assignée à Mamadou Diallo (Moto - ABC123)',
          type: 'system',
          timestamp: '2024-01-20T09:15:00Z',
          readBy: ['248FR', '482GN', '529M']
        },
        {
          id: 'msg_6',
          conversationId: 'conv_2',
          senderId: '529M',
          senderRole: 'courier',
          content: 'En route vers le point de collecte !',
          type: 'text',
          timestamp: '2024-01-20T09:20:00Z',
          readBy: ['529M']
        }
      ]
    };
    setMessages(mockMessages);
  }, []);

  // Scroll automatique vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageId = `msg_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: messageId,
      conversationId: selectedConversation,
      senderId: currentUserId,
      senderRole: currentUserRole,
      content: newMessage,
      type: 'text',
      timestamp: new Date().toISOString(),
      readBy: [currentUserId]
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMsg]
    }));

    onSendMessage(selectedConversation, newMessage, 'text');
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLocationShare = () => {
    if (!selectedConversation) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const locationMessage: ChatMessage = {
          id: `msg_${Date.now()}`,
          conversationId: selectedConversation,
          senderId: currentUserId,
          senderRole: currentUserRole,
          content: `Position partagée: ${position.coords.latitude}, ${position.coords.longitude}`,
          type: 'location',
          timestamp: new Date().toISOString(),
          readBy: [currentUserId]
        };

        setMessages(prev => ({
          ...prev,
          [selectedConversation]: [...(prev[selectedConversation] || []), locationMessage]
        }));

        onSendMessage(selectedConversation, locationMessage.content, 'location');
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'client': return 'text-primary';
      case 'seller': return 'text-accent';
      case 'courier': return 'text-secondary-foreground';
      case 'admin': return 'text-primary-glow';
      default: return 'text-muted-foreground';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'client': return 'Client';
      case 'seller': return 'Marchand';
      case 'courier': return 'Livreur';
      case 'admin': return 'Système';
      default: return role;
    }
  };

  const getUnreadCount = (conversationId: string) => {
    const convMessages = messages[conversationId] || [];
    return convMessages.filter(msg => 
      msg.senderId !== currentUserId && !msg.readBy.includes(currentUserId)
    ).length;
  };

  return (
    <div className="h-[700px] flex">
      {/* Liste des conversations */}
      <div className="w-1/3 border-r border-border">
        <Card className="h-full rounded-none border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <MessageCircle className="w-5 h-5 mr-2" />
              Conversations
            </CardTitle>
            <CardDescription>
              Communication en temps réel entre tous les acteurs
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[580px]">
              <div className="space-y-1 p-4">
                {conversations.map((conversation) => {
                  const unreadCount = getUnreadCount(conversation.id);
                  const isSelected = selectedConversation === conversation.id;
                  
                  return (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          Commande #{conversation.orderId.slice(-6)}
                        </span>
                        {unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Client • Marchand {conversation.participants.courier && '• Livreur'}</div>
                        {conversation.lastMessage && (
                          <div className="truncate">
                            {conversation.lastMessage.content.slice(0, 40)}...
                          </div>
                        )}
                        <div>{formatTime(conversation.updatedAt)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Zone de chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header du chat */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">
                    Commande #{conversations.find(c => c.id === selectedConversation)?.orderId.slice(-6)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    3 participants • En ligne
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {(messages[selectedConversation] || []).map((message) => {
                  const isOwn = message.senderId === currentUserId;
                  const isSystem = message.senderRole === 'admin';
                  
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {isSystem ? (
                        <div className="bg-muted/50 rounded-lg p-3 max-w-xs mx-auto text-center">
                          <p className="text-sm text-muted-foreground">{message.content}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      ) : (
                        <div className={`max-w-[70%] ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
                          {!isOwn && (
                            <div className="mb-1">
                              <span className={`text-xs font-medium ${getRoleColor(message.senderRole)}`}>
                                {getRoleLabel(message.senderRole)}
                              </span>
                            </div>
                          )}
                          
                          <div className={`rounded-lg p-3 ${
                            isOwn 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-muted'
                          }`}>
                            {message.type === 'location' ? (
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">Position partagée</span>
                              </div>
                            ) : message.type === 'image' ? (
                              <div className="flex items-center space-x-2">
                                <Image className="w-4 h-4" />
                                <span className="text-sm">Image partagée</span>
                              </div>
                            ) : (
                              <p className="text-sm">{message.content}</p>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-xs ${
                                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {formatTime(message.timestamp)}
                              </span>
                              
                              {isOwn && (
                                <CheckCheck className={`w-3 h-3 ${
                                  message.readBy.length > 1 
                                    ? 'text-green-400' 
                                    : 'text-primary-foreground/50'
                                }`} />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Zone de saisie */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLocationShare}
                    title="Partager position"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Joindre image"
                  >
                    <Image className="w-4 h-4" />
                  </Button>
                </div>
                
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1"
                />
                
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Sélectionnez une conversation</h3>
              <p className="text-muted-foreground">
                Choisissez une commande pour commencer à communiquer
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSystem;
