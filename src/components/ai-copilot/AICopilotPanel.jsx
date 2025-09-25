import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Send, 
  Rocket, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  GitBranch,
  Code,
  PlayCircle
} from "lucide-react";

export default function AICopilotPanel() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [responsePreview, setResponsePreview] = useState(null);
  const [status, setStatus] = useState(null);
  const [deployStatus, setDeployStatus] = useState(null);

  async function sendPrompt() {
    if (!prompt.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un prompt avant d'envoyer",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setStatus(null);
    setResponsePreview(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-prompt', {
        body: { 
          prompt, 
          target: 'github', 
          autoDeploy: false,
          project: '224solutions'
        }
      });
      
      if (error) {
        throw new Error(error.message || 'Erreur serveur');
      }
      
      setResponsePreview(data.aiPreview || data);
      setStatus({ 
        ok: true, 
        message: `✅ Demande traitée avec succès!\n🔀 Branche: ${data.branchName || 'Non spécifiée'}\n🔗 PR: ${data.prUrl || 'En cours de création'}`,
        branchName: data.branchName,
        prUrl: data.prUrl
      });

      toast({
        title: "Succès",
        description: "L'IA a généré le code et créé une pull request",
      });
      
    } catch (e) {
      console.error('Erreur prompt AI:', e);
      setStatus({ ok: false, message: `❌ ${e.message}` });
      toast({
        title: "Erreur",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  async function triggerDeploy() {
    setLoading(true);
    setDeployStatus(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-deploy', {
        body: { environment: 'production' }
      });
      
      if (error) {
        throw new Error(error.message || 'Erreur de déploiement');
      }
      
      setDeployStatus({ ok: true, message: '🚀 Déploiement déclenché avec succès!' });
      
      toast({
        title: "Déploiement lancé",
        description: "Le pipeline de déploiement a été déclenché",
      });
      
    } catch (e) {
      console.error('Erreur déploiement:', e);
      setDeployStatus({ ok: false, message: `❌ ${e.message}` });
      toast({
        title: "Erreur de déploiement",
        description: e.message,
        variant: "destructive"
      });
    } finally { 
      setLoading(false); 
    }
  }

  async function checkDeployStatus() {
    try {
      const { data, error } = await supabase.functions.invoke('ai-deploy-status');
      
      if (error) {
        console.error('Erreur statut déploiement:', error);
        return;
      }
      
      setDeployStatus({ 
        ok: data.status === 'success', 
        message: `📊 Statut: ${data.status}\n🕒 Dernière mise à jour: ${data.lastUpdate || 'Non disponible'}` 
      });
    } catch (e) {
      console.error('Erreur statut déploiement:', e);
    }
  }

  const examplePrompts = [
    "Ajoute un système de wallet inter-utilisateurs avec frais de 1%",
    "Crée un module de notifications push en temps réel",
    "Implémente un système de géolocalisation avancé pour les livreurs",
    "Ajoute un tableau de bord analytique avec graphiques en temps réel"
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <span>AI Copilote — PDG 224SOLUTIONS</span>
          <Badge variant="secondary">v2.0</Badge>
        </CardTitle>
        <CardDescription>
          Générateur de code intelligent avec déploiement automatique via GitHub Actions
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Zone de prompt principal */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Instructions pour l'IA</label>
          <Textarea
            className="min-h-[120px] resize-none"
            placeholder="Décrivez la fonctionnalité que vous souhaitez ajouter à 224SOLUTIONS..."
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
        </div>

        {/* Exemples de prompts */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Exemples de prompts</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto p-2 text-left whitespace-normal"
                onClick={() => setPrompt(example)}
                disabled={loading}
              >
                <Code className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="text-xs">{example}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={sendPrompt} 
            disabled={loading || !prompt.trim()} 
            className="flex-1 min-w-[200px]"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Générer Code + PR
              </>
            )}
          </Button>
          
          <Button 
            onClick={triggerDeploy} 
            disabled={loading} 
            variant="secondary"
            className="flex-1 min-w-[150px]"
          >
            <Rocket className="h-4 w-4 mr-2" />
            Déployer
          </Button>
          
          <Button 
            onClick={checkDeployStatus} 
            disabled={loading} 
            variant="outline"
            size="sm"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Statut
          </Button>
        </div>

        {/* Statut des opérations */}
        {status && (
          <div className={`p-3 rounded-lg border ${
            status.ok 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start">
              {status.ok ? (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <pre className="whitespace-pre-wrap text-sm">{status.message}</pre>
                {status.prUrl && (
                  <div className="flex items-center space-x-2">
                    <GitBranch className="h-4 w-4" />
                    <a 
                      href={status.prUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Voir la Pull Request →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {deployStatus && (
          <div className={`p-3 rounded-lg border ${
            deployStatus.ok 
              ? 'bg-blue-50 border-blue-200 text-blue-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-start">
              <Rocket className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <pre className="whitespace-pre-wrap text-sm">{deployStatus.message}</pre>
            </div>
          </div>
        )}

        {/* Aperçu de la réponse AI */}
        {responsePreview && (
          <details className="space-y-2">
            <summary className="cursor-pointer text-sm font-medium hover:text-primary">
              📋 Aperçu de la réponse AI (JSON) — Cliquez pour voir
            </summary>
            <div className="p-3 bg-gray-50 rounded-lg border overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(responsePreview, null, 2)}</pre>
            </div>
          </details>
        )}

        {/* Informations de sécurité */}
        <div className="text-xs text-muted-foreground bg-amber-50 p-2 rounded border border-amber-200">
          🔒 <strong>Sécurité:</strong> Toutes les clés API sont stockées côté serveur. 
          Les demandes passent par une validation stricte et créent des PR pour review humaine.
          <br />
          ⚠️ <strong>Note:</strong> Si vous voyez une erreur de quota OpenAI, contactez l'administrateur pour recharger le crédit API.
        </div>
      </CardContent>
    </Card>
  );
}