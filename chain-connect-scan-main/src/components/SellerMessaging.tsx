import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Phone, 
  Video, 
  Mic, 
  Send, 
  Search,
  Filter,
  Clock,
  CheckCheck,
  Shield,
  Users,
  Settings,
  Headphones,
  MicOff,
  PhoneOff,
  VideoOff,
  Archive,
  Star,
  AlertTriangle,
  Volume2,
  Pause,
  Play,
  Download,
  MoreVertical
} from 'lucide-react';
import { generateUserId, validateUserId } from '@/utils/idGenerator';

interface Contact {
  id: string;
  userId: string; // ID unique généré
  name: string;
  role: 'client' | 'courier';
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  isBlocked?: boolean;
  totalOrders?: number;
  rating?: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'voice' | 'system' | 'encrypted';
  timestamp: string;
  readBy: string[];
  encrypted?: boolean;
  voiceDuration?: number;
  attachments?: Array<{
    type: 'audio' | 'image' | 'document';
    url: string;
    name: string;
    size?: number;
  }>;
}

interface Conversation {
  id: string;
  contactId: string;
  orderId?: string;
  title: string;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  encryptionEnabled: boolean;
}

interface CallSession {
  id: string;
  contactId: string;
  type: 'audio' | 'video';
  status: 'connecting' | 'ringing' | 'active' | 'ended';
  startTime?: string;
  duration?: number;
}

