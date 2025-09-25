import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TestTube, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function AITestPanel() {
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);

  async function runTests() {
    setTesting(true);
    setTestResults(null);
    
    const results = {
      openaiConnection: null,
      edgeFunctionHealth: null,
      deployFunction: null,
      statusFunction: null
    };

    try {
      // Test 1: Test OpenAI connection avec prompt simple
      console.log('🧪 Test 1: Connexion OpenAI...');
      try {
        const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-prompt', {
          body: { 
            prompt: 'test',
            target: 'mock',
            autoDeploy: false,
            project: '224solutions'
          }
        });
        
        if (aiError) {
          results.openaiConnection = { success: false, error: aiError.message };
        } else if (aiData?.success) {
          results.openaiConnection = { success: true, message: 'OpenAI API connectée avec succès' };
        } else {
          results.openaiConnection = { success: false, error: 'Réponse inattendue de l\'API' };
        }
      } catch (e) {
        results.openaiConnection = { success: false, error: e.message };
      }

      // Test 2: Test fonction de déploiement
      console.log('🧪 Test 2: Fonction de déploiement...');
      try {
        const { data: deployData, error: deployError } = await supabase.functions.invoke('ai-deploy', {
          body: { environment: 'production' }
        });
        
        if (deployError) {
          results.deployFunction = { success: false, error: deployError.message };
        } else if (deployData?.success) {
          results.deployFunction = { success: true, message: 'Fonction de déploiement opérationnelle' };
        } else {
          results.deployFunction = { success: false, error: 'Réponse inattendue' };
        }
      } catch (e) {
        results.deployFunction = { success: false, error: e.message };
      }

      // Test 3: Test statut de déploiement
      console.log('🧪 Test 3: Fonction de statut...');
      try {
        const { data: statusData, error: statusError } = await supabase.functions.invoke('ai-deploy-status');
        
        if (statusError) {
          results.statusFunction = { success: false, error: statusError.message };
        } else if (statusData?.status) {
          results.statusFunction = { success: true, message: 'Fonction de statut opérationnelle' };
        } else {
          results.statusFunction = { success: false, error: 'Réponse inattendue' };
        }
      } catch (e) {
        results.statusFunction = { success: false, error: e.message };
      }

      setTestResults(results);
      
      // Vérifier si tous les tests sont réussis
      const allSuccess = Object.values(results).every(result => result?.success);
      
      if (allSuccess) {
        toast({
          title: "✅ Tous les tests réussis !",
          description: "L'AI Copilote est entièrement opérationnel",
        });
      } else {
        toast({
          title: "⚠️ Certains tests ont échoué",
          description: "Vérifiez les détails ci-dessous",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('Erreur lors des tests:', error);
      toast({
        title: "Erreur lors des tests",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  }

  function renderTestResult(testName, result) {
    if (!result) return null;
    
    return (
      <div className={`p-3 rounded-lg border ${
        result.success 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start space-x-2">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {testName}
            </h4>
            <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.success ? result.message : result.error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TestTube className="h-6 w-6 text-blue-600" />
          <span>Test AI Copilote</span>
          <Badge variant="outline">Diagnostic</Badge>
        </CardTitle>
        <CardDescription>
          Vérification complète du fonctionnement de l'AI Copilote
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Tests en cours...
            </>
          ) : (
            <>
              <TestTube className="h-4 w-4 mr-2" />
              Lancer les tests de diagnostic
            </>
          )}
        </Button>

        {testResults && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Résultats des tests :</h3>
            
            {renderTestResult("1. Connexion OpenAI API", testResults.openaiConnection)}
            {renderTestResult("2. Fonction de déploiement", testResults.deployFunction)}
            {renderTestResult("3. Fonction de statut", testResults.statusFunction)}
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Instructions :</strong> Si tous les tests sont au vert, votre AI Copilote est prêt à l'emploi !
                Si certains tests échouent, vérifiez la configuration de vos clés API dans Supabase.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}