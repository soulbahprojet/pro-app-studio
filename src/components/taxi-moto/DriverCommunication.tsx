import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSquare, Phone, Send, Search, Building, Users, Bell } from "lucide-react";

const DriverCommunication: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [activeChat, setActiveChat] = useState<number | null>(null);

  const conversations = [
    {
      id: 1,
      type: 'client',
      name: 'Mamadou Diallo',
      lastMessage: 'Je suis arrivé au point de rendez-vous',
      timestamp: '14:30',
      unread: 2,
      avatar: '/placeholder-avatar.jpg',
      phone: '+224 123 456 789',
      status: 'active_ride'
    },
    {
      id: 2,
      type: 'union',
      name: 'Bureau Syndicat Conakry',
      lastMessage: 'Nouvelle mission disponible dans votre zone',
      timestamp: '13:45',
      unread: 0,
      avatar: '/placeholder-union.jpg',
      phone: '+224 666 777 888'
    },
    {
      id: 3,
      type: 'client',
      name: 'Fatoumata Camara',
      lastMessage: 'Merci pour le trajet !',
      timestamp: '12:20',
      unread: 0,
      avatar: '/placeholder-avatar.jpg',
      phone: '+224 987 654 321',
      status: 'completed'
    },
    {
      id: 4,
      type: 'support',
      name: 'Support Technique',
      lastMessage: 'Votre problème a été résolu',
      timestamp: '11:30',
      unread: 1,
      avatar: '/placeholder-support.jpg',
      phone: '+224 800 900 000'
    }
  ];

  const chatMessages = [
    {
      id: 1,
      sender: 'client',
      message: 'Bonjour, je vous attends devant la pharmacie',
      timestamp: '14:25',
      type: 'text'
    },
    {
      id: 2,
      sender: 'me',
      message: 'Parfait, j\'arrive dans 2 minutes',
      timestamp: '14:26',
      type: 'text'
    },
    {
      id: 3,
      sender: 'client',
      message: 'Je suis arrivé au point de rendez-vous',
      timestamp: '14:30',
      type: 'text'
    }
  ];

  const quickMessages = [
    "J'arrive dans 5 minutes",
    "Je suis devant votre localisation",
    "Pouvez-vous sortir s'il vous plaît ?",
    "Merci pour le trajet !",
    "Je ne trouve pas l'adresse",
    "Course terminée avec succès"
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Envoi message:', newMessage);
      setNewMessage('');
    }
  };

  const handleCall = (phone: string) => {
    console.log('Appel vers:', phone);
  };

  const selectedConversation = conversations.find(c => c.id === activeChat);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Conversations List */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une conversation..."
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
                  className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors border-l-4 ${
                    activeChat === conversation.id 
                      ? 'bg-muted border-l-primary' 
                      : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback>
                          {conversation.type === 'client' && <Users className="h-5 w-5" />}
                          {conversation.type === 'union' && <Building className="h-5 w-5" />}
                          {conversation.type === 'support' && <MessageSquare className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.status === 'active_ride' && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{conversation.name}</p>
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.lastMessage}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {conversation.type === 'client' && 'Client'}
                          {conversation.type === 'union' && 'Syndicat'}
                          {conversation.type === 'support' && 'Support'}
                        </Badge>
                        {conversation.status === 'active_ride' && (
                          <Badge variant="secondary" className="text-xs">Course active</Badge>
                        )}
                      </div>
                    </div>
                    
                    {conversation.unread > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2">
        {selectedConversation ? (
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.avatar} />
                    <AvatarFallback>
                      {selectedConversation.type === 'client' && <Users className="h-5 w-5" />}
                      {selectedConversation.type === 'union' && <Building className="h-5 w-5" />}
                      {selectedConversation.type === 'support' && <MessageSquare className="h-5 w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedConversation.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.type === 'client' && 'Client'}
                      {selectedConversation.type === 'union' && 'Bureau Syndicat'}
                      {selectedConversation.type === 'support' && 'Support Technique'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCall(selectedConversation.phone)}
                  className="flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Appeler
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'me'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'me' 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Messages */}
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Messages rapides:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickMessages.slice(0, 4).map((msg, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewMessage(msg)}
                      className="text-xs h-8 justify-start"
                    >
                      {msg}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex items-center justify-center">
            <CardContent className="text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Sélectionnez une conversation pour commencer
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DriverCommunication;