const SellerMessaging: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactUserId, setContactUserId] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Données mock
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      userId: '482GN',
      name: 'Client Premium',
      role: 'client',
      status: 'online',
      totalOrders: 15,
      rating: 4.8
    },
    {
      id: '2',
      userId: '529M',
      name: 'Livreur Express',
      role: 'courier',
      status: 'away',
      totalOrders: 50,
      rating: 4.9
    },
    {
      id: '3',
      userId: '371LK',
      name: 'Client Business',
      role: 'client',
      status: 'online',
      totalOrders: 8,
      rating: 4.7
    }
  ]);

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv_1',
      contactId: '1',
      orderId: 'ORD123',
      title: 'Commande #ORD123',
      unreadCount: 2,
      isPinned: true,
      isArchived: false,
      createdAt: '2024-01-20T10:00:00Z',
      updatedAt: '2024-01-20T15:30:00Z',
      encryptionEnabled: true
    }
  ]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    'conv_1': [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        senderId: '482GN',
        content: 'Bonjour, j\'ai une question sur ma commande',
        type: 'text',
        timestamp: '2024-01-20T15:20:00Z',
        readBy: ['482GN'],
        encrypted: true
      },
      {
        id: 'msg_2',
        conversationId: 'conv_1',
        senderId: 'seller',
        content: 'Bonjour ! Je suis là pour vous aider. De quoi s\'agit-il ?',
        type: 'text',
        timestamp: '2024-01-20T15:25:00Z',
        readBy: ['seller', '482GN'],
        encrypted: true
      }
    ]
  });

  const quickResponses = [
    "Bonjour ! Comment puis-je vous aider ?",
    "Votre commande est en cours de traitement.",
    "Le produit sera expédié dans les 24h.",
    "Merci de votre patience.",
    "N'hésitez pas si vous avez d'autres questions !",
    "Votre commande a été expédiée avec le numéro de suivi :",
    "Le livreur sera chez vous dans 15-30 minutes."
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContactById = (contactId: string) => {
    return contacts.find(c => c.id === contactId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-emerald-500';
      case 'away': return 'bg-amber-500';
      case 'offline': return 'bg-slate-400';
      default: return 'bg-slate-400';
    }
  };

  const handleSendMessage = (type: 'text' | 'quick' = 'text', content?: string) => {
    if (!selectedConversation) return;
    
    const messageContent = content || newMessage.trim();
    if (!messageContent && type === 'text') return;

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation,
      senderId: 'seller',
      content: messageContent,
      type: type === 'quick' ? 'text' : type,
      timestamp: new Date().toISOString(),
      readBy: ['seller'],
      encrypted: true
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMsg]
    }));

    if (type === 'text') {
      setNewMessage('');
    }

    toast({
      title: "Message envoyé",
      description: "Votre message chiffré a été envoyé avec succès",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        sendVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Enregistrement vocal",
        description: "Appuyez à nouveau pour arrêter l'enregistrement",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'accéder au microphone",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendVoiceMessage = (audioBlob: Blob) => {
    if (!selectedConversation) return;

    const audioUrl = URL.createObjectURL(audioBlob);
    const duration = Math.floor(Math.random() * 30) + 5; // Mock duration

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId: selectedConversation,
      senderId: 'seller',
      content: 'Message vocal',
      type: 'voice',
      timestamp: new Date().toISOString(),
      readBy: ['seller'],
      encrypted: true,
      voiceDuration: duration,
      attachments: [{
        type: 'audio',
        url: audioUrl,
        name: 'voice_message.wav',
        size: audioBlob.size
      }]
    };

    setMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMsg]
    }));

    toast({
      title: "Message vocal envoyé",
      description: `Durée: ${duration}s - Chiffré de bout en bout`,
    });
  };

  const initiateCall = (type: 'audio' | 'video') => {
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    const callSession: CallSession = {
      id: `call_${Date.now()}`,
      contactId: conversation.contactId,
      type,
      status: 'connecting'
    };

    setCurrentCall(callSession);

    toast({
      title: `Appel ${type}`,
      description: "Connexion en cours via WebRTC sécurisé...",
    });

    // Simuler la connexion
    setTimeout(() => {
      setCurrentCall(prev => prev ? { ...prev, status: 'ringing' } : null);
    }, 1000);

    setTimeout(() => {
      setCurrentCall(prev => prev ? { 
        ...prev, 
        status: 'active', 
        startTime: new Date().toISOString() 
      } : null);
    }, 3000);
  };

  const endCall = () => {
    if (currentCall) {
      const duration = currentCall.startTime 
        ? Math.floor((Date.now() - new Date(currentCall.startTime).getTime()) / 1000)
        : 0;

      toast({
        title: "Appel terminé",
        description: `Durée: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
      });
    }
    setCurrentCall(null);
  };

  const addContactByUserId = () => {
    if (!validateUserId(contactUserId)) {
      toast({
        title: "ID invalide",
        description: "Format requis: chiffres + 2 lettres (ex: 6693JW)",
        variant: "destructive"
      });
      return;
    }

    const existingContact = contacts.find(c => c.userId === contactUserId);
    if (existingContact) {
      toast({
        title: "Contact existant",
        description: "Ce contact est déjà dans votre liste",
        variant: "destructive"
      });
      return;
    }

    const newContact: Contact = {
      id: `contact_${Date.now()}`,
      userId: contactUserId,
      name: `Utilisateur ${contactUserId}`,
      role: contactUserId.endsWith('L') ? 'courier' : 'client',
      status: 'offline'
    };

    setContacts(prev => [...prev, newContact]);
    setContactUserId('');
    setShowContactDialog(false);

    toast({
      title: "Contact ajouté",
      description: `${newContact.name} (${contactUserId}) a été ajouté avec succès`,
    });
  };

  const filteredConversations = conversations.filter(conv => {
    const contact = getContactById(conv.contactId);
    if (!contact) return false;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.userId.toLowerCase().includes(searchLower) ||
      conv.title.toLowerCase().includes(searchLower)
    );
  });

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const selectedContact = selectedConversationData ? getContactById(selectedConversationData.contactId) : null;

  return (
    <div className="h-full flex bg-gradient-to-br from-background to-muted/20">
      {/* Sidebar avec contacts et conversations */}
      <div className="w-80 border-r border-border flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Messagerie Sécurisée
            </h2>
            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Users className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un contact par ID</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">ID Utilisateur</label>
                    <Input
                      placeholder="Ex: 6693JW, 1234AB"
                      value={contactUserId}
                      onChange={(e) => setContactUserId(e.target.value.toUpperCase())}
                      maxLength={8}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: 4+ chiffres + 2 lettres (ex: 6693JW)
                    </p>
                  </div>
                  <Button onClick={addContactByUserId} className="w-full">
                    Ajouter Contact
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID ou nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Liste des conversations */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => {
              const contact = getContactById(conversation.contactId);
              if (!contact) return null;

              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedConversation === conversation.id ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg">
                        {contact.userId.slice(0, 2)}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(contact.status)}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{contact.name}</p>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs h-5 w-5 flex items-center justify-center p-0">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>ID: {contact.userId}</span>
                        <span>•</span>
                        <Badge variant="outline" className="h-4 text-xs">
                          {contact.role === 'client' ? 'Client' : 'Livreur'}
                        </Badge>
                        {conversation.encryptionEnabled && (
                          <Shield className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                      
                      {conversation.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col h-full">
        {selectedConversation && selectedContact ? (
          <>
            {/* Header du chat */}
            <div className="p-4 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium shadow-lg">
                      {selectedContact.userId.slice(0, 2)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(selectedContact.status)}`} />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{selectedContact.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>ID: {selectedContact.userId}</span>
                      <span>•</span>
                      <span className="capitalize">{selectedContact.status}</span>
                      {selectedConversationData?.encryptionEnabled && (
                        <>
                          <span>•</span>
                          <Shield className="w-3 h-3 text-green-500" />
                          <span className="text-green-600">E2EE</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => initiateCall('audio')}
                    disabled={!!currentCall}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => initiateCall('video')}
                    disabled={!!currentCall}
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Appel en cours */}
            {currentCall && (
              <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {currentCall.type === 'video' ? (
                      <Video className="w-5 h-5 text-teal-600" />
                    ) : (
                      <Phone className="w-5 h-5 text-teal-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        Appel {currentCall.type} • {currentCall.status}
                      </p>
                      {currentCall.startTime && (
                        <p className="text-sm text-muted-foreground">
                          En cours...
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={endCall}>
                    <PhoneOff className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {(messages[selectedConversation] || []).map((message) => {
                  const isOwn = message.senderId === 'seller';
                  
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
                        {!isOwn && (
                          <div className="mb-1 flex items-center space-x-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              {message.senderId}
                            </span>
                            {message.encrypted && (
                              <Shield className="w-3 h-3 text-green-500" />
                            )}
                          </div>
                        )}
                        
                        <div className={`rounded-lg p-3 ${
                          isOwn 
                            ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white ml-auto shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}>
                          {message.type === 'voice' ? (
                            <div className="flex items-center space-x-2">
                              <Headphones className="w-4 h-4" />
                              <span className="text-sm">Message vocal</span>
                              <span className="text-xs">({message.voiceDuration}s)</span>
                              <Button variant="ghost" size="sm" className="p-1 h-6">
                                <Play className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm">{message.content}</p>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${
                              isOwn ? 'text-white/70' : 'text-muted-foreground'
                            }`}>
                              {formatTime(message.timestamp)}
                            </span>
                            
                            {isOwn && (
                              <div className="flex items-center space-x-1">
                                {message.encrypted && (
                                  <Shield className="w-3 h-3 text-white/70" />
                                )}
                                <CheckCheck className={`w-3 h-3 ${
                                  message.readBy.length > 1 
                                    ? 'text-emerald-300' 
                                    : 'text-white/50'
                                }`} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Réponses rapides */}
            <div className="px-4 py-2 border-t border-border bg-muted/20">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickResponses.slice(0, 3).map((response, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => handleSendMessage('quick', response)}
                  >
                    {response.length > 30 ? response.substring(0, 30) + '...' : response}
                  </Button>
                ))}
              </div>
            </div>

            {/* Zone de saisie */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={isRecording ? 'text-red-500' : ''}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
                
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message chiffré de bout en bout..."
                  className="flex-1"
                />
                
                <Button 
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Messages chiffrés E2EE activé</span>
                </div>
                <span>Appuyez sur Entrée pour envoyer</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Sélectionnez une conversation</h3>
              <p className="text-muted-foreground mb-4">
                Choisissez un contact pour commencer à communiquer en sécurité
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Chiffrement de bout en bout</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>Appels audio/vidéo sécurisés</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span>Conversations auditables par l'admin</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerMessaging;