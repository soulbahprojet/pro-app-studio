import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { 
  ArrowLeft,
  Search,
  Phone,
  Video,
  Info,
  Send,
  Plus,
  Camera as CameraIcon,
  Image,
  Smile,
  MoreVertical,
  PhoneOff,
  VideoOff,
  MicOff,
  VolumeX,
  Volume2,
  FileText,
  Mic
} from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  role?: 'client' | 'seller' | 'courier';
  isTyping?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'system';
  timestamp: string;
  isRead: boolean;
  isOwn: boolean;
  attachments?: any[];
}

interface Conversation {
  id: string;
  contactId: string;
  title: string;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

interface CallState {
  isActive: boolean;
  type: 'audio' | 'video';
  contactId: string;
  status: 'connecting' | 'ringing' | 'active' | 'ended';
  isMuted: boolean;
  isVideoOff: boolean;
  duration: number;
}

interface MessengerInterfaceProps {
  userRole: 'client' | 'seller' | 'courier';
}

const MessengerInterface: React.FC<MessengerInterfaceProps> = ({ userRole }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [callState, setCallState] = useState<CallState | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const callIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Mock data - à remplacer par les vraies données Supabase
  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Lamine Balde (482GN)',
      avatar: '/placeholder.svg',
      status: 'online',
      role: 'client'
    },
    {
      id: '2', 
      name: 'Hadyâ Bàh (371LK)',
      avatar: '/placeholder.svg',
      status: 'online',
      role: 'seller'
    },
    {
      id: '3',
      name: 'Americain Diallo (248FR)',
      avatar: '/placeholder.svg',
      status: 'away',
      role: 'client'
    },
    {
      id: '4',
      name: 'Fatim Bang\'s Shop (VDR-0034)',
      avatar: '/placeholder.svg',
      status: 'offline',
      role: 'seller',
      lastSeen: '2h'
    }
  ]);

  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      contactId: '1',
      title: 'Lamine Balde (482GN)',
      lastMessage: {
        id: '1',
        senderId: '1',
        content: 'Oui c\'est yataya',
        type: 'text',
        timestamp: new Date().toISOString(),
        isRead: false,
        isOwn: false
      },
      unreadCount: 0,
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      contactId: '2',
      title: 'Hadyâ Bàh (371LK)',
      lastMessage: {
        id: '2',
        senderId: '2',
        content: 'Vous avez envoyé un message vocal',
        type: 'voice',
        timestamp: new Date().toISOString(),
        isRead: true,
        isOwn: true
      },
      unreadCount: 0,
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      contactId: '3',
      title: 'Americain Diallo (248FR)',
      lastMessage: {
        id: '3',
        senderId: '3',
        content: 'Les messages et les appels sont s...',
        type: 'text',
        timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
        isOwn: false
      },
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]);

  const [messages] = useState<Record<string, Message[]>>({
    '1': [
      {
        id: '1',
        senderId: '482GN',
        content: 'Salut ! Comment ça va ?',
        type: 'text',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
        isOwn: false
      },
      {
        id: '2',
        senderId: user?.id || 'current',
        content: 'Ça va bien merci ! Et toi ?',
        type: 'text',
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        isRead: true,
        isOwn: true
      },
      {
        id: '3',
        senderId: '482GN',
        content: 'Oui c\'est yataya',
        type: 'text',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        isRead: false,
        isOwn: false
      }
    ]
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  useEffect(() => {
    if (callState?.isActive && callState.status === 'active') {
      callIntervalRef.current = setInterval(() => {
        setCallState(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
      }, 1000);
    } else {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
        callIntervalRef.current = null;
      }
    }

    return () => {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current);
      }
    };
  }, [callState?.status]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-primary';
      case 'away': return 'bg-accent';
      case 'offline': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24);
      return `${days} jour${days > 1 ? 's' : ''}`;
    } else {
      return messageTime.toLocaleDateString('fr-FR');
    }
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = (type: 'audio' | 'video') => {
    if (!selectedConversation) return;
    
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return;

    setCallState({
      isActive: true,
      type,
      contactId: conversation.contactId,
      status: 'connecting',
      isMuted: false,
      isVideoOff: type === 'audio',
      duration: 0
    });

    // Simuler la progression de l'appel
    setTimeout(() => {
      setCallState(prev => prev ? { ...prev, status: 'ringing' } : null);
    }, 1000);

    setTimeout(() => {
      setCallState(prev => prev ? { ...prev, status: 'active' } : null);
      toast({
        title: `Appel ${type} connecté`,
        description: 'Communication sécurisée établie'
      });
    }, 3000);
  };

  const endCall = () => {
    if (callState) {
      toast({
        title: 'Appel terminé',
        description: `Durée: ${formatCallDuration(callState.duration)}`
      });
    }
    setCallState(null);
  };

  const toggleMute = () => {
    setCallState(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  };

  const toggleVideo = () => {
    setCallState(prev => prev ? { ...prev, isVideoOff: !prev.isVideoOff } : null);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    // Ici, on intégrerait avec Supabase
    toast({
      title: 'Message envoyé',
      description: 'Votre message a été livré'
    });

    setNewMessage('');
  };

  // Fonctions pour les boutons d'actions
  const handleAttachments = () => {
    setShowAttachments(!showAttachments);
    toast({
      title: 'Pièces jointes',
      description: 'Sélectionnez le type de fichier à envoyer'
    });
  };

  const handleCamera = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        toast({
          title: 'Photo capturée !',
          description: 'Photo prise avec la caméra native'
        });
        
        // Ici on peut envoyer la photo directement
        // ou l'ajouter aux messages avec image.dataUrl
        console.log('Photo data URL:', image.dataUrl.substring(0, 50) + '...');
      }
    } catch (error) {
      console.error('Erreur caméra:', error);
      toast({
        title: 'Erreur caméra',
        description: 'Impossible d\'accéder à la caméra',
        variant: 'destructive'
      });
    }
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePDFSelect = () => {
    const pdfInput = document.getElementById('pdf-input') as HTMLInputElement;
    pdfInput?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      toast({
        title: `${fileType === 'image' ? 'Image' : 'Fichier'} sélectionné`,
        description: `${file.name} (${Math.round(file.size / 1024)}KB)`
      });
      
      // Ici on intégrerait l'upload du fichier
      // const reader = new FileReader();
      // reader.onload = (e) => { ... };
      // reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handlePDFFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        toast({
          title: 'PDF sélectionné',
          description: `${file.name} (${Math.round(file.size / 1024)}KB)`
        });
        // Traitement spécifique PDF
      } else {
        toast({
          title: 'Format non supporté',
          description: 'Veuillez sélectionner un fichier PDF uniquement',
          variant: 'destructive'
        });
      }
    }
    event.target.value = '';
  };

  const startVoiceRecording = async () => {
    if (isRecording) {
      stopVoiceRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      const audioChunks: Blob[] = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const duration = Math.floor(Math.random() * 30) + 5; // Mock duration
        
        toast({
          title: 'Message vocal envoyé',
          description: `Durée: ${duration}s`
        });

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      toast({
        title: 'Enregistrement en cours...',
        description: 'Parlez maintenant, cliquez à nouveau pour arrêter'
      });
    } catch (error) {
      toast({
        title: 'Erreur microphone',
        description: 'Impossible d\'accéder au microphone',
        variant: 'destructive'
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleEmojis = () => {
    setShowEmojis(!showEmojis);
    // Mock emojis populaires
    const popularEmojis = ['😊', '😂', '❤️', '👍', '🔥', '💯', '😍', '🎉'];
    const randomEmoji = popularEmojis[Math.floor(Math.random() * popularEmojis.length)];
    
    toast({
      title: 'Emojis',
      description: `Suggestion: ${randomEmoji}`
    });
  };

  const selectedContact = selectedConversation 
    ? contacts.find(c => c.id === conversations.find(conv => conv.id === selectedConversation)?.contactId)
    : null;

  const conversationMessages = selectedConversation ? messages[selectedConversation] || [] : [];

    // Interface en appel
    if (callState?.isActive) {
      return (
        <div className="h-screen bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
          <div className="bg-background/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 border border-primary/20">
            <div className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-primary/20">
                <AvatarImage src={selectedContact?.avatar} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                  {selectedContact?.name[0]}
                </AvatarFallback>
              </Avatar>
            
            <h2 className="text-xl font-semibold mb-2">{selectedContact?.name}</h2>
            
            <div className="text-muted-foreground mb-6">
              {callState.status === 'connecting' && 'Connexion...'}
              {callState.status === 'ringing' && 'Sonnerie...'}
              {callState.status === 'active' && formatCallDuration(callState.duration)}
            </div>

            <div className="flex justify-center gap-4">
              <Button
                size="icon"
                variant={callState.isMuted ? 'destructive' : 'outline'}
                onClick={toggleMute}
                className="h-14 w-14 rounded-full"
              >
                {callState.isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </Button>

              {callState.type === 'video' && (
                <Button
                  size="icon"
                  variant={callState.isVideoOff ? 'destructive' : 'outline'}
                  onClick={toggleVideo}
                  className="h-14 w-14 rounded-full"
                >
                  {callState.isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>
              )}

              <Button
                size="icon"
                variant="destructive"
                onClick={endCall}
                className="h-14 w-14 rounded-full"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interface de chat
  if (selectedConversation) {
    return (
      <div className="h-full bg-background flex flex-col">
        {/* Header du chat */}
        <div className="bg-background/95 backdrop-blur-sm border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedConversation(null)}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedContact?.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedContact?.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(selectedContact?.status || 'offline')}`} />
                </div>
                
                <div>
                  <h2 className="font-semibold text-base">{selectedContact?.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedContact?.status === 'online' ? 'En ligne' : 
                     selectedContact?.status === 'away' ? 'Absent(e)' : 
                     `Vu ${selectedContact?.lastSeen || 'récemment'}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => startCall('audio')}
                className="rounded-full h-10 w-10"
              >
                <Phone className="h-5 w-5" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => startCall('video')}
                className="rounded-full h-10 w-10"
              >
                <Video className="h-5 w-5" />
              </Button>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowProfile(true)}
                className="rounded-full h-10 w-10"
              >
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {conversationMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.isOwn
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Zone de saisie */}
        <div className="border-t bg-background p-4">
          {/* Inputs cachés pour les fichiers */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <input
            id="pdf-input"
            type="file"
            onChange={handlePDFFileSelect}
            accept=".pdf,application/pdf"
            className="hidden"
          />
          
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full"
              onClick={handleAttachments}
            >
              <Plus className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full"
              onClick={handleCamera}
              title="Prendre une photo"
            >
              <CameraIcon className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full"
              onClick={handleImageSelect}
              title="Sélectionner une image"
            >
              <Image className="h-5 w-5" />
            </Button>

            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full"
              onClick={handlePDFSelect}
              title="Sélectionner un PDF"
            >
              <FileText className="h-5 w-5" />
            </Button>
            
            <Button 
              size="icon" 
              variant={isRecording ? "destructive" : "ghost"}
              className="rounded-full"
              onClick={startVoiceRecording}
              title="Message vocal"
            >
              <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
            </Button>

            <Input
              placeholder="Message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 rounded-full border-none bg-muted focus-visible:ring-0"
            />

            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full"
              onClick={handleEmojis}
              title="Emojis"
            >
              <Smile className="h-5 w-5" />
            </Button>

            {newMessage.trim() ? (
              <Button size="icon" onClick={sendMessage} className="rounded-full">
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                size="icon" 
                variant={isRecording ? "destructive" : "ghost"}
                className="rounded-full"
                onClick={startVoiceRecording}
                title="Message vocal"
              >
                <Mic className={`h-5 w-5 ${isRecording ? 'animate-pulse' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Liste des conversations
  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header principal */}
      <div className="bg-background/95 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-primary">messenger</h1>
          <Button size="icon" variant="ghost" className="rounded-full">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Demander à Meta AI ou rechercher"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full border-none bg-muted focus-visible:ring-0"
          />
        </div>
      </div>

      {/* Stories/Quick actions */}
      <div className="px-4 py-3">
        <div className="flex gap-4 overflow-x-auto">
          <div className="flex flex-col items-center min-w-0">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xs mt-1 text-center">Créer une st...</span>
          </div>
          
          {contacts.filter(c => c.status === 'online').map(contact => (
            <div key={contact.id} className="flex flex-col items-center min-w-0">
              <div className="relative">
                <Avatar className="h-14 w-14 ring-2 ring-primary">
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
              </div>
              <span className="text-xs mt-1 text-center truncate w-14">{contact.name.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des conversations */}
      <ScrollArea className="flex-1">
        <div className="px-2">
          {conversations.map((conversation) => {
            const contact = contacts.find(c => c.id === conversation.contactId);
            if (!contact) return null;

            return (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {contact.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(contact.status)}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">{contact.name}</h3>
                    <div className="flex items-center gap-2">
                      {conversation.unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.updatedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage?.type === 'voice' && 'Vous: '}
                    {conversation.lastMessage?.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Dialog profil */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil du contact</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="text-center py-4">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={selectedContact.avatar} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {selectedContact.name[0]}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold mb-2">{selectedContact.name}</h3>
              <p className="text-muted-foreground mb-4">
                {selectedContact.role === 'client' ? 'Client' : 
                 selectedContact.role === 'seller' ? 'Marchand' : 'Livreur'}
              </p>
              <p className="text-sm text-muted-foreground">
                Vous êtes ami(e)s sur la plateforme
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessengerInterface;