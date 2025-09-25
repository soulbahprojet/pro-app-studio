import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { 
  MessageSquare, 
  Phone, 
  Video, 
  Send, 
  Paperclip, 
  Mic,
  User,
  MapPin,
  Clock,
  Search
} from "lucide-react";
import { useToast } from "../ui/use-toast";

const DriverCommunication: React.FC = () => {
  const [activeChat, setActiveChat] = useState<number | null>(1);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const conversations = [
    {
      id: 1,
      type: 'client',
      name: 'Mamadou Diallo',
      avatar: '/avatars/client1.jpg',
      lastMessage: 'Je suis en route, j\'arrive dans 2 minutes',
      timestamp: '14:32',
      unread: 0,
      status: 'active',
      phone: '+224 123 456 789',
      currentTrip: {
        pickup: 'Sandervalia',
        destination: 'Kaloum',
        estimatedTime: '2 min'
      }
    },
    {
      id: 2,
      type: 'client',
      name: 'Fatoumata Camara',
      avatar: '/avatars/client2.jpg',
      lastMessage: 'Merci pour la course rapide !',
      timestamp: '13:45',
      unread: 0,
      status: 'completed',
      phone: '+224 987 654 321'
    },
    {
      id: 3,
      type: 'support',
      name: 'Support Technique',
      avatar: '/avatars/support.jpg',
      lastMessage: 'Votre demande a été traitée avec succès',
      timestamp: '12:30',
      unread: 1,
      status: 'support',
      phone: '+224 100 200 300'
    },
    {
      id: 4,
      type: 'client',
      name: 'Alpha Barry',
      avatar: '/avatars/client3.jpg',
      lastMessage: 'Pouvez-vous m\'attendre 5 minutes ?',
      timestamp: '11:20',
      unread: 2,
      status: 'waiting',
      phone: '+224 555 777 888',
      currentTrip: {
        pickup: 'Aéroport',
        destination: 'Hôtel Novotel',
        estimatedTime: '5 min'
      }
    }
  ];

  const chatMessages = [
    {
      id: 1,
      sender: 'client',
      message: 'Bonjour, je vous attends à l\'entrée principale',
      timestamp: '14:25',
      type: 'text'
    },
    {
      id: 2,
      sender: 'driver',
      message: 'Parfait, je suis en route. J\'arrive dans 5 minutes.',
      timestamp: '14:26',
      type: 'text'
    },
    {
      id: 3,
      sender: 'client',
      message: 'D\'accord, merci !',
      timestamp: '14:27',
      type: 'text'
    },
    {
      id: 4,
      sender: 'driver',
      message: 'Je suis arrivé, véhicule bleu devant l\'entrée',
      timestamp: '14:30',
      type: 'text'
    },
    {
      id: 5,
      sender: 'client',
      message: 'Je vous vois, j\'arrive',
      timestamp: '14:31',
      type: 'text'
    }
  ];

  const quickReplies = [
    "J'arrive dans 2 minutes",
    "Je suis arrivé",
    "Où êtes-vous exactement ?",
    "Pouvez-vous sortir s'il vous plaît ?",
    "Merci pour la course !",
    "Bonne journée !"
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès.",
      });
      setNewMessage('');
    }
  };

  const handleCall = (phone: string, type: 'voice' | 'video' = 'voice') => {
    toast({
      title: type === 'voice' ? "Appel vocal" : "Appel vidéo",
      description: `Appel vers ${phone}`,
    });
  };

  const activeConversation = conversations.find(conv => conv.id === activeChat);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setActiveChat(conversation.id)}
                className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                  activeChat === conversation.id ? 'bg-primary/10 border-r-2 border-r-primary' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.avatar} />
                      <AvatarFallback>
                        {conversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.status === 'active' && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{conversation.name}</p>
                      <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between mt-1">
                      <Badge 
                        variant={conversation.type === 'support' ? 'secondary' : 'outline'}
                        className="text-xs"
                      >
                        {conversation.type === 'client' ? 'Client' : 'Support'}
                      </Badge>
                      
                      {conversation.unread > 0 && (
                        <Badge variant="destructive" className="h-5 w-5 p-0 text-xs rounded-full flex items-center justify-center">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="lg:col-span-2 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={activeConversation.avatar} />
                    <AvatarFallback>
                      {activeConversation.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{activeConversation.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {activeConversation.type === 'client' && activeConversation.currentTrip && (
                        <>
                          <MapPin className="h-3 w-3" />
                          <span>{activeConversation.currentTrip.pickup} → {activeConversation.currentTrip.destination}</span>
                          <Clock className="h-3 w-3 ml-2" />
                          <span>ETA: {activeConversation.currentTrip.estimatedTime}</span>
                        </>
                      )}
                      {activeConversation.type === 'support' && (
                        <span>Support technique</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCall(activeConversation.phone, 'voice')}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Appeler
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCall(activeConversation.phone, 'video')}
                    className="flex items-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Vidéo
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'driver' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender === 'driver'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'driver' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            {/* Quick Replies */}
            <div className="px-4 py-2 border-t bg-muted/30">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickReplies.map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap text-xs"
                    onClick={() => setNewMessage(reply)}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Tapez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Sélectionnez une conversation
              </p>
              <p className="text-sm text-muted-foreground">
                Choisissez une conversation pour commencer à discuter
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DriverCommunication;
