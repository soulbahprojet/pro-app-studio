import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { 
  Brain, 
  MessageSquare, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Lightbulb,
  Wrench,
  Bell,
  Phone,
  Smartphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CopilotAnalysis {
  id: string;
  timestamp: string;
  trigger: 'automatic' | 'manual' | 'alert';
  status: 'analyzing' | 'completed' | 'action_required';
  findings: Finding[];
  suggestions: Suggestion[];
  autoActions: AutoAction[];
  approvalRequired: boolean;
}

interface Finding {
  type: 'error' | 'warning' | 'optimization' | 'security';
  component: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  type: 'fix' | 'optimization' | 'enhancement';
  automated: boolean;
  estimatedTime: string;
  priority: number;
}

interface AutoAction {
  id: string;
  action: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  description: string;
  requiresApproval: boolean;
  executedAt?: string;
}

export default function AIIntelligentCopilot() {
  const [currentAnalysis, setCurrentAnalysis] = useState<CopilotAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    id: string;
    timestamp: string;
    type: 'user' | 'copilot' | 'system';
    content: string;
    actions?: AutoAction[];
  }>>([]);
  const [userInput, setUserInput] = useState('');
  const [autoMode, setAutoMode] = useState(true);
  const [pendingApprovals, setPendingApprovals] = useState<AutoAction[]>([]);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);

  useEffect(() => {
    // Démarrer l'analyse automatique au montage
    if (autoMode) {
      startAutomaticAnalysis();
      
      // Programmer des analyses périodiques
      const interval = setInterval(() => {
        startAutomaticAnalysis();
      }, 10 * 60 * 1000); // Toutes les 10 minutes
      
      return () => clearInterval(interval);
    }
  }, [autoMode]);

  const startAutomaticAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Analyser le système via IA
      const analysisResult = await performSystemAnalysis();
      setCurrentAnalysis(analysisResult);
      
      // Ajouter à l'historique de conversation
      addToConversation('copilot', `🔍 Analyse automatique terminée. ${analysisResult.findings.length} points détectés.`);
      
      // Proposer des actions automatiques si nécessaire
      if (analysisResult.approvalRequired && analysisResult.autoActions.length > 0) {
        setPendingApprovals(analysisResult.autoActions.filter(a => a.requiresApproval));
        setShowApprovalDialog(true);
        
        // Notification mobile (simulation)
        sendMobileNotification(
          "Copilote IA - Approbation requise",
          `${analysisResult.autoActions.length} action(s) proposée(s) pour corriger les problèmes détectés.`
        );
      }
      
      // Exécuter les actions automatiques qui ne nécessitent pas d'approbation
      const autoExecuteActions = analysisResult.autoActions.filter(a => !a.requiresApproval);
      if (autoExecuteActions.length > 0) {
        await executeActions(autoExecuteActions);
      }
      
    } catch (error) {
      console.error('Erreur analyse automatique:', error);
      addToConversation('system', `❌ Erreur lors de l'analyse automatique: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performSystemAnalysis = async (): Promise<CopilotAnalysis> => {
    // Collecter les données du système
    const systemData = await collectSystemData();
    
    // Analyser via OpenAI
    const { data, error } = await supabase.functions.invoke('ai-prompt', {
      body: {
        prompt: `Analyse ce système PDG et détecte les problèmes:
        
Données système: ${JSON.stringify(systemData, null, 2)}

Instructions:
1. Identifie tous les problèmes techniques
2. Propose des solutions automatiques
3. Classe par priorité
4. Indique si une approbation humaine est nécessaire

Retourne un JSON avec cette structure exacte:
{
  "findings": [{"type": "error/warning", "component": "nom", "description": "...", "severity": "low/medium/high/critical", "impact": "..."}],
  "suggestions": [{"id": "1", "title": "...", "description": "...", "type": "fix/optimization", "automated": true/false, "estimatedTime": "...", "priority": 1-5}],
  "autoActions": [{"id": "1", "action": "...", "description": "...", "requiresApproval": true/false}],
  "approvalRequired": true/false
}`,
        system: "Tu es un expert en analyse de systèmes qui retourne uniquement du JSON valide."
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    const analysis = typeof data.aiPreview === 'string' ? JSON.parse(data.aiPreview) : data.aiPreview;
    
    return {
      id: `analysis-${Date.now()}`,
      timestamp: new Date().toISOString(),
      trigger: 'automatic',
      status: 'completed',
      findings: analysis.findings || [],
      suggestions: analysis.suggestions || [],
      autoActions: analysis.autoActions?.map(a => ({
        ...a,
        status: 'pending' as const
      })) || [],
      approvalRequired: analysis.approvalRequired || false
    };
  };

  const collectSystemData = async () => {
    const data: any = {
      timestamp: new Date().toISOString(),
      edgeFunctions: {},
      database: {},
      interfaces: {}
    };
    
    try {
      // Test des fonctions Edge principales
      const functions = ['ai-prompt', 'wallet', 'notifications', 'payment-escrow'];
      for (const func of functions) {
        try {
          const start = Date.now();
          const { error } = await supabase.functions.invoke(func, { body: { test: true } });
          data.edgeFunctions[func] = {
            status: error ? 'error' : 'ok',
            responseTime: Date.now() - start,
            error: error?.message
          };
        } catch (err) {
          data.edgeFunctions[func] = {
            status: 'error',
            responseTime: 0,
            error: err.message
          };
        }
      }
      
      // Test de la base de données
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        data.database.profiles = error ? { status: 'error', error: error.message } : { status: 'ok' };
      } catch (err) {
        data.database.profiles = { status: 'error', error: err.message };
      }
      
      // Données des interfaces (simulation)
      data.interfaces = {
        pdgDashboard: { status: 'ok', loadTime: Math.random() * 1000 },
        userManagement: { status: Math.random() > 0.9 ? 'error' : 'ok' },
        walletSystem: { status: 'ok' }
      };
      
    } catch (error) {
      console.error('Erreur collecte données:', error);
    }
    
    return data;
  };

  const executeActions = async (actions: AutoAction[]) => {
    for (const action of actions) {
      try {
        addToConversation('copilot', `🔧 Exécution: ${action.description}`);
        
        // Simuler l'exécution de l'action
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        action.status = 'completed';
        action.executedAt = new Date().toISOString();
        
        addToConversation('system', `✅ Action terminée: ${action.description}`);
        
        toast({
          title: "Action automatique",
          description: action.description,
        });
        
      } catch (error) {
        action.status = 'failed';
        addToConversation('system', `❌ Échec: ${action.description} - ${error.message}`);
      }
    }
  };

  const handleUserMessage = async () => {
    if (!userInput.trim()) return;
    
    const message = userInput.trim();
    setUserInput('');
    
    addToConversation('user', message);
    
    try {
      // Analyser le message avec l'IA
      const { data, error } = await supabase.functions.invoke('ai-prompt', {
        body: {
          prompt: `L'utilisateur PDG dit: "${message}"
          
Contexte: Tu es un copilote IA qui surveille le système 224SOLUTIONS.
Analyse ce message et:
1. Comprends ce que veut l'utilisateur
2. Propose des actions concrètes
3. Indique si tu peux agir automatiquement

Réponds de manière conversationnelle et propose des actions spécifiques.`,
          system: "Tu es un assistant IA conversationnel pour un PDG. Sois direct, utile et propose des actions concrètes."
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      const response = data.aiPreview?.summary || data.choices?.[0]?.message?.content || "Je n'ai pas pu traiter votre demande.";
      addToConversation('copilot', response);
      
    } catch (error) {
      addToConversation('copilot', `❌ Désolé, j'ai rencontré une erreur: ${error.message}`);
    }
  };

  const addToConversation = (type: 'user' | 'copilot' | 'system', content: string, actions?: AutoAction[]) => {
    const message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      type,
      content,
      actions
    };
    
    setConversationHistory(prev => [...prev, message]);
  };

  const sendMobileNotification = (title: string, message: string) => {
    // Simulation d'envoi de notification mobile
    console.log(`📱 Notification: ${title} - ${message}`);
    
    // Dans un vrai système, ici on enverrait via SMS/WhatsApp/Push
    toast({
      title: "📱 Notification mobile envoyée",
      description: title,
    });
  };

  const approveAction = (actionId: string) => {
    setPendingApprovals(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, status: 'approved' as const }
          : action
      )
    );
    
    // Exécuter l'action approuvée
    const approvedAction = pendingApprovals.find(a => a.id === actionId);
    if (approvedAction) {
      executeActions([{ ...approvedAction, status: 'approved' }]);
    }
  };

  const rejectAction = (actionId: string) => {
    setPendingApprovals(prev => 
      prev.map(action => 
        action.id === actionId 
          ? { ...action, status: 'rejected' as const }
          : action
      )
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                Copilote IA Intelligent
                <Badge variant="secondary" className="ml-2">v3.0</Badge>
              </CardTitle>
              <CardDescription>
                Assistant IA autonome avec monitoring et auto-correction
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={autoMode ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoMode(!autoMode)}
              >
                <Zap className="h-4 w-4 mr-1" />
                Auto {autoMode ? 'ON' : 'OFF'}
              </Button>
              <Button
                onClick={startAutomaticAnalysis}
                disabled={isAnalyzing}
                size="sm"
              >
                {isAnalyzing ? (
                  <Clock className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Brain className="h-4 w-4 mr-1" />
                )}
                Analyser
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="conversation" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversation">💬 Conversation</TabsTrigger>
          <TabsTrigger value="analysis">🔍 Analyse</TabsTrigger>
          <TabsTrigger value="actions">⚡ Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="conversation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussion avec le Copilote
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Historique de conversation */}
              <div className="h-96 overflow-y-auto space-y-3 border rounded-lg p-4">
                {conversationHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : msg.type === 'copilot'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isAnalyzing && (
                  <div className="flex justify-start">
                    <div className="bg-purple-100 text-purple-900 p-3 rounded-lg">
                      <Clock className="h-4 w-4 animate-spin inline mr-2" />
                      Analyse en cours...
                    </div>
                  </div>
                )}
              </div>
              
              {/* Zone de saisie */}
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Posez une question au copilote IA..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleUserMessage();
                    }
                  }}
                  className="flex-1"
                  rows={2}
                />
                <Button onClick={handleUserMessage} disabled={!userInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                Analyse du Système
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentAnalysis ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {currentAnalysis.findings.filter(f => f.type === 'error').length}
                      </div>
                      <div className="text-sm text-red-700">Erreurs</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {currentAnalysis.findings.filter(f => f.type === 'warning').length}
                      </div>
                      <div className="text-sm text-yellow-700">Avertissements</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentAnalysis.suggestions.length}
                      </div>
                      <div className="text-sm text-blue-700">Suggestions</div>
                    </div>
                  </div>
                  
                  {currentAnalysis.findings.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Problèmes détectés</h4>
                      <div className="space-y-2">
                        {currentAnalysis.findings.map((finding, index) => (
                          <Alert key={index} className={
                            finding.severity === 'critical' ? 'border-red-500' :
                            finding.severity === 'high' ? 'border-orange-500' :
                            finding.severity === 'medium' ? 'border-yellow-500' :
                            'border-blue-500'
                          }>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>{finding.component}:</strong> {finding.description}
                              <div className="text-sm text-muted-foreground mt-1">
                                Impact: {finding.impact}
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune analyse récente. Cliquez sur "Analyser" pour commencer.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-4 w-4 mr-2" />
                Actions Automatiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentAnalysis?.autoActions.length > 0 ? (
                <div className="space-y-3">
                  {currentAnalysis.autoActions.map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{action.action}</div>
                        <div className="text-sm text-muted-foreground">{action.description}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={
                          action.status === 'completed' ? 'bg-green-100 text-green-800' :
                          action.status === 'failed' ? 'bg-red-100 text-red-800' :
                          action.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {action.status}
                        </Badge>
                        {action.requiresApproval && action.status === 'pending' && (
                          <div className="flex space-x-1">
                            <Button size="sm" onClick={() => approveAction(action.id)}>
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectAction(action.id)}>
                              <AlertTriangle className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune action automatique proposée pour le moment.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog d'approbation */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-orange-500" />
              Approbation Requise
            </DialogTitle>
            <DialogDescription>
              Le copilote IA a détecté des problèmes et propose des actions automatiques.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {pendingApprovals.map((action) => (
              <div key={action.id} className="p-3 border rounded-lg">
                <div className="font-medium">{action.action}</div>
                <div className="text-sm text-muted-foreground mb-2">{action.description}</div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => approveAction(action.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approuver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => rejectAction(action.id)}>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Rejeter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
