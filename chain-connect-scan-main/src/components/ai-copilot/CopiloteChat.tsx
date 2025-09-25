import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, AlertCircle, CheckCircle, Clock, Zap, Settings, Database, Shield, Cloud } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'system' | 'ai';
  content: string;
  timestamp: Date;
  data?: any;
}

interface SystemStatus {
  component: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
}

const CopiloteChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Message de bienvenue
    setMessages([{
      id: '1',
      type: 'ai',
      content: 'Bonjour ! Je suis votre copilote AI pour le système PDG. Je peux analyser le système, détecter les problèmes et proposer des solutions. Tapez "status" pour un rapport complet.',
      timestamp: new Date()
    }]);
    
    // Vérification automatique au démarrage
    checkSystemStatus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkSystemStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('copilote', {
        body: { action: 'system_check' }
      });

      if (error) throw error;

      setSystemStatus(data.report.results);
      
      const message: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `Rapport système : ${data.report.summary}`,
        timestamp: new Date(),
        data: data.report.results
      };
      
      setMessages(prev => [...prev, message]);

      // Ajouter l'analyse AI
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: data.analysis,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }, 500);

    } catch (error) {
      console.error('Erreur vérification système:', error);
      toast.error('Erreur lors de la vérification du système');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Commandes spéciales
      if (input.toLowerCase() === 'status') {
        setInput('');
        await checkSystemStatus();
        setIsLoading(false);
        return;
      }

      // Utiliser la nouvelle fonction ai-prompt pour les conversations directes
      const { data, error } = await supabase.functions.invoke('ai-prompt', {
        body: { 
          prompt: input,
          target: 'PDG System Chat'
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.preview || data.response,
        timestamp: new Date(),
        data: data.metadata
      };

      setMessages(prev => [...prev, aiMessage]);

      // Détecter si l'AI propose des actions
      if (data.response.includes('redémarrer') || data.response.includes('corriger') || data.response.includes('action')) {
        setPendingActions([
          { id: '1', action: 'restart_function', description: 'Redémarrer les fonctions Edge en erreur' },
          { id: '2', action: 'clear_cache', description: 'Vider le cache système' }
        ]);
      }

    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'system',
        content: `Erreur: ${error.message}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const executeAction = async (actionId: string, action: string) => {
    try {
      setIsLoading(true);
      
      // Simulation notification mobile
      const shouldExecute = window.confirm(
        `🔔 NOTIFICATION MOBILE\n\nLe copilote demande l'approbation pour:\n"${pendingActions.find(a => a.id === actionId)?.description}"\n\nAutoriser cette action ?`
      );

      if (!shouldExecute) {
        toast.info('Action annulée par l\'utilisateur');
        return;
      }

      const { data, error } = await supabase.functions.invoke('copilote', {
        body: { 
          action: 'execute_action',
          target: action,
          executeActions: true
        }
      });

      if (error) throw error;

      const resultMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: `✅ Action exécutée: ${data.message}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, resultMessage]);
      setPendingActions(prev => prev.filter(a => a.id !== actionId));
      
      toast.success('Action exécutée avec succès');

    } catch (error) {
      console.error('Erreur exécution action:', error);
      toast.error('Erreur lors de l\'exécution');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getComponentIcon = (component: string) => {
    switch (component) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'auth': return <Shield className="h-4 w-4" />;
      case 'storage': return <Cloud className="h-4 w-4" />;
      case 'openai': return <Bot className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat principal */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Copilote AI - Discussion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96 mb-4 p-4 border rounded-lg">
              {messages.map((message) => (
                <div key={message.id} className="mb-4">
                  <div className={`flex items-start gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                    <div className={`flex items-center gap-2 ${message.type === 'user' ? 'order-2' : ''}`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : message.type === 'ai' ? (
                        <Bot className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Settings className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : ''}`}>
                      <div className={`p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground ml-auto' 
                          : message.type === 'ai'
                          ? 'bg-blue-50 text-blue-900'
                          : 'bg-orange-50 text-orange-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Posez une question sur le système PDG..."
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isLoading}
              />
              <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Clock className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => setInput('status')}>
                Status Système
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput('Vérifier les fonctions Edge')}>
                Vérifier Edge Functions
              </Button>
              <Button variant="outline" size="sm" onClick={() => setInput('Analyser les erreurs récentes')}>
                Analyser Erreurs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Panneau de contrôle */}
      <div className="space-y-6">
        {/* État du système */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">État du Système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemStatus.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getComponentIcon(status.component)}
                  <span className="text-sm capitalize">{status.component}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.status)}
                  <Badge variant={status.status === 'ok' ? 'default' : status.status === 'warning' ? 'secondary' : 'destructive'}>
                    {status.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions en attente */}
        {pendingActions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Actions Proposées
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingActions.map((action) => (
                <div key={action.id} className="space-y-2">
                  <p className="text-sm">{action.description}</p>
                  <Button
                    size="sm"
                    onClick={() => executeAction(action.id, action.action)}
                    disabled={isLoading}
                  >
                    Exécuter
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Actions Rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={checkSystemStatus}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Vérification Complète
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setInput('Redémarre toutes les fonctions qui échouent')}>
              <Zap className="h-4 w-4 mr-2" />
              Auto-Correction
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setInput('Génère un rapport détaillé du système')}>
              <Settings className="h-4 w-4 mr-2" />
              Rapport Détaillé
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CopiloteChat;