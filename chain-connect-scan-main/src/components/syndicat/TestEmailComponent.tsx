import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const TestEmailComponent = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const testEmailSending = async () => {
    if (!email) {
      toast.error("Veuillez entrer un email");
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('Test d\'envoi d\'email vers:', email);
      
      const { data, error } = await supabase.functions.invoke('syndicat-management/test-email', {
        body: { email }
      });

      if (error) {
        console.error('Erreur lors du test:', error);
        setTestResult({
          success: false,
          message: `Erreur: ${error.message}`,
          details: error
        });
        toast.error(`Erreur: ${error.message}`);
      } else {
        console.log('Résultat test email:', data);
        setTestResult({
          success: true,
          message: data.message || 'Email de test envoyé avec succès',
          details: data
        });
        toast.success("Email de test envoyé avec succès !");
      }
    } catch (err: any) {
      console.error('Erreur inattendue:', err);
      setTestResult({
        success: false,
        message: `Erreur inattendue: ${err.message}`,
        details: err
      });
      toast.error(`Erreur inattendue: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testBureauCreation = async () => {
    if (!email) {
      toast.error("Veuillez entrer un email");
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('Test création bureau avec email:', email);
      
      const testData = {
        nom: 'Bureau Test - ' + new Date().toLocaleTimeString(),
        email_president: email,
        ville: 'Conakry Test'
      };

      const { data, error } = await supabase.functions.invoke('syndicat-management/add-bureau', {
        body: testData
      });

      if (error) {
        console.error('Erreur création bureau test:', error);
        setTestResult({
          success: false,
          message: `Erreur création bureau: ${error.message}`,
          details: error
        });
        toast.error(`Erreur: ${error.message}`);
      } else {
        console.log('Bureau test créé:', data);
        setTestResult({
          success: true,
          message: 'Bureau test créé avec succès, vérifiez votre email !',
          details: data
        });
        toast.success("Bureau test créé ! Vérifiez votre email pour le lien d'accès");
      }
    } catch (err: any) {
      console.error('Erreur inattendue bureau:', err);
      setTestResult({
        success: false,
        message: `Erreur inattendue: ${err.message}`,
        details: err
      });
      toast.error(`Erreur inattendue: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Test du Système d'Email Syndicat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email de test</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre-email@example.com"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={testEmailSending}
            disabled={isLoading || !email}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Mail className="w-4 h-4 mr-2" />
            )}
            Test Email Simple
          </Button>

          <Button
            onClick={testBureauCreation}
            disabled={isLoading || !email}
            variant="outline"
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Test Création Bureau
          </Button>
        </div>

        {testResult && (
          <Card className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? "Succès" : "Erreur"}
                </Badge>
              </div>
              <p className="text-sm mb-2">{testResult.message}</p>
              {testResult.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium">Détails techniques</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Instructions :</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Test Email Simple :</strong> Teste uniquement l'envoi d'email</li>
            <li><strong>Test Création Bureau :</strong> Teste la création complète avec envoi d'email</li>
            <li>Vérifiez votre boîte email (et les spams) après le test</li>
            <li>Le lien dans l'email devrait pointer vers l'application actuelle</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestEmailComponent;